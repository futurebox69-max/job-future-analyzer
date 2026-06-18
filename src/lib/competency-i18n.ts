/**
 * 미래역량(competency) 기능 전용 다국어 모듈.
 * 역량 이름·아키타입·결과 문장처럼 한국어 조사/어순이 섞여 단어 치환이 불가능한
 * 텍스트는 언어별 문장 빌더로 처리한다. (영어 우선, zh·ja·es는 영어로 폴백)
 */
import { CompetencyKey } from "@/types/competency";
import { Loc, LangCode, loc } from "@/lib/i18n";

/** 6개 역량 축의 표시 이름 */
export const COMPETENCY_NAME: Record<CompetencyKey, Loc> = {
  structural: { ko: "구조적 사고",   en: "Structural Thinking" },
  creative:   { ko: "창의적 재설계", en: "Creative Redesign" },
  emotional:  { ko: "감성 연결",     en: "Emotional Connection" },
  adaptive:   { ko: "적응 민첩성",   en: "Adaptive Agility" },
  ethical:    { ko: "윤리적 판단",   en: "Ethical Judgment" },
  collab:     { ko: "협업 지능",     en: "Collaborative Intelligence" },
};

export function competencyName(key: CompetencyKey, lang: LangCode): string {
  return loc(COMPETENCY_NAME[key], lang);
}

/** 최상위 역량으로 정해지는 아키타입(결의 씨앗) */
export const ARCHETYPE_LOC: Record<
  CompetencyKey,
  { emoji: string; title: Loc; subtitle: Loc }
> = {
  structural: {
    emoji: "🧩",
    title: { ko: "구조 해석자", en: "The Structure Reader" },
    subtitle: { ko: "복잡한 세상의 지도를 그리는 사람", en: "Maps the complexity of the world" },
  },
  creative: {
    emoji: "🎨",
    title: { ko: "재설계자", en: "The Redesigner" },
    subtitle: { ko: "틀을 깨고 새로운 가능성을 여는 사람", en: "Breaks the mold and opens new possibilities" },
  },
  emotional: {
    emoji: "💫",
    title: { ko: "감성 연결자", en: "The Connector" },
    subtitle: { ko: "기술이 닿지 못하는 마음을 돌보는 사람", en: "Tends to the hearts technology can't reach" },
  },
  adaptive: {
    emoji: "⚡",
    title: { ko: "변화 서퍼", en: "The Change Surfer" },
    subtitle: { ko: "파도를 두려워하지 않고 타는 사람", en: "Rides the waves instead of fearing them" },
  },
  ethical: {
    emoji: "⚖️",
    title: { ko: "기술의 양심", en: "The Conscience" },
    subtitle: { ko: "할 수 있다와 해야 한다 사이의 판단자", en: "Judges between 'can' and 'should'" },
  },
  collab: {
    emoji: "🤝",
    title: { ko: "시너지 설계자", en: "The Synergy Designer" },
    subtitle: { ko: "사람과 AI의 다리를 놓는 사람", en: "Builds the bridge between people and AI" },
  },
};

export function archetypeLabel(
  topKey: CompetencyKey,
  lang: LangCode
): { emoji: string; title: string; subtitle: string } {
  const a = ARCHETYPE_LOC[topKey];
  return { emoji: a.emoji, title: loc(a.title, lang), subtitle: loc(a.subtitle, lang) };
}

/** 결과 탭의 고정 라벨 */
export const RESULT_LABELS: Record<string, Loc> = {
  my_type:        { ko: "나의 미래역량 유형", en: "My Future-Competency Type" },
  profile_6d:     { ko: "6차원 미래역량 프로필", en: "6-Dimension Competency Profile" },
  cross_title:    { ko: "AI 대체율 × 역량 교차 분석", en: "AI Risk × Competency Cross-Analysis" },
  strategy_title: { ko: "맞춤 성장 전략", en: "Personalized Growth Strategy" },
  meta_title:     { ko: "사고방식 메타분석", en: "Thinking-Style Meta-Analysis" },
  strength_tag:   { ko: "강점", en: "Strength" },
  weak_tag:       { ko: "보완", en: "To improve" },
  chosen_qtype:   { ko: "선택한 질문 유형", en: "Chosen question style" },
  avg_time:       { ko: "평균 응답 시간", en: "Average response time" },
};

export function resultLabel(key: string, lang: LangCode): string {
  return loc(RESULT_LABELS[key], lang);
}

