import { describe, it, expect } from 'vitest'
import { getResultCopy } from '@/lib/bts/copy'

describe('getResultCopy', () => {
  it('이해 우위형 카피 반환', () => {
    const copy = getResultCopy('이해 우위형')
    expect(copy.subtitle).toContain('정보는 빠르게 파악')
    expect(copy.strength).toBeTruthy()
    expect(copy.caution).toBeTruthy()
    expect(copy.punchline).toBeTruthy()
  })

  it('5유형 모두 카피가 존재', () => {
    const types = ['균형 통찰형', '예측 우위형', '분석 우위형', '이해 우위형', '성장 필요형'] as const
    for (const t of types) {
      const copy = getResultCopy(t)
      expect(copy.subtitle.length).toBeGreaterThan(0)
      expect(copy.strength.length).toBeGreaterThan(0)
      expect(copy.caution.length).toBeGreaterThan(0)
      expect(copy.punchline.length).toBeGreaterThan(0)
    }
  })
})
