// src/components/bts/FreeResult.tsx
'use client'

import type { InsightSubScores, InsightType, GradeKey } from '@/lib/bts/types'
import { GRADES, TYPE_EMOJI } from '@/lib/bts/constants'
import { getResultCopy } from '@/lib/bts/copy'

interface Props {
  totalScore: number
  grade: GradeKey
  subScores: InsightSubScores
  insightType: InsightType
}

export default function FreeResult({ totalScore, grade, subScores, insightType }: Props) {
  const gradeInfo = GRADES[grade]
  const emoji = TYPE_EMOJI[insightType]
  const copy = getResultCopy(insightType)

  return (
    <div className="space-y-6">
      {/* 종합 점수 */}
      <div className="text-center">
        <p className="text-5xl font-bold text-indigo-600">{totalScore}점</p>
        <p className="text-lg text-slate-500 mt-1">{gradeInfo.label}</p>
      </div>

      {/* 유형 */}
      <div className="bg-indigo-50 rounded-xl p-5 text-center">
        <p className="text-2xl mb-2">{emoji} <span className="font-bold">{insightType}</span></p>
        <p className="text-sm text-slate-600">{copy.subtitle}</p>
      </div>

      {/* 하위 점수 */}
      <div className="flex justify-between px-4">
        {[
          { label: '이해력', value: subScores.understand },
          { label: '분석력', value: subScores.analyze },
          { label: '예측력', value: subScores.predict },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-sm text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* 강점/주의 */}
      <div className="space-y-4">
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-800 mb-1">강점</p>
          <p className="text-sm text-green-700">{copy.strength}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-800 mb-1">주의</p>
          <p className="text-sm text-amber-700">{copy.caution}</p>
        </div>
      </div>

      {/* 핵심 한마디 */}
      <div className="text-center py-4">
        <p className="text-lg font-semibold text-slate-800">{copy.punchline}</p>
      </div>
    </div>
  )
}
