"use client";

import { useEffect, useState } from "react";
import { AnalysisResult } from "@/types/analysis";

interface Props {
  dimensions: AnalysisResult["dimensions"];
}

const DIMENSION_ORDER = [
  "repetitive",
  "cognitive",
  "physical",
  "creative",
  "social",
  "ethical",
  "techVelocity",
  "regulatory",
] as const;

const INVERSE_DIMS = new Set(["regulatory"]);

function getBarColor(score: number, inverse = false): string {
  const effective = inverse ? 100 - score : score;
  if (effective < 30) return "#16A34A";
  if (effective < 55) return "#D97706";
  if (effective < 75) return "#DC2626";
  return "#991B1B";
}

const WEIGHTS: Record<string, string> = {
  repetitive: "20%",
  cognitive: "18%",
  physical: "10%",
  creative: "12%",
  social: "12%",
  ethical: "8%",
  techVelocity: "12%",
  regulatory: "8% (역방향)",
};

export default function SixDimensions({ dimensions }: Props) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, [dimensions]);

  return (
    <div
      className="rounded-3xl border p-6"
      style={{ background: "#FFFFFF", borderColor: "#EDE9FE", boxShadow: "0 2px 16px rgba(108,99,255,0.07)" }}
    >
      <h3 className="font-semibold text-lg mb-1 flex items-center gap-2" style={{ color: "#1E1B4B" }}>
        📊 8차원 분석
      </h3>
      <p className="text-xs mb-5" style={{ color: "#9CA3AF" }}>각 차원의 AI 대체 가능성 점수 (0% = 안전, 100% = 위험)</p>

      <div className="space-y-5">
        {DIMENSION_ORDER.map((key) => {
          const dim = dimensions[key];
          const isInverse = INVERSE_DIMS.has(key);
          const color = getBarColor(dim.score, isInverse);
          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm flex items-center gap-2" style={{ color: "#374151" }}>
                  <span>{dim.icon}</span>
                  <span>{dim.label}</span>
                  {isInverse && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ color: "#16A34A", background: "#F0FDF4", border: "1px solid #BBF7D0" }}>보호막</span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "#9CA3AF" }}>{WEIGHTS[key]}</span>
                  <span className="text-sm font-semibold tabular-nums" style={{ color }}>
                    {dim.score}%
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: animated ? `${dim.score}%` : "0%",
                    background: `linear-gradient(90deg, ${color}70, ${color})`,
                  }}
                />
              </div>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "#6B7280" }}>{dim.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t" style={{ borderColor: "#F3F4F6" }}>
        <p className="text-xs text-center" style={{ color: "#9CA3AF" }}>
          가중치: 반복업무 20% · 인지판단 18% · 기술속도 12% · 창의성 12% · 대인관계 12% · 신체작업 10% · 윤리법적 8% · 제도보호 −8%
        </p>
      </div>
    </div>
  );
}
