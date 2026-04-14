import { createClient } from "@supabase/supabase-js";

// 서버 사이드 전용 — 클라이언트에서 사용 금지
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function getUserFromToken(token: string) {
  const supabase = createAdminClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function getProfileFromToken(token: string) {
  const supabase = createAdminClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return null;

  // 사용자 토큰으로 인증된 클라이언트 사용 (RLS 통과)
  const authedClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    }
  );

  const { data: profile } = await authedClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return profile as {
    id: string;
    email: string;
    role: "free" | "premium" | "admin";
    monthly_usage: number;
    usage_reset_at: string;
  } | null;
}

export async function incrementUsage(token: string, userId: string): Promise<{
  monthly_usage: number;
  role: string;
} | null> {
  const supabase = createAdminClient();
  // 사용자 토큰으로 인증된 클라이언트로 RPC 호출
  const authedClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    }
  );

  const { data, error } = await authedClient.rpc("increment_usage", { user_id: userId });
  if (error || !data || !data[0]) return null;
  return data[0];
}
