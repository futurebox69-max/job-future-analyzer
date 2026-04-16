// src/components/bts/LockedPreview.tsx
'use client'

import Link from 'next/link'

interface Props {
  assessmentId: string
}

export default function LockedPreview({ assessmentId }: Props) {
  return (
    <div className="mt-8 relative">
      {/* 블러 잠금 영역 */}
      <div className="bg-slate-50 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-white/60 z-10 flex flex-col items-center justify-center">
          <span className="text-2xl mb-2">🔒</span>
          <p className="text-sm font-semibold text-slate-700">심층 해석 잠김</p>
        </div>
        <div className="space-y-3 text-sm text-slate-400">
          <p>• 당신의 예측력이 낮은 이유는...</p>
          <p>• 이 구조가 미래에 만들 수 있는 위험 3가지...</p>
          <p>• 지금 당장 시작할 수 있는 훈련 방향...</p>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/bts/report?id=${assessmentId}`}
        className="block mt-4 w-full text-center bg-indigo-600 text-white font-semibold py-4 rounded-xl hover:bg-indigo-700 transition-colors"
      >
        왜 이런 결과가 나왔는지 알아보기 → 12,900원
      </Link>
    </div>
  )
}
