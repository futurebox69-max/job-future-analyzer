"use client";

import { SkillGap } from "@/types/analysis";

interface Props {
  data: SkillGap;
}

const URGENCY_COLOR: Record<string, string> = {
  "즉시": "#DC2626",
  "1년 내": "#D97706",
  "3년 내": "#16A34A",
};

export default function SkillGapAnalysis({ data }: Props) {
  const urgencyColor = URGENCY_COLOR[data.urgency] ?? "#6C63FF";

  return (
    <section
      className="rounded-2xl border p-6"
      style={{ background: "#FFFFFF", borderColor: "#EDE9FE", boxShadow: "0 2px 16px rgba(108,99,255,0.07)" }}
    >
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "#1E1B4B" }}>
          <span>🎯</span> 스킬 갭 분석
        </h2>
        <span
          className="text-xs px-3 py-1 rounded-full font-semibold"
          style={{ background: `${urgencyColor}15`, color: urgencyColor, border: `1.5px solid ${urgencyColor}35` }}
        >
          전환 긴급도: {data.urgency}
        </span>
      </div>
      <p className="text-xs mb-5" style={{ color: "#9CA3AF" }}>AI 시대에 지켜야 할 스킬 vs 버려야 할 스킬</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 유지 스킬 */}
        <div className="rounded-xl p-4 border" style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🛡️</span>
            <span className="font-semibold text-sm" style={{ color: "#16A34A" }}>AI가 못 대체하는 스킬</span>
          </div>
          <ul className="space-y-2">
            {data.keepSkills.map((skill, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 text-xs font-bold" style={{ color: "#16A34A" }}>✓</span>
                <span className="text-sm" style={{ color: "#374151" }}>{skill}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 사라질 스킬 */}
        <div className="rounded-xl p-4 border" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚠️</span>
            <span className="font-semibold text-sm" style={{ color: "#DC2626" }}>빠르게 사라질 스킬</span>
          </div>
          <ul className="space-y-2">
            {data.loseSkills.map((skill, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 text-xs font-bold" style={{ color: "#DC2626" }}>✗</span>
                <span className="text-sm line-through" style={{ color: "#9CA3AF", textDecorationColor: "#FCA5A5" }}>{skill}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* AI로 증폭할 역량 */}
        <div className="rounded-xl p-4 border" style={{ background: "#F5F4FF", borderColor: "#DDD6FE" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🤖</span>
            <span className="font-semibold text-sm" style={{ color: "#6C63FF" }}>AI 활용으로 증폭할 역량</span>
          </div>
          <ul className="space-y-2">
            {data.gainSkills.map((skill, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 text-xs font-bold" style={{ color: "#6C63FF" }}>→</span>
                <span className="text-sm font-medium" style={{ color: "#374151" }}>{skill}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
