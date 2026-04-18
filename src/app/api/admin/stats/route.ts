import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { getAgentCostStats } from "@/lib/cost-tracker";

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

// zrange withScores 결과 파싱 → [{ name, count }]
function parseZrangeScores(raw: unknown[]): { name: string; count: number }[] {
  const result: { name: string; count: number }[] = [];
  if (!Array.isArray(raw)) return result;
  for (let i = 0; i < raw.length; i += 2) {
    result.push({ name: String(raw[i]), count: Number(raw[i + 1]) });
  }
  return result;
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

  // Redis에서 병렬 조회 (1차 — 기존 지표)
  const [
    todayReq,
    todayHit,
    todayClaude,
    monthReq,
    monthClaude,
    totalAllTime,
    ...dailyReqs
  ] = await Promise.all([
    redis.get<number>(`stats:req:${d}`),
    redis.get<number>(`stats:hit:${d}`),
    redis.get<number>(`stats:claude:${d}`),
    redis.get<number>(`stats:req:${m}`),
    redis.get<number>(`stats:claude:${m}`),
    redis.get<number>("stats:total"),
    ...days.map((day) => redis.get<number>(`stats:req:${day}`)),
  ]);

  // Redis에서 병렬 조회 (2차 — 신규 분류 통계 + 에이전트 비용)
  const [langData, modeData, hourData, allJobsData, agentCosts] = await Promise.all([
    redis.zrange(`stats:lang:${m}`, 0, -1, { rev: true, withScores: true }),
    redis.zrange(`stats:mode:${m}`, 0, -1, { rev: true, withScores: true }),
    redis.zrange(`stats:hour:${d}`, 0, -1, { withScores: true }),
    redis.zrange(`stats:jobs:${m}`, 0, 29, { rev: true, withScores: true }),
    getAgentCostStats(),
  ]);

  const tReq = todayReq ?? 0;
  const tHit = todayHit ?? 0;
  const tClaude = todayClaude ?? 0;
  const mReq = monthReq ?? 0;
  const mClaude = monthClaude ?? 0;
  const total = totalAllTime ?? 0;

  // 인기 직업 Top 30 파싱
  const topJobs30 = parseZrangeScores(allJobsData as unknown[]);

  // 언어별 통계 파싱
  const langStats = parseZrangeScores(langData as unknown[]);

  // 모드별 통계 파싱
  const modeStats = parseZrangeScores(modeData as unknown[]);

  // 시간대별 통계 파싱 (hour는 오름차순으로 정렬)
  const hourRaw = parseZrangeScores(hourData as unknown[]);
  const hourStats = hourRaw
    .map((h) => ({ hour: parseInt(h.name, 10), count: h.count }))
    .sort((a, b) => a.hour - b.hour);

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
    totalAllTime: total,
    topJobs: topJobs30.slice(0, 10),
    topJobs30,
    langStats,
    modeStats,
    hourStats,
    daily,
    agentCosts,   // 에이전트별 비용 내역
  });
}
