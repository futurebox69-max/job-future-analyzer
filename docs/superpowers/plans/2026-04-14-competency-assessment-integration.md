# 미래역량 검사 통합 (Competency Assessment Integration) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** AI 분석 API 대기 시간(12~20초) 동안 역량 검사를 진행하고, 완료 후 결과 화면에 "🧠 미래역량" 탭을 추가하여 AI 대체율과 역량 점수를 교차 분석해서 보여준다.

**Architecture:** handleAnalyze() 호출 시 동시에 `/api/analyze` POST(서버)와 CompetencyAssessment UI(클라이언트 사이드)를 병렬 실행. 둘 다 완료되면 결과 화면의 기존 10개 탭 + 새 "🧠 미래역량" 탭에서 종합 분석을 표시한다. 추가 API 비용 0원.

**Tech Stack:** Next.js 14 App Router, TypeScript, React useState/useEffect, inline styles (기존 앱 패턴 일치)

---

## File Structure

**신규 생성:**
- `src/types/competency.ts` — 6차원 역량 타입, CompetencyResult 타입, COMPETENCY_INFO 상수
- `src/lib/competency-scenarios.ts` — 시나리오 데이터(HTML에서 추출), buildScenarios()
- `src/components/CompetencyAssessment.tsx` — 검사 UI (질문유형 선택 → 8문제 → 완료 콜백)
- `src/components/CompetencyResult.tsx` — 결과 탭 (레이더 SVG, 교차 분석, 맞춤 전략)

**수정:**
- `src/app/page.tsx` — import 추가, state 추가, SECTIONS 배열에 탭 추가, 로딩 영역 교체, 결과 탭 추가

---

### Task 1: 타입 정의 파일 생성

**Files:**
- Create: `src/types/competency.ts`

- [ ] **Step 1: 파일 생성**

```typescript
// src/types/competency.ts

export type CompetencyKey =
  | 'structural'   // 구조적 사고
  | 'creative'     // 창의적 재설계
  | 'emotional'    // 감성 연결
  | 'adaptive'     // 적응 민첩성
  | 'ethical'      // 윤리적 판단
  | 'collab';      // 협업 지능

export interface CompetencyScores {
  structural: number;
  creative: number;
  emotional: number;
  adaptive: number;
  ethical: number;
  collab: number;
}

export type QuestionType = 'scenario' | 'game' | 'image' | 'rank';

export interface ScenarioChoice {
  text?: string;
  emoji?: string;
  label?: string;
  desc?: string;
  skills: Partial<CompetencyScores>;
  fb?: string;
}

export interface Scenario {
  context: string;
  emoji: string;
  text: string;
  type: 'scenario' | 'image' | 'rank' | 'game';
  persona?: string;
  choices?: ScenarioChoice[];
  items?: string[];
  skillMap?: CompetencyKey[];
}

export interface BehaviorData {
  round: number;
  type: string;
  choiceIdx?: number;
  time: number;
  order?: string[];
}

export interface CompetencyResult {
  scores: CompetencyScores;
  topKey: CompetencyKey;
  archetype: string;
  archetypeEmoji: string;
  archetypeSubtitle: string;
  metaAnalysis: {
    questionType: QuestionType;
    questionTypeMeaning: string;
    avgResponseTime: number;
    responseStyle: string;
  };
  behaviorData: BehaviorData[];
}

export const COMPETENCY_INFO: Record<CompetencyKey, {
  icon: string;
  name: string;
  color: string;
  description: string;
}> = {
  structural: { icon: '🧩', name: '구조적 사고', color: '#6C63FF', description: '복잡한 문제를 분해하고 패턴을 찾는 능력' },
  creative:   { icon: '🎨', name: '창의적 재설계', color: '#FF6B6B', description: '기존 틀을 깨고 새로운 해법을 만드는 능력' },
  emotional:  { icon: '💫', name: '감성 연결', color: '#F472B6', description: '사람의 감정을 읽고 공감하는 능력' },
  adaptive:   { icon: '⚡', name: '적응 민첩성', color: '#F59E0B', description: '변화에 빠르게 대응하고 학습하는 능력' },
  ethical:    { icon: '⚖️', name: '윤리적 판단', color: '#A78BFA', description: '가치와 원칙에 기반한 판단 능력' },
  collab:     { icon: '🤝', name: '협업 지능', color: '#34D399', description: '다양한 사람과 시너지를 만드는 능력' },
};

export const ARCHETYPES: Record<CompetencyKey, { emoji: string; title: string; subtitle: string }> = {
  structural: { emoji: '🧩', title: '구조 해석자', subtitle: '복잡한 세상의 지도를 그리는 사람' },
  creative:   { emoji: '🎨', title: '재설계자', subtitle: '틀을 깨고 새로운 가능성을 여는 사람' },
  emotional:  { emoji: '💫', title: '감성 연결자', subtitle: '기술이 닿지 못하는 마음을 돌보는 사람' },
  adaptive:   { emoji: '⚡', title: '변화 서퍼', subtitle: '파도를 두려워하지 않고 타는 사람' },
  ethical:    { emoji: '⚖️', title: '기술의 양심', subtitle: '할 수 있다와 해야 한다 사이의 판단자' },
  collab:     { emoji: '🤝', title: '시너지 설계자', subtitle: '사람과 AI의 다리를 놓는 사람' },
};
```

- [ ] **Step 2: TypeScript 오류 없는지 확인**

```bash
cd /c/Users/futur/job-future-analyzer && npx tsc --noEmit 2>&1 | head -30
```

---

### Task 2: 시나리오 데이터 파일 생성

**Files:**
- Create: `src/lib/competency-scenarios.ts`

- [ ] **Step 1: 파일 생성 (future-skill-advanced.html에서 추출한 시나리오 데이터)**

