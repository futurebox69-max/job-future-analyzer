# BTS 분석 MVP 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 통찰력 검사 1개 → 무료 결과 → 12,900원 심층 리포트 결제까지의 최소 MVP를 구현한다.

**Architecture:** 기존 Next.js 16 앱(`job-future-analyzer`)에 `/bts` 라우트 그룹을 추가한다. 비즈니스 로직(점수 산출, 유형 분류)은 `src/lib/bts/`에 순수 함수로 분리하여 테스트 가능하게 만든다. 기존 Supabase Auth(Google OAuth)와 AuthContext를 그대로 재활용한다.

**Tech Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Supabase Auth + PostgreSQL · Claude API (`@anthropic-ai/sdk`) · Vitest · 토스페이먼츠 SDK

**Spec:** `docs/superpowers/specs/2026-04-15-bts-analysis-mvp-strategy.md`

---

## 파일 구조

### 새로 만들 파일

```
src/
├── lib/bts/
│   ├── types.ts              # BTS 분석 전용 타입 정의
│   ├── constants.ts          # 등급, 가격, 설정값
│   ├── questions.ts          # 통찰력 검사 6문항 데이터
│   ├── scoring.ts            # 점수 산출 알고리즘 (A-1)
│   ├── classify.ts           # 5유형 분류 로직 (A-2)
│   ├── copy.ts               # 유형별 결과 카피 텍스트
│   └── report-prompt.ts      # Claude 심층 리포트 프롬프트 (A-6)
│
├── app/bts/
│   ├── layout.tsx            # BTS 분석 전용 레이아웃
│   ├── page.tsx              # 랜딩 페이지 (화면 1)
│   ├── profile/page.tsx      # 프로필 입력 (화면 3, 로그인 포함)
│   ├── test/page.tsx         # 검사 진행 (화면 4)
│   ├── result/page.tsx       # 무료 결과 (화면 5)
│   ├── report/page.tsx       # 심층 리포트 소개 + 결제 (화면 6-7)
│   └── report/view/page.tsx  # 결제 완료 + 리포트 표시 (화면 8)
│
├── app/api/bts/
│   ├── submit/route.ts       # 검사 제출 → 점수 계산 → DB 저장
│   ├── report/route.ts       # Claude 심층 리포트 생성
│   └── payment/
│       └── confirm/route.ts  # 토스페이먼츠 결제 승인
│
├── components/bts/
│   ├── InsightQuestionCard.tsx  # 패턴/예측 공용 문항 컴포넌트
│   ├── TestProgress.tsx      # 진행 바 + 타이머
│   ├── FreeResult.tsx        # 무료 결과 표시
│   ├── LockedPreview.tsx     # 블러 잠금 섹션
│   ├── PaidReport.tsx        # 심층 리포트 전체 표시
│   └── ProfileForm.tsx       # 프로필 입력 폼
│
└── __tests__/bts/
    ├── scoring.test.ts       # 점수 산출 테스트
    ├── classify.test.ts      # 유형 분류 테스트
    └── copy.test.ts          # 카피 생성 테스트
```

### 수정할 파일

```
vitest.config.ts              # 새로 생성 (테스트 인프라)
package.json                  # vitest, @tosspayments/tosspayments-sdk 추가
.env.local                    # TOSS_SECRET_KEY, TOSS_CLIENT_KEY 추가
```

---

## Task 1: 테스트 인프라 셋업

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Vitest 설치**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 2: vitest.config.ts 생성**

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/__tests__/**/*.test.ts', 'src/__tests__/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: package.json에 test 스크립트 추가**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 4: 동작 확인**

Run: `npm test`
Expected: "No test files found" (정상 — 아직 테스트 없음)

- [ ] **Step 5: 커밋**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add vitest test infrastructure"
```

---

## Task 2: BTS 타입·상수 정의

**Files:**
- Create: `src/lib/bts/types.ts`
- Create: `src/lib/bts/constants.ts`

- [ ] **Step 1: types.ts 작성**

```typescript
// src/lib/bts/types.ts

/** 통찰력 하위 점수 */
export interface InsightSubScores {
  understand: number  // 이해력 0-100
  analyze: number     // 분석력 0-100
  predict: number     // 예측력 0-100
}

/** 통찰력 전용 5유형 */
export type InsightType =
  | '균형 통찰형'
  | '예측 우위형'
  | '분석 우위형'
  | '이해 우위형'
  | '성장 필요형'

/** 등급 */
export type GradeKey = 'very_high' | 'high' | 'normal' | 'caution' | 'needs_work'

/** 사용자 프로필 */
export interface BtsProfile {
  gender: 'male' | 'female' | 'other'
  ageGroup: '10s' | '20s' | '30s' | '40s' | '50s' | '60plus'
  occupation: string
}

/** 문항 선택지 */
export interface QuestionOption {
  id: string       // 'A' | 'B' | 'C' | 'D'
  text: string
  score: number    // 0, 40, 60, 70, 100
}

/** 문항 */
export interface InsightQuestion {
  id: string                         // 'p1', 'p2', 'p3', 'f1', 'f2', 'f3'
  type: 'pattern' | 'prediction'
  subScore: 'understand' | 'analyze' | 'predict'
  prompt: string                     // 상황 제시
  question: string                   // 질문
  options: QuestionOption[]
  timeLimitSeconds: number           // 45 or 60
}

/** 사용자 응답 */
export interface UserAnswer {
  questionId: string
  selectedOptionId: string
  score: number
  timeSpentSeconds: number
}

/** 검사 결과 */
export interface InsightResult {
  subScores: InsightSubScores
  totalScore: number
  grade: GradeKey
  insightType: InsightType
  answers: UserAnswer[]
  profile: BtsProfile
}

/** 심층 리포트 */
export interface DeepReport {
  structureAnalysis: string    // 통찰 구조 해석
  weaknesses: string[]         // 핵심 약점 3개
  futureRisks: string[]        // 미래 위험 3개
  trainingPoints: string[]     // 훈련 포인트 3개
  actionSuggestion: string     // 핵심 행동 제안
}

/** DB 저장용 검사 기록 */
export interface AssessmentRecord {
  id?: string
  user_id: string
  profile: BtsProfile
  sub_scores: InsightSubScores
  total_score: number
  grade: GradeKey
  insight_type: InsightType
  answers: UserAnswer[]
  created_at?: string
}

/** DB 저장용 구매 기록 */
export interface PurchaseRecord {
  id?: string
  user_id: string
  assessment_id: string
  product_type: 'deep_report'
  amount: number
  payment_key: string
  status: 'pending' | 'completed' | 'refunded'
  created_at?: string
}
```

- [ ] **Step 2: constants.ts 작성**

```typescript
// src/lib/bts/constants.ts
import type { GradeKey } from './types'

/** 등급 기준 (백분위 표현 없음) */
export const GRADES: Record<GradeKey, { min: number; max: number; label: string; display: string }> = {
  very_high: { min: 85, max: 100, label: '매우 높음', display: '통찰력이 매우 높습니다' },
  high:      { min: 70, max: 84,  label: '높음',     display: '통찰력이 높은 편입니다' },
  normal:    { min: 50, max: 69,  label: '보통',     display: '보통 수준입니다' },
  caution:   { min: 30, max: 49,  label: '주의 필요', display: '보완이 필요한 영역이 있습니다' },
  needs_work:{ min: 0,  max: 29,  label: '보완 필요', display: '집중적인 보완이 필요합니다' },
}

/** 유형별 이모지 */
export const TYPE_EMOJI: Record<string, string> = {
  '균형 통찰형': '🧠',
  '예측 우위형': '🔮',
  '분석 우위형': '🔍',
  '이해 우위형': '📖',
  '성장 필요형': '🌱',
}

/** 가격 */
export const PRICES = {
  DEEP_REPORT: 12_900,
  NINETY_DAY_PLAN: 29_000,  // Phase 1.5
} as const

/** 검사 설정 */
export const TEST_CONFIG = {
  PATTERN_TIME_LIMIT: 45,
  PREDICTION_TIME_LIMIT: 60,
  TOTAL_QUESTIONS: 6,
} as const
```

- [ ] **Step 3: 커밋**

```bash
git add src/lib/bts/types.ts src/lib/bts/constants.ts
git commit -m "feat(bts): add type definitions and constants"
```

---

## Task 3: 통찰력 검사 6문항 데이터

**Files:**
- Create: `src/lib/bts/questions.ts`

- [ ] **Step 1: questions.ts 작성 — 패턴 발견 3문항 + 미래 예측 3문항**

```typescript
// src/lib/bts/questions.ts
import type { InsightQuestion } from './types'
import { TEST_CONFIG } from './constants'

