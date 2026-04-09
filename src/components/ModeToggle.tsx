"use client";

interface ModeToggleProps {
  mode: "adult" | "youth";
  onChange: (mode: "adult" | "youth") => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div
      className="flex items-center gap-1 rounded-full p-1 border"
      style={{ background: "#FFFFFF", borderColor: "#EDE9FE", boxShadow: "0 2px 8px rgba(108,99,255,0.12)" }}
    >
      <button
        onClick={() => onChange("adult")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          mode === "adult"
            ? "text-white shadow-md"
            : "hover:bg-indigo-50"
        }`}
        style={
          mode === "adult"
            ? { background: "#6C63FF", boxShadow: "0 2px 8px rgba(108,99,255,0.35)" }
            : { color: "#6B7280" }
        }
      >
        👔 성인
      </button>
      <button
        onClick={() => onChange("youth")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          mode === "youth"
            ? "text-white shadow-md"
            : "hover:bg-indigo-50"
        }`}
        style={
          mode === "youth"
            ? { background: "#6C63FF", boxShadow: "0 2px 8px rgba(108,99,255,0.35)" }
            : { color: "#6B7280" }
        }
      >
        🎓 청소년
      </button>
    </div>
  );
}
