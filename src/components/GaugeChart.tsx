"use client";

import { useEffect, useState } from "react";
import { LangCode } from "@/lib/i18n";

interface GaugeChartProps {
  rate: number; // 0-100
  riskLevel: "안전" | "주의" | "위험" | "매우위험";
  jobName: string;
  lang?: LangCode;
}

const LABELS: Record<LangCode, {
  estimate: string;
  disclaimer: string;
  riskMap: Record<string, string>;
}> = {
  ko: {
    estimate: "현재 트렌드 기반 추정값",
    disclaimer: "이 수치는 현재 기술 트렌드 기반의 추정값입니다. AI 발전 속도와 사회·제도적 변화에 따라 달라질 수 있습니다.",
    riskMap: { 안전: "안전", 주의: "주의", 위험: "위험", 매우위험: "매우위험" },
  },
  en: {
    estimate: "Estimate based on current trends",
    disclaimer: "This figure is an estimate based on current technology trends and may change with AI advancement and societal shifts.",
    riskMap: { 안전: "Safe", 주의: "Caution", 위험: "At Risk", 매우위험: "Critical" },
  },
  zh: {
    estimate: "基于当前趋势的估算值",
    disclaimer: "该数值为基于当前技术趋势的估算值，随AI发展速度和社会制度变化可能有所不同。",
    riskMap: { 안전: "安全", 주의: "注意", 위험: "危险", 매우위험: "极危" },
  },
  ja: {
    estimate: "現在のトレンドに基づく推定値",
    disclaimer: "この数値は現在の技術トレンドに基づく推定値です。AI発展速度や社会・制度的変化により変わる可能性があります。",
    riskMap: { 안전: "安全", 주의: "注意", 위험: "危険", 매우위험: "非常に危険" },
  },
  es: {
    estimate: "Estimación basada en tendencias actuales",
    disclaimer: "Esta cifra es una estimación basada en tendencias tecnológicas actuales y puede cambiar con el avance de la IA y los cambios sociales.",
    riskMap: { 안전: "Seguro", 주의: "Precaución", 위험: "En Riesgo", 매우위험: "Crítico" },
  },
};

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

export default function GaugeChart({ rate, riskLevel, jobName, lang = "ko" }: GaugeChartProps) {
  const [animatedRate, setAnimatedRate] = useState(0);
  const L = LABELS[lang];

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
  const riskLabel = L.riskMap[riskLevel] ?? riskLevel;

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
        <div className="mt-1 text-sm" style={{ color: "#6B7280" }}>{L.estimate}</div>
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
          {riskLabel}
        </span>
      </div>

      {/* 불확실성 안내 */}
      <div className="mt-4 px-4 py-2.5 rounded-xl text-xs text-center" style={{ background: "rgba(0,0,0,0.04)", color: "#9CA3AF" }}>
        ⚠️ {L.disclaimer}
      </div>
    </div>
  );
}
