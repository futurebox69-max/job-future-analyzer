"use client";

// /v3 — 점진 심화 입력 (Progressive Deepening) 플로우. 한국어/영어.
// FABLE 5 재설계 명세서 §2: 묻기 전에 먼저 보여준다.
// 1단계 3문항 → 미니 결과 → (선택) 핵심 5문항 → 숫자가 움직인다 → P.17 자동 컴파일.
// 금지: 카운트다운, "지금 결제하면" 류의 압박 장치 전부 (§4-3).
// 언어는 URL ?lang= 로 받는다 (랜딩의 베타 링크가 현재 언어를 전달).

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AnalysisResult } from "@/types/analysis";
import {
  EMPTY_STEP2,
  type AgeRange,
  type RefineResult,
  type Region,
  type Step1Input,
  type Step2Input,
} from "@/lib/v3/types";
import { compileP17, permanentLimits } from "@/lib/v3/p17";
import { getV3, toV3Lang, type V3Lang } from "@/lib/v3/i18n";
import {
  loadBaseResult,
  loadRefined,
  loadStep1,
  loadStep2,
  saveBaseResult,
  saveRefined,
  saveStep1,
  saveStep2,
} from "@/lib/v3/state";

// ── 색 ──────────────────────────────────────────────
const NAVY = "#0B1B2B";
const CREAM = "#F2EBDC";
const GOLD = "#C9A24B";
const DIM = "rgba(255,255,255,0.55)";

type Phase =
  | "intro"
  | "q_job"
  | "q_age"
  | "q_region"
  | "analyzing"
  | "mini"
  | "d_work"
  | "d_years"
  | "d_satisfaction"
  | "d_direction"
  | "d_concern"
  | "refining"
  | "final";

interface State {
  jobName: string;
  ageRange: AgeRange | null;
  region: Region | null;
  step2: Step2Input;
}

// 보고서가 자라는 미리보기 — 진행바 대신 목차가 차오른다 (§4-2).
// 라벨은 i18n(V.toc_labels)에서, 잠금 해제 조건만 여기 둔다 (순서 1:1).
const TOC_PREDICATES: ((s: State) => boolean)[] = [
  (s) => !!s.jobName,
  (s) => !!s.jobName,
  (s) => !!s.ageRange,
  (s) => !!s.region,
  (s) => !!s.step2.workType,
  (s) => !!s.step2.years,
  (s) => !!s.step2.satisfaction,
  (s) => !!s.step2.direction,
  (s) => s.step2.concern.trim().length > 0,
  () => true,
];

function riskColor(rate: number): string {
  if (rate < 30) return "#4ADE80";
  if (rate < 55) return "#FACC15";
  if (rate < 75) return "#FB923C";
  return "#F87171";
}

function splitLines(summary: string, lang: V3Lang): string[] {
  const re = lang === "ko" ? /(?<=다\.)\s+/ : /(?<=[.!?])\s+/;
  return summary
    .split(re)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 3);
}

// 숫자가 움직이는 것을 보여준다 — 가장 강한 추가 입력 유도 (§2-2)
function AnimatedRate({ from, to }: { from: number; to: number }) {
  const [value, setValue] = useState(from);
  useEffect(() => {
    const start = performance.now();
    const duration = 1400;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to]);
  return (
    <span style={{ color: riskColor(value), fontVariantNumeric: "tabular-nums" }}>{value}%</span>
  );
}

