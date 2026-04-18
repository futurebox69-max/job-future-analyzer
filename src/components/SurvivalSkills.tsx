"use client";

import { SurvivalSkill } from "@/types/analysis";
import { LangCode } from "@/lib/i18n";

interface Props {
  skills: SurvivalSkill[];
  jobName: string;
  lang?: LangCode;
}

const LABELS: Record<LangCode, {
  badge: string;
  title: string;
  subtitle: (job: string) => string;
  reason_label: string;
  action_label: string;
}> = {
  ko: {
    badge: "🛡️ AI 시대 생존 전략",
    title: "살아남는 스킬 3가지",
    subtitle: (job) => `${job}이(가) AI 시대에도 살아남으려면 이 3가지가 핵심입니다`,
    reason_label: "대체 불가 이유",
    action_label: "오늘의 실천",
  },
  en: {
    badge: "🛡️ AI Era Survival Strategy",
    title: "3 Skills That Will Save Your Career",
    subtitle: (job) => `These 3 skills are critical for ${job} to survive the AI era`,
    reason_label: "Why AI Can't Replace It",
    action_label: "Action Today",
  },
  zh: {
    badge: "🛡️ AI时代生存策略",
    title: "3项必备生存技能",
    subtitle: (job) => `${job}在AI时代生存的3项核心能力`,
    reason_label: "为何AI无法替代",
    action_label: "今日行动",
  },
  ja: {
    badge: "🛡️ AI時代の生存戦略",
    title: "生き残る3つのスキル",
    subtitle: (job) => `${job}がAI時代を生き残るための3つの核心スキル`,
    reason_label: "AI代替不可の理由",
    action_label: "今日の実践",
  },
  es: {
    badge: "🛡️ Estrategia de Supervivencia en la Era IA",
    title: "3 Habilidades para Sobrevivir",
    subtitle: (job) => `Estas 3 habilidades son clave para que ${job} sobreviva en la era IA`,
    reason_label: "Por qué la IA no puede reemplazarlo",
    action_label: "Acción de Hoy",
  },
};

const CARD_COLORS = [
  { bg: "#F0FDF4", border: "#86EFAC", accent: "#16A34A", num: "#DCFCE7" },
  { bg: "#EFF6FF", border: "#93C5FD", accent: "#2563EB", num: "#DBEAFE" },
  { bg: "#FFF7ED", border: "#FED7AA", accent: "#EA580C", num: "#FFEDD5" },
];

export default function SurvivalSkills({ skills, jobName, lang = "ko" }: Props) {
  const L = LABELS[lang];

  return (
    <section
      className="rounded-2xl border p-4 sm:p-6"
      style={{
        background: "linear-gradient(135deg, #F8F7FF 0%, #FEFCE8 100%)",
        borderColor: "#DDD6FE",
        boxShadow: "0 4px 24px rgba(108,99,255,0.10)",
      }}
    >
      {/* 헤더 */}
      <div className="mb-5">
        <span
          className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3"
          style={{ background: "#EDE9FE", color: "#6C63FF" }}
        >
          {L.badge}
        </span>
        <h2
          className="text-xl font-black mb-1"
          style={{ color: "#1E1B4B", letterSpacing: "-0.3px" }}
        >
          {L.title}
        </h2>
        <p className="text-sm" style={{ color: "#6B7280" }}>
          {L.subtitle(jobName)}
        </p>
      </div>

      {/* 스킬 카드 3개 */}
      <div className="space-y-3">
        {skills.map((s, i) => {
          const color = CARD_COLORS[i];
          return (
            <div
              key={i}
              className="rounded-xl p-4 border flex gap-4 items-start"
              style={{ background: color.bg, borderColor: color.border }}
            >
              {/* 번호 + 이모지 */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                  style={{ background: color.num, color: color.accent }}
                >
                  {i + 1}
                </span>
                <span className="text-2xl leading-none">{s.icon}</span>
              </div>

              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base mb-2" style={{ color: "#1E1B4B" }}>
                  {s.skill}
                </p>

                {/* 대체 불가 이유 */}
                <div className="flex items-start gap-1.5 mb-2">
                  <span
                    className="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5"
                    style={{ background: `${color.accent}15`, color: color.accent }}
                  >
                    {L.reason_label}
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
                    {s.reason}
                  </p>
                </div>

                {/* 오늘의 실천 */}
                <div
                  className="flex items-start gap-2 rounded-lg p-2.5"
                  style={{ background: "rgba(255,255,255,0.7)", border: `1px solid ${color.border}` }}
                >
                  <span className="text-sm">⚡</span>
                  <div>
                    <span className="text-xs font-bold" style={{ color: color.accent }}>
                      {L.action_label}&nbsp;
                    </span>
                    <span className="text-sm" style={{ color: "#374151" }}>
                      {s.action}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
