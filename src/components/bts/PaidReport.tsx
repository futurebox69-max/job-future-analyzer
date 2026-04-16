// src/components/bts/PaidReport.tsx
'use client'

import type { DeepReport } from '@/lib/bts/types'

interface Props {
  report: DeepReport
}

export default function PaidReport({ report }: Props) {
  return (
    <div className="space-y-8">
      {/* 1. 통찰 구조 해석 */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-3">🔍 통찰 구조 해석</h3>
        <p className="text-sm text-slate-700 leading-relaxed bg-indigo-50 rounded-xl p-5">
          {report.structureAnalysis}
        </p>
      </section>

      {/* 2. 핵심 약점 */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-3">⚠️ 핵심 약점 3가지</h3>
        <div className="space-y-3">
          {report.weaknesses.map((w, i) => (
            <div key={i} className="bg-amber-50 rounded-xl p-4 flex gap-3">
              <span className="text-amber-500 font-bold">{i + 1}</span>
              <p className="text-sm text-amber-800">{w}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 미래 위험 */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-3">🚨 미래 위험 3가지</h3>
        <div className="space-y-3">
          {report.futureRisks.map((r, i) => (
            <div key={i} className="bg-red-50 rounded-xl p-4 flex gap-3">
              <span className="text-red-500 font-bold">{i + 1}</span>
              <p className="text-sm text-red-800">{r}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 훈련 포인트 */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-3">💪 훈련 포인트 3가지</h3>
        <div className="space-y-3">
          {report.trainingPoints.map((t, i) => (
            <div key={i} className="bg-green-50 rounded-xl p-4 flex gap-3">
              <span className="text-green-500 font-bold">{i + 1}</span>
              <p className="text-sm text-green-800">{t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. 핵심 행동 제안 */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-3">🎯 오늘부터 시작하세요</h3>
        <div className="bg-indigo-600 text-white rounded-xl p-5">
          <p className="text-sm leading-relaxed">{report.actionSuggestion}</p>
        </div>
      </section>
    </div>
  )
}
