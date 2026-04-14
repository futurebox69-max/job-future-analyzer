"use client";

import { useState, useEffect, useRef } from "react";
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
import AuthModal from "@/components/AuthModal";
import ChatCoach from "@/components/ChatCoach";
import UsageCounter from "@/components/UsageCounter";
import { useAuth } from "@/context/AuthContext";
import { AnalysisResult } from "@/types/analysis";
import { getLang, LangCode } from "@/lib/i18n";
import { FREE_LIMIT } from "@/lib/supabase";


const POPULAR_JOBS_KO = [
  { icon: "👨‍⚕️", name: "의사",     job: "의사" },
  { icon: "👩‍🏫", name: "교사",     job: "교사" },
  { icon: "⚖️",  name: "변호사",   job: "변호사" },
  { icon: "💻",  name: "프로그래머", job: "프로그래머" },
  { icon: "💊",  name: "약사",     job: "약사" },
  { icon: "👩‍⚕️", name: "간호사",   job: "간호사" },
  { icon: "📊",  name: "회계사",   job: "회계사" },
  { icon: "🏛️", name: "공무원",   job: "공무원" },
  { icon: "🚒",  name: "소방관",   job: "소방관" },
  { icon: "👮",  name: "경찰관",   job: "경찰관" },
];

const POPULAR_JOBS_EN = [
  { icon: "👨‍⚕️", name: "Doctor",       job: "Doctor" },
  { icon: "👩‍🏫", name: "Teacher",       job: "Teacher" },
  { icon: "⚖️",  name: "Lawyer",        job: "Lawyer" },
  { icon: "💻",  name: "Programmer",    job: "Programmer" },
  { icon: "💊",  name: "Pharmacist",    job: "Pharmacist" },
  { icon: "👩‍⚕️", name: "Nurse",         job: "Nurse" },
  { icon: "📊",  name: "Accountant",    job: "Accountant" },
  { icon: "🏛️", name: "Civil Servant", job: "Civil Servant" },
  { icon: "🚒",  name: "Firefighter",   job: "Firefighter" },
  { icon: "👮",  name: "Police Officer",job: "Police Officer" },
];

const POPULAR_JOBS_ZH = [
  { icon: "👨‍⚕️", name: "医生",   job: "医生" },
  { icon: "👩‍🏫", name: "教师",   job: "教师" },
  { icon: "⚖️",  name: "律师",   job: "律师" },
  { icon: "💻",  name: "程序员", job: "程序员" },
  { icon: "💊",  name: "药剂师", job: "药剂师" },
  { icon: "👩‍⚕️", name: "护士",   job: "护士" },
  { icon: "📊",  name: "会计师", job: "会计师" },
  { icon: "🏛️", name: "公务员", job: "公务员" },
  { icon: "🚒",  name: "消防员", job: "消防员" },
  { icon: "👮",  name: "警察",   job: "警察" },
];

const POPULAR_JOBS_JA = [
  { icon: "👨‍⚕️", name: "医師",       job: "医師" },
  { icon: "👩‍🏫", name: "教師",       job: "教師" },
  { icon: "⚖️",  name: "弁護士",     job: "弁護士" },
  { icon: "💻",  name: "プログラマー", job: "プログラマー" },
  { icon: "💊",  name: "薬剤師",     job: "薬剤師" },
  { icon: "👩‍⚕️", name: "看護師",     job: "看護師" },
  { icon: "📊",  name: "会計士",     job: "会計士" },
  { icon: "🏛️", name: "公務員",     job: "公務員" },
  { icon: "🚒",  name: "消防士",     job: "消防士" },
  { icon: "👮",  name: "警察官",     job: "警察官" },
];

const POPULAR_JOBS_ES = [
  { icon: "👨‍⚕️", name: "Médico",       job: "Médico" },
  { icon: "👩‍🏫", name: "Maestro",       job: "Maestro" },
  { icon: "⚖️",  name: "Abogado",       job: "Abogado" },
  { icon: "💻",  name: "Programador",   job: "Programador" },
  { icon: "💊",  name: "Farmacéutico",  job: "Farmacéutico" },
  { icon: "👩‍⚕️", name: "Enfermero",     job: "Enfermero" },
  { icon: "📊",  name: "Contador",      job: "Contador" },
  { icon: "🏛️", name: "Funcionario",   job: "Funcionario" },
  { icon: "🚒",  name: "Bombero",       job: "Bombero" },
  { icon: "👮",  name: "Policía",       job: "Policía" },
];

