// src/app/bts/report/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase'
import { PRICES } from '@/lib/bts/constants'

function ReportIntroContent() {
  const params = useSearchParams()
  const assessmentId = params.get('id')
  const paymentError = params.get('error')
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    if (!user || !assessmentId) return
    setLoading(true)

    try {
      // 1. 주문 레코드 생성 (클라이언트의 anon key로 — RLS INSERT 정책 허용)
      const orderId = `BTS-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const supabase = createClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any).from('bts_purchases').insert({
        user_id: user.id,
        assessment_id: assessmentId,
        product_type: 'deep_report',
        amount: PRICES.DEEP_REPORT,
        order_id: orderId,
        status: 'pending',
      })

      if (insertError) {
        console.error('Order creation error:', insertError)
        setLoading(false)
        return
      }

      // 2. 토스페이먼츠 결제창 호출
      const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk')
      const toss = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!)

      const payment = toss.payment({ customerKey: user.id })

      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: PRICES.DEEP_REPORT },
        orderId,
        orderName: '통찰력 심층 리포트',
        successUrl: `${window.location.origin}/bts/report/view?orderId=${orderId}`,
        failUrl: `${window.location.origin}/bts/report?id=${assessmentId}&error=payment_failed`,
      })
    } catch (err) {
      console.error('Payment error:', err)
      setLoading(false)
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">
        통찰력 심층 리포트
      </h2>

      {/* 결제 실패 안내 */}
      {paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-red-700">결제가 완료되지 않았습니다. 다시 시도해주세요.</p>
        </div>
      )}

      {/* 포함 항목 */}
      <div className="space-y-3 mb-8">
        {[
          '통찰 구조 해석 — 왜 이런 결과가 나왔는지',
          '핵심 약점 3가지 — 구체적 일상 예시 포함',
          '미래 위험 3가지 — 직업·연령 맞춤',
          '훈련 포인트 3가지 — 바로 실행 가능',
          '핵심 행동 제안 — 오늘부터 시작',
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-lg p-3">
            <span className="text-green-500 mt-0.5">✓</span>
            <p className="text-sm text-slate-700">{item}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
        <p className="text-sm text-slate-500 mb-2">통찰력 심층 리포트</p>
        <p className="text-3xl font-bold text-indigo-600 mb-1">12,900원</p>
        <p className="text-xs text-slate-400 mb-6">결제 즉시 확인 가능</p>

        <button
          onClick={handlePayment}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
            loading ? 'bg-slate-300 text-slate-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {loading ? '처리 중...' : '심층 리포트 받기'}
        </button>
      </div>

      <p className="text-xs text-slate-400 text-center mt-4">
        점수만으로는 바뀌지 않습니다. 왜 이런 결과가 나왔는지, 뭘 먼저 바꿔야 하는지까지.
      </p>
    </main>
  )
}

export default function BtsReportPage() {
  return (
    <Suspense fallback={<p className="text-center text-slate-400 py-16">로딩 중...</p>}>
      <ReportIntroContent />
    </Suspense>
  )
}
