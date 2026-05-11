// src/lib/nemotron/trends.ts
// #15 세대별/직업별 역량 트렌드 리포트 + #1-3 REFRAME 온보딩/추천/세그먼트

import {
  getOccupationStats,
  getAgeOccupationMatrix,
  getCompetencyBenchmarks,
  getPopulationDistribution,
} from './data-loader';
import type { OccupationStat, CompetencyAverage } from './types';
import type { CompetencyKey } from '@/types/competency';

const COMP_NAMES: Record<string, string> = {
  structural: '구조적 사고',
  creative: '창의적 재설계',
  emotional: '감성 연결',
  adaptive: '적응 민첩성',
  ethical: '윤리적 판단',
  collab: '협업 지능',
};

// ── #15: 세대별 역량 트렌드 ──

/**
 * 연령대별 평균 역량 비교 데이터
 * "MZ세대 vs X세대, 어떤 역량이 더 강한가?" 콘텐츠용
 */
export async function getGenerationalTrends(): Promise<{
  generations: Record<string, CompetencyAverage>;
  insights: string[];
  viralContent: string[];
}> {
  const stats = await getOccupationStats();

  // 연령대별 역량 집계
  const genScores: Record<string, { totals: CompetencyAverage; count: number }> = {};
  const GEN_MAP: Record<string, string> = {
    '10대': 'Gen Alpha', '20대': 'Gen Z', '30대': 'MZ세대',
    '40대': 'X세대', '50대': '베이비붐 후기', '60대+': '베이비붐',
  };

  for (const stat of stats) {
    if (!stat.avgCompetency) continue;

    for (const [ageGroup, count] of Object.entries(stat.ageDistribution)) {
      const gen = GEN_MAP[ageGroup] || ageGroup;

      if (!genScores[gen]) {
        genScores[gen] = {
          totals: { structural: 0, creative: 0, emotional: 0, adaptive: 0, ethical: 0, collab: 0 },
          count: 0,
        };
      }

      const gs = genScores[gen];
      gs.count += count;
      for (const key of Object.keys(stat.avgCompetency) as (keyof CompetencyAverage)[]) {
        gs.totals[key] += stat.avgCompetency[key] * count;
      }
    }
  }

  // 평균 계산
  const generations: Record<string, CompetencyAverage> = {};
  for (const [gen, data] of Object.entries(genScores)) {
    if (data.count < 10) continue;
    generations[gen] = {} as CompetencyAverage;
    for (const key of Object.keys(data.totals) as (keyof CompetencyAverage)[]) {
      generations[gen][key] = Math.round((data.totals[key] / data.count) * 10) / 10;
    }
  }

  // 인사이트 생성
  const insights: string[] = [];
  const genEntries = Object.entries(generations);

  if (genEntries.length >= 2) {
    // 가장 큰 세대간 차이 찾기
    for (const key of Object.keys(COMP_NAMES) as CompetencyKey[]) {
      let maxDiff = 0;
      let diffGens = ['', ''];
      for (let i = 0; i < genEntries.length; i++) {
        for (let j = i + 1; j < genEntries.length; j++) {
          const diff = Math.abs(
            (genEntries[i][1] as any)[key] - (genEntries[j][1] as any)[key]
          );
          if (diff > maxDiff) {
            maxDiff = diff;
            diffGens = [genEntries[i][0], genEntries[j][0]];
          }
        }
      }
      if (maxDiff > 5) {
        insights.push(
          `${COMP_NAMES[key]}에서 ${diffGens[0]}와 ${diffGens[1]} 사이 ${maxDiff.toFixed(1)}점 차이`
        );
      }
    }
  }

  // 바이럴 콘텐츠 소재
  const viralContent = [
    `MZ세대 vs X세대, AI 시대에 누가 더 준비됐을까?`,
    `세대별 미래 역량 순위가 완전히 뒤집힌다`,
    `당신의 세대는 어떤 역량이 가장 강한가?`,
    `AI가 보는 세대별 역량 리포트 — 결과가 충격적`,
  ];

  return { generations, insights, viralContent };
}

// ── #12: 직업별 역량 벤치마크 랭킹 ──

/**
 * 직업별 역량 랭킹 (상위/하위 직업 추출)
 */
export async function getOccupationRankings(
  dimension: CompetencyKey,
  limit: number = 10,
): Promise<{
  top: Array<{ occupation: string; score: number; count: number }>;
  bottom: Array<{ occupation: string; score: number; count: number }>;
}> {
  const benchmarks = await getCompetencyBenchmarks();

  const withScore = benchmarks
    .filter(b => b[dimension] && b.sampleSize >= 10)
    .map(b => ({
      occupation: b.occupation,
      score: b[dimension].mean,
      count: b.sampleSize,
    }))
    .sort((a, b) => b.score - a.score);

  return {
    top: withScore.slice(0, limit),
    bottom: withScore.slice(-limit).reverse(),
  };
}

// ── #1: REFRAME 온보딩 개인화 ──

/**
 * 사용자 프로필에 가장 유사한 페르소나 클러스터 추천
 */
