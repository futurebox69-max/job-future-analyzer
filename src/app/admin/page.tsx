"use client";

import { useState, useEffect, useCallback } from "react";

interface AgentCostEntry {
  key: string;
  label: string;
  emoji: string;
  costPerCall: number;
  today: { calls: number; costUSD: number; costKRW: number };
  month: { calls: number; costUSD: number; costKRW: number };
}

interface AgentCosts {
  agents: AgentCostEntry[];
  total: {
    today: { costUSD: number; costKRW: number };
    month: { costUSD: number; costKRW: number };
  };
}

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
  totalAllTime: number;
  topJobs: { name: string; count: number }[];
  topJobs30: { name: string; count: number }[];
  langStats: { name: string; count: number }[];
  modeStats: { name: string; count: number }[];
  hourStats: { hour: number; count: number }[];
  daily: { date: string; requests: number }[];
  agentCosts?: AgentCosts;
}

const LANG_META: Record<string, { flag: string; label: string }> = {
  ko: { flag: "🇰🇷", label: "한국어" },
  en: { flag: "🇺🇸", label: "English" },
  zh: { flag: "🇨🇳", label: "中文" },
  ja: { flag: "🇯🇵", label: "日本語" },
  es: { flag: "🇪🇸", label: "Español" },
};

const MODE_META: Record<string, { label: string; color: string; bg: string }> = {
  adult: { label: "성인 모드", color: "#6C63FF", bg: "#EDE9FE" },
  youth: { label: "청소년 모드", color: "#16A34A", bg: "#DCFCE7" },
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border p-5 bg-white ${className}`}
      style={{ borderColor: "#EDE9FE", boxShadow: "0 2px 12px rgba(108,99,255,0.07)" }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-bold text-base mb-4" style={{ color: "#1E1B4B" }}>
      {children}
    </h2>
  );
}

function KpiCard({
  label,
  value,
  unit,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  color: string;
}) {
  return (
    <Card>
      <p className="text-xs mb-2" style={{ color: "#9CA3AF" }}>{label}</p>
      <p className="text-2xl font-bold leading-tight" style={{ color }}>
        {typeof value === "number" ? value.toLocaleString() : value}
        {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
      </p>
      {sub && <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>{sub}</p>}
    </Card>
  );
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

  useEffect(() => {
    if (!authed || !key) return;
    const interval = setInterval(() => fetchStats(key), 30_000);
    return () => clearInterval(interval);
  }, [authed, key, fetchStats]);

  // ── Login Screen ──────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F4FF" }}>
        <div
          className="bg-white rounded-3xl border p-10 w-full max-w-sm text-center"
          style={{ borderColor: "#EDE9FE", boxShadow: "0 4px 32px rgba(108,99,255,0.1)" }}
        >
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

  // ── Dashboard ─────────────────────────────────────────────────────────
  if (!data) return null;

  const maxDaily = Math.max(...data.daily.map((d) => d.requests), 1);
  const totalLang = data.langStats.reduce((s, l) => s + l.count, 0) || 1;
  const maxLang = Math.max(...data.langStats.map((l) => l.count), 1);
  const totalMode = data.modeStats.reduce((s, m) => s + m.count, 0) || 1;
  const maxHour = Math.max(...data.hourStats.map((h) => h.count), 1);
  const maxJob = Math.max(...(data.topJobs30 ?? []).map((j) => j.count), 1);

  // Build full 24-hour array (fill gaps with 0)
  const hourMap = new Map(data.hourStats.map((h) => [h.hour, h.count]));
  const hours24 = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: hourMap.get(i) ?? 0 }));
  const peakHour = hours24.reduce((a, b) => (a.count >= b.count ? a : b));

  return (
    <div className="min-h-screen" style={{ background: "#F5F4FF" }}>
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* ── Header ─────────────────────────────────────── */}
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
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "#6C63FF", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "갱신 중..." : "🔄 새로고침"}
          </button>
        </div>

        {/* ── Row 1: KPI Cards ───────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="총 누적 분석"
            value={data.totalAllTime || data.month.requests}
            unit="회"
            color="#6C63FF"
          />
          <KpiCard
            label="오늘 분석"
            value={data.today.requests}
            unit="회"
            sub={`캐시 히트 ${data.today.cacheHitRate}%`}
            color="#7C3AED"
          />
          <KpiCard
            label="이번 달 분석"
            value={data.month.requests}
            unit="회"
            sub={`캐시 절감 ${data.month.cacheHitRate}%`}
            color="#2563EB"
          />
          <KpiCard
            label="월 비용"
            value={`$${data.month.estimatedCostUSD}`}
            sub={`₩${data.month.estimatedCostKRW.toLocaleString()}`}
            color="#DC2626"
          />
        </div>

        {/* ── 에이전트별 API 비용 ────────────────────────── */}
        {data.agentCosts && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <SectionTitle>🤖 에이전트별 API 비용</SectionTitle>
              <div className="flex gap-3 text-xs">
                <span style={{ color: "#9CA3AF" }}>오늘 총</span>
                <span className="font-bold" style={{ color: "#DC2626" }}>
                  ${data.agentCosts.total.today.costUSD.toFixed(4)}
                  <span className="font-normal ml-1" style={{ color: "#9CA3AF" }}>
                    (₩{data.agentCosts.total.today.costKRW.toLocaleString()})
                  </span>
                </span>
                <span style={{ color: "#9CA3AF" }}>이달 총</span>
                <span className="font-bold" style={{ color: "#DC2626" }}>
                  ${data.agentCosts.total.month.costUSD.toFixed(3)}
                  <span className="font-normal ml-1" style={{ color: "#9CA3AF" }}>
                    (₩{data.agentCosts.total.month.costKRW.toLocaleString()})
                  </span>
                </span>
              </div>
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "2px solid #EDE9FE" }}>
                    <th className="text-left py-2 pr-4 font-semibold" style={{ color: "#6B7280", width: "36%" }}>에이전트</th>
                    <th className="text-right py-2 px-3 font-semibold" style={{ color: "#6B7280" }}>단가</th>
                    <th className="text-right py-2 px-3 font-semibold" style={{ color: "#2563EB" }}>오늘 호출</th>
                    <th className="text-right py-2 px-3 font-semibold" style={{ color: "#2563EB" }}>오늘 비용</th>
                    <th className="text-right py-2 px-3 font-semibold" style={{ color: "#7C3AED" }}>이달 호출</th>
                    <th className="text-right py-2 pl-3 font-semibold" style={{ color: "#7C3AED" }}>이달 비용</th>
                  </tr>
                </thead>
                <tbody>
                  {data.agentCosts.agents.map((agent, i) => {
                    // 이달 기준 최대값 계산 (막대 그래프용)
                    const maxMonth = Math.max(...data.agentCosts!.agents.map(a => a.month.costUSD), 0.001);
                    const barWidth = Math.round((agent.month.costUSD / maxMonth) * 100);
                    return (
                      <tr
                        key={agent.key}
                        style={{
                          borderBottom: i < data.agentCosts!.agents.length - 1 ? "1px solid #F3F4F6" : "none",
                          background: i % 2 === 0 ? "transparent" : "#FAFAFA",
                        }}
                      >
                        {/* 에이전트명 */}
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span>{agent.emoji}</span>
                            <div>
                              <p className="font-medium" style={{ color: "#1E1B4B" }}>{agent.label}</p>
                              {/* 이달 비용 비율 막대 */}
                              <div className="mt-1 h-1.5 rounded-full" style={{ background: "#EDE9FE", width: "100px" }}>
                                <div
                                  className="h-1.5 rounded-full"
                                  style={{ width: `${barWidth}%`, background: "#6C63FF" }}
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                        {/* 단가 */}
                        <td className="py-3 px-3 text-right font-mono text-xs" style={{ color: "#9CA3AF" }}>
                          ${agent.costPerCall.toFixed(4)}
                        </td>
                        {/* 오늘 호출수 */}
                        <td className="py-3 px-3 text-right font-semibold" style={{ color: "#2563EB" }}>
                          {agent.today.calls.toLocaleString()}
                        </td>
                        {/* 오늘 비용 */}
                        <td className="py-3 px-3 text-right">
                          <span className="font-semibold" style={{ color: agent.today.costUSD > 0 ? "#DC2626" : "#9CA3AF" }}>
                            ${agent.today.costUSD.toFixed(4)}
                          </span>
                          {agent.today.costKRW > 0 && (
                            <span className="block text-xs" style={{ color: "#9CA3AF" }}>
                              ₩{agent.today.costKRW.toLocaleString()}
                            </span>
                          )}
                        </td>
                        {/* 이달 호출수 */}
                        <td className="py-3 px-3 text-right font-semibold" style={{ color: "#7C3AED" }}>
                          {agent.month.calls.toLocaleString()}
                        </td>
                        {/* 이달 비용 */}
                        <td className="py-3 pl-3 text-right">
                          <span className="font-bold" style={{ color: agent.month.costUSD > 0 ? "#DC2626" : "#9CA3AF" }}>
                            ${agent.month.costUSD.toFixed(3)}
                          </span>
                          {agent.month.costKRW > 0 && (
                            <span className="block text-xs" style={{ color: "#9CA3AF" }}>
                              ₩{agent.month.costKRW.toLocaleString()}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* 합계 행 */}
                <tfoot>
                  <tr style={{ borderTop: "2px solid #EDE9FE" }}>
                    <td colSpan={2} className="py-3 pr-4 font-bold" style={{ color: "#1E1B4B" }}>
                      합계
                    </td>
                    <td className="py-3 px-3 text-right font-bold" style={{ color: "#2563EB" }}>
                      {data.agentCosts.agents.reduce((s, a) => s + a.today.calls, 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="font-bold" style={{ color: "#DC2626" }}>
                        ${data.agentCosts.total.today.costUSD.toFixed(4)}
                      </span>
                      <span className="block text-xs" style={{ color: "#9CA3AF" }}>
                        ₩{data.agentCosts.total.today.costKRW.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold" style={{ color: "#7C3AED" }}>
                      {data.agentCosts.agents.reduce((s, a) => s + a.month.calls, 0).toLocaleString()}
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <span className="font-bold text-base" style={{ color: "#DC2626" }}>
                        ${data.agentCosts.total.month.costUSD.toFixed(3)}
                      </span>
                      <span className="block text-xs font-semibold" style={{ color: "#6B7280" }}>
                        ₩{data.agentCosts.total.month.costKRW.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        )}

        {/* ── Row 2: 14일 추이 + 언어별 ──────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {/* 14일 요청 추이 */}
          <Card>
            <SectionTitle>📈 최근 14일 요청 추이</SectionTitle>
            <div className="space-y-2">
              {data.daily.map((d) => (
                <div key={d.date} className="flex items-center gap-2">
                  <span className="text-xs w-14 flex-shrink-0" style={{ color: "#6B7280" }}>
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
                  <span className="text-xs w-8 text-right font-semibold" style={{ color: "#6C63FF" }}>
                    {d.requests}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* 언어별 분석 현황 */}
          <Card>
            <SectionTitle>🌐 언어별 분석 현황</SectionTitle>
            {data.langStats.length === 0 ? (
              <p className="text-sm" style={{ color: "#9CA3AF" }}>데이터 없음 (다음 분석 후 집계됩니다)</p>
            ) : (
              <div className="space-y-3">
                {data.langStats.map((lang) => {
                  const meta = LANG_META[lang.name] ?? { flag: "🌍", label: lang.name };
                  const pct = Math.round((lang.count / totalLang) * 100);
                  const barW = Math.round((lang.count / maxLang) * 100);
                  return (
                    <div key={lang.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm" style={{ color: "#374151" }}>
                          {meta.flag} {meta.label}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: "#6C63FF" }}>
                          {lang.count}회 ({pct}%)
                        </span>
                      </div>
                      <div className="h-4 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${barW}%`,
                            background: "linear-gradient(90deg, #C4B5FD, #6C63FF)",
                            minWidth: lang.count > 0 ? "4px" : "0",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* ── Row 3: 모드별 + 시간대별 ───────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {/* 모드별 분석 */}
          <Card>
            <SectionTitle>👤 모드별 분석</SectionTitle>
            {data.modeStats.length === 0 ? (
              <p className="text-sm" style={{ color: "#9CA3AF" }}>데이터 없음 (다음 분석 후 집계됩니다)</p>
            ) : (
              <div className="space-y-4">
                {data.modeStats.map((m) => {
                  const meta = MODE_META[m.name] ?? { label: m.name, color: "#6B7280", bg: "#F3F4F6" };
                  const pct = Math.round((m.count / totalMode) * 100);
                  return (
                    <div key={m.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-sm font-semibold px-3 py-1 rounded-full"
                          style={{ color: meta.color, background: meta.bg }}
                        >
                          {meta.label}
                        </span>
                        <span className="text-sm font-bold" style={{ color: meta.color }}>
                          {m.count}회
                        </span>
                      </div>
                      <div className="h-6 rounded-xl overflow-hidden" style={{ background: "#F3F4F6" }}>
                        <div
                          className="h-full rounded-xl flex items-center pl-3"
                          style={{
                            width: `${pct}%`,
                            background: meta.color,
                            minWidth: m.count > 0 ? "48px" : "0",
                            transition: "width 0.5s",
                          }}
                        >
                          <span className="text-xs text-white font-semibold">{pct}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs pt-1" style={{ color: "#9CA3AF" }}>
                  총 {totalMode}회 · 피크: {peakHour.hour}시대
                </p>
              </div>
            )}
          </Card>

          {/* 시간대별 사용 패턴 */}
          <Card>
            <SectionTitle>⏰ 시간대별 사용 패턴 (오늘)</SectionTitle>
            {data.hourStats.length === 0 ? (
              <p className="text-sm" style={{ color: "#9CA3AF" }}>데이터 없음 (오늘 분석 후 집계됩니다)</p>
            ) : (
              <>
                <div className="flex items-end gap-0.5 h-24">
                  {hours24.map((h) => {
                    const heightPct = maxHour > 0 ? (h.count / maxHour) * 100 : 0;
                    const isPeak = h.hour === peakHour.hour && h.count > 0;
                    return (
                      <div
                        key={h.hour}
                        className="flex-1 flex flex-col items-center justify-end"
                        title={`${h.hour}시: ${h.count}회`}
                      >
                        <div
                          className="w-full rounded-t-sm"
                          style={{
                            height: `${Math.max(heightPct, h.count > 0 ? 4 : 0)}%`,
                            background: isPeak
                              ? "#6C63FF"
                              : heightPct > 50
                              ? "#A78BFA"
                              : "#DDD6FE",
                            minHeight: h.count > 0 ? "3px" : "0",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs mt-1" style={{ color: "#9CA3AF" }}>
                  <span>0시</span>
                  <span>6시</span>
                  <span>12시</span>
                  <span>18시</span>
                  <span>23시</span>
                </div>
                <p className="text-xs mt-2" style={{ color: "#6C63FF" }}>
                  피크 시간대: {peakHour.hour}시 ({peakHour.count}회)
                </p>
              </>
            )}
          </Card>
        </div>

        {/* ── Row 4: 인기 직업 Top 30 ────────────────────── */}
        <Card className="mb-6">
          <SectionTitle>🏆 이번 달 인기 직업 Top 30</SectionTitle>
          {!data.topJobs30 || data.topJobs30.length === 0 ? (
            <p className="text-sm" style={{ color: "#9CA3AF" }}>아직 데이터가 없습니다</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              {data.topJobs30.map((job, i) => (
                <div key={job.name} className="flex items-center gap-3">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: i < 3 ? "#6C63FF" : i < 10 ? "#EDE9FE" : "#F3F4F6",
                      color: i < 3 ? "#FFFFFF" : i < 10 ? "#6C63FF" : "#9CA3AF",
                      fontSize: "11px",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm capitalize truncate" style={{ color: "#374151" }}>
                    {job.name}
                  </span>
                  <div className="w-16 h-3 rounded-full overflow-hidden flex-shrink-0" style={{ background: "#F3F4F6" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(job.count / maxJob) * 100}%`,
                        background: i < 3 ? "#6C63FF" : "#A78BFA",
                        minWidth: "3px",
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold w-8 text-right flex-shrink-0" style={{ color: "#6C63FF" }}>
                    {job.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ── Row 5: 절감 효과 분석 ──────────────────────── */}
        <div
          className="rounded-2xl border p-5 text-sm"
          style={{ background: "linear-gradient(135deg, #F5F4FF, #EDE9FE)", borderColor: "#DDD6FE" }}
        >
          <p className="font-semibold mb-2" style={{ color: "#1E1B4B" }}>💡 절감 효과 분석</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>총 요청</p>
              <p className="text-xl font-bold" style={{ color: "#1E1B4B" }}>{data.month.requests.toLocaleString()}회</p>
            </div>
            <div className="text-center">
              <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>캐시 절약</p>
              <p className="text-xl font-bold" style={{ color: "#16A34A" }}>
                {(data.month.requests - data.month.claudeCalls).toLocaleString()}회
              </p>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>{data.month.cacheHitRate}% 절감</p>
            </div>
            <div className="text-center">
              <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>절감 금액</p>
              <p className="text-xl font-bold" style={{ color: "#6C63FF" }}>
                ${((data.month.requests - data.month.claudeCalls) * 0.069).toFixed(1)}
              </p>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>
                ₩{Math.round((data.month.requests - data.month.claudeCalls) * 0.069 * 1380).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
