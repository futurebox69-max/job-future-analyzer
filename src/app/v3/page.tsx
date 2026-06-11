"use client";

// /v3 — 점진 심화 입력 (Progressive Deepening) 플로우.
// FABLE 5 재설계 명세서 §2: 묻기 전에 먼저 보여준다.
// 1단계 3문항 → 미니 결과 → (선택) 핵심 5문항 → 숫자가 움직인다 → P.17 자동 컴파일.
// 금지: 카운트다운, "지금 결제하면" 류의 압박 장치 전부 (§4-3).

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AnalysisResult } from "@/types/analysis";
import {
  AGE_RANGES,
  DIRECTION_OPTIONS,
  EMPTY_STEP2,
  REGIONS,
  SATISFACTION_OPTIONS,
  WORK_TYPES,
  YEARS_OPTIONS,
  type AgeRange,
  type RefineResult,
  type Region,
  type Step1Input,
  type Step2Input,
} from "@/lib/v3/types";
import { compileP17, PERMANENT_LIMITS } from "@/lib/v3/p17";
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

// 보고서가 자라는 미리보기 — 진행바 대신 목차가 차오른다 (§4-2)
const TOC_ITEMS: { label: string; unlockedBy: (s: State) => boolean }[] = [
  { label: "종합 위험도", unlockedBy: (s) => !!s.jobName },
  { label: "직업 일반론 — 평균의 이야기", unlockedBy: (s) => !!s.jobName },
  { label: "연령대 맥락", unlockedBy: (s) => !!s.ageRange },
  { label: "지역 노동시장 맥락", unlockedBy: (s) => !!s.region },
  { label: "근무 형태가 바꾸는 숫자", unlockedBy: (s) => !!s.step2.workType },
  { label: "경력 단계별 준비", unlockedBy: (s) => !!s.step2.years },
  { label: "머무름 / 떠남의 결", unlockedBy: (s) => !!s.step2.satisfaction },
  { label: "방향에 맞춘 다음 걸음", unlockedBy: (s) => !!s.step2.direction },
  { label: "당신의 고민에 대한 답", unlockedBy: (s) => s.step2.concern.trim().length > 0 },
  { label: "P.17 — 이 보고서가 모르는 것", unlockedBy: () => true },
];

interface State {
  jobName: string;
  ageRange: AgeRange | null;
  region: Region | null;
  step2: Step2Input;
}

function riskColor(rate: number): string {
  if (rate < 30) return "#4ADE80";
  if (rate < 55) return "#FACC15";
  if (rate < 75) return "#FB923C";
  return "#F87171";
}

