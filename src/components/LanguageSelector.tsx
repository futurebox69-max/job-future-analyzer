"use client";

import { useState, useRef, useEffect } from "react";
import { LANGUAGES, LangCode } from "@/lib/i18n";

interface LanguageSelectorProps {
  lang: LangCode;
  onChange: (lang: LangCode) => void;
}

export default function LanguageSelector({ lang, onChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === lang)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
        style={{ background: "rgba(201,162,75,0.12)", border: "1px solid rgba(201,162,75,0.25)", color: "#C9A24B" }}
      >
        <span>{current.flag}</span>
        <span>{current.nativeLabel}</span>
        <span style={{ fontSize: 10, opacity: 0.7 }}>▼</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 rounded-2xl overflow-hidden shadow-xl"
          style={{ background: "#fff", border: "1px solid rgba(201,162,75,0.25)", minWidth: 160, zIndex: 100 }}
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { onChange(l.code); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-purple-50"
              style={{
                color: l.code === lang ? "#C9A24B" : "#374151",
                fontWeight: l.code === lang ? 700 : 400,
                background: l.code === lang ? "rgba(201,162,75,0.12)" : "transparent",
              }}
            >
              <span style={{ fontSize: 18 }}>{l.flag}</span>
              <span>{l.nativeLabel}</span>
              {l.code === lang && <span className="ml-auto text-xs" style={{ color: "#C9A24B" }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
