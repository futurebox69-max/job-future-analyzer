"use client";

import { TimeHorizon } from "@/types/analysis";

interface Props {
  data: TimeHorizon;
}

const YEARS = [
  { key: "current" as const, label: "현재", color: "#6C63FF" },
  { key: "year3" as const, label: "3년 후", color: "#F59E0B" },
  { key: "year5" as const, label: "5년 후", color: "#EF4444" },
  { key: "year10" as const, label: "10년 후", color: "#DC2626" },
];

function getRiskColor(rate: number): string {
  if (rate < 30) return "#10B981";
  if (rate < 55) return "#F59E0B";
  if (rate < 75) return "#EF4444";
  return "#DC2626";
}

function getRiskLabel(rate: number): string {
  if (rate < 30) return "안전";
  if (rate < 55) return "주의";
  if (rate < 75) return "위험";
  return "매우위험";
}

export default function TimeHorizonChart({ data }: Props) {
  const values = [data.current, data.year3, data.year5, data.year10];

  return (
    <section className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.03)" }}>
      <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
        <span>⏳</span> 시간 지평선 분석
      </h2>
      <p className="text-white/40 text-xs mb-5">AI 대체율의 시간에 따른 변화 예측</p>

      {/* 바 차트 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {YEARS.map((y, i) => {
          const value = values[i];
          const color = getRiskColor(value);
          return (
            <div key={y.key} className="flex flex-col items-center gap-2">
              <span className="text-white/60 text-xs">{y.label}</span>
              <div className="relative w-full h-32 flex items-end justify-center">
                <div
                  className="w-full rounded-t-lg transition-all duration-700"
                  style={{
                    height: `${value}%`,
                    background: `linear-gradient(to top, ${color}cc, ${color}44)`,
                    border: `1px solid ${color}66`,
                    minHeight: "4px",
                  }}
                />
              </div>
              <span className="text-white font-bold text-lg">{value}%</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: `${color}22`, color }}
              >
                {getRiskLabel(value)}
              </span>
            </div>
          );
        })}
      </div>

      {/* 추세선 (SVG) */}
      <div className="mb-5 px-2">
        <svg viewBox="0 0 300 60" className="w-full h-12">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6C63FF" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
          </defs>
          {/* 격자 */}
          {[0, 25, 50, 75, 100].map((v) => (
            <line
              key={v}
              x1="0" y1={60 - (v / 100) * 60}
              x2="300" y2={60 - (v / 100) * 60}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1"
            />
          ))}
          {/* 추세선 */}
          <polyline
            points={values.map((v, i) => `${(i / 3) * 300},${60 - (v / 100) * 60}`).join(" ")}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* 점 */}
          {values.map((v, i) => (
            <circle
              key={i}
              cx={(i / 3) * 300}
              cy={60 - (v / 100) * 60}
              r="4"
              fill={getRiskColor(v)}
              stroke="#0A0A0F"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>

      {/* 내러티브 */}
      <div className="rounded-xl p-4 border border-white/10" style={{ background: "rgba(108,99,255,0.05)" }}>
        <p className="text-white/70 text-sm leading-relaxed">{data.narrative}</p>
      </div>
    </section>
  );
}