/**
 * 통찰력 검사 6문항 (범용, 테마팩 없음)
 *
 * 패턴 발견 (p1-p3): 데이터에서 규칙 찾기
 * - p1 → 이해력 (정보 파악)
 * - p2 → 이해력 (정보 파악)
 * - p3 → 분석력 (규칙 추출)
 *
 * 미래 예측 (f1-f3): 트렌드에서 다음 상황 예측
 * - f1 → 분석력 (데이터 근거)
 * - f2 → 예측력 (미래 방향)
 * - f3 → 예측력 (미래 방향)
 */
export const INSIGHT_QUESTIONS: InsightQuestion[] = [
  // ── 패턴 발견 1: 매출 데이터 패턴 (이해력) ──
  {
    id: 'p1',
    type: 'pattern',
    subScore: 'understand',
    prompt: '한 카페의 최근 6개월 매출 변화입니다:\n1월: 320만 → 2월: 280만 → 3월: 350만 → 4월: 290만 → 5월: 370만 → 6월: 300만',
    question: '이 데이터에서 읽을 수 있는 핵심 정보는?',
    options: [
      { id: 'A', text: '매출이 꾸준히 하락하고 있다', score: 0 },
      { id: 'B', text: '홀수 달에 오르고 짝수 달에 내리는 패턴이 반복되며, 전체적으로 소폭 상승 중이다', score: 100 },
      { id: 'C', text: '매출 변화에 특별한 패턴이 없다', score: 0 },
      { id: 'D', text: '3월 이후 꾸준히 상승 중이다', score: 60 },
    ],
    timeLimitSeconds: TEST_CONFIG.PATTERN_TIME_LIMIT,
  },

  // ── 패턴 발견 2: 이직률 데이터 (이해력) ──
  {
    id: 'p2',
    type: 'pattern',
    subScore: 'understand',
    prompt: '한 회사의 부서별 이직률입니다:\n영업팀: 25% → 개발팀: 8% → 마케팅: 22% → 인사팀: 6% → 고객지원: 28% → 재무팀: 5%',
    question: '이 데이터에서 가장 중요한 패턴은?',
    options: [
      { id: 'A', text: '모든 부서의 이직률이 높은 편이다', score: 0 },
      { id: 'B', text: '외부 고객을 직접 대면하는 부서일수록 이직률이 높다', score: 100 },
      { id: 'C', text: '이직률은 부서 규모에 따라 달라진다', score: 0 },
      { id: 'D', text: '영업팀과 고객지원팀의 이직률만 유독 높다', score: 60 },
    ],
    timeLimitSeconds: TEST_CONFIG.PATTERN_TIME_LIMIT,
  },

  // ── 패턴 발견 3: 기술 채택 주기 (분석력) ──
  {
    id: 'p3',
    type: 'pattern',
    subScore: 'analyze',
    prompt: '새로운 기술이 등장했을 때, 기업들의 도입 속도를 관찰했습니다:\n클라우드: 발표 후 7년 → 50% 채택\n스마트폰: 발표 후 5년 → 50% 채택\n생성형 AI: 발표 후 2년 → 50% 채택',
    question: '이 데이터에서 추출할 수 있는 규칙은?',
    options: [
      { id: 'A', text: '기술마다 채택 속도가 다르므로 규칙은 없다', score: 0 },
      { id: 'B', text: '새로운 기술일수록 초기 도입 비용이 낮아 채택이 빠르다', score: 60 },
      { id: 'C', text: '기술 채택 주기가 점점 빨라지고 있으며, 이 가속 추세 자체가 규칙이다', score: 100 },
      { id: 'D', text: '50% 채택까지 항상 비슷한 시간이 걸린다', score: 0 },
    ],
    timeLimitSeconds: TEST_CONFIG.PATTERN_TIME_LIMIT,
  },

  // ── 미래 예측 1: 원격근무 트렌드 (분석력) ──
  {
    id: 'f1',
    type: 'prediction',
    subScore: 'analyze',
    prompt: '한 IT 기업의 원격근무 비율 변화입니다:\n2020: 10% → 2021: 80% → 2022: 60% → 2023: 45% → 2024: 40% → 2025: 38%',
    question: '이 흐름이 계속된다면, 2027년 원격근무 비율에 대해 가장 근거가 탄탄한 판단은?',
    options: [
      { id: 'A', text: '완전 출근으로 돌아가 5% 이하가 된다', score: 0 },
      { id: 'B', text: '하락 속도가 점점 줄어들고 있으므로 30~35% 부근에서 안정화된다', score: 100 },
      { id: 'C', text: '다시 상승해 60% 이상이 된다', score: 0 },
      { id: 'D', text: '계속 비슷한 속도로 떨어져 20% 부근이 된다', score: 70 },
    ],
    timeLimitSeconds: TEST_CONFIG.PREDICTION_TIME_LIMIT,
  },

  // ── 미래 예측 2: 동네 상권 변화 (예측력) ──
  {
    id: 'f2',
    type: 'prediction',
    subScore: 'predict',
    prompt: '한 동네에서 최근 3년간 일어난 변화입니다:\n- 대형 프랜차이즈 카페 3곳 입점\n- 1인 가구 비율 15% → 28%\n- 배달 주문 비율 20% → 55%\n- 동네 빵집·정육점 5곳 → 2곳으로 감소',
    question: '이 동네에서 3년 후 가장 일어날 가능성이 높은 변화는?',
    options: [
      { id: 'A', text: '전통 상점들이 다시 돌아와 상권이 회복된다', score: 0 },
      { id: 'B', text: '배달 전문 매장·공유 주방이 늘고, 체험형 매장만 오프라인으로 생존한다', score: 100 },
      { id: 'C', text: '대형 프랜차이즈가 더 늘어나 상권이 활성화된다', score: 40 },
      { id: 'D', text: '1인 가구가 늘면 오히려 동네 커뮤니티 공간 수요가 생긴다', score: 70 },
    ],
    timeLimitSeconds: TEST_CONFIG.PREDICTION_TIME_LIMIT,
  },

  // ── 미래 예측 3: AI와 일자리 (예측력) ──
  {
    id: 'f3',
    type: 'prediction',
    subScore: 'predict',
    prompt: '최근 5년간 관찰된 변화입니다:\n- AI 번역기 정확도: 70% → 95%\n- 전문 번역가 수요: 100 → 40 (60% 감소)\n- AI 번역 후 교정 전문가 수요: 0 → 80 (신규 직종)\n- 번역 시장 전체 거래량: 100 → 250 (2.5배 성장)',
    question: '이 패턴이 다른 전문직(회계, 법률 문서 검토 등)에도 적용된다면, 가장 근거가 탄탄한 예측은?',
    options: [
      { id: 'A', text: 'AI가 전문직을 완전히 대체해 해당 직업이 사라진다', score: 0 },
      { id: 'B', text: '기존 전문가 수요는 줄지만, AI 결과물을 검증·보완하는 새 역할이 생기고, 전체 시장은 커진다', score: 100 },
      { id: 'C', text: '전문직은 AI의 영향을 거의 받지 않는다', score: 0 },
      { id: 'D', text: '전문가 수요가 줄어 시장 전체가 축소된다', score: 40 },
    ],
    timeLimitSeconds: TEST_CONFIG.PREDICTION_TIME_LIMIT,
  },
]
```

- [ ] **Step 2: 커밋**

```bash
git add src/lib/bts/questions.ts
git commit -m "feat(bts): add 6 insight test questions"
```

---

## Task 4: 점수 산출 엔진 (TDD)

**Files:**
- Create: `src/__tests__/bts/scoring.test.ts`
- Create: `src/lib/bts/scoring.ts`

- [ ] **Step 1: 테스트 작성**

```typescript
// src/__tests__/bts/scoring.test.ts
import { describe, it, expect } from 'vitest'
import { calculateSubScores, calculateTotalScore, getGrade } from '@/lib/bts/scoring'
import type { UserAnswer } from '@/lib/bts/types'

