// src/lib/bts/constants.ts
import type { GradeKey } from './types'

/** 등급 기준 (백분위 표현 없음) */
export const GRADES: Record<GradeKey, { min: number; max: number; label: string; display: string }> = {
  very_high: { min: 85, max: 100, label: '매우 높음', display: '통찰력이 매우 높습니다' },
  high:      { min: 70, max: 84,  label: '높음',     display: '통찰력이 높은 편입니다' },
  normal:    { min: 50, max: 69,  label: '보통',     display: '보통 수준입니다' },
  caution:   { min: 30, max: 49,  label: '주의 필요', display: '보완이 필요한 영역이 있습니다' },
  needs_work:{ min: 0,  max: 29,  label: '보완 필요', display: '집중적인 보완이 필요합니다' },
}

/** 유형별 이모지 */
export const TYPE_EMOJI: Record<string, string> = {
  '균형 통찰형': '🧠',
  '예측 우위형': '🔮',
  '분석 우위형': '🔍',
  '이해 우위형': '📖',
  '성장 필요형': '🌱',
}

/** 가격 */
export const PRICES = {
  DEEP_REPORT: 12_900,
  NINETY_DAY_PLAN: 29_000,  // Phase 1.5
} as const

/** 검사 설정 */
export const TEST_CONFIG = {
  PATTERN_TIME_LIMIT: 45,
  PREDICTION_TIME_LIMIT: 60,
  TOTAL_QUESTIONS: 6,
} as const
