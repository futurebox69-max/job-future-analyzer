"use client";

import { CompetencyResult as CompetencyResultType, CompetencyKey, COMPETENCY_INFO } from "@/types/competency";
import { AnalysisResult } from "@/types/analysis";
import { LangCode } from "@/lib/i18n";
import {
  archetypeLabel,
  competencyName,
  resultLabel,
  crossAnalysisText,
  growthActions,
  metaProcessingText,
  metaStyleText,
  seconds,
} from "@/lib/competency-i18n";

interface CompetencyResultProps {
  competencyResult: CompetencyResultType;
  analysisResult: AnalysisResult;
  jobName: string;
  mode: "adult" | "youth";
  lang: LangCode;
}

function RadarChart({ scores }: { scores: Record<CompetencyKey, number> }) {
  const keys: CompetencyKey[] = ["structural", "creative", "emotional", "adaptive", "ethical", "collab"];
  const max = Math.max(...Object.values(scores)) || 1;
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 72;
  const labelR = r + 22;
  const angles = keys.map((_, i) => (i * 360) / keys.length - 90);

  const toXY = (angleDeg: number, radius: number) => ({
    x: cx + radius * Math.cos((angleDeg * Math.PI) / 180),
    y: cy + radius * Math.sin((angleDeg * Math.PI) / 180),
  });

  const scorePoints = keys.map((k, i) => {
    const ratio = scores[k] / max;
    return toXY(angles[i], r * ratio);
  });
  const scorePath = scorePoints.map((p, i) =>
    `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  ).join(" ") + " Z";

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* 격자 */}
      {gridLevels.map((level) => {
        const pts = keys.map((_, i) => toXY(angles[i], r * level));
        const path = pts.map((p, i) =>
          `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
        ).join(" ") + " Z";
        return <path key={level} d={path} fill="none" stroke="#EDE9FE" strokeWidth="1" />;
      })}
      {/* 축선 */}
      {keys.map((_, i) => {
        const end = toXY(angles[i], r);
        return (
          <line key={i} x1={cx} y1={cy}
            x2={end.x.toFixed(1)} y2={end.y.toFixed(1)}
            stroke="#EDE9FE" strokeWidth="1"
          />
        );
      })}
      {/* 점수 영역 */}
      <path d={scorePath} fill="rgba(108,99,255,0.18)" stroke="#6C63FF" strokeWidth="2" />
      {/* 레이블 */}
      {keys.map((k, i) => {
        const info = COMPETENCY_INFO[k];
        const pt = toXY(angles[i], labelR);
        return (
          <text key={k} x={pt.x.toFixed(1)} y={pt.y.toFixed(1)}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fill="#6B7280" fontWeight="600"
          >
            {info.icon}
          </text>
        );
      })}
    </svg>
  );
}