export default function V3Flow() {
  const [lang, setLang] = useState<V3Lang>(() =>
    typeof window !== "undefined"
      ? toV3Lang(new URLSearchParams(window.location.search).get("lang"))
      : "ko"
  );
  const V = getV3(lang);

  const [phase, setPhase] = useState<Phase>("intro");
  const [jobName, setJobName] = useState("");
  const [ageRange, setAgeRange] = useState<AgeRange | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [step2, setStep2] = useState<Step2Input>(EMPTY_STEP2);
  const [base, setBase] = useState<AnalysisResult | null>(null);
  const [refined, setRefined] = useState<RefineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  // 언어 동기화 (URL ?lang=)
  useEffect(() => {
    setLang(toV3Lang(new URLSearchParams(window.location.search).get("lang")));
  }, []);

  // 세션 복원 — 새로고침해도 흐름이 죽지 않는다
  useEffect(() => {
    const s1 = loadStep1();
    const b = loadBaseResult();
    if (s1 && b) {
      setJobName(s1.jobName);
      setAgeRange(s1.ageRange);
      setRegion(s1.region);
      setBase(b);
      const s2 = loadStep2();
      if (s2) setStep2(s2);
      const r = loadRefined();
      if (r) {
        setRefined(r);
        setPhase("final");
      } else {
        setPhase("mini");
      }
    }
  }, []);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase]);

  const state: State = { jobName: base ? jobName : "", ageRange, region, step2 };

  // ── 1단계 완료 → 기존 분석 엔진 호출 ──
  const runBaseAnalysis = async (s1: Step1Input) => {
    setPhase("analyzing");
    setError(null);
    setLoadingMsg(V.loading_base);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job: s1.jobName,
          mode: s1.ageRange === "10대" ? "youth" : "adult",
          lang,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? V.err_analyze);
        setPhase("q_job");
        return;
      }

      const contentType = response.headers.get("Content-Type") ?? "";
      let result: AnalysisResult | null = null;

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
            try {
              const event = JSON.parse(part.slice(6));
              if (event.type === "progress" && event.message) setLoadingMsg(event.message);
              else if (event.type === "result" && event.success && event.data) result = event.data;
              else if (event.type === "error") {
                setError(event.error ?? V.err_failed);
              }
            } catch {
              /* 파싱 실패 무시 */
            }
          }
        }
      } else {
        const data = await response.json();
        if (data.success && data.data) result = data.data;
        else setError(data.error ?? V.err_failed);
      }

      if (result) {
        setBase(result);
        saveStep1(s1);
        saveBaseResult(result);
        setPhase("mini");
      } else if (!error) {
        setPhase("q_job");
      }
    } catch {
      setError(V.err_network);
      setPhase("q_job");
    }
  };

  // ── 2단계 완료 → 정밀화 ──
  const runRefine = async (finalStep2: Step2Input) => {
    if (!base || !ageRange || !region) return;
    saveStep2(finalStep2);
    const answered =
      finalStep2.workType || finalStep2.years || finalStep2.satisfaction ||
      finalStep2.direction || finalStep2.concern.trim();
    if (!answered) {
      // 전부 건너뛰면 정밀화 없이 종료 — 빈 칸은 그대로 P.17이 된다
      setPhase("final");
      return;
    }
    setPhase("refining");
    setError(null);
    try {
      const res = await fetch("/api/v3/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job: jobName,
          baseRate: base.overallRate,
          summary: base.summary,
          ageRange,
          region,
          step2: finalStep2,
          lang,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setRefined(data.data);
        saveRefined(data.data);
      } else {
        setError(data.error ?? V.err_failed);
      }
    } catch {
      setError(V.err_network);
    }
    setPhase("final");
  };

  // ── 공용 UI 조각 ──
  const optionBtn = (label: string, selected: boolean, onClick: () => void) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        width: "100%", textAlign: "left", padding: "16px 18px",
        borderRadius: "14px", cursor: "pointer",
        border: `1.5px solid ${selected ? GOLD : "rgba(255,255,255,0.15)"}`,
        background: selected ? "rgba(201,162,75,0.15)" : "rgba(255,255,255,0.04)",
        color: selected ? GOLD : CREAM, fontSize: "15px", fontWeight: selected ? 700 : 500,
        transition: "all 0.15s", marginBottom: "10px", wordBreak: "keep-all",
      }}
    >
      {label}
    </button>
  );

  const skipBtn = (onClick: () => void) => (
    <button
      onClick={onClick}
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: DIM, fontSize: "13px", textDecoration: "underline", marginTop: "8px",
      }}
    >
      {V.skip}
    </button>
  );

  const questionShell = (
    eyebrow: string,
    title: string,
    children: React.ReactNode,
  ) => (
    <div style={{ width: "100%", maxWidth: "560px" }}>
      <div style={{ fontSize: "12px", letterSpacing: "0.15em", color: DIM, marginBottom: "10px", textTransform: "uppercase" }}>
        {eyebrow}
      </div>
      <h2 style={{ fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 800, color: CREAM, lineHeight: 1.4, marginBottom: "24px", wordBreak: "keep-all" }}>
        {title}
      </h2>
      {children}
    </div>
  );

  // 보고서가 자라는 미리보기
  const growingToc = (
    <div style={{
      borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)",
      background: "rgba(255,255,255,0.03)", padding: "16px 18px", marginTop: "32px",
    }}>
      <div style={{ fontSize: "11px", letterSpacing: "0.12em", color: DIM, marginBottom: "10px", textTransform: "uppercase" }}>
        {V.toc_title}
      </div>
      {V.toc_labels.map((label, i) => {
        const on = TOC_PREDICATES[i](state);
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0" }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
              background: on ? GOLD : "rgba(255,255,255,0.15)",
            }} />
            <span style={{
              fontSize: "13px", color: on ? CREAM : "rgba(255,255,255,0.3)",
              fontWeight: on ? 600 : 400,
            }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );

  // P.17 박스
  const p17Box = (showFull: boolean) => {
    const entries = compileP17(showFull ? step2 : null, lang);
    return (
      <div style={{
        borderRadius: "16px", border: `1px solid rgba(201,162,75,0.35)`,
        background: "rgba(201,162,75,0.06)", padding: "20px 22px", textAlign: "left",
      }}>
        <div style={{ fontSize: "12px", letterSpacing: "0.12em", color: GOLD, fontWeight: 700, marginBottom: "12px" }}>
          {V.p17_title}
        </div>
        {entries.length > 0 && (
          <>
            <div style={{ fontSize: "13px", color: DIM, marginBottom: "8px" }}>
              {V.p17_not_received}
            </div>
            {entries.map((e) => (
              <div key={e.field} style={{ marginBottom: "10px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: CREAM }}>{e.field}</span>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, margin: "2px 0 0", wordBreak: "keep-all" }}>
                  {e.sentence}
                </p>
              </div>
            ))}
            <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "14px 0" }} />
          </>
        )}
        {permanentLimits(lang).map((l) => (
          <p key={l} style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "8px", wordBreak: "keep-all" }}>
            — {l}
          </p>
        ))}
        {entries.length > 0 && (
          <p style={{ fontSize: "13px", color: GOLD, lineHeight: 1.7, marginTop: "12px", marginBottom: 0, wordBreak: "keep-all" }}>
            {V.p17_reduce}
          </p>
        )}
      </div>
    );
  };

  // ── 화면 ──────────────────────────────────────────
  return (
    <main
      ref={topRef}
      className="min-h-screen flex flex-col items-center px-5 py-12"
      style={{ background: NAVY, color: CREAM }}
    >
      {error && phase !== "analyzing" && phase !== "refining" && (
        <div style={{
          width: "100%", maxWidth: "560px", marginBottom: "20px",
          borderRadius: "12px", border: "1px solid rgba(248,113,113,0.4)",
          background: "rgba(248,113,113,0.08)", padding: "12px 16px",
          fontSize: "14px", color: "#FCA5A5",
        }}>
          {error}
        </div>
      )}

      {/* ── 인트로 ── */}
      {phase === "intro" && (
        <div style={{ width: "100%", maxWidth: "560px", textAlign: "center", marginTop: "8vh" }}>
          <div style={{ fontSize: "12px", letterSpacing: "0.18em", color: DIM, textTransform: "uppercase", marginBottom: "16px" }}>
            {V.intro_eyebrow}
          </div>
          <h1 style={{ fontSize: "clamp(28px, 7vw, 44px)", fontWeight: 900, lineHeight: 1.3, marginBottom: "20px", wordBreak: "keep-all" }}>
            {V.intro_title_1}<br />
            <span style={{ color: GOLD }}>{V.intro_title_accent}</span>{V.intro_title_2}
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)", lineHeight: 1.9, marginBottom: "12px", wordBreak: "keep-all" }}>
            {V.intro_p1a}<br />
            {V.intro_p1b}
          </p>
          <p style={{ fontSize: "13px", color: DIM, lineHeight: 1.8, marginBottom: "36px", wordBreak: "keep-all" }}>
            {V.intro_p2a}<br />
            {V.intro_p2b}
          </p>
          <button
            onClick={() => setPhase("q_job")}
            style={{
              minHeight: 56, padding: "0 36px", borderRadius: "16px", border: "none",
              background: GOLD, color: NAVY, fontSize: "16px", fontWeight: 800, cursor: "pointer",
              boxShadow: "0 8px 32px rgba(201,162,75,0.35)",
            }}
          >
            {V.intro_start}
          </button>
          <div style={{ marginTop: "20px" }}>
            <Link href="/" style={{ color: DIM, fontSize: "13px", textDecoration: "underline" }}>
              {V.intro_back}
            </Link>
          </div>
        </div>
      )}

      {/* ── 1단계: 직업명 ── */}
      {phase === "q_job" && questionShell(V.step_of(1, 3), V.q_job_title, (
        <>
          <input
            autoFocus
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && jobName.trim()) setPhase("q_age"); }}
            placeholder={V.q_job_placeholder}
            style={{
              width: "100%", padding: "16px 18px", borderRadius: "14px",
              border: "1.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)",
              color: CREAM, fontSize: "16px", outline: "none",
            }}
          />
          <button
            disabled={!jobName.trim()}
            onClick={() => setPhase("q_age")}
            style={{
              marginTop: "16px", minHeight: 52, width: "100%", borderRadius: "14px", border: "none",
              background: jobName.trim() ? GOLD : "rgba(255,255,255,0.1)",
              color: jobName.trim() ? NAVY : DIM, fontSize: "15px", fontWeight: 700,
              cursor: jobName.trim() ? "pointer" : "default",
            }}
          >
            {V.q_next}
          </button>
          {growingToc}
        </>
      ))}

      {/* ── 1단계: 연령대 ── */}
      {phase === "q_age" && questionShell(V.step_of(2, 3), V.q_age_title, (
        <>
          {V.ageOptions.map((o) => optionBtn(o.label, ageRange === o.value, () => { setAgeRange(o.value as AgeRange); setPhase("q_region"); }))}
          {growingToc}
        </>
      ))}

      {/* ── 1단계: 지역 ── */}
      {phase === "q_region" && questionShell(V.step_of(3, 3), V.q_region_title, (
        <>
          {V.regionOptions.map((o) =>
            optionBtn(o.label, region === o.value, () => {
              const r = o.value as Region;
              setRegion(r);
              runBaseAnalysis({ jobName: jobName.trim(), ageRange: ageRange!, region: r });
            })
          )}
          {growingToc}
        </>
      ))}

      {/* ── 분석 중 ── */}
      {(phase === "analyzing" || phase === "refining") && (
        <div style={{ width: "100%", maxWidth: "560px", textAlign: "center", marginTop: "16vh" }}>
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div
              className="absolute inset-0 rounded-full border-4 animate-spin"
              style={{ borderColor: "rgba(201,162,75,0.15)", borderTopColor: GOLD }}
            />
          </div>
          <p style={{ fontSize: "15px", color: CREAM, fontWeight: 600, marginBottom: "8px" }}>
            {phase === "analyzing" ? (loadingMsg || V.analyzing_title) : V.refining_title}
          </p>
          <p style={{ fontSize: "13px", color: DIM }}>
            {phase === "analyzing" ? V.analyzing_sub : V.refining_sub}
          </p>
        </div>
      )}

      {/* ── 미니 결과 (§2-2의 심장) ── */}
      {phase === "mini" && base && (
        <div style={{ width: "100%", maxWidth: "560px", textAlign: "center" }}>
          <div style={{ fontSize: "12px", letterSpacing: "0.15em", color: DIM, textTransform: "uppercase", marginBottom: "20px" }}>
            {V.mini_eyebrow} · {base.jobName}
          </div>
          <div style={{ fontSize: "clamp(56px, 14vw, 84px)", fontWeight: 900, lineHeight: 1, color: riskColor(base.overallRate), marginBottom: "6px" }}>
            {base.overallRate}%
          </div>
          <div style={{ fontSize: "14px", color: DIM, marginBottom: "28px" }}>
            {V.mini_risk_label} · {base.riskLevel}
          </div>

          <div style={{
            borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)", padding: "20px 22px",
            textAlign: "left", marginBottom: "28px",
          }}>
            {splitLines(base.summary, lang).map((line, i) => (
              <p key={i} style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.8, marginBottom: "8px", wordBreak: "keep-all" }}>
                {line}
              </p>
            ))}
          </div>

          {/* 결과가 스스로 다음 질문을 한다 */}
          <div style={{ marginBottom: "32px" }}>
            <p style={{ fontSize: "clamp(17px, 4.5vw, 21px)", fontWeight: 800, color: CREAM, lineHeight: 1.7, wordBreak: "keep-all" }}>
              {V.mini_frame_1(base.jobName)}<br />
              <span style={{ color: GOLD }}>{V.mini_frame_2}</span>
            </p>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", marginTop: "10px", lineHeight: 1.8, wordBreak: "keep-all" }}>
              {V.mini_frame_sub}
            </p>
          </div>

          <button
            onClick={() => setPhase("d_work")}
            style={{
              minHeight: 56, width: "100%", borderRadius: "16px", border: "none",
              background: GOLD, color: NAVY, fontSize: "16px", fontWeight: 800, cursor: "pointer",
              boxShadow: "0 8px 32px rgba(201,162,75,0.35)", marginBottom: "12px",
            }}
          >
            {V.mini_more}
          </button>
          <button
            onClick={() => setPhase("final")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: DIM, fontSize: "14px", textDecoration: "underline",
            }}
          >
            {V.mini_stop}
          </button>
        </div>
      )}

      {/* ── 2단계: 핵심 5문항 ── */}
      {phase === "d_work" && questionShell(V.deepen_of(1, 5), V.d_work_title, (
        <>
          {V.workOptions.map((o) => optionBtn(o.label, step2.workType === o.value, () => { setStep2({ ...step2, workType: o.value as Step2Input["workType"] }); setPhase("d_years"); }))}
          {skipBtn(() => { setStep2({ ...step2, workType: null }); setPhase("d_years"); })}
          {growingToc}
        </>
      ))}

      {phase === "d_years" && questionShell(V.deepen_of(2, 5), V.d_years_title, (
        <>
          {V.yearsOptions.map((o) => optionBtn(o.label, step2.years === o.value, () => { setStep2({ ...step2, years: o.value as Step2Input["years"] }); setPhase("d_satisfaction"); }))}
          {skipBtn(() => { setStep2({ ...step2, years: null }); setPhase("d_satisfaction"); })}
          {growingToc}
        </>
      ))}

      {/* 만족도 — 불안 주입 방지 장치 (§2-3) */}
      {phase === "d_satisfaction" && questionShell(V.deepen_of(3, 5), V.d_sat_title, (
        <>
          <p style={{ fontSize: "13px", color: DIM, marginBottom: "16px", lineHeight: 1.7, wordBreak: "keep-all" }}>
            {V.d_sat_note}
          </p>
          {V.satOptions.map((o) => optionBtn(o.label, step2.satisfaction === o.value, () => { setStep2({ ...step2, satisfaction: o.value as Step2Input["satisfaction"] }); setPhase("d_direction"); }))}
          {skipBtn(() => { setStep2({ ...step2, satisfaction: null }); setPhase("d_direction"); })}
          {growingToc}
        </>
      ))}

      {phase === "d_direction" && questionShell(V.deepen_of(4, 5), V.d_dir_title, (
        <>
          {V.dirOptions.map((o) => optionBtn(o.label, step2.direction === o.value, () => { setStep2({ ...step2, direction: o.value as Step2Input["direction"] }); setPhase("d_concern"); }))}
          {skipBtn(() => { setStep2({ ...step2, direction: null }); setPhase("d_concern"); })}
          {growingToc}
        </>
      ))}

      {phase === "d_concern" && questionShell(V.deepen_of(5, 5), V.d_concern_title, (
        <>
          <textarea
            value={step2.concern}
            onChange={(e) => setStep2({ ...step2, concern: e.target.value })}
            rows={5}
            maxLength={1000}
            placeholder={V.concern_placeholder}
            style={{
              width: "100%", padding: "16px 18px", borderRadius: "14px",
              border: "1.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)",
              color: CREAM, fontSize: "15px", outline: "none", resize: "vertical", lineHeight: 1.7,
            }}
          />
          <button
            onClick={() => runRefine(step2)}
            style={{
              marginTop: "16px", minHeight: 56, width: "100%", borderRadius: "16px", border: "none",
              background: GOLD, color: NAVY, fontSize: "16px", fontWeight: 800, cursor: "pointer",
              boxShadow: "0 8px 32px rgba(201,162,75,0.35)",
            }}
          >
            {V.recalc}
          </button>
          {growingToc}
        </>
      ))}

      {/* ── 최종 결과 ── */}
      {phase === "final" && base && (
        <div style={{ width: "100%", maxWidth: "560px", textAlign: "center" }}>
          {/* 최상단: 점수가 아니라 한 문장 (§4-3) */}
          <p style={{
            fontSize: "clamp(19px, 5vw, 24px)", fontWeight: 800, color: CREAM,
            lineHeight: 1.7, marginBottom: "32px", wordBreak: "keep-all",
            fontFamily: "var(--font-gowun-batang), serif",
          }}>
            {refined ? refined.singleSentence : V.final_default_sentence(base.jobName)}
          </p>

          {/* 위험도 — 숫자가 움직이는 것을 보여준다 */}
          <div style={{ marginBottom: "8px" }}>
            {refined && refined.adjustedRate !== base.overallRate ? (
              <div>
                <div style={{ fontSize: "clamp(48px, 12vw, 72px)", fontWeight: 900, lineHeight: 1 }}>
                  <span style={{ color: DIM, textDecoration: "line-through", fontSize: "0.5em", marginRight: "12px" }}>
                    {base.overallRate}%
                  </span>
                  <AnimatedRate from={base.overallRate} to={refined.adjustedRate} />
                </div>
                <div style={{ fontSize: "13px", color: GOLD, marginTop: "10px", fontWeight: 600 }}>
                  {V.final_moved}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "clamp(48px, 12vw, 72px)", fontWeight: 900, lineHeight: 1, color: riskColor(refined?.adjustedRate ?? base.overallRate) }}>
                {refined?.adjustedRate ?? base.overallRate}%
              </div>
            )}
          </div>
          <div style={{ fontSize: "14px", color: DIM, marginBottom: "28px" }}>
            {refined ? V.final_adjusted_label : `${V.final_risk_label} · ${base.riskLevel}`}
          </div>

          {/* 숫자가 움직인 이유 */}
          {refined && refined.rateReasons.length > 0 && (
            <div style={{
              borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)", padding: "18px 22px",
              textAlign: "left", marginBottom: "16px",
            }}>
              <div style={{ fontSize: "12px", letterSpacing: "0.1em", color: DIM, marginBottom: "10px", textTransform: "uppercase" }}>
                {V.reasons_title}
              </div>
              {refined.rateReasons.map((r) => (
                <p key={r} style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.8, marginBottom: "6px", wordBreak: "keep-all" }}>
                  · {r}
                </p>
              ))}
            </div>
          )}

          {/* 당신에 대한 서술 */}
          {refined && (
            <div style={{
              borderRadius: "16px", border: `1px solid rgba(201,162,75,0.3)`,
              background: "rgba(201,162,75,0.07)", padding: "18px 22px",
              textAlign: "left", marginBottom: "16px",
            }}>
              <div style={{ fontSize: "12px", letterSpacing: "0.1em", color: GOLD, marginBottom: "10px", textTransform: "uppercase" }}>
                {V.personal_title}
              </div>
              {refined.personalNotes.map((n) => (
                <p key={n} style={{ fontSize: "14px", color: CREAM, lineHeight: 1.9, marginBottom: "10px", wordBreak: "keep-all" }}>
                  {n}
                </p>
              ))}
            </div>
          )}

          {/* 8눈 요약 */}
          <div style={{
            borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)", padding: "18px 22px",
            textAlign: "left", marginBottom: "16px",
          }}>
            <div style={{ fontSize: "12px", letterSpacing: "0.1em", color: DIM, marginBottom: "12px", textTransform: "uppercase" }}>
              {V.eyes_summary_title}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {Object.values(base.dimensions).map((d) => (
                <div key={d.label} style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>{d.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: riskColor(d.score) }}>{d.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* P.17 */}
          <div style={{ marginBottom: "28px" }}>{p17Box(true)}</div>

          {/* 다음 — 압박 장치 없이 */}
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: "20px", wordBreak: "keep-all" }}>
            {V.final_outro_1}<br />
            {V.final_outro_2}
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/"
              style={{
                minHeight: 48, padding: "14px 24px", borderRadius: "14px",
                border: `1.5px solid ${GOLD}`, color: GOLD, fontSize: "14px", fontWeight: 700,
                textDecoration: "none",
              }}
            >
              {V.final_full_report}
            </Link>
            <button
              onClick={() => {
                if (typeof window !== "undefined") sessionStorage.clear();
                window.location.href = lang === "ko" ? "/v3" : `/v3?lang=${lang}`;
              }}
              style={{
                minHeight: 48, padding: "14px 24px", borderRadius: "14px",
                border: "1.5px solid rgba(255,255,255,0.2)", background: "none",
                color: CREAM, fontSize: "14px", fontWeight: 600, cursor: "pointer",
              }}
            >
              {V.final_another}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