export default function Home() {
  const { user, profile, session, loading: authLoading, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showUserMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showUserMenu]);
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authReason, setAuthReason] = useState<string | undefined>();
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);

  const popularJobs =
    lang === "ko" ? POPULAR_JOBS_KO :
    lang === "zh" ? POPULAR_JOBS_ZH :
    lang === "ja" ? POPULAR_JOBS_JA :
    lang === "es" ? POPULAR_JOBS_ES :
    POPULAR_JOBS_EN;

  const SECTIONS = [
    { id: "overview",    icon: "📊", label: t.section_overview },
    { id: "dimensions",  icon: "🎯", label: t.section_dimensions },
    { id: "horizon",     icon: "⏳", label: t.section_horizon },
    { id: "skills",      icon: "🎓", label: t.section_skills },
    { id: "iceberg",     icon: "🧊", label: t.section_iceberg },
    { id: "income",      icon: "💰", label: t.section_income },
    { id: "industry",    icon: "🏭", label: t.section_industry },
    { id: "transitions", icon: "🚀", label: t.section_transitions },
    { id: "consulting",  icon: "📝", label: t.section_consulting },
    { id: "coach",       icon: "🔮", label: t.section_coach },
  ];

  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const fetchCount = () => {
      fetch("/api/stats").then((r) => r.json()).then((d) => setTotalCount(d.total)).catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, []);

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
    // ── 권한 체크 ──────────────────────────────
    if (!user) {
      // 비로그인: 분석 불가, 로그인 모달
      setAuthReason("분석을 이용하려면 로그인이 필요합니다. 무료로 3회 분석할 수 있습니다.");
      setShowAuthModal(true);
      return;
    } else if (profile && profile.role === "free") {
      // 무료 로그인: 3회 체크
      const used = profile.monthly_usage;
      if (used >= FREE_LIMIT) {
        setShowUpgradePopup(true);
        return;
      }
    }
    // ────────────────────────────────────────────

    setIsLoading(true);
    setError(null);
    setResult(null);
    setLoadingMsg(t.loading[0]);
    setLoadingStageIdx(0);

    // 로딩 시작 시 검색 카드 영역으로 스크롤
    setTimeout(() => {
      document.getElementById("search-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers,
        body: JSON.stringify({ job, mode, lang }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? t.error_analyze);
        return;
      }

      const contentType = response.headers.get("Content-Type") ?? "";

      if (contentType.includes("text/event-stream")) {
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
        const data = await response.json();
        if (!data.success || !data.data) {
          setError(data.error ?? t.error_analyze);
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
      setError(t.error_network);
    } finally {
      setIsLoading(false);
    }
  };

  // 마지막 1회 남았을 때 경고
  const showUsageWarning = user && profile && profile.role === "free" &&
    profile.monthly_usage >= FREE_LIMIT - 1 && profile.monthly_usage < FREE_LIMIT;

  return (
    <main className="min-h-screen" style={{ background: "#F8F7FF" }}>

      {/* Auth 모달 */}
      {showAuthModal && (
        <AuthModal reason={authReason} onClose={() => setShowAuthModal(false)} />
      )}

      {/* 업그레이드 팝업 */}
      {showUpgradePopup && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
        }} onClick={() => setShowUpgradePopup(false)}>
          <div style={{
            background: "white", borderRadius: "28px", padding: "36px 32px",
            width: "100%", maxWidth: "400px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🚀</div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1E1B4B", marginBottom: "12px" }}>
              무료 분석 3회를<br />모두 사용하셨습니다
            </h2>
            <p style={{ fontSize: "15px", color: "#6B7280", lineHeight: 1.7, marginBottom: "24px" }}>
              프리미엄으로 업그레이드하면<br />
              <strong style={{ color: "#1E1B4B" }}>무제한 분석</strong>과 8가지 심화 기능을<br />
              모두 이용할 수 있습니다.
            </p>
            <button style={{
              width: "100%", padding: "16px", borderRadius: "14px", border: "none",
              background: "linear-gradient(135deg, #6C63FF, #4158D0)",
              color: "white", fontSize: "16px", fontWeight: 700, cursor: "pointer",
              marginBottom: "10px",
            }}>
              프리미엄 시작하기 · ₩4,900/월
            </button>
            <button onClick={() => setShowUpgradePopup(false)} style={{
              width: "100%", padding: "12px", borderRadius: "14px",
              border: "1.5px solid #EDE9FE", background: "white",
              color: "#6B7280", fontSize: "14px", cursor: "pointer",
            }}>
              다음에
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          HERO SECTION — E style gradient
      ═══════════════════════════════════════ */}
      <div
        style={{
          background: "linear-gradient(135deg, #FF6B6B 0%, #C850C0 42%, #4158D0 100%)",
          position: "relative",
          overflow: "hidden",
          paddingBottom: "88px",
        }}
      >
        {/* Decorative blur blobs */}
        <div style={{
          position: "absolute", top: "-80px", right: "-80px",
          width: "360px", height: "360px", borderRadius: "50%",
          background: "rgba(255,255,255,0.07)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-20px", left: "-50px",
          width: "240px", height: "240px", borderRadius: "50%",
          background: "rgba(255,255,255,0.05)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "40%", left: "60%",
          width: "160px", height: "160px", borderRadius: "50%",
          background: "rgba(255,255,255,0.04)", pointerEvents: "none",
        }} />

        {/* Top nav */}
        <div
          className="max-w-4xl mx-auto px-5 pt-5 flex items-center justify-between"
          style={{ gap: "12px" }}
        >
          <div style={{
            color: "rgba(255,255,255,0.88)",
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            FUTURE BOX
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <ModeToggle
              mode={mode}
              onChange={(m) => { setMode(m); setResult(null); setError(null); }}
              lang={lang}
              variant="glass"
            />
            <LanguageSelector
              lang={lang}
              onChange={(l) => { setLang(l); setResult(null); setError(null); }}
            />
            {/* 로그인/사용자 버튼 */}
            {user ? (
                <div style={{ position: "relative" }} ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu((v) => !v)}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "6px 12px", borderRadius: "100px",
                      background: "rgba(255,255,255,0.18)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      color: "white", fontSize: "13px", fontWeight: 600,
                      cursor: "pointer", backdropFilter: "blur(10px)",
                    }}
                  >
                    <span>👤</span>
                    <span>{user.email?.split("@")[0]}</span>
                    <span style={{ fontSize: "10px", opacity: 0.7 }}>▼</span>
                  </button>
                  {showUserMenu && (
                    <div
                      style={{
                        position: "absolute", top: "calc(100% + 8px)", right: 0,
                        background: "white", borderRadius: "14px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                        overflow: "hidden", minWidth: "160px", zIndex: 200,
                      }}
                    >
                      <div style={{
                        padding: "12px 16px", borderBottom: "1px solid #F3F4F6",
                        fontSize: "12px", color: "#9CA3AF",
                      }}>
                        {user.email}
                      </div>
                      <a
                        href="/api/logout"
                        style={{
                          display: "block", width: "100%", padding: "12px 16px",
                          textAlign: "left", fontSize: "14px",
                          color: "#EF4444", fontWeight: 600,
                          textDecoration: "none",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#FEF2F2"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                      >
                        로그아웃
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => { setAuthReason(undefined); setShowAuthModal(true); }}
                  style={{
                    padding: "7px 16px", borderRadius: "100px",
                    background: "rgba(255,255,255,0.18)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    color: "white", fontSize: "13px", fontWeight: 600,
                    cursor: "pointer", backdropFilter: "blur(10px)",
                  }}
                >
                  로그인
                </button>
              )
            }
          </div>
        </div>

        {/* Hero copy */}
        <div className="max-w-3xl mx-auto px-5 pt-10 pb-2 text-center">
          {/* Social proof badge */}
          {totalCount !== null && totalCount > 0 && (
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-7"
              style={{
                background: "rgba(255,255,255,0.16)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.28)",
                color: "white",
                fontSize: "16px",
                fontWeight: 500,
              }}
            >
              <span style={{ color: "#FFE066", fontSize: "10px" }}>✦</span>
              <span style={{ fontWeight: 800 }}>{t.analyzed_before}{totalCount.toLocaleString()}</span>
              <span style={{ opacity: 0.85 }}>{t.analyzed_after}</span>
            </div>
          )}

          {/* Main headline — D style bold typography */}
          <h1
            style={{
              color: "white",
              fontWeight: 900,
              fontSize: "clamp(40px, 7vw, 68px)",
              lineHeight: 1.15,
              marginBottom: "18px",
              textShadow: "0 2px 24px rgba(0,0,0,0.12)",
              wordBreak: "keep-all",
              letterSpacing: "-0.01em",
            }}
          >
            {t.hero_line1}<br />
            <span style={{ opacity: 0.96 }}>{t.hero_line2}</span>
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.80)",
            fontSize: "clamp(16px, 2.2vw, 20px)",
            fontWeight: 400,
            letterSpacing: "0.02em",
            marginBottom: "20px",
          }}>
            {t.hero_tagline}
          </p>

          {/* 매월 1일 업데이트 배지 */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.22)",
            }}
          >
            <span style={{ fontSize: "20px" }}>🔄</span>
            <span style={{
              color: "rgba(255,255,255,0.95)",
              fontSize: "18px",
              fontWeight: 700,
            }}>
              {t.update_badge}
            </span>
            <span style={{
              background: "#FFE066",
              color: "#92400e",
              fontSize: "13px",
              fontWeight: 800,
              padding: "3px 10px",
              borderRadius: "100px",
              letterSpacing: "0.03em",
            }}>
              {t.update_tag}
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          FLOATING SEARCH CARD — overlaps hero
      ═══════════════════════════════════════ */}
      <div
        id="search-card"
        className="max-w-2xl mx-auto px-4"
        style={{ marginTop: "-56px", position: "relative", zIndex: 20 }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "28px",
            padding: "28px 28px 22px",
            boxShadow: "0 24px 64px rgba(65,88,208,0.18), 0 4px 20px rgba(0,0,0,0.07)",
          }}
        >
          {/* 사용량 카운터 + 경고 */}
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <UsageCounter onUpgradeClick={() => setShowUpgradePopup(true)} />
            {!user && !authLoading && (
              <button
                onClick={() => { setAuthReason("로그인하면 무료로 3회 분석할 수 있습니다."); setShowAuthModal(true); }}
                style={{
                  fontSize: "12px", color: "#9CA3AF", background: "none",
                  border: "none", cursor: "pointer", textDecoration: "underline",
                }}
              >
                로그인하면 3회 무료 분석
              </button>
            )}
          </div>

          {/* 8회 경고 배너 */}
          {showUsageWarning && (
            <div style={{
              background: "#FEF3C7", border: "1px solid #FDE68A",
              borderRadius: "12px", padding: "10px 14px", marginBottom: "12px",
              fontSize: "13px", color: "#92400E", fontWeight: 500,
            }}>
              ⚠️ 이번 달 {FREE_LIMIT - (profile?.monthly_usage ?? 0)}회 남았습니다.
              프리미엄으로 업그레이드하면 무제한 분석이 가능합니다.
            </div>
          )}

          <JobInput onAnalyze={handleAnalyze} isLoading={isLoading} mode={mode} lang={lang} />

          {/* Popular job chips — D style discovery */}
          {!isLoading && !result && (
            <div style={{ marginTop: "18px" }}>
              <p style={{
                fontSize: "14px",
                color: "#9CA3AF",
                marginBottom: "10px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}>
                {t.popular_jobs_title}
              </p>
              <div className="grid grid-cols-5" style={{ gap: "8px" }}>
                {popularJobs.map(({ icon, name, job }) => (
                  <button
                    key={job}
                    onClick={() => handleAnalyze(job)}
                    style={{
                      background: "#F5F4FF",
                      border: "1.5px solid #EDE9FE",
                      borderRadius: "16px",
                      padding: "12px 6px",
                      color: "#5B52D6",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#6C63FF";
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.borderColor = "#6C63FF";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(108,99,255,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#F5F4FF";
                      e.currentTarget.style.color = "#5B52D6";
                      e.currentTarget.style.borderColor = "#EDE9FE";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <span style={{ fontSize: "24px", lineHeight: 1 }}>{icon}</span>
                    <span style={{ fontSize: "13px", lineHeight: 1.3, wordBreak: "keep-all" }}>{name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          MAIN CONTENT AREA
      ═══════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-4 pb-16">

        {/* 로딩 스피너 */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-16 animate-fade-in">
            <div className="relative w-20 h-20">
              <div
                className="absolute inset-0 rounded-full border-4 animate-spin"
                style={{ borderColor: "rgba(108,99,255,0.15)", borderTopColor: "#6C63FF" }}
              />
              <div
                className="absolute inset-3 rounded-full border-4 animate-spin"
                style={{
                  borderColor: "rgba(167,139,250,0.15)",
                  borderBottomColor: "#A78BFA",
                  animationDirection: "reverse",
                  animationDuration: "1.5s",
                }}
              />
            </div>
            <p className="text-sm font-medium" style={{ color: "#4B5563" }}>
              {loadingMsg || t.loading[0]}
            </p>
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
          <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-5 text-center animate-fade-in">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* 빈 상태: D style 3단계 프로세스 */}
        {!result && !isLoading && !error && (
          <div style={{ marginTop: "52px", marginBottom: "32px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0",
                maxWidth: "600px",
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              {[
                { num: "01", title: t.step1_title, desc: t.step1_desc },
                { num: "02", title: t.step2_title, desc: t.step2_desc },
                { num: "03", title: t.step3_title, desc: t.step3_desc },
              ].map(({ num, title, desc }, i, arr) => (
                <div key={num} style={{ position: "relative", padding: "20px 24px", flex: 1 }}>
                  {/* connector line */}
                  {i < arr.length - 1 && (
                    <div style={{
                      position: "absolute",
                      top: "30px",
                      right: "-8px",
                      width: "16px",
                      height: "1px",
                      background: "#EDE9FE",
                    }} />
                  )}
                  <div style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#C4B5FD",
                    letterSpacing: "0.08em",
                    marginBottom: "10px",
                  }}>
                    {num}
                  </div>
                  <div style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#1E1B4B",
                    marginBottom: "8px",
                  }}>
                    {title}
                  </div>
                  <div style={{
                    fontSize: "14px",
                    color: "#9CA3AF",
                    lineHeight: 1.6,
                    wordBreak: "keep-all",
                  }}>
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 결과 섹션 — 좌측 네비 + 우측 콘텐츠 */}
        {result && !isLoading && (
          <div id="result-section" className="animate-fade-in" style={{ marginTop: "32px" }}>

            {/* 직업명 + 남은 횟수 헤더 */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <span style={{ fontSize: "22px", fontWeight: 800, color: "#1E1B4B" }}>
                  {result.jobName}
                </span>
                <span style={{ fontSize: "16px", color: "#6B7280", marginLeft: "8px" }}>
                  {t.result_subtitle}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {fromCache && (
                  <span className="text-sm px-2 py-0.5 rounded-full" style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0" }}>
                    {t.instant}
                  </span>
                )}
                {remaining !== null && (
                  <span className="text-sm px-3 py-1 rounded-full" style={{ background: "#F5F4FF", color: "#6C63FF", border: "1px solid #EDE9FE" }}>
                    {t.remaining}: {remaining}
                  </span>
                )}
              </div>
            </div>

            {/* 요약 */}
            <div className="rounded-2xl p-5 border mb-6"
              style={{ background: "#FFFFFF", borderColor: "#EDE9FE", boxShadow: "0 1px 8px rgba(108,99,255,0.08)" }}>
              <p className="text-base leading-relaxed text-center" style={{ color: "#4B5563" }}>
                {result.summary}
              </p>
            </div>

            {/* 모바일: 가로 스크롤 탭 */}
            <div className="md:hidden mb-4" style={{ overflowX: "auto", whiteSpace: "nowrap", paddingBottom: "4px" }}>
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    marginRight: "8px",
                    borderRadius: "100px",
                    fontSize: "14px",
                    fontWeight: activeSection === s.id ? 700 : 500,
                    background: activeSection === s.id ? "#6C63FF" : "#F5F4FF",
                    color: activeSection === s.id ? "white" : "#5B52D6",
                    border: `1.5px solid ${activeSection === s.id ? "#6C63FF" : "#EDE9FE"}`,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>

            {/* 데스크톱: 좌측 사이드바 + 우측 콘텐츠 */}
            <div className="flex gap-6 items-start">

              {/* 좌측 네비게이션 사이드바 */}
              <div
                className="hidden md:block flex-shrink-0"
                style={{
                  width: "196px",
                  position: "sticky",
                  top: "24px",
                  borderRadius: "22px",
                  overflow: "hidden",
                  boxShadow: "0 4px 24px rgba(108,99,255,0.13)",
                }}
              >
                {/* 헤더 — 그라디언트 */}
                <div style={{
                  background: "linear-gradient(135deg, #6C63FF 0%, #4158D0 100%)",
                  padding: "18px 16px 16px",
                }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    background: "rgba(255,255,255,0.2)", borderRadius: "100px",
                    padding: "3px 10px", marginBottom: "10px",
                  }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
                    <span style={{ fontSize: "11px", color: "white", fontWeight: 600, letterSpacing: "0.04em" }}>{t.analyzed_job_done}</span>
                  </div>
                  <div style={{ fontSize: "17px", fontWeight: 800, color: "white", wordBreak: "keep-all", lineHeight: 1.35 }}>{result.jobName}</div>
                </div>

                {/* 메뉴 목록 */}
                <div style={{ background: "white", padding: "8px" }}>
                  {(() => {
                    const SECTION_STYLES = [
                      { bg: "#EEF2FF", color: "#4F46E5" },
                      { bg: "#FEF2F2", color: "#DC2626" },
                      { bg: "#FFFBEB", color: "#D97706" },
                      { bg: "#F0FDF4", color: "#16A34A" },
                      { bg: "#ECFEFF", color: "#0891B2" },
                      { bg: "#FFF7ED", color: "#EA580C" },
                      { bg: "#F5F3FF", color: "#7C3AED" },
                      { bg: "#EFF6FF", color: "#2563EB" },
                      { bg: "#F0FDFA", color: "#0D9488" },
                    ];
                    return SECTIONS.filter(s => s.id !== "coach").map((s, idx) => {
                      const isActive = activeSection === s.id;
                      const style = SECTION_STYLES[idx % SECTION_STYLES.length];
                      return (
                        <button
                          key={s.id}
                          onClick={() => setActiveSection(s.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: "9px",
                            width: "100%", padding: "9px 10px",
                            borderRadius: "11px", border: "none",
                            background: isActive ? style.bg : "transparent",
                            cursor: "pointer", transition: "all 0.13s",
                            textAlign: "left", marginBottom: "2px",
                          }}
                          onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#F8F7FF"; }}
                          onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                        >
                          {/* 아이콘 뱃지 */}
                          <span style={{
                            width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
                            background: isActive ? style.color : "#F3F4F6",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "13px", transition: "all 0.13s",
                          }}>
                            {s.icon}
                          </span>
                          <span style={{
                            fontSize: "13px", fontWeight: isActive ? 700 : 500,
                            color: isActive ? style.color : "#6B7280",
                            transition: "all 0.13s", lineHeight: 1.3,
                            wordBreak: "keep-all",
                          }}>
                            {s.label}
                          </span>
                        </button>
                      );
                    });
                  })()}

                  {/* AI 코치 */}
                  <div style={{ marginTop: "6px", paddingTop: "8px", borderTop: "1px dashed #EDE9FE" }}>
                    <button
                      onClick={() => setActiveSection("coach")}
                      style={{
                        display: "flex", alignItems: "center", gap: "9px",
                        width: "100%", padding: "10px 10px",
                        borderRadius: "12px", border: "none",
                        background: activeSection === "coach"
                          ? "linear-gradient(135deg, #D4AF37, #F5D26B)"
                          : "linear-gradient(135deg, #FFFBEB, #FEF3C7)",
                        cursor: "pointer", transition: "all 0.13s",
                        boxShadow: activeSection === "coach" ? "0 3px 12px rgba(212,175,55,0.4)" : "none",
                      }}
                    >
                      <span style={{
                        width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
                        background: activeSection === "coach" ? "rgba(255,255,255,0.35)" : "rgba(212,175,55,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px",
                      }}>🔮</span>
                      <span style={{
                        fontSize: "13px", fontWeight: 700, color: "#92400E",
                      }}>
                        {t.section_coach.replace("🔮 ", "").replace("🔮", "")}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 우측 콘텐츠 영역 */}
              <div className="flex-1 min-w-0">
                {activeSection === "overview"    && <GaugeChart rate={result.overallRate} riskLevel={result.riskLevel} jobName={result.jobName} lang={lang} />}
                {activeSection === "dimensions"  && <SixDimensions dimensions={result.dimensions} lang={lang} />}
                {activeSection === "horizon"     && <TimeHorizonChart data={result.timeHorizon} lang={lang} />}
                {activeSection === "skills"      && <SkillGapAnalysis data={result.skillGap} lang={lang} />}
                {activeSection === "iceberg"     && <IcebergModel layers={result.iceberg} lang={lang} />}
                {activeSection === "income"      && <IncomeImpact data={result.incomeImpact} lang={lang} />}
                {activeSection === "industry"    && <IndustryContext data={result.industryContext} lang={lang} />}
                {activeSection === "transitions" && <TransitionCards cards={result.transitions} mode={mode} lang={lang} />}
                {activeSection === "consulting"  && <ConsultingNote note={result.consultingNote} jobName={result.jobName} lang={lang} />}
                {activeSection === "coach" && (
                  <ChatCoach
                    jobName={result.jobName}
                    analysisContext={result}
                    lang={lang}
                    onUpgrade={() => setShowUpgradePopup(true)}
                  />
                )}

                {/* 공유 + 면책 */}
                {activeSection !== "coach" && (
                  <div className="mt-5 space-y-4">
                    <ShareCard result={result} lang={lang} />
                    <div className="rounded-2xl p-4 text-center" style={{ background: "#F9F9FF", border: "1px solid #EDE9FE" }}>
                      <p className="text-sm font-medium mb-1" style={{ color: "#6B7280" }}>{t.disclaimer_title}</p>
                      <p className="text-sm leading-relaxed" style={{ color: "#9CA3AF" }}>{t.disclaimer_body}</p>
                      <p className="text-sm mt-2" style={{ color: "#C4B5FD" }}>
                        WEF Future of Jobs 2025 · ILO · O*NET · Frey &amp; Osborne (2013·2023) · McKinsey (2023) · Autor (2022)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 요금제 안내 섹션 */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 py-14">
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            display: "inline-block", background: "#F0EEFF", borderRadius: "100px",
            padding: "5px 16px", fontSize: "13px", color: "#6C63FF", fontWeight: 600, marginBottom: "12px",
          }}>요금제</div>
          <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1E1B4B", marginBottom: "8px" }}>
            지금은 무료로 시작하세요
          </h2>
          <p style={{ fontSize: "15px", color: "#6B7280" }}>
            유료 플랜은 곧 출시됩니다 · 출시 시 사전 가입자 특별 혜택 제공
          </p>
        </div>

        {/* 요금제 카드 그리드 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", alignItems: "start" }}>

          {/* FREE */}
          {(() => {
            const plans = [
              {
                tag: "FREE", tagColor: "#6C63FF", tagBg: "#F0EEFF",
                name: "무료", price: null, sub: "로그인 후 바로 시작",
                dark: false, highlight: false, comingSoon: false,
                features: [
                  "기본 분석 3회",
                  "8차원 심층 리포트",
                  "10년 시간 예측",
                  "스킬 갭 분석",
                  "5개 언어 지원",
                  "이 앱이 뭔지 체험",
                ],
              },
              {
                tag: "BASIC", tagColor: "#0891B2", tagBg: "#ECFEFF",
                name: "₩9,900", price: "/월", sub: "곧 출시 예정",
                dark: false, highlight: false, comingSoon: true,
                features: [
                  "기본 분석 무제한",
                  "업무별 세부 대체 분석",
                  "AI 불안 심리 케어",
                  "AI 협업 역량 점수",
                ],
              },
              {
                tag: "STANDARD", tagColor: "#7C3AED", tagBg: "#F5F3FF",
                name: "₩19,900", price: "/월", sub: "곧 출시 예정",
                dark: false, highlight: true, comingSoon: true,
                badge: "인기",
                features: [
                  "BASIC 포함",
                  "비전 시나리오 3가지",
                  "직업 추천 + 역량 로드맵",
                  "연봉 협상 도우미",
                  "미래전략 액션플랜",
                  "AI 챗봇 월 30회",
                ],
              },
              {
                tag: "PREMIUM", tagColor: "#D4AF37", tagBg: "#FFFBEB",
                name: "₩39,900", price: "/월", sub: "곧 출시 예정",
                dark: true, highlight: false, comingSoon: true,
                features: [
                  "STANDARD 포함",
                  "가족 진단 (자녀 3인)",
                  "전공·학교 추천",
                  "AI 챗봇 무제한",
                  "HORIZON Daily Card",
                  "월간 직업 트렌드 리포트",
                ],
              },
              {
                tag: "ANNUAL", tagColor: "#D4AF37", tagBg: "transparent",
                name: "₩159,000", price: "/년", sub: "PREMIUM 기준 33% 할인",
                dark: true, highlight: false, comingSoon: true,
                badge: "최저가",
                features: [
                  "PREMIUM 포함",
                  "PDF 리포트 무제한",
                  "연간 구독 33% 절감",
                ],
              },
            ];

            return plans.map((plan) => (
              <div
                key={plan.tag}
                style={{
                  borderRadius: "22px",
                  border: plan.highlight ? "2px solid #7C3AED" : plan.dark ? "2px solid #4F46E5" : "1.5px solid #EDE9FE",
                  background: plan.dark
                    ? "linear-gradient(145deg, #1E1B4B 0%, #312E81 100%)"
                    : "white",
                  padding: "24px 20px 24px",
                  boxShadow: plan.highlight
                    ? "0 8px 32px rgba(124,58,237,0.2)"
                    : plan.dark
                      ? "0 4px 24px rgba(79,70,229,0.2)"
                      : "0 2px 12px rgba(108,99,255,0.06)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* 뱃지 */}
                {plan.badge && (
                  <div style={{
                    position: "absolute", top: "16px", right: "16px",
                    background: "linear-gradient(135deg, #D4AF37, #F5D26B)",
                    borderRadius: "100px", padding: "3px 10px",
                    fontSize: "11px", fontWeight: 700, color: "#78350F",
                  }}>{plan.badge}</div>
                )}

                <div style={{
                  display: "inline-block",
                  background: plan.dark ? "rgba(255,255,255,0.12)" : plan.tagBg,
                  borderRadius: "100px", padding: "3px 10px",
                  fontSize: "11px", fontWeight: 700,
                  color: plan.dark ? plan.tagColor : plan.tagColor,
                  marginBottom: "12px", letterSpacing: "0.06em",
                }}>{plan.tag}</div>

                <div style={{
                  fontSize: "26px", fontWeight: 900,
                  color: plan.dark ? "white" : "#1E1B4B",
                  marginBottom: "2px",
                }}>
                  {plan.name}
                  {plan.price && <span style={{ fontSize: "14px", fontWeight: 500, color: plan.dark ? "#A5B4FC" : "#9CA3AF" }}>{plan.price}</span>}
                </div>
                <div style={{ fontSize: "12px", color: plan.dark ? "#A5B4FC" : "#9CA3AF", marginBottom: "20px" }}>{plan.sub}</div>

                <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "22px" }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: plan.dark ? "#C7D2FE" : "#374151", lineHeight: 1.4 }}>
                      <span style={{ color: plan.dark ? "#D4AF37" : plan.tagColor, fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>✓</span>
                      <span style={{ wordBreak: "keep-all" }}>{f}</span>
                    </div>
                  ))}
                </div>

                {plan.comingSoon ? (
                  <div style={{
                    width: "100%", padding: "11px",
                    borderRadius: "12px", textAlign: "center",
                    background: plan.dark ? "rgba(255,255,255,0.08)" : "#F9FAFB",
                    color: plan.dark ? "rgba(255,255,255,0.35)" : "#9CA3AF",
                    fontSize: "13px", fontWeight: 600,
                  }}>곧 출시됩니다</div>
                ) : (
                  <button
                    onClick={() => { setAuthReason(undefined); setShowAuthModal(true); }}
                    style={{
                      width: "100%", padding: "12px",
                      borderRadius: "12px", border: "2px solid #6C63FF",
                      background: "white", color: "#6C63FF",
                      fontSize: "14px", fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    무료로 시작하기
                  </button>
                )}
              </div>
            ));
          })()}
        </div>
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
