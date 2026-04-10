"use client";

import { LangCode } from "@/lib/i18n";

interface ModeToggleProps {
  mode: "adult" | "youth";
  onChange: (mode: "adult" | "youth") => void;
  lang?: LangCode;
}

const MODE_LABELS: Record<LangCode, { adult: string; youth: string }> = {
  ko: { adult: "👔 성인",    youth: "🎓 청소년" },
  en: { adult: "👔 Adult",   youth: "🎓 Youth"  },
  zh: { adult: "👔 成人",    youth: "🎓 青少年" },
  ja: { adult: "👔 社会人",  youth: "🎓 若者"   },
  es: { adult: "👔 Adulto",  youth: "🎓 Joven"  },
};

export default function ModeToggle({ mode, onChange, lang = "ko" }: ModeToggleProps) {
  const L = MODE_LABELS[lang];

  return (
    <div
      className="flex items-center gap-1 rounded-full p-1 border"
      style={{ background: "#FFFFFF", borderColor: "#EDE9FE", boxShadow: "0 2px 8px rgba(108,99,255,0.12)" }}
    >
      <button
        onClick={() => onChange("adult")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          mode === "adult" ? "text-white shadow-md" : "hover:bg-indigo-50"
        }`}
        style={
          mode === "adult"
            ? { background: "#6C63FF", boxShadow: "0 2px 8px rgba(108,99,255,0.35)" }
            : { color: "#6B7280" }
        }
      >
        {L.adult}
      </button>
      <button
        onClick={() => onChange("youth")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          mode === "youth" ? "text-white shadow-md" : "hover:bg-indigo-50"
        }`}
        style={
          mode === "youth"
            ? { background: "#6C63FF", boxShadow: "0 2px 8px rgba(108,99,255,0.35)" }
            : { color: "#6B7280" }
        }
      >
        {L.youth}
      </button>
    </div>
  );
}
