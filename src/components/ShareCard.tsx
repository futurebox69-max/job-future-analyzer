"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnalysisResult } from "@/types/analysis";
import { getLang, LangCode } from "@/lib/i18n";

interface ShareCardProps {
  result: AnalysisResult;
  lang?: LangCode;
}

const RISK_CONFIG = {
  안전:    { color: "#10B981", bg: "#ECFDF5", border: "#6EE7B7", emoji: "🟢" },
  주의:    { color: "#F59E0B", bg: "#FFFBEB", border: "#FCD34D", emoji: "🟡" },
  위험:    { color: "#EF4444", bg: "#FEF2F2", border: "#FCA5A5", emoji: "🔴" },
  매우위험: { color: "#7C3AED", bg: "#F5F3FF", border: "#C4B5FD", emoji: "🚨" },
};

function getShareText(result: AnalysisResult, lang: LangCode, riskLabel: string, appUrl: string): string {
  const { jobName, overallRate } = result;
  const emoji = RISK_CONFIG[result.riskLevel].emoji;
  switch (lang) {
    case "en":
      return `🤖 Future of My Job Analysis\n\nJob: ${jobName}\nAI Replacement: ${overallRate}% ${emoji}\nRisk: ${riskLabel}\n\nCheck your job's AI future with 8D analysis!\n👉 ${appUrl}`;
    case "zh":
      return `🤖 我的职业未来分析结果\n\n职业：${jobName}\nAI取代率：${overallRate}% ${emoji}\n等级：${riskLabel}\n\n用8维AI分析查看您的职业未来！\n👉 ${appUrl}`;
    case "ja":
      return `🤖 私の仕事の未来分析結果\n\n職業：${jobName}\nAI代替率：${overallRate}% ${emoji}\nリスク：${riskLabel}\n\n8次元AI分析で仕事の未来を確認！\n👉 ${appUrl}`;
    case "es":
      return `🤖 Análisis del Futuro de Mi Trabajo\n\nPuesto: ${jobName}\nReemplazo IA: ${overallRate}% ${emoji}\nRiesgo: ${riskLabel}\n\n¡Descubre el futuro de tu trabajo con análisis de 8 dimensiones!\n👉 ${appUrl}`;
    default:
      return `🤖 내 직업의 미래 분석 결과\n\n직업: ${jobName}\nAI 대체율: ${overallRate}% ${emoji}\n등급: ${riskLabel}\n\n8차원 AI 분석으로 내 직업의 미래를 확인해보세요!\n👉 ${appUrl}`;
  }
}

function getAppLabel(lang: LangCode): string {
  switch (lang) {
    case "en": return "Future of My Job";
    case "zh": return "我的职业未来";
    case "ja": return "私の仕事の未来";
    case "es": return "Futuro de Mi Trabajo";
    default: return "내 직업의 미래";
  }
}

function getDimensionLabel(lang: LangCode): string {
  switch (lang) {
    case "en": return "8D AI Replacement Analysis";
    case "zh": return "8维AI取代率分析";
    case "ja": return "8次元AI代替率分析";
    case "es": return "Análisis AI 8 Dimensiones";
    default: return "8차원 AI 대체율 분석";
  }
}

function getGaugeLabels(lang: LangCode): [string, string] {
  switch (lang) {
    case "en": return ["0% Safe", "100% Risk"];
    case "zh": return ["0% 安全", "100% 危险"];
    case "ja": return ["0% 安全", "100% 危険"];
    case "es": return ["0% Seguro", "100% Riesgo"];
    default: return ["0% 안전", "100% 위험"];
  }
}

function getRateLabel(lang: LangCode): string {
  switch (lang) {
    case "en": return "AI Replacement";
    case "zh": return "AI取代率";
    case "ja": return "AI代替率";
    case "es": return "Reemplazo IA";
    default: return "AI 대체율";
  }
}

