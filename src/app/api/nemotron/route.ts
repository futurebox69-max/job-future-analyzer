// src/app/api/nemotron/route.ts
// Nemotron 데이터 API — 모든 18개 기능의 서버사이드 엔드포인트

import { NextRequest, NextResponse } from 'next/server';
import {
  isNemotronDataAvailable,
  getCachedReplacement,
  getOccupationProfile,
  getCachedOccupationList,
  getAllPercentileRanks,
  compareWithOccupation,
  getSimilarPeopleInsight,
  getTransitionRecommendations,
  analyzeTransitionFeasibility,
  getRegionalRiskMap,
  getRegionProfile,
  getAgeCurveForOccupation,
  enrichPromptWithNemotron,
  simulateAssessmentDistribution,
  verifyTypeBalance,
  checkQuestionDifficulty,
  getGenerationalTrends,
  getOccupationRankings,
  getOnboardingRecommendation,
  getContentRecommendations,
  validateMarketSegment,
  generateB2BDemo,
  getBenchmarkPersonas,
  getPrivacySafetyInfo,
} from '@/lib/nemotron';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  // 데이터 사용 가능 확인
  const available = await isNemotronDataAvailable();
  if (!available && action !== 'status') {
    return NextResponse.json({
      success: false,
      error: 'Nemotron 데이터가 아직 준비되지 않았습니다. process-dataset.py를 먼저 실행하세요.',
    }, { status: 503 });
  }

  try {
    switch (action) {
      // ── 상태 확인 ──
      case 'status':
        return NextResponse.json({
          success: true,
          available,
          privacy: getPrivacySafetyInfo(),
        });

      // ── #4: 직업 대체율 캐시 ──
      case 'cached-replacement': {
        const job = searchParams.get('job');
        if (!job) return missingParam('job');
        const result = await getCachedReplacement(job);
        return NextResponse.json({ success: true, data: result });
      }

      // ── 직업 프로파일 ──
      case 'occupation-profile': {
        const job = searchParams.get('job');
        if (!job) return missingParam('job');
        const result = await getOccupationProfile(job);
        return NextResponse.json({ success: true, data: result });
      }

      // ── 직업 목록 (자동완성) ──
      case 'occupation-list': {
        const list = await getCachedOccupationList();
        return NextResponse.json({ success: true, data: list });
      }

      // ── #14: 백분위 ──
      case 'percentile': {
        const scoresParam = searchParams.get('scores');
        if (!scoresParam) return missingParam('scores');
        const scores = JSON.parse(scoresParam);
        const result = await getAllPercentileRanks(scores);
        return NextResponse.json({ success: true, data: result });
      }

      // ── #5: 직업 비교 ──
      case 'compare': {
        const job = searchParams.get('job');
        const scoresParam = searchParams.get('scores');
        if (!job || !scoresParam) return missingParam('job, scores');
        const scores = JSON.parse(scoresParam);
        const result = await compareWithOccupation(job, scores);
        return NextResponse.json({ success: true, data: result });
      }

      // ── #5: 비슷한 사람들 ──
      case 'similar-people': {
        const job = searchParams.get('job');
        if (!job) return missingParam('job');
        const result = await getSimilarPeopleInsight(job);
        return NextResponse.json({ success: true, data: result });
      }

      // ── #6: 전환 경로 ──
      case 'transitions': {
        const job = searchParams.get('job');
        if (!job) return missingParam('job');
        const limit = parseInt(searchParams.get('limit') || '10');
        const result = await getTransitionRecommendations(job, limit);
        return NextResponse.json({ success: true, data: result });
      }

      // ── #6: 전환 가능성 분석 ──
      case 'transition-feasibility': {
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        if (!from || !to) return missingParam('from, to');
        const result = await analyzeTransitionFeasibility(from, to);
        return NextResponse.json({ success: true, data: result });
      }

      // ── #8: 연령별 곡선 ──
      case 'age-curve': {
        const job = searchParams.get('job');
        if (!job) return missingParam('job');
        const result = await getAgeCurveForOccupation(job);
        return NextResponse.json({ success: true, data: result });
      }

      // ── #9: 지역별 리스크 맵 ──
      case 'region-map': {
        const region = searchParams.get('region');
        if (region) {
          const result = await getRegionProfile(region);
          return NextResponse.json({ success: true, data: result });
        }
        const result = await getRegionalRiskMap();
        return NextResponse.json({ success: true, data: result });
      }

      // ── #7: 프롬프트 정교화 ──
      case 'prompt-context': {
        const job = searchParams.get('job');
        if (!job) return missingParam('job');
        const context = await enrichPromptWithNemotron(job);
        return NextResponse.json({ success: true, data: { context } });
      }

      // ── #10: 시뮬레이션 ──
      case 'simulate': {
        const size = parseInt(searchParams.get('size') || '1000');
        const result = await simulateAssessmentDistribution(size);
        return NextResponse.json({ success: true, data: result });
      }

      // ── #11: 유형 균형 ──
      case 'type-balance': {
        const result = await verifyTypeBalance();
        return NextResponse.json({ success: true, data: result });
      }

      // ── #13: 문항 난이도 ──
      case 'question-difficulty': {
        const result = await checkQuestionDifficulty();
        return NextResponse.json({ success: true, data: result });
      }

      // ── #15: 세대별 트렌드 ──
      case 'generational-trends': {
        const result = await getGenerationalTrends();
        return NextResponse.json({ success: true, data: result });
      }

      // ── #12: 직업별 랭킹 ──
      case 'rankings': {
        const dim = searchParams.get('dimension') || 'structural';
        const result = await getOccupationRankings(dim as any);
        return NextResponse.json({ success: true, data: result });
      }

      // ── #1: 온보딩 ──
      case 'onboarding': {
        const job = searchParams.get('job');
        if (!job) return missingParam('job');
        const result = await getOnboardingRecommendation(job);
        return NextResponse.json({ success: true, data: result });
      }

      // ── #2: 콘텐츠 추천 ──
      case 'content': {
        const job = searchParams.get('job');
        if (!job) return missingParam('job');
        const result = await getContentRecommendations(job);
        return NextResponse.json({ success: true, data: result });
      }

      // ── #3: 마케팅 세그먼트 ──
      case 'segment': {
        const result = await validateMarketSegment();
        return NextResponse.json({ success: true, data: result });
      }

      // ── #17: B2B 데모 ──
      case 'b2b-demo': {
        const size = parseInt(searchParams.get('size') || '100');
        const industry = searchParams.get('industry') || undefined;
        const result = await generateB2BDemo(size, industry);
        return NextResponse.json({ success: true, data: result });
      }

      // ── #18: 벤치마크 페르소나 ──
      case 'benchmark-personas': {
        const count = parseInt(searchParams.get('count') || '100');
        const result = await getBenchmarkPersonas(count);
        return NextResponse.json({ success: true, data: result });
      }

      default:
        return NextResponse.json({
          success: false,
          error: `알 수 없는 action: ${action}`,
          availableActions: [
            'status', 'cached-replacement', 'occupation-profile', 'occupation-list',
            'percentile', 'compare', 'similar-people', 'transitions',
            'transition-feasibility', 'age-curve', 'region-map', 'prompt-context',
            'simulate', 'type-balance', 'question-difficulty', 'generational-trends',
            'rankings', 'onboarding', 'content', 'segment', 'b2b-demo', 'benchmark-personas',
          ],
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Nemotron API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '서버 오류',
    }, { status: 500 });
  }
}

function missingParam(name: string) {
  return NextResponse.json({
    success: false,
    error: `필수 파라미터 누락: ${name}`,
  }, { status: 400 });
}
