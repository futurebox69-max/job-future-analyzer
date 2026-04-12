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
  안전:    {
    color: "#10B981", border: "#6EE7B7",
    bg: "linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%)",
    accent: "rgba(16,185,129,0.3)", badge: "#D1FAE5", badgeText: "#065F46",
    label: { ko: "안전", en: "Safe", zh: "安全", ja: "安全", es: "Seguro" },
  },
  주의:    {
    color: "#F59E0B", border: "#FCD34D",
    bg: "linear-gradient(135deg, #451A03 0%, #78350F 50%, #92400E 100%)",
    accent: "rgba(245,158,11,0.3)", badge: "#FEF3C7", badgeText: "#78350F",
    label: { ko: "주의", en: "Caution", zh: "注意", ja: "注意", es: "Precaución" },
  },
  위험:    {
    color: "#EF4444", border: "#FCA5A5",
    bg: "linear-gradient(135deg, #450A0A 0%, #7F1D1D 50%, #991B1B 100%)",
    accent: "rgba(239,68,68,0.3)", badge: "#FEE2E2", badgeText: "#7F1D1D",
    label: { ko: "위험", en: "Danger", zh: "危险", ja: "危険", es: "Peligro" },
  },
  매우위험: {
    color: "#A855F7", border: "#C4B5FD",
    bg: "linear-gradient(135deg, #2E1065 0%, #4C1D95 50%, #6D28D9 100%)",
    accent: "rgba(168,85,247,0.3)", badge: "#F3E8FF", badgeText: "#4C1D95",
    label: { ko: "매우위험", en: "Critical", zh: "极危险", ja: "非常危険", es: "Crítico" },
  },
};

function getShareText(result: AnalysisResult, lang: LangCode, appUrl: string): string {
  const { jobName, overallRate, timeHorizon } = result;
  const risk = RISK_CONFIG[result.riskLevel];
  const riskLabel = risk.label[lang] ?? risk.label.ko;
  const skills = result.skillGap.keepSkills.slice(0, 3).join(", ");

  switch (lang) {
    case "en":
      return `🔮 Future of My Job — "${jobName}"\n\nAI Replacement Rate: ${overallRate}% (${riskLabel})\n10-Year Forecast: ${timeHorizon.year10}%\n\nKey Skills to Keep:\n${skills}\n\n${result.summary}\n\n👉 Check yours: ${appUrl}`;
    case "zh":
      return `🔮 我的职业未来 — "${jobName}"\n\nAI取代率：${overallRate}%（${riskLabel}）\n10年预测：${timeHorizon.year10}%\n\n需要保持的关键技能：\n${skills}\n\n${result.summary}\n\n👉 查看您的职业：${appUrl}`;
    case "ja":
      return `🔮 私の仕事の未来 — "${jobName}"\n\nAI代替率：${overallRate}%（${riskLabel}）\n10年後予測：${timeHorizon.year10}%\n\n強化すべきスキル：\n${skills}\n\n${result.summary}\n\n👉 あなたの職業を確認：${appUrl}`;
    case "es":
      return `🔮 Futuro de Mi Trabajo — "${jobName}"\n\nReemplazo IA: ${overallRate}% (${riskLabel})\nProyección 10 años: ${timeHorizon.year10}%\n\nHabilidades clave a mantener:\n${skills}\n\n${result.summary}\n\n👉 Comprueba la tuya: ${appUrl}`;
    default:
      return `🔮 내 직업의 미래 — "${jobName}"\n\nAI 대체율: ${overallRate}% (${riskLabel})\n10년 후 예측: ${timeHorizon.year10}%\n\n지금 강화할 역량:\n${skills}\n\n${result.summary}\n\n👉 내 직업 확인하기: ${appUrl}`;
  }
}

