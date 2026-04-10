"use client";

import { useEffect, useState } from "react";
import { AnalysisResult } from "@/types/analysis";
import { LangCode } from "@/lib/i18n";

interface Props {
  dimensions: AnalysisResult["dimensions"];
  lang?: LangCode;
}

type DimKey = "repetitive" | "cognitive" | "physical" | "creative" | "social" | "ethical" | "techVelocity" | "regulatory";

const LABELS: Record<LangCode, {
  title: string;
  subtitle: string;
  why_title: string;
  why_body: string;
  why_risk_strong: string;
  why_human_strong: string;
  shield_badge: string;
  danger_label: string;
  safe_label: string;
  weight_summary: string;
  ref_note: string;
  inverse_suffix: string;
  dim_names: Record<DimKey, string>;
  dim_descs: {
    danger: [string, string, string, string];
    safe: [string, string, string, string];
  };
}> = {
  ko: {
    title: "📊 8차원 분석",
    subtitle: "각 차원의 AI 대체 가능성 점수 (0% = 안전, 100% = 위험)",
    why_title: "💡 왜 8차원으로 분석하나요?",
    why_body: '단순히 "자동화 가능 여부"만 보는 기존 연구와 달리, 이 분석은',
    why_risk_strong: "AI가 대체하기 쉬운 요소",
    why_human_strong: "인간만이 가진 강점",
    shield_badge: "보호막",
    danger_label: "🤖 AI 대체 위험 요소 (높을수록 위험)",
    safe_label: "🛡️ 인간 고유 강점 (높을수록 안전)",
    weight_summary: "가중치: 반복업무 20% · 인지판단 18% · 기술속도 12% · 창의성 12% · 대인관계 12% · 신체작업 10% · 윤리법적 8% · 제도보호 −8%",
    ref_note: "참고: Frey & Osborne (2013·2023) · O*NET · McKinsey Global Institute (2023) · WEF Future of Jobs (2025) · Autor (2022) · EU AI Act (2024)",
    inverse_suffix: "역방향",
    dim_names: {
      repetitive: "반복적 업무",
      cognitive: "인지적 판단",
      physical: "신체적 작업",
      creative: "창의성/감성",
      social: "대인관계",
      ethical: "윤리/법적",
      techVelocity: "기술 변화 속도",
      regulatory: "제도적 보호막",
    },
    dim_descs: {
      danger: [
        "반복 업무 (20%) — RPA·AI가 가장 먼저 대체",
        "인지적 판단 (18%) — 표준화된 의사결정",
        "기술 변화 속도 (12%) — 해당 분야 AI 발전 속도",
        "신체적 작업 (10%) — 로봇공학 대체 가능성",
      ],
      safe: [
        "창의성·감성 (12%) — AI가 흉내 내기 어려운 영역",
        "대인관계·소통 (12%) — 신뢰·공감·협상",
        "윤리·법적 판단 (8%) — 책임과 재량이 필요한 결정",
        "제도적 보호막 (8%, 역방향) — 면허·규제가 AI를 막는 힘",
      ],
    },
  },
  en: {
    title: "📊 8-Dimension Analysis",
    subtitle: "AI replacement probability score per dimension (0% = safe, 100% = at risk)",
    why_title: "💡 Why 8 dimensions?",
    why_body: "Unlike studies that only ask 'can it be automated?', this analysis measures both",
    why_risk_strong: "factors AI can easily replace",
    why_human_strong: "strengths unique to humans",
    shield_badge: "Shield",
    danger_label: "🤖 AI Replacement Risk Factors (higher = more dangerous)",
    safe_label: "🛡️ Human Strengths (higher = safer)",
    weight_summary: "Weights: Repetitive 20% · Cognitive 18% · Tech Velocity 12% · Creative 12% · Social 12% · Physical 10% · Ethical 8% · Regulatory −8%",
    ref_note: "Ref: Frey & Osborne (2013·2023) · O*NET · McKinsey Global Institute (2023) · WEF Future of Jobs (2025) · Autor (2022) · EU AI Act (2024)",
    inverse_suffix: "inverse",
    dim_names: {
      repetitive: "Repetitive Tasks",
      cognitive: "Cognitive Judgment",
      physical: "Physical Work",
      creative: "Creativity / Emotion",
      social: "Interpersonal Skills",
      ethical: "Ethics & Law",
      techVelocity: "Tech Velocity",
      regulatory: "Regulatory Shield",
    },
    dim_descs: {
      danger: [
        "Repetitive Tasks (20%) — First to be replaced by RPA & AI",
        "Cognitive Judgment (18%) — Standardized decision-making",
        "Tech Velocity (12%) — Speed of AI advancement in this field",
        "Physical Work (10%) — Robotics replacement potential",
      ],
      safe: [
        "Creativity & Emotion (12%) — Hard for AI to replicate authentically",
        "Interpersonal Skills (12%) — Trust, empathy, negotiation",
        "Ethics & Law (8%) — Decisions requiring accountability",
        "Regulatory Shield (8%, inverse) — Licenses & regulations that block AI",
      ],
    },
  },
  zh: {
    title: "📊 8维度分析",
    subtitle: "各维度AI替代可能性评分（0%=安全，100%=危险）",
    why_title: "💡 为什么用8个维度分析？",
    why_body: "与仅关注"是否可自动化"的传统研究不同，本分析同时测量",
    why_risk_strong: "AI容易替代的因素",
    why_human_strong: "人类独有的优势",
    shield_badge: "保护盾",
    danger_label: "🤖 AI替代风险因素（越高越危险）",
    safe_label: "🛡️ 人类固有优势（越高越安全）",
    weight_summary: "权重：重复工作20%·认知判断18%·技术速度12%·创造力12%·人际关系12%·体力工作10%·伦理法律8%·制度保护−8%",
    ref_note: "参考：Frey & Osborne (2013·2023) · O*NET · McKinsey Global Institute (2023) · WEF Future of Jobs (2025) · Autor (2022) · EU AI Act (2024)",
    inverse_suffix: "反向",
    dim_names: {
      repetitive: "重复性工作",
      cognitive: "认知判断",
      physical: "体力工作",
      creative: "创造力/情感",
      social: "人际关系",
      ethical: "伦理/法律",
      techVelocity: "技术变化速度",
      regulatory: "制度保护壁",
    },
    dim_descs: {
      danger: [
        "重复性工作 (20%) — RPA·AI最先替代的任务",
        "认知判断 (18%) — 标准化决策",
        "技术变化速度 (12%) — 该领域AI发展速度",
        "体力工作 (10%) — 机器人替代可能性",
      ],
      safe: [
        "创造力·情感 (12%) — AI难以真正模仿的领域",
        "人际关系·沟通 (12%) — 信任·同理心·谈判",
        "伦理·法律判断 (8%) — 需要责任与裁量的决定",
        "制度保护壁 (8%, 反向) — 执照·法规阻止AI的力量",
      ],
    },
  },
  ja: {
    title: "📊 8次元分析",
    subtitle: "各次元のAI代替可能性スコア（0%=安全、100%=危険）",
    why_title: "💡 なぜ8次元で分析するのか？",
    why_body: "「自動化できるかどうか」だけを見る従来の研究と異なり、この分析は",
    why_risk_strong: "AIが代替しやすい要素",
    why_human_strong: "人間固有の強み",
    shield_badge: "保護壁",
    danger_label: "🤖 AI代替リスク要因（高いほど危険）",
    safe_label: "🛡️ 人間固有の強み（高いほど安全）",
    weight_summary: "ウェイト：反復業務20%·認知判断18%·技術速度12%·創造性12%·対人関係12%·身体作業10%·倫理法的8%·制度保護−8%",
    ref_note: "参考：Frey & Osborne (2013·2023) · O*NET · McKinsey Global Institute (2023) · WEF Future of Jobs (2025) · Autor (2022) · EU AI Act (2024)",
    inverse_suffix: "逆方向",
    dim_names: {
      repetitive: "反復業務",
      cognitive: "認知的判断",
      physical: "身体的作業",
      creative: "創造性/感性",
      social: "対人関係",
      ethical: "倫理/法的",
      techVelocity: "技術変化速度",
      regulatory: "制度的保護壁",
    },
    dim_descs: {
      danger: [
        "反復業務 (20%) — RPA·AIが最初に代替する",
        "認知的判断 (18%) — 標準化された意思決定",
        "技術変化速度 (12%) — 当該分野のAI発展速度",
        "身体的作業 (10%) — ロボット工学による代替可能性",
      ],
      safe: [
        "創造性·感性 (12%) — AIが模倣しにくい領域",
        "対人関係·コミュニケーション (12%) — 信頼·共感·交渉",
        "倫理·法的判断 (8%) — 責任と裁量が必要な決定",
        "制度的保護壁 (8%, 逆方向) — 資格·規制がAIを阻む力",
      ],
    },
  },
  es: {
    title: "📊 Análisis 8 Dimensiones",
    subtitle: "Puntuación de probabilidad de reemplazo IA por dimensión (0%=seguro, 100%=riesgo)",
    why_title: "💡 ¿Por qué 8 dimensiones?",
    why_body: "A diferencia de estudios que solo preguntan «¿puede automatizarse?», este análisis mide tanto",
    why_risk_strong: "factores que la IA puede reemplazar fácilmente",
    why_human_strong: "fortalezas exclusivas del ser humano",
    shield_badge: "Escudo",
    danger_label: "🤖 Factores de Riesgo de Reemplazo IA (más alto = más peligroso)",
    safe_label: "🛡️ Fortalezas Humanas (más alto = más seguro)",
    weight_summary: "Pesos: Repetitivo 20% · Cognitivo 18% · Vel. Tecnológica 12% · Creativo 12% · Social 12% · Físico 10% · Ético 8% · Regulatorio −8%",
    ref_note: "Ref: Frey & Osborne (2013·2023) · O*NET · McKinsey Global Institute (2023) · WEF Future of Jobs (2025) · Autor (2022) · EU AI Act (2024)",
    inverse_suffix: "inverso",
    dim_names: {
      repetitive: "Tareas Repetitivas",
      cognitive: "Juicio Cognitivo",
      physical: "Trabajo Físico",
      creative: "Creatividad / Emoción",
      social: "Habilidades Sociales",
      ethical: "Ética y Legal",
      techVelocity: "Velocidad Tecnológica",
      regulatory: "Protección Regulatoria",
    },
    dim_descs: {
      danger: [
        "Tareas Repetitivas (20%) — Las primeras en ser reemplazadas por RPA e IA",
        "Juicio Cognitivo (18%) — Toma de decisiones estandarizada",
        "Velocidad Tecnológica (12%) — Ritmo de avance de la IA en el sector",
        "Trabajo Físico (10%) — Potencial de sustitución por robótica",
      ],
      safe: [
        "Creatividad y Emoción (12%) — Difícil de replicar auténticamente por IA",
        "Habilidades Sociales (12%) — Confianza, empatía, negociación",
        "Ética y Ley (8%) — Decisiones que requieren responsabilidad y criterio",
        "Protección Regulatoria (8%, inverso) — Licencias y normas que frenan la IA",
      ],
    },
  },
};

