// src/lib/nemotron/transition.ts
// #6 전환 경로 현실성 검증 + #9 지역별 리스크 맵

import {
  getSkillTransitionGraph,
  getRegionOccupationMap,
  getAgeOccupationMatrix,
  findOccupation,
} from './data-loader';
import type {
  TransitionRecommendation,
  SkillTransitionEdge,
  AgeCurvePoint,
} from './types';

// ── #6: 전환 경로 추천 ──

/**
 * 현재 직업에서 전환 가능한 직업 추천
 * 스킬 겹침도(Jaccard similarity) 기반
 */
export async function getTransitionRecommendations(
  currentOccupation: string,
  limit: number = 10
): Promise<TransitionRecommendation[]> {
  const graph = await getSkillTransitionGraph();
  const currentStat = await findOccupation(currentOccupation);

  if (!graph.length) return [];

  const q = currentOccupation.trim().toLowerCase();

  // 현재 직업과 연결된 엣지 찾기
  const related = graph.filter(e =>
    e.from.toLowerCase().includes(q) || q.includes(e.from.toLowerCase()) ||
    e.to.toLowerCase().includes(q) || q.includes(e.to.toLowerCase())
  );

  const recommendations: TransitionRecommendation[] = related
    .map(edge => {
      const target = edge.from.toLowerCase().includes(q) ? edge.to : edge.from;

      return {
        targetOccupation: target,
        similarity: edge.similarity,
        sharedSkillCount: edge.sharedSkillCount,
        requiredNewSkills: [], // 아래에서 채움
        estimatedDifficulty: getDifficulty(edge.similarity),
      };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  // 스킬 갭 추정 (현재 직업의 스킬과 대상 직업�� 스킬 비교)
  for (const rec of recommendations) {
    const targetStat = await findOccupation(rec.targetOccupation);
    if (targetStat?.topSkills && currentStat?.topSkills) {
      const currentSkills = new Set(currentStat.topSkills.map(s => s.toLowerCase()));
      rec.requiredNewSkills = targetStat.topSkills
        .filter(s => !currentSkills.has(s.toLowerCase()))
        .slice(0, 5);
    }
  }

  return recommendations;
}

/**
 * 두 직업 간 전환 가능성 상세 분석
 */
export async function analyzeTransitionFeasibility(
  fromOccupation: string,
  toOccupation: string,
): Promise<{
  feasible: boolean;
  similarity: number;
  sharedSkills: number;
  difficulty: string;
  gapAnalysis: string;
}> {
  const graph = await getSkillTransitionGraph();
  const fromQ = fromOccupation.trim().toLowerCase();
  const toQ = toOccupation.trim().toLowerCase();

  // 직접 연결 찾기
  const directEdge = graph.find(e =>
    (e.from.toLowerCase().includes(fromQ) && e.to.toLowerCase().includes(toQ)) ||
    (e.to.toLowerCase().includes(fromQ) && e.from.toLowerCase().includes(toQ))
  );

  if (directEdge) {
    return {
      feasible: directEdge.similarity > 0.1,
      similarity: directEdge.similarity,
      sharedSkills: directEdge.sharedSkillCount,
      difficulty: getDifficulty(directEdge.similarity) as string,
      gapAnalysis: getGapAnalysis(directEdge.similarity),
    };
  }

  // 간접 경로 (2-hop)
  const fromEdges = graph.filter(e =>
    e.from.toLowerCase().includes(fromQ) || e.to.toLowerCase().includes(fromQ)
  );
  const toEdges = graph.filter(e =>
    e.from.toLowerCase().includes(toQ) || e.to.toLowerCase().includes(toQ)
  );

  // 중간 직업 찾기
  const fromNeighbors = new Set(fromEdges.map(e =>
    e.from.toLowerCase().includes(fromQ) ? e.to : e.from
  ));
  const toNeighbors = new Set(toEdges.map(e =>
    e.from.toLowerCase().includes(toQ) ? e.to : e.from
  ));

  const bridgeOccupations = [...fromNeighbors].filter(x => toNeighbors.has(x));

  if (bridgeOccupations.length > 0) {
    return {
      feasible: true,
      similarity: 0.1,
      sharedSkills: 0,
      difficulty: '높음',
      gapAnalysis: `직접 전환은 어렵지만, ${bridgeOccupations[0]}을 거치는 단계적 전환이 가능합니다.`,
    };
  }

  return {
    feasible: false,
    similarity: 0,
    sharedSkills: 0,
    difficulty: '매우 높음',
    gapAnalysis: '두 직업 간 스킬 겹침이 거의 없습니다. 전면적인 재교육이 필요합니다.',
  };
}

// ── #9: 지역별 직업 리스크 맵 ���─

/**
 * 지역별 상위 직업과 대체율 데이터 반환
 */
export async function getRegionalRiskMap(): Promise<Record<string, {
  topOccupations: Array<{ occupation: string; count: number }>;
}>> {
  const regionMap = await getRegionOccupationMap();
  const result: Record<string, any> = {};

  for (const [region, occupations] of Object.entries(regionMap)) {
    const topOccs = Object.entries(occupations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([occ, count]) => ({ occupation: occ, count }));

    result[region] = { topOccupations: topOccs };
  }

  return result;
}

/**
 * 특정 지역의 직업 분포 + 대체율 요약
 */
export async function getRegionProfile(region: string): Promise<{
  found: boolean;
  topOccupations: string[];
  totalCount: number;
  insight: string;
}> {
  const regionMap = await getRegionOccupationMap();
  const q = region.trim();

  const matchKey = Object.keys(regionMap).find(k =>
    k.includes(q) || q.includes(k)
  );

  if (!matchKey) {
    return {
      found: false,
      topOccupations: [],
      totalCount: 0,
      insight: '해당 지역 데이터가 없습니다.',
    };
  }

  const occupations = regionMap[matchKey];
  const sorted = Object.entries(occupations).sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((sum, [_, c]) => sum + c, 0);

  return {
    found: true,
    topOccupations: sorted.slice(0, 10).map(([occ]) => occ),
    totalCount: total,
    insight: `${matchKey} 지역 ${total}명 데이터. 주요 직업: ${sorted.slice(0, 3).map(([o]) => o).join(', ')}.`,
  };
}

// ── #8: 연령별 대체율 ��선 ──

/**
 * 특정 직업의 연령별 인원 분포 반환
 */
export async function getAgeCurveForOccupation(
  occupation: string
): Promise<AgeCurvePoint[]> {
  const ageMatrix = await getAgeOccupationMatrix();
  const q = occupation.trim().toLowerCase();

  const result: AgeCurvePoint[] = [];
  const ageGroups = ['10대', '20대', '30대', '40대', '50대', '60대+'];

  for (const ageGroup of ageGroups) {
    const occupations = ageMatrix[ageGroup] || {};
    const matchKey = Object.keys(occupations).find(k =>
      k.toLowerCase().includes(q) || q.includes(k.toLowerCase())
    );
    const count = matchKey ? occupations[matchKey] : 0;

    // 연령대별 대체율 가중치 (나이 많을수록 적응력 감소 추정)
    const ageWeight = {
      '10대': 0.85, '20대': 0.90, '30대': 0.95,
      '40대': 1.00, '50대': 1.05, '60대+': 1.10,
    }[ageGroup] || 1.0;

    result.push({
      ageGroup,
      count,
      avgReplacement: Math.round(50 * ageWeight),  // 기본값, 실데이터 있으면 교체
    });
  }

  return result;
}

// ── 유틸리티 ──

function getDifficulty(similarity: number): TransitionRecommendation['estimatedDifficulty'] {
  if (similarity > 0.4) return '낮음';
  if (similarity > 0.2) return '보통';
  return '높음';
}

function getGapAnalysis(similarity: number): string {
  if (similarity > 0.5) return '매우 높은 스킬 겹침. 단기간 전환이 가능합니다.';
  if (similarity > 0.3) return '상당한 스킬 겹침. 3-6개월 보완 학습으로 전환 가능합니다.';
  if (similarity > 0.15) return '일부 스킬이 겹칩니다. 1년 정도 집중 학습이 필요합니다.';
  return '스킬 겹침이 적습니다. 체계적인 재교육 과정이 필요합��다.';
}
