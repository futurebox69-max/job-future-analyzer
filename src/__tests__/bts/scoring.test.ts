import { describe, it, expect } from 'vitest'
import { calculateSubScores, calculateTotalScore, getGrade } from '@/lib/bts/scoring'
import type { UserAnswer } from '@/lib/bts/types'

describe('calculateSubScores', () => {
  it('이해력 = (p1 + p2) / 2', () => {
    const answers: UserAnswer[] = [
      { questionId: 'p1', selectedOptionId: 'B', score: 100, timeSpentSeconds: 20 },
      { questionId: 'p2', selectedOptionId: 'B', score: 100, timeSpentSeconds: 25 },
      { questionId: 'p3', selectedOptionId: 'C', score: 100, timeSpentSeconds: 30 },
      { questionId: 'f1', selectedOptionId: 'B', score: 100, timeSpentSeconds: 40 },
      { questionId: 'f2', selectedOptionId: 'B', score: 100, timeSpentSeconds: 45 },
      { questionId: 'f3', selectedOptionId: 'B', score: 100, timeSpentSeconds: 50 },
    ]
    const sub = calculateSubScores(answers)
    expect(sub.understand).toBe(100)
    expect(sub.analyze).toBe(100)
    expect(sub.predict).toBe(100)
  })

  it('부분 점수 정확히 계산', () => {
    const answers: UserAnswer[] = [
      { questionId: 'p1', selectedOptionId: 'D', score: 60, timeSpentSeconds: 20 },
      { questionId: 'p2', selectedOptionId: 'B', score: 100, timeSpentSeconds: 25 },
      { questionId: 'p3', selectedOptionId: 'B', score: 60, timeSpentSeconds: 30 },
      { questionId: 'f1', selectedOptionId: 'D', score: 70, timeSpentSeconds: 40 },
      { questionId: 'f2', selectedOptionId: 'D', score: 70, timeSpentSeconds: 45 },
      { questionId: 'f3', selectedOptionId: 'D', score: 40, timeSpentSeconds: 50 },
    ]
    const sub = calculateSubScores(answers)
    expect(sub.understand).toBe(80)    // (60 + 100) / 2
    expect(sub.analyze).toBe(65)       // (60 + 70) / 2
    expect(sub.predict).toBe(55)       // (70 + 40) / 2
  })
})

describe('calculateTotalScore', () => {
  it('종합 = (이해 + 분석 + 예측) / 3, 소수점 반올림', () => {
    expect(calculateTotalScore({ understand: 81, analyze: 68, predict: 55 })).toBe(68)
  })

  it('만점 = 100', () => {
    expect(calculateTotalScore({ understand: 100, analyze: 100, predict: 100 })).toBe(100)
  })

  it('0점 = 0', () => {
    expect(calculateTotalScore({ understand: 0, analyze: 0, predict: 0 })).toBe(0)
  })
})

describe('getGrade', () => {
  it('85 이상 → very_high', () => {
    expect(getGrade(85)).toBe('very_high')
    expect(getGrade(100)).toBe('very_high')
  })

  it('70-84 → high', () => {
    expect(getGrade(70)).toBe('high')
    expect(getGrade(84)).toBe('high')
  })

  it('50-69 → normal', () => {
    expect(getGrade(50)).toBe('normal')
    expect(getGrade(69)).toBe('normal')
  })

  it('30-49 → caution', () => {
    expect(getGrade(30)).toBe('caution')
    expect(getGrade(49)).toBe('caution')
  })

  it('0-29 → needs_work', () => {
    expect(getGrade(0)).toBe('needs_work')
    expect(getGrade(29)).toBe('needs_work')
  })
})
