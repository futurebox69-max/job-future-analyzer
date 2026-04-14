"use client";

import { TimeHorizon } from "@/types/analysis";
import { LangCode } from "@/lib/i18n";

interface Props {
  data: TimeHorizon;
  lang?: LangCode;
}

const LABELS: Record<LangCode, {
  title: string;
  subtitle: string;
  now: string;
  y3: string;
  y5: string;
  y10: string;
  riskMap: Record<string, string>;
}> = {
  ko: {
    title: "⏳ 시간 지평선 분석",
    subtitle: "AI 대체율의 시간에 따른 변화 예측",
    now: "현재",
    y3: "3년 후",
    y5: "5년 후",
    y10: "10년 후",
    riskMap: { safe: "안전", caution: "주의", danger: "위험", critical: "매우위험" },
  },
  en: {
    title: "⏳ Time Horizon Analysis",
    subtitle: "AI replacement rate forecast over time",
    now: "Now",
    y3: "3 Years",
    y5: "5 Years",
    y10: "10 Years",
    riskMap: { safe: "Safe", caution: "Caution", danger: "At Risk", critical: "Critical" },
  },
  zh: {
    title: "⏳ 时间跨度分析",
    subtitle: "AI替代率随时间变化预测",
    now: "当前",
    y3: "3年后",
    y5: "5年后",
    y10: "10年后",
    riskMap: { safe: "安全", caution: "注意", danger: "危险", critical: "极危" },
  },
  ja: {
    title: "⏳ 時間的展望分析",
    subtitle: "AI代替率の時間的変化予測",
    now: "現在",
    y3: "3年後",
    y5: "5年後",
    y10: "10年後",
    riskMap: { safe: "安全", caution: "注意", danger: "危険", critical: "非常に危険" },
  },
  es: {
    title: "⏳ Análisis de Horizonte Temporal",
    subtitle: "Pronóstico de la tasa de reemplazo IA a lo largo del tiempo",
    now: "Ahora",
    y3: "3 Años",
    y5: "5 Años",
    y10: "10 Años",
    riskMap: { safe: "Seguro", caution: "Precaución", danger: "En Riesgo", critical: "Crítico" },
  },
};

function getRiskColor(rate: number): string {
  if (rate < 30) return "#16A34A";
  if (rate < 55) return "#D97706";
  if (rate < 75) return "#DC2626";
  return "#991B1B";
}

function getRiskKey(rate: number): string {
  if (rate < 30) return "safe";
  if (rate < 55) return "caution";
  if (rate < 75) return "danger";
  return "critical";
}

export default function TimeHorizonChart({ data, lang = "ko" }: Props) {
  const L = LABELS[lang];
  const values = [data.current, data.year3, data.year5, data.year10];
  const YEARS = [
    { key: "current" as const, label: L.now },
    { key: "year3" as const, label: L.y3 },
    { key: "year5" as const, label: L.y5 },
    { key: "year10" as const, label: L.y10 },
  ];

  return (
    <section
      className="rounded-2xl border p-4 sm:p-6"
      style={{ background: "#FFFFFF", borderColor: "#EDE9FE", boxShadow: "0 2px 16px rgba(108,99,255,0.07)" }}
    >
      <h2 className="text-lg font-bold mb-1 flex items-center gap-2" style={{ color: "#1E1B4B" }}>
        <span>⏳</span> {L.title.replace("⏳ ", "")}
      </h2>
      <p className="text-sm mb-5" style={{ color: "#9CA3AF" }}>{L.subtitle}</p>

      {/* 바 차트 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {YEARS.map((y, i) => {
          const value = values[i];
          const color = getRiskColor(value);
          const riskKey = getRiskKey(value);
          return (
            <div key={y.key} className="flex flex-col items-center gap-2">
              <span className="text-sm" style={{ color: "#6B7280" }}>{y.label}</span>
              <div className="relative w-full h-32 flex items-end justify-center">
                <div
                  className="w-full rounded-t-lg transition-all duration-700"
                  style={{
                    height: `${value}%`,
                    background: `linear-gradient(to top, ${color}, ${color}55)`,
                    border: `1px solid ${color}40`,
                    minHeight: "4px",
                    boxShadow: `0 2px 8px ${color}30`,
                  }}
                />
              </div>
              <span className="font-bold text-lg" style={{ color: "#1E1B4B" }}>{value}%</span>
              <span
                className="text-sm px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
              >
                {L.riskMap[riskKey]}
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
          {[0, 25, 50, 75, 100].map((v) => (
            <line
              key={v}
              x1="0" y1={60 - (v / 100) * 60}
              x2="300" y2={60 - (v / 100) * 60}
              stroke="rgba(0,0,0,0.06)" strokeWidth="1"
            />
          ))}
          <polyline
            points={values.map((v, i) => `${(i / 3) * 300},${60 - (v / 100) * 60}`).join(" ")}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {values.map((v, i) => (
            <circle
              key={i}
              cx={(i / 3) * 300}
              cy={60 - (v / 100) * 60}
              r="4"
              fill={getRiskColor(v)}
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>

      {/* 내러티브 */}
      <div className="rounded-xl p-4 border" style={{ background: "#F5F4FF", borderColor: "#EDE9FE" }}>
        <p className="text-sm leading-relaxed" style={{ color: "#4B5563" }}>{data.narrative}</p>
      </div>
    </section>
  );
}
