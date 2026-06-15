import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import {
  AGE_RANGES,
  DIRECTION_OPTIONS,
  REGIONS,
  RefineResultSchema,
  SATISFACTION_OPTIONS,
  WORK_TYPES,
  YEARS_OPTIONS,
  type RefineResult,
} from "@/lib/v3/types";
import { hasPressureLanguage, stripPressureSentences } from "@/lib/v3/p17";
import { trackAgentCall } from "@/lib/cost-tracker";

export const maxDuration = 120;

const RefineRequestSchema = z.object({
  job: z.string().min(1).max(50),
  baseRate: z.number().min(0).max(100),
  summary: z.string().max(2000),
  ageRange: z.enum(AGE_RANGES),
  region: z.enum(REGIONS),
  step2: z.object({
    workType: z.enum(WORK_TYPES).nullable(),
    years: z.enum(YEARS_OPTIONS).nullable(),
    satisfaction: z.enum(SATISFACTION_OPTIONS).nullable(),
    direction: z.enum(DIRECTION_OPTIONS).nullable(),
    concern: z.string().max(1000),
  }),
  lang: z.enum(["ko", "en"]).optional().default("ko"),
});

type RefineRequestBody = z.infer<typeof RefineRequestSchema>;
type RLang = "ko" | "en";

// 만족도 분기 — 톤은 모델이 아니라 서버가 결정한다 (명세서 §2-3).
function decideTone(body: RefineRequestBody): RefineResult["tone"] {
  const sat = body.step2.satisfaction;
  const satisfied =
    sat === "매우 만족하며 일하고 있다" || sat === "대체로 만족한다";
  if (!satisfied) return "neutral";
  return body.baseRate < 50 ? "staying" : "gentle";
}

const TONE_INSTRUCTIONS: Record<RLang, Record<RefineResult["tone"], string>> = {
  ko: {
    staying: `이 사용자는 지금 일에 만족하고 있고 위험도도 낮습니다.
- 이 보고서는 "떠날 이유를 찾는 보고서"가 아니라 "머무름을 더 단단하게 만드는 보고서"입니다.
- 전환·이직을 암시하지 마세요. 같은 자리에서 더 깊어지는 방향만 제안하세요.
- 만족하며 일하는 사람을 흔들지 마세요. 위험이 낮으면 낮다고 말하고 안심시켜 돌려보내세요.`,
    gentle: `이 사용자는 지금 일에 만족하고 있지만 구조적 변화 압력은 높은 편입니다.
- "지금이 좋다는 것과 5년 뒤도 좋다는 것은 다른 이야기"라는 결을 부드럽게 전하세요.
- 절대 금지: "지금 행동하지 않으면", "늦기 전에", "골든타임" 등 시간 압박 표현 전부.
- 지금의 만족을 먼저 존중하고, 준비는 만족을 지키는 방법으로 서술하세요.`,
    neutral: `위협과 기회를 균형 있게 서술하세요. 공포를 조장하지 말고, 준비 중심으로 마무리하세요.
- 금지: "지금 행동하지 않으면", "늦기 전에" 등 시간 압박 표현.`,
  },
  en: {
    staying: `This person is satisfied with their work and their risk is low.
- This report is NOT one that looks for reasons to leave — it makes staying sturdier.
- Do not hint at switching jobs or careers. Only suggest growing deeper where they are.
- Do not unsettle someone who works with contentment. If the risk is low, say so and send them off reassured.`,
    gentle: `This person is satisfied with their work, but the structural change pressure is on the higher side.
- Gently convey that "being good now and being good in five years are different stories."
- Strictly forbidden: any time-pressure phrasing such as "act now," "before it's too late," "golden window."
- Honor their present contentment first; frame preparation as a way to protect what they value.`,
    neutral: `Describe threats and opportunities in balance. Do not stoke fear; close on preparation.
- Forbidden: time-pressure phrasing such as "act now," "before it's too late."`,
  },
};

