"use client";

import { IncomeImpact as IncomeImpactType } from "@/types/analysis";
import { LangCode } from "@/lib/i18n";

interface Props {
  data: IncomeImpactType;
  lang?: LangCode;
}

const LABELS: Record<LangCode, {
  title: string;
  subtitle: string;
  short: string;
  mid: string;
  long: string;
  action_title: string;
}> = {
  ko: {
    title: "💰 소득 영향 예측",
    subtitle: "시간대별 소득 구조 변화 전망",
    short: "📅 단기 (1~3년)",
    mid: "📆 중기 (3~7년)",
    long: "🔭 장기 (7년 이상)",
    action_title: "지금 당장 해야 할 것",
  },
  en: {
    title: "💰 Income Impact Forecast",
    subtitle: "Income structure changes over time",
    short: "📅 Short-term (1~3 yrs)",
    mid: "📆 Mid-term (3~7 yrs)",
    long: "🔭 Long-term (7+ yrs)",
    action_title: "What to Do Right Now",
  },
  zh: {
    title: "💰 收入影响预测",
    subtitle: "各时期收入结构变化预测",
    short: "📅 短期（1~3年）",
    mid: "📆 中期（3~7年）",
    long: "🔭 长期（7年以上）",
    action_title: "现在应该做什么",
  },
  ja: {
    title: "💰 収入影響予測",
    subtitle: "時期別収入構造変化の展望",
    short: "📅 短期（1〜3年）",
    mid: "📆 中期（3〜7年）",
    long: "🔭 長期（7年以上）",
    action_title: "今すぐやるべきこと",
  },
  es: {
    title: "💰 Pronóstico de Impacto en Ingresos",
    subtitle: "Cambios en la estructura de ingresos por período",
    short: "📅 Corto plazo (1~3 años)",
    mid: "📆 Mediano plazo (3~7 años)",
    long: "🔭 Largo plazo (7+ años)",
    action_title: "Qué Hacer Ahora Mismo",
  },
};

export default function IncomeImpact({ data, lang = "ko" }: Props) {
  const L = LABELS[lang];

  return (
    <section
      className="rounded-2xl border p-6"
      style={{ background: "#FFFFFF", borderColor: "#EDE9FE", boxShadow: "0 2px 16px rgba(108,99,255,0.07)" }}
    >
      <h2 className="text-lg font-bold mb-1 flex items-center gap-2" style={{ color: "#1E1B4B" }}>
        <span>💰</span> {L.title.replace("💰 ", "")}
      </h2>
      <p className="text-xs mb-5" style={{ color: "#9CA3AF" }}>{L.subtitle}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="rounded-xl p-4 border" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
          <div className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: "#D97706" }}>
            {L.short}
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{data.shortTerm}</p>
        </div>

        <div className="rounded-xl p-4 border" style={{ background: "#FFF7ED", borderColor: "#FED7AA" }}>
          <div className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: "#EA580C" }}>
            {L.mid}
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{data.midTerm}</p>
        </div>

        <div className="rounded-xl p-4 border" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
          <div className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: "#DC2626" }}>
            {L.long}
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{data.longTerm}</p>
        </div>
      </div>

      {/* 핵심 행동 권고 */}
      <div
        className="rounded-xl p-4 border flex items-start gap-3"
        style={{
          background: "linear-gradient(135deg, #F5F4FF, #EDE9FE)",
          borderColor: "#DDD6FE",
        }}
      >
        <span className="text-2xl">⚡</span>
        <div>
          <div className="font-semibold text-sm mb-1" style={{ color: "#6C63FF" }}>{L.action_title}</div>
          <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{data.recommendation}</p>
        </div>
      </div>
    </section>
  );
}
