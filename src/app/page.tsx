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
import ShareCard from "@/components/ShareCard";
import LanguageSelector from "@/components/LanguageSelector";
import { AnalysisResult } from "@/types/analysis";
import { getLang, LangCode } from "@/lib/i18n";

export default function Home() {
  const [mode, setMode] = useState<"adult" | "youth">("adult");
  const [lang, setLang] = useState<LangCode>("ko");
  const t = getLang(lang);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [loadingStageIdx, setLoadingStageIdx] = useState(0);
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
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, []);

  // 로딩 중 메시지 순환
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingStageIdx((i) => {
        const next = Math.min(i + 1, t.loading.length - 1);
        setLoadingMsg(t.loading[next]);
        return next;
      });
    }, 12000);
    return () => clearInterval(interval);
  }, [isLoading, t]);

  const handleAnalyze = async (job: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setLoadingMsg(t.loading[0]);
    setLoadingStageIdx(0);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job, mode, lang }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "분석에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      const contentType = response.headers.get("Content-Type") ?? "";

      if (contentType.includes("text/event-stream")) {
        // SSE 스트리밍 응답 (Claude 신규 분석)
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            if (!part.startsWith("data: ")) continue;
            const jsonStr = part.slice(6);
            try {
              const event = JSON.parse(jsonStr);

              if (event.type === "progress") {
                if (event.message) setLoadingMsg(event.message);
              } else if (event.type === "result" && event.success && event.data) {
                setResult(event.data);
                if (event.remaining !== undefined) setRemaining(event.remaining);
                setFromCache(event.fromCache ?? false);
                setTimeout(() => {
                  document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
              } else if (event.type === "error") {
                setError(event.error ?? "분석에 실패했습니다. 다시 시도해주세요.");
              }
            } catch {
              // JSON 파싱 실패 무시
            }
          }
        }
      } else {
        // JSON 응답 (캐시 히트)
        const data = await response.json();
        if (!data.success || !data.data) {
          setError(data.error ?? "분석에 실패했습니다. 다시 시도해주세요.");
          return;
        }
        setResult(data.data);
        if (data.remaining !== undefined) setRemaining(data.remaining);
        setFromCache(data.fromCache ?? false);
        setTimeout(() => {
          document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
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
          {/* 상단 컨트롤: 모드 토글 + 언어 선택 */}
          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
            <ModeToggle mode={mode} onChange={(m) => { setMode(m); setResult(null); setError(null); }} lang={lang} />
            <LanguageSelector lang={lang} onChange={(l) => { setLang(l); setResult(null); setError(null); }} />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-3" style={{ color: "#1E1B4B" }}>
            {t.title.split(" ").slice(0, -1).join(" ")}{t.title.split(" ").length > 1 ? " " : ""}
            <span
              style={{
                background: "linear-gradient(135deg, #6C63FF, #A78BFA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t.title.split(" ").slice(-1)[0]}
            </span>
          </h1>
          <p className="text-lg" style={{ color: "#6B7280", wordBreak: "keep-all" }}>
            {mode === "youth" ? t.subtitle_youth : t.subtitle_adult}
          </p>
          {totalCount !== null && totalCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm" style={{ background: "#F5F4FF", border: "1px solid #EDE9FE" }}>
              <span style={{ color: "#A78BFA" }}>✦</span>
              <span className="font-bold" style={{ color: "#6C63FF" }}>{totalCount.toLocaleString()}</span>
              <span style={{ color: "#6B7280" }}>{t.analyzed_count}</span>
            </div>
          )}
        </header>

        {/* 입력 */}
        <div className="mb-8">
          <JobInput onAnalyze={handleAnalyze} isLoading={isLoading} mode={mode} lang={lang} />
        </div>

        {/* 로딩 */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-16 animate-fade-in">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-[#6C63FF]/20 border-t-[#6C63FF] animate-spin" />
              <div className="absolute inset-3 rounded-full border-4 border-[#A78BFA]/20 border-b-[#A78BFA] animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "#4B5563" }}>{loadingMsg || t.loading[0]}</p>
            <div className="flex gap-1.5">
              {t.loading.map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                  style={{ background: i <= loadingStageIdx ? "#6C63FF" : "#E5E7EB" }}
                />
              ))}
            </div>
            <p className="text-xs" style={{ color: "#9CA3AF" }}>{t.loading_hint}</p>
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
                    {t.instant}
                  </span>
                )}
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: "#F5F4FF", color: "#6C63FF", border: "1px solid #EDE9FE" }}>
                  {t.remaining}: {remaining}
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
              lang={lang}
            />

            {/* 8차원 */}
            <SixDimensions dimensions={result.dimensions} lang={lang} />

            {/* 시간 지평선 */}
            <TimeHorizonChart data={result.timeHorizon} lang={lang} />

            {/* 스킬 갭 */}
            <SkillGapAnalysis data={result.skillGap} lang={lang} />

            {/* 빙산 모델 */}
            <IcebergModel layers={result.iceberg} lang={lang} />

            {/* 소득 영향 */}
            <IncomeImpact data={result.incomeImpact} lang={lang} />

            {/* 업종별 분석 */}
            <IndustryContext data={result.industryContext} lang={lang} />

            {/* 전환 경로 */}
            <TransitionCards cards={result.transitions} mode={mode} lang={lang} />

            {/* 컨설팅 노트 */}
            <ConsultingNote note={result.consultingNote} jobName={result.jobName} lang={lang} />

            {/* 공유하기 */}
            <ShareCard result={result} lang={lang} />

            {/* 면책 고지 */}
            <div className="rounded-2xl p-4 text-center" style={{ background: "#F9F9FF", border: "1px solid #EDE9FE" }}>
              <p className="text-xs font-medium mb-1" style={{ color: "#6B7280" }}>
                {t.disclaimer_title}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "#9CA3AF" }}>
                {t.disclaimer_body}
              </p>
              <p className="text-xs mt-2" style={{ color: "#C4B5FD" }}>
                WEF Future of Jobs 2025 · ILO · O*NET · Frey &amp; Osborne (2013·2023) · McKinsey (2023) · Autor (2022)
              </p>
            </div>
          </div>
        )}

        {/* 빈 상태 */}
        {!result && !isLoading && !error && (
          <div className="text-center py-12" style={{ color: "#9CA3AF" }}>
            <p className="text-5xl mb-4">🔮</p>
            <p className="text-sm">{t.empty_title}</p>
            <p className="text-xs mt-2" style={{ color: "#C4B5FD" }}>{t.empty_sub}</p>
          </div>
        )}
      </div>

      <footer
        className="relative z-10 text-center py-6 text-xs border-t"
        style={{ color: "#9CA3AF", borderColor: "#EDE9FE" }}
      >
        {t.footer}
      </footer>
    </main>
  );
}
