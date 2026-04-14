"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

interface ChatCoachProps {
  jobName: string;
  analysisContext?: object;
  lang?: string;
  onUpgrade?: () => void;
}

const FREE_CHAT_LIMIT = 3;

export default function ChatCoach({ jobName, analysisContext, onUpgrade }: ChatCoachProps) {
  const { user, profile, session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatCount = (profile as { monthly_chat_count?: number } | null)?.monthly_chat_count ?? 0;
  const isLimited = profile?.role === "free" && chatCount >= FREE_CHAT_LIMIT;
  const isAdmin = profile?.role === "admin";
  const remainingCount = remaining ?? (isAdmin ? 999 : Math.max(0, FREE_CHAT_LIMIT - chatCount));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading || isLimited) return;
    if (!user || !session?.access_token) return;

    const userMsg: Message = { role: "user", content: input.trim(), ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: input.trim(),
          conversationId,
          jobName,
          analysisContext,
          messages,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if ((data as { code?: string }).code === "CHAT_LIMIT") {
          setRemaining(0);
        }
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: (data as { error?: string }).error ?? "오류가 발생했습니다.",
          ts: Date.now(),
        }]);
        return;
      }

      // SSE 스트리밍
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "", ts: Date.now() }]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          try {
            const ev = JSON.parse(part.slice(6));
            if (ev.text) {
              assistantText += ev.text;
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { ...next[next.length - 1], content: assistantText };
                return next;
              });
            }
            if (ev.done) {
              setRemaining(ev.remaining);
              if (ev.conversationId) setConversationId(ev.conversationId);
            }
          } catch { /* 무시 */ }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ borderRadius: "24px", overflow: "hidden", border: "1.5px solid #EDE9FE", boxShadow: "0 4px 24px rgba(108,99,255,0.1)" }}>

      {/* 헤더 */}
      <div style={{
        background: "linear-gradient(135deg, #6C63FF 0%, #4158D0 100%)",
        padding: "18px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "22px" }}>🔮</span>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "white" }}>AI 커리어 코치</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>{jobName} 분석 기반 맞춤 상담</div>
          </div>
        </div>
        {!isAdmin && (
          <div style={{
            background: remainingCount <= 0 ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.18)",
            borderRadius: "100px", padding: "5px 12px",
            fontSize: "12px", color: remainingCount <= 0 ? "#FCA5A5" : "white", fontWeight: 600,
          }}>
            {remainingCount <= 0 ? "한도 초과" : `무료 ${remainingCount}회 남음`}
          </div>
        )}
      </div>

      {/* 일반 AI와의 차이점 안내 */}
      {showComparison && (
        <div style={{ background: "#FAFAFA", borderBottom: "1px solid #EDE9FE", padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#1E1B4B" }}>💡 일반 AI와 무엇이 다른가요?</div>
            <button onClick={() => setShowComparison(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: "16px" }}>✕</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={{ background: "#F3F4F6", borderRadius: "12px", padding: "12px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#6B7280", marginBottom: "6px" }}>💬 일반 AI (ChatGPT 등)</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", lineHeight: 1.6 }}>
                • 누구에게나 같은 답변<br />
                • 내 직업 상황 모름<br />
                • 처음부터 설명해야 함<br />
                • 일반적인 조언
              </div>
            </div>
            <div style={{ background: "#F0EEFF", borderRadius: "12px", padding: "12px", border: "1px solid #DDD6FE" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#6C63FF", marginBottom: "6px" }}>🔮 이 AI 코치</div>
              <div style={{ fontSize: "12px", color: "#5B52D6", lineHeight: 1.6 }}>
                • <strong>{jobName}</strong> 분석 결과 보유<br />
                • 내 대체율·스킬갭 파악<br />
                • 바로 맞춤 조언 가능<br />
                • 실행 가능한 다음 단계
              </div>
            </div>
          </div>
          <div style={{ marginTop: "10px", background: "#EEF2FF", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "#4F46E5" }}>
            <strong>예시:</strong> "제 상황에서 가장 먼저 해야 할 것이 뭔가요?" → 일반 AI는 막연한 답변, 이 코치는 <strong>"{jobName} 대체율 {(analysisContext as { overallRate?: number } | undefined)?.overallRate ?? "?"}%를 기준으로 구체적 행동 제시"</strong>
          </div>
        </div>
      )}

      {/* 대화창 */}
      <div style={{ height: "380px", overflowY: "auto", padding: "16px 20px", background: "white" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", marginTop: "60px" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔮</div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#1E1B4B", marginBottom: "6px" }}>무엇이든 물어보세요</div>
            <div style={{ fontSize: "13px", color: "#9CA3AF", lineHeight: 1.7 }}>
              {jobName} 분석 결과를 바탕으로<br />맞춤 커리어 조언을 드립니다
            </div>
            {/* 추천 질문 */}
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
              {[
                "지금 당장 무엇부터 시작해야 하나요?",
                "AI 대체를 피하려면 어떤 역량이 필요한가요?",
                "이 직업에서 유망한 분야는 어디인가요?",
              ].map((q) => (
                <button key={q} onClick={() => setInput(q)} style={{
                  background: "#F5F4FF", border: "1px solid #DDD6FE", borderRadius: "100px",
                  padding: "8px 16px", fontSize: "12px", color: "#6C63FF", cursor: "pointer",
                  fontWeight: 500,
                }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            marginBottom: "12px",
          }}>
            {msg.role === "assistant" && (
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #6C63FF, #4158D0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0, marginRight: "8px", alignSelf: "flex-end" }}>🔮</div>
            )}
            <div style={{
              maxWidth: "78%", padding: "10px 14px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: msg.role === "user" ? "linear-gradient(135deg, #6C63FF, #4158D0)" : "#F5F4FF",
              color: msg.role === "user" ? "white" : "#1E1B4B",
              fontSize: "14px", lineHeight: 1.6, whiteSpace: "pre-wrap",
            }}>
              {msg.content || (loading && i === messages.length - 1 ? (
                <span style={{ opacity: 0.6 }}>▋</span>
              ) : "")}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #EDE9FE", background: "white" }}>
        {isLimited ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "10px" }}>
              무료 AI 코치 {FREE_CHAT_LIMIT}회를 모두 사용하셨습니다
            </div>
            <button
              onClick={onUpgrade}
              style={{
                background: "linear-gradient(135deg, #6C63FF, #4158D0)", color: "white",
                border: "none", borderRadius: "12px", padding: "10px 24px",
                fontSize: "14px", fontWeight: 700, cursor: "pointer",
              }}
            >
              유료 플랜으로 무제한 이용하기 →
            </button>
          </div>
        ) : !user ? (
          <div style={{ textAlign: "center", fontSize: "13px", color: "#9CA3AF" }}>
            로그인 후 AI 코치를 이용할 수 있습니다
          </div>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="궁금한 것을 물어보세요..."
              disabled={loading}
              style={{
                flex: 1, padding: "10px 14px", borderRadius: "12px",
                border: "1.5px solid #EDE9FE", fontSize: "14px", outline: "none",
                color: "#1E1B4B", background: loading ? "#F9F9FF" : "white",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#6C63FF"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#EDE9FE"; }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                padding: "10px 16px", borderRadius: "12px", border: "none",
                background: loading || !input.trim() ? "#E5E7EB" : "linear-gradient(135deg, #6C63FF, #4158D0)",
                color: loading || !input.trim() ? "#9CA3AF" : "white",
                fontSize: "18px", cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >
              {loading ? "⏳" : "➤"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
