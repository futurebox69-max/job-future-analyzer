"use client";

import { IndustryContext as IndustryContextType } from "@/types/analysis";

interface Props {
  data: IndustryContextType;
}

const CONTEXTS = [
  { key: "largeEnterprise" as const, icon: "🏢", label: "대기업", color: "#3B82F6" },
  { key: "sme" as const, icon: "🏪", label: "중소기업", color: "#10B981" },
  { key: "freelance" as const, icon: "🧑‍💻", label: "프리랜서/개인사업", color: "#F59E0B" },
  { key: "globalTrend" as const, icon: "🌍", label: "글로벌 동향", color: "#8B5CF6" },
];

export default function IndustryContext({ data }: Props) {
  return (
    <section className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.03)" }}>
      <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
        <span>🏭</span> 업종별 세부 분석
      </h2>
      <p className="text-white/40 text-xs mb-5">같은 직업이라도 환경에 따라 다른 AI 대체 속도</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CONTEXTS.map(({ key, icon, label, color }) => (
          <div
            key={key}
            className="rounded-xl p-4 border"
            style={{ borderColor: `${color}22`, background: `${color}08` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{icon}</span>
              <span className="text-sm font-semibold" style={{ color }}>{label}</span>
            </div>
            <p className="text-white/75 text-sm leading-relaxed">{data[key]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
