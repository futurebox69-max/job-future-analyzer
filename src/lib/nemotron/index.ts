// src/lib/nemotron/index.ts
// Nemotron-Personas-Korea 통합 모듈 — 18개 기능 인덱스

// ── 데이터 로더 ──
export {
  isNemotronDataAvailable,
  getOccupationStats,
  getOccupationCache,
  getAgeOccupationMatrix,
  getRegionOccupationMap,
  getSkillTransitionGraph,
  getCompetencyBenchmarks,
  getPopulationDistribution,
  getPersonaSamples,
  findOccupation,
  clearNemotronCache,
} from './data-loader';

// ── #4: 직업 대체율 캐시 ──
export {
  getCachedReplacement,
  getOccupationProfile,
  getCachedOccupationList,
} from './occupation-cache';

// ── #5, #14: 비교 및 백분위 ──
export {
  getPercentileRank,
  getAllPercentileRanks,
  compareWithOccupation,
  getSimilarPeopleInsight,
  generateShareText,
} from './comparison';

// ── #6, #8, #9: 전환 경로 및 지역/연령 ──
export {
  getTransitionRecommendations,
  analyzeTransitionFeasibility,
  getRegionalRiskMap,
  getRegionProfile,
  getAgeCurveForOccupation,
} from './transition';

// ── #7: 프롬프트 정교화 ──
export {
  enrichPromptWithNemotron,
  enrichPromptWithAge,
} from './prompt-enrichment';

// ── #10, #11, #13: 시뮬레이션 ──
export {
  simulateAssessmentDistribution,
  verifyTypeBalance,
  checkQuestionDifficulty,
} from './simulation';

// ── #1-3, #12, #15: 트렌드 및 온보딩 ──
export {
  getGenerationalTrends,
  getOccupationRankings,
  getOnboardingRecommendation,
  getContentRecommendations,
  validateMarketSegment,
} from './trends';

// ── #16-18: B2B, 벤치마크, 개인정보 ──
export {
  generateB2BDemo,
  getBenchmarkPersonas,
  compareBenchmarkResults,
  getPrivacySafetyInfo,
} from './benchmark';

// ── 타입 ──
export type * from './types';
