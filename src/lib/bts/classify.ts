import type { InsightSubScores, InsightType } from './types'

export function classifyInsightType(sub: InsightSubScores): InsightType {
  const scores = [sub.understand, sub.analyze, sub.predict]
  const maxScore = Math.max(...scores)
  const minScore = Math.min(...scores)
  const gap = maxScore - minScore

  // 우선순위 1: 균형 통찰형
  if (scores.every(s => s >= 70) && gap <= 15) {
    return '균형 통찰형'
  }

  // 우선순위 2-4: 우위형 (예측 → 분석 → 이해 순)
  const dimensions: { key: keyof InsightSubScores; type: InsightType }[] = [
    { key: 'predict',    type: '예측 우위형' },
    { key: 'analyze',    type: '분석 우위형' },
    { key: 'understand', type: '이해 우위형' },
  ]

  for (const { key, type } of dimensions) {
    if (sub[key] >= maxScore && sub[key] >= 70 && (sub[key] - minScore) >= 20) {
      return type
    }
  }

  // 우선순위 5: 성장 필요형
  return '성장 필요형'
}
