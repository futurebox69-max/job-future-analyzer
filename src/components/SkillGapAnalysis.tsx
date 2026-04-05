"use client";

import { SkillGap } from "@/types/analysis";

interface Props {
  data: SkillGap;
}

const URGENCY_COLOR: Record<string, string> = {
  "즉시": "#EF4444",
  "1년 내": "#F59E0B",
  "3년 내": "#10B981",
};

export default function SkillGapAnalysis({ data }: Props) {
  const urgencyColor = URGENCY_COLOR[data.urgency] ?? "#6C63FF";

  return (
    <section className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.03)" }}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🎯</span> 스킬 갭 분석
        </h2>
        <span
          className="text-xs px-3 py-1 rounded-full font-semibold"
          style={{ background: `${urgencyColor}22`, color: urgencyColor, border: `1px solid ${urgencyColor}44` }}
        >
          전환 긴급도: {data.urgency}
        </span>
      </div>
      <p className="text-white/40 text-xs mb-5">AI 시대에 지켜야 할 스킬 vs 버려야 할 스킬</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 유지 스킬 */}
        <div className="rounded-xl p-4 border border-emerald-500/20" style={{ background: "rgba(16,185,129,0.05)" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🛡️</span>
            <span className="text-emerald-400 font-semibold text-sm">AI가 못 대체하는 스킬</span>
          </div>
          <ul className="space-y-2">
            {data.keepSkills.map((skill, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5 text-xs">✓</span>
                <span className="text-white/80 text-sm">{skill}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 사라질 스킬 */}
        <div className="rounded-xl p-4 border border-red-500/20" style={{ background: "rgba(239,68,68,0.05)" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚠️</span>
            <span className="text-red-400 font-semibold text-sm">빠르게 사라질 스킬</span>
          </div>
          <ul className="space-y-2">
            {data.loseSkills.map((skill, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5 text-xs">✗</span>
                <span className="text-white/60 text-sm line-through decoration-red-400/50">{skill}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* AI로 증폭할 역량 */}
        <div className="rounded-xl p-4 border border-purple-500/20" style={{ background: "rgba(108,99,255,0.05)" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🤖</span>
            <span className="text-purple-400 font-semibold text-sm">AI 활용으로 증폭할 역량</span>
          </div>
          <ul className="space-y-2">
            {data.gainSkills.map((skill, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5 text-xs">→</span>
                <span className="text-white/80 text-sm font-medium">{skill}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
