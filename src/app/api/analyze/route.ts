import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// Vercel Pro 함수 실행 시간 제한 300초 (Pro 플랜 최대값)
export const maxDuration = 300;
import { analyzeJob } from "@/lib/claude";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { AnalyzeRequest, AnalyzeResponse, AnalysisResult } from "@/types/analysis";

const JOB_PATTERN = /^[\uAC00-\uD7A3a-zA-Z0-9\s\-\/\(\)·]+$/;
const MAX_JOB_LENGTH = 50;
const CACHE_TTL = 60 * 60 * 24 * 30; // 30일

// 1회 분석 예상 비용 (USD) — 입력 3200토큰 × $3/M + 출력 4000토큰 × $15/M
const COST_PER_CLAUDE_CALL = 0.069;

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function getCacheKey(job: string, mode: string): string {
  const month = new Date().toISOString().slice(0, 7);
  const normalized = job.trim().toLowerCase().replace(/\s+/g, " ");
  return `job_result:${month}:${mode}:${normalized}`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function trackStats(type: "request" | "cache_hit" | "claude_call", job: string) {
  const d = today();
  const month = d.slice(0, 7);
  try {
    await Promise.all([
      // 전체 누적 카운터 (TTL 없음 — 영구 보관)
      redis.incr("stats:total"),
      // 일별
      redis.incr(`stats:req:${d}`),
      redis.expire(`stats:req:${d}`, 60 * 60 * 24 * 35),
      type === "cache_hit"
        ? redis.incr(`stats:hit:${d}`).then(() => redis.expire(`stats:hit:${d}`, 60 * 60 * 24 * 35))
        : Promise.resolve(),
      type === "claude_call"
        ? redis.incr(`stats:claude:${d}`).then(() => redis.expire(`stats:claude:${d}`, 60 * 60 * 24 * 35))
        : Promise.resolve(),
      // 월별 누적
      redis.incr(`stats:req:${month}`),
      type === "claude_call"
        ? redis.incr(`stats:claude:${month}`)
        : Promise.resolve(),
      // 인기 직업 순위
      redis.zincrby(`stats:jobs:${month}`, 1, job.trim().toLowerCase()),
    ]);
  } catch (e) {
    console.warn("통계 기록 실패 (무시):", e);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    let body: AnalyzeRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
    }

    const { job, mode } = body;

    if (!job || typeof job !== "string") {
      return NextResponse.json({ success: false, error: "직업명을 입력해주세요." }, { status: 400 });
    }

    const trimmed = job.trim();

    if (trimmed.length === 0)
      return NextResponse.json({ success: false, error: "직업명을 입력해주세요." }, { status: 400 });

    if (trimmed.length > MAX_JOB_LENGTH)
      return NextResponse.json({ success: false, error: `직업명은 ${MAX_JOB_LENGTH}자 이하로 입력해주세요.` }, { status: 400 });

    if (!JOB_PATTERN.test(trimmed))
      return NextResponse.json({ success: false, error: "직업명에 허용되지 않는 문자가 포함되어 있습니다." }, { status: 400 });

    if (!mode || !["adult", "youth"].includes(mode))
      return NextResponse.json({ success: false, error: "모드 값이 올바르지 않습니다." }, { status: 400 });

    // 1. 캐시 확인 — rate limit 차감 없이 즉시 반환
    const cacheKey = getCacheKey(trimmed, mode);
    try {
      const cached = await redis.get<AnalysisResult>(cacheKey);
      if (cached) {
        await trackStats("cache_hit", trimmed);
        return NextResponse.json(
          { success: true, data: cached, remaining: 10, fromCache: true },
          { headers: { "X-Cache": "HIT" } }
        );
      }
    } catch (e) {
      console.warn("캐시 조회 실패 (무시):", e);
    }

    // 2. Rate Limit 체크 (캐시 미스 시에만)
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(ip);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: `오늘의 분석 한도(10회)를 초과했습니다. ${rateLimit.resetAt}에 초기화됩니다.` },
        { status: 429, headers: { "X-RateLimit-Remaining": "0", "Retry-After": "86400" } }
      );
    }

    // 3. Claude 분석 (1회 재시도 포함)
    let result: AnalysisResult;
    try {
      result = await analyzeJob(trimmed, mode);
    } catch (firstError) {
      console.warn("첫 번째 Claude 호출 실패, 재시도 중:", firstError);
      try {
        result = await analyzeJob(trimmed, mode);
      } catch (secondError) {
        console.error("두 번째 Claude 호출도 실패:", secondError);
        return NextResponse.json(
          { success: false, error: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
          { status: 500 }
        );
      }
    }

    // 4. 결과 캐시 저장 + 통계 기록
    await Promise.all([
      redis.set(cacheKey, JSON.stringify(result), { ex: CACHE_TTL }).catch(() => {}),
      trackStats("claude_call", trimmed),
    ]);

    return NextResponse.json(
      { success: true, data: result, remaining: rateLimit.remaining, fromCache: false },
      { headers: { "X-Cache": "MISS", "X-RateLimit-Remaining": String(rateLimit.remaining) } }
    );
  } catch (error) {
    console.error("예상치 못한 오류:", error);
    return NextResponse.json({ success: false, error: "서버 오류가 발생했습니다. 다시 시도해주세요." }, { status: 500 });
  }
}

export { COST_PER_CLAUDE_CALL };
