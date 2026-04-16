// src/app/bts/report/view/page.tsx
// 규칙 1: 서버 기준 인증 — Authorization 헤더로 JWT 전송
// 규칙 3: 결제 상태를 서버에서 검증 후 리포트 접근
// 규칙 4: confirming/generating/done/error 상태 구분
'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase'
import PaidReport from '@/components/bts/PaidReport'
import type { DeepReport } from '@/lib/bts/types'

type ViewStatus = 'confirming' | 'generating' | 'done' | 'error'

function ReportViewContent() {
  const params = useSearchParams()
  const orderId = params.get('orderId')
  const paymentKey = params.get('paymentKey')
  const amount = params.get('amount')
  const { user } = useAuth()
  const [report, setReport] = useState<DeepReport | null>(null)
  const [status, setStatus] = useState<ViewStatus>('confirming')
  const [errorMsg, setErrorMsg] = useState('')
  const processedRef = useRef(false)

  useEffect(() => {
    if (!orderId || !paymentKey || !amount || !user || processedRef.current) return
    processedRef.current = true

    const processPayment = async () => {
      try {
        // 규칙 1: 서버에 JWT 토큰 전송하여 인증
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) {
          setErrorMsg('로그인이 필요합니다.')
          setStatus('error')
          return
        }

        const authHeaders = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }

        // 1. 결제 승인 (서버에서 토스 결제 확인 + DB 업데이트)
        setStatus('confirming')
        const confirmRes = await fetch('/api/bts/payment/confirm', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
        })

        if (!confirmRes.ok) {
          const err = await confirmRes.json()
          setErrorMsg(err.error || '결제 확인에 실패했습니다.')
          setStatus('error')
          return
        }
        const { purchaseId, assessmentId } = await confirmRes.json()

        // 2. 리포트 생성 (서버에서 결제 검증 후 Claude 호출)
        setStatus('generating')
        const reportRes = await fetch('/api/bts/report', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ assessmentId, purchaseId }),
        })

        if (!reportRes.ok) {
          const err = await reportRes.json()
          // 규칙 4: 실패 시 재시도 안내 (결제는 이미 완료)
          setErrorMsg(err.error || '리포트 생성에 실패했습니다.')
          setStatus('error')
          return
        }
        const { report: generatedReport } = await reportRes.json()

        setReport(generatedReport)
        setStatus('done')
      } catch (err) {
        console.error(err)
        setErrorMsg('처리 중 오류가 발생했습니다.')
        setStatus('error')
      }
    }

    processPayment()
  }, [orderId, paymentKey, amount, user])

  // 리포트 생성 실패 시 재시도
  const handleRetry = async () => {
    if (!user) return
    setStatus('generating')
    setErrorMsg('')

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) {
        setErrorMsg('로그인이 필요합니다.')
        setStatus('error')
        return
      }

      // orderId로 purchase 정보 다시 조회
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: purchase } = await (supabase as any)
        .from('bts_purchases')
        .select('id, assessment_id')
        .eq('order_id', orderId)
        .single()

      if (!purchase) {
        setErrorMsg('주문 정보를 찾을 수 없습니다.')
        setStatus('error')
        return
      }

      const reportRes = await fetch('/api/bts/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          assessmentId: purchase.assessment_id,
          purchaseId: purchase.id,
        }),
      })

      if (!reportRes.ok) {
        const err = await reportRes.json()
        setErrorMsg(err.error || '리포트 생성에 실패했습니다.')
        setStatus('error')
        return
      }

      const { report: generatedReport } = await reportRes.json()
      setReport(generatedReport)
      setStatus('done')
    } catch {
      setErrorMsg('다시 시도 중 오류가 발생했습니다.')
      setStatus('error')
    }
  }

  if (status === 'confirming') {
    return (
      <div className="text-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4" />
        <p className="text-slate-500">결제를 확인하고 있습니다...</p>
      </div>
    )
  }

  if (status === 'generating') {
    return (
      <div className="text-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4" />
        <p className="text-slate-500">AI가 당신만을 위한 심층 리포트를 작성하고 있습니다...</p>
        <p className="text-xs text-slate-400 mt-2">약 10~20초 소요</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="text-center py-16 max-w-md mx-auto px-4">
        <p className="text-red-500 font-semibold mb-2">오류가 발생했습니다</p>
        <p className="text-sm text-slate-500 mb-6">{errorMsg}</p>
        <p className="text-xs text-slate-400 mb-4">결제는 정상 처리되었습니다. 리포트 생성만 다시 시도합니다.</p>
        <button
          onClick={handleRetry}
          className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          리포트 다시 생성
        </button>
      </div>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <p className="text-green-500 text-2xl mb-2">✅</p>
        <h2 className="text-xl font-bold text-slate-900">통찰력 심층 리포트</h2>
        <p className="text-sm text-slate-400 mt-1">결제 완료</p>
      </div>

      {report && <PaidReport report={report} />}

      {/* 90일 플랜 업셀 (Phase 1.5 예고) */}
      <div className="mt-12 bg-slate-50 rounded-xl p-6 text-center">
        <p className="text-sm text-slate-500">
          이제 무엇이 약한지 알았습니다. 다음 단계는 바꾸는 것입니다.
        </p>
        <p className="text-xs text-slate-400 mt-2">
          90일 통찰력 강화 플랜 · 곧 출시 예정
        </p>
      </div>
    </main>
  )
}

export default function BtsReportViewPage() {
  return (
    <Suspense fallback={<div className="text-center py-16"><p className="text-slate-400">로딩 중...</p></div>}>
      <ReportViewContent />
    </Suspense>
  )
}
