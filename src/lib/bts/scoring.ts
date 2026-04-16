import type { UserAnswer, InsightSubScores, GradeKey } from './types'
import { INSIGHT_QUESTIONS } from './questions'

export function calculateSubScores(answers: UserAnswer[]): InsightSubScores {
  const groups: Record<string, number[]> = {
    understand: [],
    analyze: [],
    predict: [],
  }

  for (const answer of answers) {
    const question = INSIGHT_QUESTIONS.find(q => q.id === answer.questionId)
    if (!question) continue
    groups[question.subScore].push(answer.score)
  }

  return {
    understand: average(groups.understand),
    analyze: average(groups.analyze),
    predict: average(groups.predict),
  }
}

export function calculateTotalScore(sub: InsightSubScores): number {
  return Math.round((sub.understand + sub.analyze + sub.predict) / 3)
}

export function getGrade(score: number): GradeKey {
  if (score >= 85) return 'very_high'
  if (score >= 70) return 'high'
  if (score >= 50) return 'normal'
  if (score >= 30) return 'caution'
  return 'needs_work'
}

function average(arr: number[]): number {
  if (arr.length === 0) return 0
  return Math.round(arr.reduce((sum, v) => sum + v, 0) / arr.length)
}