/** "AI 대체율 X%인 {직업}에서 가장 중요한 역량은 …" 교차분석 문장 */
export function crossAnalysisText(
  lang: LangCode,
  args: { risk: number; jobName: string; importantNames: string[]; topName: string; isCore: boolean }
): string {
  const { risk, jobName, importantNames, topName, isCore } = args;
  const important = importantNames.join(", ");
  if (lang === "ko") {
    const tail = isCore
      ? "이 직업의 핵심 생존 역량입니다!"
      : "보조적 강점으로 활용할 수 있습니다.";
    return `AI 대체율 ${risk}%인 ${jobName}에서 가장 중요한 역량은 ${important}이며, 당신의 최고 역량 ${topName}은 ${tail}`;
  }
  const tail = isCore
    ? "is a core survival skill for this job!"
    : "can be leveraged as a supporting strength.";
  return `For ${jobName}, with an AI replacement risk of ${risk}%, the most important competencies are ${important}. Your top competency, ${topName}, ${tail}`;
}

/** 맞춤 성장 전략 3가지 */
export function growthActions(
  lang: LangCode,
  args: { strengthName?: string; weakName?: string; topName: string; risk: number }
): string[] {
  const { strengthName, weakName, topName, risk } = args;
  if (lang === "ko") {
    return [
      strengthName
        ? `${strengthName}을(를) 살려 AI와 협업하는 역할을 선점하세요`
        : `${topName}을(를) 핵심 차별화 포인트로 의식적으로 강화하세요`,
      weakName
        ? `${weakName} 역량 강화가 시급합니다 — 관련 프로젝트나 학습을 시작하세요`
        : `현재 역량 균형이 좋습니다. AI 도구 활용법 학습에 집중하세요`,
      risk >= 70
        ? `AI 대체율이 높은 직업이므로 3년 내 역할 전환을 구체적으로 계획하세요`
        : risk >= 40
        ? `지금이 역량 업그레이드의 적기입니다. AI 협업 포지션을 확보하세요`
        : `비교적 안전한 직업이지만 ${topName}으로 더욱 차별화할 수 있습니다`,
    ];
  }
  return [
    strengthName
      ? `Lean on your ${strengthName} to claim a role that collaborates with AI`
      : `Deliberately strengthen ${topName} as your key point of differentiation`,
    weakName
      ? `Strengthening ${weakName} is urgent — start a related project or course`
      : `Your competencies are well balanced. Focus on mastering AI tools`,
    risk >= 70
      ? `This job has a high AI replacement risk — make a concrete plan to shift roles within 3 years`
      : risk >= 40
      ? `Now is the right time to upgrade. Secure an AI-collaboration position`
      : `This job is relatively safe, but you can differentiate further with ${topName}`,
  ];
}

/** 메타분석 문장: 정보 처리 방식 선호 */
export function metaProcessingText(lang: LangCode, meaning: string): string {
  return lang === "ko"
    ? `→ ${meaning} 정보 처리 방식을 선호합니다.`
    : `→ You prefer a ${meaning.toLowerCase()} way of processing information.`;
}

/** 메타분석 문장: 응답 스타일 */
export function metaStyleText(lang: LangCode, style: string): string {
  return lang === "ko" ? `→ ${style}입니다.` : `→ ${style}.`;
}

/** 평균 응답 시간 단위 (예: "4.2초" / "4.2s") */
export function seconds(lang: LangCode, value: number): string {
  return lang === "ko" ? `${value.toFixed(1)}초` : `${value.toFixed(1)}s`;
}

/** 깊이 라벨 (RF 코드 가져오기 결과용) */
export function depthLabel(lang: LangCode, depth: 1 | 2): string {
  if (lang === "ko") return depth === 2 ? "2층 프로파일 (14문항)" : "1층 스냅샷 (8문항)";
  return depth === 2 ? "Layer 2 Profile (14 questions)" : "Layer 1 Snapshot (8 questions)";
}

/** RF 코드에서 가져온 결과의 메타분석 문구 */
export function importedMeta(lang: LangCode, depth: 1 | 2): { meaning: string; style: string } {
  const dl = depthLabel(lang, depth);
  if (lang === "ko") {
    return {
      meaning: `역량의 지도에서 가져온 결과 · ${dl}`,
      style: "역량의 지도 검사 결과를 가져왔습니다",
    };
  }
  return {
    meaning: `Imported from the Competency Map · ${dl}`,
    style: "Imported from your Competency Map assessment",
  };
}
