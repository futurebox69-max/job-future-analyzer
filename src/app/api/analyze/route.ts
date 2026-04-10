import { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";

// Vercel Pro 함수 실행 시간 제한 300초 (Pro 플랜 최대값)
export const maxDuration = 300;
import { analyzeJob, validateJobName } from "@/lib/claude";
import { LangCode } from "@/lib/i18n";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { AnalyzeRequest, AnalysisResult } from "@/types/analysis";

const JOB_PATTERN = /^[\uAC00-\uD7A3a-zA-Z0-9\s\-\/\(\)·]+$/;
const MAX_JOB_LENGTH = 50;
const CACHE_TTL = 60 * 60 * 24 * 30; // 30일

// 1회 분석 예상 비용 (USD) — 입력 3200토큰 × $3/M + 출력 4000토큰 × $15/M
const COST_PER_CLAUDE_CALL = 0.069;

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function getCacheKey(job: string, mode: string, lang = "ko"): string {
  const month = new Date().toISOString().slice(0, 7);
  const normalized = job.trim().toLowerCase().replace(/\s+/g, " ");
  return `job_result:${month}:${mode}:${lang}:${normalized}`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function trackStats(type: "request" | "cache_hit" | "claude_call", job: string) {
  const d = today();
  const month = d.slice(0, 7);
  try {
    await Promise.all([
      redis.incr("stats:total"),
      redis.incr(`stats:req:${d}`),
      redis.expire(`stats:req:${d}`, 60 * 60 * 24 * 35),
      type === "cache_hit"
        ? redis.incr(`stats:hit:${d}`).then(() => redis.expire(`stats:hit:${d}`, 60 * 60 * 24 * 35))
        : Promise.resolve(),
      type === "claude_call"
        ? redis.incr(`stats:claude:${d}`).then(() => redis.expire(`stats:claude:${d}`, 60 * 60 * 24 * 35))
        : Promise.resolve(),
      redis.incr(`stats:req:${month}`),
      type === "claude_call"
        ? redis.incr(`stats:claude:${month}`)
        : Promise.resolve(),
      redis.zincrby(`stats:jobs:${month}`, 1, job.trim().toLowerCase()),
    ]);
  } catch (e) {
    console.warn("통계 기록 실패 (무시):", e);
  }
}

// SSE 이벤트 포맷
function sseEvent(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function POST(request: NextRequest): Promise<Response> {
  // 1. 요청 파싱
  let body: AnalyzeRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false, error: "요청 형식이 올바르지 않습니다." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { job, mode, lang } = body;
  const validLangs: LangCode[] = ["ko", "en", "zh", "ja", "es"];
  const safeLang: LangCode = lang && validLangs.includes(lang as LangCode) ? (lang as LangCode) : "ko";

  if (!job || typeof job !== "string")
    return new Response(JSON.stringify({ success: false, error: "직업명을 입력해주세요." }), { status: 400, headers: { "Content-Type": "application/json" } });

  const trimmed = job.trim();

  if (trimmed.length === 0)
    return new Response(JSON.stringify({ success: false, error: "직업명을 입력해주세요." }), { status: 400, headers: { "Content-Type": "application/json" } });

  if (trimmed.length > MAX_JOB_LENGTH)
    return new Response(JSON.stringify({ success: false, error: `직업명은 ${MAX_JOB_LENGTH}자 이하로 입력해주세요.` }), { status: 400, headers: { "Content-Type": "application/json" } });

  if (!JOB_PATTERN.test(trimmed))
    return new Response(JSON.stringify({ success: false, error: "직업명에 허용되지 않는 문자가 포함되어 있습니다." }), { status: 400, headers: { "Content-Type": "application/json" } });

  if (!mode || !["adult", "youth"].includes(mode))
    return new Response(JSON.stringify({ success: false, error: "모드 값이 올바르지 않습니다." }), { status: 400, headers: { "Content-Type": "application/json" } });

  // 2. 직업명 유효성 검증 (프롬프트 인젝션 방어)
  const isValidJob = await validateJobName(trimmed);
  if (!isValidJob) {
    return new Response(
      JSON.stringify({ success: false, error: "입력된 텍스트는 유효한 직업명이 아닙니다. '간호사', '변호사', '회계사' 등 실제 직업명을 입력해주세요." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 3. 캐시 확인 — 캐시 히트면 즉시 JSON 반환 (스트리밍 불필요)
  const cacheKey = getCacheKey(trimmed, mode, safeLang);
  try {
    const cached = await redis.get<AnalysisResult>(cacheKey);
    if (cached) {
      await trackStats("cache_hit", trimmed);
      return new Response(
        JSON.stringify({ success: true, data: cached, remaining: 20, fromCache: true }),
        { headers: { "Content-Type": "application/json", "X-Cache": "HIT" } }
      );
    }
  } catch (e) {
    console.warn("캐시 조회 실패 (무시):", e);
  }

  // 4. Rate Limit 체크
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        error: `오늘의 분석 한도(20회)를 초과했습니다. ${rateLimit.resetAt}에 초기화됩니다.`,
      }),
      { status: 429, headers: { "Content-Type": "application/json", "X-RateLimit-Remaining": "0", "Retry-After": "86400" } }
    );
  }

  // 5. SSE 스트리밍으로 Claude 분석 — 브라우저 타임아웃 방지
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(sseEvent(data));
        } catch {
          // 연결이 끊긴 경우 무시
        }
      };

      // 초기 진행 상태 전송
      send({ type: "progress", stage: "start", message: "Claude AI 분석 시작..." });

      // 5초마다 keepalive 신호 (브라우저/모바일 타임아웃 방지)
      const keepAlive = setInterval(() => {
        send({ type: "progress", stage: "processing", message: "8차원 분석 진행 중..." });
      }, 5000);

      try {
        let result: AnalysisResult;

        try {
          result = await analyzeJob(trimmed, mode, safeLang);
        } catch (firstError) {
          console.warn("첫 번째 Claude 호출 실패, 재시도 중:", firstError);
          send({ type: "progress", stage: "retrying", message: "재시도 중..." });
          result = await analyzeJob(trimmed, mode, safeLang);
        }

        clearInterval(keepAlive);

        // 캐시 저장 + 통계
        await Promise.all([
          redis.set(cacheKey, JSON.stringify(result), { ex: CACHE_TTL }).catch(() => {}),
          trackStats("claude_call", trimmed),
        ]);

        send({
          type: "result",
          success: true,
          data: result,
          remaining: rateLimit.remaining,
          fromCache: false,
        });
      } catch (error) {
        clearInterval(keepAlive);
        console.error("Claude 분석 실패:", error);
        send({
          type: "error",
          success: false,
          error: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // nginx 버퍼링 비활성화
    },
  });
}

export { COST_PER_CLAUDE_CALL };
