"use client";

import { useState, FormEvent } from "react";

interface JobInputProps {
  onAnalyze: (job: string) => void;
  isLoading: boolean;
  mode: "adult" | "youth";
}

export default function JobInput({ onAnalyze, isLoading, mode }: JobInputProps) {
  const [job, setJob] = useState("");
  const [error, setError] = useState("");

  const placeholder =
    mode === "youth"
      ? "관심 있는 직업을 입력하세요 (예: 선생님, 의사, 프로게이머)"
      : "직업명을 입력하세요 (예: 의사, 회계사, 소프트웨어 개발자)";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = job.trim();

    if (!trimmed) {
      setError("직업명을 입력해주세요.");
      return;
    }
    if (trimmed.length > 50) {
      setError("직업명은 50자 이하로 입력해주세요.");
      return;
    }

    setError("");
    onAnalyze(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={job}
          onChange={(e) => {
            setJob(e.target.value);
            if (error) setError("");
          }}
          placeholder={placeholder}
          maxLength={50}
          disabled={isLoading}
          className="w-full px-6 py-4 pr-36 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/30 text-lg focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all duration-200 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !job.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-[#6C63FF] hover:bg-[#5A52E0] disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              분석 중
            </>
          ) : (
            <>
              🔍 분석하기
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-red-400 text-sm text-center animate-fade-in">
          {error}
        </p>
      )}

      <p className="mt-2 text-white/30 text-xs text-center">
        하루 10회 무료 분석 · AI 분석 결과는 참고용입니다
      </p>
    </form>
  );
}
