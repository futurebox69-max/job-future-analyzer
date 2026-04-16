// src/app/bts/page.tsx
'use client'

import Link from 'next/link'

export default function BtsLanding() {
  return (
    <main className="max-w-lg mx-auto px-4 py-16 text-center">
      {/* 히어로 */}
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        당신은 미래에 얼마나<br />준비된 사람입니까?
      </h1>
      <p className="text-slate-600 mb-2">
        BTS 분석은 성격을 분류하지 않습니다.
      </p>
      <p className="text-slate-600 mb-8">
        미래 변화에 대한 당신의 준비 상태를 진단합니다.
      </p>

      {/* CTA */}
      <Link
        href="/bts/profile"
        className="inline-block bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-indigo-700 transition-colors"
      >
        내 통찰력 확인하기 →
      </Link>
      <p className="text-sm text-slate-400 mt-3">3분 · 무료 · 6문항</p>

      {/* 신뢰 근거 */}
      <div className="mt-16 bg-slate-50 rounded-xl p-6 text-left">
        <h3 className="font-semibold text-slate-700 mb-3">
          이 검사는 어떻게 만들어졌나요?
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          BTS 분석의 7차원 모델은 세계경제포럼(WEF), OECD, UNESCO 등
          국제 기관이 강조한 미래 핵심 역량을 참고하여 설계한 자체 모델입니다.
          자기 보고가 아니라, 실제 상황에서의 판단과 행동을 측정합니다.
        </p>
      </div>
    </main>
  )
}
