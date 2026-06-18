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
import { getLanding } from "@/lib/landing-content";
import { FREE_LIMIT } from "@/lib/supabase";
import CompetencyAssessment from "@/components/CompetencyAssessment";
import CompetencyResultTab from "@/components/CompetencyResult";
import { CompetencyResult as CompetencyResultType } from "@/types/competency";
import { buildCompetencyResultFromCode } from "@/lib/reframe-code";
import SurvivalSkills from "@/components/SurvivalSkills";
import JobIcon from "@/components/JobIcon";


const JOB_ICONS = ["stethoscope", "graduation-cap", "scale", "laptop", "pill", "heart-pulse", "calculator", "landmark", "flame", "shield"] as const;

const POPULAR_JOBS_KO = [
  { icon: JOB_ICONS[0], name: "의사",     job: "의사" },
  { icon: JOB_ICONS[1], name: "교사",     job: "교사" },
  { icon: JOB_ICONS[2], name: "변호사",   job: "변호사" },
  { icon: JOB_ICONS[3], name: "프로그래머", job: "프로그래머" },
  { icon: JOB_ICONS[4], name: "약사",     job: "약사" },
  { icon: JOB_ICONS[5], name: "간호사",   job: "간호사" },
  { icon: JOB_ICONS[6], name: "회계사",   job: "회계사" },
  { icon: JOB_ICONS[7], name: "공무원",   job: "공무원" },
  { icon: JOB_ICONS[8], name: "소방관",   job: "소방관" },
  { icon: JOB_ICONS[9], name: "경찰관",   job: "경찰관" },
];

const POPULAR_JOBS_EN = [
  { icon: JOB_ICONS[0], name: "Doctor",       job: "Doctor" },
  { icon: JOB_ICONS[1], name: "Teacher",       job: "Teacher" },
  { icon: JOB_ICONS[2], name: "Lawyer",        job: "Lawyer" },
  { icon: JOB_ICONS[3], name: "Programmer",    job: "Programmer" },
  { icon: JOB_ICONS[4], name: "Pharmacist",    job: "Pharmacist" },
  { icon: JOB_ICONS[5], name: "Nurse",         job: "Nurse" },
  { icon: JOB_ICONS[6], name: "Accountant",    job: "Accountant" },
  { icon: JOB_ICONS[7], name: "Civil Servant", job: "Civil Servant" },
  { icon: JOB_ICONS[8], name: "Firefighter",   job: "Firefighter" },
  { icon: JOB_ICONS[9], name: "Police Officer",job: "Police Officer" },
];

const POPULAR_JOBS_ZH = [
  { icon: JOB_ICONS[0], name: "医生",   job: "医生" },
  { icon: JOB_ICONS[1], name: "教师",   job: "教师" },
  { icon: JOB_ICONS[2], name: "律师",   job: "律师" },
  { icon: JOB_ICONS[3], name: "程序员", job: "程序员" },
  { icon: JOB_ICONS[4], name: "药剂师", job: "药剂师" },
  { icon: JOB_ICONS[5], name: "护士",   job: "护士" },
  { icon: JOB_ICONS[6], name: "会计师", job: "会计师" },
  { icon: JOB_ICONS[7], name: "公务员", job: "公务员" },
  { icon: JOB_ICONS[8], name: "消防员", job: "消防员" },
  { icon: JOB_ICONS[9], name: "警察",   job: "警察" },
];

const POPULAR_JOBS_JA = [
  { icon: JOB_ICONS[0], name: "医師",       job: "医師" },
  { icon: JOB_ICONS[1], name: "教師",       job: "教師" },
  { icon: JOB_ICONS[2], name: "弁護士",     job: "弁護士" },
  { icon: JOB_ICONS[3], name: "プログラマー", job: "プログラマー" },
  { icon: JOB_ICONS[4], name: "薬剤師",     job: "薬剤師" },
  { icon: JOB_ICONS[5], name: "看護師",     job: "看護師" },
  { icon: JOB_ICONS[6], name: "会計士",     job: "会計士" },
  { icon: JOB_ICONS[7], name: "公務員",     job: "公務員" },
  { icon: JOB_ICONS[8], name: "消防士",     job: "消防士" },
  { icon: JOB_ICONS[9], name: "警察官",     job: "警察官" },
];