describe('calculateSubScores', () => {
  it('이해력 = (p1 + p2) / 2', () => {
    const answers: UserAnswer[] = [
      { questionId: 'p1', selectedOptionId: 'B', score: 100, timeSpentSeconds: 20 },
      { questionId: 'p2', selectedOptionId: 'B', score: 100, timeSpentSeconds: 25 },
      { questionId: 'p3', selectedOptionId: 'C', score: 100, timeSpentSeconds: 30 },
      { questionId: 'f1', selectedOptionId: 'B', score: 100, timeSpentSeconds: 40 },
      { questionId: 'f2', selectedOptionId: 'B', score: 100, timeSpentSeconds: 45 },
      { questionId: 'f3', selectedOptionId: 'B', score: 100, timeSpentSeconds: 50 },
    ]
    const sub = calculateSubScores(answers)
    expect(sub.understand).toBe(100)
    expect(sub.analyze).toBe(100)
    expect(sub.predict).toBe(100)
  })

  it('부분 점수 정확히 계산', () => {
    const answers: UserAnswer[] = [
      { questionId: 'p1', selectedOptionId: 'D', score: 60, timeSpentSeconds: 20 },
      { questionId: 'p2', selectedOptionId: 'B', score: 100, timeSpentSeconds: 25 },
      { questionId: 'p3', selectedOptionId: 'B', score: 60, timeSpentSeconds: 30 },
      { questionId: 'f1', selectedOptionId: 'D', score: 70, timeSpentSeconds: 40 },
      { questionId: 'f2', selectedOptionId: 'D', score: 70, timeSpentSeconds: 45 },
      { questionId: 'f3', selectedOptionId: 'D', score: 40, timeSpentSeconds: 50 },
    ]
    const sub = calculateSubScores(answers)
    expect(sub.understand).toBe(80)    // (60 + 100) / 2
    expect(sub.analyze).toBe(65)       // (60 + 70) / 2
    expect(sub.predict).toBe(55)       // (70 + 40) / 2
  })
})

describe('calculateTotalScore', () => {
  it('종합 = (이해 + 분석 + 예측) / 3, 소수점 반올림', () => {
    expect(calculateTotalScore({ understand: 81, analyze: 68, predict: 55 })).toBe(68)
  })

  it('만점 = 100', () => {
    expect(calculateTotalScore({ understand: 100, analyze: 100, predict: 100 })).toBe(100)
  })

  it('0점 = 0', () => {
    expect(calculateTotalScore({ understand: 0, analyze: 0, predict: 0 })).toBe(0)
  })
})

