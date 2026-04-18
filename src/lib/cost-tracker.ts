/**
 * BTS 에이전트별 API 비용 추적기
 * Redis에 에이전트별 호출 수를 기록하고, 관리자 대시보드에서 조회합니다.
 */
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/** 에이전트 정의 */
export const AGENTS = {
  job_analyze:   { label: "직업분석 (Sonnet)",     emoji: "🔍", costUSD: 0.069  },
  job_validate:  { label: "직업검증 (Haiku)",       emoji: "✅", costUSD: 0.000025 },
  chat_coach:    { label: "채팅 코치 (Sonnet)",     emoji: "💬", costUSD: 0.0195 },
  bts_report:    { label: "BTS 역량보고서 (Sonnet)", emoji: "📊", costUSD: 0.114  },
} as const;

export type AgentKey = keyof typeof AGENTS;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function thisMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

/** 에이전트 호출 1회 기록 */
export async function trackAgentCall(agent: AgentKey): Promise<void> {
  const d = today();
  const m = thisMonth();
  try {
    await Promise.all([
      redis.incr(`cost:agent:${agent}:calls:${d}`),
      redis.expire(`cost:agent:${agent}:calls:${d}`, 60 * 60 * 24 * 35),
      redis.incr(`cost:agent:${agent}:calls:${m}`),
      redis.incr(`cost:agent:calls:total`),          // 전체 누적
    ]);
  } catch (e) {
    console.warn("[cost-tracker] 기록 실패 (무시):", e);
  }
}

/** 에이전트별 오늘/이번달/누적 통계 조회 */
export async function getAgentCostStats(): Promise<{
  agents: Array<{
    key: AgentKey;
    label: string;
    emoji: string;
    costPerCall: number;
    today: { calls: number; costUSD: number; costKRW: number };
    month: { calls: number; costUSD: number; costKRW: number };
  }>;
  total: {
    today: { costUSD: number; costKRW: number };
    month: { costUSD: number; costKRW: number };
  };
}> {
  const d = today();
  const m = thisMonth();
  const keys = Object.keys(AGENTS) as AgentKey[];

  // 에이전트별 오늘/이달 호출수 병렬 조회
  const values = await Promise.all(
    keys.flatMap((key) => [
      redis.get<number>(`cost:agent:${key}:calls:${d}`),
      redis.get<number>(`cost:agent:${key}:calls:${m}`),
    ])
  );

  const USD_TO_KRW = 1380;

  const agents = keys.map((key, i) => {
    const { label, emoji, costUSD } = AGENTS[key];
    const todayCalls = (values[i * 2] ?? 0) as number;
    const monthCalls = (values[i * 2 + 1] ?? 0) as number;
    return {
      key,
      label,
      emoji,
      costPerCall: costUSD,
      today: {
        calls: todayCalls,
        costUSD: +(todayCalls * costUSD).toFixed(4),
        costKRW: Math.round(todayCalls * costUSD * USD_TO_KRW),
      },
      month: {
        calls: monthCalls,
        costUSD: +(monthCalls * costUSD).toFixed(3),
        costKRW: Math.round(monthCalls * costUSD * USD_TO_KRW),
      },
    };
  });

  const totalTodayUSD  = agents.reduce((s, a) => s + a.today.costUSD, 0);
  const totalMonthUSD  = agents.reduce((s, a) => s + a.month.costUSD, 0);

  return {
    agents,
    total: {
      today: { costUSD: +totalTodayUSD.toFixed(4), costKRW: Math.round(totalTodayUSD * USD_TO_KRW) },
      month: { costUSD: +totalMonthUSD.toFixed(3),  costKRW: Math.round(totalMonthUSD * USD_TO_KRW) },
    },
  };
}
