"use client";

import { IncomeImpact as IncomeImpactType } from "@/types/analysis";

interface Props {
  data: IncomeImpactType;
}

export default function IncomeImpact({ data }: Props) {
  return (
    <section className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.03)" }}>
      <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
        <span>💰</span> 소득 영향 예측
      </h2>
      <p className="text-white/40 text-xs mb-5">시간대별 소득 구조 변화 전망</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="rounded-xl p-4 border border-yellow-500/20" style={{ background: "rgba(245,158,11,0.05)" }}>
          <div className="text-yellow-400 text-xs font-semibold mb-2 flex items-center gap-1">
            <span>📅</span> 단기 (1~3년)
          </div>
          <p className="text-white/80 text-sm leading-relaxed">{data.shortTerm}</p>
        </div>

        <div className="rounded-xl p-4 border border-orange-500/20" style={{ background: "rgba(249,115,22,0.05)" }}>
          <div className="text-orange-400 text-xs font-semibold mb-2 flex items-center gap-1">
            <span>📆</span> 중기 (3~7년)
          </div>
          <p className="text-white/80 text-sm leading-relaxed">{data.midTerm}</p>
        </div>

        <div className="rounded-xl p-4 border border-red-500/20" style={{ background: "rgba(239,68,68,0.05)" }}>
          <div className="text-red-400 text-xs font-semibold mb-2 flex items-center gap-1">
            <span>🔭</span> 장기 (7년 이상)
          </div>
          <p className="text-white/80 text-sm leading-relaxed">{data.longTerm}</p>
        </div>
      </div>

      {/* 핵심 행동 권고 */}
      <div
        className="rounded-xl p-4 border border-purple-500/30 flex items-start gap-3"
        style={{ background: "linear-gradient(135deg, rgba(108,99,255,0.1), rgba(167,139,250,0.05))" }}
      >
        <span className="text-2xl">⚡</span>
        <div>
          <div className="text-purple-300 font-semibold text-sm mb-1">지금 당장 해야 할 것</div>
          <p className="text-white/90 text-sm leading-relaxed">{data.recommendation}</p>
        </div>
      </div>
    </section>
  );
}