const POPULAR_JOBS_ES = [
  { icon: JOB_ICONS[0], name: "Médico",       job: "Médico" },
  { icon: JOB_ICONS[1], name: "Maestro",       job: "Maestro" },
  { icon: JOB_ICONS[2], name: "Abogado",       job: "Abogado" },
  { icon: JOB_ICONS[3], name: "Programador",   job: "Programador" },
  { icon: JOB_ICONS[4], name: "Farmacéutico",  job: "Farmacéutico" },
  { icon: JOB_ICONS[5], name: "Enfermero",     job: "Enfermero" },
  { icon: JOB_ICONS[6], name: "Contador",      job: "Contador" },
  { icon: JOB_ICONS[7], name: "Funcionario",   job: "Funcionario" },
  { icon: JOB_ICONS[8], name: "Bombero",       job: "Bombero" },
  { icon: JOB_ICONS[9], name: "Policía",       job: "Policía" },
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
  const L = getLanding(lang);
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
  // 역량의 지도 결과 코드 연동 (§4-1)
  const [reframeCode, setReframeCode] = useState("");
  const [reframeCodeError, setReframeCodeError] = useState("");
  const [importedCompetency, setImportedCompetency] = useState<CompetencyResultType | null>(null);
  const [importedDepth, setImportedDepth] = useState<1 | 2 | null>(null);
  // 첫 화면 서비스 선택: null=선택 전, "free"=무료, "paid"=유료(출시예정)
  const [serviceMode, setServiceMode] = useState<"free" | "paid" | null>("free");

  // G1 — ?track= 파라미터 읽기·보존 (adult / teen)
  const [trackParam, setTrackParam] = useState<"adult" | "teen" | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("track");
    if (t === "adult" || t === "teen") {
      setTrackParam(t);
      sessionStorage.setItem("reframe_track", t);
    } else {
      const stored = sessionStorage.getItem("reframe_track");
      if (stored === "adult" || stored === "teen") {
        setTrackParam(stored as "adult" | "teen");
      }
    }
  }, []);

  const popularJobs =
    lang === "ko" ? POPULAR_JOBS_KO :
    lang === "zh" ? POPULAR_JOBS_ZH :
    lang === "ja" ? POPULAR_JOBS_JA :
    lang === "es" ? POPULAR_JOBS_ES :
    POPULAR_JOBS_EN;

  const SECTIONS = [
    { id: "overview",    icon: "barchart",       label: t.section_overview },
    { id: "survival",    icon: "shield",         label: lang === "ko" ? "생존스킬" : lang === "zh" ? "生存技能" : lang === "ja" ? "生存スキル" : lang === "es" ? "Supervivencia" : "Survival Skills" },
    { id: "competency",  icon: "brain",          label: lang === "ko" ? "미래역량" : lang === "zh" ? "未来能力" : lang === "ja" ? "未来力" : lang === "es" ? "Competencias" : "Competencies" },
    { id: "dimensions",  icon: "target",         label: t.section_dimensions },
    { id: "horizon",     icon: "hourglass",      label: t.section_horizon },
    { id: "skills",      icon: "graduation-cap", label: t.section_skills },
    { id: "iceberg",     icon: "snowflake",      label: t.section_iceberg },
    { id: "income",      icon: "dollar-sign",    label: t.section_income },
    { id: "industry",    icon: "factory",        label: t.section_industry },
    { id: "transitions", icon: "rocket",         label: t.section_transitions },
    { id: "consulting",  icon: "pen-line",       label: t.section_consulting },
    { id: "coach",       icon: "sparkles",       label: t.section_coach },
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
      // 비로그인: localStorage로 1회 익명 분석 허용
      const anonUsed =
        typeof window !== "undefined"
          ? localStorage.getItem("anonymousAnalysisUsed")
          : null;
      if (anonUsed) {
        // 이미 1회 사용 → 로그인 유도
        setAuthReason(
          lang === "ko"
            ? "무료 분석 1회를 모두 사용했습니다. 계속 분석하려면 로그인해 주세요."
            : "You've used your 1 free analysis. Please log in to continue."
        );
        setShowAuthModal(true);
        return;
      }
      // 첫 익명 분석은 진행 (성공 후 localStorage에 기록)
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
    if (importedCompetency) {
      // 역량의 지도 코드로 가져온 결과가 있으면 앱 내 검사를 건너뛴다 (§4-1)
      setShowAssessment(false);
      setAssessmentCompleted(true);
      setCompetencyResult(importedCompetency);
    } else {
      setShowAssessment(true);
      setAssessmentCompleted(false);
      setCompetencyResult(null);
    }
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
                // 비로그인 첫 분석 성공 → 익명 사용량 마킹
                if (!user && typeof window !== "undefined") {
                  localStorage.setItem("anonymousAnalysisUsed", new Date().toISOString());
                }
                setTimeout(() => {
                  document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
              } else if (event.type === "error") {
                setError(event.error ?? t.error_analyze);
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
        // 비로그인 첫 분석 성공 → 익명 사용량 마킹
        if (!user && typeof window !== "undefined") {
          localStorage.setItem("anonymousAnalysisUsed", new Date().toISOString());
        }
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
    <main className="min-h-screen overflow-x-clip" style={{ background: "#0B1B2B" }}>

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
            <JobIcon name="rocket" size={40} color="#C9A24B" style={{ marginBottom: "12px" }} />
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1E1B4B", marginBottom: "12px", whiteSpace: "pre-line" }}>
              {L.upgrade_title}
            </h2>
            <p style={{ fontSize: "15px", color: "#6B7280", lineHeight: 1.7, marginBottom: "24px", whiteSpace: "pre-line" }}>
              {L.upgrade_body}
            </p>
            <button style={{
              width: "100%", padding: "16px", borderRadius: "14px", border: "none",
              background: "linear-gradient(135deg, #C9A24B, #B8912A)",
              color: "white", fontSize: "16px", fontWeight: 700, cursor: "pointer",
              marginBottom: "10px",
            }}>
              {L.upgrade_cta}
            </button>
            <button onClick={() => setShowUpgradePopup(false)} style={{
              width: "100%", padding: "12px", borderRadius: "14px",
              border: "1.5px solid #F2EBDC", background: "white",
              color: "#6B7280", fontSize: "14px", cursor: "pointer",
            }}>
              {L.upgrade_later}
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          HERO SECTION — E style gradient
      ═══════════════════════════════════════ */}
      <div
        style={{
          background: "linear-gradient(135deg, #0B1B2B 0%, #0F2438 55%, #142B44 100%)",
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
          {/* REFRAME 브랜드 로고 */}
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1, minWidth: 0 }}>
            <a
              href="https://futurebox.live"
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textDecoration: "none",
                marginBottom: "4px",
                display: "block",
                whiteSpace: "nowrap",
              }}
            >
              ← REFRAME
            </a>
            <div style={{
              color: "#C9A24B",
              fontSize: "clamp(17px, 5.2vw, 22px)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              textShadow: "0 2px 12px rgba(0,0,0,0.18)",
              whiteSpace: "nowrap",
            }}>
              {lang === "ko" ? "직업의 미래" : "Future of Work"}
            </div>
            <div style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "8px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginTop: "2px",
              whiteSpace: "nowrap",
            }}>
              {L.brand_subtitle}
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
                    <span></span>
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
                        {L.nav_logout}
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
                  {L.nav_login}
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
              <span style={{ color: "#FFE066", fontSize: "10px" }}></span>
              <span style={{ fontWeight: 800 }}>{t.analyzed_before}{totalCount.toLocaleString()}</span>
              <span style={{ opacity: 0.85 }}>{t.analyzed_after}</span>
            </div>
          )}

          {/* Main headline — D style bold typography */}
          <h1
            style={{
              color: "white",
              fontWeight: 900,
              fontSize: "clamp(30px, 7vw, 68px)",
              lineHeight: 1.2,
              marginBottom: "18px",
              textShadow: "0 2px 24px rgba(0,0,0,0.12)",
              wordBreak: "keep-all",
              letterSpacing: "-0.01em",
            }}
          >
            {t.hero_line1}<br />
            <span style={{ opacity: 0.96 }}>
              {(() => {
                const line = t.hero_line2;
                const accentMap: Record<string, string> = {
                  ko: "구조적인",
                  en: "Survive",
                  zh: "存活",
                  ja: "生き残れる",
                  es: "Sobrevivirá",
                };
                const keyword = accentMap[lang] ?? "";
                if (keyword && line.includes(keyword)) {
                  const idx = line.indexOf(keyword);
                  return (
                    <>
                      {line.slice(0, idx)}
                      <span className="accent">{keyword}</span>
                      {line.slice(idx + keyword.length)}
                    </>
                  );
                }
                return line;
              })()}
            </span>
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
            {lang === "ko"
              ? "막연한 공포가 아니라, 지금 무엇을 준비해야 하는지 보여드립니다"
              : "Not vague fear — we show you what to prepare right now"}
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
            <JobIcon name="refresh" size={20} color="#C9A24B" />
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
          {/* 신뢰 숫자 바 */}
          <div style={{ marginTop: "16px", display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap" }}>
            {[
              { icon: "brain",   text: lang === "ko" ? "Claude AI 기반 분석" : "Powered by Claude AI" },
              { icon: "refresh", text: lang === "ko" ? "매월 데이터 업데이트" : "Monthly data updates" },
              { icon: "zap",     text: lang === "ko" ? "결과 즉시 저장" : "Results saved instantly" },
            ].map(({ icon, text }) => (
              <div key={text} style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "rgba(255,255,255,0.12)", borderRadius: "100px",
                padding: "5px 14px", fontSize: "12px", color: "rgba(255,255,255,0.85)", fontWeight: 600,
              }}>
                <JobIcon name={icon} size={14} color="#C9A24B" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          SERVICE SELECTOR (첫 화면 서비스 선택)
          serviceMode===null → 두 카드 보여줌
          serviceMode==="free" → 검색 카드
          serviceMode==="paid" → 출시예정 안내
      ═══════════════════════════════════════ */}

      {/* ── 무료: 기존 검색 카드 ── */}
      {serviceMode === "free" && (
        <div
          id="search-card"
          className="max-w-2xl mx-auto px-4"
          style={{ marginTop: "-56px", position: "relative", zIndex: 20 }}
        >
          <div
            className="rounded-3xl shadow-lg"
            style={{
              background: "white",
              padding: "20px 18px 18px",
              boxShadow: "0 24px 64px rgba(201,162,75,0.18), 0 4px 20px rgba(0,0,0,0.07)",
            }}
          >
            {/* 사용량 카운터 + 경고 */}
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <UsageCounter onUpgradeClick={() => setShowUpgradePopup(true)} />
              {!user && !authLoading && (
                <button
                  onClick={() => { setAuthReason(L.auth_reason_3free); setShowAuthModal(true); }}
                  style={{
                    fontSize: "12px", color: "#9CA3AF", background: "none",
                    border: "none", cursor: "pointer", textDecoration: "underline",
                  }}
                >
                  {L.login_free_3}
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
                {L.usage_left(FREE_LIMIT - (profile?.monthly_usage ?? 0))}
              </div>
            )}

            <JobInput onAnalyze={handleAnalyze} isLoading={isLoading} mode={mode} lang={lang} />

            {/* 역량의 지도 결과 코드 가져오기 (§4-1) */}
            {!isLoading && !result && (
              <div style={{ marginTop: "14px" }}>
                {importedCompetency ? (
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      background: "#F0FDF4", border: "1.5px solid #86EFAC",
                      borderRadius: "14px", padding: "12px 16px",
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>{importedCompetency.archetypeEmoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#15803D" }}>
                        {lang === "ko"
                          ? `역량의 지도에서 가져왔습니다 · ${importedCompetency.archetype}`
                          : `Imported from the Competency Map · ${importedCompetency.archetype}`}
                      </p>
                      <p style={{ fontSize: "12px", color: "#16A34A" }}>
                        {lang === "ko"
                          ? `${importedDepth === 2 ? "2층 프로파일" : "1층 스냅샷"} · 직업 분석 시 역량검사를 건너뜁니다`
                          : `${importedDepth === 2 ? "Layer 2" : "Layer 1"} · the in-app assessment will be skipped`}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setImportedCompetency(null);
                        setImportedDepth(null);
                        setReframeCode("");
                        setReframeCodeError("");
                      }}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#16A34A", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap",
                      }}
                    >
                      {lang === "ko" ? "해제" : "Clear"}
                    </button>
                  </div>
                ) : (
                  <details style={{ fontSize: "13px" }}>
                    <summary style={{ cursor: "pointer", color: "#9CA3AF", fontWeight: 600, listStyle: "none" }}>
                      {lang === "ko"
                        ? "🗺️ ‘역량의 지도’ 결과 코드가 있으신가요?"
                        : "🗺️ Have a Competency Map result code?"}
                    </summary>
                    <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                      <input
                        type="text"
                        value={reframeCode}
                        onChange={(e) => {
                          setReframeCode(e.target.value);
                          if (reframeCodeError) setReframeCodeError("");
                        }}
                        placeholder="RF-XXXX-XXXX-XXXX-XXXX"
                        style={{
                          flex: 1, minWidth: "200px", padding: "12px 14px",
                          borderRadius: "12px", border: `1.5px solid ${reframeCodeError ? "#EF4444" : "#EDE9FE"}`,
                          fontFamily: "monospace", fontSize: "14px", color: "#1E1B4B", outline: "none",
                          letterSpacing: "0.04em", textTransform: "uppercase",
                        }}
                      />
                      <button
                        onClick={() => {
                          const built = buildCompetencyResultFromCode(reframeCode, lang);
                          if (!built) {
                            setReframeCodeError(
                              lang === "ko"
                                ? "코드를 읽을 수 없습니다. RF-로 시작하는 코드를 확인해 주세요."
                                : "Could not read the code. Check the RF- code."
                            );
                            return;
                          }
                          setImportedCompetency(built.result);
                          setImportedDepth(built.depth);
                          setReframeCodeError("");
                        }}
                        style={{
                          padding: "12px 22px", borderRadius: "12px", border: "none",
                          background: "#6C63FF", color: "#fff", fontWeight: 700,
                          fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap",
                        }}
                      >
                        {lang === "ko" ? "가져오기" : "Import"}
                      </button>
                    </div>
                    {reframeCodeError && (
                      <p style={{ marginTop: "6px", color: "#EF4444", fontSize: "12px" }}>{reframeCodeError}</p>
                    )}
                    <p style={{ marginTop: "6px", color: "#9CA3AF", fontSize: "12px", lineHeight: 1.5 }}>
                      {lang === "ko"
                        ? "‘역량의 지도’ 검사를 마치면 [이 결과 가져가기]에서 코드를 받을 수 있습니다."
                        : "Finish the Competency Map assessment and copy the code from [Take these results]."}
                    </p>
                  </details>
                )}
              </div>
            )}

            {/* Popular job chips */}
            {!isLoading && !result && (
              <div style={{ marginTop: "18px" }}>
                <p style={{
                  fontSize: "14px", color: "#9CA3AF", marginBottom: "10px",
                  fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase",
                }}>
                  {t.popular_jobs_title}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2">
                  {popularJobs.map(({ icon, name, job }) => (
                    <button
                      key={job}
                      onClick={() => handleAnalyze(job)}
                      style={{
                        background: "rgba(201,162,75,0.08)", border: "1.5px solid rgba(201,162,75,0.25)",
                        borderRadius: "16px", padding: "14px 10px",
                        minHeight: "56px", color: "#C9A24B",
                        fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease",
                        textAlign: "center", display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: "6px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#C9A24B";
                        e.currentTarget.style.color = "#0B1B2B";
                        e.currentTarget.style.borderColor = "#C9A24B";
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(201,162,75,0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(201,162,75,0.08)";
                        e.currentTarget.style.color = "#C9A24B";
                        e.currentTarget.style.borderColor = "rgba(201,162,75,0.25)";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <JobIcon name={icon} size={24} />
                      <span style={{ fontSize: "14px", lineHeight: 1.3, wordBreak: "keep-all" }}>{name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{ textAlign: "center", marginTop: "12px", display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            <button
              onClick={() => setServiceMode("paid")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#C9A24B", fontSize: "13px", fontWeight: 600, textDecoration: "underline" }}
            >
              {L.link_paid}
            </button>
            <a
              href={lang === "ko" ? "/v3" : `/v3?lang=${lang}`}
              style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", fontWeight: 600, textDecoration: "underline" }}
            >
              {L.link_beta_v3}
            </a>
          </div>
        </div>
      )}

      {/* ── 랜딩 섹션 (결과 없을 때만 표시) ── */}
      {serviceMode === "free" && !result && !isLoading && (
        <div className="max-w-3xl mx-auto px-4">

          {/* 문제 공감 */}
          <div style={{ marginTop: "56px", textAlign: "center" }}>
            <div className="label-mono" style={{
              display: "inline-block", background: "rgba(201,162,75,0.12)", borderRadius: "100px",
              padding: "4px 16px", fontSize: "12px", color: "#C9A24B", fontWeight: 500,
              marginBottom: "14px",
            }}>{L.why_tag}</div>
            <h2 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 900, color: "#1E1B4B", lineHeight: 1.3, marginBottom: "20px", wordBreak: "keep-all" }}>
              {L.why_title}
            </h2>
            <div style={{
              background: "white", borderRadius: "20px", padding: "24px 28px",
              boxShadow: "0 8px 32px rgba(201,162,75,0.1)", border: "1px solid #EDE9FE", textAlign: "left",
            }}>
              <p style={{ fontSize: "15px", color: "#374151", lineHeight: 1.9, marginBottom: "14px" }}>
                {L.why_lead}<br />
                <strong style={{ color: "#1E1B4B" }}>{L.why_lead_strong}</strong>
              </p>
              <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.8, marginBottom: "14px" }}>
                {L.why_sub}
              </p>
              <div style={{ background: "rgba(201,162,75,0.08)", borderRadius: "12px", padding: "14px 18px", borderLeft: "4px solid #C9A24B" }}>
                <p style={{ fontSize: "14px", color: "#1E1B4B", lineHeight: 1.7, margin: 0, fontWeight: 600 }}>
                  {L.why_highlight}
                </p>
              </div>
            </div>
          </div>

          {/* 8개 분석 축 */}
          <div style={{ marginTop: "56px", textAlign: "center" }}>
            <div className="label-mono" style={{
              display: "inline-block", background: "rgba(254,243,199,0.9)", borderRadius: "100px",
              padding: "4px 16px", fontSize: "12px", color: "#92400E", fontWeight: 500,
              marginBottom: "14px",
            }}>{L.eyes_tag}</div>
            <h2 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 900, color: "#1E1B4B", lineHeight: 1.3, marginBottom: "8px" }}>
              {L.eyes_title}
            </h2>
            <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>
              {L.eyes_sub}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {L.eyes.map(({ icon, name, risk }) => (
                <div key={name} style={{
                  background: "white", borderRadius: "16px", padding: "18px 16px",
                  boxShadow: "0 4px 16px rgba(201,162,75,0.08)", border: "1px solid rgba(201,162,75,0.2)", textAlign: "left",
                }}>
                  <JobIcon name={icon} size={22} color="#C9A24B" style={{ marginBottom: "8px" }} />
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#1E1B4B", marginBottom: "4px" }}>{name}</div>
                  <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.6 }}>{risk}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 정체성 사례 — 점수가 아니라 결 */}
          <div style={{ marginTop: "56px", textAlign: "center" }}>
            <div className="label-mono" style={{
              display: "inline-block", background: "rgba(201,162,75,0.12)", borderRadius: "100px",
              padding: "4px 16px", fontSize: "12px", color: "#C9A24B", fontWeight: 500,
              marginBottom: "14px",
            }}>{L.identity_tag}</div>
            <h2 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 900, color: "#1E1B4B", lineHeight: 1.4, marginBottom: "8px", wordBreak: "keep-all" }}>
              {L.identity_title_1}<br />{L.identity_title_2}
            </h2>
            <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px", wordBreak: "keep-all" }}>
              {L.identity_sub}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {L.identity_cases.map(({ job, primary, secondary }) => (
                <div key={job} style={{
                  background: "white", borderRadius: "16px", padding: "18px 22px",
                  boxShadow: "0 4px 16px rgba(201,162,75,0.08)", border: "1px solid rgba(201,162,75,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
                  flexWrap: "wrap", textAlign: "left",
                }}>
                  <span style={{ fontSize: "14px", color: "#6B7280", fontWeight: 500 }}>{job}</span>
                  <span style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "15px", fontWeight: 800, color: "#1E1B4B", display: "block" }}>&ldquo;{primary}&rdquo;</span>
                    <span style={{ fontSize: "12px", color: "#C9A24B", fontStyle: "italic" }}>{secondary}</span>
                  </span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "14px", color: "#374151", marginTop: "16px", lineHeight: 1.8, wordBreak: "keep-all" }}>
              {L.identity_close_1}<br />
              <strong style={{ color: "#1E1B4B" }}>{L.identity_close_strong}</strong>
            </p>
          </div>

          {/* 이 앱이 다른 이유 */}
          <div style={{ marginTop: "56px", textAlign: "center" }}>
            <div className="label-mono" style={{
              display: "inline-block", background: "rgba(240,253,244,0.95)", borderRadius: "100px",
              padding: "4px 16px", fontSize: "12px", color: "#059669", fontWeight: 500,
              marginBottom: "14px",
            }}>{L.diff_tag}</div>
            <h2 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 900, color: "#1E1B4B", lineHeight: 1.3, marginBottom: "24px" }}>
              {L.diff_title}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {L.diff_items.map(({ icon, title, desc }) => (
                <div key={title} style={{
                  background: "white", borderRadius: "16px", padding: "20px 16px",
                  boxShadow: "0 4px 16px rgba(201,162,75,0.08)", border: "1px solid rgba(201,162,75,0.2)", textAlign: "left",
                }}>
                  <JobIcon name={icon} size={24} color="#C9A24B" style={{ marginBottom: "8px" }} />
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#1E1B4B", marginBottom: "6px" }}>{title}</div>
                  <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.6 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 신뢰 — 이 앱이 모른다고 말하는 것들 (P.17 철학) */}
          <div style={{ marginTop: "56px", textAlign: "center" }}>
            <div className="label-mono" style={{
              display: "inline-block", background: "rgba(11,27,43,0.06)", borderRadius: "100px",
              padding: "4px 16px", fontSize: "12px", color: "#0B1B2B", fontWeight: 500,
              marginBottom: "14px",
            }}>{L.honesty_tag}</div>
            <h2 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 900, color: "#1E1B4B", lineHeight: 1.3, marginBottom: "8px", wordBreak: "keep-all" }}>
              {L.honesty_title}
            </h2>
            <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px", wordBreak: "keep-all" }}>
              {L.honesty_sub}
            </p>
            <div style={{
              background: "#0B1B2B", borderRadius: "20px", padding: "26px 28px",
              textAlign: "left", boxShadow: "0 8px 32px rgba(11,27,43,0.25)",
            }}>
              {L.honesty_lines.map((text, i, arr) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: "12px",
                  padding: "12px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                }}>
                  <span style={{ color: "#C9A24B", fontWeight: 800, flexShrink: 0, fontSize: "14px" }}>—</span>
                  <span style={{ fontSize: "14px", color: "#F2EBDC", lineHeight: 1.8, wordBreak: "keep-all" }}>{text}</span>
                </div>
              ))}
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginTop: "16px", marginBottom: 0, lineHeight: 1.7, wordBreak: "keep-all" }}>
                {L.honesty_footer}
              </p>
            </div>
          </div>

          {/* 대상자 */}
          <div style={{ marginTop: "56px", marginBottom: "56px", textAlign: "center" }}>
            <div className="label-mono" style={{
              display: "inline-block", background: "rgba(255,247,237,0.95)", borderRadius: "100px",
              padding: "4px 16px", fontSize: "12px", color: "#C2410C", fontWeight: 500,
              marginBottom: "14px",
            }}>{L.who_tag}</div>
            <h2 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 900, color: "#1E1B4B", lineHeight: 1.3, marginBottom: "20px" }}>
              {L.who_title}
            </h2>
            <div style={{
              background: "white", borderRadius: "20px", padding: "24px 28px",
              boxShadow: "0 8px 32px rgba(201,162,75,0.1)", border: "1px solid #EDE9FE", textAlign: "left",
            }}>
              {L.who_items.map(({ icon, text }, i, arr) => (
                <div key={text} style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "13px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid #F3F4F6" : "none",
                }}>
                  <JobIcon name={icon} size={20} color="#C9A24B" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>{text}</span>
                </div>
              ))}
              <button
                onClick={() => { const el = document.querySelector("input"); el?.focus(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                style={{
                  width: "100%", marginTop: "20px", padding: "14px", borderRadius: "14px", border: "none",
                  background: "linear-gradient(135deg, #C9A24B, #B8912A)",
                  color: "white", fontSize: "15px", fontWeight: 700, cursor: "pointer",
                }}
              >
                {L.who_cta}
              </button>
            </div>
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
            onClick={() => setServiceMode("free")}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(201,162,75,0.2)", borderRadius: "100px",
              padding: "6px 14px", fontSize: "13px", color: "#C9A24B",
              fontWeight: 600, cursor: "pointer", marginBottom: "12px",
            }}
          >
            {L.paid.back}
          </button>

          {/* 메인 카드 */}
          <div style={{
            background: "white", borderRadius: "28px",
            padding: "36px 32px 32px",
            boxShadow: "0 24px 64px rgba(201,162,75,0.18), 0 4px 20px rgba(0,0,0,0.07)",
          }}>
            {/* 헤더 */}
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
                borderRadius: "100px", padding: "6px 18px",
                fontSize: "13px", fontWeight: 700, color: "#92400E", marginBottom: "16px",
              }}>
                {L.paid.ebBadge}
              </div>
              <h2 style={{ fontSize: "26px", fontWeight: 900, color: "#1E1B4B", marginBottom: "8px" }}>
                {L.paid.header}
              </h2>
              <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.7 }}>
                {L.paid.subPre}<strong style={{ color: "#C9A24B" }}>{L.paid.subBold}</strong>{L.paid.subPost}
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
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#0891B2" }}>{lang === "ko" ? "/월" : "/mo"}</span>
                    </div>
                  </div>
                  <JobIcon name="search" size={36} color="#0891B2" />
                </div>

                {/* 한 줄 대상 설명 */}
                <div style={{
                  background: "rgba(8,145,178,0.1)", borderRadius: "10px",
                  padding: "8px 12px", marginBottom: "14px",
                  fontSize: "13px", color: "#0C4A6E", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: "6px",
                }}>
                  <JobIcon name="sparkles" size={14} color="#0891B2" />{L.paid.basic.oneLiner}
                </div>

                {/* 왜 필요한가 */}
                <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.7, marginBottom: "14px" }}>
                  {L.paid.basic.paragraph}
                </p>

                {/* 제공 방식 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {L.paid.basic.rows.map(({ icon, title, desc }) => (
                    <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <JobIcon name={icon} size={16} color="#0891B2" style={{ flexShrink: 0, marginTop: "2px" }} />
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
                }}>{L.paid.standard.badge}</div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div>
                    <div style={{
                      display: "inline-block", background: "white", borderRadius: "100px",
                      padding: "3px 12px", fontSize: "11px", fontWeight: 700, color: "#7C3AED",
                      border: "1px solid #C4B5FD", marginBottom: "6px",
                    }}>Builder</div>
                    <div style={{ fontSize: "22px", fontWeight: 900, color: "#4C1D95" }}>₩19,900
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#7C3AED" }}>{lang === "ko" ? "/월" : "/mo"}</span>
                    </div>
                  </div>
                  <JobIcon name="map" size={36} color="#7C3AED" />
                </div>

                <div style={{
                  background: "rgba(124,58,237,0.1)", borderRadius: "10px",
                  padding: "8px 12px", marginBottom: "14px",
                  fontSize: "13px", color: "#4C1D95", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: "6px",
                }}>
                  <JobIcon name="sparkles" size={14} color="#7C3AED" />{L.paid.standard.oneLiner}
                </div>

                <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.7, marginBottom: "14px" }}>
                  {L.paid.standard.paragraph}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {L.paid.standard.rows.map(({ icon, title, desc }) => (
                    <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <JobIcon name={icon} size={16} color="#7C3AED" style={{ flexShrink: 0, marginTop: "2px" }} />
                      <div>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#4C1D95" }}>{title}</span>
                        <span style={{ fontSize: "12px", color: "#6B7280" }}> — {desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SIGNATURE — 사람의 결이 들어가는 1인 맞춤 보고서 */}
              <div style={{
                border: "2px solid #D4AF37",
                borderRadius: "20px",
                background: "linear-gradient(145deg, #0B1B2B 0%, #142B44 100%)",
                padding: "22px 22px 20px", position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: "14px", right: "14px",
                  background: "linear-gradient(135deg, #D4AF37, #F5D26B)",
                  borderRadius: "100px", padding: "3px 10px",
                  fontSize: "11px", fontWeight: 700, color: "#78350F",
                }}>{L.paid.signature.badge}</div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div>
                    <div style={{
                      display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: "100px",
                      padding: "3px 12px", fontSize: "11px", fontWeight: 700, color: "#D4AF37",
                      marginBottom: "6px",
                    }}>Signature</div>
                    <div style={{ fontSize: "20px", fontWeight: 900, color: "white", wordBreak: "keep-all" }}>{L.paid.signature.title}</div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#D4AF37", marginTop: "2px" }}>₩149,000
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#A5B4FC" }}>{L.paid.signature.priceUnit}</span>
                    </div>
                  </div>
                  <JobIcon name="pen-line" size={36} color="#D4AF37" />
                </div>

                <div style={{
                  background: "rgba(212,175,55,0.15)", borderRadius: "10px",
                  padding: "8px 12px", marginBottom: "14px",
                  fontSize: "13px", color: "#FDE68A", fontWeight: 600,
                  border: "1px solid rgba(212,175,55,0.3)",
                  display: "flex", alignItems: "center", gap: "6px",
                }}>
                  <JobIcon name="sparkles" size={14} color="#D4AF37" />{L.paid.signature.oneLiner}
                </div>

                <p style={{ fontSize: "13px", color: "#C7D2FE", lineHeight: 1.7, marginBottom: "14px" }}>
                  {L.paid.signature.paragraph}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {L.paid.signature.rows.map(({ icon, title, desc }) => (
                    <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <JobIcon name={icon} size={16} color="#D4AF37" style={{ flexShrink: 0, marginTop: "2px" }} />
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
                }}>{L.paid.edu.badge}</div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div>
                    <div style={{
                      display: "inline-block", background: "white", borderRadius: "100px",
                      padding: "3px 12px", fontSize: "11px", fontWeight: 700, color: "#059669",
                      border: "1px solid #6EE7B7", marginBottom: "6px",
                    }}>EDU</div>
                    <div style={{ fontSize: "22px", fontWeight: 900, color: "#064E3B" }}>₩1,000,000
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#059669" }}>{L.paid.edu.priceUnit}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>{L.paid.edu.priceSub}</div>
                  </div>
                  <JobIcon name="school" size={36} color="#059669" />
                </div>

                <div style={{
                  background: "rgba(5,150,105,0.1)", borderRadius: "10px",
                  padding: "8px 12px", marginBottom: "14px",
                  fontSize: "13px", color: "#064E3B", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: "6px",
                }}>
                  <JobIcon name="sparkles" size={14} color="#059669" />{L.paid.edu.oneLiner}
                </div>

                <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.7, marginBottom: "14px" }}>
                  {L.paid.edu.paragraph}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {L.paid.edu.rows.map(({ icon, title, desc }) => (
                    <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <JobIcon name={icon} size={16} color="#059669" style={{ flexShrink: 0, marginTop: "2px" }} />
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
              <div style={{ fontSize: "22px", marginBottom: "8px" }}></div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#1E1B4B", marginBottom: "6px" }}>
                {L.paid.ctaTitle}
              </div>
              <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px", lineHeight: 1.6 }}>
                {L.paid.ctaBody1}<br />
                <strong style={{ color: "#C9A24B" }}>{L.paid.ctaPre}{L.paid.ctaBold}</strong>
              </div>
              <a
                href={lang === "ko"
                  ? "mailto:futurebox69@gmail.com?subject=유료서비스 출시 알림 신청&body=안녕하세요, 내 직업의 미래 유료 서비스 출시 알림을 신청합니다."
                  : "mailto:futurebox69@gmail.com?subject=Future of My Job — Launch notification&body=Hello, I'd like to be notified when the paid service launches."}
                style={{
                  display: "inline-block",
                  padding: "13px 28px", borderRadius: "14px",
                  background: "linear-gradient(135deg, #C9A24B, #B8912A)",
                  color: "white", fontSize: "15px", fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                {L.paid.ctaButton}
              </a>
              <div style={{ marginTop: "12px", fontSize: "12px", color: "#9CA3AF" }}>
                {L.paid.ctaFine}
              </div>
            </div>

            {/* 무료 서비스로 이동 */}
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={() => setServiceMode("free")}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#C9A24B", fontSize: "14px", fontWeight: 600,
                  textDecoration: "underline",
                }}
              >
                {L.paid.backToFree}
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
              lang={lang}
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
                style={{ borderColor: "rgba(201,162,75,0.15)", borderTopColor: "#C9A24B" }}
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
              <p style={{ color: "#C9A24B", fontSize: "13px", fontWeight: 600 }}>
                {lang === "ko"
                  ? "역량 검사 완료! AI 분석 결과를 기다리는 중..."
                  : "Competency check done! Waiting for the AI analysis..."}
              </p>
            )}
            <div className="flex gap-1.5">
              {t.loading.map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                  style={{ background: i <= loadingStageIdx ? "#C9A24B" : "#E5E7EB" }}
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
              className="grid grid-cols-1 sm:grid-cols-3"
              style={{
                gap: "12px",
                maxWidth: "600px",
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              {[
                { num: "01", title: t.step1_title, desc: t.step1_desc },
                { num: "02", title: t.step2_title, desc: t.step2_desc },
                { num: "03", title: t.step3_title, desc: t.step3_desc },
              ].map(({ num, title, desc }) => (
                <div
                  key={num}
                  style={{
                    padding: "20px 24px",
                    background: "white",
                    borderRadius: "16px",
                    border: "1px solid #EDE9FE",
                    boxShadow: "0 2px 8px rgba(201,162,75,0.06)",
                  }}
                >
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
                    fontSize: "15px",
                    color: "#6B7280",
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
                  <span className="text-sm px-3 py-1 rounded-full" style={{ background: "#F5F4FF", color: "#C9A24B", border: "1px solid #EDE9FE" }}>
                    {t.remaining}: {remaining}
                  </span>
                )}
                {profile?.role === "admin" && result && (
                  <span className="text-sm px-3 py-1 rounded-full" style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0" }}>
                    {lang === "ko" ? "무제한" : "Unlimited"}
                  </span>
                )}
              </div>
            </div>

            {/* 요약 */}
            <div className="rounded-2xl p-5 border mb-6"
              style={{ background: "#FFFFFF", borderColor: "#EDE9FE", boxShadow: "0 1px 8px rgba(201,162,75,0.08)" }}>
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
                    background: activeSection === s.id ? "#C9A24B" : "#F5F4FF",
                    color: activeSection === s.id ? "white" : "#C9A24B",
                    border: `1.5px solid ${activeSection === s.id ? "#C9A24B" : "#EDE9FE"}`,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  <JobIcon name={s.icon} size={14} color={activeSection === s.id ? "white" : "#C9A24B"} /> {s.label}
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
                  boxShadow: "0 4px 24px rgba(201,162,75,0.13)",
                }}
              >
                {/* 헤더 — 그라디언트 */}
                <div style={{
                  background: "linear-gradient(135deg, #0B1B2B 0%, #142B44 100%)",
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
                            transition: "all 0.13s",
                          }}>
                            <JobIcon name={s.icon} size={16} color={isActive ? "white" : "#6B7280"} />
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
                      }}></span>
                      <span style={{
                        fontSize: "13px", fontWeight: 700, color: "#92400E",
                      }}>
                        {t.section_coach.replace("", "").replace("", "")}
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
                    lang={lang}
                  />
                ) : activeSection === "competency" && !competencyResult ? (
                  <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}></div>
                    <p style={{ color: "#1E1B4B", fontSize: "17px", fontWeight: 700, marginBottom: "8px" }}>
                      {lang === "ko" ? "역량 검사를 진행하지 않았습니다" : "You haven't taken the competency assessment"}
                    </p>
                    <p style={{ color: "#6B7280", fontSize: "14px", lineHeight: 1.6, marginBottom: "24px" }}>
                      {lang === "ko" ? (<>검사는 약 2~3분 소요되며,<br />AI 대체율과 교차 분석하여 맞춤 전략을 제공합니다.</>)
                        : (<>It takes about 2–3 minutes, and cross-analyzes with your AI risk to tailor a strategy.</>)}
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
                        background: "linear-gradient(135deg, #C9A24B, #8B5CF6)",
                        color: "#fff",
                        fontSize: "15px",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 8px 24px rgba(201,162,75,0.3)",
                      }}
                    >
                      {lang === "ko" ? "지금 검사하기" : "Take the assessment now"}
                    </button>
                  </div>
                ) : null}
                {activeSection === "overview"    && <GaugeChart rate={result.overallRate} riskLevel={result.riskLevel} jobName={result.jobName} lang={lang} />}
                {activeSection === "survival"    && result.survivalSkills && result.survivalSkills.length === 3 && (
                  <SurvivalSkills skills={result.survivalSkills} jobName={result.jobName} lang={lang} />
                )}
                {activeSection === "survival"    && (!result.survivalSkills || result.survivalSkills.length !== 3) && (
                  <div className="rounded-2xl border p-8 text-center" style={{ background: "#F8F7FF", borderColor: "#DDD6FE" }}>
                    <p className="text-4xl mb-3"></p>
                    <p className="font-bold text-lg mb-2" style={{ color: "#1E1B4B" }}>
                      {lang === "ko" ? "살아남는 스킬 3가지" : "3 Survival Skills"}
                    </p>
                    <p className="text-sm" style={{ color: "#9CA3AF" }}>
                      {lang === "ko"
                        ? "이 결과는 이전에 캐시된 데이터입니다. 다시 분석하면 생존 스킬이 표시됩니다."
                        : "This result is from cache. Re-analyze to see survival skills."}
                    </p>
                  </div>
                )}
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

                    {/* B1 — REFRAME 진단 유입 CTA */}
                    <a
                      href={`https://futurebox.live/${trackParam ? `?track=${trackParam}` : ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "18px 22px", borderRadius: "16px",
                        background: "linear-gradient(135deg, #0B1B2B 0%, #142B44 100%)",
                        border: "1px solid #C9A24B", textDecoration: "none",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <p style={{ fontSize: "15px", color: "#F2EBDC", fontWeight: 700, lineHeight: 1.4, margin: 0 }}>
                          {lang === "ko" ? "내 직무 구조를 더 깊이 보려면 → REFRAME" : "See your work's structure deeper → REFRAME"}
                        </p>
                      </div>
                      <div style={{
                        flexShrink: 0, width: "40px", height: "40px", borderRadius: "50%",
                        background: "#C9A24B", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "18px",
                      }}>
                        →
                      </div>
                    </a>
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
            padding: "5px 16px", fontSize: "13px", color: "#C9A24B", fontWeight: 600, marginBottom: "12px",
          }}>{L.pricing_header_tag}</div>
          <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1E1B4B", marginBottom: "8px" }}>
            {L.pricing_header_title}
          </h2>
          <p style={{ fontSize: "15px", color: "#6B7280", marginBottom: "6px" }}>
            {L.pricing_header_sub}
          </p>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "#C9A24B", wordBreak: "keep-all" }}>
            {L.pricing_ladder}
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
            // 정적 스타일(색·플래그)은 고정, 텍스트는 L.grid.plans에서 (순서 1:1)
            const gridStyle = [
              { tag: "FREE",      tagColor: "#C9A24B", tagBg: "#F0EEFF", dark: false, highlight: false, comingSoon: false, badge: undefined as string | undefined },
              { tag: "BASIC",     tagColor: "#0891B2", tagBg: "#ECFEFF", dark: false, highlight: false, comingSoon: true,  badge: undefined as string | undefined },
              { tag: "STANDARD",  tagColor: "#7C3AED", tagBg: "#F5F3FF", dark: false, highlight: true,  comingSoon: true,  badge: L.grid.badgeRecommended },
              { tag: "SIGNATURE", tagColor: "#D4AF37", tagBg: "#FFFBEB", dark: true,  highlight: false, comingSoon: true,  badge: L.grid.badgeHuman },
              { tag: "EDU",       tagColor: "#059669", tagBg: "#ECFDF5", dark: false, highlight: false, comingSoon: true,  badge: L.grid.badgeInstitution },
            ];
            const plans = gridStyle.map((s, i) => ({ ...s, ...L.grid.plans[i] }));

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
                      : "0 2px 12px rgba(201,162,75,0.06)",
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

                {/* 단계 이름을 가격보다 크게 (명세서 4-1) */}
                <div style={{
                  fontSize: "24px", fontWeight: 900,
                  color: plan.dark ? "white" : "#1E1B4B",
                  marginBottom: "4px", letterSpacing: "-0.01em", wordBreak: "keep-all",
                }}>
                  {plan.name}
                </div>
                <div style={{
                  fontSize: "16px", fontWeight: 700,
                  color: plan.dark ? "#D4AF37" : plan.tagColor,
                  marginBottom: "4px",
                }}>
                  {plan.price}
                  {plan.priceUnit && <span style={{ fontSize: "13px", fontWeight: 500, color: plan.dark ? "#A5B4FC" : "#9CA3AF" }}>{plan.priceUnit}</span>}
                </div>
                <div style={{ fontSize: "12px", color: plan.dark ? "#A5B4FC" : "#9CA3AF", marginBottom: "20px" }}>{plan.sub}</div>

                <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "16px", flex: 1 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: plan.dark ? "#C7D2FE" : "#374151", lineHeight: 1.4 }}>
                      <span style={{ color: plan.dark ? "#D4AF37" : plan.tagColor, fontWeight: 700, flexShrink: 0, marginTop: "1px" }}></span>
                      <span style={{ wordBreak: "keep-all" }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* 명시할 한계 — 산출물 안에 인쇄되는 문장 (명세서 3-1) */}
                <div style={{
                  borderRadius: "12px", padding: "10px 12px", marginBottom: "16px",
                  background: plan.dark ? "rgba(255,255,255,0.06)" : "rgba(11,27,43,0.04)",
                  border: `1px dashed ${plan.dark ? "rgba(255,255,255,0.2)" : "rgba(11,27,43,0.12)"}`,
                }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", color: plan.dark ? "rgba(255,255,255,0.45)" : "#9CA3AF", marginBottom: "4px" }}>
                    {L.grid.limitLabel}
                  </div>
                  <div style={{ fontSize: "12px", lineHeight: 1.6, color: plan.dark ? "#C7D2FE" : "#6B7280", wordBreak: "keep-all" }}>
                    &ldquo;{plan.limit}&rdquo;
                  </div>
                </div>

                {plan.comingSoon ? (
                  <div style={{
                    width: "100%", padding: "11px",
                    borderRadius: "12px", textAlign: "center",
                    background: plan.dark ? "rgba(255,255,255,0.08)" : "#F9FAFB",
                    color: plan.dark ? "rgba(255,255,255,0.35)" : "#9CA3AF",
                    fontSize: "13px", fontWeight: 600,
                  }}>{L.grid.comingSoon}</div>
                ) : (
                  <button
                    onClick={() => { setAuthReason(undefined); setShowAuthModal(true); }}
                    style={{
                      width: "100%", padding: "12px",
                      borderRadius: "12px", border: "2px solid #C9A24B",
                      background: "white", color: "#C9A24B",
                      fontSize: "14px", fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    {L.grid.startFree}
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
        <p style={{ marginBottom: "8px", lineHeight: 1.8, wordBreak: "keep-all", padding: "0 16px" }}>
          {L.reframe_prefix}
          {L.reframe_parts.map((p, i) => (
            <span key={p.n}>
              {i > 0 && " → "}
              {p.n} {p.app} <span style={{ color: "#C9A24B" }}>{p.q}</span>
            </span>
          ))}
        </p>
        {t.footer}
      </footer>
    </main>
  );
}
                