```typescript
// src/lib/competency-scenarios.ts
import { Scenario, QuestionType, CompetencyKey } from '@/types/competency';

export const questionTypeMap: Record<QuestionType, string> = {
  scenario: '논리적 · 현실지향',
  game: '은유적 · 게임친화',
  image: '직관적 · 감각형',
  rank: '분석적 · 체계형',
};

// 청소년/게임형 시나리오
export const youthScenarios: Scenario[] = [
  {
    context: '롤 상황', emoji: '⚔️',
    text: '랭크 게임 중, 정글러가 갱을 3번 실패했다. 팀 채팅에 욕이 올라오기 시작한다.',
    type: 'game',
    choices: [
      { text: '"왜 실패했는지 같이 봐보자" — 리플레이 분석 제안', skills: { structural: 3, collab: 1 }, fb: '팀의 분석가' },
      { text: '"괜찮아, 한타 때 캐리하면 돼" — 멘탈 케어', skills: { emotional: 3, collab: 1 }, fb: '팀의 힐러' },
      { text: '말 없이 다른 라인 로밍으로 스스로 전세 뒤집기 시도', skills: { adaptive: 3, creative: 1 }, fb: '행동으로 보여주는 타입' },
      { text: '"욕하면 게임 더 망해. 뮤트하고 플레이하자"', skills: { ethical: 3, emotional: 1 }, fb: '팀의 기강' },
    ],
  },
  {
    context: '마인크래프트 상황', emoji: '⛏️',
    text: '친구와 같이 만든 건축물을 다른 사람이 몰래 부쉈다. 백업은 없다.',
    type: 'game',
    choices: [
      { text: '누가 했는지 로그 추적 → 증거 확보 후 서버 관리자에게 신고', skills: { structural: 3, ethical: 1 }, fb: '증거 기반 사고' },
      { text: '친구와 더 멋진 걸 새로 짓자고 제안 — 오히려 업그레이드 기회', skills: { creative: 3, emotional: 1 }, fb: '위기를 기회로' },
      { text: '서버 보호 플러그인 설치 — 같은 일이 반복되지 않게 시스템 구축', skills: { adaptive: 3, structural: 1 }, fb: '시스템으로 방지' },
      { text: '그 사람과 직접 대화 — 왜 그랬는지 먼저 물어보기', skills: { emotional: 3, collab: 1 }, fb: '대화로 해결' },
    ],
  },
  {
    context: '포트나이트 상황', emoji: '🏗️',
    text: '스쿼드 결승. 팀원 3명 다 죽고 나 혼자 남았다. 상대는 4명.',
    type: 'game',
    choices: [
      { text: '지형 분석 → 고지대 확보 → 하나씩 유인해서 각개격파', skills: { structural: 3, adaptive: 1 }, fb: '전략적 사고' },
      { text: '예상 못한 루트로 기습 — 정석이 아닌 창의적 무빙', skills: { creative: 3, adaptive: 1 }, fb: '예측 불가능한 플레이' },
      { text: '죽은 팀원에게 콜 받으면서 협동 — "왼쪽에서 온다!" 정보 활용', skills: { collab: 3, emotional: 1 }, fb: '팀이 죽어도 협업' },
      { text: '무리하지 않고 생존 우선 — 링 이동하면서 어부지리 노림', skills: { adaptive: 3, ethical: 1 }, fb: '냉정한 판단력' },
    ],
  },
  {
    context: '로블록스 상황', emoji: '🎭',
    text: '네가 만든 게임에 친구가 "재미없다"고 했다. 조회수도 3명.',
    type: 'game',
    choices: [
      { text: '다른 인기 게임 분석 — 뭐가 다른지 구조적으로 비교', skills: { structural: 3, creative: 1 }, fb: '벤치마킹의 힘' },
      { text: '완전히 새로운 컨셉으로 v2 도전', skills: { creative: 3, adaptive: 1 }, fb: '과감한 리빌드' },
      { text: '친구한테 "정확히 어디가 재미없어?"라고 구체적으로 물어보기', skills: { emotional: 3, collab: 1 }, fb: '피드백의 가치' },
      { text: '3명이라도 플레이한 사람에게 DM — "뭐가 좋았어?"', skills: { collab: 3, structural: 1 }, fb: '유저의 목소리' },
    ],
  },
];

// 성인 시나리오
export const adultScenarios: Scenario[] = [
  {
    context: '직장 현실', emoji: '📊',
    text: '팀장이 AI 도입을 밀어붙이는데, 동료들이 "우리 일자리 없어지는 거 아냐?"라며 불안해한다. 당신은 중간 입장.',
    type: 'scenario',
    choices: [
      { text: 'AI가 대체할 업무와 그렇지 않은 업무를 목록으로 정리해서 팀 미팅에서 공유', skills: { structural: 3, collab: 1 }, fb: '불안을 구조로 전환' },
      { text: '동료들의 감정을 먼저 인정하고, 1:1로 각자의 걱정을 들어본다', skills: { emotional: 3, ethical: 1 }, fb: '감정이 먼저다' },
      { text: 'AI 도입한 다른 팀 사례를 빠르게 조사해서 "이렇게 됐더라"고 공유', skills: { adaptive: 3, structural: 1 }, fb: '사례가 불안을 줄인다' },
      { text: 'AI가 못하는 일을 우리 팀이 선점하자는 새로운 포지셔닝 제안', skills: { creative: 3, adaptive: 1 }, fb: '위기를 기회로 전환' },
    ],
  },
  {
    context: '이직 고민', emoji: '🔄',
    text: '연봉 30% 오르는 이직 제안. 하지만 지금 팀에서 중요한 프로젝트가 한창이고, 팀원들이 당신에게 의지하고 있다.',
    type: 'scenario',
    choices: [
      { text: '현재 프로젝트 마무리 일정, 이직처 입사 가능일을 구조적으로 정리하고 양쪽과 조율', skills: { structural: 3, ethical: 1 }, fb: '구조적 의사결정' },
      { text: '팀원들에게 솔직하게 상황 공유 — 숨기는 것보다 함께 고민', skills: { emotional: 3, collab: 1 }, fb: '투명함의 힘' },
      { text: '이직처에서 한 달 유예 요청 + 현재 프로젝트 인수인계 계획 수립', skills: { adaptive: 3, collab: 1 }, fb: '양쪽 다 잡기' },
      { text: '연봉이 아니라 "3년 후 나의 성장"으로 기준을 재설정하고 판단', skills: { ethical: 3, creative: 1 }, fb: '장기적 관점' },
    ],
  },
  {
    context: '부업/창업', emoji: '💡',
    text: '퇴근 후 시작한 부업이 월 200만원. 본업 월급과 비슷해졌다. 풀타임 전환할까?',
    type: 'scenario',
    choices: [
      { text: '6개월 치 수입, 비용, 성장률 데이터로 분석. 감이 아닌 숫자로 결정', skills: { structural: 3, adaptive: 1 }, fb: '데이터 기반 결정' },
      { text: '부업 고객 5명에게 직접 물어본다. "풀타임하면 더 쓸 의향 있어요?"', skills: { collab: 3, emotional: 1 }, fb: '고객이 답이다' },
      { text: '본업을 줄이면서(파트타임, 무급휴직) 중간 단계를 먼저 시도', skills: { adaptive: 3, ethical: 1 }, fb: '리스크 분산' },
      { text: '부업의 비즈니스 모델을 완전히 재설계해서 본업을 대체할 수준으로 만들기', skills: { creative: 3, structural: 1 }, fb: '스케일업 설계' },
    ],
  },
  {
    context: '가정', emoji: '👨‍👩‍👧',
    text: '초등학생 아이가 "유튜버 되고 싶다"고 한다. 배우자는 반대, 아이는 열정적.',
    type: 'scenario',
    choices: [
      { text: '"왜 유튜버?"를 깊이 물어본다. 영상 만들기가 좋은 건지, 유명해지고 싶은 건지', skills: { structural: 3, emotional: 1 }, fb: '동기의 구조를 파악' },
      { text: '가족 회의 소집. 아이, 배우자 각자 의견을 공평하게 듣고 규칙을 함께 정한다', skills: { collab: 3, ethical: 1 }, fb: '함께 결정하는 힘' },
      { text: '일단 해보게 한다. 한 달간 영상 3개 만들어보고 그 경험으로 다시 대화', skills: { adaptive: 3, creative: 1 }, fb: '체험이 판단을 바꾼다' },
      { text: '유튜브 대신 영상 제작 수업을 제안. 꿈을 지지하되 기술을 먼저', skills: { creative: 3, ethical: 1 }, fb: '방향을 재설계' },
    ],
  },
];

// 이미지형 시나리오
export const imageScenarios: Scenario[] = [
  {
    context: '직감 선택 1', emoji: '',
    text: '두 장면 중 끌리는 것을 고르세요.',
    type: 'image',
    choices: [
      { emoji: '🏔️', label: '혼자 정상에 선 사람', desc: '고독하지만 전체를 본다', skills: { structural: 3, ethical: 1 } },
      { emoji: '🎪', label: '축제에서 춤추는 사람들', desc: '함께여서 즐겁다', skills: { emotional: 3, collab: 1 } },
    ],
  },
  {
    context: '직감 선택 2', emoji: '',
    text: '어떤 도구가 더 끌리나요?',
    type: 'image',
    choices: [
      { emoji: '🔭', label: '망원경', desc: '멀리 내다보는 것', skills: { structural: 2, ethical: 2 } },
      { emoji: '🎨', label: '물감 팔레트', desc: '새로운 것을 만드는 것', skills: { creative: 3, adaptive: 1 } },
    ],
  },
  {
    context: '직감 선택 3', emoji: '',
    text: '위기 상황. 어떤 역할이 더 끌리나요?',
    type: 'image',
    choices: [
      { emoji: '🧭', label: '길을 찾는 항해사', desc: '방향을 정하는 사람', skills: { structural: 2, adaptive: 2 } },
      { emoji: '🩹', label: '상처를 치료하는 의료진', desc: '사람을 돌보는 사람', skills: { emotional: 3, ethical: 1 } },
    ],
  },
  {
    context: '직감 선택 4', emoji: '',
    text: '팀에서 맡고 싶은 역할은?',
    type: 'image',
    choices: [
      { emoji: '🎯', label: '전략가', desc: '계획을 세우는 사람', skills: { structural: 3, creative: 1 } },
      { emoji: '🤝', label: '중재자', desc: '사람들을 잇는 사람', skills: { collab: 3, emotional: 1 } },
    ],
  },
];

// 순위형 시나리오
export const rankScenarios: Scenario[] = [
  {
    context: '가치 순위', emoji: '⚖️',
    text: 'AI 시대에 가장 중요한 순서로 배열하세요.',
    type: 'rank',
    items: ['공감 능력', '문제 해결력', '빠른 적응력', '윤리적 판단', '창의적 사고', '협업 능력'],
    skillMap: ['emotional', 'structural', 'adaptive', 'ethical', 'creative', 'collab'],
  },
  {
    context: '행동 순위', emoji: '🎯',
    text: '새 프로젝트 시작 시, 먼저 하는 순서대로.',
    type: 'rank',
    items: ['사람들 의견 듣기', '데이터 분석하기', '일단 시작하기', '계획 세우기', '기존 사례 조사', '목표 재정의'],
    skillMap: ['collab', 'structural', 'adaptive', 'structural', 'adaptive', 'creative'],
  },
];

export function buildScenarios(
  mode: 'adult' | 'youth',
  questionType: QuestionType
): Scenario[] {
  const isYouth = mode === 'youth';
  const mainBank = isYouth ? youthScenarios : adultScenarios;

  switch (questionType) {
    case 'scenario':
      return [...mainBank.slice(0, 4), ...imageScenarios.slice(0, 2), ...rankScenarios.slice(0, 2)];
    case 'game':
      return [...youthScenarios.slice(0, 4), ...adultScenarios.slice(0, 2), ...imageScenarios.slice(0, 2)];
    case 'image':
      return [...imageScenarios.slice(0, 4), ...mainBank.slice(0, 2), ...rankScenarios.slice(0, 2)];
    case 'rank':
      return [...rankScenarios.slice(0, 2), ...imageScenarios.slice(0, 4), ...mainBank.slice(0, 2)];
    default:
      return mainBank.slice(0, 8);
  }
}
```

