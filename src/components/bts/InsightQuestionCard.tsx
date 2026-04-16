// src/components/bts/InsightQuestionCard.tsx
'use client'

import { useState } from 'react'
import type { InsightQuestion, QuestionOption } from '@/lib/bts/types'

interface Props {
  question: InsightQuestion
  onAnswer: (option: QuestionOption, timeSpent: number) => void
  startTime: number  // Date.now()
}

export default function InsightQuestionCard({ question, onAnswer, startTime }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (opt: QuestionOption) => {
    if (selected) return  // 중복 선택 방지
    setSelected(opt.id)
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    // 잠깐 시각적 피드백 후 전환
    setTimeout(() => onAnswer(opt, timeSpent), 400)
  }

  return (
    <div className="space-y-6">
      {/* 상황 제시 */}
      <div className="bg-slate-50 rounded-xl p-5">
        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
          {question.prompt}
        </p>
      </div>

      {/* 질문 */}
      <p className="font-semibold text-slate-900">{question.question}</p>

      {/* 선택지 */}
      <div className="space-y-3">
        {question.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleSelect(opt)}
            disabled={selected !== null}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
              selected === opt.id
                ? 'bg-indigo-600 text-white border-indigo-600'
                : selected !== null
                  ? 'bg-slate-50 text-slate-400 border-slate-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
            }`}
          >
            <span className="font-semibold mr-2">{opt.id})</span>
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  )
}
