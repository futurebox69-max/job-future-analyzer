// P.17 — 한계 고지 자동 컴파일 (명세서 §2-2, 설계 원칙 3 "한계 고지는 기능이다").
// 빈 입력 필드가 곧 한계 문장이 된다. 순수 함수 — 서버·클라이언트 공용.

import type { Step2Input } from "./types";

export interface P17Entry {
  field: string;    // 받지 못한 입력값 이름
  sentence: string; // 그래서 이 보고서가 보지 못한 것
}

// 필드별 한계 문장 — 입력하지 않은 것을 비난하지 않고, 보고서의 시야가 좁아진 사실만 적는다.
const LIMIT_SENTENCES: Record<keyof Omit<Step2Input, "concern">, P17Entry> = {
  workType: {
    field: "근무 형태",
    sentence:
      "같은 직업이라도 조직 소속·프리랜서·자영업은 변화의 속도가 다릅니다. 이 보고서는 그 차이를 반영하지 못했습니다.",
  },
  years: {
    field: "연차",
    sentence:
      "경력의 깊이에 따라 준비할 것이 달라지지만, 이 보고서는 평균적인 경력 단계를 가정했습니다.",
  },
  satisfaction: {
    field: "일에 대한 만족도",
    sentence:
      "지금 일이 당신에게 어떤 의미인지 듣지 못해, 이 보고서는 떠남과 머무름 중 어느 쪽도 권할 자격이 없습니다.",
  },
  direction: {
    field: "방향의 결",
    sentence:
      "당신이 어느 쪽을 바라보고 있는지 모른 채 쓰인 보고서입니다. 전환 경로 제안은 일반론에 머뭅니다.",
  },
};

const CONCERN_ENTRY: P17Entry = {
  field: "가장 큰 고민 (자유 서술)",
  sentence:
    "당신의 말로 쓰인 고민을 받지 못했습니다. 이 보고서가 당신의 진짜 질문에 답하고 있는지 확인할 수 없습니다.",
};

// 항상 인쇄되는 근본 한계 — 입력을 다 채워도 사라지지 않는다.
export const PERMANENT_LIMITS: string[] = [
  "이 분석은 통계와 추세의 언어입니다. 당신의 사정, 당신의 기쁨, 당신이 일에서 찾는 의미는 숫자에 담기지 않았습니다.",
  "시장은 계속 움직입니다. 이 보고서는 오늘의 자리이며, 6개월 뒤에는 다시 짚어야 합니다.",
];

/**
 * 채우지 않은 2단계 입력 필드를 한계 문장 목록으로 컴파일한다.
 * step2가 null이면 (2단계를 아예 건너뛰면) 전체 필드가 한계로 기재된다.
 */
export function compileP17(step2: Step2Input | null): P17Entry[] {
  const entries: P17Entry[] = [];
  const s = step2;

  (Object.keys(LIMIT_SENTENCES) as Array<keyof typeof LIMIT_SENTENCES>).forEach((key) => {
    if (!s || s[key] === null) entries.push(LIMIT_SENTENCES[key]);
  });

  if (!s || s.concern.trim().length === 0) entries.push(CONCERN_ENTRY);

  return entries;
}

// ── 불안 주입 방지 — 시간선 압박 표현 금지어 (명세서 §2-3, §4-3) ──
// AI 생성 문장에서 결제·행동을 압박하는 표현을 서버 측에서 걸러낸다.
const FORBIDDEN_PRESSURE_PATTERNS: RegExp[] = [
  /지금\s*행동하지\s*않으면/g,
  /늦기\s*전에/g,
  /더\s*늦으면/g,
  /서두르(세요|셔야)/g,
  /골든\s*타임/g,
  /마지막\s*기회/g,
  /당장\s*결제/g,
  /지금\s*결제하면/g,
];

/** 시간 압박 표현이 포함된 문장인지 검사 */
export function hasPressureLanguage(text: string): boolean {
  return FORBIDDEN_PRESSURE_PATTERNS.some((p) => {
    p.lastIndex = 0;
    return p.test(text);
  });
}

/** 배열에서 압박 표현이 포함된 문장을 통째로 제거 */
export function stripPressureSentences(lines: string[]): string[] {
  return lines.filter((line) => !hasPressureLanguage(line));
}