- [ ] **Step 2: TypeScript 확인**

```bash
cd /c/Users/futur/job-future-analyzer && npx tsc --noEmit 2>&1 | head -20
```

---

### Task 3: CompetencyAssessment 컴포넌트 생성

**Files:**
- Create: `src/components/CompetencyAssessment.tsx`

- [ ] **Step 1: 파일 생성**

컴포넌트는 3단계로 동작: `qtype` (질문유형 선택) → `game` (8문제 진행) → `done` (완료 콜백).

```typescript
// src/components/CompetencyAssessment.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  CompetencyKey, CompetencyScores, CompetencyResult,
  QuestionType, Scenario, BehaviorData, ARCHETYPES
} from "@/types/competency";
import { buildScenarios, questionTypeMap } from "@/lib/competency-scenarios";

interface CompetencyAssessmentProps {
  mode: 'adult' | 'youth';
  onComplete: (result: CompetencyResult) => void;
  onSkip?: () => void;
}

type Phase = 'qtype' | 'game';

const EMPTY_SCORES: CompetencyScores = {
  structural: 0, creative: 0, emotional: 0,
  adaptive: 0, ethical: 0, collab: 0,
};

const QTYPE_OPTIONS: { type: QuestionType; icon: string; title: string; desc: string; meta: string }[] = [
  { type: 'scenario', icon: '📖', title: '시나리오형', desc: '현실적인 상황이 주어지고, 어떻게 행동할지 선택합니다', meta: '논리적 · 현실 지향' },
  { type: 'game',     icon: '🎮', title: '게임 비유형', desc: '롤, 포트나이트, 마크 등 게임 상황으로 질문합니다', meta: '은유적 · 게임 친화' },
  { type: 'image',    icon: '🖼️', title: '이미지 선택형', desc: '두 가지 상징 중 끌리는 것을 고릅니다', meta: '직관적 · 감각형' },
  { type: 'rank',     icon: '📊', title: '순위 매기기형', desc: '가치와 행동에 우선순위를 매깁니다', meta: '분석적 · 체계형' },
];

export default function CompetencyAssessment({ mode, onComplete, onSkip }: CompetencyAssessmentProps) {
  const [phase, setPhase] = useState<Phase>('qtype');
  const [selectedQType, setSelectedQType] = useState<QuestionType | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [round, setRound] = useState(0);
  const [scores, setScores] = useState<CompetencyScores>({ ...EMPTY_SCORES });
  const [behaviorData, setBehaviorData] = useState<BehaviorData[]>([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [feedback, setFeedback] = useState<{ text: string; visible: boolean }>({ text: '', visible: false });
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [rankItems, setRankItems] = useState<string[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const roundStartRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentScenario = scenarios[round];

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const addScores = useCallback((partial: Partial<CompetencyScores>) => {
    setScores(prev => {
      const next = { ...prev };
      (Object.entries(partial) as [CompetencyKey, number][]).forEach(([k, v]) => {
        next[k] = (next[k] || 0) + v;
      });
      return next;
    });
  }, []);

  const showFeedback = useCallback((text: string) => {
    setFeedback({ text, visible: true });
    setTimeout(() => setFeedback(f => ({ ...f, visible: false })), 900);
  }, []);

  const goNextRound = useCallback((nextRound: number, currentScenarios: Scenario[], finalScores: CompetencyScores, finalBehavior: BehaviorData[]) => {
    if (nextRound >= currentScenarios.length) {
      // 검사 완료
      const max = Math.max(...Object.values(finalScores)) || 1;
      const topKey = (Object.entries(finalScores) as [CompetencyKey, number][])
        .sort((a, b) => b[1] - a[1])[0][0];
      const arch = ARCHETYPES[topKey];
      const avgTime = finalBehavior.reduce((s, d) => s + d.time, 0) / (finalBehavior.length || 1);
      const fastRounds = finalBehavior.filter(d => d.time < 5000).length;

      onComplete({
        scores: finalScores,
        topKey,
        archetype: arch.title,
        archetypeEmoji: arch.emoji,
        archetypeSubtitle: arch.subtitle,
        metaAnalysis: {
          questionType: selectedQType!,
          questionTypeMeaning: questionTypeMap[selectedQType!],
          avgResponseTime: avgTime / 1000,
          responseStyle: fastRounds > (finalBehavior.length / 2)
            ? '빠른 직관형 의사결정자'
            : '신중하게 고민하는 숙고형',
        },
        behaviorData: finalBehavior,
      });
      return;
    }
    setRound(nextRound);
    setSelectedIdx(null);
    setTimeLeft(20);
    roundStartRef.current = Date.now();

    // 순위형이면 items shuffle
    const nextS = currentScenarios[nextRound];
    if (nextS?.type === 'rank' && nextS.items) {
      setRankItems([...nextS.items].sort(() => Math.random() - 0.5));
    }
  }, [onComplete, selectedQType]);

  // 타이머
  useEffect(() => {
    if (phase !== 'game' || !currentScenario) return;
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearTimer();
          // 시간 초과: 자동 선택
          if (currentScenario.type === 'rank') {
            handleRankSubmit(true);
          } else if (currentScenario.choices) {
            const autoIdx = Math.floor(Math.random() * currentScenario.choices.length);
            handleChoiceSelect(autoIdx, true);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round]);

  function startGame(qtype: QuestionType) {
    const built = buildScenarios(mode, qtype);
    setScenarios(built);
    setSelectedQType(qtype);
    setRound(0);
    setScores({ ...EMPTY_SCORES });
    setBehaviorData([]);
    setTimeLeft(20);
    setSelectedIdx(null);
    if (built[0]?.type === 'rank' && built[0].items) {
      setRankItems([...built[0].items].sort(() => Math.random() - 0.5));
    }
    roundStartRef.current = Date.now();
    setPhase('game');
  }

  function handleChoiceSelect(idx: number, isAuto = false) {
    if (selectedIdx !== null) return;
    clearTimer();
    setSelectedIdx(idx);

    const s = currentScenario;
    const choice = s.choices![idx];
    const elapsed = Date.now() - roundStartRef.current;

    const newBehavior: BehaviorData = {
      round, type: s.type, choiceIdx: idx, time: elapsed,
    };

    const newScores = { ...scores };
    (Object.entries(choice.skills) as [CompetencyKey, number][]).forEach(([k, v]) => {
      newScores[k] = (newScores[k] || 0) + v;
    });

    const newBehaviorData = [...behaviorData, newBehavior];
    setScores(newScores);
    setBehaviorData(newBehaviorData);

    if (!isAuto && choice.fb) showFeedback(choice.fb);
    else if (isAuto) showFeedback('⏰ 시간 초과!');

    setTimeout(() => {
      goNextRound(round + 1, scenarios, newScores, newBehaviorData);
    }, 1100);
  }

  function handleRankSubmit(isAuto = false) {
    clearTimer();
    const s = currentScenario;
    if (!s.items || !s.skillMap) return;

    const items = isAuto ? rankItems : rankItems;
    const newScores = { ...scores };
    items.forEach((item, i) => {
      const idx = s.items!.indexOf(item);
      const skillKey = s.skillMap![idx];
      const pts = Math.max(4 - i, 0);
      if (skillKey) newScores[skillKey] = (newScores[skillKey] || 0) + pts;
    });

    const elapsed = Date.now() - roundStartRef.current;
    const newBehavior: BehaviorData = { round, type: 'rank', time: elapsed, order: items };
    const newBehaviorData = [...behaviorData, newBehavior];
    setScores(newScores);
    setBehaviorData(newBehaviorData);

    showFeedback('순위 기록 완료!');
    setTimeout(() => {
      goNextRound(round + 1, scenarios, newScores, newBehaviorData);
    }, 1100);
  }

  // 드래그 앤 드롭 (데스크톱)
  function handleDragStart(idx: number) { setDragIdx(idx); }
  function handleDragEnter(idx: number) { setDragOver(idx); }
  function handleDragEnd() {
    if (dragIdx === null || dragOver === null || dragIdx === dragOver) {
      setDragIdx(null); setDragOver(null); return;
    }
    const next = [...rankItems];
    const [removed] = next.splice(dragIdx, 1);
    next.splice(dragOver, 0, removed);
    setRankItems(next);
    setDragIdx(null); setDragOver(null);
  }

  // 터치 드래그 (모바일)
  const touchStartY = useRef(0);
  const touchDragIdx = useRef<number | null>(null);
  function handleTouchStart(e: React.TouchEvent, idx: number) {
    touchStartY.current = e.touches[0].clientY;
    touchDragIdx.current = idx;
  }
  function handleTouchMove(e: React.TouchEvent) {
    e.preventDefault();
    if (touchDragIdx.current === null) return;
    const y = e.touches[0].clientY;
    const elements = document.querySelectorAll('[data-rank-item]');
    let overIdx: number | null = null;
    elements.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      if (y >= rect.top && y <= rect.bottom) overIdx = i;
    });
    if (overIdx !== null && overIdx !== touchDragIdx.current) {
      const next = [...rankItems];
      const [removed] = next.splice(touchDragIdx.current, 1);
      next.splice(overIdx, 0, removed);
      setRankItems(next);
      touchDragIdx.current = overIdx;
    }
  }
  function handleTouchEnd() { touchDragIdx.current = null; }

  // ── UI ──

  if (phase === 'qtype') {
    return (
      <div style={{ padding: '24px 16px', maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', color: '#6C63FF', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.06em' }}>
            AI 분석 중 · 잠깐!
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1E1B4B', marginBottom: '8px' }}>
            🧠 미래역량 검사
          </h2>
          <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
            AI 분석이 완료되는 동안(12~20초)<br />
            당신의 미래역량을 먼저 파악해드립니다.
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600, marginBottom: '10px', letterSpacing: '0.04em' }}>
            질문 스타일을 선택하세요 · 선택 자체가 당신의 사고방식을 드러냅니다
          </p>
          {QTYPE_OPTIONS.map(opt => (
            <button
              key={opt.type}
              onClick={() => startGame(opt.type)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                width: '100%', marginBottom: '10px',
                padding: '16px 18px', borderRadius: '16px',
                background: 'white',
                border: '1.5px solid #EDE9FE',
                cursor: 'pointer', textAlign: 'left',
                boxShadow: '0 2px 8px rgba(108,99,255,0.06)',
                transition: 'all 0.2s',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#6C63FF';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#EDE9FE';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <span style={{
                fontSize: '28px', width: '44px', height: '44px', borderRadius: '12px',
                background: '#F5F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>{opt.icon}</span>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E1B4B', marginBottom: '2px' }}>{opt.title}</div>
                <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.4 }}>{opt.desc}</div>
                <span style={{
                  display: 'inline-block', marginTop: '4px',
                  fontSize: '11px', color: '#6C63FF', fontWeight: 600,
                  background: '#F0EEFF', borderRadius: '4px', padding: '2px 8px',
                }}>{opt.meta}</span>
              </div>
            </button>
          ))}
        </div>

        {onSkip && (
          <button
            onClick={onSkip}
            style={{
              width: '100%', padding: '12px', borderRadius: '12px',
              background: 'none', border: '1.5px solid #EDE9FE',
              color: '#9CA3AF', fontSize: '14px', cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            건너뛰기
          </button>
        )}
      </div>
    );
  }

  // phase === 'game'
  const s = currentScenario;
  if (!s) return null;
  const progress = (round / scenarios.length) * 100;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
      {/* 피드백 플래시 */}
      {feedback.visible && (
        <div style={{
          position: 'fixed', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 200,
          pointerEvents: 'none',
        }}>
          <div style={{
            background: 'white', border: '2px solid #6C63FF',
            borderRadius: '20px', padding: '20px 28px', textAlign: 'center',
            boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '6px' }}>✨</div>
            <div style={{ fontSize: '15px', color: '#1E1B4B', fontWeight: 600 }}>{feedback.text}</div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div style={{
        padding: '14px 20px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', background: 'white',
        borderBottom: '1px solid #EDE9FE', borderRadius: '16px 16px 0 0',
        marginBottom: '16px',
      }}>
        <span style={{ fontSize: '12px', color: '#6B7280' }}>{round + 1}/{scenarios.length}</span>
        <div style={{ flex: 1, margin: '0 14px', height: '6px', background: '#EDE9FE', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, #6C63FF, #4ECDC4)', width: `${progress}%`, transition: 'width 0.5s' }} />
        </div>
        <span style={{
          fontSize: '20px', fontWeight: 700, minWidth: '36px', textAlign: 'right',
          color: timeLeft <= 5 ? '#EF4444' : '#6C63FF',
          fontVariantNumeric: 'tabular-nums',
        }}>{timeLeft}</span>
      </div>

      {/* 문제 카드 */}
      <div style={{
        background: 'white', borderRadius: '20px', padding: '22px',
        marginBottom: '14px',
        boxShadow: '0 4px 24px rgba(108,99,255,0.06)',
        borderTop: '3px solid #6C63FF',
      }}>
        {s.context && (
          <div style={{ fontSize: '11px', color: '#4ECDC4', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '8px', textTransform: 'uppercase' }}>
            ⚡ {s.context}
          </div>
        )}
        {s.emoji && <span style={{ fontSize: '36px', display: 'block', marginBottom: '10px' }}>{s.emoji}</span>}
        <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#1E1B4B', fontWeight: 500 }}>{s.text}</p>
      </div>

      {/* 선택지 */}
      <div style={{ padding: '0 4px' }}>
        {s.type === 'image' && s.choices && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {s.choices.map((c, i) => (
              <button
                key={i}
                onClick={() => handleChoiceSelect(i)}
                disabled={selectedIdx !== null}
                style={{
                  padding: '18px 12px', borderRadius: '16px', textAlign: 'center',
                  background: selectedIdx === i ? '#EEF2FF' : 'white',
                  border: `1.5px solid ${selectedIdx === i ? '#6C63FF' : '#EDE9FE'}`,
                  cursor: selectedIdx !== null ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>{c.emoji}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E1B4B', marginBottom: '4px' }}>{c.label}</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{c.desc}</div>
              </button>
            ))}
          </div>
        )}

        {(s.type === 'scenario' || s.type === 'game') && s.choices && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {s.choices.map((c, i) => (
              <button
                key={i}
                onClick={() => handleChoiceSelect(i)}
                disabled={selectedIdx !== null}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px', borderRadius: '14px', textAlign: 'left',
                  background: selectedIdx === i ? '#EEF2FF' : 'white',
                  border: `1.5px solid ${selectedIdx === i ? '#6C63FF' : '#EDE9FE'}`,
                  cursor: selectedIdx !== null ? 'default' : 'pointer',
                  boxShadow: selectedIdx === i ? '0 0 20px rgba(108,99,255,0.15)' : 'none',
                  transition: 'all 0.2s',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  background: '#F0EEFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700, color: '#6C63FF', flexShrink: 0,
                }}>{['A','B','C','D'][i]}</span>
                <span style={{ fontSize: '13px', lineHeight: 1.5, color: '#374151' }}>{c.text}</span>
              </button>
            ))}
          </div>
        )}

        {s.type === 'rank' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {rankItems.map((item, i) => (
                <div
                  key={item}
                  data-rank-item
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragEnter={() => handleDragEnter(i)}
                  onDragEnd={handleDragEnd}
                  onDragOver={e => e.preventDefault()}
                  onTouchStart={e => handleTouchStart(e, i)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px', borderRadius: '12px', background: 'white',
                    border: `1.5px solid ${dragIdx === i ? '#6C63FF' : '#EDE9FE'}`,
                    cursor: 'grab', userSelect: 'none',
                    opacity: dragIdx === i ? 0.5 : 1,
                    transition: 'all 0.15s',
                    touchAction: 'none',
                  }}
                >
                  <span style={{
                    width: '24px', height: '24px', borderRadius: '6px', background: '#6C63FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0,
                  }}>{i + 1}</span>
                  <span style={{ fontSize: '13px', color: '#374151', flex: 1 }}>{item}</span>
                  <span style={{ color: '#9CA3AF', fontSize: '16px' }}>⠿</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => handleRankSubmit()}
              style={{
                width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
                background: 'linear-gradient(135deg, #6C63FF, #8B5CF6)',
                color: 'white', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                touchAction: 'manipulation',
              }}
            >
              이 순서로 확정 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript 확인**

```bash
cd /c/Users/futur/job-future-analyzer && npx tsc --noEmit 2>&1 | head -30
```

---

### Task 4: CompetencyResult 컴포넌트 생성

**Files:**
- Create: `src/components/CompetencyResult.tsx`

- [ ] **Step 1: 파일 생성**

```typescript
// src/components/CompetencyResult.tsx
"use client";

