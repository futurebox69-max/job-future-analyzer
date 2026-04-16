import { describe, it, expect } from 'vitest'
import { classifyInsightType } from '@/lib/bts/classify'

describe('classifyInsightType', () => {
  it('세 점수 모두 70+ AND 편차 ≤ 15 → 균형 통찰형', () => {
    expect(classifyInsightType({ understand: 80, analyze: 75, predict: 72 })).toBe('균형 통찰형')
    expect(classifyInsightType({ understand: 85, analyze: 85, predict: 85 })).toBe('균형 통찰형')
  })

  it('예측력이 최고 AND 70+ AND 편차 ≥ 20 → 예측 우위형', () => {
    expect(classifyInsightType({ understand: 50, analyze: 60, predict: 80 })).toBe('예측 우위형')
  })

  it('분석력이 최고 AND 70+ AND 편차 ≥ 20 → 분석 우위형', () => {
    expect(classifyInsightType({ understand: 50, analyze: 80, predict: 55 })).toBe('분석 우위형')
  })

  it('이해력이 최고 AND 70+ AND 편차 ≥ 20 → 이해 우위형', () => {
    expect(classifyInsightType({ understand: 81, analyze: 68, predict: 55 })).toBe('이해 우위형')
  })

  it('모두 70 미만 → 성장 필요형', () => {
    expect(classifyInsightType({ understand: 40, analyze: 45, predict: 35 })).toBe('성장 필요형')
  })

  it('모두 70+ 이지만 편차 > 15 → 가장 높은 점수 기준 우위형', () => {
    expect(classifyInsightType({ understand: 70, analyze: 90, predict: 72 })).toBe('분석 우위형')
  })

  it('편차 < 20이고 70 미만 섞여 있으면 → 성장 필요형', () => {
    expect(classifyInsightType({ understand: 55, analyze: 60, predict: 50 })).toBe('성장 필요형')
  })

  it('동점일 때 예측 > 분석 > 이해 우선순위', () => {
    expect(classifyInsightType({ understand: 50, analyze: 80, predict: 80 })).toBe('예측 우위형')
  })
})
