"use client";

import { SkillGap } from "@/types/analysis";
import { LangCode } from "@/lib/i18n";

interface Props {
  data: SkillGap;
  lang?: LangCode;
}

const LABELS: Record<LangCode, {
  title: string;
  subtitle: string;
  urgency_prefix: string;
  keep: string;
  lose: string;
  gain: string;
  urgency_now: string;
  urgency_1y: string;
  urgency_3y: string;
}> = {
  ko: {
    title: "스킬 갭 분석",
    subtitle: "AI 시대에 지켜야 할 스킬 vs 버려야 할 스킬",
    urgency_prefix: "전환 긴급도:",
    keep: "AI가 못 대체하는 스킬",
    lose: "빠르게 사라질 스킬",
    gain: "AI 활용으로 증폭할 역량",
    urgency_now: "즉시",
    urgency_1y: "1년 내",
    urgency_3y: "3년 내",
  },
  en: {
    title: "Skill Gap Analysis",
    subtitle: "Skills to keep vs. skills to abandon in the AI era",
    urgency_prefix: "Transition Urgency:",
    keep: "Skills AI Can't Replace",
    lose: "Skills Fading Fast",
    gain: "Skills to Amplify with AI",
    urgency_now: "Immediate",
    urgency_1y: "Within 1 Year",
    urgency_3y: "Within 3 Years",
  },
  zh: {
    title: "技能差距分析",
    subtitle: "AI时代需保留与放弃的技能",
    urgency_prefix: "转型紧迫度:",
    keep: "AI无法替代的技能",
    lose: "即将消失的技能",
    gain: "借助AI放大的能力",
    urgency_now: "立即",
    urgency_1y: "1年内",
    urgency_3y: "3年内",
  },
  ja: {
    title: "スキルギャップ分析",
    subtitle: "AI時代に守るべきスキルvs捨てるべきスキル",
    urgency_prefix: "転換緊急度:",
    keep: "AIが代替できないスキル",
    lose: "急速に消えるスキル",
    gain: "AIで増幅できる能力",
    urgency_now: "即時",
    urgency_1y: "1年以内",
    urgency_3y: "3年以内",
  },
  es: {
    title: "Análisis de Brecha de Habilidades",
    subtitle: "Habilidades a mantener vs. abandonar en la era IA",
    urgency_prefix: "Urgencia de Transición:",
    keep: "Habilidades que la IA No Puede Reemplazar",
    lose: "Habilidades que Desaparecen Rápido",
    gain: "Habilidades a Ampliar con IA",
    urgency_now: "Inmediato",
    urgency_1y: "En 1 Año",
    urgency_3y: "En 3 Años",
  },
};

// 긴급도 한국어 원본 → 언어별 번역
const URGENCY_MAP: Record<LangCode, Record<string, string>> = {
  ko: { "즉시": "즉시", "1년 내": "1년 내", "3년 내": "3년 내" },
  en: { "즉시": "Immediate", "1년 내": "Within 1 Year", "3년 내": "Within 3 Years" },
  zh: { "즉시": "立即", "1년 내": "1年内", "3년 내": "3年内" },
  ja: { "즉시": "即時", "1년 내": "1年以内", "3년 내": "3年以内" },
  es: { "즉시": "Inmediato", "1년 내": "En 1 Año", "3년 내": "En 3 Años" },
};

const URGENCY_COLOR: Record<string, string> = {
  "즉시": "#DC2626",
  "1년 내": "#D97706",
  "3년 내": "#16A34A",
};

export default function SkillGapAnalysis({ data, lang = "ko" }: Props) {
  const L = LABELS[lang];
  const urgencyColor = URGENCY_COLOR[data.urgency] ?? "#6C63FF";
  const urgencyLabel = URGENCY_MAP[lang][data.urgency] ?? data.urgency;

  return (
    <section
      className="rounded-2xl border p-6"
      style={{ background: "#FFFFFF", borderColor: "#EDE9FE", boxShadow: "0 2px 16px rgba(108,99,255,0.07)" }}
    >
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "#1E1B4B" }}>
          <span>🎯</span> {L.title}
        </h2>
        <span
          className="text-xs px-3 py-1 rounded-full font-semibold"
          style={{ background: `${urgencyColor}15`, color: urgencyColor, border: `1.5px solid ${urgencyColor}35` }}
        >
          {L.urgency_prefix} {urgencyLabel}
        </span>
      </div>
      <p className="text-xs mb-5" style={{ color: "#9CA3AF" }}>{L.subtitle}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 유지 스킬 */}
        <div className="rounded-xl p-4 border" style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🛡️</span>
            <span className="font-semibold text-sm" style={{ color: "#16A34A" }}>{L.keep}</span>
          </div>
          <ul className="space-y-2">
            {data.keepSkills.map((skill, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 text-xs font-bold" style={{ color: "#16A34A" }}>✓</span>
                <span className="text-sm" style={{ color: "#374151" }}>{skill}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 사라질 스킬 */}
        <div className="rounded-xl p-4 border" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚠️</span>
            <span className="font-semibold text-sm" style={{ color: "#DC2626" }}>{L.lose}</span>
          </div>
          <ul className="space-y-2">
            {data.loseSkills.map((skill, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 text-xs font-bold" style={{ color: "#DC2626" }}>✗</span>
                <span className="text-sm line-through" style={{ color: "#9CA3AF", textDecorationColor: "#FCA5A5" }}>{skill}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* AI로 증폭할 역량 */}
        <div className="rounded-xl p-4 border" style={{ background: "#F5F4FF", borderColor: "#DDD6FE" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🤖</span>
            <span className="font-semibold text-sm" style={{ color: "#6C63FF" }}>{L.gain}</span>
          </div>
          <ul className="space-y-2">
            {data.gainSkills.map((skill, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 text-xs font-bold" style={{ color: "#6C63FF" }}>→</span>
                <span className="text-sm font-medium" style={{ color: "#374151" }}>{skill}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
