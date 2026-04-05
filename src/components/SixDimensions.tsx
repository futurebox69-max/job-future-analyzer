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

// regulatory는 역방향 — 높을수록 안전(낮은 대체율)
const INVERSE_DIMS = new Set(["regulatory"]);

function getBarColor(score: number, inverse = false): string {
  const effective = inverse ? 100 - score : score;
  if (effective < 30) return "#22C55E";
  if (effective < 55) return "#F59E0B";
  if (effective < 75) return "#EF4444";
  return "#DC2626";
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
    <div className="bg-white/5 rounded-3xl border border-white/10 p-6">
      <h3 className="text-white font-semibold text-lg mb-1 flex items-center gap-2">
        📊 8차원 분석
      </h3>
      <p className="text-white/30 text-xs mb-5">각 차원의 AI 대체 가능성 점수 (0% = 안전, 100% = 위험)</p>

      <div className="space-y-5">
        {DIMENSION_ORDER.map((key) => {
          const dim = dimensions[key];
          const isInverse = INVERSE_DIMS.has(key);
          const color = getBarColor(dim.score, isInverse);
          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-white/80 text-sm flex items-center gap-2">
                  <span>{dim.icon}</span>
                  <span>{dim.label}</span>
                  {isInverse && (
                    <span className="text-xs text-emerald-400/70 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">보호막</span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-xs">{WEIGHTS[key]}</span>
                  <span className="text-sm font-semibold tabular-nums" style={{ color }}>
                    {dim.score}%
                  </span>
                </div>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: animated ? `${dim.score}%` : "0%",
                    background: `linear-gradient(90deg, ${color}80, ${color})`,
                    boxShadow: `0 0 8px ${color}60`,
                  }}
                />
              </div>
              <p className="text-white/40 text-xs mt-1 leading-relaxed">{dim.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-white/10">
        <p className="text-white/25 text-xs text-center">
          가중치: 반복업무 20% · 인지판단 18% · 기술속도 12% · 창의성 12% · 대인관계 12% · 신체작업 10% · 윤리법적 8% · 제도보호 −8%
        </p>
      </div>
    </div>
  );
}
