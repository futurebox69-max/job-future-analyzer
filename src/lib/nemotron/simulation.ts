// src/lib/nemotron/simulation.ts
// #10 대규모 검사 시뮬레이션 + #11 유형 분포 균형 검증 + #13 문항 난이도

import { getOccupationStats, getCompetencyBenchmarks, getPersonaSamples } from './data-loader';
import type { OccupationStat, PersonaSample, CompetencyBenchmark } from './types';
import type { CompetencyKey, CompetencyScores } from '@/types/competency';

/**
 * #10: 페르소나 기반 검사 응답 시뮬레이션
 *
 * 직업별 역량 프로파일에서 "이 사람이라면 어떻게 답할까"를 추정해
 * 결과 분포의 정상성을 검증
 */
export async function simulateAssessmentDistribution(
  sampleSize: number = 1000,
): Promise<{
  totalSimulated: number;
  scoreDistribution: Record<CompetencyKey, { mean: number; std: number; min: number; max: number }>;
  typeDistribution: Record<string, number>;
  normalityCheck: { isNormal: boolean; skewness: string };
}> {
  const stats = await getOccupationStats();
  if (!stats.length) {
    return {
      totalSimulated: 0,
      scoreDistribution: {} as any,
      typeDistribution: {},
      normalityCheck: { isNormal: false, skewness: '데이터 없음' },
    };
  }

  const allScores: Record<CompetencyKey, number[]> = {
    structural: [], creative: [], emotional: [],
    adaptive: [], ethical: [], collab: [],
  };
  const typeCounts: Record<string, number> = {};

  // 직업별 인원수 비례로 시뮬레이션
  const totalPop = stats.reduce((s, o) => s + o.count, 0);
  let simulated = 0;

  for (const stat of stats) {
    const proportion = stat.count / totalPop;
    const simCount = Math.max(1, Math.round(sampleSize * proportion));

    for (let i = 0; i < simCount && simulated < sampleSize; i++) {
      // 역량 점수에 노이즈 추가해 현실적 분포 생성
      const scores: CompetencyScores = {
        structural: addNoise(stat.avgCompetency?.structural ?? 50, 15),
        creative: addNoise(stat.avgCompetency?.creative ?? 50, 15),
        emotional: addNoise(stat.avgCompetency?.emotional ?? 50, 15),
        adaptive: addNoise(stat.avgCompetency?.adaptive ?? 50, 15),
        ethical: addNoise(stat.avgCompetency?.ethical ?? 50, 15),
        collab: addNoise(stat.avgCompetency?.collab ?? 50, 15),
      };

      for (const key of Object.keys(allScores) as CompetencyKey[]) {
        allScores[key].push(scores[key]);
      }

      // 유형 분류
      const type = classifyType(scores);
      typeCounts[type] = (typeCounts[type] || 0) + 1;

      simulated++;
    }
  }

  // 통계 계산
  const scoreDistribution: any = {};
  for (const key of Object.keys(allScores) as CompetencyKey[]) {
    const arr = allScores[key];
    scoreDistribution[key] = {
      mean: Math.round(mean(arr) * 10) / 10,
      std: Math.round(std(arr) * 10) / 10,
      min: Math.min(...arr),
      max: Math.max(...arr),
    };
  }

  // 정규성 대략 확인 (skewness 기반)
  const structuralSkew = skewness(allScores.structural);
  const isNormal = Math.abs(structuralSkew) < 1.0;

  return {
    totalSimulated: simulated,
    scoreDistribution,
    typeDistribution: typeCounts,
    normalityCheck: {
      isNormal,
      skewness: Math.abs(structuralSkew) < 0.5 ? '정상 분포' :
                Math.abs(structuralSkew) < 1.0 ? '약간 치우침' : '유의미한 치우침',
    },
  };
}

/**
 * #11: 유형 분포 균형 검증
 * 10개 유형이 한쪽으로 쏠리지 않는지 확인
 */
