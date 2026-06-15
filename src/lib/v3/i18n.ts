// /v3 점진 심화 플로우 — 한국어/영어 문자열 + 선택지 라벨.
// 선택지의 "값"은 types.ts의 한국어 enum 그대로 유지한다(refine API 계약 불변).
// 화면에 보이는 "라벨"만 언어별로 분리한다 — value→label 매핑.

import {
  AGE_RANGES,
  DIRECTION_OPTIONS,
  REGIONS,
  SATISFACTION_OPTIONS,
  WORK_TYPES,
  YEARS_OPTIONS,
} from "./types";

export type V3Lang = "ko" | "en";

export function toV3Lang(code: string | null | undefined): V3Lang {
  return code === "ko" || !code ? "ko" : "en";
}

// value(한국어 enum) → 표시 라벨. 순서는 types.ts 배열과 1:1.
function zip<T extends readonly string[]>(values: T, labels: string[]): { value: T[number]; label: string }[] {
  return values.map((v, i) => ({ value: v, label: labels[i] ?? v }));
}

interface V3Strings {
  // 인트로
  intro_eyebrow: string;
  intro_title_1: string;
  intro_title_accent: string;
  intro_title_2: string;
  intro_p1a: string;
  intro_p1b: string;
  intro_p2a: string;
  intro_p2b: string;
  intro_start: string;
  intro_back: string;
  // 진행 라벨
  step_of: (cur: number, total: number) => string;
  deepen_of: (cur: number, total: number) => string;
  // 질문
  q_job_title: string;
  q_job_placeholder: string;
  q_next: string;
  q_age_title: string;
  q_region_title: string;
  d_work_title: string;
  d_years_title: string;
  d_sat_title: string;
  d_sat_note: string;
  d_dir_title: string;
  d_concern_title: string;
  concern_placeholder: string;
  recalc: string;
  skip: string;
  // 선택지 (value=한국어 enum / label=현지화)
  ageOptions: { value: string; label: string }[];
  regionOptions: { value: string; label: string }[];
  workOptions: { value: string; label: string }[];
  yearsOptions: { value: string; label: string }[];
  satOptions: { value: string; label: string }[];
  dirOptions: { value: string; label: string }[];
  // 보고서가 자라는 미리보기
  toc_title: string;
  toc_labels: string[]; // TOC_ITEMS 순서와 1:1 (10개)
  // 로딩
  loading_base: string;
  analyzing_title: string;
  analyzing_sub: string;
  refining_title: string;
  refining_sub: string;
  // 미니 결과
  mini_eyebrow: string;
  mini_risk_label: string;
  mini_frame_1: (job: string) => string;
  mini_frame_2: string;
  mini_frame_sub: string;
  mini_more: string;
  mini_stop: string;
  // 최종
  final_default_sentence: (job: string) => string;
  final_moved: string;
  final_adjusted_label: string;
  final_risk_label: string;
  reasons_title: string;
  personal_title: string;
  eyes_summary_title: string;
  final_outro_1: string;
  final_outro_2: string;
  final_full_report: string;
  final_another: string;
  // P.17 박스
  p17_title: string;
  p17_not_received: string;
  p17_reduce: string;
  // 에러
  err_analyze: string;
  err_network: string;
  // 분석 진행 중 안내
  err_failed: string;
}

