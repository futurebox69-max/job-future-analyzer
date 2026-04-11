"use client";

import { IcebergLayer } from "@/types/analysis";
import { LangCode } from "@/lib/i18n";

interface IcebergModelProps {
  layers: IcebergLayer[];
  lang?: LangCode;
}

const LABELS: Record<LangCode, {
  title: string;
  footer: string;
}> = {
  ko: {
    title: "🧊 시스템사고 빙산 모델",
    footer: "Donella Meadows 시스템사고 빙산 모델 적용",
  },
  en: {
    title: "🧊 Systems Thinking Iceberg Model",
    footer: "Based on Donella Meadows Systems Thinking Iceberg Model",
  },
  zh: {
    title: "🧊 系统思维冰山模型",
    footer: "基于Donella Meadows系统思维冰山模型",
  },
  ja: {
    title: "🧊 システム思考アイスバーグモデル",
    footer: "Donella Meadows システム思考アイスバーグモデル適用",
  },
  es: {
    title: "🧊 Modelo Iceberg de Pensamiento Sistémico",
    footer: "Basado en el Modelo Iceberg de Donella Meadows",
  },
};

const LAYER_STYLES = [
  { bg: "#EFF6FF", border: "#BFDBFE", icon: "🌊", textColor: "#1D4ED8", label: "수면 위" },
  { bg: "#EEF2FF", border: "#C7D2FE", icon: "🔵", textColor: "#3730A3", label: "얕은 층" },
  { bg: "#E0E7FF", border: "#A5B4FC", icon: "🔷", textColor: "#4338CA", label: "깊은 층" },
  { bg: "#C7D2FE", border: "#818CF8", icon: "⚓", textColor: "#3730A3", label: "근본" },
];

export default function IcebergModel({ layers, lang = "ko" }: IcebergModelProps) {
  const L = LABELS[lang];
  const sorted = [...layers].sort((a, b) => a.level - b.level);

  return (
    <div
      className="rounded-3xl border p-4 sm:p-6"
      style={{ background: "#FFFFFF", borderColor: "#EDE9FE", boxShadow: "0 2px 16px rgba(108,99,255,0.07)" }}
    >
      <h3 className="font-semibold text-lg mb-5 flex items-center gap-2" style={{ color: "#1E1B4B" }}>
        {L.title}
      </h3>

      <div className="space-y-3">
        {sorted.map((layer, i) => {
          const style = LAYER_STYLES[i] ?? LAYER_STYLES[3];
          const widthClass = ["w-full", "w-full sm:w-11/12", "w-full sm:w-10/12", "w-full sm:w-9/12"][i] ?? "w-full sm:w-9/12";

          return (
            <div
              key={layer.level}
              className={`${widthClass} rounded-2xl p-3 sm:p-4 border transition-all duration-300 hover:scale-[1.01]`}
              style={{ background: style.bg, borderColor: style.border }}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-lg sm:text-xl flex-shrink-0 mt-0.5">{style.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-semibold mb-1 break-words" style={{ color: style.textColor }}>
                    {layer.title}
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed break-words" style={{ color: "#374151" }}>
                    {layer.content}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-center" style={{ color: "#9CA3AF" }}>
        {L.footer}
      </p>
    </div>
  );
}