export async function verifyTypeBalance(): Promise<{
  isBalanced: boolean;
  typeDistribution: Record<string, { count: number; percentage: number }>;
  dominantType: string;
  recommendation: string;
}> {
  const sim = await simulateAssessmentDistribution(5000);
  const total = sim.totalSimulated;

  const distribution: Record<string, { count: number; percentage: number }> = {};
  let maxType = '';
  let maxCount = 0;

  for (const [type, count] of Object.entries(sim.typeDistribution)) {
    const pct = Math.round((count / total) * 1000) / 10;
    distribution[type] = { count, percentage: pct };
    if (count > maxCount) {
      maxCount = count;
      maxType = type;
    }
  }

  // 균형 판단: 최대 유형이 전체의 40% 미만이면 균형
  const maxPct = (maxCount / total) * 100;
  const isBalanced = maxPct < 40;

  let recommendation = '';
  if (!isBalanced) {
    recommendation = `'${maxType}' 유형이 ${maxPct.toFixed(1)}%로 과도하게 집중되어 있습니다. 해당 유형의 분류 기준을 조정하거나 문항의 가중치를 재배분할 필요가 있습니다.`;
  } else {
    recommendation = '유형 분포가 적절히 균형 잡혀 있습니다.';
  }

  return {
    isBalanced,
    typeDistribution: distribution,
    dominantType: maxType,
    recommendation,
  };
}

/**
 * #13: 문항 난이도 사전 조정
 * 직업별로 특정 차원에서 천장/바닥 효과가 나타나는지 확인
 */
export async function checkQuestionDifficulty(): Promise<{
  ceilingEffects: Array<{ occupation: string; dimension: string; avgScore: number }>;
  floorEffects: Array<{ occupation: string; dimension: string; avgScore: number }>;
  recommendation: string;
}> {
  const benchmarks = await getCompetencyBenchmarks();
  const ceilings: Array<{ occupation: string; dimension: string; avgScore: number }> = [];
  const floors: Array<{ occupation: string; dimension: string; avgScore: number }> = [];

  const DIMS = ['structural', 'creative', 'emotional', 'adaptive', 'ethical', 'collab'] as const;

  for (const bm of benchmarks.slice(0, 50)) {  // 상위 50개 직업
    for (const dim of DIMS) {
      const dimData = bm[dim];
      if (!dimData) continue;

      if (dimData.mean > 85) {
        ceilings.push({ occupation: bm.occupation, dimension: dim, avgScore: dimData.mean });
      }
      if (dimData.mean < 25) {
        floors.push({ occupation: bm.occupation, dimension: dim, avgScore: dimData.mean });
      }
    }
  }

  let recommendation = '';
  if (ceilings.length > 0) {
    recommendation += `천장 효과 ${ceilings.length}건 발견. `;
    recommendation += `${ceilings[0].occupation}의 ${ceilings[0].dimension} 문항 난이도를 높여야 합니다. `;
  }
  if (floors.length > 0) {
    recommendation += `바닥 효과 ${floors.length}건 발견. `;
    recommendation += `${floors[0].occupation}의 ${floors[0].dimension} 문항을 쉽게 조정해야 합니다.`;
  }
  if (!recommendation) {
    recommendation = '현재 문항 난이도가 적절합니다. 천장/바닥 효과 없음.';
  }

  return { ceilingEffects: ceilings, floorEffects: floors, recommendation };
}

// ── 유틸리티 ──

function addNoise(value: number, stdDev: number): number {
  // Box-Muller 변환으로 정규분포 노이즈
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(0, Math.min(100, Math.round(value + z * stdDev)));
}

function classifyType(scores: CompetencyScores): string {
  const entries = Object.entries(scores) as [CompetencyKey, number][];
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const max = sorted[0];
  const min = sorted[sorted.length - 1];
  const avg = entries.reduce((s, [_, v]) => s + v, 0) / entries.length;

  // 균형 전략가
  if (max[1] - min[1] <= 10) return '균형 전략가';

  // 올라운더
  if (avg >= 75 && entries.every(([_, v]) => v >= 60)) return '올라운더';

  // 잠재력 폭발형
  if (min[1] <= 40 && max[1] >= 90) return '잠재력 폭발형';

  // 이중 무기 보유자
  if (sorted.length >= 2 && sorted[0][1] - sorted[1][1] <= 5) return '이중 무기 보유자';

  // 단일 최고
  const TYPE_MAP: Record<CompetencyKey, string> = {
    structural: '미래 설계자',
    creative: '창조적 파괴자',
    emotional: '공감 리더',
    adaptive: '적응형 혁신가',
    ethical: '윤리 수호자',
    collab: '시너지 메이커',
  };

  return TYPE_MAP[max[0]] || '균형 전략가';
}

function mean(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function std(arr: number[]): number {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

function skewness(arr: number[]): number {
  const m = mean(arr);
  const s = std(arr);
  if (s === 0) return 0;
  const n = arr.length;
  return (n / ((n - 1) * (n - 2))) * arr.reduce((sum, v) => sum + ((v - m) / s) ** 3, 0);
}