const KO: V3Strings = {
  intro_eyebrow: "내 직업의 미래 · 점진 심화 분석",
  intro_title_1: "세 가지만 알려주세요.",
  intro_title_accent: "30초",
  intro_title_2: "면 됩니다.",
  intro_p1a: "먼저 직업의 평균을 보여드립니다.",
  intro_p1b: "그 다음은 — 보여드린 결과가 스스로 다음 질문을 할 겁니다.",
  intro_p2a: "모든 추가 질문은 건너뛸 수 있습니다.",
  intro_p2b: "다만 보고서가 빈 자리를 정직하게 적습니다.",
  intro_start: "시작하기 →",
  intro_back: "기존 분석으로 돌아가기",
  step_of: (c, t) => `${c} / ${t}`,
  deepen_of: (c, t) => `심화 ${c} / ${t}`,
  q_job_title: "어떤 일을 하고 계신가요?",
  q_job_placeholder: "직업명 (예: 간호사, 영어강사, 의료기기 제조 기술자)",
  q_next: "다음",
  q_age_title: "연령대를 알려주세요.",
  q_region_title: "주로 어디에서 일하시나요?",
  d_work_title: "어떤 형태로 일하고 계신가요?",
  d_years_title: "이 일을 하신 지 얼마나 되셨나요?",
  d_sat_title: "지금 일에 얼마나 만족하십니까?",
  d_sat_note: "이 답은 보고서의 방향을 바꿉니다. 만족하며 일하고 계시다면 — 떠날 이유가 아니라 머무름을 단단하게 만드는 쪽으로 씁니다.",
  d_dir_title: "지금 어느 쪽을 바라보고 계신가요?",
  d_concern_title: "요즘 일과 관련해 가장 큰 고민이 무엇인가요?",
  concern_placeholder: "쓰신 만큼 깊어집니다. 안 쓰셔도 됩니다 — 다만 보고서가 그 사실을 정직하게 적습니다.",
  recalc: "내 숫자 다시 계산하기 →",
  skip: "이 질문은 건너뛰기 — 보고서가 그 사실을 정직하게 적습니다",
  ageOptions: zip(AGE_RANGES, [...AGE_RANGES]),
  regionOptions: zip(REGIONS, [...REGIONS]),
  workOptions: zip(WORK_TYPES, [...WORK_TYPES]),
  yearsOptions: zip(YEARS_OPTIONS, [...YEARS_OPTIONS]),
  satOptions: zip(SATISFACTION_OPTIONS, [...SATISFACTION_OPTIONS]),
  dirOptions: zip(DIRECTION_OPTIONS, [...DIRECTION_OPTIONS]),
  toc_title: "지금까지 자란 보고서",
  toc_labels: [
    "종합 위험도",
    "직업 일반론 — 평균의 이야기",
    "연령대 맥락",
    "지역 노동시장 맥락",
    "근무 형태가 바꾸는 숫자",
    "경력 단계별 준비",
    "머무름 / 떠남의 결",
    "방향에 맞춘 다음 걸음",
    "당신의 고민에 대한 답",
    "P.17 — 이 보고서가 모르는 것",
  ],
  loading_base: "직업의 평균을 먼저 살펴봅니다...",
  analyzing_title: "분석 중...",
  analyzing_sub: "처음 분석은 30~90초 걸립니다 · 같은 직업은 즉시",
  refining_title: "입력하신 내용으로 숫자를 다시 계산하고 있습니다...",
  refining_sub: "잠시만요 — 일반론이 당신의 이야기로 바뀌는 중입니다",
  mini_eyebrow: "미니 결과",
  mini_risk_label: "종합 위험도",
  mini_frame_1: (job) => `여기까지는 ‘${job}’의 미래입니다.`,
  mini_frame_2: "‘당신’의 미래는 아직 아닙니다.",
  mini_frame_sub: "근무 형태를 알려주시면 — 이 숫자가 달라집니다.",
  mini_more: "더 알려주기 (5문항, 1분)",
  mini_stop: "여기까지만 볼게요",
  final_default_sentence: (job) => `${job}의 평균은 보았습니다. 당신의 이야기는 아직 시작 전입니다.`,
  final_moved: "입력하신 내용이 숫자를 움직였습니다",
  final_adjusted_label: "당신의 조정 위험도",
  final_risk_label: "종합 위험도",
  reasons_title: "숫자가 움직인 이유",
  personal_title: "직업이 아니라, 당신에 대하여",
  eyes_summary_title: "여덟 개의 눈 요약",
  final_outro_1: "여기까지가 무료 분석이 볼 수 있는 자리입니다.",
  final_outro_2: "더 깊은 보고서가 필요해지면 — 그때 오시면 됩니다.",
  final_full_report: "전체 보고서 보러 가기",
  final_another: "다른 직업 분석하기",
  p17_title: "P.17 — 이 보고서가 모르는 것",
  p17_not_received: "본 보고서가 받지 못한 입력값:",
  p17_reduce: "이 목록을 줄이는 방법은 하나뿐입니다 — 입력을 채우시면, 한계 문장이 분석 문장으로 바뀝니다.",
  err_analyze: "분석에 실패했습니다. 다시 시도해주세요.",
  err_network: "네트워크 오류가 발생했습니다.",
  err_failed: "분석에 실패했습니다.",
};