function buildPrompt(body: RefineRequestBody, tone: RefineResult["tone"], lang: RLang): string {
  const s = body.step2;
  const lo = Math.max(0, body.baseRate - 18);
  const hi = Math.min(100, body.baseRate + 18);

  if (lang === "en") {
    const answered: string[] = [];
    if (s.workType) answered.push(`Work type: ${s.workType}`);
    if (s.years) answered.push(`Years of experience: ${s.years}`);
    if (s.satisfaction) answered.push(`Job satisfaction: ${s.satisfaction}`);
    if (s.direction) answered.push(`Direction they lean: ${s.direction}`);
    if (s.concern.trim()) answered.push(`Biggest concern (their own words): ${s.concern.trim()}`);

    return `You are a job-structure analyst. A general analysis of the job "${body.job}" is already complete, and now one person's personal details have been added. Refine the general picture to fit this person's grain. Write all output in natural English.

[General analysis]
- Overall risk (AI exposure index): ${body.baseRate}/100
- Summary: ${body.summary}

[This person]
- Age range: ${body.ageRange} / Region: ${body.region}
${answered.map((a) => `- ${a}`).join("\n")}
(Note: age range and region values may be given in Korean; interpret them faithfully.)

[Tasks]
1. adjustedRate: an adjusted risk reflecting the personal details. MUST be within ${lo}–${hi}. Move it only when an input gives a real structural reason to raise or lower risk. Do not move it without grounds.
2. rateReasons: 1–4 reasons the number moved (or didn't), one per relevant input. Each under ~90 characters. e.g. "Freelance work has no organizational buffer, +4".
3. singleSentence: a single sentence to this person (under ~120 characters). No mention of the score — a sentence that recognizes their situation.
4. personalNotes: 2–4 statements about "this person," not about the job "${body.job}." Each under ~160 characters. Quote their inputs directly.

[Tone — must follow]
${TONE_INSTRUCTIONS.en[tone]}

[Language standard]
- Use trend language ("reshaping pressure," "change pressure") rather than "replaced."
- Express uncertainty ("is likely to," "may") rather than flat certainty.

Respond with JSON only. Format:
{"adjustedRate": number, "singleSentence": "...", "rateReasons": ["..."], "personalNotes": ["..."], "tone": "${tone}"}`;
  }

  const answered: string[] = [];
  if (s.workType) answered.push(`근무 형태: ${s.workType}`);
  if (s.years) answered.push(`연차: ${s.years}`);
  if (s.satisfaction) answered.push(`일 만족도: ${s.satisfaction}`);
  if (s.direction) answered.push(`바라보는 방향: ${s.direction}`);
  if (s.concern.trim()) answered.push(`가장 큰 고민 (본인의 말): ${s.concern.trim()}`);

  return `당신은 직업 구조 분석 전문가입니다. "${body.job}" 직업의 일반 분석이 이미 완료되었고, 이제 한 사람의 개인 정보가 추가되었습니다. 일반론을 이 사람의 결에 맞게 정밀화하세요.

[일반 분석 결과]
- 종합 위험도(AI 노출 지수): ${body.baseRate}/100
- 요약: ${body.summary}

[이 사람]
- 연령대: ${body.ageRange} / 지역: ${body.region}
${answered.map((a) => `- ${a}`).join("\n")}

[과업]
1. adjustedRate: 개인 정보를 반영한 조정 위험도. 반드시 ${lo}~${hi} 범위. 입력값이 실제로 위험을 낮추거나 높이는 구조적 근거가 있을 때만 움직이세요. 근거 없이 움직이지 마세요.
2. rateReasons: 숫자가 움직인(또는 움직이지 않은) 이유를 입력값별로 1~4개. 각 50자 이내. 예: "프리랜서 형태는 조직의 완충이 없어 +4".
3. singleSentence: 이 사람에게 건네는 단 한 문장 (60자 이내). 점수 언급 없이, 이 사람의 상황을 알아봐주는 문장.
4. personalNotes: "${body.job}"이라는 직업이 아니라 "이 사람"에 대한 서술 2~4개. 각 90자 이내. 입력값을 직접 인용하며 쓰세요.

[톤 지침 — 반드시 준수]
${TONE_INSTRUCTIONS.ko[tone]}

[언어 기준]
- "대체된다" 대신 "재편 압력", "변화 압력" 등 경향 언어 사용.
- 단정 대신 "~가능성이 있습니다" 등 불확실성 명시.

JSON만 응답하세요. 형식:
{"adjustedRate": 숫자, "singleSentence": "...", "rateReasons": ["..."], "personalNotes": ["..."], "tone": "${tone}"}`;
}

