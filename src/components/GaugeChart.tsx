"use client";

import { useEffect, useState } from "react";

interface GaugeChartProps {
  rate: number; // 0-100
  riskLevel: "안전" | "주의" | "위험" | "매우위험";
  jobName: string;
}

const RISK_COLORS = {
  안전: "#16A34A",
  주의: "#D97706",
  위험: "#DC2626",
  매우위험: "#991B1B",
};

const RISK_BG = {
  안전: "#F0FDF4",
  주의: "#FFFBEB",
  위험: "#FEF2F2",
  매우위험: "#FEF2F2",
};

const RISK_BORDER = {
  안전: "#BBF7D0",
  주의: "#FDE68A",
  위험: "#FECACA",
  매우위험: "#FECACA",
};

export default function GaugeChart({ rate, riskLevel, jobName }: GaugeChartProps) {
  const [animatedRate, setAnimatedRate] = useState(0);

  useEffect(() => {
    setAnimatedRate(0);
    const duration = 1200;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedRate(Math.round(eased * rate));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [rate]);

  const cx = 150;
  const cy = 150;
  const r = 110;
  const strokeWidth = 18;

  const startAngle = Math.PI;
  const endAngle = 0;
  const totalArc = Math.PI;

  const toXY = (angle: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });

  const start = toXY(startAngle);
  const end = toXY(endAngle);

  const bgPath = `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;

  const gaugeAngle = startAngle + (totalArc * animatedRate) / 100;
  const gaugeEnd = toXY(gaugeAngle);
  const largeArc = animatedRate > 50 ? 1 : 0;
  const gaugePath =
    animatedRate === 0
      ? ""
      : `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${gaugeEnd.x} ${gaugeEnd.y}`;

  const needleAngle = startAngle + (totalArc * animatedRate) / 100;
  const needleTip = toXY(needleAngle);

  const color = RISK_COLORS[riskLevel];

  return (
    <div
      className="flex flex-col items-center p-6 rounded-3xl border transition-all duration-500"
      style={{
        background: RISK_BG[riskLevel],
        borderColor: RISK_BORDER[riskLevel],
        boxShadow: "0 4px 24px rgba(108,99,255,0.08)",
      }}
    >
      <svg width="300" height="170" viewBox="0 0 300 170" className="overflow-visible">
        {/* 배경 트랙 */}
        <path
          d={bgPath}
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* 눈금 */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = startAngle + (totalArc * tick) / 100;
          const inner = { x: cx + (r - 14) * Math.cos(angle), y: cy + (r - 14) * Math.sin(angle) };
          const outer = { x: cx + (r + 8) * Math.cos(angle), y: cy + (r + 8) * Math.sin(angle) };
          return (
            <line
              key={tick}
              x1={inner.x} y1={inner.y}
              x2={outer.x} y2={outer.y}
              stroke="rgba(0,0,0,0.15)"
              strokeWidth={2}
            />
          );
        })}

        {/* 게이지 채우기 */}
        {gaugePath && (
          <path
            d={gaugePath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}50)` }}
          />
        )}

        {/* 바늘 */}
        <line
          x1={cx} y1={cy}
          x2={needleTip.x} y2={needleTip.y}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={6} fill={color} />
        <circle cx={cx} cy={cy} r={3} fill="#FFFFFF" />

        {/* 레이블 */}
        <text x={start.x - 8} y={cy + 24} fill="#9CA3AF" fontSize="11" textAnchor="middle">0%</text>
        <text x={end.x + 8} y={cy + 24} fill="#9CA3AF" fontSize="11" textAnchor="middle">100%</text>
      </svg>

      {/* 중앙 수치 */}
      <div className="text-center -mt-4">
        <div
          className="text-6xl font-bold tabular-nums"
          style={{ color }}
        >
          {animatedRate}%
        </div>
        <div className="mt-1 text-sm" style={{ color: "#6B7280" }}>AI 대체 가능성</div>
      </div>

      {/* 직업명 + 리스크 레벨 */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-xl font-semibold" style={{ color: "#1E1B4B" }}>{jobName}</span>
        <span
          className="px-3 py-1 rounded-full text-sm font-semibold"
          style={{
            background: `${color}18`,
            color,
            border: `1.5px solid ${color}40`,
          }}
        >
          {riskLevel}
        </span>
      </div>
    </div>
  );
}
