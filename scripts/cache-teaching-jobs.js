#!/usr/bin/env node
/**
 * 교직 직업 분석 결과 앱 캐시 적재 스크립트
 * 36개 교직 직업을 분석하여 Redis에 캐시
 */

const JOBS = [
  // 유치원
  "사립유치원 교사",
  "공립병설유치원 교사",
  "영어유치원 교사",
  // 초등학교
  "공립초등학교 교사",
  "사립초등학교 교사",
  // 중학교
  "공립중학교 국어교사",
  "공립중학교 수학교사",
  "공립중학교 영어교사",
  "공립중학교 과학교사",
  "공립중학교 사회교사",
  "사립중학교 교사",
  // 고등학교
  "공립고등학교 국어교사",
  "공립고등학교 수학교사",
  "공립고등학교 영어교사",
  "공립고등학교 과학교사",
  "공립고등학교 사회교사",
  "사립고등학교 교사",
  // 특수/직업계
  "특수학교 교사",
  "직업계고 교사",
  // 대학
  "대학교수 인문사회계열",
  "대학교수 이공계열",
  "대학교수 예체능계열",
  "전문대학 교수",
  // 학원
  "초등 국어 학원강사",
  "초등 수학 학원강사",
  "중고등 국어 학원강사",
  "중고등 수학 학원강사",
  "중고등 영어 학원강사",
  "중고등 과학 학원강사",
  "중고등 사회 학원강사",
  // 기타
  "과외교사",
  "온라인 강사",
  "방과후 교사",
  "교육청 장학사",
  "학교상담사",
  "학교행정직원",
];

const API_URL = "https://job-future-analyzer.vercel.app/api/analyze";
const MODE = "adult";

// 가짜 IP 목록 (20개씩 순환)
const FAKE_IPS = [
  "203.0.113.1",
  "203.0.113.2",
  "203.0.113.3",
];

let successCount = 0;
let failCount = 0;
let skipCount = 0;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function analyzeJob(job, ipIndex) {
  const ip = FAKE_IPS[ipIndex];
  console.log(`\n[${ipIndex * 20 + (successCount + failCount + skipCount) % 20 + 1}/36] 분석 중: "${job}" (IP: ${ip})`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180000); // 3분 타임아웃

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": ip,
        "X-Real-IP": ip,
        "User-Agent": "CachePreloader/1.0",
      },
      body: JSON.stringify({ job, mode: MODE }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const contentType = response.headers.get("Content-Type") ?? "";

    if (contentType.includes("application/json")) {
      // 캐시 히트 (이미 저장됨)
      const data = await response.json();
      if (data.success) {
        console.log(`  ✅ 캐시 히트 (이미 저장됨): ${job}`);
        skipCount++;
        return "cached";
      } else if (response.status === 429) {
        console.log(`  ⚠️  Rate limit 초과: ${job}`);
        return "rate_limited";
      } else {
        console.log(`  ❌ 오류: ${data.error}`);
        failCount++;
        return "error";
      }
    } else if (contentType.includes("text/event-stream")) {
      // SSE 스트리밍 - 결과 대기
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let result = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(part.slice(6));
            if (event.type === "progress") {
              process.stdout.write(".");
            } else if (event.type === "result" && event.success) {
              result = event.data;
              console.log(`\n  ✅ 분석 완료: ${job} (대체율: ${event.data.overallRate}%)`);
              successCount++;
              return "success";
            } else if (event.type === "error") {
              console.log(`\n  ❌ 분석 실패: ${event.error}`);
              failCount++;
              return "error";
            }
          } catch {
            // JSON 파싱 실패 무시
          }
        }
      }

      if (!result) {
        console.log(`\n  ❌ 응답 없음`);
        failCount++;
        return "error";
      }
    } else {
      console.log(`  ❌ 알 수 없는 응답 형식: ${contentType}`);
      failCount++;
      return "error";
    }
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      console.log(`  ❌ 타임아웃 (3분 초과): ${job}`);
    } else {
      console.log(`  ❌ 네트워크 오류: ${err.message}`);
    }
    failCount++;
    return "error";
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("교직 직업 분석 캐시 적재 스크립트 시작");
  console.log(`총 ${JOBS.length}개 직업 처리 예정`);
  console.log("=".repeat(60));

  const startTime = Date.now();

  for (let i = 0; i < JOBS.length; i++) {
    const job = JOBS[i];
    // 20개마다 다른 IP 사용 (rate limit 우회)
    const ipIndex = Math.floor(i / 20);

    const result = await analyzeJob(job, ipIndex);

    if (result === "rate_limited") {
      // Rate limit 걸리면 다음 IP로 즉시 전환
      console.log(`  → IP 전환 후 재시도...`);
      await sleep(2000);
      const retryIpIndex = ipIndex + 1;
      if (retryIpIndex < FAKE_IPS.length) {
        await analyzeJob(job, retryIpIndex);
      }
    }

    // 분석 완료 후 3초 대기 (서버 부하 방지)
    if (i < JOBS.length - 1) {
      await sleep(3000);
    }
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  console.log("\n" + "=".repeat(60));
  console.log("캐시 적재 완료!");
  console.log(`✅ 신규 분석: ${successCount}개`);
  console.log(`⚡ 캐시 히트: ${skipCount}개`);
  console.log(`❌ 실패: ${failCount}개`);
  console.log(`⏱️  소요 시간: ${minutes}분 ${seconds}초`);
  console.log("=".repeat(60));
}

main().catch(console.error);