const DIMENSION_ORDER: DimKey[] = [
  "repetitive",
  "cognitive",
  "physical",
  "creative",
  "social",
  "ethical",
  "techVelocity",
  "regulatory",
];

const INVERSE_DIMS = new Set<DimKey>(["regulatory"]);

function getBarColor(score: number, inverse = false): string {
  const effective = inverse ? 100 - score : score;
  if (effective < 30) return "#16A34A";
  if (effective < 55) return "#D97706";
  if (effective < 75) return "#DC2626";
  return "#991B1B";
}

const WEIGHTS: Record<DimKey, string> = {
  repetitive: "20%",
  cognitive: "18%",
  physical: "10%",
  creative: "12%",
  social: "12%",
  ethical: "8%",
  techVelocity: "12%",
  regulatory: "8%",
};

export default function SixDimensions({ dimensions, lang = "ko" }: Props) {
  const [animated, setAnimated] = useState(false);
  const L = LABELS[lang];

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, [dimensions]);

  return (
    <div
      className="rounded-3xl border p-6"
      style={{ background: "#FFFFFF", borderColor: "#EDE9FE", boxShadow: "0 2px 16px rgba(108,99,255,0.07)" }}
    >
      <h3 className="font-semibold text-lg mb-1 flex items-center gap-2" style={{ color: "#1E1B4B" }}>
        {L.title}
      </h3>
      <p className="text-xs mb-3" style={{ color: "#9CA3AF" }}>{L.subtitle}</p>

      {/* 왜 8차원인가 */}
      <div className="rounded-xl p-4 mb-5 border" style={{ background: "#F5F4FF", borderColor: "#EDE9FE" }}>
        <p className="text-xs font-semibold mb-2" style={{ color: "#6C63FF" }}>{L.why_title}</p>
        <p className="text-xs leading-relaxed" style={{ color: "#4B5563" }}>
          {L.why_body} <strong>{L.why_risk_strong}</strong>{lang === "ko" ? "와" : lang === "es" ? " como" : lang === "zh" ? "和" : lang === "ja" ? "と" : " and"} <strong>{L.why_human_strong}</strong>{lang === "ko" ? "을 함께 측정합니다." : lang === "es" ? " simultáneamente." : lang === "zh" ? "。" : lang === "ja" ? "を同時に測定します。" : "."}
        </p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "#DC2626" }}>{L.danger_label}</p>
            <ul className="text-xs space-y-0.5" style={{ color: "#6B7280" }}>
              {L.dim_descs.danger.map((d, i) => (
                <li key={i}>• <strong>{d.split(" — ")[0]}</strong>{d.includes(" — ") ? ` — ${d.split(" — ")[1]}` : ""}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "#16A34A" }}>{L.safe_label}</p>
            <ul className="text-xs space-y-0.5" style={{ color: "#6B7280" }}>
              {L.dim_descs.safe.map((d, i) => (
                <li key={i}>• <strong>{d.split(" — ")[0]}</strong>{d.includes(" — ") ? ` — ${d.split(" — ")[1]}` : ""}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-xs mt-3 pt-2 border-t" style={{ borderColor: "#EDE9FE", color: "#9CA3AF" }}>
          {L.ref_note}
        </p>
      </div>

      <div className="space-y-5">
        {DIMENSION_ORDER.map((key) => {
          const dim = dimensions[key];
          const isInverse = INVERSE_DIMS.has(key);
          const color = getBarColor(dim.score, isInverse);
          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm flex items-center gap-2" style={{ color: "#374151" }}>
                  <span>{dim.icon}</span>
                  <span>{L.dim_names[key]}</span>
                  {isInverse && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ color: "#16A34A", background: "#F0FDF4", border: "1px solid #BBF7D0" }}>{L.shield_badge}</span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "#9CA3AF" }}>{WEIGHTS[key]}{isInverse ? ` (${L.inverse_suffix})` : ""}</span>
                  <span className="text-sm font-semibold tabular-nums" style={{ color }}>
                    {dim.score}%
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: animated ? `${dim.score}%` : "0%",
                    background: `linear-gradient(90deg, ${color}70, ${color})`,
                  }}
                />
              </div>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "#6B7280" }}>{dim.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t" style={{ borderColor: "#F3F4F6" }}>
        <p className="text-xs text-center" style={{ color: "#9CA3AF" }}>
          {L.weight_summary}
        </p>
      </div>
    </div>
  );
}
