"use client";

interface ModeToggleProps {
  mode: "adult" | "youth";
  onChange: (mode: "adult" | "youth") => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
      <button
        onClick={() => onChange("adult")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          mode === "adult"
            ? "bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/30"
            : "text-white/50 hover:text-white/80"
        }`}
      >
        👔 성인
      </button>
      <button
        onClick={() => onChange("youth")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          mode === "youth"
            ? "bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/30"
            : "text-white/50 hover:text-white/80"
        }`}
      >
        🎓 청소년
      </button>
    </div>
  );
}