export async function getOnboardingRecommendation(
  occupation: string,
  ageGroup?: string,
): Promise<{
  matchedOccupation: string | null;
  popularPaths: string[];
  suggestedContent: string[];
  welcomeMessage: string;
}> {
  const stats = await getOccupationStats();
  const q = occupation.trim().toLowerCase();

  // 유사 직업 찾기
  const matched = stats.find(s =>
    s.occupation.toLowerCase().includes(q) || q.includes(s.occupation.toLowerCase())
  );

  if (!matched) {
    return {
      matchedOccupation: null,
      popularPaths: ['직업 대체율 분석', '미래 역량 검사', '전환 경로 탐색'],
      suggestedContent: ['AI 시대 필수 역량 TOP 5', '직업별 AI 대체율 순위'],
      welcomeMessage: `${occupation}에 대한 분석을 시작해보세요.`,
    };
  }

  const comp = matched.avgCompetency;
  const weakest = comp
    ? Object.entries(comp).sort((a, b) => a[1] - b[1])[0]
    : null;

  return {
    matchedOccupation: matched.occupation,
    popularPaths: [
      `${matched.occupation} AI 대체율 분석`,
      `미래 역량 검사로 강점 찾기`,
      weakest ? `${COMP_NAMES[weakest[0]] || weakest[0]} 역량 강화 가이드` : '전환 경로 탐색',
    ],
    suggestedContent: [
      `${matched.occupation} 종사자 ${matched.count}명의 역량 프로파일`,
      weakest ? `${COMP_NAMES[weakest[0]] || weakest[0]}: 어떻게 키울 수 있을까?` : '',
      `비슷한 직업에서 성공적으로 전환한 경로`,
    ].filter(Boolean),
    welcomeMessage: `${matched.occupation} 종사자 ${matched.count}명의 데이터가 준비되어 있습니다. 당신의 역량을 비교해보세요.`,
  };
}

// ── #2: 콘텐츠 추천 엔진 ──

/**
 * 직업별 가장 많이 고민하는 주제 추출 (career_goals 기반)
 */
export async function getContentRecommendations(
  occupation: string,
): Promise<string[]> {
  const stat = await getOccupationStats();
  const q = occupation.trim().toLowerCase();

  const matched = stat.find(s =>
    s.occupation.toLowerCase().includes(q) || q.includes(s.occupation.toLowerCase())
  );

  if (!matched) {
    return [
      'AI 시대 생존 전략',
      '미래 역량 자가진단',
      '커리어 전환 성공 사례',
    ];
  }

  const topics: string[] = [];

  // 역량 프로파일 기반 콘텐츠 추천
  if (matched.avgCompetency) {
    const sorted = Object.entries(matched.avgCompetency).sort((a, b) => a[1] - b[1]);
    const weakest = sorted[0];
    const strongest = sorted[sorted.length - 1];

    topics.push(`${matched.occupation}의 숨은 강점: ${COMP_NAMES[strongest[0]] || strongest[0]}`);
    topics.push(`${COMP_NAMES[weakest[0]] || weakest[0]} 역량 강화 3단계`);
  }

  topics.push(`${matched.occupation} AI 대체율 심층 분석`);
  topics.push(`비슷한 직업으로의 전환 경로`);
  topics.push(`${matched.occupation} 종사자가 가장 많이 묻는 질문`);

  return topics.slice(0, 5);
}

// ── #3: 마케팅 세그먼트 검증 ──

/**
 * 타깃 세그먼트(20-40대 직장인)의 실제 분포 데이터
 */
export async function validateMarketSegment(
  targetAgeGroups: string[] = ['20대', '30대', '40대'],
): Promise<{
  totalPopulation: number;
  targetPopulation: number;
  targetPercentage: number;
  topOccupationsInTarget: Array<{ occupation: string; count: number }>;
  insight: string;
}> {
  const ageMatrix = await getAgeOccupationMatrix();
  let totalPop = 0;
  let targetPop = 0;
  const targetOccupations: Record<string, number> = {};

  for (const [ageGroup, occupations] of Object.entries(ageMatrix)) {
    const groupTotal = Object.values(occupations).reduce((s, c) => s + c, 0);
    totalPop += groupTotal;

    if (targetAgeGroups.includes(ageGroup)) {
      targetPop += groupTotal;
      for (const [occ, count] of Object.entries(occupations)) {
        targetOccupations[occ] = (targetOccupations[occ] || 0) + count;
      }
    }
  }

  const topOccs = Object.entries(targetOccupations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([occ, count]) => ({ occupation: occ, count }));

  return {
    totalPopulation: totalPop,
    targetPopulation: targetPop,
    targetPercentage: Math.round((targetPop / totalPop) * 1000) / 10,
    topOccupationsInTarget: topOccs,
    insight: `타깃(${targetAgeGroups.join('+')}): 전체의 ${((targetPop / totalPop) * 100).toFixed(1)}%. 상위 직업: ${topOccs.slice(0, 3).map(o => o.occupation).join(', ')}.`,
  };
}
