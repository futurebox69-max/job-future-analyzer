"use client";

import { TransitionCard } from "@/types/analysis";

interface TransitionCardsProps {
  cards: TransitionCard[];
  mode: "adult" | "youth";
}

const TYPE_STYLES = {
  이직: { icon: "💼", bg: "#F5F4FF", border: "#DDD6FE", color: "#6C63FF", badgeBg: "#EDE9FE", badgeColor: "#6C63FF" },
  전직: { icon: "🚀", bg: "#FFF7ED", border: "#FED7AA", color: "#EA580C", badgeBg: "#FFEDD5", badgeColor: "#EA580C" },
  창직: { icon: "✨", bg: "#F0FDF4", border: "#BBF7D0", color: "#16A34A", badgeBg: "#DCFCE7", badgeColor: "#16A34A" },
};

const DIFFICULTY_COLORS = {
  낮음: "#16A34A",
  보통: "#D97706",
  높음: "#DC2626",
};

const TYPE_DESCRIPTIONS = {
  이직: { adult: "같은 분야, 더 안전한 포지션", youth: "관련 진로 탐색" },
  전직: { adult: "다른 분야로 커리어 전환", youth: "새로운 분야 도전" },
  창직: { adult: "새로운 직업 창조", youth: "미래 직업 개척" },
};

export default function TransitionCards({ cards, mode }: TransitionCardsProps) {
  return (
    <div
      className="rounded-3xl border p-6"
      style={{ background: "#FFFFFF", borderColor: "#EDE9FE", boxShadow: "0 2px 16px rgba(108,99,255,0.07)" }}
    >
      <h3 className="font-semibold text-lg mb-5 flex items-center gap-2" style={{ color: "#1E1B4B" }}>
        🗺️ {mode === "youth" ? "진로 전환 경로" : "전환 경로"}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const style = TYPE_STYLES[card.type];
          const typeDesc = TYPE_DESCRIPTIONS[card.type][mode];
          return (
            <div
              key={card.type}
              className="rounded-2xl p-5 border flex flex-col gap-3 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: style.bg,
                borderColor: style.border,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between">
                <span className="text-2xl">{style.icon}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: style.badgeBg, color: style.badgeColor }}
                >
                  {card.type}
                </span>
              </div>

              {/* 제목 */}
              <div>
                <div className="font-semibold" style={{ color: style.color }}>{card.title}</div>
                <div className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{typeDesc}</div>
              </div>

              {/* 설명 */}
              <p className="text-sm leading-relaxed flex-1" style={{ color: "#374151" }}>
                {card.description}
              </p>

              {/* 예시 직함 */}
              {card.examples.length > 0 && (
                <div>
                  <div className="text-xs mb-1.5" style={{ color: "#9CA3AF" }}>직함 예시</div>
                  <div className="flex flex-wrap gap-1.5">
                    {card.examples.map((ex, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-lg"
                        style={{ background: "#F3F4F6", color: "#6B7280", border: "1px solid #E5E7EB" }}
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 필요 스킬 */}
              {card.keySkills && card.keySkills.length > 0 && (
                <div>
                  <div className="text-xs mb-1.5" style={{ color: "#9CA3AF" }}>핵심 스킬</div>
                  <div className="flex flex-wrap gap-1.5">
                    {card.keySkills.map((sk, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-lg border"
                        style={{ borderColor: "#DDD6FE", color: "#6C63FF", background: "#EDE9FE" }}
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 난이도 + 기간 */}
              <div className="flex items-center justify-between text-xs" style={{ color: "#9CA3AF" }}>
                <span>
                  난이도:{" "}
                  <span className="font-semibold" style={{ color: DIFFICULTY_COLORS[card.difficulty] }}>
                    {card.difficulty}
                  </span>
                </span>
                {card.timeframe && (
                  <span>⏱ {card.timeframe}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