import { CompetencyResult as CompetencyResultType, CompetencyKey, COMPETENCY_INFO } from "@/types/competency";
import { AnalysisResult } from "@/types/analysis";

interface CompetencyResultProps {
  competencyResult: CompetencyResultType;
  analysisResult: AnalysisResult;
  jobName: string;
  mode: 'adult' | 'youth';
}

function RadarChart({ scores }: { scores: Record<CompetencyKey, number> }) {
  const keys: CompetencyKey[] = ['structural', 'creative', 'emotional', 'adaptive', 'ethical', 'collab'];
  const max = Math.max(...Object.values(scores)) || 1;
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 70;
  const angles = keys.map((_, i) => (i * 360) / keys.length - 90);

  const toXY = (angleDeg: number, radius: number) => ({
    x: cx + radius * Math.cos((angleDeg * Math.PI) / 180),
    y: cy + radius * Math.sin((angleDeg * Math.PI) / 180),
  });

  const scorePoints = keys.map((k, i) => {
    const ratio = scores[k] / max;
    return toXY(angles[i], r * ratio);
  });

  const scorePath = scorePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* 격자 */}
      {gridLevels.map(level => {
        const pts = keys.map((_, i) => toXY(angles[i], r * level));
        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';
        return <path key={level} d={path} fill="none" stroke="#EDE9FE" strokeWidth="1" />;
      })}
      {/* 축 */}
      {keys.map((_, i) => {
        const end = toXY(angles[i], r);
        return <line key={i} x1={cx} y1={cy} x2={end.x.toFixed(1)} y2={end.y.toFixed(1)} stroke="#EDE9FE" strokeWidth="1" />;
      })}
      {/* 점수 영역 */}
      <path d={scorePath} fill="rgba(108,99,255,0.2)" stroke="#6C63FF" strokeWidth="2" />
      {/* 레이블 */}
      {keys.map((k, i) => {
        const info = COMPETENCY_INFO[k];
        const labelPt = toXY(angles[i], r + 18);
        return (
          <text key={k} x={labelPt.x.toFixed(1)} y={labelPt.y.toFixed(1)}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fill="#6B7280" fontWeight="600">
            {info.icon} {info.name.replace('적 ', '').slice(0, 4)}
          </text>
        );
      })}
    </svg>
  );
}

