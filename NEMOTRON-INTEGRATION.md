# Nemotron-Personas-Korea 통합 가이드

## 개요
NVIDIA Nemotron-Personas-Korea (100만+ 한국인 합성 페르소나)를 REFRAME 앱 생태계에 통합.
18개 기능을 3개 앱(REFRAME, 내 직업의 미래, 역량평가)에 적용.

## 설치 및 데이터 준비

### Step 1: 데이터셋 다운로드 및 가공
```bash
# 로컬 터미널에서 실행 (Cowork 아님)
pip install datasets pandas numpy
python scripts/nemotron/process-dataset.py
```

### Step 2: 생성되는 파일 (public/data/)
| 파일 | 크기(예상) | 용도 |
|------|-----------|------|
| occupation-stats.json | ~2MB | 직업별 통계 (인원, 연령, 스킬) |
| occupation-cache.json | ~500KB | 직업 대체율 사전 캐시 |
| age-occupation-matrix.json | ~200KB | 연령×직업 교차 분석 |
| region-occupation-map.json | ~300KB | 지역×직업 분포 |
| skill-transition-graph.json | ~100KB | 직업 간 전환 경로 |
| competency-benchmarks.json | ~1MB | 직업별 역량 벤치마크 |
| persona-samples.json | ~200KB | B2B 데모용 샘플 |
| population-distribution.json | ~50KB | 백분위 계산용 분포 |

### Step 3: 앱 빌드
```bash
npm run build
# public/data/ 파일이 자동으로 정적 자산에 포함됨
```

## 아키텍처

```
scripts/nemotron/process-dataset.py    ← 데이터 가공 (1회 실행)
        ↓
public/data/*.json                     ← 정적 JSON 파일
        ↓
src/lib/nemotron/                      ← 핵심 로직 모듈
  ├── types.ts                         ← 타입 정의
  ├── data-loader.ts                   ← 서버/클라이언트 자동 감지 로더
  ├── occupation-cache.ts              ← #4 대체율 캐시
  ├── comparison.ts                    ← #5 비교 + #14 백분위
  ├── transition.ts                    ← #6 전환경로 + #8 연령곡선 + #9 지역맵
  ├── prompt-enrichment.ts             ← #7 프롬프트 정교화
  ├── simulation.ts                    ← #10 시뮬레이션 + #11 유형검증 + #13 난이도
  ├── trends.ts                        ← #1-3 온보딩/추천 + #12 랭킹 + #15 트렌드
  ├── benchmark.ts                     ← #16-18 B2B/벤치마크/개인정보
  └── index.ts                         ← 배럴 export
        ↓
src/app/api/nemotron/route.ts          ← REST API 엔드포인트
```

## API 사용법

모든 API는 `GET /api/nemotron?action=ACTION_NAME` 형식.

### 핵심 API

```typescript
// #4: 직업 대체율 즉시 조회 (API 호출 없이!)
GET /api/nemotron?action=cached-replacement&job=프로그래머

// #14: 역량 백분위 ("상위 15%")
GET /api/nemotron?action=percentile&scores={"structural":85,"creative":72}

// #5: 같은 직업 평균과 비교
GET /api/nemotron?action=compare&job=마케터&scores={"structural":75}

// #6: 전환 경로 추천
GET /api/nemotron?action=transitions&job=회계사&limit=5

// #1: 온보딩 개인화
GET /api/nemotron?action=onboarding&job=간호사

// #17: B2B 데모 시뮬레이션
GET /api/nemotron?action=b2b-demo&size=200&industry=IT
```

### 전체 API 목록
status, cached-replacement, occupation-profile, occupation-list,
percentile, compare, similar-people, transitions,
transition-feasibility, age-curve, region-map, prompt-context,
simulate, type-balance, question-difficulty, generational-trends,
rankings, onboarding, content, segment, b2b-demo, benchmark-personas

## 앱별 적용 방법

### 내 직업의 미래 (AI 대체율 분석기)
`src/app/api/analyze/route.ts`에서 Claude API 호출 전 캐시 확인:
```typescript
import { getCachedReplacement, enrichPromptWithNemotron } from '@/lib/nemotron';

// 1. 캐시 히트 시 즉시 반환 (비용 0원)
const cached = await getCachedReplacement(jobName);
if (cached) return cached;

// 2. 캐시 미스 시 프롬프트 정교화 후 Claude 호출
const context = await enrichPromptWithNemotron(jobName);
// ... context를 Claude 프롬프트에 추가
```

### 역량평가 (Assessment)
결과 화면에서 백분위 표시:
```typescript
import { getAllPercentileRanks, generateShareText } from '@/lib/nemotron';

const percentiles = await getAllPercentileRanks(userScores);
// percentiles.structural.rank → "상위 15%"

const shareText = generateShareText('구조적 사고', 15, '미래 설계자');
// "🏆 나의 미래역량 유형: 미래 설계��! 구조적 사고 상위 15%!"
```

### REFRAME (브랜드 허브)
온보딩에서 개인화:
```typescript
import { getOnboardingRecommendation } from '@/lib/nemotron';

const rec = await getOnboardingRecommendation('마케터', '30대');
// rec.welcomeMessage → "마케터 종사자 2,340명의 데이터가 준비..."
// rec.popularPaths → ["마케터 AI 대체율 분석", ...]
```

## 개인정보 안전
- 데이터: 100% 합성 (NVIDIA, CC-BY-4.0)
- 실제 개인정보 없음 → 개인정보보호법 적용 대상 아님
- KOSIS 공개 통계 기반 분포
- 합성 페르소나는 실존 인물과 무관

## 데이터 없이도 앱은 정상 작동
`isNemotronDataAvailable()`이 false를 반환하면 모든 기능이 graceful fallback.
기존 Claude API 분석은 그대로 동작하며, Nemotron 데이터는 추가 기능만 제공.
