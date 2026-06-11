// v3 — 점진 심화 입력 (Progressive Deepening) 플로우 타입.
// FABLE 5 재설계 명세서 v1.0 §2 기준. 스키마 전용 파일 — 서버·클라이언트 양쪽에서 안전하게 import 가능.

import { z } from "zod";

// ── 1단계: 3문항 (30초) ──────────────────────────────
export const AGE_RANGES = ["10대", "20대", "30대", "40대", "50대", "60대 이상"] as const;
export type AgeRange = (typeof AGE_RANGES)[number];

export const REGIONS = [
  "수도권",
  "광역시",
  "중소도시",
  "농어촌",
  "해외",
] as const;
export type Region = (typeof REGIONS)[number];

export interface Step1Input {
  jobName: string;
  ageRange: AgeRange;
  region: Region;
}

// ── 2단계: 핵심 5문항 ────────────────────────────────
export const WORK_TYPES = [
  "정규직 (조직 소속)",
  "계약직·파견",
  "프리랜서·1인 사업",
  "자영업 (직원 고용)",
  "공공기관·공기업",
  "구직·이직 준비 중",
] as const;
export type WorkType = (typeof WORK_TYPES)[number];

export const YEARS_OPTIONS = [
  "3년 미만",
  "3~7년",
  "7~15년",
  "15년 이상",
] as const;
export type YearsRange = (typeof YEARS_OPTIONS)[number];

// 만족도 — 불안 주입 방지 장치의 핵심 문항 (명세서 §2-3)
export const SATISFACTION_OPTIONS = [
  "매우 만족하며 일하고 있다",
  "대체로 만족한다",
  "보통이다",
  "불만족스러운 부분이 많다",
  "떠나고 싶다",
] as const;
export type Satisfaction = (typeof SATISFACTION_OPTIONS)[number];

export const DIRECTION_OPTIONS = [
  "지금 자리를 지키며 더 단단해지고 싶다",
  "같은 분야 안에서 자리를 옮기고 싶다",
  "다른 분야로 전환을 고민 중이다",
  "나만의 일을 만들고 싶다",
  "아직 모르겠다 — 그래서 알아보는 중이다",
] as const;
export type Direction = (typeof DIRECTION_OPTIONS)[number];

export interface Step2Input {
  workType: WorkType | null;
  years: YearsRange | null;
  satisfaction: Satisfaction | null;
  direction: Direction | null;
  concern: string; // 가장 큰 고민 — 자유 서술 (빈 문자열 허용)
}

export const EMPTY_STEP2: Step2Input = {
  workType: null,
  years: null,
  satisfaction: null,
  direction: null,
  concern: "",
};

// ── 정밀화(refine) API ───────────────────────────────
export interface RefineRequest {
  job: string;
  baseRate: number;       // 1단계 일반 분석의 종합 위험도
  summary: string;        // 일반 분석 요약 (개인화 근거로 전달)
  ageRange: AgeRange;
  region: Region;
  step2: Step2Input;
}

// 만족도 분기 결과 톤 (명세서 §2-3)
// staying: 만족 높음 + 위험 낮음 → "머무름을 단단하게"
// gentle:  만족 높음 + 위험 높음 → 부드럽게, 시간 압박 금지
// neutral: 그 외 — 균형 서술
export const RefineResultSchema = z.object({
  adjustedRate: z.number().min(0).max(100),
  singleSentence: z.string(),          // 결과 최상단 한 문장 (The Single Sentence 미니 버전)
  rateReasons: z.array(z.string()).min(1).max(4), // 숫자가 움직인 이유 — 입력값별 근거
  personalNotes: z.array(z.string()).min(2).max(4), // "당신"에 대한 서술 (일반론 아님)
  tone: z.enum(["staying", "gentle", "neutral"]),
});
export type RefineResult = z.infer<typeof RefineResultSchema>;

// ── 미니 결과 (1단계 직후) ────────────────────────────
export interface MiniResult {
  jobName: string;
  overallRate: number;
  riskLevel: string;
  generalLines: string[]; // 직업 일반론 3줄
}
