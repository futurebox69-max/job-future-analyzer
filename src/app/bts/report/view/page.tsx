// src/app/bts/report/view/page.tsx
// 두 가지 진입 경로:
// 1. 토스 결제 성공 리다이렉트: ?orderId=...&paymentKey=...&amount=...
// 2. 기존 결제 완료 후 리포트 접근: ?purchaseId=...&assessmentId=...
'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import PaidReport from '@/components/bts/PaidReport'
import type { DeepReport } from '@/lib/bts/types'

type ViewStatus = 'confirming' | 'generating' | 'done' | 'error'

function ReportViewContent() {
  const params = useSearchParams()
  // 진입 경로 1: 토스 결제 성공 리다이렉트
  const orderId = params.get('orderId')
  const paymentKey = params.get('paymentKey')
  const amount = params.get('amount')
  // 진입 경로 2: 기존 결제 완료 후 접근
  const directPurchaseId = params.get('purchaseId')
  const directAssessmentId = params.get('assessmentId')
  const needsGeneration = params.get('needsGeneration')

  const { user, session } = useAuth()
  const [report, setReport] = useState<DeepReport | null>(null)
  const [status, setStatus] = useState<ViewStatus>('confirming')
  const [errorMsg, setErrorMsg] = useState('')
  const [retryInfo, setRetryInfo] = useState<{ purchaseId: string; assessmentId: string } | null>(null)
  const processedRef = useRef(false)

  // 리포트 생성 요청 헬퍼
  // 409 = 이미 생성 중 → 자동 재조회 (3초 후)
  const requestReport = async (purchaseId: string, assessmentId: string, token: string) => {
    setStatus('generating')
    const reportRes = await fetch('/api/bts/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ assessmentId, purchaseId }),
    })

    if (reportRes.status === 409) {
      await pollForReport(purchaseId, assessmentId, token)
      return
    }

    if (!reportRes.ok) {
      const err = await reportRes.json()
      throw new Error(err.error || '리포트 생성에 실패했습니다.')
    }

    const data = await reportRes.json()
    setReport(data.report)
    setStatus('done')
  }

  // 생성 중인 리포트를 폴링으로 기다리는 헬퍼
  const pollForReport = async (purchaseId: string, assessmentId: string, token: string) => {
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 3000))

      const res = await fetch('/api/bts/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ assessmentId, purchaseId }),
      })

      if (res.status === 409) continue

      if (res.ok) {
        const data = await res.json()
        if (data.report) {
          setReport(data.report)
          setStatus('done')
          return
        }
      }

      const err = await res.json().catch(() => ({ error: '리포트 생성에 실패했습니다.' }))
      throw new Error(err.error || '리포트 생성에 실패했습니다.')
    }
    throw new Error('리포트 생성 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.')
  }

  useEffect(() => {
    if (!user || processedRef.current) return
    processedRef.current = true

    const process = async () => {
      try {
        const token = session?.access_token ?? null
        if (!token) {
          setErrorMsg('로그인이 필요합니다.')
          setStatus('error')
          return
        }

        // ── 진입 경로 2: 기존 결제 완료 (중복 결제 방지에서 리다이렉트됨) ──
        if (directPurchaseId && directAssessmentId) {
          setRetryInfo({ purchaseId: directPurchaseId, assessmentId: directAssessmentId })

          if (needsGeneration) {
            await requestReport(directPurchaseId, directAssessmentId, token)
          } else {
            setStatus('generating')
            const reportRes = await fetch('/api/bts/report', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                assessmentId: directAssessmentId,
                purchaseId: directPurchaseId,
              }),
            })
            if (!reportRes.ok) throw new Error('리포트를 불러올 수 없습니다.')
            const { report } = await reportRes.json()
            setReport(report)
            setStatus('done')
          }
          return
        }

        // ── 진입 경로 1: 토스 결제 성공 리다이렉트 ──
        if (!orderId || !paymentKey || !amount) {
          setErrorMsg('필수 결제 정보가 없습니다.')
          setStatus('error')
          return
        }

        // 1. 결제 승인
        setStatus('confirming')
        const confirmRes = await fetch('/api/bts/payment/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
        })

        if (!confirmRes.ok) {
          const err = await confirmRes.json()
          setErrorMsg(err.error || '결제 확인에 실패했습니다.')
          setStatus('error')
          return
        }
        const { purchaseId, assessmentId } = await confirmRes.json()
        setRetryInfo({ purchaseId, assessmentId })

        // 2. 리포트 생성
        await requestReport(purchaseId, assessmentId, token)
      } catch (err) {
        console.error(err)
        setErrorMsg(err instanceof Error ? err.message : '처리 중 오류가 발생했습니다.')
        setStatus('error')
      }
    }

    process()
  }, [user, session, orderId, paymentKey, amount, directPurchaseId, directAssessmentId, needsGeneration])

  // 리포트 생성 재시도
  const handleRetry = async () => {
    if (!retryInfo) return
    setStatus('generating')
    setErrorMsg('')

    try {
      const token = session?.access_token ?? null
      if (!token) {
        setErrorMsg('로그인이 필요합니다.')
        setStatus('error')
        return
      }
      await requestReport(retryInfo.purchaseId, retryInfo.assessmentId, token)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '다시 시도 중 오류가 발생했습니다.')
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
        {retryInfo && (
          <>
            <p className="text-xs text-slate-400 mb-4">결제는 정상 처리되었습니다. 리포트 생성만 다시 시도합니다.</p>
            <button
              onClick={handleRetry}
              className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              리포트 다시 생성
            </button>
          </>
        )}
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