const EN: V3Strings = {
  intro_eyebrow: "Future of My Job · Progressive Deepening",
  intro_title_1: "Tell us just three things.",
  intro_title_accent: "30 seconds",
  intro_title_2: " is all it takes.",
  intro_p1a: "First we show you the job's average.",
  intro_p1b: "After that — the result itself will ask the next question.",
  intro_p2a: "You can skip every follow-up question.",
  intro_p2b: "The report just notes, honestly, what's left blank.",
  intro_start: "Start →",
  intro_back: "Back to the classic analysis",
  step_of: (c, t) => `${c} / ${t}`,
  deepen_of: (c, t) => `Deeper ${c} / ${t}`,
  q_job_title: "What kind of work do you do?",
  q_job_placeholder: "Job title (e.g. Nurse, English teacher, Medical device maker)",
  q_next: "Next",
  q_age_title: "What's your age range?",
  q_region_title: "Where do you mostly work?",
  d_work_title: "How are you employed?",
  d_years_title: "How long have you done this work?",
  d_sat_title: "How satisfied are you with your work right now?",
  d_sat_note: "This answer changes the report's direction. If you're content in your work, we write toward making that footing stronger — not toward reasons to leave.",
  d_dir_title: "Which way are you looking right now?",
  d_concern_title: "What's your biggest concern about work these days?",
  concern_placeholder: "The more you write, the deeper it goes. You don't have to — the report will just note that, honestly.",
  recalc: "Recalculate my number →",
  skip: "Skip this question — the report notes that, honestly",
  ageOptions: zip(AGE_RANGES, ["Teens", "20s", "30s", "40s", "50s", "60s+"]),
  regionOptions: zip(REGIONS, ["Metro area", "Major city", "Smaller city", "Rural area", "Overseas"]),
  workOptions: zip(WORK_TYPES, [
    "Full-time (in an organization)",
    "Contract / temp",
    "Freelance / solo business",
    "Self-employed (with staff)",
    "Public sector",
    "Between jobs / job-seeking",
  ]),
  yearsOptions: zip(YEARS_OPTIONS, ["Under 3 years", "3–7 years", "7–15 years", "15+ years"]),
  satOptions: zip(SATISFACTION_OPTIONS, [
    "I genuinely love what I do",
    "Mostly satisfied",
    "It's okay",
    "A lot of it feels unsatisfying",
    "I want to leave",
  ]),
  dirOptions: zip(DIRECTION_OPTIONS, [
    "Stay and grow stronger where I am",
    "Move to another role in the same field",
    "Considering a switch to another field",
    "Build something of my own",
    "Not sure yet — that's why I'm here",
  ]),
  toc_title: "Your report so far",
  toc_labels: [
    "Overall risk",
    "Job baseline — the average story",
    "Age-range context",
    "Regional labor-market context",
    "How work type shifts the number",
    "Preparation by career stage",
    "The grain of staying / leaving",
    "Next steps for your direction",
    "An answer to your concern",
    "P.17 — what this report doesn't know",
  ],
  loading_base: "First, looking at the job's average...",
  analyzing_title: "Analyzing...",
  analyzing_sub: "The first analysis takes 30–90s · the same job loads instantly",
  refining_title: "Recalculating the number with what you told us...",
  refining_sub: "One moment — the general story is becoming yours",
  mini_eyebrow: "Mini result",
  mini_risk_label: "Overall risk",
  mini_frame_1: (job) => `So far, this is the future of a '${job}.'`,
  mini_frame_2: "It isn't yet 'your' future.",
  mini_frame_sub: "Tell us how you're employed — and this number changes.",
  mini_more: "Tell us more (5 questions, 1 min)",
  mini_stop: "I'll stop here",
  final_default_sentence: (job) => `We've seen the average for ${job}. Your story hasn't started yet.`,
  final_moved: "What you entered moved the number",
  final_adjusted_label: "Your adjusted risk",
  final_risk_label: "Overall risk",
  reasons_title: "Why the number moved",
  personal_title: "Not the job — about you",
  eyes_summary_title: "Eight eyes, in brief",
  final_outro_1: "This is as far as the free analysis can see.",
  final_outro_2: "When you need a deeper report — that's when to come back.",
  final_full_report: "See the full report",
  final_another: "Analyze another job",
  p17_title: "P.17 — what this report doesn't know",
  p17_not_received: "Inputs this report didn't receive:",
  p17_reduce: "There's only one way to shorten this list — fill in the inputs, and each limit sentence becomes an analysis sentence.",
  err_analyze: "Analysis failed. Please try again.",
  err_network: "A network error occurred.",
  err_failed: "Analysis failed.",
};

export function getV3(lang: V3Lang): V3Strings {
  return lang === "ko" ? KO : EN;
}
