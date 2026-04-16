// src/lib/bts/report-prompt.ts
import type { InsightResult } from './types'
import { GRADES, TYPE_EMOJI } from './constants'

/**
 * 심층 리포트 생성용 Claude 프롬프트를 구성한다.
 * 스펙: 부록 A-6
 */
export function buildReportPrompt(result: InsightResult): string {
  const gradeInfo = GRADES[result.grade]
  const emoji = TYPE_EMOJI[result.insightType]

  return `당신은 미래역량 진단 전문가입니다.
사용자의 통찰력 검사 결과를 분석하여 심층 리포트를 작성하세요.

## 사용자 프로필
- 성별: ${result.profile.gender === 'male' ? '남성' : result.profile.gender === 'female' ? '여성' : '기타'}
- 연령대: ${result.profile.ageGroup}
- 직업: ${result.profile.occupation}

## 검사 결과
- 종합: ${result.totalScore}점 (${gradeInfo.label})
- 이해력: ${result.subScores.understand}점 / 분석력: ${result.subScores.analyze}점 / 예측력: ${result.subScores.predict}점
- 유형: ${emoji} ${result.insightType}
- 응답 패턴: ${summarizeAnswers(result)}

## 리포트 작성 지침

아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.

{
  "structureAnalysis": "통찰 구조 해석 (150-200자). 왜 이런 점수 패턴이 나왔는지, 어떤 판단 습관이 이 결과를 만들었는지 구조적으로 설명.",
  "weaknesses": ["핵심 약점 1 (50-70자)", "핵심 약점 2", "핵심 약점 3"],
  "futureRisks": ["미래 위험 1 (50-70자, 프로필 맞춤)", "미래 위험 2", "미래 위험 3"],
  "trainingPoints": ["훈련 포인트 1 (구체적 행동, 50-70자)", "훈련 포인트 2", "훈련 포인트 3"],
  "actionSuggestion": "오늘부터 시작할 수 있는 1가지 행동 (80-100자)"
}

## 톤 가이드
- 2인칭 존댓말 ("당신은", "~합니다")
- 학술적이지 않고 직관적으로
- 진단은 정확하게, 제안은 따뜻하게
- 프로필(${result.profile.ageGroup} ${result.profile.occupation})에 맞는 예시 사용
- 금지: "MBTI", "성격", "유형론" 등 성향검사 용어`
}

function summarizeAnswers(result: InsightResult): string {
  return result.answers
    .map(a => `${a.questionId}: ${a.selectedOptionId}(${a.score}점, ${a.timeSpentSeconds}초)`)
    .join(', ')
}
