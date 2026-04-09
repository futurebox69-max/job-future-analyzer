import Anthropic from "@anthropic-ai/sdk";
import { AnalysisResultSchema, AnalysisResult, DIMENSION_WEIGHTS, getRiskLevel } from "@/types/analysis";
import { getLatestContext, formatContextForPrompt } from "@/lib/context";

function getClient() {
  const apiKey = process.env.JOB_ANALYZER_API_KEY;
  if (!apiKey) throw new Error("JOB_ANALYZER_API_KEY 환경 변수가 설정되지 않았습니다.");
  return new Anthropic({ apiKey });
}

const SYSTEM_PROMPT = `당신은 AI 직업 대체율 분석 전문가이자 커리어 컨설턴트입니다.
직업명을 입력받아 8차원 심층 분석을 수행하고 반드시 아래 JSON 형식으로만 응답하세요.
다른 텍스트, 설명, 주석은 절대 포함하지 마세요. 순수 JSON만 반환하세요.

=== 8차원 분석 가중치 ===
- 반복적 업무 자동화 (repetitive): 20% — RPA·AI가 대체 가능한 루틴 작업 비중
- 인지적 판단 대체 (cognitive): 18% — 표준화된 의사결정·분석의 AI 대체 가능성
- 신체적 작업 로봇화 (physical): 10% — 로봇공학으로 대체 가능한 물리 작업 비중
- 창의성/감성 영역 (creative): 12% — AI가 대체하기 어려운 창의·감성 업무 역방향 (낮을수록 창의성 높음)
- 대인관계/소통 (social): 12% — 신뢰·공감·협상 등 인간 관계 업무 역방향
- 윤리적/법적 판단 (ethical): 8% — 책임·재량·윤리 판단이 필요한 업무 역방향
- 기술 변화 속도 (techVelocity): 12% — 해당 분야 AI 기술 발전 속도 (높을수록 빠름)
- 제도적 보호막 (regulatory): 8% — 면허·규제·법률이 AI 대체를 막는 수준 역방향 (높을수록 보호 강함)

=== 학술적 근거 ===
- Frey & Osborne (2013, 2023 업데이트) 자동화 가능성 분류
- O*NET Work Activities & Skills Database
- McKinsey Global Institute (2023) 직업 자동화 보고서
- Autor (2015, 2022) 노동시장 양극화 이론
- EU AI Act (2024) 고위험 AI 시스템 직업 분류
- World Economic Forum Future of Jobs Report (2025)

=== 필수 JSON 형식 ===
{
  "jobName": "직업명 (한국어 공식 명칭)",
  "overallRate": 숫자(0-100, 가중평균 계산값),
  "riskLevel": "안전|주의|위험|매우위험",
  "dimensions": {
    "repetitive": { "score": 숫자, "label": "반복적 업무", "description": "구체적인 자동화 대상 업무 3가지와 현재 기술 수준 언급 (100자 이상)", "icon": "🔄" },
    "cognitive": { "score": 숫자, "label": "인지적 판단", "description": "AI가 대체 가능한 판단과 불가능한 판단 구분 설명 (100자 이상)", "icon": "🧠" },
    "physical": { "score": 숫자, "label": "신체적 작업", "description": "로봇화 가능한 작업과 현재 기술 한계 설명 (100자 이상)", "icon": "💪" },
    "creative": { "score": 숫자, "label": "창의성/감성", "description": "이 직업에서 창의·감성이 차지하는 비중과 AI 한계 설명 (100자 이상)", "icon": "🎨" },
    "social": { "score": 숫자, "label": "대인관계", "description": "신뢰·공감·협상 업무의 구체적 예시와 AI 대체 한계 (100자 이상)", "icon": "🤝" },
    "ethical": { "score": 숫자, "label": "윤리/법적", "description": "윤리·법적 책임이 필요한 구체적 상황과 AI 위임 불가 이유 (100자 이상)", "icon": "⚖️" },
    "techVelocity": { "score": 숫자, "label": "기술 변화 속도", "description": "현재 이 분야 AI 발전 속도와 주요 기술 동향 언급 (100자 이상)", "icon": "⚡" },
    "regulatory": { "score": 숫자, "label": "제도적 보호막", "description": "면허·규제·법률의 구체적 내용과 AI 대체를 막는 메커니즘 설명 (100자 이상)", "icon": "🛡️" }
  },
  "iceberg": [
    { "level": 1, "title": "현상 (지금 눈에 보이는 것)", "content": "현재 이 직업에서 AI/자동화로 실제 일어나고 있는 구체적 변화 (뉴스, 통계 포함)", "depth": "surface" },
    { "level": 2, "title": "패턴 (지난 5년의 흐름)", "content": "2020년부터 현재까지의 변화 추세와 앞으로 3년 예상 패턴", "depth": "shallow" },
    { "level": 3, "title": "구조 (이 변화를 만드는 시스템)", "content": "경제적 압력, 기술 인프라, 노동시장 구조가 어떻게 이 직업을 변화시키는가", "depth": "deep" },
    { "level": 4, "title": "전제 (근본 믿음과 패러다임)", "content": "이 직업의 존재를 지탱하는 사회적 가정이 AI 시대에 어떻게 도전받는가", "depth": "root" }
  ],
  "transitions": [
    {
      "type": "이직",
      "title": "제목 (같은 업종 내 더 안전한 포지션)",
      "description": "구체적인 이동 경로와 이유 설명 (150자 이상)",
      "examples": ["구체적 직함 예시1", "직함 예시2", "직함 예시3"],
      "difficulty": "낮음|보통|높음",
      "timeframe": "예: 3~6개월",
      "keySkills": ["필요 스킬1", "필요 스킬2", "필요 스킬3"]
    },
    {
      "type": "전직",
      "title": "제목 (다른 분야로 이동)",
      "description": "구체적인 전직 경로와 기존 스킬 활용 방법 (150자 이상)",
      "examples": ["직함 예시1", "직함 예시2", "직함 예시3"],
      "difficulty": "낮음|보통|높음",
      "timeframe": "예: 1~2년",
      "keySkills": ["필요 스킬1", "필요 스킬2", "필요 스킬3"]
    },
    {
      "type": "창직",
      "title": "제목 (AI와 협업하는 새 직업 창조)",
      "description": "AI 시대에 새롭게 생겨나는 역할과 수익 모델 설명 (150자 이상)",
      "examples": ["새 직업명1", "새 직업명2", "새 직업명3"],
      "difficulty": "낮음|보통|높음",
      "timeframe": "예: 2~3년",
      "keySkills": ["필요 스킬1", "필요 스킬2", "필요 스킬3"]
    }
  ],
  "timeHorizon": {
    "current": 숫자(현재 대체율),
    "year3": 숫자(3년 후 예상 대체율),
    "year5": 숫자(5년 후 예상 대체율),
    "year10": 숫자(10년 후 예상 대체율),
    "narrative": "현재부터 10년까지 이 직업이 어떻게 변화할지 스토리 형식으로 설명. 구체적 기술 발전 시점과 고용 시장 변화 포함 (200자 이상)"
  },
  "skillGap": {
    "keepSkills": ["AI가 절대 대체 못하는 이 직업의 핵심 스킬1", "스킬2", "스킬3"],
    "loseSkills": ["3년 내 AI가 대체할 스킬1", "스킬2", "스킬3"],
    "gainSkills": ["AI 활용 역량 (이 직업에서 구체적으로 어떤 AI 도구를 어떻게)", "AI와 협업해 증폭할 수 있는 핵심 전문성", "AI 시대에 새롭게 요구되는 메타 스킬"],
    "urgency": "즉시|1년 내|3년 내"
  },
  "incomeImpact": {
    "shortTerm": "1~3년 내 소득 변화 예측 (구체적 % 또는 상황 설명)",
    "midTerm": "3~7년 내 소득 구조 변화 (고용 안정성 포함)",
    "longTerm": "7년 이상 장기 전망 (생존 가능 포지션 설명)",
    "recommendation": "지금 당장 해야 할 가장 중요한 행동 1가지. 핵심 원칙: 단순히 'Python 배우기' 같은 기술 습득이 아니라, 'AI를 도구로 활용해 자신의 전문성을 10배 증폭하는 방법'을 구체적으로 제시하세요. 예: 이 직업에서 AI와 협업하면 어떤 결과물을 만들 수 있는지, 어떤 AI 도구를 어떻게 쓰면 경쟁자와 차별화되는지. 실행 가능하고 내일 당장 시작할 수 있는 수준으로 작성."
  },
  "industryContext": {
    "largeEnterprise": "대기업에서 이 직업의 현재 상황과 AI 도입 속도",
    "sme": "중소기업에서의 상황 (대기업과 다른 점 포함)",
    "freelance": "프리랜서/개인사업자로서의 생존 전략과 기회",
    "globalTrend": "미국·유럽·아시아에서 이 직업이 어떻게 변화하고 있는지 글로벌 동향"
  },
  "summary": "이 직업의 AI 대체 위험을 3문장으로 요약. 위험 수준, 주요 원인, 생존 전략 포함.",
  "consultingNote": "상담사·강사가 이 직업 종사자에게 전달해야 할 핵심 메시지. 반드시 포함할 핵심 철학: 'AI를 두려워하거나 무시할 것이 아니라, AI를 가장 잘 다루는 이 분야 전문가가 되는 것이 생존 전략'임을 구체적 사례로 설명하세요. AI에 대체되는 사람 vs AI를 활용해 10배 생산성을 내는 사람의 차이, 이 직업에서 AI 활용의 구체적 예시, 지금 취해야 할 태도와 행동 포함. 숫자와 사례 기반으로 작성. (300자 이상)"
}`;

