// src/app/api/bts/submit/route.ts
// Import 규칙: 서버(API route)에서는 @supabase/supabase-js 직접 import + 서비스 키
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calculateSubScores, calculateTotalScore, getGrade } from '@/lib/bts/scoring'
import { classifyInsightType } from '@/lib/bts/classify'
import type { UserAnswer, BtsProfile } from '@/lib/bts/types'

// 빌드 타임에 env가 없을 수 있으므로 lazy init
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
    // ── 서버 기준 인증 (JWT) ──
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.slice(7)
    const { data: { user }, error: authError } = await admin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await req.json()
    const { answers, profile } = body as {
      answers: UserAnswer[]
      profile: BtsProfile
    }

    // 점수 계산
    const subScores = calculateSubScores(answers)
    const totalScore = calculateTotalScore(subScores)
    const grade = getGrade(totalScore)
    const insightType = classifyInsightType(subScores)

    // DB 저장 (서비스 역할로, authenticated user.id 강제)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin as any)
      .from('bts_assessments')
      .insert({
        user_id: user.id,
        profile,
        sub_scores: subScores,
        total_score: totalScore,
        grade,
        insight_type: insightType,
        answers,
      })
      .select('id')
      .single()

    if (error) {
      console.error('DB insert error:', error)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json({
      assessmentId: (data as any).id,
      subScores,
      totalScore,
      grade,
      insightType,
    })
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
