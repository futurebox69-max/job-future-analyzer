// src/app/api/bts/payment/confirm/route.ts
// 상태 모델: purchase_status(결제) / report_status(리포트) 분리
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PRICES } from '@/lib/bts/constants'

let _admin: ReturnType<typeof createClient> | null = null
function getSupabaseAdmin() {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
  }
  return _admin
}

export async function POST(req: NextRequest) {
  const admin = getSupabaseAdmin()

  try {
    const { paymentKey, orderId, amount } = await req.json()

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ── 서버 기준 인증 ──
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.slice(7)
    const { data: { user }, error: authError } = await admin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // 금액 검증
    if (amount !== PRICES.DEEP_REPORT) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // ── 주문 레코드 확인: 본인 + pending ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: purchase } = await (admin as any)
      .from('bts_purchases')
      .select('id, user_id, assessment_id, purchase_status')
      .eq('order_id', orderId)
      .single()

    if (!purchase) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (purchase.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (purchase.purchase_status !== 'pending') {
      // 이미 처리된 주문 (paid/payment_failed/refunded)
      return NextResponse.json({
        success: purchase.purchase_status === 'paid',
        purchaseId: purchase.id,
        assessmentId: purchase.assessment_id,
        alreadyProcessed: true,
      })
    }

    // ── 토스페이먼츠 결제 승인 ──
    const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    })

    if (!tossRes.ok) {
      const errData = await tossRes.json()
      console.error('Toss confirm error:', errData)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any)
        .from('bts_purchases')
        .update({ purchase_status: 'payment_failed' })
        .eq('order_id', orderId)
        .eq('user_id', user.id)

      return NextResponse.json({ error: errData.message || 'Payment failed' }, { status: 400 })
    }

    // ── 결제 성공 → purchase_status: paid (report_status는 not_started 유지) ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('bts_purchases')
      .update({ purchase_status: 'paid', payment_key: paymentKey })
      .eq('order_id', orderId)
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      purchaseId: purchase.id,
      assessmentId: purchase.assessment_id,
    })
  } catch (err) {
    console.error('Payment confirm error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
