// src/lib/nemotron/prompt-enrichment.ts
// #7 직업별 프롬프트 정교화 — Claude API 프롬프트에 맥락 주입

import { findOccupation } from './data-loader';
import type { OccupationStat } from './types';

/**
 * Claude 분석 프롬프트에 Nemotron ���이터 기반 맥락 주입
 *
 * 직업의 실제 인구통계, 스킬 분포, 역량 프로파일을 프롬프트에 추가해
 * 더 정확한 대체율 분석을 유도
 */
export async function enrichPromptWithNemotron(
  jobName: string,
): Promise<string> {
  const stat = await findOccupation(jobName);

  if (!stat) return '';  // 데이터 ��으면 빈 문자열 (기존 프롬프트만 사용)

  return buildContextBlock(stat);
}

function buildContextBlock(stat: OccupationStat): string {
  const parts: string[] = [
    `\n=== Nemotron-Personas-Korea 실데이터 컨텍스트 (${stat.count}명 표본) ===`,
  ];

  // 연령 분포
  if (stat.avgAge) {
    parts.push(`평균 연령: ${stat.avgAge}세`);
    const ageDist = Object.entries(stat.ageDistribution)
      .sort((a, b) => b[1] - a[1])
      .map(([group, count]) => `${group}: ${count}명`)
      .join(', ');
    if (ageDist) parts.push(`연령 분포: ${ageDist}`);
  }

  // 지역 분포
  const topRegions = Object.keys(stat.topRegions).slice(0, 3);
  if (topRegions.length > 0) {
    parts.push(`주요 근무 지역: ${topRegions.join(', ')}`);
  }

  // 핵심 스킬
  if (stat.topSkills.length > 0) {
    parts.push(`이 직업의 핵심 스킬 (빈도 순): ${stat.topSkills.join(', ')}`);
  }

  // 역량 프로파일
  if (stat.avgCompetency) {
    const NAMES: Record<string, string> = {
      structural: '구조적 사고', creative: '창의적 재설계',
      emotional: '감성 연결', adaptive: '적응 민첩성',
      ethical: '���리적 판단', collab: '협�� 지능',
    };
    const compStr = Object.entries(stat.avgCompetency)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${NAMES[k] || k}: ${v}`)
      .join(', ');
    parts.push(`역량 프���파일 (평균): ${compStr}`);
  }

  // 학력 분포
  const topEdu = Object.entries(stat.educationDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([edu]) => edu);
  if (topEdu.length > 0) {
    parts.push(`주요 학력: ${topEdu.join(', ')}`);
  }

  parts.push(
    '위 데이터를 참고하되, 학술적 근거(Frey & Osborne, O*NET 등)를 우선하세요.',
    '=== 컨텍스트 끝 ===\n',
  );

  return parts.join('\n');
}

/**
 * 연령별 프롬프트 맥락 추가 (#8 연령별 시뮬레이션)
 * 같은 직업이라도 연령대에 따른 스킬 차이 반영
 */
export async function enrichPromptWithAge(
  jobName: string,
  userAge?: number,
): Promise<string> {
  if (!userAge) return '';

  const stat = await findOccupation(jobName);
  if (!stat) return '';

  const ageGroup = getAgeGroup(userAge);
  const totalInGroup = stat.ageDistribution[ageGroup] || 0;

  if (totalInGroup === 0) return '';

  return [
    `\n=== 연령대별 맥락 ===`,
    `사용자 연령대: ${ageGroup} (${userAge}세)`,
    `이 직업의 ${ageGroup} 종사자: ${totalInGroup}명`,
    `참고: 연령이 높을수록 적응 민첩성은 낮을 수 있으나, 경험 기반 판단력과 네트워크는 강점.`,
    `=== 연령 맥락 끝 ===\n`,
  ].join('\n');
}

function getAgeGroup(age: number): string {
  if (age < 20) return '10대';
  if (age < 30) return '20대';
  if (age < 40) return '30대';
  if (age < 50) return '40대';
  if (age < 60) return '50대';
  return '60대+';
}