function jsonError(msg: string, status: number): Response {
  return new Response(JSON.stringify({ success: false, error: msg }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return jsonError("요청 형식이 올바르지 않습니다.", 400);
  }

  const parsed = RefineRequestSchema.safeParse(raw);
  if (!parsed.success) return jsonError("입력값이 올바르지 않습니다.", 400);
  const body = parsed.data;

  const en = body.lang === "en";

  // 아무것도 채우지 않고 호출하면 정밀화할 근거가 없다.
  const s = body.step2;
  if (!s.workType && !s.years && !s.satisfaction && !s.direction && !s.concern.trim()) {
    return jsonError(en
      ? "No additional input. Tell us even one thing and the analysis goes deeper."
      : "추가 입력이 없습니다. 한 가지라도 알려주시면 분석이 깊어집니다.", 400);
  }

  const ip = getClientIp(request);
  const rate = await checkRateLimit(ip);
  if (!rate.allowed) {
    return jsonError(en
      ? "You've reached today's analysis limit. It resets at midnight."
      : `오늘의 분석 한도를 초과했습니다. ${rate.resetAt}에 초기화됩니다.`, 429);
  }

  const apiKey = process.env.JOB_ANALYZER_API_KEY;
  if (!apiKey) return jsonError(en ? "Server configuration error." : "서버 설정 오류입니다.", 500);

  const tone = decideTone(body);

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      temperature: 0.4,
      messages: [{ role: "user", content: buildPrompt(body, tone, body.lang) }],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("no text response");

    let cleaned = content.text.trim();
    const codeBlock = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) cleaned = codeBlock[1].trim();

    const validated = RefineResultSchema.safeParse(JSON.parse(cleaned));
    if (!validated.success) throw new Error("schema mismatch");

    const min = Math.max(0, body.baseRate - 18);
    const max = Math.min(100, body.baseRate + 18);
    const result: RefineResult = {
      ...validated.data,
      adjustedRate: Math.round(Math.max(min, Math.min(max, validated.data.adjustedRate))),
      tone, // 톤은 서버 결정값을 신뢰한다
      rateReasons: stripPressureSentences(validated.data.rateReasons),
      personalNotes: stripPressureSentences(validated.data.personalNotes),
    };

    // 한 문장에 압박 표현이 섞여 들어오면 중립 문장으로 대체
    if (hasPressureLanguage(result.singleSentence)) {
      result.singleSentence = body.lang === "en"
        ? "So far this is the story of structure. The next step you can set at your own pace."
        : "여기까지는 구조의 이야기입니다. 다음 걸음은 당신의 속도로 정하시면 됩니다.";
    }
    if (result.personalNotes.length < 2) {
      result.personalNotes.push(body.lang === "en"
        ? "What you shared widened the report's view. Tell us more and it goes deeper."
        : "입력해주신 내용이 보고서의 시야를 넓혔습니다. 더 알려주시면 더 깊어집니다.");
    }

    trackAgentCall("v3_refine").catch(() => {});

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("v3 refine 실패:", e);
    return jsonError(body.lang === "en"
      ? "Something went wrong during refinement. Please try again shortly."
      : "정밀화 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", 500);
  }
}
