// src/lib/bts/types.ts

/** 통찰력 하위 점수 */
export interface InsightSubScores {
  understand: number  // 이해력 0-100
  analyze: number     // 분석력 0-100
  predict: number     // 예측력 0-100
}

/** 통찰력 전용 5유형 */
export type InsightType =
  | '균형 통찰형'
  | '예측 우위형'
  | '분석 우위형'
  | '이해 우위형'
  | '성장 필요형'

/** 등급 */
export type GradeKey = 'very_high' | 'high' | 'normal' | 'caution' | 'needs_work'

/** 사용자 프로필 */
export interface BtsProfile {
  gender: 'male' | 'female' | 'other'
  ageGroup: '10s' | '20s' | '30s' | '40s' | '50s' | '60plus'
  occupation: string
}

/** 문항 선택지 */
export interface QuestionOption {
  id: string       // 'A' | 'B' | 'C' | 'D'
  text: string
  score: number    // 0, 40, 60, 70, 100
}

/** 문항 */
export interface InsightQuestion {
  id: string                         // 'p1', 'p2', 'p3', 'f1', 'f2', 'f3'
  type: 'pattern' | 'prediction'
  subScore: 'understand' | 'analyze' | 'predict'
  prompt: string                     // 상황 제시
  question: string                   // 질문
  options: QuestionOption[]
  timeLimitSeconds: number           // 45 or 60
}

/** 사용자 응답 */
export interface UserAnswer {
  questionId: string
  selectedOptionId: string
  score: number
  timeSpentSeconds: number
}

/** 검사 결과 */
export interface InsightResult {
  subScores: InsightSubScores
  totalScore: number
  grade: GradeKey
  insightType: InsightType
  answers: UserAnswer[]
  profile: BtsProfile
}

/** 심층 리포트 */
export interface DeepReport {
  structureAnalysis: string    // 통찰 구조 해석
  weaknesses: string[]         // 핵심 약점 3개
  futureRisks: string[]        // 미래 위험 3개
  trainingPoints: string[]     // 훈련 포인트 3개
  actionSuggestion: string     // 핵심 행동 제안
}

/** DB 저장용 검사 기록 */
export interface AssessmentRecord {
  id?: string
  user_id: string
  profile: BtsProfile
  sub_scores: InsightSubScores
  total_score: number
  grade: GradeKey
  insight_type: InsightType
  answers: UserAnswer[]
  created_at?: string
}

/** 결제 상태 (결제 처리만 추적) */
export type PurchaseStatus = 'pending' | 'paid' | 'payment_failed' | 'refunded'

/** 리포트 생성 상태 (리포트 생성만 추적) */
export type ReportStatus = 'not_started' | 'generating' | 'completed' | 'generation_failed'

/** DB 저장용 구매 기록 */
export interface PurchaseRecord {
  id?: string
  user_id: string
  assessment_id: string
  product_type: 'deep_report'
  amount: number
  payment_key: string
  purchase_status: PurchaseStatus
  report_status: ReportStatus
  created_at?: string
}
