"use client";

import { IcebergLayer } from "@/types/analysis";

interface IcebergModelProps {
  layers: IcebergLayer[];
}

const LAYER_STYLES = [
  { bg: "bg-blue-500/20", border: "border-blue-500/30", icon: "🌊", textColor: "text-blue-300", label: "수면 위" },
  { bg: "bg-blue-600/20", border: "border-blue-600/30", icon: "🔵", textColor: "text-blue-400", label: "얕은 층" },
  { bg: "bg-blue-700/20", border: "border-blue-700/30", icon: "🔷", textColor: "text-blue-500", label: "깊은 층" },
  { bg: "bg-blue-900/30", border: "border-blue-900/40", icon: "⚓", textColor: "text-blue-600", label: "근본" },
];

export default function IcebergModel({ layers }: IcebergModelProps) {
  const sorted = [...layers].sort((a, b) => a.level - b.level);

  return (
    <div className="bg-white/5 rounded-3xl border border-white/10 p-6">
      <h3 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
        🧊 시스템사고 빙산 모델
      </h3>

      <div className="space-y-3">
        {sorted.map((layer, i) => {
          const style = LAYER_STYLES[i] ?? LAYER_STYLES[3];
          const widthClass = ["w-full", "w-11/12", "w-10/12", "w-9/12"][i] ?? "w-9/12";

          return (
            <div
              key={layer.level}
              className={`${widthClass} ${style.bg} border ${style.border} rounded-2xl p-4 transition-all duration-300 hover:scale-[1.01]`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{style.icon}</span>
                <div>
                  <div className={`text-xs font-medium mb-1 ${style.textColor}`}>
                    {layer.title}
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {layer.content}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-white/30 text-xs text-center">
        Donella Meadows 시스템사고 빙산 모델 적용
      </p>
    </div>
  );
}
