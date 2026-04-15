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
import CompetencyAssessment from "@/components/CompetencyAssessment";
import CompetencyResultTab from "@/components/CompetencyResult";
import { CompetencyResult as CompetencyResultType } from "@/types/competency";


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
  const [competencyResult, setCompetencyResult] = useState<CompetencyResultType | null>(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  // 첫 화면 서비스 선택: null=선택 전, "free"=무료, "paid"=유료(출시예정)
  const [serviceMode, setServiceMode] = useState<"free" | "paid" | null>(null);

  const popularJobs =
    lang === "ko" ? POPULAR_JOBS_KO :
    lang === "zh" ? POPULAR_JOBS_ZH :
    lang === "ja" ? POPULAR_JOBS_JA :
    lang === "es" ? POPULAR_JOBS_ES :
    POPULAR_JOBS_EN;

  const SECTIONS = [
    { id: "overview",    icon: "📊", label: t.section_overview },
    { id: "competency",  icon: "🧠", label: "미래역량" },
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
    setShowAssessment(true);
    setAssessmentCompleted(false);
    setCompetencyResult(null);
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
          {/* BTS 브랜드 로고 */}
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <div style={{
              color: "white",
              fontSize: "28px",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              textShadow: "0 2px 12px rgba(0,0,0,0.18)",
            }}>
              BTS
            </div>
            <div style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: "8px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginTop: "2px",
            }}>
              BUILD TOMORROW SKILLS
            </div>
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
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          localStorage.clear();
                          sessionStorage.clear();
                          window.location.reload();
                        }}
                        style={{
                          display: "block", width: "100%", padding: "12px 16px",
                          textAlign: "left", fontSize: "14px",
                          color: "#EF4444", fontWeight: 600,
                          background: "none", border: "none", cursor: "pointer",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#FEF2F2"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                      >
                        로그아웃
                      </button>
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
            color: "rgba(255,255,255,0.88)",
            fontSize: "clamp(15px, 2vw, 19px)",
            fontWeight: 400,
            letterSpacing: "0.01em",
            lineHeight: 1.75,
            marginBottom: "8px",
          }}>
            {t.hero_tagline}
          </p>
          <p style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: "clamp(13px, 1.6vw, 16px)",
            fontWeight: 400,
            marginBottom: "20px",
            letterSpacing: "0.01em",
          }}>
            막연한 공포가 아니라, 지금 무엇을 준비해야 하는지 보여드립니다
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
          SERVICE SELECTOR (첫 화면 서비스 선택)
          serviceMode===null → 두 카드 보여줌
          serviceMode==="free" → 검색 카드
          serviceMode==="paid" → 출시예정 안내
      ═══════════════════════════════════════ */}

      {/* ── 서비스 선택 카드 ── */}
      {serviceMode === null && (
        <div
          className="max-w-3xl mx-auto px-4"
          style={{ marginTop: "-56px", position: "relative", zIndex: 20 }}
        >
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}>
            {/* 무료 서비스 카드 */}
            <div
              style={{
                background: "white",
                borderRadius: "28px",
                padding: "32px 24px 28px",
                boxShadow: "0 24px 64px rgba(65,88,208,0.18), 0 4px 20px rgba(0,0,0,0.07)",
                display: "flex", flexDirection: "column",
                cursor: "pointer",
                border: "2px solid transparent",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#6C63FF";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onClick={() => setServiceMode("free")}
            >
              <div style={{
                display: "inline-block", background: "#F0EEFF", borderRadius: "100px",
                padding: "4px 14px", fontSize: "12px", color: "#6C63FF",
                fontWeight: 700, letterSpacing: "0.06em", marginBottom: "16px", width: "fit-content",
              }}>FREE</div>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>🆓</div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#1E1B4B", marginBottom: "6px" }}>
                무료 분석
              </h3>
              <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.7, marginBottom: "20px" }}>
                로그인 후 무료로 시작합니다<br />결과는 내 계정에 저장됩니다
              </p>
              <ul style={{ flex: 1, listStyle: "none", padding: 0, margin: "0 0 20px" }}>
                {[
                  "8차원 AI 대체율 심층 분석",
                  "10년 직업 미래 예측",
                  "스킬 갭 분석",
                  "미래역량 검사",
                  "5개 언어 지원",
                  "즉시 결과 확인",
                ].map((f) => (
                  <li key={f} style={{
                    fontSize: "13px", color: "#374151",
                    padding: "5px 0", display: "flex", alignItems: "center", gap: "8px",
                  }}>
                    <span style={{ color: "#6C63FF", fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button
                style={{
                  width: "100%", padding: "14px", borderRadius: "14px", border: "none",
                  background: "linear-gradient(135deg, #6C63FF, #4158D0)",
                  color: "white", fontSize: "15px", fontWeight: 700, cursor: "pointer",
                }}
              >
                무료 분석 시작하기
              </button>
            </div>

            {/* 유료 서비스 카드 */}
            <div
              style={{
                background: "linear-gradient(145deg, #1E1B4B 0%, #312E81 100%)",
                borderRadius: "28px",
                padding: "32px 24px 28px",
                boxShadow: "0 24px 64px rgba(79,70,229,0.25), 0 4px 20px rgba(0,0,0,0.15)",
                display: "flex", flexDirection: "column",
                cursor: "pointer",
                border: "2px solid transparent",
                transition: "all 0.2s ease",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#A78BFA";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onClick={() => setServiceMode("paid")}
            >
              {/* 곧 출시 뱃지 */}
              <div style={{
                position: "absolute", top: "16px", right: "16px",
                background: "linear-gradient(135deg, #F59E0B, #FCD34D)",
                borderRadius: "100px", padding: "4px 12px",
                fontSize: "11px", fontWeight: 700, color: "#78350F",
              }}>곧 출시</div>

              <div style={{
                display: "inline-block",
                background: "rgba(255,255,255,0.12)",
                borderRadius: "100px",
                padding: "4px 14px", fontSize: "12px", color: "#C4B5FD",
                fontWeight: 700, letterSpacing: "0.06em", marginBottom: "16px", width: "fit-content",
              }}>PREMIUM</div>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>💎</div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "white", marginBottom: "6px" }}>
                유료 서비스
              </h3>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: 1.6, marginBottom: "20px" }}>
                무제한 분석 + 심화 기능<br />₩9,900부터 · 곧 출시 예정
              </p>
              <ul style={{ flex: 1, listStyle: "none", padding: 0, margin: "0 0 20px" }}>
                {[
                  "무제한 분석 횟수",
                  "AI 커리어 코치 (무제한)",
                  "비전 시나리오 3가지",
                  "직업 추천 + 역량 로드맵",
                  "가족 진단 (자녀 3인)",
                  "학교·학원 기관용 플랜",
                ].map((f) => (
                  <li key={f} style={{
                    fontSize: "13px", color: "rgba(255,255,255,0.85)",
                    padding: "5px 0", display: "flex", alignItems: "center", gap: "8px",
                  }}>
                    <span style={{ color: "#A78BFA", fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button
                style={{
                  width: "100%", padding: "14px", borderRadius: "14px",
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  color: "white", fontSize: "15px", fontWeight: 700, cursor: "pointer",
                  outline: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                서비스 내용 보기 →
              </button>
            </div>
          </div>

          {/* 모바일용: 세로 스택 */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media (max-width: 600px) {
              .service-selector-grid { grid-template-columns: 1fr !important; }
            }
          ` }} />

          {/* ── 문제 공감 섹션 ── */}
          <div style={{ marginTop: "64px", textAlign: "center", padding: "0 8px" }}>
            <div style={{
              display: "inline-block", background: "#F0EEFF", borderRadius: "100px",
              padding: "4px 16px", fontSize: "12px", color: "#6C63FF", fontWeight: 700,
              letterSpacing: "0.06em", marginBottom: "16px",
            }}>WHY BTS</div>
            <h2 style={{
              fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 900, color: "#1E1B4B",
              lineHeight: 1.3, marginBottom: "24px", wordBreak: "keep-all",
            }}>
              직업만 보면 절반만 보는 것입니다
            </h2>
            <div style={{
              maxWidth: "540px", margin: "0 auto",
              background: "white", borderRadius: "24px",
              padding: "28px 32px",
              boxShadow: "0 8px 32px rgba(65,88,208,0.1)",
              border: "1px solid #EDE9FE",
              textAlign: "left",
            }}>
              <p style={{ fontSize: "15px", color: "#374151", lineHeight: 1.9, marginBottom: "16px" }}>
                같은 직업이어도<br />
                <strong style={{ color: "#1E1B4B" }}>누구는 버티고, 누구는 흔들립니다.</strong>
              </p>
              <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.8, marginBottom: "16px" }}>
                차이는 단순히 직업 이름이 아니라<br />
                준비 상태와 역량 구조에 있습니다.
              </p>
              <div style={{
                background: "#F5F4FF", borderRadius: "14px",
                padding: "14px 18px",
                borderLeft: "4px solid #6C63FF",
              }}>
                <p style={{ fontSize: "14px", color: "#4C1D95", lineHeight: 1.7, margin: 0, fontWeight: 600 }}>
                  BTS는 직업의 변화 가능성만 보지 않습니다.<br />
                  당신도 함께 봅니다.
                </p>
              </div>
            </div>
          </div>

          {/* ── 이 앱이 다른 이유 섹션 ── */}
          <div style={{ marginTop: "64px", textAlign: "center", padding: "0 8px" }}>
            <div style={{
              display: "inline-block", background: "#FEF3C7", borderRadius: "100px",
              padding: "4px 16px", fontSize: "12px", color: "#92400E", fontWeight: 700,
              letterSpacing: "0.06em", marginBottom: "16px",
            }}>DIFFERENCE</div>
            <h2 style={{
              fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 900, color: "#1E1B4B",
              lineHeight: 1.3, marginBottom: "32px",
            }}>
              이 앱이 다른 이유
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { icon: "🔍", title: "직업 분석", desc: "당신의 직업이 앞으로 어떤 방향으로 움직일지 분석합니다" },
                { icon: "🔗", title: "역량 연결", desc: "직업 변화와 나의 현재 역량을 함께 봅니다" },
                { icon: "🎯", title: "행동 제안", desc: "결과만 던지고 끝내지 않습니다. 지금 줄일 것, 키울 것, 시작할 것을 제안합니다" },
                { icon: "📈", title: "지속 추적", desc: "한 번 보고 끝나는 분석이 아니라 계속 변하는 미래를 따라갈 수 있게 돕습니다" },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{
                  background: "white", borderRadius: "20px",
                  padding: "24px 20px",
                  boxShadow: "0 4px 20px rgba(65,88,208,0.08)",
                  border: "1px solid #EDE9FE",
                  textAlign: "left",
                }}>
                  <div style={{ fontSize: "28px", marginBottom: "10px" }}>{icon}</div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#1E1B4B", marginBottom: "8px" }}>{title}</div>
                  <div style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.7 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 대상자 섹션 ── */}
          <div style={{ marginTop: "64px", marginBottom: "24px", textAlign: "center", padding: "0 8px" }}>
            <div style={{
              display: "inline-block", background: "#F0FDF4", borderRadius: "100px",
              padding: "4px 16px", fontSize: "12px", color: "#059669", fontWeight: 700,
              letterSpacing: "0.06em", marginBottom: "16px",
            }}>WHO NEEDS THIS</div>
            <h2 style={{
              fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 900, color: "#1E1B4B",
              lineHeight: 1.3, marginBottom: "24px",
            }}>
              이런 분께 필요합니다
            </h2>
            <div style={{
              maxWidth: "480px", margin: "0 auto",
              background: "white", borderRadius: "24px",
              padding: "28px 32px",
              boxShadow: "0 8px 32px rgba(65,88,208,0.1)",
              border: "1px solid #EDE9FE",
              textAlign: "left",
            }}>
              {[
                { icon: "💼", text: "내 직업의 미래가 걱정되는 직장인" },
                { icon: "🔄", text: "이직과 전환을 고민하는 분" },
                { icon: "👨‍👩‍👧", text: "자녀 진로를 준비하는 부모" },
                { icon: "📚", text: "학생을 지도하는 교사와 상담자" },
                { icon: "⛪", text: "청소년과 청년의 길을 돕는 교회와 기관" },
              ].map(({ icon, text }) => (
                <div key={text} style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "12px 0",
                  borderBottom: "1px solid #F3F4F6",
                }}>
                  <span style={{ fontSize: "20px", flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>{text}</span>
                </div>
              ))}
              <div style={{ marginTop: "20px" }}>
                <button
                  onClick={() => setServiceMode("free")}
                  style={{
                    width: "100%", padding: "14px", borderRadius: "14px", border: "none",
                    background: "linear-gradient(135deg, #6C63FF, #4158D0)",
                    color: "white", fontSize: "15px", fontWeight: 700, cursor: "pointer",
                  }}
                >
                  무료 분석 시작하기
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── 무료: 기존 검색 카드 ── */}
      {serviceMode === "free" && (
        <div
          id="search-card"
          className="max-w-2xl mx-auto px-4"
          style={{ marginTop: "-56px", position: "relative", zIndex: 20 }}
        >
          {/* 뒤로 버튼 */}
          <button
            onClick={() => { setServiceMode(null); setResult(null); setError(null); }}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(108,99,255,0.2)", borderRadius: "100px",
              padding: "6px 14px", fontSize: "13px", color: "#6C63FF",
              fontWeight: 600, cursor: "pointer", marginBottom: "12px",
            }}
          >
            ← 처음으로
          </button>

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

            {/* 경고 배너 */}
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

            {/* Popular job chips */}
            {!isLoading && !result && (
              <div style={{ marginTop: "18px" }}>
                <p style={{
                  fontSize: "14px", color: "#9CA3AF", marginBottom: "10px",
                  fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase",
                }}>
                  {t.popular_jobs_title}
                </p>
                <div className="grid grid-cols-5" style={{ gap: "8px" }}>
                  {popularJobs.map(({ icon, name, job }) => (
                    <button
                      key={job}
                      onClick={() => handleAnalyze(job)}
                      style={{
                        background: "#F5F4FF", border: "1.5px solid #EDE9FE",
                        borderRadius: "16px", padding: "12px 6px", color: "#5B52D6",
                        fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease",
                        textAlign: "center", display: "flex", flexDirection: "column",
                        alignItems: "center", gap: "6px",
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
      )}

      {/* ── 유료: 출시 예정 안내 ── */}
      {serviceMode === "paid" && (
        <div
          className="max-w-3xl mx-auto px-4"
          style={{ marginTop: "-56px", position: "relative", zIndex: 20 }}
        >
          {/* 뒤로 버튼 */}
          <button
            onClick={() => setServiceMode(null)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(108,99,255,0.2)", borderRadius: "100px",
              padding: "6px 14px", fontSize: "13px", color: "#6C63FF",
              fontWeight: 600, cursor: "pointer", marginBottom: "12px",
            }}
          >
            ← 처음으로
          </button>

          {/* 메인 카드 */}
          <div style={{
            background: "white", borderRadius: "28px",
            padding: "36px 32px 32px",
            boxShadow: "0 24px 64px rgba(65,88,208,0.18), 0 4px 20px rgba(0,0,0,0.07)",
          }}>
            {/* 헤더 */}
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
                borderRadius: "100px", padding: "6px 18px",
                fontSize: "13px", fontWeight: 700, color: "#92400E", marginBottom: "16px",
              }}>
                ⏳ 곧 출시됩니다
              </div>
              <h2 style={{ fontSize: "26px", fontWeight: 900, color: "#1E1B4B", marginBottom: "8px" }}>
                유료 서비스 미리보기
              </h2>
              <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.7 }}>
                출시 전 사전 등록하시면 <strong style={{ color: "#6C63FF" }}>얼리버드 특별 할인</strong>을 받으실 수 있습니다
              </p>
            </div>

            {/* 플랜 4종 — 세로 카드 (설명 포함) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px" }}>

              {/* BASIC */}
              <div style={{
                border: "1.5px solid #BAE6FD", borderRadius: "20px",
                background: "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)",
                padding: "22px 22px 20px", position: "relative", overflow: "hidden",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div>
                    <div style={{
                      display: "inline-block", background: "white", borderRadius: "100px",
                      padding: "3px 12px", fontSize: "11px", fontWeight: 700, color: "#0891B2",
                      border: "1px solid #BAE6FD", marginBottom: "6px",
                    }}>Starter</div>
                    <div style={{ fontSize: "22px", fontWeight: 900, color: "#0C4A6E" }}>₩9,900
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#0891B2" }}>/월</span>
                    </div>
                  </div>
                  <div style={{ fontSize: "36px" }}>🔍</div>
                </div>

                {/* 한 줄 대상 설명 */}
                <div style={{
                  background: "rgba(8,145,178,0.1)", borderRadius: "10px",
                  padding: "8px 12px", marginBottom: "14px",
                  fontSize: "13px", color: "#0C4A6E", fontWeight: 600,
                }}>
                  💡 가볍게 시작하는 분께
                </div>

                {/* 왜 필요한가 */}
                <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.7, marginBottom: "14px" }}>
                  기본 분석과 월간 요약으로 내 직업의 흐름을 꾸준히 확인합니다.
                  무료 분석은 3회로 끝나지만, Starter는 <strong>월 10회 분석</strong>으로
                  여러 직업을 비교하고 내 업무 중 어떤 세부 작업이 먼저 AI로 대체될지까지 알려드립니다.
                </p>

                {/* 제공 방식 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {[
                    ["🔄", "매월 10회", "다양한 직업을 자유롭게 분석"],
                    ["⚙️", "업무별 대체 분석", "내 업무 중 AI가 먼저 대체할 세부 작업 식별"],
                    ["🧠", "AI 협업 역량 점수", "AI와 함께 일하는 능력을 수치로 측정·가이드"],
                    ["💆", "AI 불안 심리 케어", "직업 불안감을 실질적 행동 계획으로 전환"],
                  ].map(([icon, title, desc]) => (
                    <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ fontSize: "16px", flexShrink: 0 }}>{icon}</span>
                      <div>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#0C4A6E" }}>{title}</span>
                        <span style={{ fontSize: "12px", color: "#6B7280" }}> — {desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STANDARD */}
              <div style={{
                border: "2px solid #C4B5FD", borderRadius: "20px",
                background: "linear-gradient(135deg, #FAF5FF 0%, #EDE9FE 100%)",
                padding: "22px 22px 20px", position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: "14px", right: "14px",
                  background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
                  borderRadius: "100px", padding: "3px 10px",
                  fontSize: "11px", fontWeight: 700, color: "white",
                }}>가장 인기</div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div>
                    <div style={{
                      display: "inline-block", background: "white", borderRadius: "100px",
                      padding: "3px 12px", fontSize: "11px", fontWeight: 700, color: "#7C3AED",
                      border: "1px solid #C4B5FD", marginBottom: "6px",
                    }}>Builder</div>
                    <div style={{ fontSize: "22px", fontWeight: 900, color: "#4C1D95" }}>₩19,900
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#7C3AED" }}>/월</span>
                    </div>
                  </div>
                  <div style={{ fontSize: "36px" }}>🗺️</div>
                </div>

                <div style={{
                  background: "rgba(124,58,237,0.1)", borderRadius: "10px",
                  padding: "8px 12px", marginBottom: "14px",
                  fontSize: "13px", color: "#4C1D95", fontWeight: 600,
                }}>
                  💡 가장 추천하는 플랜
                </div>

                <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.7, marginBottom: "14px" }}>
                  심층 분석과 90일 행동계획까지, 실제로 준비를 시작하고 싶은 분께 적합합니다.
                  분석 결과를 알아도 "그래서 나는 어떻게 해야 하지?"라는 질문이 남습니다.
                  Builder는 내 직업의 미래를 <strong>3가지 시나리오</strong>로 보여주고,
                  AI 코치와 함께 맞춤 역량 로드맵을 만들어 드립니다.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {[
                    ["🔄", "기본 분석 20회", "매월 20회, 다양한 직업 시나리오 탐색 가능"],
                    ["🌐", "비전 시나리오 3가지", "현재 유지 / 부분 전환 / 완전 전환 경로를 구체적 그림으로 제시"],
                    ["🗺️", "직업 추천 + 역량 로드맵", "나에게 맞는 다음 직업과 갖춰야 할 역량을 단계별로 안내"],
                    ["🤖", "AI 코치 월 30회", "분석 결과 기반 맞춤 커리어 상담을 AI가 즉시 제공"],
                    ["💰", "연봉 협상 도우미", "내 직업·역량·시장 데이터를 바탕으로 협상 전략 제안"],
                  ].map(([icon, title, desc]) => (
                    <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ fontSize: "16px", flexShrink: 0 }}>{icon}</span>
                      <div>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#4C1D95" }}>{title}</span>
                        <span style={{ fontSize: "12px", color: "#6B7280" }}> — {desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PREMIUM */}
              <div style={{
                border: "2px solid #4F46E5",
                borderRadius: "20px",
                background: "linear-gradient(145deg, #1E1B4B 0%, #312E81 100%)",
                padding: "22px 22px 20px", position: "relative", overflow: "hidden",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div>
                    <div style={{
                      display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: "100px",
                      padding: "3px 12px", fontSize: "11px", fontWeight: 700, color: "#D4AF37",
                      marginBottom: "6px",
                    }}>Family</div>
                    <div style={{ fontSize: "22px", fontWeight: 900, color: "white" }}>₩39,900
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#A5B4FC" }}>/월</span>
                    </div>
                  </div>
                  <div style={{ fontSize: "36px" }}>👑</div>
                </div>

                <div style={{
                  background: "rgba(212,175,55,0.15)", borderRadius: "10px",
                  padding: "8px 12px", marginBottom: "14px",
                  fontSize: "13px", color: "#FDE68A", fontWeight: 600,
                  border: "1px solid rgba(212,175,55,0.3)",
                }}>
                  💡 부모와 자녀를 함께 보고 싶은 가정용 플랜
                </div>

                <p style={{ fontSize: "13px", color: "#C7D2FE", lineHeight: 1.7, marginBottom: "14px" }}>
                  가족의 결과를 함께 관리하고 대화와 진로 준비에 활용할 수 있습니다.
                  <strong style={{ color: "white" }}>자녀 3명까지 함께</strong> 진단하고
                  각자의 적성과 미래 직업을 분석해 드립니다. 매일 아침 AI가
                  직업 세계의 변화를 카드 한 장으로 짧고 강하게 전달합니다.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {[
                    ["🔄", "기본 분석 30회", "나와 가족 모두를 위한 충분한 분석 횟수"],
                    ["👨‍👩‍👧‍👦", "가족 진단 (자녀 3인)", "자녀의 미래 직업·적성을 AI가 청소년 눈높이로 분석"],
                    ["🤖", "AI 코치 무제한", "언제든 커리어 고민을 AI 코치에게 상담, 횟수 제한 없음"],
                    ["🌅", "AI 미래직업 데일리 카드", "매일 아침 카카오톡·이메일로 직업 트렌드 핵심 1가지를 카드로 전송"],
                    ["📈", "월간 직업 트렌드 리포트", "매월 업종별 AI 대체 현황과 신흥 직업 트렌드 리포트 제공"],
                  ].map(([icon, title, desc]) => (
                    <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ fontSize: "16px", flexShrink: 0 }}>{icon}</span>
                      <div>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#E0E7FF" }}>{title}</span>
                        <span style={{ fontSize: "12px", color: "#A5B4FC" }}> — {desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* EDU */}
              <div style={{
                border: "2px solid #6EE7B7", borderRadius: "20px",
                background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
                padding: "22px 22px 20px", position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: "14px", right: "14px",
                  background: "linear-gradient(135deg, #059669, #34D399)",
                  borderRadius: "100px", padding: "3px 10px",
                  fontSize: "11px", fontWeight: 700, color: "white",
                }}>기관용</div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div>
                    <div style={{
                      display: "inline-block", background: "white", borderRadius: "100px",
                      padding: "3px 12px", fontSize: "11px", fontWeight: 700, color: "#059669",
                      border: "1px solid #6EE7B7", marginBottom: "6px",
                    }}>EDU</div>
                    <div style={{ fontSize: "22px", fontWeight: 900, color: "#064E3B" }}>₩1,000,000
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#059669" }}>/년</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>학교·학원 30명 기준</div>
                  </div>
                  <div style={{ fontSize: "36px" }}>🏫</div>
                </div>

                <div style={{
                  background: "rgba(5,150,105,0.1)", borderRadius: "10px",
                  padding: "8px 12px", marginBottom: "14px",
                  fontSize: "13px", color: "#064E3B", fontWeight: 600,
                }}>
                  💡 학생들의 진로를 체계적으로 지도하는 학교·학원·진로상담 기관 선생님
                </div>

                <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.7, marginBottom: "14px" }}>
                  선생님 한 분이 30명의 학생을 일일이 진로 상담하기는 현실적으로 어렵습니다.
                  EDU 플랜은 학생 30명이 각자 자신의 직업 적성과 미래를 AI로 분석하고,
                  선생님은 <strong>대시보드 하나</strong>에서 전체 현황을 파악합니다.
                  AI 진로 코치가 청소년 눈높이에 맞춰 대화하고, 분석 결과는 학부모에게도 공유됩니다.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {[
                    ["👨‍🎓", "학생 30명 계정", "학생들이 각자 계정으로 자신의 진로를 직접 탐색"],
                    ["🧭", "청소년 전용 진로 분석", "성인 기준이 아닌 청소년 적성·학업·미래직업 맞춤 분석"],
                    ["🖥️", "선생님 대시보드", "반 전체 진행 상황·분석 결과를 한눈에 확인 및 관리"],
                    ["📋", "학급 단위 진로 리포트", "반 전체의 진로 경향 통계와 집단 인사이트 리포트 제공"],
                    ["🤖", "AI 진로 코치 (청소년 모드)", "학생이 궁금한 점을 AI 코치가 쉽고 친근하게 안내"],
                    ["👪", "학부모 결과 공유", "자녀의 분석 결과를 학부모에게 안전하게 공유"],
                  ].map(([icon, title, desc]) => (
                    <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ fontSize: "16px", flexShrink: 0 }}>{icon}</span>
                      <div>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#064E3B" }}>{title}</span>
                        <span style={{ fontSize: "12px", color: "#6B7280" }}> — {desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* CTA */}
            <div style={{
              background: "linear-gradient(135deg, #F0EEFF, #EDE9FE)",
              borderRadius: "18px", padding: "24px 20px", textAlign: "center",
              border: "1px solid #DDD6FE",
            }}>
              <div style={{ fontSize: "22px", marginBottom: "8px" }}>🔔</div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#1E1B4B", marginBottom: "6px" }}>
                출시 알림 신청
              </div>
              <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px", lineHeight: 1.6 }}>
                유료 서비스 출시 시 이메일로 가장 먼저 알려드립니다<br />
                <strong style={{ color: "#6C63FF" }}>사전 등록자 30% 얼리버드 할인</strong> 혜택 제공
              </div>
              <a
                href="mailto:futurebox69@gmail.com?subject=유료서비스 출시 알림 신청&body=안녕하세요, 내 직업의 미래 유료 서비스 출시 알림을 신청합니다."
                style={{
                  display: "inline-block",
                  padding: "13px 28px", borderRadius: "14px",
                  background: "linear-gradient(135deg, #6C63FF, #4158D0)",
                  color: "white", fontSize: "15px", fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                출시 알림 신청하기 →
              </a>
              <div style={{ marginTop: "12px", fontSize: "12px", color: "#9CA3AF" }}>
                스팸 없음 · 언제든 취소 가능 · 출시 후 30일 환불 보장
              </div>
            </div>

            {/* 무료 서비스로 이동 */}
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={() => setServiceMode("free")}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#6C63FF", fontSize: "14px", fontWeight: 600,
                  textDecoration: "underline",
                }}
              >
                지금은 무료로 먼저 체험해보기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          MAIN CONTENT AREA
      ═══════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-4 pb-16">

        {/* 역량검사: API 로딩과 무관하게 검사 완료까지 표시 */}
        {showAssessment && !assessmentCompleted && (
          <div className="py-8">
            <CompetencyAssessment
              mode={mode}
              onComplete={(res) => {
                setCompetencyResult(res);
                setAssessmentCompleted(true);
                if (result) {
                  setTimeout(() => {
                    document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 200);
                }
              }}
              onSkip={() => {
                setAssessmentCompleted(true);
                if (result) {
                  setTimeout(() => {
                    document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 200);
                }
              }}
            />
          </div>
        )}

        {/* 로딩 스피너: 검사 완료했지만 API 아직 대기 중 */}
        {(isLoading && !result && (assessmentCompleted || !showAssessment)) ? (
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
            {assessmentCompleted && competencyResult && (
              <p style={{ color: "#6C63FF", fontSize: "13px", fontWeight: 600 }}>
                ✅ 역량 검사 완료! AI 분석 결과를 기다리는 중...
              </p>
            )}
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
        ) : null}

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

        {/* 결과 섹션 — 좌측 네비 + 우측 콘텐츠 (검사 완료 후에만 표시) */}
        {result && !isLoading && (!showAssessment || assessmentCompleted) && (
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
                {remaining !== null && profile?.role !== "admin" && (
                  <span className="text-sm px-3 py-1 rounded-full" style={{ background: "#F5F4FF", color: "#6C63FF", border: "1px solid #EDE9FE" }}>
                    {t.remaining}: {remaining}
                  </span>
                )}
                {profile?.role === "admin" && result && (
                  <span className="text-sm px-3 py-1 rounded-full" style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0" }}>
                    무제한
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
                {activeSection === "competency" && competencyResult ? (
                  <CompetencyResultTab
                    competencyResult={competencyResult}
                    analysisResult={result}
                    jobName={result.jobName}
                    mode={mode}
                  />
                ) : activeSection === "competency" && !competencyResult ? (
                  <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🧠</div>
                    <p style={{ color: "#1E1B4B", fontSize: "17px", fontWeight: 700, marginBottom: "8px" }}>
                      역량 검사를 진행하지 않았습니다
                    </p>
                    <p style={{ color: "#6B7280", fontSize: "14px", lineHeight: 1.6, marginBottom: "24px" }}>
                      검사는 약 2~3분 소요되며,<br />
                      AI 대체율과 교차 분석하여 맞춤 전략을 제공합니다.
                    </p>
                    <button
                      onClick={() => {
                        setShowAssessment(true);
                        setAssessmentCompleted(false);
                        setCompetencyResult(null);
                        setTimeout(() => {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }, 100);
                      }}
                      style={{
                        padding: "14px 36px",
                        borderRadius: "14px",
                        border: "none",
                        background: "linear-gradient(135deg, #6C63FF, #8B5CF6)",
                        color: "#fff",
                        fontSize: "15px",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 8px 24px rgba(108,99,255,0.3)",
                      }}
                    >
                      지금 검사하기
                    </button>
                  </div>
                ) : null}
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

      {/* 요금제 안내 섹션 — 유료 미리보기 모드에서는 숨김 (중복 방지) */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 py-14" style={{ display: serviceMode === "paid" ? "none" : undefined }}>
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
        <style dangerouslySetInnerHTML={{ __html: `
          .pricing-grid { display: grid; gap: 16px; align-items: stretch; }
          @media (max-width: 640px) { .pricing-grid { grid-template-columns: 1fr; max-width: 360px; margin: 0 auto; } }
          @media (min-width: 641px) and (max-width: 1024px) { .pricing-grid { grid-template-columns: repeat(2, 1fr); } }
          @media (min-width: 1025px) { .pricing-grid { grid-template-columns: repeat(3, 1fr); } }
        ` }} />
        <div className="pricing-grid">

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
                  "기본 분석 10회",
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
                  "기본 분석 20회",
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
                  "기본 분석 30회",
                  "가족 진단 (자녀 3인)",
                  "전공·학교 추천",
                  "AI 챗봇 무제한",
                  "AI 미래직업 데일리 카드 (매일 발송)",
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
              {
                tag: "EDU", tagColor: "#059669", tagBg: "#ECFDF5",
                name: "₩1,000,000", price: "/년", sub: "학교·학원 30명 기준",
                dark: false, highlight: false, comingSoon: true,
                badge: "기관용",
                features: [
                  "학생 30명 계정",
                  "청소년 전용 진로 분석",
                  "학과·대학 진출 경로 추천",
                  "선생님 대시보드",
                  "학급 단위 진로 리포트",
                  "AI 진로 코치 (청소년 모드)",
                  "학부모 결과 공유",
                  "그룹 진로 통계 분석",
                  "전담 온라인 상담 지원",
                ],
              },
            ];

            return plans.map((plan) => (
              <div
                key={plan.tag}
                style={{
                  borderRadius: "22px",
                  border: plan.highlight ? "2px solid #7C3AED" : plan.dark ? "2px solid #4F46E5" : plan.tag === "EDU" ? "2px solid #059669" : "1.5px solid #EDE9FE",
                  background: plan.dark
                    ? "linear-gradient(145deg, #1E1B4B 0%, #312E81 100%)"
                    : plan.tag === "EDU" ? "linear-gradient(145deg, #F0FDF4 0%, #DCFCE7 100%)"
                    : "white",
                  padding: "24px 20px 24px",
                  boxShadow: plan.highlight
                    ? "0 8px 32px rgba(124,58,237,0.2)"
                    : plan.dark
                      ? "0 4px 24px rgba(79,70,229,0.2)"
                      : plan.tag === "EDU" ? "0 4px 24px rgba(5,150,105,0.15)"
                      : "0 2px 12px rgba(108,99,255,0.06)",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex", flexDirection: "column" as const,
                }}
              >
                {/* 뱃지 */}
                {plan.badge && (
                  <div style={{
                    position: "absolute", top: "16px", right: "16px",
                    background: plan.tag === "EDU" ? "linear-gradient(135deg, #059669, #34D399)" : "linear-gradient(135deg, #D4AF37, #F5D26B)",
                    borderRadius: "100px", padding: "3px 10px",
                    fontSize: "11px", fontWeight: 700, color: plan.tag === "EDU" ? "#fff" : "#78350F",
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
                  marginBottom: "4px", letterSpacing: "-0.01em",
                }}>
                  {plan.name}
                  {plan.price && <span style={{ fontSize: "14px", fontWeight: 500, color: plan.dark ? "#A5B4FC" : "#9CA3AF" }}>{plan.price}</span>}
                </div>
                <div style={{ fontSize: "12px", color: plan.dark ? "#A5B4FC" : "#9CA3AF", marginBottom: "20px" }}>{plan.sub}</div>

                <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "22px", flex: 1 }}>
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
                