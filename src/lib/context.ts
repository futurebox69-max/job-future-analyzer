/**
 * 월간 업데이트된 직업 시장 컨텍스트를 Redis에서 읽어오는 모듈
 * 없으면 null 반환 → 프롬프트에서 생략
 */

import { Redis } from "@upstash/redis";

export interface JobMarketContext {
  updatedAt: string;
  aiTechUpdates: string;
  regulatoryChanges: string;
  industryShifts: string;
  emergingJobs: string;
  atRiskSectors: string;
  keyStats: string;
  consultingInsight: string;
}

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

export async function getLatestContext(): Promise<JobMarketContext | null> {
  try {
    const raw = await getRedis().get<JobMarketContext>("job_market_context:latest");
    return raw ?? null;
  } catch (e) {
    console.warn("컨텍스트 로드 실패 (무시):", e);
    return null;
  }
}

export function formatContextForPrompt(ctx: JobMarketContext): string {
  return `
=== 최신 직업 시장 동향 (${ctx.updatedAt} 기준) ===
⚡ AI 기술 업데이트:
${ctx.aiTechUpdates}

📋 법·규제 변화:
${ctx.regulatoryChanges}

🏭 산업 구조 변화:
${ctx.industryShifts}

🌱 새롭게 생겨나는 직업:
${ctx.emergingJobs}

⚠️ 현재 고위험 분야:
${ctx.atRiskSectors}

📊 최신 통계:
${ctx.keyStats}

위 최신 동향을 분석에 반드시 반영하세요.
=== 최신 동향 끝 ===`.trim();
}
