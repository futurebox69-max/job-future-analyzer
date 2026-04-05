/**
 * 월간 직업 시장 컨텍스트 업데이터
 * GitHub Actions에서 매월 1일 실행
 *
 * 수집 → Claude 요약 → Upstash Redis 저장
 * 분석 API에서 이 데이터를 프롬프트에 주입
 */

import Anthropic from "@anthropic-ai/sdk";
import { Redis } from "@upstash/redis";

const anthropic = new Anthropic({ apiKey: process.env.JOB_ANALYZER_API_KEY! });
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ── RSS / 오픈 피드 소스 ──────────────────────────────────────
const SOURCES = [
  // 한국 고용·노동
  { name: "고용노동부 보도자료", url: "https://www.moel.go.kr/rss/RssNewsListAction.do", lang: "ko" },
  { name: "한국고용정보원", url: "https://www.keis.or.kr/rss/rssMain.do", lang: "ko" },
  { name: "과학기술정보통신부", url: "https://www.msit.go.kr/rss/rssMain.do", lang: "ko" },

  // 글로벌 AI·미래 직업
  { name: "WEF Jobs & Work", url: "https://www.weforum.org/agenda/feed/?topic=jobs-and-the-future-of-work", lang: "en" },
  { name: "MIT Tech Review AI", url: "https://www.technologyreview.com/topic/artificial-intelligence/feed/", lang: "en" },
  { name: "OECD Employment", url: "https://www.oecd-ilibrary.org/feed/content/OECD-Employment-Overview", lang: "en" },

  // 법·제도
  { name: "법제처 최신 법령", url: "https://www.law.go.kr/LSW/rss/rssMain.do?currentPage=1&menuType=news", lang: "ko" },
  { name: "EU AI Policy", url: "https://digital-strategy.ec.europa.eu/en/news/rss.xml", lang: "en" },
];

// ── RSS 파싱 (간단한 정규식 기반) ─────────────────────────────
async function fetchRssFeed(source: typeof SOURCES[0]): Promise<string[]> {
  try {
    const res = await fetch(source.url, {
      headers: { "User-Agent": "JobFutureAnalyzer/2.0 (context-updater)" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    const xml = await res.text();

    // 제목과 설명 추출
    const items: string[] = [];
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
    for (const match of itemMatches) {
      const item = match[1];
      const titleMatch = item.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/s);
      const descMatch = item.match(/<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/s);
      const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);

      const title = (titleMatch?.[1] || titleMatch?.[2] || "").replace(/<[^>]+>/g, "").trim();
      const desc = (descMatch?.[1] || descMatch?.[2] || "").replace(/<[^>]+>/g, "").substring(0, 200).trim();
      const date = dateMatch?.[1]?.trim() ?? "";

      if (title) items.push(`[${date}] ${title}: ${desc}`);
      if (items.length >= 5) break; // 소스당 최신 5개
    }
    console.log(`✓ ${source.name}: ${items.length}개 수집`);
    return items;
  } catch (e) {
    console.warn(`✗ ${source.name} 실패:`, (e as Error).message);
    return [];
  }
}

// ── 전체 크롤링 ────────────────────────────────────────────────
async function crawlAllSources(): Promise<string> {
  const results = await Promise.allSettled(SOURCES.map(fetchRssFeed));
  const lines: string[] = [];

  SOURCES.forEach((src, i) => {
    const result = results[i];
    if (result.status === "fulfilled" && result.value.length > 0) {
      lines.push(`\n## ${src.name}`);
      lines.push(...result.value);
    }
  });

  return lines.join("\n");
}

// ── Claude로 요약 ──────────────────────────────────────────────
async function summarizeWithClaude(rawContent: string): Promise<JobMarketContext> {
  const today = new Date().toISOString().slice(0, 10);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    temperature: 0.1,
    system: `당신은 AI 시대 직업 시장 분석 전문가입니다.
수집된 최신 뉴스·보도자료·정책 자료를 분석하여
직업 AI 대체율 분석에 활용할 수 있는 핵심 컨텍스트를 JSON으로 요약하세요.
반드시 순수 JSON만 반환하세요.`,
    messages: [{
      role: "user",
      content: `오늘 날짜: ${today}

아래 수집된 최신 자료를 분석하여 직업 AI 대체율 분석 시 참고할 컨텍스트를 JSON으로 작성하세요.

<raw_content>
${rawContent.substring(0, 12000)}
</raw_content>

JSON 형식:
{
  "updatedAt": "${today}",
  "aiTechUpdates": "최신 AI 기술 발전 중 직업 대체에 영향을 주는 핵심 사항 (3~5가지 불릿포인트, 한국어)",
  "regulatoryChanges": "AI·고용 관련 최신 법·규제 변화 (한국 + 글로벌, 3~5가지)",
  "industryShifts": "산업 구조 변화 중 직업 시장에 영향을 주는 핵심 트렌드 (3~5가지)",
  "emergingJobs": "새롭게 생겨나는 직업 또는 급성장 중인 역할 (3~5가지)",
  "atRiskSectors": "현재 가장 빠르게 AI 대체가 진행 중인 분야 (3~5가지)",
  "keyStats": "최신 통계나 수치 (자동화율, 고용 변화 등, 있는 경우만)",
  "consultingInsight": "상담사·강사가 내담자에게 전달할 이달의 핵심 메시지 (2~3문장)"
}`,
    }],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Claude 응답 오류");

  let cleaned = content.text.trim();
  const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/s);
  if (match) cleaned = match[1].trim();

  return JSON.parse(cleaned) as JobMarketContext;
}

