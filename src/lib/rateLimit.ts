import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const DAILY_LIMIT = 20;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: string; // 한국어 표시용
}

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  // 오늘 날짜 기반 키 (UTC 기준, 매일 자정 초기화)
  const today = new Date().toISOString().slice(0, 10); // "2026-04-01"
  const key = `rl:${ip}:${today}`;

  // 현재 카운트 조회
  const current = await redis.get<number>(key);
  const count = current ?? 0;

  if (count >= DAILY_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: "내일 자정",
    };
  }

  // 카운트 증가 + 만료 설정 (25시간 — 하루가 넘어가도 안전하게 만료)
  await redis.incr(key);
  await redis.expire(key, 60 * 60 * 25);

  return {
    allowed: true,
    remaining: DAILY_LIMIT - count - 1,
    resetAt: "내일 자정",
  };
}

// IP 추출 헬퍼 (Next.js Request에서)
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
