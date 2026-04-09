"use client";

import { IndustryContext as IndustryContextType } from "@/types/analysis";

interface Props {
  data: IndustryContextType;
}

const CONTEXTS = [
  { key: "largeEnterprise" as const, icon: "🏢", label: "대기업", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  { key: "sme" as const, icon: "🏪", label: "중소기업", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  { key: "freelance" as const, icon: "🧑‍💻", label: "프리랜서/개인사업", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  { key: "globalTrend" as const, icon: "🌍", label: "글로벌 동향", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
];

export default function IndustryContext({ data }: Props) {
  return (
    <section
      className="rounded-2xl border p-6"
      style={{ background: "#FFFFFF", borderColor: "#EDE9FE", boxShadow: "0 2px 16px rgba(108,99,255,0.07)" }}
    >
      <h2 className="text-lg font-bold mb-1 flex items-center gap-2" style={{ color: "#1E1B4B" }}>
        <span>🏭</span> 업종별 세부 분석
      </h2>
      <p className="text-xs mb-5" style={{ color: "#9CA3AF" }}>같은 직업이라도 환경에 따라 다른 AI 대체 속도</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CONTEXTS.map(({ key, icon, label, color, bg, border }) => (
          <div
            key={key}
            className="rounded-xl p-4 border"
            style={{ background: bg, borderColor: border }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{icon}</span>
              <span className="text-sm font-semibold" style={{ color }}>{label}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{data[key]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