// ── Redis 저장 ─────────────────────────────────────────────────
async function saveToRedis(context: JobMarketContext): Promise<void> {
  const key = "job_market_context:latest";
  const historyKey = `job_market_context:${context.updatedAt}`;

  // 최신 데이터 저장 (TTL 40일)
  await redis.set(key, JSON.stringify(context), { ex: 60 * 60 * 24 * 40 });
  // 월별 히스토리 보관 (TTL 1년)
  await redis.set(historyKey, JSON.stringify(context), { ex: 60 * 60 * 24 * 365 });

  console.log(`✓ Redis 저장 완료: ${key} (업데이트: ${context.updatedAt})`);
}

// ── 타입 정의 ──────────────────────────────────────────────────
interface JobMarketContext {
  updatedAt: string;
  aiTechUpdates: string;
  regulatoryChanges: string;
  industryShifts: string;
  emergingJobs: string;
  atRiskSectors: string;
  keyStats: string;
  consultingInsight: string;
}

// ── 메인 실행 ──────────────────────────────────────────────────
async function main() {
  console.log("🔄 월간 직업 시장 컨텍스트 업데이트 시작...\n");

  // 1. 크롤링
  console.log("📡 뉴스·법령·보고서 수집 중...");
  const rawContent = await crawlAllSources();

  if (rawContent.trim().length < 100) {
    console.warn("⚠️ 수집된 내용이 너무 적습니다. 종료합니다.");
    process.exit(1);
  }

  // 2. Claude 요약
  console.log("\n🧠 Claude로 직업 시장 영향 분석 중...");
  const context = await summarizeWithClaude(rawContent);

  // 3. Redis 저장
  console.log("\n💾 Upstash Redis에 저장 중...");
  await saveToRedis(context);

  // 4. 결과 출력
  console.log("\n✅ 업데이트 완료!\n");
  console.log("── 이달의 핵심 컨텍스트 ──");
  console.log("AI 기술:", context.aiTechUpdates.substring(0, 100) + "...");
  console.log("규제 변화:", context.regulatoryChanges.substring(0, 100) + "...");
  console.log("위험 분야:", context.atRiskSectors.substring(0, 100) + "...");
}

main().catch((e) => {
  console.error("❌ 오류 발생:", e);
  process.exit(1);
});
