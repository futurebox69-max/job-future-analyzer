"use client";

interface Props {
  note: string;
  jobName: string;
}

export default function ConsultingNote({ note, jobName }: Props) {
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
          <h2 className="text-lg font-bold" style={{ color: "#1E1B4B" }}>컨설팅 핵심 메시지</h2>
          <p className="text-xs" style={{ color: "#7C3AED" }}>상담·강의 시 전달할 핵심 인사이트 ({jobName})</p>
        </div>
      </div>

      <div className="rounded-xl p-4 border" style={{ background: "#FFFFFF", borderColor: "#EDE9FE" }}>
        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#374151" }}>{note}</p>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: "#9CA3AF" }}>
        <span>⚠️</span>
        <span>AI 분석 결과는 참고용입니다. 개인 상황에 따라 다를 수 있습니다.</span>
      </div>
    </section>
  );
}
