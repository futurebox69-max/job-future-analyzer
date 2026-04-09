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
      <p className="text-xs mb-3" style={{ color: "#9CA3AF" }}>각 차원의 AI 대체 가능성 점수 (0% = 안전, 100% = 위험)</p>

      {/* 왜 8차원인가 */}
      <div className="rounded-xl p-4 mb-5 border" style={{ background: "#F5F4FF", borderColor: "#EDE9FE" }}>
        <p className="text-xs font-semibold mb-2" style={{ color: "#6C63FF" }}>💡 왜 8차원으로 분석하나요?</p>
        <p className="text-xs leading-relaxed" style={{ color: "#4B5563" }}>
          단순히 "자동화 가능 여부"만 보는 기존 연구와 달리, 이 분석은 <strong>AI가 대체하기 쉬운 요소</strong>와 <strong>인간만이 가진 강점</strong>을 함께 측정합니다.
        </p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "#DC2626" }}>🤖 AI 대체 위험 요소 (높을수록 위험)</p>
            <ul className="text-xs space-y-0.5" style={{ color: "#6B7280" }}>
              <li>• <strong>반복 업무 (20%)</strong> — RPA·AI가 가장 먼저 대체</li>
              <li>• <strong>인지적 판단 (18%)</strong> — 표준화된 의사결정</li>
              <li>• <strong>기술 변화 속도 (12%)</strong> — 해당 분야 AI 발전 속도</li>
              <li>• <strong>신체적 작업 (10%)</strong> — 로봇공학 대체 가능성</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "#16A34A" }}>🛡️ 인간 고유 강점 (높을수록 안전)</p>
            <ul className="text-xs space-y-0.5" style={{ color: "#6B7280" }}>
              <li>• <strong>창의성·감성 (12%)</strong> — AI가 흉내 내기 어려운 영역</li>
              <li>• <strong>대인관계·소통 (12%)</strong> — 신뢰·공감·협상</li>
              <li>• <strong>윤리·법적 판단 (8%)</strong> — 책임과 재량이 필요한 결정</li>
              <li>• <strong>제도적 보호막 (8%, 역방향)</strong> — 면허·규제가 AI를 막는 힘</li>
            </ul>
          </div>
        </div>
        <p className="text-xs mt-3 pt-2 border-t" style={{ borderColor: "#EDE9FE", color: "#9CA3AF" }}>
          참고: Frey &amp; Osborne (2013·2023) · O*NET · McKinsey Global Institute (2023) · WEF Future of Jobs (2025) · Autor (2022) · EU AI Act (2024)
        </p>
      </div>

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
