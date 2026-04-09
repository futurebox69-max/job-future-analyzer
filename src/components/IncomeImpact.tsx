"use client";

import { IncomeImpact as IncomeImpactType } from "@/types/analysis";

interface Props {
  data: IncomeImpactType;
}

export default function IncomeImpact({ data }: Props) {
  return (
    <section
      className="rounded-2xl border p-6"
      style={{ background: "#FFFFFF", borderColor: "#EDE9FE", boxShadow: "0 2px 16px rgba(108,99,255,0.07)" }}
    >
      <h2 className="text-lg font-bold mb-1 flex items-center gap-2" style={{ color: "#1E1B4B" }}>
        <span>💰</span> 소득 영향 예측
      </h2>
      <p className="text-xs mb-5" style={{ color: "#9CA3AF" }}>시간대별 소득 구조 변화 전망</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="rounded-xl p-4 border" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
          <div className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: "#D97706" }}>
            <span>📅</span> 단기 (1~3년)
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{data.shortTerm}</p>
        </div>

        <div className="rounded-xl p-4 border" style={{ background: "#FFF7ED", borderColor: "#FED7AA" }}>
          <div className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: "#EA580C" }}>
            <span>📆</span> 중기 (3~7년)
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{data.midTerm}</p>
        </div>

        <div className="rounded-xl p-4 border" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
          <div className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: "#DC2626" }}>
            <span>🔭</span> 장기 (7년 이상)
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
          <div className="font-semibold text-sm mb-1" style={{ color: "#6C63FF" }}>지금 당장 해야 할 것</div>
          <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{data.recommendation}</p>
        </div>
      </div>
    </section>
  );
}
