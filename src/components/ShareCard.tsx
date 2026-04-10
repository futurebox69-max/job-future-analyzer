"use client";

import { useState, useRef } from "react";
import { AnalysisResult } from "@/types/analysis";

interface ShareCardProps {
  result: AnalysisResult;
}

const RISK_CONFIG = {
  안전:    { color: "#10B981", bg: "#ECFDF5", border: "#6EE7B7", emoji: "🟢", label: "AI 대체 안전" },
  주의:    { color: "#F59E0B", bg: "#FFFBEB", border: "#FCD34D", emoji: "🟡", label: "주의 필요" },
  위험:    { color: "#EF4444", bg: "#FEF2F2", border: "#FCA5A5", emoji: "🔴", label: "대체 위험" },
  매우위험: { color: "#7C3AED", bg: "#F5F3FF", border: "#C4B5FD", emoji: "🚨", label: "매우 위험" },
};

export default function ShareCard({ result }: ShareCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const risk = RISK_CONFIG[result.riskLevel];
  const appUrl = "https://job-future-analyzer.vercel.app";
  const shareText = `🤖 내 직업의 미래 분석 결과\n\n직업: ${result.jobName}\nAI 대체율: ${result.overallRate}% ${risk.emoji}\n등급: ${risk.label}\n\n8차원 AI 분석으로 내 직업의 미래를 확인해보세요!\n👉 ${appUrl}`;

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
      await navigator.share({ title: "내 직업의 미래", text: shareText, url: appUrl });
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
      link.download = `내직업의미래_${result.jobName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      handleCopyText();
    }
  };

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
        <span>결과 공유하기</span>
      </button>

      {/* 모달 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden animate-slide-up"
            style={{ background: "#fff", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#F3F4F6" }}>
              <span className="font-bold text-base" style={{ color: "#1E1B4B" }}>결과 공유하기</span>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            {/* 카드 미리보기 */}
            <div className="p-5">
              <div
                id="share-card-render"
                ref={cardRef}
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
                    내 직업의 미래
                  </span>
                </div>

                {/* 직업명 */}
                <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 4, lineHeight: 1.3 }}>
                  {result.jobName}
                </div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 20 }}>
                  8차원 AI 대체율 분석
                </div>

                {/* 대체율 + 등급 */}
                <div className="flex items-end justify-between mb-5">
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, marginBottom: 2 }}>AI 대체율</div>
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
                    <div style={{ color: risk.color, fontSize: 12, fontWeight: 700 }}>{risk.label}</div>
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
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9 }}>0% 안전</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9 }}>100% 위험</span>
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
                <span>🖼️</span> 이미지로 저장 (인스타·틱톡용)
              </button>

              {/* X, 스레드 */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleShareX}
                  className="py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                  style={{ background: "#000", color: "#fff" }}
                >
                  <span style={{ fontWeight: 900, fontSize: 15 }}>𝕏</span> X (트위터)
                </button>
                <button
                  onClick={handleShareThreads}
                  className="py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                  style={{ background: "#000", color: "#fff" }}
                >
                  <span style={{ fontSize: 16 }}>@</span> 스레드
                </button>
              </div>

              {/* 모바일 네이티브 공유 / 링크 복사 */}
              <button
                onClick={handleShareNative}
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: "#F5F4FF", color: "#6C63FF", border: "1px solid #EDE9FE" }}
              >
                {copied ? "✅ 복사됨!" : "🔗 링크 + 텍스트 복사"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
