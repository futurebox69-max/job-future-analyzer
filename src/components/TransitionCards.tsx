"use client";

import { TransitionCard } from "@/types/analysis";

interface TransitionCardsProps {
  cards: TransitionCard[];
  mode: "adult" | "youth";
}

const TYPE_STYLES = {
  이직: { icon: "💼", bg: "bg-purple-500/10", border: "border-purple-500/30", color: "text-purple-300", badge: "bg-purple-500/20 text-purple-300" },
  전직: { icon: "🚀", bg: "bg-orange-500/10", border: "border-orange-500/30", color: "text-orange-300", badge: "bg-orange-500/20 text-orange-300" },
  창직: { icon: "✨", bg: "bg-green-500/10", border: "border-green-500/30", color: "text-green-300", badge: "bg-green-500/20 text-green-300" },
};

const DIFFICULTY_COLORS = {
  낮음: "text-green-400",
  보통: "text-yellow-400",
  높음: "text-red-400",
};

const TYPE_DESCRIPTIONS = {
  이직: { adult: "같은 분야, 더 안전한 포지션", youth: "관련 진로 탐색" },
  전직: { adult: "다른 분야로 커리어 전환", youth: "새로운 분야 도전" },
  창직: { adult: "새로운 직업 창조", youth: "미래 직업 개척" },
};

export default function TransitionCards({ cards, mode }: TransitionCardsProps) {
  return (
    <div className="bg-white/5 rounded-3xl border border-white/10 p-6">
      <h3 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
        🗺️ {mode === "youth" ? "진로 전환 경로" : "전환 경로"}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const style = TYPE_STYLES[card.type];
          const typeDesc = TYPE_DESCRIPTIONS[card.type][mode];
          return (
            <div
              key={card.type}
              className={`${style.bg} border ${style.border} rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between">
                <span className="text-2xl">{style.icon}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
                  {card.type}
                </span>
              </div>

              {/* 제목 */}
              <div>
                <div className={`font-semibold ${style.color}`}>{card.title}</div>
                <div className="text-white/40 text-xs mt-0.5">{typeDesc}</div>
              </div>

              {/* 설명 */}
              <p className="text-white/70 text-sm leading-relaxed flex-1">
                {card.description}
              </p>

              {/* 예시 직함 */}
              {card.examples.length > 0 && (
                <div>
                  <div className="text-white/30 text-xs mb-1.5">직함 예시</div>
                  <div className="flex flex-wrap gap-1.5">
                    {card.examples.map((ex, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-white/10 text-white/60 rounded-lg"
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
                  <div className="text-white/30 text-xs mb-1.5">핵심 스킬</div>
                  <div className="flex flex-wrap gap-1.5">
                    {card.keySkills.map((sk, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2 py-0.5 rounded-lg border`}
                        style={{ borderColor: "rgba(108,99,255,0.3)", color: "#A78BFA", background: "rgba(108,99,255,0.1)" }}
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 난이도 + 기간 */}
              <div className="flex items-center justify-between text-xs text-white/40">
                <span>
                  난이도: <span className={`font-medium ${DIFFICULTY_COLORS[card.difficulty]}`}>{card.difficulty}</span>
                </span>
                {card.timeframe && (
                  <span className="text-white/30">⏱ {card.timeframe}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
