// src/app/api/bts/report/route.ts
// 상태 모델: purchase_status(결제) / report_status(리포트) 분리
// - purchase_status === 'paid' 검증 (결제 완료만 접근)
// - report_status === 'not_started' || 'generation_failed' → 생성 허용
// - report_status === 'completed' → 기존 리포트 반환
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { trackAgentCall } from '@/lib/cost-tracker'
import { createClient } from '@supabase/supabase-js'
import { buildReportPrompt } from '@/lib/bts/report-prompt'
import { calculateSubScores, calculateTotalScore, getGrade } from '@/lib/bts/scoring'
import { classifyInsightType } from '@/lib/bts/classify'
import type { InsightResult, DeepReport } from '@/lib/bts/types'

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

function getClaudeClient() {
  const apiKey = process.env.JOB_ANALYZER_API_KEY
  if (!apiKey) throw new Error('JOB_ANALYZER_API_KEY not set')
  return new Anthropic({ apiKey })
}

export async function POST(req: NextRequest) {
  const admin = getSupabaseAdmin()

  try {
    const { assessmentId, purchaseId } = await req.json()

    if (!assessmentId || !purchaseId) {
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

    // ── 구매 레코드 조회 ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: purchase } = await (admin as any)
      .from('bts_purchases')
      .select('id, user_id, assessment_id, purchase_status, report_status, report')
      .eq('id', purchaseId)
      .single()

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }
    if (purchase.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (purchase.assessment_id !== assessmentId) {
      return NextResponse.json({ error: 'Assessment mismatch' }, { status: 400 })
    }

    // ── 결제 상태 검증: paid만 허용 ──
    if (purchase.purchase_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 403 })
    }

    // ── 리포트 상태 검증 ──
    // completed → 기존 리포트 반환
    if (purchase.report_status === 'completed' && purchase.report) {
      return NextResponse.json({ report: purchase.report, reportStatus: 'completed' })
    }
    // generating → 이미 생성 중 (중복 요청 방지)
    if (purchase.report_status === 'generating') {
      return NextResponse.json({ error: 'Report is already being generated' }, { status: 409 })
    }
    // not_started 또는 generation_failed → 생성 진행
    if (purchase.report_status !== 'not_started' && purchase.report_status !== 'generation_failed') {
      return NextResponse.json({ error: 'Invalid report status' }, { status: 400 })
    }

    // ── 검사 결과 조회 (user_id 함께 검증) ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assessment } = await (admin as any)
      .from('bts_assessments')
      .select('profile, answers')
      .eq('id', assessmentId)
      .eq('user_id', user.id)
      .single()

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // ── 서버에서 점수/유형 재계산 (클라이언트 값 불신) ──
    const subScores = calculateSubScores(assessment.answers)
    const totalScore = calculateTotalScore(subScores)
    const grade = getGrade(totalScore)
    const insightType = classifyInsightType(subScores)

    const resultData: InsightResult = {
      subScores,
      totalScore,
      grade,
      insightType,
      answers: assessment.answers,
      profile: assessment.profile,
    }

    // ── 원자적 상태 전이: report_status → generating ──
    // 동시 요청 시 단 1개만 성공하도록 WHERE 조건에 현재 상태를 포함
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: transitioned } = await (admin as any)
      .from('bts_purchases')
      .update({ report_status: 'generating' })
      .eq('id', purchaseId)
      .eq('user_id', user.id)
      .in('report_status', ['not_started', 'generation_failed'])
      .select('id')

    if (!transitioned || transitioned.length === 0) {
      // 다른 요청이 이미 generating으로 전환했거나 completed됨
      return NextResponse.json({ error: 'Report is already being generated' }, { status: 409 })
    }

    let report: DeepReport
    try {
      const prompt = buildReportPrompt(resultData)
      const claude = getClaudeClient()

      const response = await claude.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''

      // JSON 파싱 (코드 블록 제거)
      let cleaned = text.trim()
      const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/s)
      if (codeBlockMatch) {
        cleaned = codeBlockMatch[1].trim()
      }
      report = JSON.parse(cleaned) as DeepReport
    } catch (genError) {
      console.error('Report generation error:', genError)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any)
        .from('bts_purchases')
        .update({ report_status: 'generation_failed' })
        .eq('id', purchaseId)
        .eq('user_id', user.id)

      return NextResponse.json({
        error: 'Report generation failed. Payment is safe — please retry.',
        reportStatus: 'generation_failed',
      }, { status: 500 })
    }

    // ── 생성 성공 → report_status: completed + report 저장 ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('bts_purchases')
      .update({ report, report_status: 'completed' })
      .eq('id', purchaseId)
      .eq('user_id', user.id)

    trackAgentCall("bts_report").catch(() => {}); // 비용 추적

    return NextResponse.json({ report, reportStatus: 'completed' })
  } catch (err) {
    console.error('Report API error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
