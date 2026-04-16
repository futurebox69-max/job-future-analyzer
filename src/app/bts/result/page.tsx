// src/app/bts/result/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import FreeResult from '@/components/bts/FreeResult'
import LockedPreview from '@/components/bts/LockedPreview'
import type { InsightSubScores, InsightType, GradeKey } from '@/lib/bts/types'

interface ResultData {
  total_score: number
  grade: GradeKey
  sub_scores: InsightSubScores
  insight_type: InsightType
}

function ResultContent() {
  const params = useSearchParams()
  const id = params.get('id')
  const [data, setData] = useState<ResultData | null>(null)

  useEffect(() => {
    if (!id) return
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any)
      .from('bts_assessments')
      .select('total_score, grade, sub_scores, insight_type')
      .eq('id', id)
      .single()
      .then(({ data }: { data: ResultData | null }) => {
        if (data) setData(data)
      })
  }, [id])

  if (!data) {
    return <p className="text-center text-slate-400 py-16">결과를 불러오는 중...</p>
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-xl font-bold text-center text-slate-900 mb-8">
        당신의 통찰력 진단 결과
      </h2>

      <FreeResult
        totalScore={data.total_score}
        grade={data.grade}
        subScores={data.sub_scores}
        insightType={data.insight_type}
      />

      <LockedPreview assessmentId={id!} />
    </main>
  )
}

export default function BtsResultPage() {
  return (
    <Suspense fallback={<p className="text-center text-slate-400 py-16">로딩 중...</p>}>
      <ResultContent />
    </Suspense>
  )
}
