// v3 플로우 클라이언트 상태 — sessionStorage 전용 (MVP 단계, 서버 영속화 없음).
// STANDARD 구독이 열리면 Supabase로 이관하고 이 모듈의 API는 유지한다 (보고서 버전업 §3-2).

"use client";

import type { AnalysisResult } from "@/types/analysis";
import type { RefineResult, Step1Input, Step2Input } from "./types";

const KEYS = {
  step1: "v3_step1",
  step2: "v3_step2",
  base: "v3_base_result",
  refined: "v3_refined",
} as const;

function save(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패는 무시 — 플로우는 메모리 상태로도 진행 가능
  }
}

function load<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export const saveStep1 = (v: Step1Input) => save(KEYS.step1, v);
export const loadStep1 = () => load<Step1Input>(KEYS.step1);
export const saveStep2 = (v: Step2Input) => save(KEYS.step2, v);
export const loadStep2 = () => load<Step2Input>(KEYS.step2);
export const saveBaseResult = (v: AnalysisResult) => save(KEYS.base, v);
export const loadBaseResult = () => load<AnalysisResult>(KEYS.base);
export const saveRefined = (v: RefineResult) => save(KEYS.refined, v);
export const loadRefined = () => load<RefineResult>(KEYS.refined);

export function clearV3State(): void {
  if (typeof window === "undefined") return;
  Object.values(KEYS).forEach((k) => sessionStorage.removeItem(k));
}
