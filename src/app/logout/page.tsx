"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";

export default function LogoutPage() {
  useEffect(() => {
    // 즉시 스토리지 삭제
    localStorage.clear();
    sessionStorage.clear();
    // 쿠키 삭제
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
    });
    // signOut은 백그라운드 (await 없이)
    const supabase = createClient();
    supabase.auth.signOut({ scope: "global" }).catch(() => {});
    // 즉시 리다이렉트
    window.location.replace("/");
  }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#F8F7FF",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>👋</div>
        <div style={{ fontSize: "16px", color: "#6B7280" }}>로그아웃 중...</div>
      </div>
    </div>
  );
}