export default function CompetencyResult({ competencyResult, analysisResult, jobName, mode }: CompetencyResultProps) {
  const { scores, topKey, archetype, archetypeEmoji, archetypeSubtitle, metaAnalysis } = competencyResult;
  const overallRisk = analysisResult.overallRate;

  const survivalSkills: Record<string, CompetencyKey[]> = {
    high_risk:   ['creative', 'emotional', 'ethical'],
    medium_risk: ['adaptive', 'structural', 'collab'],
    low_risk:    ['structural', 'adaptive', 'creative'],
  };
  const riskLevel = overallRisk >= 70 ? 'high_risk' : overallRisk >= 40 ? 'medium_risk' : 'low_risk';
  const importantSkills = survivalSkills[riskLevel];
  const maxScore = Math.max(...Object.values(scores)) || 1;
  const weakPoints = importantSkills.filter(k => scores[k] < maxScore * 0.6);
  const strengths = importantSkills.filter(k => scores[k] >= maxScore * 0.7);

  const topCompInfo = COMPETENCY_INFO[topKey];

  const actions = [
    strengths.length > 0
      ? `✅ ${COMPETENCY_INFO[strengths[0]].name}을 살려 AI와 협업하는 역할을 선점하세요`
      : `✅ ${topCompInfo.name}을 핵심 차별화 포인트로 의식적으로 강화하세요`,
    weakPoints.length > 0
      ? `📚 ${COMPETENCY_INFO[weakPoints[0]].name} 역량 강화가 시급합니다 — 관련 프로젝트나 학습을 시작하세요`
      : `📚 현재 역량 균형이 좋습니다. AI 도구 활용법 학습에 집중하세요`,
    overallRisk >= 70
      ? `🚀 AI 대체율이 높은 직업이므로 3년 내 역할 전환을 구체적으로 계획하세요`
      : overallRisk >= 40
      ? `🔄 지금이 역량 업그레이드의 적기입니다. 현재 직업에서 AI 협업 포지션을 확보하세요`
      : `🌱 비교적 안전한 직업이지만 ${topCompInfo.name}으로 더욱 차별화할 수 있습니다`,
  ];

  const sortedScores = (Object.entries(scores) as [CompetencyKey, number][])
    .sort((a, b) => b[1] - a[1]);

  return (
    <div>
      {/* 헤더 */}
      <div style={{
        background: 'linear-gradient(135deg, #6C63FF 0%, #4158D0 100%)',
        borderRadius: '20px', padding: '24px', marginBottom: '16px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>{archetypeEmoji}</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '6px' }}>
          나의 유형
        </div>
        <div style={{ fontSize: '22px', fontWeight: 900, color: 'white', marginBottom: '4px' }}>{archetype}</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{archetypeSubtitle}</div>
      </div>

      {/* 레이더 차트 + 점수 바 */}
      <div style={{
        background: 'white', borderRadius: '20px', padding: '22px',
        boxShadow: '0 4px 24px rgba(108,99,255,0.06)', marginBottom: '14px',
      }}>
        <div style={{ fontSize: '12px', color: '#6C63FF', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '16px' }}>
          6차원 미래역량 프로필
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <RadarChart scores={scores} />
        </div>
        {sortedScores.map(([k, v]) => {
          const info = COMPETENCY_INFO[k];
          const pct = Math.round((v / maxScore) * 100);
          return (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{info.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '12px', color: '#374151' }}>{info.name}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: info.color }}>{pct}%</span>
                </div>
                <div style={{ height: '7px', background: '#EDE9FE', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '4px', background: info.color, width: `${pct}%`, transition: 'width 1.5s ease' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI 대체율 × 역량 교차 분석 */}
      <div style={{
        background: 'white', borderRadius: '20px', padding: '22px',
        boxShadow: '0 4px 24px rgba(108,99,255,0.06)', marginBottom: '14px',
      }}>
        <div style={{ fontSize: '12px', color: '#6C63FF', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '14px' }}>
          📊 AI 대체율 × 역량 교차 분석
        </div>
        <div style={{
          background: '#F5F4FF', borderRadius: '14px', padding: '16px', marginBottom: '14px',
        }}>
          <p style={{ fontSize: '14px', color: '#1E1B4B', lineHeight: 1.7 }}>
            AI 대체율 <strong style={{ color: overallRisk >= 70 ? '#EF4444' : overallRisk >= 40 ? '#F59E0B' : '#10B981' }}>{overallRisk}%</strong>인{' '}
            <strong>{jobName}</strong>에서 가장 중요한 역량은{' '}
            <strong style={{ color: '#6C63FF' }}>{importantSkills.map(k => COMPETENCY_INFO[k].name).join(', ')}</strong>이며,<br />
            당신의 최고 역량 <strong style={{ color: topCompInfo.color }}>{topCompInfo.icon} {topCompInfo.name}</strong>은{' '}
            {importantSkills.includes(topKey) ? '이 직업의 핵심 생존 역량입니다! 🎯' : '보조적 강점으로 활용할 수 있습니다.'}
          </p>
        </div>

        {strengths.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
            {strengths.map(k => (
              <span key={k} style={{
                padding: '4px 12px', borderRadius: '100px',
                background: '#F0FDF4', color: '#10B981',
                fontSize: '12px', fontWeight: 600,
                border: '1px solid #BBF7D0',
              }}>
                ✅ 강점: {COMPETENCY_INFO[k].name}
              </span>
            ))}
          </div>
        )}
        {weakPoints.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {weakPoints.map(k => (
              <span key={k} style={{
                padding: '4px 12px', borderRadius: '100px',
                background: '#FFFBEB', color: '#D97706',
                fontSize: '12px', fontWeight: 600,
                border: '1px solid #FDE68A',
              }}>
                ⚠️ 보완: {COMPETENCY_INFO[k].name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 맞춤 성장 전략 */}
      <div style={{
        background: 'white', borderRadius: '20px', padding: '22px',
        boxShadow: '0 4px 24px rgba(108,99,255,0.06)', marginBottom: '14px',
      }}>
        <div style={{ fontSize: '12px', color: '#6C63FF', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '14px' }}>
          🎯 맞춤 성장 전략
        </div>
        {actions.map((action, i) => (
          <div key={i} style={{
            padding: '14px', borderRadius: '12px',
            background: i === 0 ? '#F0FDF4' : i === 1 ? '#FFFBEB' : '#F0EEFF',
            marginBottom: '8px', fontSize: '14px', color: '#1E1B4B', lineHeight: 1.6,
          }}>
            {action}
          </div>
        ))}
      </div>

      {/* 사고방식 메타분석 */}
      <div style={{
        background: '#FFFBEB', borderRadius: '20px', padding: '22px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)', marginBottom: '14px',
        border: '1px solid #FDE68A',
      }}>
        <div style={{ fontSize: '12px', color: '#D97706', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '14px' }}>
          💡 사고방식 메타분석
        </div>
        <div style={{ fontSize: '13px', color: '#78350F', lineHeight: 1.8 }}>
          <p>선택한 질문 유형: <strong>"{metaAnalysis.questionTypeMeaning}"</strong></p>
          <p>→ 정보 처리 방식이 {metaAnalysis.questionTypeMeaning} 스타일임을 보여줍니다.</p>
          <p style={{ marginTop: '8px' }}>평균 응답 시간: <strong>{metaAnalysis.avgResponseTime.toFixed(1)}초</strong></p>
          <p>→ {metaAnalysis.responseStyle}입니다.</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript 확인**

```bash
cd /c/Users/futur/job-future-analyzer && npx tsc --noEmit 2>&1 | head -30
```

---

### Task 5: page.tsx 수정

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: import 추가 (line 24 이후에 추가)**

기존 import 블록 아래에:
```typescript
import CompetencyAssessment from "@/components/CompetencyAssessment";
import CompetencyResultTab from "@/components/CompetencyResult";
import { CompetencyResult as CompetencyResultType } from "@/types/competency";
```

- [ ] **Step 2: state 추가 (line 119, showUpgradePopup state 아래)**

```typescript
const [competencyResult, setCompetencyResult] = useState<CompetencyResultType | null>(null);
const [showAssessment, setShowAssessment] = useState(false);
const [assessmentCompleted, setAssessmentCompleted] = useState(false);
```

- [ ] **Step 3: SECTIONS 배열에 미래역량 탭 추가 (기존 SECTIONS overview 다음에)**

기존:
```typescript
const SECTIONS = [
  { id: "overview",    icon: "📊", label: t.section_overview },
  { id: "dimensions",  icon: "🎯", label: t.section_dimensions },
```

변경:
```typescript
const SECTIONS = [
  { id: "overview",    icon: "📊", label: t.section_overview },
  { id: "competency",  icon: "🧠", label: "미래역량" },
  { id: "dimensions",  icon: "🎯", label: t.section_dimensions },
```

- [ ] **Step 4: handleAnalyze 함수에 state 초기화 추가**

기존 `setIsLoading(true);` 아래:
```typescript
setIsLoading(true);
// ↓ 추가
setShowAssessment(true);
setAssessmentCompleted(false);
setCompetencyResult(null);
```

- [ ] **Step 5: 로딩 영역 교체**

기존 로딩 스피너 블록:
```tsx
{/* 로딩 스피너 */}
{isLoading && (
  <div className="flex flex-col items-center gap-4 py-16 animate-fade-in">
    ...spinner JSX...
  </div>
)}
```

변경 (전체 블록 교체):
```tsx
{/* 로딩: 역량검사 또는 대기 메시지 */}
{isLoading && !result && (
  showAssessment && !assessmentCompleted ? (
    <div className="py-8">
      <CompetencyAssessment
        mode={mode}
        onComplete={(res) => {
          setCompetencyResult(res);
          setAssessmentCompleted(true);
        }}
        onSkip={() => setAssessmentCompleted(true)}
      />
    </div>
  ) : (
    <div className="flex flex-col items-center gap-4 py-16 animate-fade-in">
      <div className="relative w-20 h-20">
        <div
          className="absolute inset-0 rounded-full border-4 animate-spin"
          style={{ borderColor: "rgba(108,99,255,0.15)", borderTopColor: "#6C63FF" }}
        />
        <div
          className="absolute inset-3 rounded-full border-4 animate-spin"
          style={{
            borderColor: "rgba(167,139,250,0.15)",
            borderBottomColor: "#A78BFA",
            animationDirection: "reverse",
            animationDuration: "1.5s",
          }}
        />
      </div>
      <p className="text-sm font-medium" style={{ color: "#4B5563" }}>
        {loadingMsg || t.loading[0]}
      </p>
      {assessmentCompleted && competencyResult && (
        <p style={{ color: "#6C63FF", fontSize: "13px", fontWeight: 600 }}>
          ✅ 역량 검사 완료! AI 분석 결과를 기다리는 중...
        </p>
      )}
      <div className="flex gap-1.5">
        {t.loading.map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-all duration-500"
            style={{ background: i <= loadingStageIdx ? "#6C63FF" : "#E5E7EB" }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: "#9CA3AF" }}>{t.loading_hint}</p>
    </div>
  )
)}
```

- [ ] **Step 6: 결과 탭 렌더링 추가**

기존 콘텐츠 영역 (line 915 부근):
```tsx
{activeSection === "overview"    && <GaugeChart .../>}
```

앞에 추가:
```tsx
{activeSection === "competency" && competencyResult ? (
  <CompetencyResultTab
    competencyResult={competencyResult}
    analysisResult={result}
    jobName={result.jobName}
    mode={mode}
  />
) : activeSection === "competency" && !competencyResult ? (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
    <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '8px' }}>
      역량 검사를 진행하지 않았습니다.
    </p>
    <p style={{ color: '#9CA3AF', fontSize: '13px' }}>
      다음 번 분석 시 역량 검사를 함께 진행하세요.
    </p>
  </div>
) : null}
```

- [ ] **Step 7: 사이드바에서 competency 탭이 coach 전용 섹션에서 분리되도록 확인**

기존 사이드바 필터: `SECTIONS.filter(s => s.id !== "coach")`
→ competency 탭은 자동으로 포함됨. 별도 수정 불필요.

- [ ] **Step 8: TypeScript 확인**

```bash
cd /c/Users/futur/job-future-analyzer && npx tsc --noEmit 2>&1 | head -40
```

---

### Task 6: 빌드 검증

- [ ] **Step 1: 개발 서버 실행 테스트**

```bash
cd /c/Users/futur/job-future-analyzer && npm run build 2>&1 | tail -30
```

Expected: `✓ Compiled successfully` (또는 `Route (app) Size`)

- [ ] **Step 2: 오류 있으면 수정 후 재빌드**

---

## 구현 완료 기준

1. TypeScript 에러 0개 (`npx tsc --noEmit` 통과)
2. `npm run build` 성공
3. 직업 입력 → 분석 시작 시 역량 검사 UI 표시
4. 역량 검사 완료 or 건너뛰기 → 대기 스피너로 전환
5. AI 분석 완료 → 결과 화면의 "🧠 미래역량" 탭에서 검사 결과 표시
6. 역량 검사 안 했을 때 탭 클릭 시 안내 메시지 표시
