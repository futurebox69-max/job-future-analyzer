import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { analyzeJob } from "@/lib/claude";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { AnalyzeRequest, AnalyzeResponse, AnalysisResult } from "@/types/analysis";

// 허용되는 문자: 한글, 영문, 숫자, 공백, 일부 특수문자
const JOB_PATTERN = /^[\uAC00-\uD7A3a-zA-Z0-9\s\-\/\(\)·]+$/;
const MAX_JOB_LENGTH = 50;
const CACHE_TTL = 60 * 60 * 24 * 30; // 30일

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 월별 캐시 키 — 매월 1일 컨텍스트 업데이트 시 자동으로 새 키 사용
function getCacheKey(job: string, mode: string): string {
  const month = new Date().toISOString().slice(0, 7); // "2026-04"
  const normalized = job.trim().toLowerCase().replace(/\s+/g, " ");
  return `job_result:${month}:${mode}:${normalized}`;
}

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    // 1. 요청 파싱
    let body: AnalyzeRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "요청 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const { job, mode } = body;

    // 2. 입력 검증
    if (!job || typeof job !== "string") {
      return NextResponse.json(
        { success: false, error: "직업명을 입력해주세요." },
        { status: 400 }
      );
    }

    const trimmed = job.trim();

    if (trimmed.length === 0) {
      return NextResponse.json(
        { success: false, error: "직업명을 입력해주세요." },
        { status: 400 }
      );
    }

    if (trimmed.length > MAX_JOB_LENGTH) {
      return NextResponse.json(
        { success: false, error: `직업명은 ${MAX_JOB_LENGTH}자 이하로 입력해주세요.` },
        { status: 400 }
      );
    }

    if (!JOB_PATTERN.test(trimmed)) {
      return NextResponse.json(
        { success: false, error: "직업명에 허용되지 않는 문자가 포함되어 있습니다." },
        { status: 400 }
      );
    }

    if (!mode || !["adult", "youth"].includes(mode)) {
      return NextResponse.json(
        { success: false, error: "모드 값이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    // 3. 캐시 확인 (rate limit 차감 없이 즉시 반환)
    const cacheKey = getCacheKey(trimmed, mode);
    try {
      const cached = await redis.get<AnalysisResult>(cacheKey);
      if (cached) {
        return NextResponse.json(
          { success: true, data: cached },
          { headers: { "X-Cache": "HIT", "X-RateLimit-Remaining": "10" } }
        );
      }
    } catch (e) {
      console.warn("캐시 조회 실패 (무시):", e);
    }

    // 4. Rate Limit 체크 (캐시 미스 시에만)
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(ip);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `오늘의 분석 한도(10회)를 초과했습니다. ${rateLimit.resetAt}에 초기화됩니다.`,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "Retry-After": "86400",
          },
        }
      );
    }

    // 5. Claude 분석 (1회 재시도 포함)
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
          {
            success: false,
            error: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          },
          { status: 500 }
        );
      }
    }

    // 6. 결과 캐시 저장 (30일)
    try {
      await redis.set(cacheKey, JSON.stringify(result), { ex: CACHE_TTL });
    } catch (e) {
      console.warn("캐시 저장 실패 (무시):", e);
    }

    // 7. 성공 응답
    return NextResponse.json(
      { success: true, data: result },
      {
        headers: {
          "X-Cache": "MISS",
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  } catch (error) {
    console.error("예상치 못한 오류:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다. 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