function splitLines(summary: string): string[] {
  return summary
    .split(/(?<=다\.)\s+/)
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
    setLoadingMsg("직업의 평균을 먼저 살펴봅니다...");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job: s1.jobName,
          mode: s1.ageRange === "10대" ? "youth" : "adult",
          lang: "ko",
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "분석에 실패했습니다. 다시 시도해주세요.");
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
                setError(event.error ?? "분석에 실패했습니다.");
              }
            } catch {
              /* 파싱 실패 무시 */
            }
          }
        }
      } else {
        const data = await response.json();
        if (data.success && data.data) result = data.data;
        else setError(data.error ?? "분석에 실패했습니다.");
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
      setError("네트워크 오류가 발생했습니다.");
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
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setRefined(data.data);
        saveRefined(data.data);
      } else {
        setError(data.error ?? "정밀화에 실패했습니다. 일반 분석 결과를 보여드립니다.");
      }
    } catch {
      setError("네트워크 오류로 정밀화하지 못했습니다. 일반 분석 결과를 보여드립니다.");
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
      이 질문은 건너뛰기 — 보고서가 그 사실을 정직하게 적습니다
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
        지금까지 자란 보고서
      </div>
      {TOC_ITEMS.map(({ label, unlockedBy }) => {
        const on = unlockedBy(state);
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
    const entries = compileP17(showFull ? step2 : null);
    return (
      <div style={{
        borderRadius: "16px", border: `1px solid rgba(201,162,75,0.35)`,
        background: "rgba(201,162,75,0.06)", padding: "20px 22px", textAlign: "left",
      }}>
        <div style={{ fontSize: "12px", letterSpacing: "0.12em", color: GOLD, fontWeight: 700, marginBottom: "12px" }}>
          P.17 — 이 보고서가 모르는 것
        </div>
        {entries.length > 0 && (
          <>
            <div style={{ fontSize: "13px", color: DIM, marginBottom: "8px" }}>
              본 보고서가 받지 못한 입력값:
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
        {PERMANENT_LIMITS.map((l) => (
          <p key={l} style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "8px", wordBreak: "keep-all" }}>
            — {l}
          </p>
        ))}
        {entries.length > 0 && (
          <p style={{ fontSize: "13px", color: GOLD, lineHeight: 1.7, marginTop: "12px", marginBottom: 0, wordBreak: "keep-all" }}>
            이 목록을 줄이는 방법은 하나뿐입니다 — 입력을 채우시면, 한계 문장이 분석 문장으로 바뀝니다.
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
            내 직업의 미래 · 점진 심화 분석
          </div>
          <h1 style={{ fontSize: "clamp(28px, 7vw, 44px)", fontWeight: 900, lineHeight: 1.3, marginBottom: "20px", wordBreak: "keep-all" }}>
            세 가지만 알려주세요.<br />
            <span style={{ color: GOLD }}>30초</span>면 됩니다.
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)", lineHeight: 1.9, marginBottom: "12px", wordBreak: "keep-all" }}>
            먼저 직업의 평균을 보여드립니다.<br />
            그 다음은 — 보여드린 결과가 스스로 다음 질문을 할 겁니다.
          </p>
          <p style={{ fontSize: "13px", color: DIM, lineHeight: 1.8, marginBottom: "36px", wordBreak: "keep-all" }}>
            모든 추가 질문은 건너뛸 수 있습니다.<br />
            다만 보고서가 빈 자리를 정직하게 적습니다.
          </p>
          <button
            onClick={() => setPhase("q_job")}
            style={{
              minHeight: 56, padding: "0 36px", borderRadius: "16px", border: "none",
              background: GOLD, color: NAVY, fontSize: "16px", fontWeight: 800, cursor: "pointer",
              boxShadow: "0 8px 32px rgba(201,162,75,0.35)",
            }}
          >
            시작하기 →
          </button>
          <div style={{ marginTop: "20px" }}>
            <Link href="/" style={{ color: DIM, fontSize: "13px", textDecoration: "underline" }}>
              기존 분석으로 돌아가기
            </Link>
          </div>
        </div>
      )}

      {/* ── 1단계: 직업명 ── */}
      {phase === "q_job" && questionShell("1 / 3", "어떤 일을 하고 계신가요?", (
        <>
          <input
            autoFocus
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && jobName.trim()) setPhase("q_age"); }}
            placeholder="직업명 (예: 간호사, 영어강사, 의료기기 제조 기술자)"
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
            다음
          </button>
          {growingToc}
        </>
      ))}

      {/* ── 1단계: 연령대 ── */}
      {phase === "q_age" && questionShell("2 / 3", "연령대를 알려주세요.", (
        <>
          {AGE_RANGES.map((a) => optionBtn(a, ageRange === a, () => { setAgeRange(a); setPhase("q_region"); }))}
          {growingToc}
        </>
      ))}

      {/* ── 1단계: 지역 ── */}
      {phase === "q_region" && questionShell("3 / 3", "주로 어디에서 일하시나요?", (
        <>
          {REGIONS.map((r) =>
            optionBtn(r, region === r, () => {
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
            {phase === "analyzing" ? (loadingMsg || "분석 중...") : "입력하신 내용으로 숫자를 다시 계산하고 있습니다..."}
          </p>
          <p style={{ fontSize: "13px", color: DIM }}>
            {phase === "analyzing" ? "처음 분석은 30~90초 걸립니다 · 같은 직업은 즉시" : "잠시만요 — 일반론이 당신의 이야기로 바뀌는 중입니다"}
          </p>
        </div>
      )}

      {/* ── 미니 결과 (§2-2의 심장) ── */}
      {phase === "mini" && base && (
        <div style={{ width: "100%", maxWidth: "560px", textAlign: "center" }}>
          <div style={{ fontSize: "12px", letterSpacing: "0.15em", color: DIM, textTransform: "uppercase", marginBottom: "20px" }}>
            미니 결과 · {base.jobName}
          </div>
          <div style={{ fontSize: "clamp(56px, 14vw, 84px)", fontWeight: 900, lineHeight: 1, color: riskColor(base.overallRate), marginBottom: "6px" }}>
            {base.overallRate}%
          </div>
          <div style={{ fontSize: "14px", color: DIM, marginBottom: "28px" }}>
            종합 위험도 · {base.riskLevel}
          </div>

          <div style={{
            borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)", padding: "20px 22px",
            textAlign: "left", marginBottom: "28px",
          }}>
            {splitLines(base.summary).map((line, i) => (
              <p key={i} style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.8, marginBottom: "8px", wordBreak: "keep-all" }}>
                {line}
              </p>
            ))}
          </div>

          {/* 결과가 스스로 다음 질문을 한다 */}
          <div style={{ marginBottom: "32px" }}>
            <p style={{ fontSize: "clamp(17px, 4.5vw, 21px)", fontWeight: 800, color: CREAM, lineHeight: 1.7, wordBreak: "keep-all" }}>
              여기까지는 &lsquo;{base.jobName}&rsquo;의 미래입니다.<br />
              <span style={{ color: GOLD }}>&lsquo;당신&rsquo;의 미래는 아직 아닙니다.</span>
            </p>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", marginTop: "10px", lineHeight: 1.8, wordBreak: "keep-all" }}>
              근무 형태를 알려주시면 — 이 숫자가 달라집니다.
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
            더 알려주기 (5문항, 1분)
          </button>
          <button
            onClick={() => setPhase("final")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: DIM, fontSize: "14px", textDecoration: "underline",
            }}
          >
            여기까지만 볼게요
          </button>
        </div>
      )}

      {/* ── 2단계: 핵심 5문항 ── */}
      {phase === "d_work" && questionShell("심화 1 / 5", "어떤 형태로 일하고 계신가요?", (
        <>
          {WORK_TYPES.map((w) => optionBtn(w, step2.workType === w, () => { setStep2({ ...step2, workType: w }); setPhase("d_years"); }))}
          {skipBtn(() => { setStep2({ ...step2, workType: null }); setPhase("d_years"); })}
          {growingToc}
        </>
      ))}

      {phase === "d_years" && questionShell("심화 2 / 5", "이 일을 하신 지 얼마나 되셨나요?", (
        <>
          {YEARS_OPTIONS.map((y) => optionBtn(y, step2.years === y, () => { setStep2({ ...step2, years: y }); setPhase("d_satisfaction"); }))}
          {skipBtn(() => { setStep2({ ...step2, years: null }); setPhase("d_satisfaction"); })}
          {growingToc}
        </>
      ))}

      {/* 만족도 — 불안 주입 방지 장치 (§2-3) */}
      {phase === "d_satisfaction" && questionShell("심화 3 / 5", "지금 일에 얼마나 만족하십니까?", (
        <>
          <p style={{ fontSize: "13px", color: DIM, marginBottom: "16px", lineHeight: 1.7, wordBreak: "keep-all" }}>
            이 답은 보고서의 방향을 바꿉니다. 만족하며 일하고 계시다면 — 떠날 이유가 아니라 머무름을 단단하게 만드는 쪽으로 씁니다.
          </p>
          {SATISFACTION_OPTIONS.map((o) => optionBtn(o, step2.satisfaction === o, () => { setStep2({ ...step2, satisfaction: o }); setPhase("d_direction"); }))}
          {skipBtn(() => { setStep2({ ...step2, satisfaction: null }); setPhase("d_direction"); })}
          {growingToc}
        </>
      ))}

      {phase === "d_direction" && questionShell("심화 4 / 5", "지금 어느 쪽을 바라보고 계신가요?", (
        <>
          {DIRECTION_OPTIONS.map((d) => optionBtn(d, step2.direction === d, () => { setStep2({ ...step2, direction: d }); setPhase("d_concern"); }))}
          {skipBtn(() => { setStep2({ ...step2, direction: null }); setPhase("d_concern"); })}
          {growingToc}
        </>
      ))}

      {phase === "d_concern" && questionShell("심화 5 / 5", "요즘 일과 관련해 가장 큰 고민이 무엇인가요?", (
        <>
          <textarea
            value={step2.concern}
            onChange={(e) => setStep2({ ...step2, concern: e.target.value })}
            rows={5}
            maxLength={1000}
            placeholder="쓰신 만큼 깊어집니다. 안 쓰셔도 됩니다 — 다만 보고서가 그 사실을 정직하게 적습니다."
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
            내 숫자 다시 계산하기 →
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
            {refined
              ? refined.singleSentence
              : `${base.jobName}의 평균은 보았습니다. 당신의 이야기는 아직 시작 전입니다.`}
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
                  입력하신 내용이 숫자를 움직였습니다
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "clamp(48px, 12vw, 72px)", fontWeight: 900, lineHeight: 1, color: riskColor(refined?.adjustedRate ?? base.overallRate) }}>
                {refined?.adjustedRate ?? base.overallRate}%
              </div>
            )}
          </div>
          <div style={{ fontSize: "14px", color: DIM, marginBottom: "28px" }}>
            {refined ? "당신의 조정 위험도" : `종합 위험도 · ${base.riskLevel}`}
          </div>

          {/* 숫자가 움직인 이유 */}
          {refined && refined.rateReasons.length > 0 && (
            <div style={{
              borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)", padding: "18px 22px",
              textAlign: "left", marginBottom: "16px",
            }}>
              <div style={{ fontSize: "12px", letterSpacing: "0.1em", color: DIM, marginBottom: "10px", textTransform: "uppercase" }}>
                숫자가 움직인 이유
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
                직업이 아니라, 당신에 대하여
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
              여덟 개의 눈 요약
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
            여기까지가 무료 분석이 볼 수 있는 자리입니다.<br />
            더 깊은 보고서가 필요해지면 — 그때 오시면 됩니다.
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
              전체 보고서 보러 가기
            </Link>
            <button
              onClick={() => {
                if (typeof window !== "undefined") sessionStorage.clear();
                window.location.href = "/v3";
              }}
              style={{
                minHeight: 48, padding: "14px 24px", borderRadius: "14px",
                border: "1.5px solid rgba(255,255,255,0.2)", background: "none",
                color: CREAM, fontSize: "14px", fontWeight: 600, cursor: "pointer",
              }}
            >
              다른 직업 분석하기
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
