// src/lib/nemotron/occupation-cache.ts
// #4 직업 대체율 사전 캐시 시스템
// Nemotron 데이터에서 미리 계산된 대체율을 반환 → API 호출 없이 즉시 응답

import { getOccupationCache, findOccupation } from './data-loader';
import type { OccupationCacheEntry, ReplacementDimensions } from './types';
import { DIMENSION_WEIGHTS } from '@/types/analysis';

/**
 * 캐시에서 직업 대체율 조회
 * @returns 캐시 히트 시 대체율 데이터, 미스 시 null (→ Claude API 호출 필요)
 */
export async function getCachedReplacement(jobName: string): Promise<{
  overallRate: number;
  dimensions: ReplacementDimensions;
  fromCache: true;
  cacheSource: 'nemotron';
  sampleSize: number;
} | null> {
  const cache = await getOccupationCache();
  const key = jobName.trim().toLowerCase();

  // 정확 매칭
  let entry = cache[jobName] || cache[key];

  // 부분 매칭
  if (!entry) {
    const matchKey = Object.keys(cache).find(k =>
      k.toLowerCase().includes(key) || key.includes(k.toLowerCase())
    );
    if (matchKey) entry = cache[matchKey];
  }

  if (!entry) return null;

  const overallRate = calculateOverallRate(entry.replacement);

  return {
    overallRate,
    dimensions: entry.replacement,
    fromCache: true,
    cacheSource: 'nemotron',
    sampleSize: entry.count,
  };
}

/**
 * 8차원 가중평균으로 종합 대체율 계산
 */
function calculateOverallRate(dims: ReplacementDimensions): number {
  const weighted =
    dims.repetitive * 0.20 +
    dims.cognitive * 0.18 +
    dims.physical * 0.10 +
    dims.creative * 0.12 +
    dims.social * 0.12 +
    dims.ethical * 0.08 +
    dims.techVelocity * 0.12 +
    (100 - dims.regulatory) * 0.08;  // regulatory는 역방향

  return Math.round(Math.max(0, Math.min(100, weighted)));
}

/**
 * 직업의 상세 정보 + 대체율을 한 번에 조회
 */
export async function getOccupationProfile(jobName: string) {
  const stat = await findOccupation(jobName);
  const cached = await getCachedReplacement(jobName);

  return {
    stat,
    cached,
    available: !!(stat || cached),
  };
}

/**
 * 캐시에 있는 모든 직업 목록 반환 (자동완성용)
 */
export async function getCachedOccupationList(): Promise<string[]> {
  const cache = await getOccupationCache();
  return Object.keys(cache).sort();
}
