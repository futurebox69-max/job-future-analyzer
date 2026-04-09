import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const COST_PER_CLAUDE_CALL = 0.069; // USD

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function thisMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

// 최근 N일 날짜 배열
function lastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  });
}

export async function GET(request: NextRequest) {
  // 관리자 키 확인
  const key = request.nextUrl.searchParams.get("key");
  if (!key || key !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const d = today();
  const m = thisMonth();
  const days = lastNDays(30);

  // Redis에서 병렬 조회
  const [
    todayReq,
    todayHit,
    todayClaude,
    monthReq,
    monthClaude,
    topJobs,
    ...dailyReqs
  ] = await Promise.all([
    redis.get<number>(`stats:req:${d}`),
    redis.get<number>(`stats:hit:${d}`),
    redis.get<number>(`stats:claude:${d}`),
    redis.get<number>(`stats:req:${m}`),
    redis.get<number>(`stats:claude:${m}`),
    redis.zrange(`stats:jobs:${m}`, 0, 9, { rev: true, withScores: true }),
    ...days.map((day) => redis.get<number>(`stats:req:${day}`)),
  ]);

  const tReq = todayReq ?? 0;
  const tHit = todayHit ?? 0;
  const tClaude = todayClaude ?? 0;
  const mReq = monthReq ?? 0;
  const mClaude = monthClaude ?? 0;

  // 인기 직업 파싱 (zrange withScores → [name, score, name, score, ...])
  const jobs: { name: string; count: number }[] = [];
  if (Array.isArray(topJobs)) {
    for (let i = 0; i < topJobs.length; i += 2) {
      jobs.push({ name: String(topJobs[i]), count: Number(topJobs[i + 1]) });
    }
  }

  // 일별 추이 (최근 14일)
  const daily = days.slice(0, 14).map((date, i) => ({
    date,
    requests: (dailyReqs[i] as number | null) ?? 0,
  })).reverse();

  return NextResponse.json({
    today: {
      date: d,
      requests: tReq,
      cacheHits: tHit,
      claudeCalls: tClaude,
      cacheHitRate: tReq > 0 ? Math.round((tHit / tReq) * 100) : 0,
      estimatedCostUSD: +(tClaude * COST_PER_CLAUDE_CALL).toFixed(3),
      estimatedCostKRW: Math.round(tClaude * COST_PER_CLAUDE_CALL * 1380),
    },
    month: {
      period: m,
      requests: mReq,
      claudeCalls: mClaude,
      cacheHitRate: mReq > 0 ? Math.round(((mReq - mClaude) / mReq) * 100) : 0,
      estimatedCostUSD: +(mClaude * COST_PER_CLAUDE_CALL).toFixed(2),
      estimatedCostKRW: Math.round(mClaude * COST_PER_CLAUDE_CALL * 1380),
    },
    topJobs: jobs,
    daily,
  });
}
