// src/lib/nemotron/types.ts
// Nemotron-Personas-Korea 데이터 타입 정의

/** 직업별 통계 */
export interface OccupationStat {
  occupation: string;
  count: number;
  avgAge: number | null;
  ageDistribution: Record<string, number>;
  topRegions: Record<string, number>;
  educationDistribution: Record<string, number>;
  avgCompetency: CompetencyAverage;
  topSkills: string[];
  estimatedReplacement: ReplacementDimensions;
}

/** 6차원 역량 평균 */
export interface CompetencyAverage {
  structural: number;
  creative: number;
  emotional: number;
  adaptive: number;
  ethical: number;
  collab: number;
}

/** 8차원 대체율 */
export interface ReplacementDimensions {
  repetitive: number;
  cognitive: number;
  physical: number;
  creative: number;
  social: number;
  ethical: number;
  techVelocity: number;
  regulatory: number;
}

/** 직업 캐시 엔트리 */
export interface OccupationCacheEntry {
  replacement: ReplacementDimensions;
  count: number;
  avgAge: number | null;
}

/** 스킬 전환 엣지 */
export interface SkillTransitionEdge {
  from: string;
  to: string;
  similarity: number;
  sharedSkillCount: number;
}

/** 역량 벤치마크 */
export interface CompetencyBenchmark {
  occupation: string;
  sampleSize: number;
  structural: PercentileStats;
  creative: PercentileStats;
  emotional: PercentileStats;
  adaptive: PercentileStats;
  ethical: PercentileStats;
  collab: PercentileStats;
}

/** 백분위 통계 */
export interface PercentileStats {
  mean: number;
  std: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

/** 인구 분포 (한 차원) */
export interface PopulationDimension {
  totalCount: number;
  mean: number;
  std: number;
  percentiles: Record<string, number>;  // "5", "10", ..., "95" → 값
}

/** 전체 인구 분포 */
export interface PopulationDistribution {
  structural: PopulationDimension;
  creative: PopulationDimension;
  emotional: PopulationDimension;
  adaptive: PopulationDimension;
  ethical: PopulationDimension;
  collab: PopulationDimension;
}

/** 페르소나 샘플 */
export interface PersonaSample {
  occupation: string;
  age: number;
  region: string;
  sex: string;
  education: string;
  skills_summary: string;
  career_goals_summary: string;
}

/** 비교 결과 */
export interface ComparisonResult {
  percentile: number;       // 상위 N% (낮을수록 높은 위치)
  vsOccupationAvg: number;  // 직업 평균 대비 차이
  vsPopulationAvg: number;  // 전체 인구 평균 대비 차이
  rank: string;             // "상위 15%", "평균", "하위 30%" 등
}

/** 전환 경로 추천 */
export interface TransitionRecommendation {
  targetOccupation: string;
  similarity: number;
  sharedSkillCount: number;
  requiredNewSkills: string[];
  estimatedDifficulty: "낮음" | "보통" | "높음";
}

/** 연령별 대체율 곡선 데이터 포인트 */
export interface AgeCurvePoint {
  ageGroup: string;
  count: number;
  avgReplacement: number;
}
