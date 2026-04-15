"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  CompetencyKey,
  CompetencyScores,
  CompetencyResult,
  QuestionType,
  Scenario,
  BehaviorData,
  ARCHETYPES,
} from "@/types/competency";
import { buildScenarios, questionTypeMap, calcRankScores } from "@/lib/competency-scenarios";

interface CompetencyAssessmentProps {
  mode: "adult" | "youth";
  onComplete: (result: CompetencyResult) => void;
  onSkip?: () => void;
}

type Phase = "qtype" | "game";

const EMPTY_SCORES: CompetencyScores = {
  structural: 0, creative: 0, emotional: 0,
  adaptive: 0, ethical: 0, collab: 0,
};

const QTYPE_OPTIONS: {
  type: QuestionType; icon: string; title: string; desc: string; meta: string;
}[] = [
  { type: "scenario", icon: "📖", title: "시나리오형",     desc: "현실적인 상황이 주어지고, 어떻게 행동할지 선택합니다", meta: "논리적 · 현실 지향" },
  { type: "game",     icon: "🎮", title: "게임 비유형",    desc: "롤, 포트나이트, 마크 등 게임 상황으로 질문합니다",   meta: "은유적 · 게임 친화" },
  { type: "image",    icon: "🖼️", title: "이미지 선택형",  desc: "두 가지 상징 중 끌리는 것을 고릅니다",               meta: "직관적 · 감각형" },
  { type: "rank",     icon: "📊", title: "순위 매기기형",   desc: "가치와 행동에 우선순위를 매깁니다",                   meta: "분석적 · 체계형" },
];

