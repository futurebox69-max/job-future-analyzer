"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  onClose: () => void;
  reason?: string;
}

export default function AuthModal({ onClose, reason }: AuthModalProps) {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const { error } = await signInWithEmail(email.trim());
    if (error) {
      setError("이메일 전송에 실패했습니다. 다시 시도해주세요.");
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    const { error } = await signInWithGoogle();
    if (error) {
      setError("구글 로그인에 실패했습니다. 다시 시도해주세요.");
      setGoogleLoading(false);
    }
    // 성공 시 구글 페이지로 리다이렉트되므로 별도 처리 불필요
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "28px",
          padding: "36px 32px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          position: "relative",
        }}
      >
        {/* 닫기 */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "16px", right: "20px",
            background: "none", border: "none", fontSize: "20px",
            color: "#9CA3AF", cursor: "pointer",
          }}
        >
          ✕
        </button>

        {!sent ? (
          <>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔐</div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1E1B4B", marginBottom: "8px" }}>
              로그인 / 회원가입
            </h2>

            {reason && (
              <div
                style={{
                  background: "#F0EEFF", borderRadius: "12px",
                  padding: "12px 14px", marginBottom: "20px",
                  fontSize: "14px", color: "#5B52D6", fontWeight: 500,
                }}
              >
                {reason}
              </div>
            )}

            {/* 구글 로그인 버튼 */}
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              style={{
                width: "100%", padding: "13px 16px",
                borderRadius: "14px", border: "1.5px solid #E5E7EB",
                background: "white", color: "#374151",
                fontSize: "15px", fontWeight: 600,
                cursor: googleLoading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                marginBottom: "16px",
                opacity: googleLoading ? 0.7 : 1,
                transition: "box-shadow 0.15s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
              onMouseEnter={(e) => { if (!googleLoading) e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.08)"; }}
            >
              {/* 구글 로고 SVG */}
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                <path d="M47.532 24.552c0-1.636-.132-3.204-.388-4.728H24.48v9.02h12.952c-.556 3.008-2.24 5.552-4.776 7.26v6.024h7.732c4.52-4.164 7.144-10.3 7.144-17.576z" fill="#4285F4"/>
                <path d="M24.48 48c6.48 0 11.916-2.148 15.888-5.872l-7.732-6.024c-2.148 1.44-4.896 2.288-8.156 2.288-6.272 0-11.588-4.236-13.488-9.928H3.004v6.22C6.96 42.98 15.128 48 24.48 48z" fill="#34A853"/>
                <path d="M10.992 28.464A14.52 14.52 0 0 1 10.228 24c0-1.556.268-3.064.764-4.464V13.316H3.004A23.96 23.96 0 0 0 .48 24c0 3.868.928 7.528 2.524 10.684l7.988-6.22z" fill="#FBBC05"/>
                <path d="M24.48 9.608c3.528 0 6.692 1.212 9.18 3.592l6.888-6.888C36.388 2.376 30.952 0 24.48 0 15.128 0 6.96 5.02 3.004 13.316l7.988 6.22C12.892 13.844 18.208 9.608 24.48 9.608z" fill="#EA4335"/>
              </svg>
              {googleLoading ? "연결 중..." : "Google로 계속하기"}
            </button>

            {/* 구분선 */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }} />
              <span style={{ fontSize: "13px", color: "#9CA3AF" }}>또는 이메일로</span>
              <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }} />
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소 입력"
                style={{
                  width: "100%", padding: "14px 16px",
                  borderRadius: "14px", border: "1.5px solid #EDE9FE",
                  fontSize: "15px", color: "#1E1B4B",
                  outline: "none", marginBottom: "12px",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#6C63FF"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#EDE9FE"; }}
              />
              {error && (
                <p style={{ fontSize: "13px", color: "#EF4444", marginBottom: "10px" }}>{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !email.trim()}
                style={{
                  width: "100%", padding: "14px",
                  borderRadius: "14px", border: "none",
                  background: "linear-gradient(135deg, #6C63FF, #4158D0)",
                  color: "white", fontSize: "16px", fontWeight: 700,
                  cursor: loading || !email.trim() ? "not-allowed" : "pointer",
                  opacity: loading || !email.trim() ? 0.6 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {loading ? "전송 중..." : "이메일 로그인 링크 받기"}
              </button>
            </form>

            <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "16px", textAlign: "center" }}>
              로그인하면 이용약관에 동의하는 것으로 간주됩니다
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📧</div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1E1B4B", marginBottom: "10px" }}>
              이메일을 확인하세요!
            </h2>
            <p style={{ fontSize: "15px", color: "#6B7280", lineHeight: 1.7, marginBottom: "24px" }}>
              <strong style={{ color: "#1E1B4B" }}>{email}</strong>으로<br />
              로그인 링크를 보냈습니다.<br />
              링크를 클릭하면 자동으로 로그인됩니다.
            </p>
            <button
              onClick={onClose}
              style={{
                width: "100%", padding: "14px",
                borderRadius: "14px", border: "1.5px solid #EDE9FE",
                background: "white", color: "#6C63FF",
                fontSize: "15px", fontWeight: 600, cursor: "pointer",
              }}
            >
              확인
            </button>
          </>
        )}
      </div>
    </div>
  );
}