const LABELS = {
  ko: {
    share_btn: "결과 공유하기",
    share_title: "결과 카드 공유",
    save_image: "📷 이미지로 저장",
    copy_link: "🔗 텍스트 복사",
    copied: "✅ 복사됨",
    share_x: "X에 공유",
    share_threads: "Threads",
    share_kakao: "카카오톡",
    rate_label: "AI 대체율",
    year10_label: "10년 후",
    skills_label: "지금 강화할 역량",
    app_name: "내 직업의 미래",
    tagline: "AI 시대 커리어 분석",
  },
  en: {
    share_btn: "Share Results",
    share_title: "Share Result Card",
    save_image: "📷 Save as Image",
    copy_link: "🔗 Copy Text",
    copied: "✅ Copied",
    share_x: "Share on X",
    share_threads: "Threads",
    share_kakao: "KakaoTalk",
    rate_label: "AI Replacement",
    year10_label: "In 10 Years",
    skills_label: "Skills to Strengthen",
    app_name: "Future of My Job",
    tagline: "AI Era Career Analysis",
  },
  zh: {
    share_btn: "分享结果",
    share_title: "分享结果卡片",
    save_image: "📷 保存图片",
    copy_link: "🔗 复制文本",
    copied: "✅ 已复制",
    share_x: "分享到X",
    share_threads: "Threads",
    share_kakao: "KakaoTalk",
    rate_label: "AI取代率",
    year10_label: "10年后",
    skills_label: "需要强化的技能",
    app_name: "我的职业未来",
    tagline: "AI时代职业分析",
  },
  ja: {
    share_btn: "結果をシェア",
    share_title: "結果カードをシェア",
    save_image: "📷 画像を保存",
    copy_link: "🔗 テキストをコピー",
    copied: "✅ コピー済み",
    share_x: "Xでシェア",
    share_threads: "Threads",
    share_kakao: "KakaoTalk",
    rate_label: "AI代替率",
    year10_label: "10年後",
    skills_label: "強化すべきスキル",
    app_name: "私の仕事の未来",
    tagline: "AI時代キャリア分析",
  },
  es: {
    share_btn: "Compartir Resultado",
    share_title: "Compartir Tarjeta",
    save_image: "📷 Guardar Imagen",
    copy_link: "🔗 Copiar Texto",
    copied: "✅ Copiado",
    share_x: "Compartir en X",
    share_threads: "Threads",
    share_kakao: "KakaoTalk",
    rate_label: "Reemplazo IA",
    year10_label: "En 10 Años",
    skills_label: "Habilidades a Fortalecer",
    app_name: "Futuro de Mi Trabajo",
    tagline: "Análisis de Carrera en Era IA",
  },
};

