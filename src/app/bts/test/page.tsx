// src/app/bts/test/page.tsx
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase'
import TestProgress from '@/components/bts/TestProgress'
import InsightQuestionCard from '@/components/bts/InsightQuestionCard'
import { INSIGHT_QUESTIONS } from '@/lib/bts/questions'
import type { UserAnswer, QuestionOption } from '@/lib/bts/types'

export default function BtsTestPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<UserAnswer[]>([])
  const startTimeRef = useRef(Date.now())

  // 프로필 확인
  useEffect(() => {
    const profile = sessionStorage.getItem('bts_profile')
    if (!profile || !user) {
      router.replace('/bts/profile')
    }
  }, [user, router])

  const question = INSIGHT_QUESTIONS[currentIdx]

  const handleAnswer = useCallback((opt: QuestionOption, timeSpent: number) => {
    const answer: UserAnswer = {
      questionId: question.id,
      selectedOptionId: opt.id,
      score: opt.score,
      timeSpentSeconds: timeSpent,
    }

    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)

    if (currentIdx + 1 < INSIGHT_QUESTIONS.length) {
      setCurrentIdx(prev => prev + 1)
      startTimeRef.current = Date.now()
    } else {
      // 검사 완료 → 결과 계산 API 호출
      submitTest(newAnswers)
    }
  }, [currentIdx, answers, question])

  // handleAnswer를 ref로 감싸서 TestProgress의 onTimeout이 항상 최신 핸들러를 호출하게 함
  const handleAnswerRef = useRef(handleAnswer)
  handleAnswerRef.current = handleAnswer

  const questionRef = useRef(question)
  questionRef.current = question

  const handleTimeout = useCallback(() => {
    // 시간 초과 → 0점 처리
    handleAnswerRef.current({ id: 'TIMEOUT', text: '', score: 0 }, questionRef.current.timeLimitSeconds)
  }, [])

  const submitTest = async (finalAnswers: UserAnswer[]) => {
    const profile = JSON.parse(sessionStorage.getItem('bts_profile') || '{}')

    // JWT 토큰 가져오기
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return

    const res = await fetch('/api/bts/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ answers: finalAnswers, profile }),
    })

    if (res.ok) {
      const { assessmentId } = await res.json()
      router.push(`/bts/result?id=${assessmentId}`)
    }
  }

  if (!question) return null

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <TestProgress
        current={currentIdx}
        total={INSIGHT_QUESTIONS.length}
        timeLimit={question.timeLimitSeconds}
        onTimeout={handleTimeout}
      />
      <InsightQuestionCard
        key={question.id}
        question={question}
        onAnswer={handleAnswer}
        startTime={startTimeRef.current}
      />
    </main>
  )
}