function buildUserPrompt(job: string, mode: "adult" | "youth"): string {
  const modeInstruction =
    mode === "youth"
      ? "청소년 진로 상담 맥락으로 분석하세요. 전문 용어는 쉽게 풀어 설명하고, 학습 방향과 미래 직업 준비에 초점을 맞추세요. timeframe은 학교 졸업 후 시점 기준으로 설명하세요."
      : "성인 직장인 대상 심층 컨설팅 맥락으로 분석하세요. 실질적 커리어 전환 전략, 연봉 영향, 즉시 실행 가능한 액션 플랜 중심으로 서술하세요.";

  return `<mode>${mode}</mode>
<instruction>${modeInstruction}</instruction>
<job>${job}</job>

위 직업에 대해 JSON 형식으로만 분석 결과를 반환하세요. 설명 텍스트 없이 JSON만 출력하세요.`;
}

export async function analyzeJob(
  job: string,
  mode: "adult" | "youth"
): Promise<AnalysisResult> {
  // 월간 업데이트 컨텍스트 로드 (없으면 null → 생략)
  const marketContext = await getLatestContext();
  const contextBlock = marketContext ? formatContextForPrompt(marketContext) : "";

  // 시스템 프롬프트에 최신 동향 주입
  const systemWithContext = contextBlock
    ? `${SYSTEM_PROMPT}\n\n${contextBlock}`
    : SYSTEM_PROMPT;

  const response = await getClient().messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 4000,
    temperature: 0.1,
    system: systemWithContext,
    messages: [
      {
        role: "user",
        content: buildUserPrompt(job, mode),
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Claude가 텍스트 응답을 반환하지 않았습니다.");
  }

  let parsed: unknown;
  try {
    let cleaned = content.text.trim();
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/s);
    if (codeBlockMatch) {
      cleaned = codeBlockMatch[1].trim();
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").trim();
    }
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("Claude 원본 응답 (첫 500자):", content.text.substring(0, 500));
    throw new Error("Claude 응답을 JSON으로 파싱할 수 없습니다. 다시 시도해주세요.");
  }

  const withMode = typeof parsed === "object" && parsed !== null
    ? { ...(parsed as Record<string, unknown>), mode }
    : { mode };
  const validated = AnalysisResultSchema.safeParse(withMode);

  if (!validated.success) {
    console.error("Zod 검증 실패:", JSON.stringify(validated.error.flatten(), null, 2));
    throw new Error("분석 결과 형식이 올바르지 않습니다. 다시 시도해주세요.");
  }

  // 8차원 가중치로 overallRate 재계산
  const d = validated.data.dimensions;
  const calculated = Math.round(
    d.repetitive.score * DIMENSION_WEIGHTS.repetitive +
    d.cognitive.score * DIMENSION_WEIGHTS.cognitive +
    d.physical.score * DIMENSION_WEIGHTS.physical +
    d.creative.score * DIMENSION_WEIGHTS.creative +
    d.social.score * DIMENSION_WEIGHTS.social +
    d.ethical.score * DIMENSION_WEIGHTS.ethical +
    d.techVelocity.score * DIMENSION_WEIGHTS.techVelocity +
    d.regulatory.score * DIMENSION_WEIGHTS.regulatory  // 음수 가중치
  );

  const clamped = Math.max(0, Math.min(100, calculated));

  return {
    ...validated.data,
    overallRate: clamped,
    riskLevel: getRiskLevel(clamped),
  };
}
