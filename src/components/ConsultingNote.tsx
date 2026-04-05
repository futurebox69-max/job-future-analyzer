"use client";

interface Props {
  note: string;
  jobName: string;
}

export default function ConsultingNote({ note, jobName }: Props) {
  return (
    <section
      className="rounded-2xl border border-purple-500/30 p-6"
      style={{ background: "linear-gradient(135deg, rgba(108,99,255,0.08), rgba(167,139,250,0.04))" }}
    >
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">📋</span>
        <div>
          <h2 className="text-lg font-bold text-white">컨설팅 핵심 메시지</h2>
          <p className="text-white/40 text-xs">상담·강의 시 전달할 핵심 인사이트 ({jobName})</p>
        </div>
      </div>

      <div className="rounded-xl p-4 border border-white/10" style={{ background: "rgba(0,0,0,0.2)" }}>
        <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">{note}</p>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-white/30">
        <span>⚠️</span>
        <span>AI 분석 결과는 참고용입니다. 개인 상황에 따라 다를 수 있습니다.</span>
      </div>
    </section>
  );
}
