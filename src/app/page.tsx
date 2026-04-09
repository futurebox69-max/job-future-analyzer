"use client";

import { useState, useEffect } from "react";
import ModeToggle from "@/components/ModeToggle";
import JobInput from "@/components/JobInput";
import GaugeChart from "@/components/GaugeChart";
import SixDimensions from "@/components/SixDimensions";
import IcebergModel from "@/components/IcebergModel";
import TransitionCards from "@/components/TransitionCards";
import TimeHorizonChart from "@/components/TimeHorizonChart";
import SkillGapAnalysis from "@/components/SkillGapAnalysis";
import IncomeImpact from "@/components/IncomeImpact";
import IndustryContext from "@/components/IndustryContext";
import ConsultingNote from "@/components/ConsultingNote";
import { AnalysisResult, AnalyzeResponse } from "@/types/analysis";

export default function Home() {
  const [mode, setMode] = useState<"adult" | "youth">("adult");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = () => {
      fetch("/api/stats").then((r) => r.json()).then((d) => setTotalCount(d.total)).catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 60_000); // 1분마다 자동 갱신
    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = async (job: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job, mode }),
      });

      const data: AnalyzeResponse = await response.json();

      if (!data.success || !data.data) {
        setError(data.error ?? "분석에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      setResult(data.data);
      if (data.remaining !== undefined) setRemaining(data.remaining);
      setFromCache(data.fromCache ?? false);

      setTimeout(() => {
        document.getElementById("result-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch {
      setError("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen" style={{ background: "#F5F4FF" }}>
      {/* 상단 프리미엄 헤더 그라데이션 */}
      <div
        className="fixed top-0 left-0 right-0 h-80 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(108,99,255,0.08) 0%, rgba(245,244,255,0) 100%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* 헤더 */}
        <header className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <ModeToggle mode={mode} onChange={(m) => { setMode(m); setResult(null); setError(null); }} />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-3" style={{ color: "#1E1B4B" }}>
            내 직업의{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #6C63FF, #A78BFA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              미래
            </span>
          </h1>
          <p className="text-lg" style={{ color: "#6B7280" }}>
            {mode === "youth"
              ? "관심 직업의 AI 대체 가능성을 확인하고 진로를 설계하세요"
              : "내 직업의 AI 대체 가능성을 8차원으로 심층 분석합니다"}
          </p>
          {totalCount !== null && totalCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm" style={{ background: "#F5F4FF", border: "1px solid #EDE9FE" }}>
              <span style={{ color: "#A78BFA" }}>✦</span>
              <span style={{ color: "#6B7280" }}>지금까지</span>
              <span className="font-bold" style={{ color: "#6C63FF" }}>{totalCount.toLocaleString()}번</span>
              <span style={{ color: "#6B7280" }}>분석됨</span>
            </div>
          )}
        </header>

        {/* 입력 */}
        <div className="mb-8">
          <JobInput onAnalyze={handleAnalyze} isLoading={isLoading} mode={mode} />
        </div>

        {/* 로딩 */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-16 animate-fade-in">
            <div className="w-16 h-16 rounded-full border-4 border-[#6C63FF]/20 border-t-[#6C63FF] animate-spin" />
            <p className="text-sm" style={{ color: "#6B7280" }}>Claude AI가 심층 분석 중입니다...</p>
            <p className="text-xs" style={{ color: "#9CA3AF" }}>8차원 분석 · 시간 지평선 · 스킬 갭 · 소득 예측 — 약 15~20초 소요</p>
          </div>
        )}

        {/* 에러 */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center animate-fade-in">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* 결과 */}
        {result && !isLoading && (
          <div id="result-section" className="space-y-5 animate-fade-in">
            {/* 사용 횟수 표시 */}
            {remaining !== null && (
              <div className="flex items-center justify-end gap-2">
                {fromCache && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0" }}>
                    ⚡ 즉시 로드
                  </span>
                )}
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: "#F5F4FF", color: "#6C63FF", border: "1px solid #EDE9FE" }}>
                  오늘 남은 횟수: {remaining}회
                </span>
              </div>
            )}

            {/* 요약 */}
            <div
              className="rounded-2xl p-5 border"
              style={{ background: "#FFFFFF", borderColor: "#EDE9FE", boxShadow: "0 1px 8px rgba(108,99,255,0.08)" }}
            >
              <p className="text-sm leading-relaxed text-center" style={{ color: "#4B5563" }}>
                {result.summary}
              </p>
            </div>

            {/* 게이지 */}
            <GaugeChart
              rate={result.overallRate}
              riskLevel={result.riskLevel}
              jobName={result.jobName}
            />

            {/* 8차원 */}
            <SixDimensions dimensions={result.dimensions} />

            {/* 시간 지평선 */}
            <TimeHorizonChart data={result.timeHorizon} />

            {/* 스킬 갭 */}
            <SkillGapAnalysis data={result.skillGap} />

            {/* 빙산 모델 */}
            <IcebergModel layers={result.iceberg} />

            {/* 소득 영향 */}
            <IncomeImpact data={result.incomeImpact} />

            {/* 업종별 분석 */}
            <IndustryContext data={result.industryContext} />

            {/* 전환 경로 */}
            <TransitionCards cards={result.transitions} mode={mode} />

            {/* 컨설팅 노트 */}
            <ConsultingNote note={result.consultingNote} jobName={result.jobName} />

            {/* 면책 고지 */}
            <div className="rounded-2xl p-4 text-center" style={{ background: "#F9F9FF", border: "1px solid #EDE9FE" }}>
              <p className="text-xs font-medium mb-1" style={{ color: "#6B7280" }}>
                📌 분석 결과 활용 시 유의사항
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "#9CA3AF" }}>
                이 분석은 현재 시점의 기술 트렌드와 학술 연구를 바탕으로 한 <strong style={{ color: "#6B7280" }}>추정값</strong>입니다.
                AI 기술 발전 속도, 사회·제도적 변화, 개인의 역량에 따라 실제 결과는 크게 달라질 수 있습니다.
                참고 자료로 활용하시되, 중요한 진로 결정은 전문가와 함께 검토하시길 권장합니다.
              </p>
              <p className="text-xs mt-2" style={{ color: "#C4B5FD" }}>
                출처: WEF Future of Jobs 2025 · ILO · O*NET · Frey &amp; Osborne (2013·2023) · McKinsey (2023) · Autor (2022)
              </p>
            </div>
          </div>
        )}

        {/* 빈 상태 */}
        {!result && !isLoading && !error && (
          <div className="text-center py-12" style={{ color: "#9CA3AF" }}>
            <p className="text-5xl mb-4">🔮</p>
            <p className="text-sm">직업명을 입력하고 분석을 시작하세요</p>
            <p className="text-xs mt-2" style={{ color: "#C4B5FD" }}>8차원 분석 · 10년 예측 · 스킬 로드맵 · 소득 영향</p>
          </div>
        )}
      </div>

      <footer
        className="relative z-10 text-center py-6 text-xs border-t"
        style={{ color: "#9CA3AF", borderColor: "#EDE9FE" }}
      >
        LoginFuture Ministry · 내 직업의 미래 v2.0
      </footer>
    </main>
  );
}
