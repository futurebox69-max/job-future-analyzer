// src/lib/nemotron/comparison.ts
// #5 나와 비슷한 사람들 비교 + #14 상위 N% 사회적 비교

import {
  getPopulationDistribution,
  getCompetencyBenchmarks,
  findOccupation,
  getOccupationStats,
} from './data-loader';
import type {
  ComparisonResult,
  CompetencyAverage,
  PopulationDimension,
} from './types';
import type { CompetencyKey } from '@/types/competency';

// ── #14: 상위 N% 계산 (역량 검사) ──

/**
 * 역량 점수를 전체 인구 분포 대비 백분위로 변환
 * "당신은 구조적 사고 상위 15%입니다" 같은 메시지 생성용
 */
export async function getPercentileRank(
  dimension: string,
  score: number
): Promise<ComparisonResult> {
  const pop = await getPopulationDistribution();

  if (!pop || !(dimension in pop)) {
    return {
      percentile: 50,
      vsOccupationAvg: 0,
      vsPopulationAvg: 0,
      rank: '데이터 준비 중',
    };
  }

  const dimData = pop[dimension as keyof typeof pop] as PopulationDimension;

  // 백분위 계산 (percentiles 맵에서 보간)
  const percentiles = dimData.percentiles;
  const pKeys = Object.keys(percentiles)
    .map(Number)
    .sort((a, b) => a - b);

  let percentile = 50;
  for (let i = 0; i < pKeys.length; i++) {
    const p = pKeys[i];
    if (score <= percentiles[String(p)]) {
      percentile = i > 0 ? pKeys[i - 1] : 5;
      break;
    }
    if (i === pKeys.length - 1) {
      percentile = 95;
    }
  }

  // 상위 N% 변환 (percentile이 높을수록 상위)
  const topPercent = 100 - percentile;

  return {
    percentile: topPercent,
    vsOccupationAvg: 0,  // 직업별은 별도 호출
    vsPopulationAvg: Math.round((score - dimData.mean) * 10) / 10,
    rank: formatRank(topPercent),
  };
}

/**
 * 모든 6차원의 백분위를 한 번에 계산
 */
export async function getAllPercentileRanks(
  scores: Record<string, number>
): Promise<Record<string, ComparisonResult>> {
  const results: Record<string, ComparisonResult> = {};

  for (const [dim, score] of Object.entries(scores)) {
    results[dim] = await getPercentileRank(dim, score);
  }

  return results;
}

// ── #5: 직업별 비교 ──

/**
 * 사용자 역량을 같은 직업군의 평균과 비교
 */
export async function compareWithOccupation(
  occupation: string,
  userScores: Record<string, number>
): Promise<Record<string, {
  userScore: number;
  occupationAvg: number;
  diff: number;
  isAboveAvg: boolean;
  percentileInOccupation: string;
}>> {
  const stat = await findOccupation(occupation);
  const result: Record<string, any> = {};

  if (!stat || !stat.avgCompetency) {
    // 데이터 없으면 인구 전체 평균과 비교
    const pop = await getPopulationDistribution();
    for (const [dim, score] of Object.entries(userScores)) {
      const popMean = pop?.[dim as keyof typeof pop]?.mean ?? 50;
      result[dim] = {
        userScore: score,
        occupationAvg: Math.round(popMean),
        diff: Math.round(score - popMean),
        isAboveAvg: score > popMean,
        percentileInOccupation: '데이터 부족',
      };
    }
    return result;
  }

  for (const [dim, score] of Object.entries(userScores)) {
    const avg = stat.avgCompetency[dim as keyof CompetencyAverage] ?? 50;
    const diff = Math.round(score - avg);

    result[dim] = {
      userScore: score,
      occupationAvg: Math.round(avg),
      diff,
      isAboveAvg: diff > 0,
      percentileInOccupation: diff > 15 ? '상위 그룹' : diff > 0 ? '평균 이상' : diff > -15 ? '평균 수준' : '성장 필요',
    };
  }

  return result;
}

// ── #5: "나와 비슷한 사람들" 요약 ──

/**
 * 같은 직업의 핵심 스킬과 커리어 특성 요약
 */
export async function getSimilarPeopleInsight(occupation: string): Promise<{
  found: boolean;
  sampleSize: number;
  topSkills: string[];
  avgAge: number | null;
  topRegions: string[];
  competencyProfile: CompetencyAverage | null;
  insight: string;
}> {
  const stat = await findOccupation(occupation);

  if (!stat) {
    return {
      found: false,
      sampleSize: 0,
      topSkills: [],
      avgAge: null,
      topRegions: [],
      competencyProfile: null,
      insight: '이 직업의 데이터가 아직 충분하지 않습니다.',
    };
  }

  const topRegions = Object.keys(stat.topRegions).slice(0, 3);
  const avgComp = stat.avgCompetency;

  // 역량 프로파일에서 강점/약점 추출
  let insight = `${stat.occupation} 종사자 ${stat.count}명의 데이터 기반.`;
  if (avgComp) {
    const sorted = Object.entries(avgComp).sort((a, b) => b[1] - a[1]);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];
    const NAMES: Record<string, string> = {
      structural: '구조적 사고', creative: '창의적 재설계',
      emotional: '감성 연결', adaptive: '적응 민첩성',
      ethical: '윤리적 판단', collab: '협업 지능',
    };
    insight += ` 평균 강점은 ${NAMES[strongest[0]] || strongest[0]}, 성장 여지는 ${NAMES[weakest[0]] || weakest[0]}.`;
  }

  return {
    found: true,
    sampleSize: stat.count,
    topSkills: stat.topSkills,
    avgAge: stat.avgAge,
    topRegions,
    competencyProfile: avgComp,
    insight,
  };
}

// ── 유틸리티 ──

function formatRank(topPercent: number): string {
  if (topPercent <= 5) return '상위 5% (최상위)';
  if (topPercent <= 10) return '상위 10%';
  if (topPercent <= 20) return '상위 20%';
  if (topPercent <= 30) return '상위 30%';
  if (topPercent <= 50) return '평균 이상';
  if (topPercent <= 70) return '평균 수준';
  return '성장 필요 영역';
}

/**
 * 공유 텍스트 생성 — "나는 구조적 사고 상위 12%!"
 */
export function generateShareText(
  competencyName: string,
  percentile: number,
  typeName: string,
): string {
  if (percentile <= 10) {
    return `🏆 나의 미래역량 유형: ${typeName}!\n${competencyName} 상위 ${percentile}%로 최상위권! #REFRAME #미래역량검사`;
  }
  if (percentile <= 30) {
    return `✨ 나의 미래역량 유형: ${typeName}!\n${competencyName} 상위 ${percentile}%! #REFRAME #미래역량검사`;
  }
  return `🌱 나의 미래역량 유형: ${typeName}!\n나만의 강점을 발견했습니다 #REFRAME #미래역량검사`;
}
