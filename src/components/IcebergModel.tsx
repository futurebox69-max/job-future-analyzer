"use client";

import { IcebergLayer } from "@/types/analysis";

interface IcebergModelProps {
  layers: IcebergLayer[];
}

const LAYER_STYLES = [
  { bg: "#EFF6FF", border: "#BFDBFE", icon: "🌊", textColor: "#1D4ED8", label: "수면 위" },
  { bg: "#EEF2FF", border: "#C7D2FE", icon: "🔵", textColor: "#3730A3", label: "얕은 층" },
  { bg: "#E0E7FF", border: "#A5B4FC", icon: "🔷", textColor: "#4338CA", label: "깊은 층" },
  { bg: "#C7D2FE", border: "#818CF8", icon: "⚓", textColor: "#3730A3", label: "근본" },
];

export default function IcebergModel({ layers }: IcebergModelProps) {
  const sorted = [...layers].sort((a, b) => a.level - b.level);

  return (
    <div
      className="rounded-3xl border p-6"
      style={{ background: "#FFFFFF", borderColor: "#EDE9FE", boxShadow: "0 2px 16px rgba(108,99,255,0.07)" }}
    >
      <h3 className="font-semibold text-lg mb-5 flex items-center gap-2" style={{ color: "#1E1B4B" }}>
        🧊 시스템사고 빙산 모델
      </h3>

      <div className="space-y-3">
        {sorted.map((layer, i) => {
          const style = LAYER_STYLES[i] ?? LAYER_STYLES[3];
          const widthClass = ["w-full", "w-11/12", "w-10/12", "w-9/12"][i] ?? "w-9/12";

          return (
            <div
              key={layer.level}
              className={`${widthClass} rounded-2xl p-4 border transition-all duration-300 hover:scale-[1.01]`}
              style={{ background: style.bg, borderColor: style.border }}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{style.icon}</span>
                <div>
                  <div className="text-xs font-semibold mb-1" style={{ color: style.textColor }}>
                    {layer.title}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
                    {layer.content}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-center" style={{ color: "#9CA3AF" }}>
        Donella Meadows 시스템사고 빙산 모델 적용
      </p>
    </div>
  );
}
