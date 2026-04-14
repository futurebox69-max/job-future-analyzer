"use client";

import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    // Supabase 관련 코드 없음 - 순수하게 스토리지 삭제 후 리로드
    localStorage.clear();
    sessionStorage.clear();
    // reload()는 현재 URL(/logout)을 다시 로드하므로 href로 이동
    // 단, 다른 URL로 이동해야 SPA가 아닌 진짜 브라우저 이동이 됨
    window.location.href = "/?from=logout";
  }, []);

  return (
    <>
      {/* JS 실패시 meta refresh로 리다이렉트 */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <meta httpEquiv="refresh" content="0;url=/?from=logout" />
      </head>
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#F8F7FF",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>👋</div>
          <div style={{ fontSize: "16px", color: "#6B7280" }}>로그아웃 중...</div>
        </div>
      </div>
    </>
  );
}
