"use client";

import { LangCode } from "@/lib/i18n";

interface ModeToggleProps {
  mode: "adult" | "youth";
  onChange: (mode: "adult" | "youth") => void;
  lang?: LangCode;
  variant?: "default" | "glass";
}

const MODE_LABELS: Record<LangCode, { adult: string; youth: string }> = {
  ko: { adult: "👔 성인",    youth: "🎓 청소년" },
  en: { adult: "👔 Adult",   youth: "🎓 Youth"  },
  zh: { adult: "👔 成人",    youth: "🎓 青少年" },
  ja: { adult: "👔 社会人",  youth: "🎓 若者"   },
  es: { adult: "👔 Adulto",  youth: "🎓 Joven"  },
};

export default function ModeToggle({ mode, onChange, lang = "ko", variant = "default" }: ModeToggleProps) {
  const L = MODE_LABELS[lang];
  const isGlass = variant === "glass";

  return (
    <div
      className="flex items-center gap-1 rounded-full p-1"
      style={isGlass ? {
        background: "rgba(255,255,255,0.18)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.3)",
      } : {
        background: "#FFFFFF",
        border: "1px solid #EDE9FE",
        boxShadow: "0 2px 8px rgba(108,99,255,0.12)",
      }}
    >
      <button
        onClick={() => onChange("adult")}
        className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
        style={mode === "adult" ? (
          isGlass ? {
            background: "rgba(255,255,255,0.9)",
            color: "#6C63FF",
            fontWeight: 700,
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          } : {
            background: "#6C63FF",
            color: "white",
            boxShadow: "0 2px 8px rgba(108,99,255,0.35)",
          }
        ) : (
          isGlass ? {
            color: "rgba(255,255,255,0.82)",
          } : {
            color: "#6B7280",
          }
        )}
      >
        {L.adult}
      </button>
      <button
        onClick={() => onChange("youth")}
        className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
        style={mode === "youth" ? (
          isGlass ? {
            background: "rgba(255,255,255,0.9)",
            color: "#6C63FF",
            fontWeight: 700,
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          } : {
            background: "#6C63FF",
            color: "white",
            boxShadow: "0 2px 8px rgba(108,99,255,0.35)",
          }
        ) : (
          isGlass ? {
            color: "rgba(255,255,255,0.82)",
          } : {
            color: "#6B7280",
          }
        )}
      >
        {L.youth}
      </button>
    </div>
  );
}