export default function ShareCard({ result, lang = "ko" }: ShareCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = getLang(lang);

  useEffect(() => { setMounted(true); }, []);

  const risk = RISK_CONFIG[result.riskLevel];
  const riskLabel = t[`risk_${result.riskLevel === "안전" ? "safe" : result.riskLevel === "주의" ? "caution" : result.riskLevel === "위험" ? "danger" : "critical"}` as keyof typeof t] as string;
  const appUrl = "https://job-future-analyzer.vercel.app";
  const shareText = getShareText(result, lang, riskLabel, appUrl);

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareX = () => {
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleShareThreads = () => {
    const url = `https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      await navigator.share({ title: getAppLabel(lang), text: shareText, url: appUrl });
    } else {
      handleCopyText();
    }
  };

  const handleSaveImage = async () => {
    try {
      const { default: html2canvas } = await import("html2canvas");
      const card = document.getElementById("share-card-render");
      if (!card) return;
      const canvas = await html2canvas(card, { scale: 3, useCORS: true, backgroundColor: null });
      const link = document.createElement("a");
      link.download = `${getAppLabel(lang)}_${result.jobName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      handleCopyText();
    }
  };

  const [gaugeLeft, gaugeRight] = getGaugeLabels(lang);

  return (
    <>
      {/* 공유하기 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: "linear-gradient(135deg, #6C63FF, #A78BFA)",
          color: "#fff",
          boxShadow: "0 4px 20px rgba(108,99,255,0.35)",
        }}
      >
        <span>📤</span>
        <span>{t.share_btn.replace("📤 ", "")}</span>
      </button>

      {/* 모달 - Portal로 body에 직접 렌더링 */}
      {mounted && isOpen && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 9999 }}
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden animate-slide-up"
            style={{ background: "#fff", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#F3F4F6" }}>
              <span className="font-bold text-base" style={{ color: "#1E1B4B" }}>{t.share_title}</span>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            {/* 카드 미리보기 */}
            <div className="p-5">
              <div
                id="share-card-render"
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #1E1B4B 0%, #3730A3 50%, #6C63FF 100%)",
                  padding: "1.5rem",
                  position: "relative",
                }}
              >
                {/* 배경 장식 */}
                <div style={{
                  position: "absolute", top: -20, right: -20,
                  width: 120, height: 120, borderRadius: "50%",
                  background: "rgba(255,255,255,0.05)",
                }} />
                <div style={{
                  position: "absolute", bottom: -30, left: -10,
                  width: 80, height: 80, borderRadius: "50%",
                  background: "rgba(255,255,255,0.04)",
                }} />

                {/* 앱 로고 */}
                <div className="flex items-center gap-2 mb-4">
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: "linear-gradient(135deg, #A78BFA, #6C63FF)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14,
                  }}>🤖</div>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em" }}>
                    {getAppLabel(lang)}
                  </span>
                </div>

                {/* 직업명 */}
                <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 4, lineHeight: 1.3 }}>
                  {result.jobName}
                </div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 20 }}>
                  {getDimensionLabel(lang)}
                </div>

                {/* 대체율 + 등급 */}
                <div className="flex items-end justify-between mb-5">
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, marginBottom: 2 }}>{getRateLabel(lang)}</div>
                    <div style={{ color: "#fff", fontSize: 48, fontWeight: 900, lineHeight: 1 }}>
                      {result.overallRate}
                      <span style={{ fontSize: 20, fontWeight: 600 }}>%</span>
                    </div>
                  </div>
                  <div style={{
                    background: risk.bg,
                    border: `1.5px solid ${risk.border}`,
                    borderRadius: 12,
                    padding: "6px 14px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 18, marginBottom: 2 }}>{risk.emoji}</div>
                    <div style={{ color: risk.color, fontSize: 12, fontWeight: 700 }}>{riskLabel}</div>
                  </div>
                </div>

                {/* 게이지 바 */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.15)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${result.overallRate}%`,
                      background: `linear-gradient(90deg, #10B981, ${result.overallRate > 55 ? "#EF4444" : "#F59E0B"})`,
                      borderRadius: 99,
                      transition: "width 0.8s ease",
                    }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9 }}>{gaugeLeft}</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9 }}>{gaugeRight}</span>
                  </div>
                </div>

                {/* 핵심 스킬 3개 */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {result.skillGap.keepSkills.slice(0, 3).map((skill, i) => (
                    <span key={i} style={{
                      background: "rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.85)",
                      fontSize: 10,
                      padding: "3px 8px",
                      borderRadius: 99,
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}>
                      ✓ {skill}
                    </span>
                  ))}
                </div>

                {/* 하단 URL */}
                <div className="flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12 }}>
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 9 }}>
                    job-future-analyzer.vercel.app
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 9 }}>
                    powered by Claude AI
                  </span>
                </div>
              </div>
            </div>

            {/* 공유 버튼들 */}
            <div className="px-5 pb-5 space-y-3">
              {/* 이미지 저장 */}
              <button
                onClick={handleSaveImage}
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #6C63FF, #A78BFA)", color: "#fff" }}
              >
                {t.save_image}
              </button>

              {/* X, 스레드 */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleShareX}
                  className="py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                  style={{ background: "#000", color: "#fff" }}
                >
                  <span style={{ fontWeight: 900, fontSize: 15 }}>𝕏</span> X
                </button>
                <button
                  onClick={handleShareThreads}
                  className="py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                  style={{ background: "#000", color: "#fff" }}
                >
                  <span style={{ fontSize: 16 }}>@</span> Threads
                </button>
              </div>

              {/* 모바일 네이티브 공유 / 링크 복사 */}
              <button
                onClick={handleShareNative}
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: "#F5F4FF", color: "#6C63FF", border: "1px solid #EDE9FE" }}
              >
                {copied ? t.copied : t.copy_link}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
