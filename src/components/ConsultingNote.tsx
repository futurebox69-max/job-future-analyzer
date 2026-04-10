"use client";

import { LangCode } from "@/lib/i18n";

interface Props {
  note: string;
  jobName: string;
  lang?: LangCode;
}

const LABELS: Record<LangCode, {
  title: string;
  subtitle: string;
  disclaimer: string;
}> = {
  ko: {
    title: "컨설팅 핵심 메시지",
    subtitle: "상담·강의 시 전달할 핵심 인사이트",
    disclaimer: "AI 분석 결과는 참고용입니다. 개인 상황에 따라 다를 수 있습니다.",
  },
  en: {
    title: "Key Consulting Message",
    subtitle: "Core insight for counseling & presentations",
    disclaimer: "AI analysis results are for reference only. Individual results may vary.",
  },
  zh: {
    title: "核心咨询信息",
    subtitle: "咨询与讲座中需传达的核心洞察",
    disclaimer: "AI分析结果仅供参考，因个人情况不同可能有所差异。",
  },
  ja: {
    title: "コンサルティング重要メッセージ",
    subtitle: "相談・講義で伝えるべき核心インサイト",
    disclaimer: "AI分析結果は参考値です。個人の状況により異なる場合があります。",
  },
  es: {
    title: "Mensaje Clave de Consultoría",
    subtitle: "Insight principal para asesorías y presentaciones",
    disclaimer: "Los resultados del análisis IA son de referencia. Los resultados individuales pueden variar.",
  },
};

export default function ConsultingNote({ note, jobName, lang = "ko" }: Props) {
  const L = LABELS[lang];

  return (
    <section
      className="rounded-2xl border p-6"
      style={{
        background: "linear-gradient(135deg, #F5F4FF 0%, #EDE9FE 100%)",
        borderColor: "#DDD6FE",
        boxShadow: "0 4px 24px rgba(108,99,255,0.12)",
      }}
    >
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">📋</span>
        <div>
          <h2 className="text-lg font-bold" style={{ color: "#1E1B4B" }}>{L.title}</h2>
          <p className="text-xs" style={{ color: "#7C3AED" }}>{L.subtitle} ({jobName})</p>
        </div>
      </div>

      <div className="rounded-xl p-4 border" style={{ background: "#FFFFFF", borderColor: "#EDE9FE" }}>
        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#374151" }}>{note}</p>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: "#9CA3AF" }}>
        <span>⚠️</span>
        <span>{L.disclaimer}</span>
      </div>
    </section>
  );
}
