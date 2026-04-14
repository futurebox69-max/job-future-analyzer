"use client";

import { useAuth } from "@/context/AuthContext";
import { FREE_LIMIT } from "@/lib/supabase";

interface UsageCounterProps {
  onUpgradeClick?: () => void;
}

export default function UsageCounter({ onUpgradeClick }: UsageCounterProps) {
  const { user, profile } = useAuth();

  // 비로그인 or 관리자는 표시 안 함
  if (!user || !profile || profile.role === "admin") return null;
  // 프리미엄도 표시 안 함
  if (profile.role === "premium") return null;

  const used = profile.monthly_usage;
  const remaining = FREE_LIMIT - used;
  const pct = Math.min((used / FREE_LIMIT) * 100, 100);

  const color =
    remaining <= 0 ? "#EF4444" :
    remaining <= 1 ? "#F59E0B" :
    "#6C63FF";

  return (
    <div
      style={{
        display: "inline-flex", alignItems: "center", gap: "8px",
        padding: "6px 14px", borderRadius: "100px",
        background: remaining <= 1 ? "#FEF3C7" : "#F0EEFF",
        border: `1px solid ${remaining <= 1 ? "#FDE68A" : "#DDD6FE"}`,
        fontSize: "13px", fontWeight: 600, color,
        cursor: remaining <= 0 ? "pointer" : "default",
      }}
      onClick={remaining <= 0 ? onUpgradeClick : undefined}
      title={remaining <= 0 ? "프리미엄으로 업그레이드" : undefined}
    >
      {/* 진행 바 */}
      <div style={{
        width: "40px", height: "4px",
        background: "#E5E7EB", borderRadius: "2px", overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: color, borderRadius: "2px",
          transition: "width 0.3s ease",
        }} />
      </div>

      {remaining <= 0 ? (
        <span>무료 한도 초과 · 업그레이드 →</span>
      ) : remaining <= 1 ? (
        <span>무료 {remaining}회 남음</span>
      ) : (
        <span>무료 {used}/{FREE_LIMIT}회 사용</span>
      )}
    </div>
  );
}
