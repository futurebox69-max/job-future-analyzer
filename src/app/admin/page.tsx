"use client";

import { useState, useEffect, useCallback } from "react";

interface StatsData {
  today: {
    date: string;
    requests: number;
    cacheHits: number;
    claudeCalls: number;
    cacheHitRate: number;
    estimatedCostUSD: number;
    estimatedCostKRW: number;
  };
  month: {
    period: string;
    requests: number;
    claudeCalls: number;
    cacheHitRate: number;
    estimatedCostUSD: number;
    estimatedCostKRW: number;
  };
  topJobs: { name: string; count: number }[];
  daily: { date: string; requests: number }[];
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<StatsData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = useCallback(async (adminKey: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/stats?key=${encodeURIComponent(adminKey)}`);
      if (res.status === 401) {
        setError("비밀번호가 틀렸습니다.");
        setAuthed(false);
        return;
      }
      const json = await res.json();
      setData(json);
      setAuthed(true);
      setLastUpdated(new Date());
    } catch {
      setError("데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  // 30초마다 자동 갱신
  useEffect(() => {
    if (!authed || !key) return;
    const interval = setInterval(() => fetchStats(key), 30_000);
    return () => clearInterval(interval);
  }, [authed, key, fetchStats]);

  const maxDaily = data ? Math.max(...data.daily.map((d) => d.requests), 1) : 1;

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F4FF" }}>
        <div className="bg-white rounded-3xl border p-10 w-full max-w-sm text-center" style={{ borderColor: "#EDE9FE", boxShadow: "0 4px 32px rgba(108,99,255,0.1)" }}>
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-xl font-bold mb-1" style={{ color: "#1E1B4B" }}>관리자 대시보드</h1>
          <p className="text-sm mb-6" style={{ color: "#9CA3AF" }}>ADMIN_SECRET 키를 입력하세요</p>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchStats(key)}
            placeholder="비밀번호"
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none mb-3"
            style={{ borderColor: "#EDE9FE", color: "#1E1B4B" }}
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button
            onClick={() => fetchStats(key)}
            disabled={loading || !key}
            className="w-full py-3 rounded-xl text-white font-semibold transition-all"
            style={{ background: "#6C63FF", opacity: loading || !key ? 0.5 : 1 }}
          >
            {loading ? "확인 중..." : "입장"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F5F4FF" }}>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1E1B4B" }}>📊 사용 현황 대시보드</h1>
            <p className="text-sm mt-0.5" style={{ color: "#9CA3AF" }}>
              마지막 업데이트: {lastUpdated?.toLocaleTimeString("ko-KR")} · 30초마다 자동 갱신
            </p>
          </div>
          <button
            onClick={() => fetchStats(key)}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: "#6C63FF", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "갱신 중..." : "🔄 새로고침"}
          </button>
        </div>

        {data && (
          <>
            {/* 오늘 요약 카드 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <StatCard label="오늘 총 요청" value={data.today.requests} unit="회" color="#6C63FF" />
              <StatCard label="캐시 히트" value={data.today.cacheHits} unit="회" sub={`히트율 ${data.today.cacheHitRate}%`} color="#16A34A" />
              <StatCard label="Claude 호출" value={data.today.claudeCalls} unit="회" color="#D97706" />
              <StatCard
                label="오늘 예상 비용"
                value={`$${data.today.estimatedCostUSD}`}
                unit=""
                sub={`₩${data.today.estimatedCostKRW.toLocaleString()}`}
                color="#DC2626"
                isString
              />
            </div>

            {/* 이번 달 요약 */}
            <div
              className="rounded-2xl border p-6 mb-6"
              style={{ background: "#FFFFFF", borderColor: "#EDE9FE", boxShadow: "0 2px 12px rgba(108,99,255,0.07)" }}
            >
              <h2 className="font-bold text-lg mb-4" style={{ color: "#1E1B4B" }}>
                📅 이번 달 ({data.month.period})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>총 요청</p>
                  <p className="text-2xl font-bold" style={{ color: "#1E1B4B" }}>{data.month.requests.toLocaleString()}<span className="text-sm font-normal ml-1">회</span></p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>Claude 호출</p>
                  <p className="text-2xl font-bold" style={{ color: "#D97706" }}>{data.month.claudeCalls.toLocaleString()}<span className="text-sm font-normal ml-1">회</span></p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>캐시 절감율</p>
                  <p className="text-2xl font-bold" style={{ color: "#16A34A" }}>{data.month.cacheHitRate}<span className="text-sm font-normal ml-1">%</span></p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>월 예상 비용</p>
                  <p className="text-2xl font-bold" style={{ color: "#DC2626" }}>${data.month.estimatedCostUSD}</p>
                  <p className="text-xs" style={{ color: "#9CA3AF" }}>₩{data.month.estimatedCostKRW.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* 일별 추이 */}
              <div
                className="rounded-2xl border p-6"
                style={{ background: "#FFFFFF", borderColor: "#EDE9FE", boxShadow: "0 2px 12px rgba(108,99,255,0.07)" }}
              >
                <h2 className="font-bold mb-4" style={{ color: "#1E1B4B" }}>📈 최근 14일 요청 추이</h2>
                <div className="space-y-2">
                  {data.daily.map((d) => (
                    <div key={d.date} className="flex items-center gap-2">
                      <span className="text-xs w-20 flex-shrink-0" style={{ color: "#6B7280" }}>
                        {d.date.slice(5)}
                      </span>
                      <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(d.requests / maxDaily) * 100}%`,
                            background: "linear-gradient(90deg, #A78BFA, #6C63FF)",
                            minWidth: d.requests > 0 ? "4px" : "0",
                          }}
                        />
                      </div>
                      <span className="text-xs w-8 text-right font-medium" style={{ color: "#6C63FF" }}>
                        {d.requests}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 인기 직업 Top 10 */}
              <div
                className="rounded-2xl border p-6"
                style={{ background: "#FFFFFF", borderColor: "#EDE9FE", boxShadow: "0 2px 12px rgba(108,99,255,0.07)" }}
              >
                <h2 className="font-bold mb-4" style={{ color: "#1E1B4B" }}>🏆 이번 달 인기 직업 Top 10</h2>
                {data.topJobs.length === 0 ? (
                  <p className="text-sm" style={{ color: "#9CA3AF" }}>아직 데이터가 없습니다</p>
                ) : (
                  <div className="space-y-2">
                    {data.topJobs.map((job, i) => (
                      <div key={job.name} className="flex items-center gap-3">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            background: i < 3 ? "#6C63FF" : "#F3F4F6",
                            color: i < 3 ? "#FFFFFF" : "#6B7280",
                          }}
                        >
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm capitalize" style={{ color: "#374151" }}>{job.name}</span>
                        <span className="text-sm font-semibold" style={{ color: "#6C63FF" }}>{job.count}회</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 비용 절감 요약 */}
            <div
              className="rounded-2xl border p-5 text-sm"
              style={{ background: "linear-gradient(135deg, #F5F4FF, #EDE9FE)", borderColor: "#DDD6FE" }}
            >
              <p className="font-semibold mb-1" style={{ color: "#1E1B4B" }}>💡 절감 효과 분석</p>
              <p style={{ color: "#4B5563" }}>
                이번 달 전체 {data.month.requests}회 요청 중 캐시가 {data.month.cacheHitRate}% 처리 →{" "}
                Claude 호출 {data.month.requests - data.month.claudeCalls}회 절약 →{" "}
                <strong style={{ color: "#6C63FF" }}>
                  약 ${((data.month.requests - data.month.claudeCalls) * 0.069).toFixed(1)} (₩{Math.round((data.month.requests - data.month.claudeCalls) * 0.069 * 1380).toLocaleString()}) 절감
                </strong>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label, value, unit, sub, color, isString,
}: {
  label: string;
  value: number | string;
  unit: string;
  sub?: string;
  color: string;
  isString?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{ background: "#FFFFFF", borderColor: "#EDE9FE", boxShadow: "0 2px 8px rgba(108,99,255,0.06)" }}
    >
      <p className="text-xs mb-2" style={{ color: "#9CA3AF" }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>
        {isString ? value : Number(value).toLocaleString()}
        {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
      </p>
      {sub && <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>{sub}</p>}
    </div>
  );
}
