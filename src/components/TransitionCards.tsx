"use client";

import { TransitionCard } from "@/types/analysis";
import { LangCode } from "@/lib/i18n";

interface TransitionCardsProps {
  cards: TransitionCard[];
  mode: "adult" | "youth";
  lang?: LangCode;
}

const LABELS: Record<LangCode, {
  title: string;
  youth_title: string;
  types: Record<string, string>;
  type_descs: Record<string, { adult: string; youth: string }>;
  examples_label: string;
  skills_label: string;
  difficulty_label: string;
  difficulty: Record<string, string>;
}> = {
  ko: {
    title: "🗺️ 전환 경로",
    youth_title: "🗺️ 진로 전환 경로",
    types: { 이직: "이직", 전직: "전직", 창직: "창직" },
    type_descs: {
      이직: { adult: "같은 분야, 더 안전한 포지션", youth: "관련 진로 탐색" },
      전직: { adult: "다른 분야로 커리어 전환", youth: "새로운 분야 도전" },
      창직: { adult: "새로운 직업 창조", youth: "미래 직업 개척" },
    },
    examples_label: "직함 예시",
    skills_label: "핵심 스킬",
    difficulty_label: "난이도",
    difficulty: { 낮음: "낮음", 보통: "보통", 높음: "높음" },
  },
  en: {
    title: "🗺️ Career Transition Paths",
    youth_title: "🗺️ Career Path Options",
    types: { 이직: "Job Switch", 전직: "Career Change", 창직: "New Career" },
    type_descs: {
      이직: { adult: "Same field, safer position", youth: "Explore related careers" },
      전직: { adult: "Transition to a different field", youth: "Try a new field" },
      창직: { adult: "Create a new career", youth: "Pioneer a future career" },
    },
    examples_label: "Job Title Examples",
    skills_label: "Key Skills",
    difficulty_label: "Difficulty",
    difficulty: { 낮음: "Low", 보통: "Medium", 높음: "High" },
  },
  zh: {
    title: "🗺️ 转型路径",
    youth_title: "🗺️ 职业路径选择",
    types: { 이직: "换工作", 전직: "转行", 창직: "创造新职业" },
    type_descs: {
      이직: { adult: "同领域，更安全的职位", youth: "探索相关职业" },
      전직: { adult: "跨领域职业转型", youth: "挑战新领域" },
      창직: { adult: "创造新职业", youth: "开拓未来职业" },
    },
    examples_label: "职位示例",
    skills_label: "核心技能",
    difficulty_label: "难度",
    difficulty: { 낮음: "低", 보통: "中", 높음: "高" },
  },
  ja: {
    title: "🗺️ 転換経路",
    youth_title: "🗺️ 進路転換経路",
    types: { 이직: "転職", 전직: "異業種転職", 창직: "新職業創造" },
    type_descs: {
      이직: { adult: "同分野でより安全なポジションへ", youth: "関連進路を探索" },
      전직: { adult: "異なる分野へキャリア転換", youth: "新しい分野に挑戦" },
      창직: { adult: "新しい職業を創造", youth: "未来の職業を開拓" },
    },
    examples_label: "職種例",
    skills_label: "主要スキル",
    difficulty_label: "難易度",
    difficulty: { 낮음: "低", 보통: "普通", 높음: "高" },
  },
  es: {
    title: "🗺️ Rutas de Transición",
    youth_title: "🗺️ Opciones de Carrera",
    types: { 이직: "Cambio de Empleo", 전직: "Cambio de Carrera", 창직: "Nueva Carrera" },
    type_descs: {
      이직: { adult: "Mismo campo, posición más segura", youth: "Explorar carreras relacionadas" },
      전직: { adult: "Transición a otro campo", youth: "Probar un nuevo campo" },
      창직: { adult: "Crear una nueva carrera", youth: "Pionero en el futuro" },
    },
    examples_label: "Ejemplos de Puestos",
    skills_label: "Habilidades Clave",
    difficulty_label: "Dificultad",
    difficulty: { 낮음: "Bajo", 보통: "Medio", 높음: "Alto" },
  },
};

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

export default function TransitionCards({ cards, mode, lang = "ko" }: TransitionCardsProps) {
  const L = LABELS[lang];

  return (
    <div
      className="rounded-3xl border p-4 sm:p-6"
      style={{ background: "#FFFFFF", borderColor: "#EDE9FE", boxShadow: "0 2px 16px rgba(108,99,255,0.07)" }}
    >
      <h3 className="font-semibold text-lg mb-5 flex items-center gap-2" style={{ color: "#1E1B4B" }}>
        {mode === "youth" ? L.youth_title : L.title}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const style = TYPE_STYLES[card.type];
          const typeLabel = L.types[card.type] ?? card.type;
          const typeDesc = L.type_descs[card.type]?.[mode] ?? "";
          const difficultyLabel = L.difficulty[card.difficulty] ?? card.difficulty;
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
                  className="text-sm px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: style.badgeBg, color: style.badgeColor }}
                >
                  {typeLabel}
                </span>
              </div>

              {/* 제목 */}
              <div>
                <div className="font-semibold" style={{ color: style.color }}>{card.title}</div>
                <div className="text-sm mt-0.5" style={{ color: "#9CA3AF" }}>{typeDesc}</div>
              </div>

              {/* 설명 */}
              <p className="text-sm leading-relaxed flex-1" style={{ color: "#374151" }}>
                {card.description}
              </p>

              {/* 예시 직함 */}
              {card.examples.length > 0 && (
                <div>
                  <div className="text-sm mb-1.5" style={{ color: "#9CA3AF" }}>{L.examples_label}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {card.examples.map((ex, i) => (
                      <span
                        key={i}
                        className="text-sm px-2 py-0.5 rounded-lg"
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
                  <div className="text-sm mb-1.5" style={{ color: "#9CA3AF" }}>{L.skills_label}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {card.keySkills.map((sk, i) => (
                      <span
                        key={i}
                        className="text-sm px-2 py-0.5 rounded-lg border"
                        style={{ borderColor: "#DDD6FE", color: "#6C63FF", background: "#EDE9FE" }}
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 난이도 + 기간 */}
              <div className="flex items-center justify-between text-sm" style={{ color: "#9CA3AF" }}>
                <span>
                  {L.difficulty_label}:{" "}
                  <span className="font-semibold" style={{ color: DIFFICULTY_COLORS[card.difficulty] }}>
                    {difficultyLabel}
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
