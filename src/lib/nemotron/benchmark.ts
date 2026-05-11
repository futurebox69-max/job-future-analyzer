// src/lib/nemotron/benchmark.ts
// #16-18 공통 인프라: B2B 데모, 프롬프트 벤치마크, 개인정보 안전

import { getPersonaSamples, getOccupationStats } from './data-loader';
import type { PersonaSample, OccupationStat } from './types';

// ── #17: B2B 데모용 시뮬레이션 ──

/**
 * "귀사 직원 N명 분석 시 이런 결과가 나옵니다" 시연 데이터 생성
 */
export async function generateB2BDemo(
  companySize: number = 100,
  industry?: string,
): Promise<{
  employees: Array<{
    occupation: string;
    age: number;
    region: string;
    estimatedReplacementRate: number;
    competencyType: string;
  }>;
  summary: {
    avgReplacementRate: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    topCompetencyType: string;
    recommendation: string;
  };
}> {
  const samples = await getPersonaSamples();
  const stats = await getOccupationStats();

  // 업종 필터 (있으면)
  let pool = samples;
  if (industry) {
    const filtered = samples.filter(s =>
      s.occupation.includes(industry) || s.skills_summary.includes(industry)
    );
    if (filtered.length > 20) pool = filtered;
  }

  // 랜덤 샘플링
  const selected = shuffleArray(pool).slice(0, companySize);

  const employees = selected.map(p => {
    // 대체율 추정
    const stat = stats.find(s => s.occupation === p.occupation);
    const replacement = stat?.estimatedReplacement;
    const rate = replacement
      ? Math.round(
          replacement.repetitive * 0.20 +
          replacement.cognitive * 0.18 +
          replacement.physical * 0.10 +
          replacement.creative * 0.12 +
          replacement.social * 0.12 +
          replacement.ethical * 0.08 +
          replacement.techVelocity * 0.12 +
          (100 - replacement.regulatory) * 0.08
        )
      : 50;

    return {
      occupation: p.occupation,
      age: p.age,
      region: p.region,
      estimatedReplacementRate: Math.max(0, Math.min(100, rate + Math.round((Math.random() - 0.5) * 20))),
      competencyType: getRandomType(),
    };
  });

  // 요약 통계
  const rates = employees.map(e => e.estimatedReplacementRate);
  const avgRate = Math.round(rates.reduce((s, r) => s + r, 0) / rates.length);

  const typeCounts: Record<string, number> = {};
  employees.forEach(e => {
    typeCounts[e.competencyType] = (typeCounts[e.competencyType] || 0) + 1;
  });
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  return {
    employees,
    summary: {
      avgReplacementRate: avgRate,
      highRiskCount: rates.filter(r => r >= 70).length,
      mediumRiskCount: rates.filter(r => r >= 40 && r < 70).length,
      lowRiskCount: rates.filter(r => r < 40).length,
      topCompetencyType: topType,
      recommendation: avgRate > 60
        ? '조직 전반의 AI 전환 리스크가 높습니다. 체계적인 리스킬링 프로그램을 권장합니다.'
        : avgRate > 40
        ? '중간 수준의 리스크. 고위험 직군 중심 우선 대응을 권장합니다.'
        : '비교적 안전한 조직 구성. 미래 역량 강화로 경쟁력을 유지하세요.',
    },
  };
}

// ── #18: 프롬프트 벤치마크 ──

/**
 * 동일한 페르소나 세트로 프롬프트 일관성 테스트
 * A/B ���스트 시 결과 비교 기준 데이터
 */
export async function getBenchmarkPersonas(
  count: number = 100,
): Promise<PersonaSample[]> {
  const samples = await getPersonaSamples();

  // 직업 다양성을 보장하면서 선택
  const occupationSet = new Set<string>();
  const selected: PersonaSample[] = [];

  for (const sample of samples) {
    if (selected.length >= count) break;
    if (!occupationSet.has(sample.occupation)) {
      occupationSet.add(sample.occupation);
      selected.push(sample);
    }
  }

  // 부족하면 추가
  if (selected.length < count) {
    for (const sample of samples) {
      if (selected.length >= count) break;
      if (!selected.includes(sample)) {
        selected.push(sample);
      }
    }
  }

  return selected;
}

/**
 * 프롬프트 벤치마크 결과 비교
 */
export function compareBenchmarkResults(
  resultsA: Array<{ occupation: string; overallRate: number }>,
  resultsB: Array<{ occupation: string; overallRate: number }>,
): {
  correlation: number;
  avgDifference: number;
  maxDifference: { occupation: string; diffA: number; diffB: number };
  consistency: string;
} {
  const mapA = new Map(resultsA.map(r => [r.occupation, r.overallRate]));
  const mapB = new Map(resultsB.map(r => [r.occupation, r.overallRate]));

  const common = resultsA.filter(r => mapB.has(r.occupation));
  if (common.length === 0) {
    return {
      correlation: 0,
      avgDifference: 0,
      maxDifference: { occupation: '', diffA: 0, diffB: 0 },
      consistency: '비교 가능한 결과 없음',
    };
  }

  let sumDiff = 0;
  let maxDiff = 0;
  let maxDiffOcc = '';
  let maxA = 0, maxB = 0;

  for (const r of common) {
    const a = r.overallRate;
    const b = mapB.get(r.occupation) || 0;
    const diff = Math.abs(a - b);
    sumDiff += diff;
    if (diff > maxDiff) {
      maxDiff = diff;
      maxDiffOcc = r.occupation;
      maxA = a;
      maxB = b;
    }
  }

  const avgDiff = sumDiff / common.length;

  return {
    correlation: 1 - (avgDiff / 100),
    avgDifference: Math.round(avgDiff * 10) / 10,
    maxDifference: { occupation: maxDiffOcc, diffA: maxA, diffB: maxB },
    consistency: avgDiff < 5 ? '매우 일관적' :
                 avgDiff < 10 ? '일관적' :
                 avgDiff < 20 ? '약간 편차' : '재검토 필요',
  };
}

// ── #16: 개인정보 안전 확인 ──

/**
 * Nemotron 데이터가 합성(synthetic)임을 확인하는 메타데이터
 */
export function getPrivacySafetyInfo(): {
  isSynthetic: boolean;
  dataSource: string;
  license: string;
  privacyStatement: string;
  legalNote: string;
} {
  return {
    isSynthetic: true,
    dataSource: 'NVIDIA Nemotron-Personas-Korea (HuggingFace)',
    license: 'CC-BY-4.0',
    privacyStatement: '이 데이터는 100% 합성(synthetic) 데이터입니다. 실제 개인정보를 포함하지 않으며, KOSIS 공개 통계 분포를 기반으로 생성되었��니다. 개인정보보호법상 개인정보에 해당하지 않습니다.',
    legalNote: '합성 페르소나는 실존 인물과 무관합니다. 통계적 분포는 참고용이며, 개별 결과의 정확성을 보장하지 않습니다.',
  };
}

// ── 유틸리티 ──

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getRandomType(): string {
  const types = [
    '미래 설계자', '창조적 파괴자', '공감 리더', '적응형 혁신가',
    '윤리 수호자', '시너지 메이커', '균형 전략가', '이중 무��� 보유자',
    '잠재력 폭발형', '올라운더',
  ];
  return types[Math.floor(Math.random() * types.length)];
}
