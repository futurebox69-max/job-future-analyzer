// src/lib/nemotron/data-loader.ts
// Nemotron 데이터 로더 — public/data/ 의 JSON 파일을 메모리에 캐싱

import type {
  OccupationStat,
  OccupationCacheEntry,
  SkillTransitionEdge,
  CompetencyBenchmark,
  PopulationDistribution,
  PersonaSample,
} from './types';

// ── 메모리 캐시 ──
let occupationStats: OccupationStat[] | null = null;
let occupationCache: Record<string, OccupationCacheEntry> | null = null;
let ageOccupationMatrix: Record<string, Record<string, number>> | null = null;
let regionOccupationMap: Record<string, Record<string, number>> | null = null;
let skillTransitionGraph: SkillTransitionEdge[] | null = null;
let competencyBenchmarks: CompetencyBenchmark[] | null = null;
let populationDistribution: PopulationDistribution | null = null;
let personaSamples: PersonaSample[] | null = null;

// ── 데이터 존재 여부 확인 ──
let _dataAvailable: boolean | null = null;

/**
 * Nemotron 데이터가 사용 가능한지 확인
 * (process-dataset.py를 실행해 public/data/에 파일이 있어야 함)
 */
export async function isNemotronDataAvailable(): Promise<boolean> {
  if (_dataAvailable !== null) return _dataAvailable;

  try {
    const res = await fetch('/data/occupation-stats.json', { method: 'HEAD' });
    _dataAvailable = res.ok;
  } catch {
    _dataAvailable = false;
  }

  return _dataAvailable;
}

// ── 서버사이드 로더 (API 라우트에서 사용) ──

async function loadJsonServer<T>(filename: string): Promise<T | null> {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'public', 'data', filename);
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ── 클라이언트사이드 로더 (컴포넌트에서 사용) ──

async function loadJsonClient<T>(filename: string): Promise<T | null> {
  try {
    const res = await fetch(`/data/${filename}`);
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}

// ── 환경 감지 로더 ──

async function loadJson<T>(filename: string): Promise<T | null> {
  if (typeof window === 'undefined') {
    return loadJsonServer<T>(filename);
  }
  return loadJsonClient<T>(filename);
}

// ── 데이터 접근 함수들 ──

export async function getOccupationStats(): Promise<OccupationStat[]> {
  if (!occupationStats) {
    occupationStats = await loadJson<OccupationStat[]>('occupation-stats.json') || [];
  }
  return occupationStats;
}

export async function getOccupationCache(): Promise<Record<string, OccupationCacheEntry>> {
  if (!occupationCache) {
    occupationCache = await loadJson<Record<string, OccupationCacheEntry>>('occupation-cache.json') || {};
  }
  return occupationCache;
}

export async function getAgeOccupationMatrix(): Promise<Record<string, Record<string, number>>> {
  if (!ageOccupationMatrix) {
    ageOccupationMatrix = await loadJson<Record<string, Record<string, number>>>('age-occupation-matrix.json') || {};
  }
  return ageOccupationMatrix;
}

export async function getRegionOccupationMap(): Promise<Record<string, Record<string, number>>> {
  if (!regionOccupationMap) {
    regionOccupationMap = await loadJson<Record<string, Record<string, number>>>('region-occupation-map.json') || {};
  }
  return regionOccupationMap;
}

export async function getSkillTransitionGraph(): Promise<SkillTransitionEdge[]> {
  if (!skillTransitionGraph) {
    skillTransitionGraph = await loadJson<SkillTransitionEdge[]>('skill-transition-graph.json') || [];
  }
  return skillTransitionGraph;
}

export async function getCompetencyBenchmarks(): Promise<CompetencyBenchmark[]> {
  if (!competencyBenchmarks) {
    competencyBenchmarks = await loadJson<CompetencyBenchmark[]>('competency-benchmarks.json') || [];
  }
  return competencyBenchmarks;
}

export async function getPopulationDistribution(): Promise<PopulationDistribution | null> {
  if (!populationDistribution) {
    populationDistribution = await loadJson<PopulationDistribution>('population-distribution.json');
  }
  return populationDistribution;
}

export async function getPersonaSamples(): Promise<PersonaSample[]> {
  if (!personaSamples) {
    personaSamples = await loadJson<PersonaSample[]>('persona-samples.json') || [];
  }
  return personaSamples;
}

// ── 직업명 검색 (퍼지 매칭) ──

export async function findOccupation(query: string): Promise<OccupationStat | null> {
  const stats = await getOccupationStats();
  const q = query.trim().toLowerCase();

  // 정확 매칭
  const exact = stats.find(s => s.occupation.toLowerCase() === q);
  if (exact) return exact;

  // 부분 매칭
  const partial = stats.find(s =>
    s.occupation.toLowerCase().includes(q) ||
    q.includes(s.occupation.toLowerCase())
  );
  if (partial) return partial;

  return null;
}

// ── 캐시 초기화 (테스트용) ──

export function clearNemotronCache() {
  occupationStats = null;
  occupationCache = null;
  ageOccupationMatrix = null;
  regionOccupationMap = null;
  skillTransitionGraph = null;
  competencyBenchmarks = null;
  populationDistribution = null;
  personaSamples = null;
  _dataAvailable = null;
}
