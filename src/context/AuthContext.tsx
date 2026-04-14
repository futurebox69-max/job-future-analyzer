"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient, UserProfile, ADMIN_EMAIL } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signInWithEmail: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (data) {
        setProfile(data as UserProfile);
      } else if (!data && !error) {
        // 프로필이 없으면 현재 유저 정보로 생성
        const { data: userData } = await supabase.auth.getUser();
        const email = userData?.user?.email ?? "";
        const isAdmin = email === "naeyou69@gmail.com" || email === "futurebox69@gmail.com";
        const { data: newProfile } = await supabase
          .from("profiles")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .insert({ id: userId, email, role: isAdmin ? "admin" : "free", monthly_usage: 0 } as any)
          .select()
          .single();
        if (newProfile) setProfile(newProfile as UserProfile);
      }
    } catch {
      // 프로필 조회 실패 시 기본값 설정
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          try { await fetchProfile(session.user.id); } catch {}
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithEmail = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = () => {
    // 1) 스토리지 전부 삭제
    localStorage.clear();
    sessionStorage.clear();
    // 2) supabase.auth.signOut() 절대 호출 안 함 (네트워크 hang 원인)
    // 3) window.location.reload() = 무조건 전체 새로고침
    //    → AuthProvider 포함 React 트리 완전 파괴 후 재시작
    //    → 빈 localStorage → Supabase 클라이언트 세션 없음 → 로그아웃
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signInWithEmail, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