describe('getGrade', () => {
  it('85 이상 → very_high', () => {
    expect(getGrade(85)).toBe('very_high')
    expect(getGrade(100)).toBe('very_high')
  })

  it('70-84 → high', () => {
    expect(getGrade(70)).toBe('high')
    expect(getGrade(84)).toBe('high')
  })

  it('50-69 → normal', () => {
    expect(getGrade(50)).toBe('normal')
    expect(getGrade(69)).toBe('normal')
  })

  it('30-49 → caution', () => {
    expect(getGrade(30)).toBe('caution')
    expect(getGrade(49)).toBe('caution')
  })

  it('0-29 → needs_work', () => {
    expect(getGrade(0)).toBe('needs_work')
    expect(getGrade(29)).toBe('needs_work')
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `npx vitest run src/__tests__/bts/scoring.test.ts`
Expected: FAIL — 모듈 없음

- [ ] **Step 3: scoring.ts 구현**

```typescript
// src/lib/bts/scoring.ts
import type { UserAnswer, InsightSubScores, GradeKey } from './types'
import { INSIGHT_QUESTIONS } from './questions'

/**
 * 사용자 응답으로부터 이해/분석/예측 하위 점수를 계산한다.
 *
 * 각 문항은 하나의 하위 점수에 매핑된다 (questions.ts의 subScore 필드).
 * 하위 점수 = 해당 문항들의 점수 평균
 */
export function calculateSubScores(answers: UserAnswer[]): InsightSubScores {
  const groups: Record<string, number[]> = {
    understand: [],
    analyze: [],
    predict: [],
  }

  for (const answer of answers) {
    const question = INSIGHT_QUESTIONS.find(q => q.id === answer.questionId)
    if (!question) continue
    groups[question.subScore].push(answer.score)
  }

  return {
    understand: average(groups.understand),
    analyze: average(groups.analyze),
    predict: average(groups.predict),
  }
}

/**
 * 종합 점수 = (이해 + 분석 + 예측) / 3, 반올림
 */
export function calculateTotalScore(sub: InsightSubScores): number {
  return Math.round((sub.understand + sub.analyze + sub.predict) / 3)
}

/**
 * 점수 → 등급 변환
 */
export function getGrade(score: number): GradeKey {
  if (score >= 85) return 'very_high'
  if (score >= 70) return 'high'
  if (score >= 50) return 'normal'
  if (score >= 30) return 'caution'
  return 'needs_work'
}

function average(arr: number[]): number {
  if (arr.length === 0) return 0
  return Math.round(arr.reduce((sum, v) => sum + v, 0) / arr.length)
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `npx vitest run src/__tests__/bts/scoring.test.ts`
Expected: PASS — 모든 테스트 통과

- [ ] **Step 5: 커밋**

```bash
git add src/__tests__/bts/scoring.test.ts src/lib/bts/scoring.ts
git commit -m "feat(bts): add scoring engine with tests (TDD)"
```

---

## Task 5: 유형 분류 엔진 (TDD)

**Files:**
- Create: `src/__tests__/bts/classify.test.ts`
- Create: `src/lib/bts/classify.ts`

- [ ] **Step 1: 테스트 작성**

```typescript
// src/__tests__/bts/classify.test.ts
import { describe, it, expect } from 'vitest'
import { classifyInsightType } from '@/lib/bts/classify'

describe('classifyInsightType', () => {
  it('세 점수 모두 70+ AND 편차 ≤ 15 → 균형 통찰형', () => {
    expect(classifyInsightType({ understand: 80, analyze: 75, predict: 72 })).toBe('균형 통찰형')
    expect(classifyInsightType({ understand: 85, analyze: 85, predict: 85 })).toBe('균형 통찰형')
  })

  it('예측력이 최고 AND 70+ AND 편차 ≥ 20 → 예측 우위형', () => {
    expect(classifyInsightType({ understand: 50, analyze: 60, predict: 80 })).toBe('예측 우위형')
  })

  it('분석력이 최고 AND 70+ AND 편차 ≥ 20 → 분석 우위형', () => {
    expect(classifyInsightType({ understand: 50, analyze: 80, predict: 55 })).toBe('분석 우위형')
  })

  it('이해력이 최고 AND 70+ AND 편차 ≥ 20 → 이해 우위형', () => {
    expect(classifyInsightType({ understand: 81, analyze: 68, predict: 55 })).toBe('이해 우위형')
  })

  it('모두 70 미만 → 성장 필요형', () => {
    expect(classifyInsightType({ understand: 40, analyze: 45, predict: 35 })).toBe('성장 필요형')
  })

  it('모두 70+ 이지만 편차 > 15 → 가장 높은 점수 기준 우위형', () => {
    expect(classifyInsightType({ understand: 70, analyze: 90, predict: 72 })).toBe('분석 우위형')
  })

  it('편차 < 20이고 70 미만 섞여 있으면 → 성장 필요형', () => {
    expect(classifyInsightType({ understand: 55, analyze: 60, predict: 50 })).toBe('성장 필요형')
  })

  it('동점일 때 예측 > 분석 > 이해 우선순위', () => {
    // predict와 analyze 둘 다 최고점, 둘 다 70+, 편차 ≥ 20
    expect(classifyInsightType({ understand: 50, analyze: 80, predict: 80 })).toBe('예측 우위형')
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `npx vitest run src/__tests__/bts/classify.test.ts`
Expected: FAIL

- [ ] **Step 3: classify.ts 구현**

```typescript
// src/lib/bts/classify.ts
import type { InsightSubScores, InsightType } from './types'

/**
 * 통찰력 3개 하위 점수로 5유형 중 하나를 분류한다.
 *
 * 우선순위:
 * 1. 균형 통찰형: 모두 70+ AND 편차 ≤ 15
 * 2. 예측 우위형: 예측 최고 AND 70+ AND 편차 ≥ 20
 * 3. 분석 우위형: 분석 최고 AND 70+ AND 편차 ≥ 20
 * 4. 이해 우위형: 이해 최고 AND 70+ AND 편차 ≥ 20
 * 5. 성장 필요형: 위 조건 모두 불충족
 */
export function classifyInsightType(sub: InsightSubScores): InsightType {
  const scores = [sub.understand, sub.analyze, sub.predict]
  const maxScore = Math.max(...scores)
  const minScore = Math.min(...scores)
  const gap = maxScore - minScore

  // 우선순위 1: 균형 통찰형
  if (scores.every(s => s >= 70) && gap <= 15) {
    return '균형 통찰형'
  }

  // 우선순위 2-4: 우위형 (예측 → 분석 → 이해 순)
  const dimensions: { key: keyof InsightSubScores; type: InsightType }[] = [
    { key: 'predict',    type: '예측 우위형' },
    { key: 'analyze',    type: '분석 우위형' },
    { key: 'understand', type: '이해 우위형' },
  ]

  for (const { key, type } of dimensions) {
    if (sub[key] >= maxScore && sub[key] >= 70 && (sub[key] - minScore) >= 20) {
      return type
    }
  }

  // 우선순위 5: 성장 필요형
  return '성장 필요형'
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `npx vitest run src/__tests__/bts/classify.test.ts`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/__tests__/bts/classify.test.ts src/lib/bts/classify.ts
git commit -m "feat(bts): add 5-type classification engine with tests (TDD)"
```

---

## Task 6: 결과 카피 데이터

**Files:**
- Create: `src/lib/bts/copy.ts`
- Create: `src/__tests__/bts/copy.test.ts`

- [ ] **Step 1: 테스트 작성**

```typescript
// src/__tests__/bts/copy.test.ts
import { describe, it, expect } from 'vitest'
import { getResultCopy } from '@/lib/bts/copy'

describe('getResultCopy', () => {
  it('이해 우위형 카피 반환', () => {
    const copy = getResultCopy('이해 우위형')
    expect(copy.subtitle).toContain('정보는 빠르게 파악')
    expect(copy.strength).toBeTruthy()
    expect(copy.caution).toBeTruthy()
    expect(copy.punchline).toBeTruthy()
  })

  it('5유형 모두 카피가 존재', () => {
    const types = ['균형 통찰형', '예측 우위형', '분석 우위형', '이해 우위형', '성장 필요형'] as const
    for (const t of types) {
      const copy = getResultCopy(t)
      expect(copy.subtitle.length).toBeGreaterThan(0)
      expect(copy.strength.length).toBeGreaterThan(0)
      expect(copy.caution.length).toBeGreaterThan(0)
      expect(copy.punchline.length).toBeGreaterThan(0)
    }
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `npx vitest run src/__tests__/bts/copy.test.ts`
Expected: FAIL

- [ ] **Step 3: copy.ts 구현**

```typescript
// src/lib/bts/copy.ts
import type { InsightType } from './types'

export interface ResultCopy {
  subtitle: string
  strength: string
  caution: string
  punchline: string
}

const COPY_MAP: Record<InsightType, ResultCopy> = {
  '이해 우위형': {
    subtitle: '정보는 빠르게 파악하지만, 패턴과 흐름을 읽는 데 시간이 걸리는 타입',
    strength: '복잡한 정보가 들어와도 핵심을 빠르게 잡아냅니다. 회의에서 "그래서 요점이 뭔데?"를 남들보다 먼저 떠올립니다.',
    caution: '지금 보이는 것에는 강하지만, "이게 6개월 후에 어떻게 되지?"를 미리 읽는 힘은 아직 약합니다.',
    punchline: '지금은 \'이해하는 사람\'입니다. \'예측하는 사람\'이 되면 바뀝니다.',
  },
  '분석 우위형': {
    subtitle: '데이터는 잘 읽지만, 다음 흐름을 먼저 상상하는 데 시간이 걸리는 타입',
    strength: '흩어진 데이터에서 규칙과 패턴을 찾아내는 힘이 강합니다. 보고서를 읽으면 핵심은 금방 잡습니다.',
    caution: '데이터는 잘 읽습니다. 하지만 그 데이터가 가리키는 방향을 먼저 읽는 힘은 아직 자라는 중입니다.',
    punchline: '지금은 \'분석하는 사람\'입니다. \'예측하는 사람\'이 되면 완성됩니다.',
  },
  '예측 우위형': {
    subtitle: '큰 흐름을 읽는 힘이 강하지만, 디테일을 놓칠 수 있는 타입',
    strength: '큰 흐름은 잘 읽습니다. 변화의 방향을 먼저 감지하고, 다음 국면을 상상하는 힘이 있습니다.',
    caution: '미래를 상상하는 힘은 강하지만, 세부 정보를 꼼꼼히 확인하지 않아 \'느낌은 맞는데 근거가 약한\' 판단을 할 때가 있습니다.',
    punchline: '직감이 강점입니다. 근거를 보강하면 정확한 예측이 됩니다.',
  },
  '균형 통찰형': {
    subtitle: '이해·분석·예측이 고르게 강한 타입',
    strength: '이해·분석·예측이 고르게 발달해 있습니다. 정보를 파악하고, 패턴을 찾고, 다음을 예측하는 흐름이 자연스럽습니다.',
    caution: '고르게 강한 만큼, 특정 영역에서 압도적으로 뛰어나지는 않을 수 있습니다. 강점을 더 키우면 차별화됩니다.',
    punchline: '통찰의 균형이 잡혀 있습니다. 이 균형을 유지하면서 깊이를 더하세요.',
  },
  '성장 필요형': {
    subtitle: '통찰력의 잠재력은 있지만, 아직 뚜렷한 강점이 형성되지 않은 타입',
    strength: '아직 통찰력의 뚜렷한 강점이 형성되지 않았습니다. 하지만 이건 \'약하다\'가 아니라 \'아직 훈련되지 않았다\'입니다.',
    caution: '뉴스를 보고 \'그래서 뭐?\'가 바로 떠오르지 않는다면, 통찰력이 자라는 중이라는 뜻입니다.',
    punchline: '지금 점수는 출발점입니다. 통찰력은 타고나는 것이 아니라 키우는 것입니다.',
  },
}

export function getResultCopy(type: InsightType): ResultCopy {
  return COPY_MAP[type]
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `npx vitest run src/__tests__/bts/copy.test.ts`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/__tests__/bts/copy.test.ts src/lib/bts/copy.ts
git commit -m "feat(bts): add result copy per insight type with tests"
```

---

## Task 7: Supabase DB 스키마

**Files:**
- Create: (Supabase 대시보드에서 SQL 실행)

> ⚠️ 이 태스크는 Supabase 대시보드 SQL Editor에서 직접 실행한다.
> 프로젝트 URL: `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL` 참조

- [ ] **Step 1: bts_assessments 테이블 생성**

```sql
-- BTS 분석 검사 기록
CREATE TABLE bts_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile JSONB NOT NULL,            -- { gender, ageGroup, occupation }
  sub_scores JSONB NOT NULL,         -- { understand, analyze, predict }
  total_score INTEGER NOT NULL,
  grade TEXT NOT NULL,
  insight_type TEXT NOT NULL,
  answers JSONB NOT NULL,            -- UserAnswer[]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE bts_assessments ENABLE ROW LEVEL SECURITY;

-- 본인 데이터만 조회/삽입 가능
CREATE POLICY "Users can view own assessments"
  ON bts_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON bts_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_bts_assessments_user ON bts_assessments(user_id);
```

- [ ] **Step 2: bts_purchases 테이블 생성**

```sql
-- BTS 분석 구매 기록
CREATE TABLE bts_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_id UUID REFERENCES bts_assessments(id) NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'deep_report',
  amount INTEGER NOT NULL,            -- 12900
  payment_key TEXT,                    -- 토스페이먼츠 결제키
  order_id TEXT UNIQUE NOT NULL,       -- 주문번호
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | completed | refunded
  report JSONB,                        -- 생성된 리포트 저장
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE bts_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON bts_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
  ON bts_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 주의: status/report 업데이트는 서비스 역할(supabaseAdmin)로만 수행한다.
-- 서비스 역할은 RLS를 자동 우회하므로 별도 UPDATE 정책 불필요.
-- 일반 사용자의 UPDATE는 의도적으로 차단한다.

-- 인덱스
CREATE INDEX idx_bts_purchases_user ON bts_purchases(user_id);
CREATE INDEX idx_bts_purchases_order ON bts_purchases(order_id);
```

- [ ] **Step 3: 테이블 생성 확인**

Supabase 대시보드 → Table Editor에서 `bts_assessments`와 `bts_purchases` 테이블이 보이는지 확인

- [ ] **Step 4: 커밋 (SQL을 파일로 보존)**

```bash
mkdir -p supabase/migrations
cat > supabase/migrations/001_bts_tables.sql << 'SQLEOF'
-- (위의 SQL 전체 복사)
SQLEOF
git add supabase/migrations/001_bts_tables.sql
git commit -m "feat(bts): add DB schema for assessments and purchases"
```

---

## Task 8: BTS 레이아웃 + 랜딩 페이지

**Files:**
- Create: `src/app/bts/layout.tsx`
- Create: `src/app/bts/page.tsx`

- [ ] **Step 1: BTS 전용 레이아웃**

```tsx
// src/app/bts/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BTS 분석 | 나는 미래에 얼마나 준비된 사람인가',
  description: '성격이 아니라 준비 상태를 봅니다. 3분이면 당신의 통찰 구조가 보입니다.',
}

export default function BtsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {children}
    </div>
  )
}
```

- [ ] **Step 2: 랜딩 페이지**

```tsx
// src/app/bts/page.tsx
'use client'

import Link from 'next/link'

export default function BtsLanding() {
  return (
    <main className="max-w-lg mx-auto px-4 py-16 text-center">
      {/* 히어로 */}
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        당신은 미래에 얼마나<br />준비된 사람입니까?
      </h1>
      <p className="text-slate-600 mb-2">
        BTS 분석은 성격을 분류하지 않습니다.
      </p>
      <p className="text-slate-600 mb-8">
        미래 변화에 대한 당신의 준비 상태를 진단합니다.
      </p>

      {/* CTA */}
      <Link
        href="/bts/profile"
        className="inline-block bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-indigo-700 transition-colors"
      >
        내 통찰력 확인하기 →
      </Link>
      <p className="text-sm text-slate-400 mt-3">3분 · 무료 · 6문항</p>

      {/* 신뢰 근거 */}
      <div className="mt-16 bg-slate-50 rounded-xl p-6 text-left">
        <h3 className="font-semibold text-slate-700 mb-3">
          이 검사는 어떻게 만들어졌나요?
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          BTS 분석의 7차원 모델은 세계경제포럼(WEF), OECD, UNESCO 등
          국제 기관이 강조한 미래 핵심 역량을 참고하여 설계한 자체 모델입니다.
          자기 보고가 아니라, 실제 상황에서의 판단과 행동을 측정합니다.
        </p>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: 브라우저 확인**

Run: `npm run dev`
Navigate: `http://localhost:3000/bts`
Expected: 랜딩 페이지 표시, CTA 버튼 존재

- [ ] **Step 4: 커밋**

```bash
git add src/app/bts/layout.tsx src/app/bts/page.tsx
git commit -m "feat(bts): add landing page with hero and trust section"
```

---

## Task 9: 프로필 입력 + 로그인 플로우

**Files:**
- Create: `src/components/bts/ProfileForm.tsx`
- Create: `src/app/bts/profile/page.tsx`

- [ ] **Step 1: ProfileForm 컴포넌트**

```tsx
// src/components/bts/ProfileForm.tsx
'use client'

import { useState } from 'react'
import type { BtsProfile } from '@/lib/bts/types'

interface Props {
  onSubmit: (profile: BtsProfile) => void
}

const AGE_OPTIONS = [
  { value: '10s', label: '10대' },
  { value: '20s', label: '20대' },
  { value: '30s', label: '30대' },
  { value: '40s', label: '40대' },
  { value: '50s', label: '50대' },
  { value: '60plus', label: '60대 이상' },
] as const

export default function ProfileForm({ onSubmit }: Props) {
  const [gender, setGender] = useState<BtsProfile['gender'] | ''>('')
  const [ageGroup, setAgeGroup] = useState<BtsProfile['ageGroup'] | ''>('')
  const [occupation, setOccupation] = useState('')

  const isValid = gender && ageGroup && occupation.trim().length > 0

  const handleSubmit = () => {
    if (!isValid) return
    onSubmit({ gender: gender as BtsProfile['gender'], ageGroup: ageGroup as BtsProfile['ageGroup'], occupation: occupation.trim() })
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500 text-center">
        당신에게 맞는 리포트를 준비합니다.
      </p>

      {/* 성별 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">성별</label>
        <div className="flex gap-3">
          {([['male', '남성'], ['female', '여성'], ['other', '기타']] as const).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setGender(v)}
              className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors ${
                gender === v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* 연령대 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">연령대</label>
        <div className="grid grid-cols-3 gap-2">
          {AGE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setAgeGroup(value)}
              className={`py-3 rounded-lg border text-sm font-medium transition-colors ${
                ageGroup === value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 직업 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">직업</label>
        <input
          type="text"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          placeholder="예: 개발자, 교사, 학생, 자영업..."
          className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
      </div>

      {/* 제출 */}
      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
          isValid ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        검사 시작 →
      </button>
    </div>
  )
}
```

- [ ] **Step 2: 프로필 페이지 (로그인 통합)**

```tsx
// src/app/bts/profile/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import ProfileForm from '@/components/bts/ProfileForm'
import type { BtsProfile } from '@/lib/bts/types'

export default function BtsProfilePage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleLogin = async () => {
    await signInWithGoogle()
  }

  const handleProfileSubmit = (profile: BtsProfile) => {
    // 프로필을 sessionStorage에 임시 저장 → 검사 페이지에서 사용
    sessionStorage.setItem('bts_profile', JSON.stringify(profile))
    router.push('/bts/test')
  }

  if (loading) {
    return (
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-slate-400">로딩 중...</p>
      </main>
    )
  }

  // 미로그인: Google 로그인 화면
  if (!user) {
    return (
      <main className="max-w-lg mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-4">
          로그인
        </h2>
        <p className="text-center text-slate-500 mb-8">
          로그인하면 결과가 저장됩니다.<br />
          시간이 지나도 다시 볼 수 있고, 검사를 추가하면 더 정확해집니다.
        </p>
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-xl py-4 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google로 시작하기
        </button>
      </main>
    )
  }

  // 로그인 완료: 프로필 입력
  return (
    <main className="max-w-lg mx-auto px-4 py-16">
      <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">
        프로필 입력
      </h2>
      <ProfileForm onSubmit={handleProfileSubmit} />
    </main>
  )
}
```

- [ ] **Step 3: 브라우저 확인**

Navigate: `http://localhost:3000/bts/profile`
Expected: 미로그인 시 Google 로그인 버튼, 로그인 후 프로필 폼 표시

- [ ] **Step 4: 커밋**

```bash
git add src/components/bts/ProfileForm.tsx src/app/bts/profile/page.tsx
git commit -m "feat(bts): add profile input with Google login gate"
```

---

## Task 10: 검사 진행 화면

**Files:**
- Create: `src/components/bts/PatternQuestion.tsx`
- Create: `src/components/bts/PredictQuestion.tsx`
- Create: `src/components/bts/TestProgress.tsx`
- Create: `src/app/bts/test/page.tsx`

- [ ] **Step 1: TestProgress 컴포넌트**

```tsx
// src/components/bts/TestProgress.tsx
'use client'

import { useEffect, useState } from 'react'

interface Props {
  current: number        // 0-based
  total: number
  timeLimit: number      // seconds
  onTimeout: () => void
}

export default function TestProgress({ current, total, timeLimit, onTimeout }: Props) {
  const [remaining, setRemaining] = useState(timeLimit)

  useEffect(() => {
    setRemaining(timeLimit)
    const timer = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          onTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [current, timeLimit, onTimeout])

  const pct = ((current + 1) / total) * 100

  return (
    <div className="mb-6">
      {/* 진행 바 */}
      <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
        <span>{current + 1} / {total}</span>
        <span className={remaining <= 10 ? 'text-red-500 font-bold' : ''}>{remaining}초</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 공통 문항 컴포넌트 (패턴 + 예측 겸용)**

```tsx
// src/components/bts/InsightQuestionCard.tsx
'use client'

import { useState } from 'react'
import type { InsightQuestion, QuestionOption } from '@/lib/bts/types'

interface Props {
  question: InsightQuestion
  onAnswer: (option: QuestionOption, timeSpent: number) => void
  startTime: number  // Date.now()
}

export default function InsightQuestionCard({ question, onAnswer, startTime }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (opt: QuestionOption) => {
    if (selected) return  // 중복 선택 방지
    setSelected(opt.id)
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    // 잠깐 시각적 피드백 후 전환
    setTimeout(() => onAnswer(opt, timeSpent), 400)
  }

  return (
    <div className="space-y-6">
      {/* 상황 제시 */}
      <div className="bg-slate-50 rounded-xl p-5">
        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
          {question.prompt}
        </p>
      </div>

      {/* 질문 */}
      <p className="font-semibold text-slate-900">{question.question}</p>

      {/* 선택지 */}
      <div className="space-y-3">
        {question.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleSelect(opt)}
            disabled={selected !== null}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
              selected === opt.id
                ? 'bg-indigo-600 text-white border-indigo-600'
                : selected !== null
                  ? 'bg-slate-50 text-slate-400 border-slate-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
            }`}
          >
            <span className="font-semibold mr-2">{opt.id})</span>
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 검사 진행 페이지**

```tsx
// src/app/bts/test/page.tsx
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import TestProgress from '@/components/bts/TestProgress'
import InsightQuestionCard from '@/components/bts/InsightQuestionCard'
import { INSIGHT_QUESTIONS } from '@/lib/bts/questions'
import type { UserAnswer, QuestionOption } from '@/lib/bts/types'

export default function BtsTestPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<UserAnswer[]>([])
  const startTimeRef = useRef(Date.now())

  // 프로필 확인
  useEffect(() => {
    const profile = sessionStorage.getItem('bts_profile')
    if (!profile || !user) {
      router.replace('/bts/profile')
    }
  }, [user, router])

  const question = INSIGHT_QUESTIONS[currentIdx]

  const handleAnswer = useCallback((opt: QuestionOption, timeSpent: number) => {
    const answer: UserAnswer = {
      questionId: question.id,
      selectedOptionId: opt.id,
      score: opt.score,
      timeSpentSeconds: timeSpent,
    }

    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)

    if (currentIdx + 1 < INSIGHT_QUESTIONS.length) {
      setCurrentIdx(prev => prev + 1)
      startTimeRef.current = Date.now()
    } else {
      // 검사 완료 → 결과 계산 API 호출
      submitTest(newAnswers)
    }
  }, [currentIdx, answers, question])

  // handleAnswer를 ref로 감싸서 TestProgress의 onTimeout이 항상 최신 핸들러를 호출하게 함
  const handleAnswerRef = useRef(handleAnswer)
  handleAnswerRef.current = handleAnswer

  const questionRef = useRef(question)
  questionRef.current = question

  const handleTimeout = useCallback(() => {
    // 시간 초과 → 0점 처리
    handleAnswerRef.current({ id: 'TIMEOUT', text: '', score: 0 }, questionRef.current.timeLimitSeconds)
  }, [])

  const submitTest = async (finalAnswers: UserAnswer[]) => {
    const profile = JSON.parse(sessionStorage.getItem('bts_profile') || '{}')

    const res = await fetch('/api/bts/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: finalAnswers, profile, userId: user?.id }),
    })

    if (res.ok) {
      const { assessmentId } = await res.json()
      router.push(`/bts/result?id=${assessmentId}`)
    }
  }

  if (!question) return null

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <TestProgress
        current={currentIdx}
        total={INSIGHT_QUESTIONS.length}
        timeLimit={question.timeLimitSeconds}
        onTimeout={handleTimeout}
      />
      <InsightQuestionCard
        key={question.id}
        question={question}
        onAnswer={handleAnswer}
        startTime={startTimeRef.current}
      />
    </main>
  )
}
```

- [ ] **Step 4: 브라우저 확인**

Navigate: `http://localhost:3000/bts/test` (프로필 입력 후)
Expected: 6문항 순서대로 진행, 타이머 표시, 선택 시 자동 전환

- [ ] **Step 5: 커밋**

```bash
git add src/components/bts/TestProgress.tsx src/components/bts/InsightQuestionCard.tsx src/app/bts/test/page.tsx
git commit -m "feat(bts): add test UI with timer and auto-advance"
```

---

## Task 11: 검사 제출 API + 무료 결과 페이지

**Files:**
**Import 규칙:**
- 서버(API route): `import { createClient } from '@supabase/supabase-js'` + 서비스 키로 admin 클라이언트 생성
- 클라이언트(page/component): `import { createClient } from '@/lib/supabase'` (기존 싱글톤 래퍼 사용)

**Files:**
- Create: `src/app/api/bts/submit/route.ts`
- Create: `src/components/bts/FreeResult.tsx`
- Create: `src/components/bts/LockedPreview.tsx`
- Create: `src/app/bts/result/page.tsx`

- [ ] **Step 1: 검사 제출 API**

```typescript
// src/app/api/bts/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calculateSubScores, calculateTotalScore, getGrade } from '@/lib/bts/scoring'
import { classifyInsightType } from '@/lib/bts/classify'
import type { UserAnswer, BtsProfile } from '@/lib/bts/types'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { answers, profile, userId } = body as {
      answers: UserAnswer[]
      profile: BtsProfile
      userId: string
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 점수 계산
    const subScores = calculateSubScores(answers)
    const totalScore = calculateTotalScore(subScores)
    const grade = getGrade(totalScore)
    const insightType = classifyInsightType(subScores)

    // DB 저장 (서비스 역할로)
    const { data, error } = await supabaseAdmin
      .from('bts_assessments')
      .insert({
        user_id: userId,
        profile,
        sub_scores: subScores,
        total_score: totalScore,
        grade,
        insight_type: insightType,
        answers,
      })
      .select('id')
      .single()

    if (error) {
      console.error('DB insert error:', error)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json({
      assessmentId: data.id,
      subScores,
      totalScore,
      grade,
      insightType,
    })
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

- [ ] **Step 2: FreeResult 컴포넌트**

```tsx
// src/components/bts/FreeResult.tsx
'use client'

import type { InsightSubScores, InsightType, GradeKey } from '@/lib/bts/types'
import { GRADES, TYPE_EMOJI } from '@/lib/bts/constants'
import { getResultCopy } from '@/lib/bts/copy'

interface Props {
  totalScore: number
  grade: GradeKey
  subScores: InsightSubScores
  insightType: InsightType
}

export default function FreeResult({ totalScore, grade, subScores, insightType }: Props) {
  const gradeInfo = GRADES[grade]
  const emoji = TYPE_EMOJI[insightType]
  const copy = getResultCopy(insightType)

  return (
    <div className="space-y-6">
      {/* 종합 점수 */}
      <div className="text-center">
        <p className="text-5xl font-bold text-indigo-600">{totalScore}점</p>
        <p className="text-lg text-slate-500 mt-1">{gradeInfo.label}</p>
      </div>

      {/* 유형 */}
      <div className="bg-indigo-50 rounded-xl p-5 text-center">
        <p className="text-2xl mb-2">{emoji} <span className="font-bold">{insightType}</span></p>
        <p className="text-sm text-slate-600">{copy.subtitle}</p>
      </div>

      {/* 하위 점수 */}
      <div className="flex justify-between px-4">
        {[
          { label: '이해력', value: subScores.understand },
          { label: '분석력', value: subScores.analyze },
          { label: '예측력', value: subScores.predict },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-sm text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* 강점/주의 */}
      <div className="space-y-4">
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-800 mb-1">강점</p>
          <p className="text-sm text-green-700">{copy.strength}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-800 mb-1">주의</p>
          <p className="text-sm text-amber-700">{copy.caution}</p>
        </div>
      </div>

      {/* 핵심 한마디 */}
      <div className="text-center py-4">
        <p className="text-lg font-semibold text-slate-800">{copy.punchline}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: LockedPreview 컴포넌트**

```tsx
// src/components/bts/LockedPreview.tsx
'use client'

import Link from 'next/link'

interface Props {
  assessmentId: string
}

export default function LockedPreview({ assessmentId }: Props) {
  return (
    <div className="mt-8 relative">
      {/* 블러 잠금 영역 */}
      <div className="bg-slate-50 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-white/60 z-10 flex flex-col items-center justify-center">
          <span className="text-2xl mb-2">🔒</span>
          <p className="text-sm font-semibold text-slate-700">심층 해석 잠김</p>
        </div>
        <div className="space-y-3 text-sm text-slate-400">
          <p>• 당신의 예측력이 낮은 이유는...</p>
          <p>• 이 구조가 미래에 만들 수 있는 위험 3가지...</p>
          <p>• 지금 당장 시작할 수 있는 훈련 방향...</p>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/bts/report?id=${assessmentId}`}
        className="block mt-4 w-full text-center bg-indigo-600 text-white font-semibold py-4 rounded-xl hover:bg-indigo-700 transition-colors"
      >
        왜 이런 결과가 나왔는지 알아보기 → 12,900원
      </Link>
    </div>
  )
}
```

- [ ] **Step 4: 무료 결과 페이지**

```tsx
// src/app/bts/result/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import FreeResult from '@/components/bts/FreeResult'
import LockedPreview from '@/components/bts/LockedPreview'
import type { InsightSubScores, InsightType, GradeKey } from '@/lib/bts/types'

interface ResultData {
  total_score: number
  grade: GradeKey
  sub_scores: InsightSubScores
  insight_type: InsightType
}

function ResultContent() {
  const params = useSearchParams()
  const id = params.get('id')
  const [data, setData] = useState<ResultData | null>(null)

  useEffect(() => {
    if (!id) return
    const supabase = createClient()
    supabase
      .from('bts_assessments')
      .select('total_score, grade, sub_scores, insight_type')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setData(data as ResultData)
      })
  }, [id])

  if (!data) {
    return <p className="text-center text-slate-400 py-16">결과를 불러오는 중...</p>
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-xl font-bold text-center text-slate-900 mb-8">
        당신의 통찰력 진단 결과
      </h2>

      <FreeResult
        totalScore={data.total_score}
        grade={data.grade}
        subScores={data.sub_scores}
        insightType={data.insight_type}
      />

      <LockedPreview assessmentId={id!} />
    </main>
  )
}

export default function BtsResultPage() {
  return (
    <Suspense fallback={<p className="text-center text-slate-400 py-16">로딩 중...</p>}>
      <ResultContent />
    </Suspense>
  )
}
```

- [ ] **Step 5: 브라우저에서 전체 플로우 확인**

1. `/bts` → CTA 클릭
2. `/bts/profile` → 로그인 → 프로필 입력
3. `/bts/test` → 6문항 진행
4. `/bts/result?id=xxx` → 무료 결과 + 블러 잠금 표시

- [ ] **Step 6: 커밋**

```bash
git add src/app/api/bts/submit/route.ts src/components/bts/FreeResult.tsx src/components/bts/LockedPreview.tsx src/app/bts/result/page.tsx
git commit -m "feat(bts): add submit API and free result page with locked preview"
```

---

## Task 12: Claude 심층 리포트 프롬프트 + API

**Files:**
- Create: `src/lib/bts/report-prompt.ts`
- Create: `src/app/api/bts/report/route.ts`

- [ ] **Step 1: report-prompt.ts — Claude 프롬프트 생성**

```typescript
// src/lib/bts/report-prompt.ts
import type { InsightResult } from './types'
import { GRADES, TYPE_EMOJI } from './constants'

/**
 * 심층 리포트 생성용 Claude 프롬프트를 구성한다.
 * 스펙: 부록 A-6
 */
export function buildReportPrompt(result: InsightResult): string {
  const gradeInfo = GRADES[result.grade]
  const emoji = TYPE_EMOJI[result.insightType]

  return `당신은 미래역량 진단 전문가입니다.
사용자의 통찰력 검사 결과를 분석하여 심층 리포트를 작성하세요.

## 사용자 프로필
- 성별: ${result.profile.gender === 'male' ? '남성' : result.profile.gender === 'female' ? '여성' : '기타'}
- 연령대: ${result.profile.ageGroup}
- 직업: ${result.profile.occupation}

## 검사 결과
- 종합: ${result.totalScore}점 (${gradeInfo.label})
- 이해력: ${result.subScores.understand}점 / 분석력: ${result.subScores.analyze}점 / 예측력: ${result.subScores.predict}점
- 유형: ${emoji} ${result.insightType}
- 응답 패턴: ${summarizeAnswers(result)}

## 리포트 작성 지침

아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.

{
  "structureAnalysis": "통찰 구조 해석 (150-200자). 왜 이런 점수 패턴이 나왔는지, 어떤 판단 습관이 이 결과를 만들었는지 구조적으로 설명.",
  "weaknesses": ["핵심 약점 1 (50-70자)", "핵심 약점 2", "핵심 약점 3"],
  "futureRisks": ["미래 위험 1 (50-70자, 프로필 맞춤)", "미래 위험 2", "미래 위험 3"],
  "trainingPoints": ["훈련 포인트 1 (구체적 행동, 50-70자)", "훈련 포인트 2", "훈련 포인트 3"],
  "actionSuggestion": "오늘부터 시작할 수 있는 1가지 행동 (80-100자)"
}

## 톤 가이드
- 2인칭 존댓말 ("당신은", "~합니다")
- 학술적이지 않고 직관적으로
- 진단은 정확하게, 제안은 따뜻하게
- 프로필(${result.profile.ageGroup} ${result.profile.occupation})에 맞는 예시 사용
- 금지: "MBTI", "성격", "유형론" 등 성향검사 용어`
}

function summarizeAnswers(result: InsightResult): string {
  return result.answers
    .map(a => `${a.questionId}: ${a.selectedOptionId}(${a.score}점, ${a.timeSpentSeconds}초)`)
    .join(', ')
}
```

- [ ] **Step 2: 리포트 생성 API**

```typescript
// src/app/api/bts/report/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { buildReportPrompt } from '@/lib/bts/report-prompt'
import type { InsightResult, DeepReport } from '@/lib/bts/types'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function getClaudeClient() {
  const apiKey = process.env.JOB_ANALYZER_API_KEY
  if (!apiKey) throw new Error('JOB_ANALYZER_API_KEY not set')
  return new Anthropic({ apiKey })
}

export async function POST(req: NextRequest) {
  try {
    const { assessmentId, purchaseId } = await req.json()

    // 1. 구매 상태 확인
    const { data: purchase } = await supabaseAdmin
      .from('bts_purchases')
      .select('*')
      .eq('id', purchaseId)
      .eq('status', 'completed')
      .single()

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found or not completed' }, { status: 403 })
    }

    // 이미 리포트가 있으면 반환
    if (purchase.report) {
      return NextResponse.json({ report: purchase.report })
    }

    // 2. 검사 결과 조회
    const { data: assessment } = await supabaseAdmin
      .from('bts_assessments')
      .select('*')
      .eq('id', assessmentId)
      .single()

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // 3. Claude로 리포트 생성
    const resultData: InsightResult = {
      subScores: assessment.sub_scores,
      totalScore: assessment.total_score,
      grade: assessment.grade,
      insightType: assessment.insight_type,
      answers: assessment.answers,
      profile: assessment.profile,
    }

    const prompt = buildReportPrompt(resultData)
    const claude = getClaudeClient()

    const response = await claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const report: DeepReport = JSON.parse(text)

    // 4. 리포트를 DB에 저장
    await supabaseAdmin
      .from('bts_purchases')
      .update({ report })
      .eq('id', purchaseId)

    return NextResponse.json({ report })
  } catch (err) {
    console.error('Report generation error:', err)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
```

- [ ] **Step 3: 커밋**

```bash
git add src/lib/bts/report-prompt.ts src/app/api/bts/report/route.ts
git commit -m "feat(bts): add Claude deep report prompt and generation API"
```

---

## Task 13: 토스페이먼츠 결제 연동

**Files:**
- Modify: `package.json` (SDK 설치)
- Modify: `.env.local` (키 추가)
- Create: `src/app/api/bts/payment/confirm/route.ts`
- Create: `src/app/bts/report/page.tsx`

- [ ] **Step 1: SDK 설치 + 환경변수 추가**

```bash
npm install @tosspayments/tosspayments-sdk
```

`.env.local`에 추가 (실제 키는 토스페이먼츠 대시보드에서 발급):
```
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...
```

- [ ] **Step 2: 결제 승인 API**

```typescript
// src/app/api/bts/payment/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PRICES } from '@/lib/bts/constants'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await req.json()

    // 1. 금액 검증
    if (amount !== PRICES.DEEP_REPORT) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // 2. 토스페이먼츠 결제 승인
    const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    })

    if (!tossRes.ok) {
      const errData = await tossRes.json()
      console.error('Toss confirm error:', errData)
      return NextResponse.json({ error: errData.message || 'Payment failed' }, { status: 400 })
    }

    // 3. DB 구매 상태 업데이트
    const { error } = await supabaseAdmin
      .from('bts_purchases')
      .update({ status: 'completed', payment_key: paymentKey })
      .eq('order_id', orderId)

    if (error) {
      console.error('DB update error:', error)
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }

    // 4. 구매 레코드 조회해서 assessmentId, purchaseId 반환
    const { data: purchase } = await supabaseAdmin
      .from('bts_purchases')
      .select('id, assessment_id')
      .eq('order_id', orderId)
      .single()

    return NextResponse.json({
      success: true,
      purchaseId: purchase?.id,
      assessmentId: purchase?.assessment_id,
    })
  } catch (err) {
    console.error('Payment confirm error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

- [ ] **Step 3: 리포트 소개 + 결제 페이지**

```tsx
// src/app/bts/report/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase'
import { PRICES } from '@/lib/bts/constants'

function ReportIntroContent() {
  const params = useSearchParams()
  const assessmentId = params.get('id')
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    if (!user || !assessmentId) return
    setLoading(true)

    try {
      // 1. 주문 레코드 생성
      const orderId = `BTS-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const supabase = createClient()

      await supabase.from('bts_purchases').insert({
        user_id: user.id,
        assessment_id: assessmentId,
        product_type: 'deep_report',
        amount: PRICES.DEEP_REPORT,
        order_id: orderId,
        status: 'pending',
      })

      // 2. 토스페이먼츠 결제창 호출
      const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk')
      const toss = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!)

      const payment = toss.payment({ customerKey: user.id })

      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: PRICES.DEEP_REPORT },
        orderId,
        orderName: '통찰력 심층 리포트',
        successUrl: `${window.location.origin}/bts/report/view?orderId=${orderId}`,
        failUrl: `${window.location.origin}/bts/report?id=${assessmentId}&error=payment_failed`,
      })
    } catch (err) {
      console.error('Payment error:', err)
      setLoading(false)
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">
        통찰력 심층 리포트
      </h2>

      {/* 포함 항목 */}
      <div className="space-y-3 mb-8">
        {[
          '통찰 구조 해석 — 왜 이런 결과가 나왔는지',
          '핵심 약점 3가지 — 구체적 일상 예시 포함',
          '미래 위험 3가지 — 직업·연령 맞춤',
          '훈련 포인트 3가지 — 바로 실행 가능',
          '핵심 행동 제안 — 오늘부터 시작',
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-lg p-3">
            <span className="text-green-500 mt-0.5">✓</span>
            <p className="text-sm text-slate-700">{item}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
        <p className="text-sm text-slate-500 mb-2">통찰력 심층 리포트</p>
        <p className="text-3xl font-bold text-indigo-600 mb-1">12,900원</p>
        <p className="text-xs text-slate-400 mb-6">결제 즉시 확인 가능</p>

        <button
          onClick={handlePayment}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
            loading ? 'bg-slate-300 text-slate-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {loading ? '처리 중...' : '심층 리포트 받기'}
        </button>
      </div>

      <p className="text-xs text-slate-400 text-center mt-4">
        점수만으로는 바뀌지 않습니다. 왜 이런 결과가 나왔는지, 뭘 먼저 바꿔야 하는지까지.
      </p>
    </main>
  )
}

export default function BtsReportPage() {
  return (
    <Suspense fallback={<p className="text-center text-slate-400 py-16">로딩 중...</p>}>
      <ReportIntroContent />
    </Suspense>
  )
}
```

- [ ] **Step 4: 커밋**

```bash
git add src/app/api/bts/payment/confirm/route.ts src/app/bts/report/page.tsx package.json package-lock.json
git commit -m "feat(bts): add TossPayments integration and report intro page"
```

---

## Task 14: 결제 완료 + 유료 리포트 표시

**Files:**
- Create: `src/components/bts/PaidReport.tsx`
- Create: `src/app/bts/report/view/page.tsx`

- [ ] **Step 1: PaidReport 컴포넌트**

```tsx
// src/components/bts/PaidReport.tsx
'use client'

import type { DeepReport } from '@/lib/bts/types'

interface Props {
  report: DeepReport
}

export default function PaidReport({ report }: Props) {
  return (
    <div className="space-y-8">
      {/* 1. 통찰 구조 해석 */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-3">🔍 통찰 구조 해석</h3>
        <p className="text-sm text-slate-700 leading-relaxed bg-indigo-50 rounded-xl p-5">
          {report.structureAnalysis}
        </p>
      </section>

      {/* 2. 핵심 약점 */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-3">⚠️ 핵심 약점 3가지</h3>
        <div className="space-y-3">
          {report.weaknesses.map((w, i) => (
            <div key={i} className="bg-amber-50 rounded-xl p-4 flex gap-3">
              <span className="text-amber-500 font-bold">{i + 1}</span>
              <p className="text-sm text-amber-800">{w}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 미래 위험 */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-3">🚨 미래 위험 3가지</h3>
        <div className="space-y-3">
          {report.futureRisks.map((r, i) => (
            <div key={i} className="bg-red-50 rounded-xl p-4 flex gap-3">
              <span className="text-red-500 font-bold">{i + 1}</span>
              <p className="text-sm text-red-800">{r}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 훈련 포인트 */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-3">💪 훈련 포인트 3가지</h3>
        <div className="space-y-3">
          {report.trainingPoints.map((t, i) => (
            <div key={i} className="bg-green-50 rounded-xl p-4 flex gap-3">
              <span className="text-green-500 font-bold">{i + 1}</span>
              <p className="text-sm text-green-800">{t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. 핵심 행동 제안 */}
      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-3">🎯 오늘부터 시작하세요</h3>
        <div className="bg-indigo-600 text-white rounded-xl p-5">
          <p className="text-sm leading-relaxed">{report.actionSuggestion}</p>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: 결제 완료 + 리포트 페이지**

```tsx
// src/app/bts/report/view/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import PaidReport from '@/components/bts/PaidReport'
import type { DeepReport } from '@/lib/bts/types'

function ReportViewContent() {
  const params = useSearchParams()
  const orderId = params.get('orderId')
  const paymentKey = params.get('paymentKey')
  const amount = params.get('amount')
  const [report, setReport] = useState<DeepReport | null>(null)
  const [status, setStatus] = useState<'confirming' | 'generating' | 'done' | 'error'>('confirming')

  useEffect(() => {
    if (!orderId || !paymentKey || !amount) return

    const process = async () => {
      try {
        // 1. 결제 승인
        setStatus('confirming')
        const confirmRes = await fetch('/api/bts/payment/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
        })

        if (!confirmRes.ok) throw new Error('Payment confirmation failed')
        const { purchaseId, assessmentId } = await confirmRes.json()

        // 2. 리포트 생성
        setStatus('generating')
        const reportRes = await fetch('/api/bts/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assessmentId, purchaseId }),
        })

        if (!reportRes.ok) throw new Error('Report generation failed')
        const { report } = await reportRes.json()

        setReport(report)
        setStatus('done')
      } catch (err) {
        console.error(err)
        setStatus('error')
      }
    }

    process()
  }, [orderId, paymentKey, amount])

  if (status === 'confirming') {
    return (
      <div className="text-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4" />
        <p className="text-slate-500">결제를 확인하고 있습니다...</p>
      </div>
    )
  }

  if (status === 'generating') {
    return (
      <div className="text-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4" />
        <p className="text-slate-500">AI가 당신만을 위한 심층 리포트를 작성하고 있습니다...</p>
        <p className="text-xs text-slate-400 mt-2">약 10~20초 소요</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 font-semibold">오류가 발생했습니다</p>
        <p className="text-sm text-slate-400 mt-2">결제는 정상 처리되었습니다. 잠시 후 다시 시도해주세요.</p>
      </div>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <p className="text-green-500 text-2xl mb-2">✅</p>
        <h2 className="text-xl font-bold text-slate-900">통찰력 심층 리포트</h2>
        <p className="text-sm text-slate-400 mt-1">결제 완료</p>
      </div>

      {report && <PaidReport report={report} />}

      {/* 90일 플랜 업셀 (Phase 1.5 예고) */}
      <div className="mt-12 bg-slate-50 rounded-xl p-6 text-center">
        <p className="text-sm text-slate-500">
          이제 무엇이 약한지 알았습니다. 다음 단계는 바꾸는 것입니다.
        </p>
        <p className="text-xs text-slate-400 mt-2">
          90일 통찰력 강화 플랜 · 곧 출시 예정
        </p>
      </div>
    </main>
  )
}

export default function BtsReportViewPage() {
  return (
    <Suspense fallback={<div className="text-center py-16"><p className="text-slate-400">로딩 중...</p></div>}>
      <ReportViewContent />
    </Suspense>
  )
}
```

- [ ] **Step 3: 전체 E2E 플로우 확인**

1. `/bts` → 랜딩
2. `/bts/profile` → Google 로그인 → 프로필
3. `/bts/test` → 6문항 진행
4. `/bts/result?id=xxx` → 무료 결과 + 블러 잠금
5. `/bts/report?id=xxx` → 리포트 소개 + 결제 CTA
6. 결제 완료 → `/bts/report/view?orderId=xxx&paymentKey=xxx&amount=12900` → 리포트 표시

- [ ] **Step 4: 커밋**

```bash
git add src/components/bts/PaidReport.tsx src/app/bts/report/view/page.tsx
git commit -m "feat(bts): add paid report display after payment confirmation"
```

---

## 완료 후 체크리스트

- [ ] 전체 테스트 통과: `npm test`
- [ ] 빌드 성공: `npm run build`
- [ ] 토스페이먼츠 테스트키로 결제 플로우 확인
- [ ] Supabase RLS 정책 검증 (다른 사용자 데이터 접근 불가)
- [ ] `.env.local`에 `TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 설정 확인
