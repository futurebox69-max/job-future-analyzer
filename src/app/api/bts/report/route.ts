// src/app/api/bts/report/route.ts
// 규칙 1: 서버 기준 인증 사용자 검증
// 규칙 3: 결제 상태를 서버에서 검증한 사용자만 리포트 접근
// 규칙 4: pending/completed/failed 상태 구분, 실패 케이스 처리
// 규칙 5: SUPABASE_SERVICE_ROLE_KEY는 이 서버 코드 안에서만 사용
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { buildReportPrompt } from '@/lib/bts/report-prompt'
import { calculateSubScores, calculateTotalScore, getGrade } from '@/lib/bts/scoring'
import { classifyInsightType } from '@/lib/bts/classify'
import type { InsightResult, DeepReport } from '@/lib/bts/types'

// 규칙 5: lazy init, 서버 코드에서만 사용
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

    // ── 규칙 1: 서버 기준 인증 검증 ──
    // Authorization 헤더에서 Supabase JWT를 검증하여 실제 인증 사용자 확인
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.slice(7)
    const { data: { user }, error: authError } = await admin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // ── 규칙 3: 결제 상태를 서버에서 검증 ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: purchase } = await (admin as any)
      .from('bts_purchases')
      .select('id, user_id, assessment_id, status, report')
      .eq('id', purchaseId)
      .single()

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }
    // 본인 구매인지 확인
    if (purchase.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    // 결제 완료 또는 생성 실패(재시도) 상태인지 확인
    // pending = 아직 결제 안 됨, refunded = 환불됨 → 거부
    if (purchase.status !== 'completed' && purchase.status !== 'failed') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 403 })
    }
    // assessment_id 일치 확인
    if (purchase.assessment_id !== assessmentId) {
      return NextResponse.json({ error: 'Assessment mismatch' }, { status: 400 })
    }

    // 이미 리포트가 있으면 즉시 반환
    if (purchase.report) {
      return NextResponse.json({ report: purchase.report, status: 'completed' })
    }

    // ── 검사 결과 조회 ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: assessment } = await (admin as any)
      .from('bts_assessments')
      .select('profile, answers, sub_scores, total_score, grade, insight_type, user_id')
      .eq('id', assessmentId)
      .single()

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }
    // 본인 검사인지 확인
    if (assessment.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ── 규칙 2: 점수와 유형은 서버에서 다시 계산 ──
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

    // ── 규칙 4: 리포트 생성 상태 관리 ──
    // pending → generating (실패 시 failed)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('bts_purchases')
      .update({ status: 'generating' })
      .eq('id', purchaseId)

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
      // 규칙 4: 생성 실패 → failed 상태로 업데이트
      console.error('Report generation error:', genError)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any)
        .from('bts_purchases')
        .update({ status: 'failed' })
        .eq('id', purchaseId)

      return NextResponse.json({
        error: 'Report generation failed. Payment is safe — please retry.',
        status: 'failed',
      }, { status: 500 })
    }

    // 생성 성공 → completed + 리포트 저장
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('bts_purchases')
      .update({ report, status: 'completed' })
      .eq('id', purchaseId)

    return NextResponse.json({ report, status: 'completed' })
  } catch (err) {
    console.error('Report API error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
