import { createClient as _create } from "@supabase/supabase-js";

// 싱글톤 — 렌더마다 새 인스턴스 생성 방지
let _client: ReturnType<typeof _create> | null = null;

export function createClient() {
  if (_client) return _client;
  _client = _create(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // autoRefreshToken이 orphaned lock(@supabase/gotrue-js) 원인
        // 로그아웃 후 lock이 해제되지 않아 signOut() hang 발생
        // 세션 갱신은 getSession() 호출 시 supabase가 자동 처리하므로 안전
        autoRefreshToken: false,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  );
  return _client;
}

export type UserRole = "free" | "premium" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  monthly_usage: number;
  usage_reset_at: string;
}

export const FREE_LIMIT = 3;
export const ADMIN_EMAIL = "naeyou69@gmail.com";
