import { z } from "zod";

// 8차원 각 항목 스키마
export const DimensionSchema = z.object({
  score: z.number().min(0).max(100),
  label: z.string(),
  description: z.string(),
  icon: z.string(),
});

// 빙산 모델 4층 스키마
export const IcebergLayerSchema = z.object({
  level: z.number().min(1).max(4),
  title: z.string(),
  content: z.string(),
  depth: z.enum(["surface", "shallow", "deep", "root"]),
});

// 전환 경로 카드 스키마
export const TransitionCardSchema = z.object({
  type: z.enum(["전직", "이직", "창직"]),
  title: z.string(),
  description: z.string(),
  examples: z.array(z.string()).max(4),
  difficulty: z.enum(["낮음", "보통", "높음"]),
  timeframe: z.string(), // "6개월~1년" 등
  keySkills: z.array(z.string()).max(4),
});

// 시간 지평선 분석
export const TimeHorizonSchema = z.object({
  current: z.number().min(0).max(100),
  year3: z.number().min(0).max(100),
  year5: z.number().min(0).max(100),
  year10: z.number().min(0).max(100),
  narrative: z.string(), // 변화 스토리 한 문단
});

// 스킬 갭 분석
export const SkillGapSchema = z.object({
  keepSkills: z.array(z.string()).max(5),   // AI가 대체 못하는 스킬
  loseSkills: z.array(z.string()).max(5),   // 빠르게 사라질 스킬
  gainSkills: z.array(z.string()).max(5),   // 반드시 익혀야 할 스킬
  urgency: z.enum(["즉시", "1년 내", "3년 내"]),
});

// 소득 영향 예측
export const IncomeImpactSchema = z.object({
  shortTerm: z.string(), // 1~3년
  midTerm: z.string(),   // 3~7년
  longTerm: z.string(),  // 7년 이상
  recommendation: z.string(), // 핵심 행동 권고
});

// 업종별 세부 맥락
export const IndustryContextSchema = z.object({
  largeEnterprise: z.string(),  // 대기업에서의 상황
  sme: z.string(),              // 중소기업에서의 상황
  freelance: z.string(),        // 프리랜서/개인사업자
  globalTrend: z.string(),      // 글로벌 동향
});

// 전체 분석 결과 스키마
export const AnalysisResultSchema = z.object({
  jobName: z.string(),
  overallRate: z.number().min(0).max(100),
  riskLevel: z.enum(["안전", "주의", "위험", "매우위험"]),
  dimensions: z.object({
    repetitive: DimensionSchema,
    cognitive: DimensionSchema,
    physical: DimensionSchema,
    creative: DimensionSchema,
    social: DimensionSchema,
    ethical: DimensionSchema,
    techVelocity: DimensionSchema,   // 기술 변화 속도 (NEW)
    regulatory: DimensionSchema,     // 제도적 보호막 (NEW, 역방향: 높을수록 안전)
  }),
  iceberg: z.array(IcebergLayerSchema).length(4),
  transitions: z.array(TransitionCardSchema).min(1).max(3),
  timeHorizon: TimeHorizonSchema,
  skillGap: SkillGapSchema,
  incomeImpact: IncomeImpactSchema,
  industryContext: IndustryContextSchema,
  summary: z.string(),
  consultingNote: z.string(), // 상담/강의용 핵심 인사이트 (300자)
  mode: z.enum(["adult", "youth"]),
});

// TypeScript 타입 추출
export type Dimension = z.infer<typeof DimensionSchema>;
export type IcebergLayer = z.infer<typeof IcebergLayerSchema>;
export type TransitionCard = z.infer<typeof TransitionCardSchema>;
export type TimeHorizon = z.infer<typeof TimeHorizonSchema>;
export type SkillGap = z.infer<typeof SkillGapSchema>;
export type IncomeImpact = z.infer<typeof IncomeImpactSchema>;
export type IndustryContext = z.infer<typeof IndustryContextSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

// 8차원 가중치
export const DIMENSION_WEIGHTS = {
  repetitive: 0.20,   // 반복적 업무 자동화 20%
  cognitive: 0.18,    // 인지적 판단 대체 18%
  physical: 0.10,     // 신체적 작업 로봇화 10%
  creative: 0.12,     // 창의성/감성 영역 12%
  social: 0.12,       // 대인관계/소통 12%
  ethical: 0.08,      // 윤리적/법적 판단 8%
  techVelocity: 0.12, // 기술 변화 속도 12%
  regulatory: -0.08,  // 제도적 보호막 8% (역방향: 높을수록 점수 감소)
} as const;

// 리스크 레벨 계산 함수
export function getRiskLevel(rate: number): AnalysisResult["riskLevel"] {
  if (rate < 30) return "안전";
  if (rate < 55) return "주의";
  if (rate < 75) return "위험";
  return "매우위험";
}

// API 요청 타입
export interface AnalyzeRequest {
  job: string;
  mode: "adult" | "youth";
}

// API 응답 타입
export interface AnalyzeResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}