export default function CompetencyAssessment({
  mode,
  onComplete,
  onSkip,
}: CompetencyAssessmentProps) {
  const [phase, setPhase] = useState<Phase>("qtype");
  const [selectedQType, setSelectedQType] = useState<QuestionType | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [round, setRound] = useState(0);
  const [scores, setScores] = useState<CompetencyScores>({ ...EMPTY_SCORES });
  const [behaviorData, setBehaviorData] = useState<BehaviorData[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [rankItems, setRankItems] = useState<string[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const roundStartRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scenariosRef = useRef<Scenario[]>([]);
  const scoresRef = useRef<CompetencyScores>({ ...EMPTY_SCORES });
  const behaviorRef = useRef<BehaviorData[]>([]);
  const roundRef = useRef(0);
  const rankItemsRef = useRef<string[]>([]);
  const selectedQTypeRef = useRef<QuestionType | null>(null);

  // keep refs in sync
  useEffect(() => { scoresRef.current = scores; }, [scores]);
  useEffect(() => { behaviorRef.current = behaviorData; }, [behaviorData]);
  useEffect(() => { rankItemsRef.current = rankItems; }, [rankItems]);
  useEffect(() => { scenariosRef.current = scenarios; }, [scenarios]);
  useEffect(() => { roundRef.current = round; }, [round]);
  useEffect(() => { selectedQTypeRef.current = selectedQType; }, [selectedQType]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const showFeedback = useCallback((text: string) => {
    setFeedbackText(text);
    setFeedbackVisible(true);
    setTimeout(() => setFeedbackVisible(false), 900);
  }, []);

  const finishGame = useCallback((finalScores: CompetencyScores, finalBehavior: BehaviorData[]) => {
    const max = Math.max(...Object.values(finalScores)) || 1;
    const topKey = (Object.entries(finalScores) as [CompetencyKey, number][])
      .sort((a, b) => b[1] - a[1])[0][0];
    const arch = ARCHETYPES[topKey];
    const avgTime = finalBehavior.length > 0
      ? finalBehavior.reduce((s, d) => s + d.time, 0) / finalBehavior.length
      : 5000;
    const fastRounds = finalBehavior.filter((d) => d.time < 5000).length;
    const qtype = selectedQTypeRef.current ?? "scenario";

    onComplete({
      scores: finalScores,
      topKey,
      archetype: arch.title,
      archetypeEmoji: arch.emoji,
      archetypeSubtitle: arch.subtitle,
      metaAnalysis: {
        questionType: qtype,
        questionTypeMeaning: questionTypeMap[qtype],
        avgResponseTime: avgTime / 1000,
        responseStyle:
          fastRounds > finalBehavior.length / 2
            ? "빠른 직관형 의사결정자"
            : "신중하게 고민하는 숙고형",
      },
      behaviorData: finalBehavior,
    });
    // suppress unused var warning
    void max;
  }, [onComplete]);

  const advanceRound = useCallback((
    nextRound: number,
    currentScenarios: Scenario[],
    finalScores: CompetencyScores,
    finalBehavior: BehaviorData[]
  ) => {
    if (nextRound >= currentScenarios.length) {
      finishGame(finalScores, finalBehavior);
      return;
    }
    setRound(nextRound);
    setSelectedIdx(null);
    setTimeLeft(60);
    roundStartRef.current = Date.now();
    const nextS = currentScenarios[nextRound];
    if (nextS?.type === "rank" && nextS.items) {
      const shuffled = [...nextS.items].sort(() => Math.random() - 0.5);
      setRankItems(shuffled);
    }
  }, [finishGame]);

  // 타이머
  useEffect(() => {
    if (phase !== "game") return;
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          // 시간 초과 자동 처리
          const s = scenariosRef.current[roundRef.current];
          if (!s) return 0;
          const curScores = scoresRef.current;
          const curBehavior = behaviorRef.current;
          const elapsed = Date.now() - roundStartRef.current;

          // 시간 초과: 점수 없이 건너뜀 (랜덤 선택 안 함)
          const newBehavior = [...curBehavior, { round: roundRef.current, type: s.type || "scenario", time: elapsed, skipped: true }];
          setBehaviorData(newBehavior);
          showFeedback("⏰ 시간 초과 — 다음 문제로 넘어갑니다");
          setTimeout(() => advanceRound(roundRef.current + 1, scenariosRef.current, curScores, newBehavior), 1500);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return clearTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round]);

  function startGame(qtype: QuestionType) {
    const built = buildScenarios(mode, qtype);
    setScenarios(built);
    scenariosRef.current = built;
    setSelectedQType(qtype);
    selectedQTypeRef.current = qtype;
    setRound(0);
    roundRef.current = 0;
    const fresh = { ...EMPTY_SCORES };
    setScores(fresh);
    scoresRef.current = fresh;
    setBehaviorData([]);
    behaviorRef.current = [];
    setTimeLeft(60);
    setSelectedIdx(null);
    if (built[0]?.type === "rank" && built[0].items) {
      const shuffled = [...built[0].items].sort(() => Math.random() - 0.5);
      setRankItems(shuffled);
      rankItemsRef.current = shuffled;
    }
    roundStartRef.current = Date.now();
    setPhase("game");
  }

  function handleChoiceSelect(idx: number) {
    if (selectedIdx !== null) return;
    clearTimer();
    setSelectedIdx(idx);
    const s = scenariosRef.current[roundRef.current];
    const choice = s.choices![idx];
    const elapsed = Date.now() - roundStartRef.current;
    const newScores = { ...scoresRef.current };
    (Object.entries(choice.skills) as [CompetencyKey, number][]).forEach(([k, v]) => {
      newScores[k] = (newScores[k] || 0) + v;
    });
    const newBehavior = [...behaviorRef.current, { round: roundRef.current, type: s.type, choiceIdx: idx, time: elapsed }];
    setScores(newScores);
    setBehaviorData(newBehavior);
    if (choice.fb) showFeedback(choice.fb);
    setTimeout(() => advanceRound(roundRef.current + 1, scenariosRef.current, newScores, newBehavior), 1100);
  }

  function handleRankSubmit() {
    clearTimer();
    const s = scenariosRef.current[roundRef.current];
    const items = rankItemsRef.current;
    const partial = calcRankScores(items, s);
    const newScores = { ...scoresRef.current };
    (Object.entries(partial) as [CompetencyKey, number][]).forEach(([k, v]) => {
      newScores[k] = (newScores[k] || 0) + v;
    });
    const elapsed = Date.now() - roundStartRef.current;
    const newBehavior = [...behaviorRef.current, { round: roundRef.current, type: "rank", time: elapsed, order: items }];
    setScores(newScores);
    setBehaviorData(newBehavior);
    showFeedback("순위 기록 완료!");
    setTimeout(() => advanceRound(roundRef.current + 1, scenariosRef.current, newScores, newBehavior), 1100);
  }

  // 드래그 앤 드롭 (데스크톱)
  function handleDragStart(idx: number) { setDragIdx(idx); }
  function handleDragEnter(idx: number) { setDragOver(idx); }
  function handleDragEnd() {
    if (dragIdx === null || dragOver === null || dragIdx === dragOver) {
      setDragIdx(null); setDragOver(null); return;
    }
    const next = [...rankItems];
    const [removed] = next.splice(dragIdx, 1);
    next.splice(dragOver, 0, removed);
    setRankItems(next);
    rankItemsRef.current = next;
    setDragIdx(null); setDragOver(null);
  }

  // 터치 드래그 (모바일)
  const touchDragIdxRef = useRef<number | null>(null);
  function handleTouchStart(idx: number) { touchDragIdxRef.current = idx; }
  function handleTouchMove(e: React.TouchEvent) {
    e.preventDefault();
    if (touchDragIdxRef.current === null) return;
    const y = e.touches[0].clientY;
    const elements = document.querySelectorAll("[data-rank-item]");
    let overIdx: number | null = null;
    elements.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      if (y >= rect.top && y <= rect.bottom) overIdx = i;
    });
    if (overIdx !== null && overIdx !== touchDragIdxRef.current) {
      const next = [...rankItemsRef.current];
      const [removed] = next.splice(touchDragIdxRef.current, 1);
      next.splice(overIdx, 0, removed);
      setRankItems(next);
      rankItemsRef.current = next;
      touchDragIdxRef.current = overIdx;
    }
  }
  function handleTouchEnd() { touchDragIdxRef.current = null; }

  // ── 질문유형 선택 화면 ──
  if (phase === "qtype") {
    return (
      <div style={{ padding: "24px 16px", maxWidth: "480px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", color: "#6C63FF", fontWeight: 700, marginBottom: "6px", letterSpacing: "0.06em" }}>
            AI 분석 중 · 잠깐!
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1E1B4B", marginBottom: "8px" }}>
            🧠 미래역량 검사
          </h2>
          <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.6 }}>
            AI 분석이 완료되는 동안(12~20초)<br />
            당신의 미래역량을 먼저 파악해드립니다.
          </p>
        </div>

        <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600, marginBottom: "10px", letterSpacing: "0.04em" }}>
          질문 스타일을 선택하세요 · 선택 자체가 당신의 사고방식을 드러냅니다
        </p>

        {QTYPE_OPTIONS.map((opt) => (
          <button
            key={opt.type}
            onClick={() => startGame(opt.type)}
            style={{
              display: "flex", alignItems: "center", gap: "14px",
              width: "100%", marginBottom: "10px",
              padding: "16px 18px", borderRadius: "16px",
              background: "white", border: "1.5px solid #EDE9FE",
              cursor: "pointer", textAlign: "left",
              boxShadow: "0 2px 8px rgba(108,99,255,0.06)",
              transition: "all 0.2s",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#6C63FF";
              e.currentTarget.style.transform = "translateX(4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#EDE9FE";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <span style={{
              fontSize: "28px", width: "44px", height: "44px", borderRadius: "12px",
              background: "#F5F4FF", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>{opt.icon}</span>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#1E1B4B", marginBottom: "2px" }}>{opt.title}</div>
              <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.4 }}>{opt.desc}</div>
              <span style={{
                display: "inline-block", marginTop: "4px",
                fontSize: "11px", color: "#6C63FF", fontWeight: 600,
                background: "#F0EEFF", borderRadius: "4px", padding: "2px 8px",
              }}>{opt.meta}</span>
            </div>
          </button>
        ))}

        {onSkip && (
          <button
            onClick={onSkip}
            style={{
              width: "100%", padding: "12px", borderRadius: "12px", marginTop: "4px",
              background: "none", border: "1.5px solid #EDE9FE",
              color: "#9CA3AF", fontSize: "14px", cursor: "pointer",
              touchAction: "manipulation",
            }}
          >
            건너뛰기
          </button>
        )}
      </div>
    );
  }

  // ── 검사 진행 화면 ──
  const s = scenarios[round];
  if (!s) return null;
  const progress = (round / scenarios.length) * 100;

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto" }}>
      {/* 피드백 플래시 */}
      {feedbackVisible && (
        <div style={{
          position: "fixed", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 200, pointerEvents: "none",
        }}>
          <div style={{
            background: "white", border: "2px solid #6C63FF",
            borderRadius: "20px", padding: "20px 28px", textAlign: "center",
            boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
          }}>
            <div style={{ fontSize: "36px", marginBottom: "6px" }}>✨</div>
            <div style={{ fontSize: "15px", color: "#1E1B4B", fontWeight: 600 }}>{feedbackText}</div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div style={{
        padding: "14px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "white", borderRadius: "16px 16px 0 0",
        borderBottom: "1px solid #EDE9FE", marginBottom: "16px",
        boxShadow: "0 2px 8px rgba(108,99,255,0.06)",
      }}>
        <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>{round + 1}/{scenarios.length}</span>
        <div style={{ flex: 1, margin: "0 14px", height: "6px", background: "#EDE9FE", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: "3px",
            background: "linear-gradient(90deg, #6C63FF, #4ECDC4)",
            width: `${progress}%`, transition: "width 0.5s",
          }} />
        </div>
        <span style={{
          fontSize: "20px", fontWeight: 700, minWidth: "36px", textAlign: "right",
          color: timeLeft <= 10 ? "#EF4444" : "#6C63FF",
          fontVariantNumeric: "tabular-nums",
        }}>{timeLeft}</span>
      </div>

      {/* 문제 카드 */}
      <div style={{
        background: "white", borderRadius: "20px", padding: "22px",
        marginBottom: "14px", boxShadow: "0 4px 24px rgba(108,99,255,0.06)",
        borderTop: "3px solid #6C63FF",
      }}>
        {s.context && (
          <div style={{ fontSize: "11px", color: "#4ECDC4", fontWeight: 700, letterSpacing: "1.5px", marginBottom: "8px", textTransform: "uppercase" }}>
            ⚡ {s.context}
          </div>
        )}
        {s.emoji && <span style={{ fontSize: "36px", display: "block", marginBottom: "10px" }}>{s.emoji}</span>}
        <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#1E1B4B", fontWeight: 500 }}>{s.text}</p>
      </div>

      {/* 선택지 */}
      <div style={{ padding: "0 4px" }}>
        {/* 이미지형 */}
        {s.type === "image" && s.choices && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {s.choices.map((c, i) => (
              <button
                key={i}
                onClick={() => handleChoiceSelect(i)}
                disabled={selectedIdx !== null}
                style={{
                  padding: "18px 12px", borderRadius: "16px", textAlign: "center",
                  background: selectedIdx === i ? "#EEF2FF" : "white",
                  border: `1.5px solid ${selectedIdx === i ? "#6C63FF" : "#EDE9FE"}`,
                  cursor: selectedIdx !== null ? "default" : "pointer",
                  transition: "all 0.2s",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                } as React.CSSProperties}
              >
                <div style={{ fontSize: "40px", marginBottom: "8px" }}>{c.emoji}</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#1E1B4B", marginBottom: "4px" }}>{c.label}</div>
                <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{c.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* 시나리오/게임형 */}
        {(s.type === "scenario" || s.type === "game") && s.choices && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {s.choices.map((c, i) => (
              <button
                key={i}
                onClick={() => handleChoiceSelect(i)}
                disabled={selectedIdx !== null}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "14px 16px", borderRadius: "14px", textAlign: "left",
                  background: selectedIdx === i ? "#EEF2FF" : "white",
                  border: `1.5px solid ${selectedIdx === i ? "#6C63FF" : "#EDE9FE"}`,
                  cursor: selectedIdx !== null ? "default" : "pointer",
                  boxShadow: selectedIdx === i ? "0 0 20px rgba(108,99,255,0.15)" : "none",
                  transition: "all 0.2s",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                } as React.CSSProperties}
              >
                <span style={{
                  width: "30px", height: "30px", borderRadius: "8px",
                  background: "#F0EEFF", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: 700, color: "#6C63FF", flexShrink: 0,
                }}>{["A", "B", "C", "D"][i]}</span>
                <span style={{ fontSize: "13px", lineHeight: 1.5, color: "#374151" }}>{c.text}</span>
              </button>
            ))}
          </div>
        )}

        {/* 순위형 */}
        {s.type === "rank" && (
          <div>
            <p style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "10px", textAlign: "center" }}>
              드래그하여 순서를 변경하세요
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
              {rankItems.map((item, i) => (
                <div
                  key={item}
                  data-rank-item
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragEnter={() => handleDragEnter(i)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  onTouchStart={() => handleTouchStart(i)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "14px 16px", borderRadius: "12px", background: "white",
                    border: `1.5px solid ${dragIdx === i ? "#6C63FF" : "#EDE9FE"}`,
                    cursor: "grab", userSelect: "none",
                    opacity: dragIdx === i ? 0.5 : 1,
                    transition: "all 0.15s",
                    touchAction: "none",
                  }}
                >
                  <span style={{
                    width: "24px", height: "24px", borderRadius: "6px", background: "#6C63FF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: 700, color: "white", flexShrink: 0,
                  }}>{i + 1}</span>
                  <span style={{ fontSize: "13px", color: "#374151", flex: 1 }}>{item}</span>
                  <span style={{ color: "#9CA3AF", fontSize: "16px" }}>⠿</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleRankSubmit}
              style={{
                width: "100%", padding: "14px", borderRadius: "14px", border: "none",
                background: "linear-gradient(135deg, #6C63FF, #8B5CF6)",
                color: "white", fontSize: "15px", fontWeight: 700, cursor: "pointer",
                touchAction: "manipulation",
              }}
            >
              이 순서로 확정 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