export default function CompetencyResult({
  competencyResult,
  analysisResult,
  jobName,
  mode,
  lang,
}: CompetencyResultProps) {
  const { scores, topKey, metaAnalysis } = competencyResult;
  const arch = archetypeLabel(topKey, lang);
  const overallRisk = analysisResult.overallRate;

  const survivalSkills: Record<string, CompetencyKey[]> = {
    high_risk:   ["creative", "emotional", "ethical"],
    medium_risk: ["adaptive", "structural", "collab"],
    low_risk:    ["structural", "adaptive", "creative"],
  };
  const riskLevel = overallRisk >= 70 ? "high_risk" : overallRisk >= 40 ? "medium_risk" : "low_risk";
  const importantSkills = survivalSkills[riskLevel];
  const maxScore = Math.max(...Object.values(scores)) || 1;
  const weakPoints = importantSkills.filter((k) => scores[k] < maxScore * 0.6);
  const strengths = importantSkills.filter((k) => scores[k] >= maxScore * 0.7);
  const topCompInfo = COMPETENCY_INFO[topKey];
  const topName = competencyName(topKey, lang);

  const actions = growthActions(lang, {
    strengthName: strengths.length > 0 ? competencyName(strengths[0], lang) : undefined,
    weakName: weakPoints.length > 0 ? competencyName(weakPoints[0], lang) : undefined,
    topName,
    risk: overallRisk,
  });

  const sortedScores = (Object.entries(scores) as [CompetencyKey, number][]).sort((a, b) => b[1] - a[1]);

  const riskColor = overallRisk >= 70 ? "#EF4444" : overallRisk >= 40 ? "#F59E0B" : "#10B981";

  // suppress unused warning
  void mode;

  return (
    <div>
      {/* 아키타입 헤더 */}
      <div style={{
        background: "linear-gradient(135deg, #6C63FF 0%, #4158D0 100%)",
        borderRadius: "20px", padding: "24px 20px", marginBottom: "14px", textAlign: "center",
        boxShadow: "0 8px 32px rgba(108,99,255,0.25)",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "8px" }}>{arch.emoji}</div>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "6px" }}>
          {resultLabel("my_type", lang)}
        </div>
        <div style={{ fontSize: "22px", fontWeight: 900, color: "white", marginBottom: "4px" }}>{arch.title}</div>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>{arch.subtitle}</div>
      </div>

      {/* 레이더 차트 + 점수 바 */}
      <div style={{
        background: "white", borderRadius: "20px", padding: "22px",
        boxShadow: "0 4px 24px rgba(108,99,255,0.06)", marginBottom: "14px",
      }}>
        <div style={{ fontSize: "12px", color: "#6C63FF", fontWeight: 700, letterSpacing: "0.06em", marginBottom: "16px" }}>
          {resultLabel("profile_6d", lang)}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <RadarChart scores={scores} />
        </div>
        {sortedScores.map(([k, v]) => {
          const info = COMPETENCY_INFO[k];
          const pct = Math.round((v / maxScore) * 100);
          return (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <span style={{ fontSize: "16px", width: "20px", textAlign: "center" }}>{info.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                  <span style={{ fontSize: "12px", color: "#374151" }}>{competencyName(k, lang)}</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: info.color }}>{pct}%</span>
                </div>
                <div style={{ height: "7px", background: "#EDE9FE", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: "4px", background: info.color,
                    width: `${pct}%`, transition: "width 1.5s ease",
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI 대체율 × 역량 교차 분석 */}
      <div style={{
        background: "white", borderRadius: "20px", padding: "22px",
        boxShadow: "0 4px 24px rgba(108,99,255,0.06)", marginBottom: "14px",
      }}>
        <div style={{ fontSize: "12px", color: "#6C63FF", fontWeight: 700, letterSpacing: "0.06em", marginBottom: "14px" }}>
          {resultLabel("cross_title", lang)}
        </div>
        <div style={{ background: "#F5F4FF", borderRadius: "14px", padding: "16px", marginBottom: "14px" }}>
          <p style={{ fontSize: "14px", color: "#1E1B4B", lineHeight: 1.8 }}>
            {crossAnalysisText(lang, {
              risk: overallRisk,
              jobName,
              importantNames: importantSkills.map((k) => competencyName(k, lang)),
              topName: `${topCompInfo.icon} ${topName}`,
              isCore: importantSkills.includes(topKey),
            })}
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {strengths.map((k) => (
            <span key={k} style={{
              padding: "4px 12px", borderRadius: "100px",
              background: "#F0FDF4", color: "#10B981",
              fontSize: "12px", fontWeight: 600,
              border: "1px solid #BBF7D0",
            }}>
              {resultLabel("strength_tag", lang)}: {competencyName(k, lang)}
            </span>
          ))}
          {weakPoints.map((k) => (
            <span key={k} style={{
              padding: "4px 12px", borderRadius: "100px",
              background: "#FFFBEB", color: "#D97706",
              fontSize: "12px", fontWeight: 600,
              border: "1px solid #FDE68A",
            }}>
              {resultLabel("weak_tag", lang)}: {competencyName(k, lang)}
            </span>
          ))}
        </div>
      </div>

      {/* 맞춤 성장 전략 */}
      <div style={{
        background: "white", borderRadius: "20px", padding: "22px",
        boxShadow: "0 4px 24px rgba(108,99,255,0.06)", marginBottom: "14px",
      }}>
        <div style={{ fontSize: "12px", color: "#6C63FF", fontWeight: 700, letterSpacing: "0.06em", marginBottom: "14px" }}>
          {resultLabel("strategy_title", lang)}
        </div>
        {actions.map((action, i) => (
          <div key={i} style={{
            padding: "14px", borderRadius: "12px", marginBottom: "8px",
            background: i === 0 ? "#F0FDF4" : i === 1 ? "#FFFBEB" : "#F0EEFF",
            fontSize: "14px", color: "#1E1B4B", lineHeight: 1.6,
          }}>
            {action}
          </div>
        ))}
      </div>

      {/* 사고방식 메타분석 */}
      <div style={{
        background: "#FFFBEB", borderRadius: "20px", padding: "22px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
        border: "1px solid #FDE68A",
      }}>
        <div style={{ fontSize: "12px", color: "#D97706", fontWeight: 700, letterSpacing: "0.06em", marginBottom: "14px" }}>
          {resultLabel("meta_title", lang)}
        </div>
        <div style={{ fontSize: "13px", color: "#78350F", lineHeight: 1.8 }}>
          <p>{resultLabel("chosen_qtype", lang)}: <strong>&quot;{metaAnalysis.questionTypeMeaning}&quot;</strong></p>
          <p>{metaProcessingText(lang, metaAnalysis.questionTypeMeaning)}</p>
          <p style={{ marginTop: "8px" }}>
            {resultLabel("avg_time", lang)}: <strong>{seconds(lang, metaAnalysis.avgResponseTime)}</strong>
          </p>
          <p>{metaStyleText(lang, metaAnalysis.responseStyle)}</p>
        </div>
      </div>
    </div>
  );
}
