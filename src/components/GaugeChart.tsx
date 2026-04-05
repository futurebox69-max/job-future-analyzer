"use client";

import { useEffect, useState } from "react";

interface GaugeChartProps {
  rate: number; // 0-100
  riskLevel: "안전" | "주의" | "위험" | "매우위험";
  jobName: string;
}

const RISK_COLORS = {
  안전: "#22C55E",
  주의: "#F59E0B",
  위험: "#EF4444",
  매우위험: "#DC2626",
};

const RISK_BG = {
  안전: "rgba(34, 197, 94, 0.1)",
  주의: "rgba(245, 158, 11, 0.1)",
  위험: "rgba(239, 68, 68, 0.1)",
  매우위험: "rgba(220, 38, 38, 0.15)",
};

export default function GaugeChart({ rate, riskLevel, jobName }: GaugeChartProps) {
  const [animatedRate, setAnimatedRate] = useState(0);

  // 애니메이션: 0 → rate
  useEffect(() => {
    setAnimatedRate(0);
    const duration = 1200;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedRate(Math.round(eased * rate));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [rate]);

  // SVG 반원 게이지 계산
  const cx = 150;
  const cy = 150;
  const r = 110;
  const strokeWidth = 18;

  // 반원: -180도 ~ 0도 (왼쪽에서 오른쪽)
  const startAngle = Math.PI; // 180도 (왼쪽)
  const endAngle = 0;         // 0도 (오른쪽)
  const totalArc = Math.PI;   // 180도

  const toXY = (angle: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });

  const start = toXY(startAngle);
  const end = toXY(endAngle);

  // 배경 반원 path
  const bgPath = `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;

  // 게이지 path (animatedRate/100 비율)
  const gaugeAngle = startAngle + (totalArc * animatedRate) / 100;
  const gaugeEnd = toXY(gaugeAngle);
  const largeArc = animatedRate > 50 ? 1 : 0;
  const gaugePath =
    animatedRate === 0
      ? ""
      : `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${gaugeEnd.x} ${gaugeEnd.y}`;

  // 바늘 각도
  const needleAngle = startAngle + (totalArc * animatedRate) / 100;
  const needleTip = toXY(needleAngle);

  const color = RISK_COLORS[riskLevel];

  return (
    <div
      className="flex flex-col items-center p-6 rounded-3xl border border-white/10 transition-all duration-500"
      style={{ background: RISK_BG[riskLevel] }}
    >
      {/* SVG 게이지 */}
      <svg width="300" height="170" viewBox="0 0 300 170" className="overflow-visible">
        {/* 배경 트랙 */}
        <path
          d={bgPath}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
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
              stroke="rgba(255,255,255,0.2)"
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
            style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
          />
        )}

        {/* 바늘 */}
        <line
          x1={cx} y1={cy}
          x2={needleTip.x} y2={needleTip.y}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
        <circle cx={cx} cy={cy} r={6} fill={color} />

        {/* 레이블 */}
        <text x={start.x - 8} y={cy + 24} fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle">0%</text>
        <text x={end.x + 8} y={cy + 24} fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle">100%</text>
      </svg>

      {/* 중앙 수치 */}
      <div className="text-center -mt-4">
        <div
          className="text-6xl font-bold tabular-nums"
          style={{ color, textShadow: `0 0 30px ${color}60` }}
        >
          {animatedRate}%
        </div>
        <div className="mt-1 text-white/50 text-sm">AI 대체 가능성</div>
      </div>

      {/* 직업명 + 리스크 레벨 */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-white text-xl font-semibold">{jobName}</span>
        <span
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{
            background: `${color}25`,
            color,
            border: `1px solid ${color}40`,
          }}
        >
          {riskLevel}
        </span>
      </div>
    </div>
  );
}