export default function ShareCard({ result, lang = "ko" }: ShareCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = LABELS[lang] ?? LABELS.ko;
  const _ = getLang(lang); // keep for potential future use

  useEffect(() => { setMounted(true); }, []);

  const risk = RISK_CONFIG[result.riskLevel];
  const riskLabel = risk.label[lang] ?? risk.label.ko;
  const appUrl = "https://job-future-analyzer.vercel.app";
  const shareText = getShareText(result, lang, appUrl);
  const keepSkills = result.skillGap.keepSkills.slice(0, 3);
  // 핵심 한 줄: summary 앞 60자
  const summaryLine = result.summary.length > 60
    ? result.summary.slice(0, 58) + "…"
    : result.summary;

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareX = () => {
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handleShareThreads = () => {
    window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      await navigator.share({ title: t.app_name, text: shareText, url: appUrl });
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
      link.download = `${t.app_name}_${result.jobName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      handleCopyText();
    }
  };

  return (
    <>
      {/* 공유 버튼 */}
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
        <span>{t.share_btn}</span>
      </button>

      {/* 모달 */}
      {mounted && isOpen && createPortal(
        <div
          className="fixed inset-0 flex items-end sm:items-center justify-center sm:p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", zIndex: 9999 }}
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
          <div
            className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden"
            style={{ background: "#111827", boxShadow: "0 -8px 40px rgba(0,0,0,0.5)" }}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <span className="font-bold text-base" style={{ color: "#F9FAFB" }}>{t.share_title}</span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                style={{ background: "rgba(255,255,255,0.1)", color: "#9CA3AF" }}
              >
                ✕
              </button>
            </div>

            {/* 카드 미리보기 */}
            <div className="p-4">
              <div
                id="share-card-render"
                style={{
                  background: risk.bg,
                  borderRadius: 20,
                  padding: "20px",
                  position: "relative",
                  overflow: "hidden",
                  minHeight: 240,
                }}
              >
                {/* 배경 원 장식 */}
                <div style={{
                  position: "absolute", top: -40, right: -40,
                  width: 160, height: 160, borderRadius: "50%",
                  background: risk.accent,
                }} />
                <div style={{
                  position: "absolute", bottom: -30, left: -20,
                  width: 100, height: 100, borderRadius: "50%",
                  background: "rgba(0,0,0,0.15)",
                }} />

                {/* 앱명 + 태그라인 */}
                <div style={{ marginBottom: 16, position: "relative" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", marginBottom: 1 }}>
                    🔮 {t.app_name}
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{t.tagline}</div>
                </div>

                {/* 직업명 */}
                <div style={{
                  fontSize: 26, fontWeight: 900, color: "#fff",
                  lineHeight: 1.2, marginBottom: 3, position: "relative",
                }}>
                  {result.jobName}
                </div>

                {/* 한 줄 요약 */}
                <div style={{
                  fontSize: 10, color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.5, marginBottom: 18, position: "relative",
                }}>
                  {summaryLine}
                </div>

                {/* 핵심 수치 행 */}
                <div style={{ display: "flex", gap: 12, marginBottom: 16, position: "relative" }}>
                  {/* 현재 대체율 */}
                  <div style={{
                    flex: 1, background: "rgba(0,0,0,0.25)", borderRadius: 12,
                    padding: "10px 14px",
                  }}>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>{t.rate_label}</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                      {result.overallRate}
                      <span style={{ fontSize: 16, fontWeight: 600 }}>%</span>
                    </div>
                  </div>
                  {/* 10년 후 */}
                  <div style={{
                    flex: 1, background: "rgba(0,0,0,0.25)", borderRadius: 12,
                    padding: "10px 14px",
                  }}>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>{t.year10_label}</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: risk.color, lineHeight: 1 }}>
                      {result.timeHorizon.year10}
                      <span style={{ fontSize: 16, fontWeight: 600 }}>%</span>
                    </div>
                  </div>
                  {/* 등급 배지 */}
                  <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    background: risk.badge, borderRadius: 12,
                    padding: "8px 12px", minWidth: 60,
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 3 }}>
                      {result.riskLevel === "안전" ? "✅" : result.riskLevel === "주의" ? "⚠️" : result.riskLevel === "위험" ? "🔴" : "🚨"}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: risk.badgeText, textAlign: "center" }}>
                      {riskLabel}
                    </div>
                  </div>
                </div>

                {/* 강화할 역량 */}
                <div style={{ position: "relative", marginBottom: 14 }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>
                    ✦ {t.skills_label}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {keepSkills.map((skill, i) => (
                      <span key={i} style={{
                        background: "rgba(255,255,255,0.12)",
                        border: `1px solid ${risk.color}55`,
                        color: "#fff",
                        fontSize: 10, fontWeight: 600,
                        padding: "3px 10px", borderRadius: 99,
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 하단 */}
                <div style={{
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  paddingTop: 10, position: "relative",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>
                    job-future-analyzer.vercel.app
                  </span>
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>
                    powered by Claude AI
                  </span>
                </div>
              </div>
            </div>

            {/* 공유 버튼들 */}
            <div className="px-4 pb-6 space-y-2">
              {/* 이미지 저장 */}
              <button
                onClick={handleSaveImage}
                className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #6C63FF, #A78BFA)", color: "#fff" }}
              >
                {t.save_image}
              </button>

              {/* X + Threads */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleShareX}
                  className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "#000", color: "#fff" }}
                >
                  <span style={{ fontWeight: 900 }}>𝕏</span> {t.share_x}
                </button>
                <button
                  onClick={handleShareThreads}
                  className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "#000", color: "#fff" }}
                >
                  <span>@</span> {t.share_threads}
                </button>
              </div>

              {/* 텍스트 복사 / 네이티브 공유 */}
              <button
                onClick={handleShareNative}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: copied ? "#10B981" : "#D1D5DB",
                }}
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
