# 검사 Next.js 마이그레이션 + 로그인 + 개인 모드 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 HTML 단일 파일 검사를 Next.js 앱에 통합하고, 로그인 후 개인 모드로 검사 + 결과 저장이 가능하도록 한다.

**Architecture:** 기존 `job-future-analyzer` Next.js 앱의 `/assessment` 경로에 검사 기능을 추가. 데이터/스코어링 로직은 `src/lib/assessment/`에, UI 컴포넌트는 `src/components/assessment/`에, 페이지는 `src/app/assessment/`에 배치. Supabase DB에 결과 저장.

**Tech Stack:** Next.js 16.2, React 19, TypeScript, Tailwind CSS, Supabase Auth + PostgreSQL

**스펙 문서:** `docs/superpowers/specs/2026-04-15-login-team-family-enhancement-design.md`

**참고:** 이 플랜은 **개인 모드**만 포함. 그룹 모드(가족/팀)는 플랜 2에서 다룸.

---

## File Structure

### 새로 생성할 파일

| 파일 | 책임 |
|------|------|
| `src/lib/assessment/types.ts` | TypeScript 타입 정의 |
| `src/lib/assessment/data.ts` | SKILLS_INFO, ARCHETYPES, scenarioBanks, BT_COMMENTS 등 상수 데이터 |
| `src/lib/assessment/scoring.ts` | normalizeScores, classifyType, buildScenarios 순수 함수 |
| `src/components/assessment/LoginGate.tsx` | 로그인 필수 래퍼 컴포넌트 |
| `src/components/assessment/ModeSelect.tsx` | 모드 선택 화면 (개인/가족/팀) |
| `src/components/assessment/NameInput.tsx` | 이름 입력 화면 |
| `src/components/assessment/QuestionTypeSelect.tsx` | 검사 유형 선택 (시나리오/게임/이미지/순위) |
| `src/components/assessment/AssessmentEngine.tsx` | 검사 메인 엔진 (8문항 + 타이머 + 파티클 + 콤보) |
| `src/components/assessment/PersonalResult.tsx` | 개인 결과 화면 |
| `src/components/assessment/ParticleEffect.tsx` | 파티클 + 콤보 시스템 |
| `src/components/assessment/BTGuide.tsx` | 캐릭터 비티 가이드 |
| `src/app/assessment/page.tsx` | 검사 메인 페이지 (SPA 스크린 관리) |
| `src/app/assessment/assessment.css` | 검사 전용 CSS (기존 HTML에서 추출) |
| `src/app/api/assessment/save-result/route.ts` | 개인 결과 저장 API |
| `supabase/migrations/001_assessment_tables.sql` | DB 마이그레이션 SQL |

### 수정할 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/context/AuthContext.tsx` | Kakao OAuth 메서드 추가 (2차) |

---

## Task 1: TypeScript 타입 정의

**Files:**
- Create: `src/lib/assessment/types.ts`

- [ ] **Step 1: 타입 파일 생성**

```typescript
// src/lib/assessment/types.ts

export type SkillKey = 'structural' | 'creative' | 'emotional' | 'adaptive' | 'ethical' | 'collab';

export type Scores = Record<SkillKey, number>;

export interface SkillInfo {
  icon: string;
  name: string;
  color: string;
}

export type ArchetypeKey =
  | 'allrounder' | 'balanced' | 'explosive' | 'dual_weapon'
  | 'architect' | 'disruptor' | 'empath' | 'adapter' | 'guardian' | 'synergist';

export interface Archetype {
  emoji: string;
  title: string;
  sub: string;
  key: ArchetypeKey;
}

export type QuestionType = 'scenario' | 'game' | 'image' | 'rank';

export interface ScenarioChoice {
  text?: string;
  emoji?: string;
  label?: string;
  desc?: string;
  skills: Partial<Scores>;
  fb?: string;
}

export interface Scenario {
  ctx: string;
  emoji: string;
  text: string;
  type: 'scenario' | 'image' | 'rank';
  choices?: ScenarioChoice[];
  items?: string[];
  skillMap?: SkillKey[];
}

export interface BehaviorEntry {
  round: number;
  type: string;
  choiceIdx?: number;
  time: number;
  skipped?: boolean;
  order?: string[];
}

export interface AssessmentResult {
  playerName: string;
  selectedQType: QuestionType;
  scores: Scores;
  normScores: Scores;
  typeKey: ArchetypeKey;
  avgScore: number;
  behaviorData: BehaviorEntry[];
  durationSeconds: number;
}

export type GameMode = 'personal' | 'family' | 'team';
```

- [ ] **Step 2: 커밋**

```bash
git add src/lib/assessment/types.ts
git commit -m "feat: add assessment TypeScript type definitions"
```

---

## Task 2: 상수 데이터 추출

**Files:**
- Create: `src/lib/assessment/data.ts`

- [ ] **Step 1: 데이터 파일 생성**

기존 `bts-assessment-site.html`의 SKILLS_INFO, ARCHETYPES, BT_COMMENTS, FB_SUBS, TYPE_VERDICTS, scenarioBanks, THEORETICAL_MAX를 TypeScript로 변환. HTML 파일의 line 638~774를 참고.

```typescript
// src/lib/assessment/data.ts
import type { SkillKey, SkillInfo, ArchetypeKey, Archetype, Scenario, Scores } from './types';

export const SKILLS_INFO: Record<SkillKey, SkillInfo> = {
  structural: { icon: '🧩', name: '구조적 사고', color: '#6C63FF' },
  creative:   { icon: '🎨', name: '창의적 재설계', color: '#FF6B6B' },
  emotional:  { icon: '💫', name: '감성 연결', color: '#F472B6' },
  adaptive:   { icon: '⚡', name: '적응 민첩성', color: '#FFE66D' },
  ethical:    { icon: '⚖️', name: '윤리적 판단', color: '#A78BFA' },
  collab:     { icon: '🤝', name: '협업 지능', color: '#34D399' },
};

export const ARCHETYPES: Record<ArchetypeKey, Archetype> = {
  allrounder:  { emoji: '🌟', title: '올라운더',       sub: '모든 역량이 고르게 높은 만능형 인재', key: 'allrounder' },
  balanced:    { emoji: '🎯', title: '균형 전략가',    sub: '어떤 상황에서도 흔들리지 않는 안정형', key: 'balanced' },
  explosive:   { emoji: '🌋', title: '잠재력 폭발형',  sub: '극단적 강점을 가진 돌파형 인재', key: 'explosive' },
  dual_weapon: { emoji: '⚔️', title: '이중 무기 보유자', sub: '두 가지 강점으로 시너지를 만드는 사람', key: 'dual_weapon' },
  architect:   { emoji: '🏗️', title: '미래 설계자',    sub: '복잡함 속에서 질서를 찾는 사람', key: 'architect' },
  disruptor:   { emoji: '🎨', title: '창조적 파괴자',   sub: '기존 틀을 깨고 새로운 길을 만드는 사람', key: 'disruptor' },
  empath:      { emoji: '💛', title: '공감 리더',      sub: '사람의 마음을 읽고 연결하는 사람', key: 'empath' },
  adapter:     { emoji: '⚡', title: '적응형 혁신가',   sub: '불확실성 속에서 기회를 잡는 사람', key: 'adapter' },
  guardian:    { emoji: '⚖️', title: '윤리 수호자',    sub: '원칙과 가치로 판단하는 사람', key: 'guardian' },
  synergist:   { emoji: '🤝', title: '시너지 메이커',   sub: '다양한 사람과 함께 더 큰 것을 만드는 사람', key: 'synergist' },
};

export const TYPE_VERDICTS: Record<ArchetypeKey, string> = {
  allrounder:  '당신은 올라운더형 인재입니다. 모든 역량이 고르게 높아 어떤 환경에서든 빠르게 적응할 수 있습니다.',
  balanced:    '당신은 균형 전략가입니다. 특정 역량에 치우치지 않는 안정감이 강점이며, 리더십 포지션에 적합합니다.',
  explosive:   '당신은 잠재력 폭발형입니다. 극단적 강점이 있지만, 약한 영역을 보완하면 무서운 성장이 가능합니다.',
  dual_weapon: '당신은 이중 무기 보유자입니다. 두 가지 핵심 역량의 조합이 독보적인 경쟁력을 만듭니다.',
  architect:   '당신은 미래 설계자입니다. 복잡한 문제를 구조화하는 능력이 AI 시대 핵심 경쟁력입니다.',
  disruptor:   '당신은 창조적 파괴자입니다. 기존 방식을 해체하고 재조립하는 능력은 AI가 대체하기 가장 어렵습니다.',
  empath:      '당신은 공감 리더입니다. 사람의 감정을 읽고 신뢰를 만드는 능력은 AI 시대 최고의 무기입니다.',
  adapter:     '당신은 적응형 혁신가입니다. 변화를 두려워하지 않고 빠르게 전환하는 능력이 강점입니다.',
  guardian:    '당신은 윤리 수호자입니다. AI 시대에 기술의 방향을 판단하는 역할이 점점 더 중요해집니다.',
  synergist:   '당신은 시너지 메이커입니다. 다양한 배경의 사람들과 협업해 더 큰 가치를 만드는 능력이 있습니다.',
};

export const BT_COMMENTS: Record<number, { msg: string; emoji: string }> = {
  0: { msg: '첫 번째 질문! 직감대로 골라보세요 🎯', emoji: '🤖' },
  1: { msg: '흠, 흥미로운 선택이었어요. 다음은...', emoji: '🤔' },
  2: { msg: '슬슬 패턴이 보이기 시작하네요!', emoji: '👀' },
  3: { msg: '벌써 절반! 당신의 강점이 드러나고 있어요 💪', emoji: '🔥' },
  4: { msg: '후반전 시작! 여기서 반전이 올 수도...', emoji: '⚡' },
  5: { msg: '오, 이건 좀 어려운 질문이에요', emoji: '😮' },
  6: { msg: '거의 다 왔어요! 마지막 힘내세요', emoji: '🏃' },
  7: { msg: '마지막 질문! 이게 결과를 바꿀 수도 있어요', emoji: '🎲' },
};

export const FB_SUBS = [
  '이 선택이 당신을 정의합니다',
  '흥미로운 관점이네요',
  'AI는 이렇게 생각하지 못해요',
  '당신만의 강점이 보여요',
  '이 역량이 미래를 바꿉니다',
  '독특한 시각이에요',
  '이런 사람이 필요합니다',
  '바로 이게 핵심이에요',
];

// scenarioBanks — bts-assessment-site.html line 696~774에서 추출
export const scenarioBanks: Record<string, Scenario[]> = {
  adult: [
    {ctx:'직장 위기',emoji:'💼',text:'팀에서 AI 도구를 도입했는데, 동료가 "일자리가 위험하다"며 불안해합니다. 어떻게 하시겠습니까?',type:'scenario',
      choices:[
        {text:'"AI가 대체하는 업무 vs 우리만의 강점"을 정리해서 팀 미팅을 연다',skills:{structural:3,collab:1},fb:'구조로 불안을 해소'},
        {text:'"이걸 기회로 새 역할을 만들자"며 AI+인간 협업 모델을 제안한다',skills:{creative:3,adaptive:1},fb:'위기를 기회로'},
        {text:'동료의 감정을 먼저 들어주고, 함께 대응 방안을 찾자고 한다',skills:{emotional:3,collab:1},fb:'사람을 먼저 보는 리더'},
        {text:'AI 도입의 윤리적 가이드라인을 먼저 만들자고 경영진에 건의한다',skills:{ethical:3,structural:1},fb:'원칙이 있는 대응'}]},
    {ctx:'이직 고민',emoji:'🔄',text:'연봉 30% 인상 제안을 받았지만, 그 회사는 AI 자동화를 적극 추진 중입니다.',type:'scenario',
      choices:[
        {text:'6개월 치 데이터로 분석. 감이 아닌 숫자로 결정한다',skills:{structural:3,adaptive:1},fb:'데이터 기반 결정'},
        {text:'"AI를 활용하는 포지션을 만들겠다"며 역제안한다',skills:{creative:3,adaptive:1},fb:'협상의 재설계'},
        {text:'현 직장 동료들과의 관계, 문화 적합성을 먼저 고려한다',skills:{emotional:3,ethical:1},fb:'관계 중심 판단'},
        {text:'두 회사 모두의 3년 후 시나리오를 그려보고 판단한다',skills:{adaptive:3,structural:1},fb:'미래 시뮬레이션'}]},
    {ctx:'부업 기회',emoji:'💡',text:'퇴근 후 AI를 활용한 부업 기회가 생겼습니다. 하지만 본업과 시간 충돌이 있습니다.',type:'scenario',
      choices:[
        {text:'본업과 부업의 시너지 영역을 찾아 둘을 연결한다',skills:{structural:3,creative:1},fb:'구조적 통합'},
        {text:'과감하게 본업을 줄이고 부업에 올인한다',skills:{adaptive:3,creative:1},fb:'변화에 뛰어들기'},
        {text:'가족과 상의하고, 생활 패턴에 미치는 영향을 먼저 고려한다',skills:{emotional:3,ethical:1},fb:'삶의 균형 우선'},
        {text:'3개월 시범 운영 후 데이터로 판단한다',skills:{structural:2,adaptive:2},fb:'실험적 접근'}]},
    {ctx:'팀 갈등',emoji:'🤝',text:'프로젝트에서 두 팀원이 심하게 대립합니다. 당신이 중재해야 합니다.',type:'scenario',
      choices:[
        {text:'"왜 실패했는지 같이 봐보자" — 리플레이 분석을 제안',skills:{structural:3,collab:1},fb:'팀의 분석가'},
        {text:'두 사람의 아이디어를 합쳐 제3의 안을 만든다',skills:{creative:3,collab:1},fb:'창의적 중재'},
        {text:'각자의 감정을 먼저 들어준 뒤 공감대를 형성한다',skills:{emotional:3,collab:1},fb:'감정을 먼저'},
        {text:'팀 규칙을 세우고, 역할을 명확히 재분배한다',skills:{ethical:3,structural:1},fb:'규칙으로 신뢰를'}]}
  ],
  youth: [
    {ctx:'LoL 팀 위기',emoji:'🎮',text:'랭크 게임에서 탑이 0/5가 되었습니다. 팀 분위기가 최악입니다.',type:'scenario',
      choices:[
        {text:'"탑은 스플릿 포기하고 팀파이트에 집중해" — 전략 수정 제안',skills:{structural:3,adaptive:1},fb:'전략적 사고'},
        {text:'"괜찮아, 후반 가면 우리 한타 구성이 더 좋아" — 멘탈 케어',skills:{emotional:3,collab:1},fb:'팀의 정신적 지주'},
        {text:'자신의 라인에서 초반 이득을 극대화해서 캐리를 시도한다',skills:{adaptive:3,creative:1},fb:'개인기로 돌파'},
        {text:'"서렌 투표 올려" — 빠른 손절 후 다음 판에 집중',skills:{adaptive:2,structural:2},fb:'효율적 판단'}]},
    {ctx:'마크 건축',emoji:'⛏️',text:'마인크래프트에서 친구들과 마을을 만들고 있습니다. 의견이 달라서 진행이 안 됩니다.',type:'scenario',
      choices:[
        {text:'구역을 나눠서 각자 맡은 부분을 만든 뒤 합친다',skills:{structural:3,collab:1},fb:'분업의 힘'},
        {text:'모두의 아이디어를 합쳐서 전혀 새로운 건축 테마를 만든다',skills:{creative:3,collab:1},fb:'창의적 융합'},
        {text:'"다 좋은데, 일단 네 아이디어부터 해보자" — 한 명씩 시도',skills:{emotional:3,adaptive:1},fb:'존중하며 전진'},
        {text:'투표로 결정한다. 민주적이고 공정하게',skills:{ethical:3,structural:1},fb:'공정한 프로세스'}]},
    {ctx:'포트나이트 스쿼드',emoji:'🔫',text:'포트나이트에서 스쿼드 중 한 명이 계속 혼자 돌아다니다 죽습니다.',type:'scenario',
      choices:[
        {text:'지형 분석 → 고지대 확보 → 하나씩 유인해서 각개격파 전략 제안',skills:{structural:3,adaptive:1},fb:'전략적 사고'},
        {text:'그 친구 플레이 스타일에 맞는 역할을 새로 만들어준다',skills:{creative:3,emotional:1},fb:'맞춤형 해법'},
        {text:'"같이 다니자, 네가 죽으면 우리가 슬퍼" — 감성 호소',skills:{emotional:3,collab:1},fb:'팀워크는 감정에서'},
        {text:'역할 분담을 정하고 규칙을 만든다 (스카우트/서포트/공격)',skills:{structural:2,collab:2},fb:'시스템으로 해결'}]},
    {ctx:'로블록스 사업',emoji:'🏗️',text:'로블록스에서 게임을 만들었는데 접속자가 점점 줄고 있습니다.',type:'scenario',
      choices:[
        {text:'접속 데이터를 분석해서 이탈 구간을 찾아 개선한다',skills:{structural:3,adaptive:1},fb:'데이터 기반 개선'},
        {text:'다른 인기 게임을 분석하고, 완전히 다른 컨셉으로 리뉴얼',skills:{creative:3,structural:1},fb:'벤치마킹의 힘'},
        {text:'플레이어들에게 직접 물어본다. "뭐가 재미없어?"',skills:{emotional:3,collab:1},fb:'유저의 목소리'},
        {text:'수익화보다 커뮤니티를 먼저 만든다. 팬이 있으면 게임은 산다',skills:{collab:3,emotional:1},fb:'관계가 먼저'}]}
  ],
  image: [
    {ctx:'상징 선택',emoji:'🔮',text:'두 가지 중 더 끌리는 것을 고르세요.',type:'image',
      choices:[
        {emoji:'🗺️',label:'지도',desc:'전체를 보고 길을 찾는다',skills:{structural:3,adaptive:1}},
        {emoji:'🧭',label:'나침반',desc:'방향만 알면 길은 만든다',skills:{creative:3,adaptive:1}}]},
    {ctx:'도구 선택',emoji:'🛠️',text:'하나만 가져갈 수 있다면?',type:'image',
      choices:[
        {emoji:'🔬',label:'현미경',desc:'깊이 파고들어 진실을 본다',skills:{structural:3,ethical:1}},
        {emoji:'🔭',label:'망원경',desc:'멀리 보고 큰 그림을 그린다',skills:{creative:3,adaptive:1}}]},
    {ctx:'길 선택',emoji:'🛤️',text:'어떤 길로 가시겠습니까?',type:'image',
      choices:[
        {emoji:'🏔️',label:'산길',desc:'어렵지만 정상에서 전부 보인다',skills:{adaptive:3,structural:1}},
        {emoji:'🌊',label:'바닷길',desc:'흐름을 타면 더 멀리 간다',skills:{creative:2,emotional:2}}]},
    {ctx:'팀 역할',emoji:'👥',text:'팀에서 당신의 자연스러운 역할은?',type:'image',
      choices:[
        {emoji:'🎯',label:'전략가',desc:'방향을 정하고 계획을 세운다',skills:{structural:3,ethical:1}},
        {emoji:'🔥',label:'점화자',desc:'에너지를 불어넣고 사기를 올린다',skills:{emotional:3,collab:1}}]}
  ],
  rank: [
    {ctx:'가치 순위',emoji:'⚖️',text:'AI 시대에 가장 중요한 순서로 배열하세요.',type:'rank',
      items:['비판적 사고','감성 지능','기술 적응력','윤리적 판단','창의성','협업 능력'],
      skillMap:['structural','emotional','adaptive','ethical','creative','collab'] as SkillKey[]},
    {ctx:'행동 순위',emoji:'🎯',text:'새 프로젝트 시작 시, 먼저 하는 순서대로.',type:'rank',
      items:['사람들 의견 듣기','데이터 분석하기','일단 시작하기','계획 세우기','기존 사례 조사','목표 재정의'],
      skillMap:['collab','structural','adaptive','structural','creative','ethical'] as SkillKey[]}
  ]
};

export const THEORETICAL_MAX: Scores = {
  structural: 12, creative: 10, emotional: 10,
  adaptive: 10, ethical: 9, collab: 9,
};

export const BG_COLORS = ['#F8F7FF','#F5F3FF','#F0ECFF','#EBE5FF','#E6DEFF','#E0D6FF','#DBD0FF','#D5C9FF'];
```

- [ ] **Step 2: 커밋**

```bash
git add src/lib/assessment/data.ts
git commit -m "feat: extract assessment data constants to TypeScript module"
```

---

## Task 3: 스코어링 로직 추출

**Files:**
- Create: `src/lib/assessment/scoring.ts`

- [ ] **Step 1: 스코어링 함수 생성**

기존 HTML의 `normalizeScores`, `classifyType`, `buildScenarios` 함수를 TypeScript로 변환.

```typescript
// src/lib/assessment/scoring.ts
import type { Scores, SkillKey, ArchetypeKey, QuestionType, Scenario } from './types';
import { THEORETICAL_MAX, scenarioBanks } from './data';

export function normalizeScores(rawScores: Scores): Scores {
  const normalized = {} as Scores;
  for (const k of Object.keys(rawScores) as SkillKey[]) {
    normalized[k] = Math.min(100, Math.round((rawScores[k] / THEORETICAL_MAX[k]) * 100));
  }
  return normalized;
}

export function classifyType(normScores: Scores): ArchetypeKey {
  const vals = Object.values(normScores);
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  const range = max - min;
  const sorted = (Object.entries(normScores) as [SkillKey, number][]).sort((a, b) => b[1] - a[1]);
  const topKey = sorted[0][0];
  const top2diff = sorted[0][1] - sorted[1][1];

  if (avg >= 75 && min >= 60) return 'allrounder';
  if (range <= 10) return 'balanced';
  if (min <= 40 && max >= 90) return 'explosive';
  if (top2diff <= 5) return 'dual_weapon';

  const dimensionMap: Record<SkillKey, ArchetypeKey> = {
    structural: 'architect', creative: 'disruptor', emotional: 'empath',
    adaptive: 'adapter', ethical: 'guardian', collab: 'synergist',
  };
  return dimensionMap[topKey] || 'balanced';
}

export function buildScenarios(qtype: QuestionType): Scenario[] {
  const main = scenarioBanks.adult;
  switch (qtype) {
    case 'scenario': return [...main.slice(0,4), ...scenarioBanks.image.slice(0,2), ...scenarioBanks.rank.slice(0,2)];
    case 'game':     return [...scenarioBanks.youth.slice(0,4), ...scenarioBanks.image.slice(0,2), ...scenarioBanks.rank.slice(0,1), ...main.slice(0,1)];
    case 'image':    return [...scenarioBanks.image, ...main.slice(0,2), ...scenarioBanks.rank.slice(0,2)];
    case 'rank':     return [...scenarioBanks.rank, ...scenarioBanks.image, ...main.slice(0,2)];
    default:         return [...main.slice(0,4), ...scenarioBanks.image.slice(0,2), ...scenarioBanks.rank.slice(0,2)];
  }
}

export function calculateAvgScore(normScores: Scores): number {
  const vals = Object.values(normScores);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/lib/assessment/scoring.ts
git commit -m "feat: extract scoring logic to TypeScript module"
```

---

## Task 4: DB 마이그레이션 SQL

**Files:**
- Create: `supabase/migrations/001_assessment_tables.sql`

- [ ] **Step 1: SQL 마이그레이션 파일 생성**

```sql
-- supabase/migrations/001_assessment_tables.sql
-- 검사 결과 + 그룹 테이블

-- 1. 개인 검사 결과
CREATE TABLE IF NOT EXISTS assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  player_name text NOT NULL,
  selected_qtype text NOT NULL,
  scores jsonb NOT NULL,
  norm_scores jsonb NOT NULL,
  type_key text NOT NULL,
  avg_score integer NOT NULL,
  behavior_data jsonb DEFAULT '[]'::jsonb,
  duration_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 2. 그룹 (가족/팀)
CREATE TABLE IF NOT EXISTS assessment_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode text NOT NULL CHECK (mode IN ('family', 'team')),
  name text NOT NULL,
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invite_code text UNIQUE NOT NULL,
  max_members integer NOT NULL DEFAULT 4 CHECK (max_members BETWEEN 2 AND 10),
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'complete')),
  ai_analysis jsonb,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);

-- 3. 그룹 멤버
CREATE TABLE IF NOT EXISTS assessment_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES assessment_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  result_id uuid REFERENCES assessment_results(id) ON DELETE SET NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- 인덱스
CREATE INDEX idx_results_user ON assessment_results(user_id);
CREATE INDEX idx_groups_invite ON assessment_groups(invite_code);
CREATE INDEX idx_groups_creator ON assessment_groups(creator_id);
CREATE INDEX idx_members_group ON assessment_group_members(group_id);
CREATE INDEX idx_members_user ON assessment_group_members(user_id);

-- RLS 활성화
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_group_members ENABLE ROW LEVEL SECURITY;

-- RLS 정책: assessment_results
CREATE POLICY "Users can insert own results"
  ON assessment_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own results"
  ON assessment_results FOR SELECT
  USING (auth.uid() = user_id);

-- RLS 정책: assessment_groups
CREATE POLICY "Users can create groups"
  ON assessment_groups FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Group members can read group"
  ON assessment_groups FOR SELECT
  USING (
    auth.uid() = creator_id
    OR EXISTS (
      SELECT 1 FROM assessment_group_members
      WHERE group_id = assessment_groups.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Creator can update group"
  ON assessment_groups FOR UPDATE
  USING (auth.uid() = creator_id);

-- RLS 정책: assessment_group_members
CREATE POLICY "Users can join groups"
  ON assessment_group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Group members can read members"
  ON assessment_group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessment_group_members AS gm
      WHERE gm.group_id = assessment_group_members.group_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own membership"
  ON assessment_group_members FOR UPDATE
  USING (auth.uid() = user_id);

-- Realtime 활성화 (그룹 대기 화면용)
ALTER PUBLICATION supabase_realtime ADD TABLE assessment_group_members;
```

- [ ] **Step 2: Supabase 대시보드에서 SQL 실행**

Supabase 대시보드 → SQL Editor → 위 SQL 붙여넣기 → Run. 또는:
```bash
# Supabase CLI가 설치되어 있다면:
npx supabase db push
```

- [ ] **Step 3: 커밋**

```bash
git add supabase/migrations/001_assessment_tables.sql
git commit -m "feat: add assessment DB schema with RLS policies"
```

---

## Task 5: 결과 저장 API

**Files:**
- Create: `src/app/api/assessment/save-result/route.ts`

- [ ] **Step 0: 환경변수 확인**

`.env.local` 파일에 `SUPABASE_SERVICE_ROLE_KEY`가 있는지 확인:
```bash
grep SUPABASE_SERVICE_ROLE_KEY C:/Users/futur/job-future-analyzer/.env.local
```
없으면 Supabase 대시보드 → Settings → API → `service_role` 키를 복사하여 추가:
```
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

- [ ] **Step 1: API 라우트 생성**

```typescript
// src/app/api/assessment/save-result/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/supabase-admin';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const body = await req.json();
    const { playerName, selectedQType, scores, normScores, typeKey, avgScore, behaviorData, durationSeconds } = body;

    if (!playerName || !scores || !normScores || !typeKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // service-role 클라이언트로 RLS 우회
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data, error } = await supabase
      .from('assessment_results')
      .insert({
        user_id: user.id,
        player_name: playerName,
        selected_qtype: selectedQType || 'scenario',
        scores,
        norm_scores: normScores,
        type_key: typeKey,
        avg_score: avgScore || 0,
        behavior_data: behaviorData || [],
        duration_seconds: durationSeconds || 0,
      })
      .select('id')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ resultId: data.id });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/api/assessment/save-result/route.ts
git commit -m "feat: add assessment result save API endpoint"
```

---

## Task 6: 검사 CSS 추출

**Files:**
- Create: `src/app/assessment/assessment.css`

- [ ] **Step 1: CSS 파일 생성**

기존 `bts-assessment-site.html`의 `<style>` 블록 (line 3~278)에서 검사 관련 CSS를 추출. 기존 Tailwind와 충돌하지 않도록 모든 선택자를 `.assessment-wrap` 안에 스코핑.

아래 CSS를 그대로 사용. `bts-assessment-site.html` line 12~278에서 추출하여 `.assessment-wrap`으로 스코핑.

```css
/* src/app/assessment/assessment.css */
/* 폰트 import 제거 — Next.js layout에서 이미 로드 */

.assessment-wrap {
  --bg: #F8F7FF;
  --surface: #fff;
  --primary: #6C63FF;
  --primary-light: #EDE9FE;
  --accent: #4ECDC4;
  --coral: #FF6B6B;
  --gold: #FFE66D;
  --pink: #F472B6;
  --purple: #A78BFA;
  --green: #34D399;
  --text: #1E1B4B;
  --text-dim: #6B7280;
  --text-light: #9CA3AF;
  --border: #EDE9FE;
  --shadow: 0 4px 24px rgba(108,99,255,0.08);
  --radius: 20px;
  font-family: 'Noto Sans KR', sans-serif;
  color: var(--text);
  -webkit-tap-highlight-color: transparent;
}

.assessment-wrap button { font-family: inherit; cursor: pointer; touch-action: manipulation; }

/* Assessment header */
.assessment-wrap .assess-header { text-align:center; padding:20px; background:var(--surface); border-bottom:1px solid var(--border); position:sticky; top:0; z-index:10; }
.assessment-wrap .assess-progress { display:flex; align-items:center; gap:12px; justify-content:center; }
.assessment-wrap .assess-round { font-size:12px; color:var(--text-dim); font-weight:600; }
.assessment-wrap .progress-bar { flex:1; max-width:200px; height:6px; background:#EDE9FE; border-radius:3px; overflow:hidden; }
.assessment-wrap .progress-fill { height:100%; background:var(--primary); border-radius:3px; transition:width 0.3s; }
.assessment-wrap .assess-timer-wrap { display:flex; align-items:center; gap:8px; justify-content:center; margin-top:8px; }
.assessment-wrap .assess-timer-wrap span { font-size:12px; color:var(--text-dim); }
.assessment-wrap .assess-timer { font-size:24px; font-weight:900; color:var(--primary); font-variant-numeric:tabular-nums; }
.assessment-wrap .assess-timer.warning { color:#F59E0B; }

/* Assessment body */
.assessment-wrap .assess-body { max-width:500px; margin:0 auto; padding:24px 20px; transition:opacity 0.3s ease; }
.assessment-wrap .assess-body.fade-out { opacity:0; }
.assessment-wrap .assess-context { font-size:11px; font-weight:600; color:var(--accent); letter-spacing:1px; text-transform:uppercase; margin-bottom:6px; }
.assessment-wrap .assess-emoji { font-size:36px; margin-bottom:10px; }
.assessment-wrap .assess-question { font-size:16px; font-weight:600; line-height:1.7; margin-bottom:20px; }

/* Text choices */
.assessment-wrap .assess-choices { display:flex; flex-direction:column; gap:10px; }
.assessment-wrap .assess-choice { background:var(--surface); border:1.5px solid var(--border); border-radius:14px; padding:14px 16px; text-align:left; display:flex; align-items:center; gap:12px; transition:all 0.2s; touch-action:manipulation; }
.assessment-wrap .assess-choice:active { transform:scale(0.98); }
.assessment-wrap .assess-choice.selected { border-color:var(--primary); background:var(--primary-light); }
.assessment-wrap .assess-key { width:28px; height:28px; border-radius:8px; background:var(--primary-light); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:var(--primary); flex-shrink:0; }
.assessment-wrap .assess-choice-text { font-size:13px; line-height:1.5; }

/* Image choices */
.assessment-wrap .assess-image-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.assessment-wrap .assess-image-card { background:var(--surface); border:1.5px solid var(--border); border-radius:14px; padding:18px; text-align:center; transition:all 0.2s; touch-action:manipulation; }
.assessment-wrap .assess-image-card:active { transform:scale(0.97); }
.assessment-wrap .assess-image-card .emoji { font-size:36px; margin-bottom:6px; }
.assessment-wrap .assess-image-card .label { font-size:13px; font-weight:600; }
.assessment-wrap .assess-image-card .desc { font-size:11px; color:var(--text-dim); margin-top:2px; }

/* Rank items */
.assessment-wrap .rank-list { display:flex; flex-direction:column; gap:8px; }
.assessment-wrap .rank-item { background:var(--surface); border:1.5px solid var(--border); border-radius:12px; padding:14px 16px; display:flex; align-items:center; gap:12px; touch-action:none; user-select:none; transition:all 0.2s; }
.assessment-wrap .rank-item.dragging { opacity:0.5; border-color:var(--primary); }
.assessment-wrap .rank-num { width:24px; height:24px; border-radius:6px; background:var(--primary); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:#fff; flex-shrink:0; }
.assessment-wrap .rank-text { font-size:13px; flex:1; }
.assessment-wrap .rank-handle { color:var(--text-light); font-size:16px; }
.assessment-wrap .rank-confirm { width:100%; padding:14px; border-radius:12px; background:linear-gradient(135deg,var(--primary),#8B5CF6); color:#fff; font-size:14px; font-weight:600; border:none; margin-top:12px; }

/* Feedback flash */
.assessment-wrap .feedback { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(30,27,75,0.95); color:#fff; padding:20px 32px; border-radius:18px; font-size:17px; font-weight:700; z-index:100; pointer-events:none; opacity:0; transition:opacity 0.3s; text-align:center; max-width:280px; }
.assessment-wrap .feedback.show { opacity:1; }
.assessment-wrap .feedback .fb-sub { font-size:12px; font-weight:400; opacity:0.7; margin-top:4px; }

/* Particles */
.assessment-wrap .particle-container { position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:200; overflow:hidden; }
.assessment-wrap .particle { position:absolute; font-size:24px; animation:particleFly 1s ease-out forwards; pointer-events:none; }
@keyframes particleFly { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-120px) scale(0.3)} }

/* Combo badge */
.assessment-wrap .combo-badge { position:fixed; top:80px; right:20px; background:linear-gradient(135deg,#FF6B6B,#FF8E53); color:#fff; padding:8px 16px; border-radius:12px; font-size:14px; font-weight:800; z-index:50; opacity:0; transform:scale(0.5); transition:all 0.3s; pointer-events:none; }
.assessment-wrap .combo-badge.show { opacity:1; transform:scale(1); animation:comboPop 0.4s ease; }
@keyframes comboPop { 0%{transform:scale(0.5)} 50%{transform:scale(1.2)} 100%{transform:scale(1)} }

/* BT Guide character */
.assessment-wrap .bt-guide { display:flex; align-items:flex-start; gap:10px; background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:14px 16px; margin:0 20px 16px; max-width:500px; margin-left:auto; margin-right:auto; animation:slideUp 0.4s ease; }
.assessment-wrap .bt-avatar { font-size:28px; flex-shrink:0; }
.assessment-wrap .bt-msg { font-size:13px; color:var(--text-dim); line-height:1.6; }
@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

/* Intermission */
.assessment-wrap .intermission { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; text-align:center; padding:40px 20px; }
.assessment-wrap .inter-emoji { font-size:48px; margin-bottom:12px; animation:loadingPulse 1.5s infinite; }
.assessment-wrap .inter-title { font-size:22px; font-weight:800; color:var(--text); margin-bottom:8px; }
.assessment-wrap .inter-sub { font-size:14px; color:var(--text-dim); margin-bottom:20px; line-height:1.6; }
.assessment-wrap .inter-peek { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:16px 24px; display:inline-flex; align-items:center; gap:10px; font-size:15px; font-weight:600; color:var(--primary); animation:slideUp 0.5s ease 0.3s both; }
@keyframes loadingPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }

/* Gauge */
.assessment-wrap .gauge-wrap { position:relative; width:200px; height:110px; margin:0 auto 8px; }
.assessment-wrap .gauge-svg { width:200px; height:110px; }
.assessment-wrap .gauge-bg { fill:none; stroke:#EDE9FE; stroke-width:12; stroke-linecap:round; }
.assessment-wrap .gauge-fill { fill:none; stroke:var(--primary); stroke-width:12; stroke-linecap:round; transition:stroke-dashoffset 1.5s ease-out; }
.assessment-wrap .gauge-score { position:absolute; bottom:8px; left:50%; transform:translateX(-50%); font-size:36px; font-weight:900; color:var(--text); }
.assessment-wrap .gauge-label { text-align:center; font-size:12px; color:var(--text-dim); margin-bottom:16px; }

/* Dramatic reveal */
.assessment-wrap .reveal-stage { opacity:0; transform:translateY(20px); transition:all 0.6s ease; }
.assessment-wrap .reveal-stage.visible { opacity:1; transform:translateY(0); }
@keyframes revealBounce { 0%{opacity:0;transform:scale(0)} 60%{transform:scale(1.3)} 100%{opacity:1;transform:scale(1)} }
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/assessment/assessment.css
git commit -m "feat: extract assessment CSS from HTML to dedicated file"
```

---

## Task 7: LoginGate 컴포넌트

**Files:**
- Create: `src/components/assessment/LoginGate.tsx`

- [ ] **Step 1: 로그인 게이트 컴포넌트 생성**

```typescript
// src/components/assessment/LoginGate.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface LoginGateProps {
  children: React.ReactNode;
}

export default function LoginGate({ children }: LoginGateProps) {
  const { user, loading, signInWithGoogle, signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (user) return <>{children}</>;

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle();
    if (error) setError(error);
  };

  const handleEmail = async () => {
    if (!email) return;
    setError('');
    const { error } = await signInWithEmail(email);
    if (error) setError(error);
    else setEmailSent(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-5" style={{ background: '#F5F4FF' }}>
      <div className="max-w-[420px] w-full text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h1 className="text-2xl font-extrabold mb-2">로그인이 필요합니다</h1>
        <p className="text-sm text-gray-500 mb-8">검사 결과를 저장하고 팀/가족과 공유하려면<br/>로그인해 주세요</p>

        <button
          onClick={handleGoogle}
          className="w-full py-4 rounded-2xl border-2 border-gray-200 bg-white font-bold text-base flex items-center justify-center gap-3 mb-3 hover:border-blue-400 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google로 시작하기
        </button>

        {!emailSent ? (
          <div className="mt-6">
            <div className="text-xs text-gray-400 mb-2">또는 이메일로 시작</div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEmail()}
              placeholder="이메일 입력"
              className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 text-center text-base outline-none focus:border-indigo-400 mb-3"
            />
            <button
              onClick={handleEmail}
              disabled={!email}
              className="w-full py-3 rounded-xl bg-indigo-500 text-white font-bold disabled:opacity-30"
            >
              인증 메일 받기
            </button>
          </div>
        ) : (
          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="text-sm text-green-700">✅ {email}로 인증 메일을 보냈습니다.<br/>메일함을 확인해 주세요.</p>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/components/assessment/LoginGate.tsx
git commit -m "feat: add LoginGate component for assessment auth"
```

---

## Task 8: ModeSelect + NameInput 컴포넌트

**Files:**
- Create: `src/components/assessment/ModeSelect.tsx`
- Create: `src/components/assessment/NameInput.tsx`

- [ ] **Step 1: ModeSelect 컴포넌트 생성**

```typescript
// src/components/assessment/ModeSelect.tsx
'use client';

import type { GameMode } from '@/lib/assessment/types';

interface ModeSelectProps {
  onSelect: (mode: GameMode) => void;
}

export default function ModeSelect({ onSelect }: ModeSelectProps) {
  const modes = [
    { mode: 'personal' as GameMode, emoji: '🧑', title: '개인 검사', desc: '나만의 미래 역량을 탐색합니다', badge: '3분 · 8문항', badgeColor: 'bg-indigo-50 text-indigo-600' },
    { mode: 'family' as GameMode, emoji: '👨‍👩‍👧‍👦', title: '가족 검사', desc: '가족이 각자 검사하고\n결과를 비교합니다', badge: '2~10명 · 각 3분', badgeColor: 'bg-teal-50 text-teal-600' },
    { mode: 'team' as GameMode, emoji: '👥', title: '팀 검사', desc: '팀원이 각자 검사하고\n팀 전략을 도출합니다', badge: '2~10명 · 각 3분', badgeColor: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen px-5" style={{ background: '#F5F4FF' }}>
      <div className="pt-16 pb-8 text-center">
        <div className="text-5xl mb-2">🎮</div>
        <h1 className="text-2xl font-extrabold">어떻게 검사할까요?</h1>
        <p className="text-sm text-gray-500 mt-2">혼자 해도, 함께 해도 재미있어요!</p>
      </div>
      <div className="flex flex-col gap-4 max-w-[420px] w-full">
        {modes.map(m => (
          <button
            key={m.mode}
            onClick={() => onSelect(m.mode)}
            className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center transition-all hover:border-indigo-400 active:scale-[0.97]"
          >
            <div className="text-4xl mb-2">{m.emoji}</div>
            <div className="text-lg font-extrabold mb-1">{m.title}</div>
            <div className="text-sm text-gray-500 whitespace-pre-line">{m.desc}</div>
            <div className={`inline-block text-xs font-semibold px-3 py-1 rounded-lg mt-2 ${m.badgeColor}`}>{m.badge}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: NameInput 컴포넌트 생성**

```typescript
// src/components/assessment/NameInput.tsx
'use client';

import { useState } from 'react';

interface NameInputProps {
  onSubmit: (name: string) => void;
  emoji?: string;
  title?: string;
  desc?: string;
}

export default function NameInput({ onSubmit, emoji = '🧑', title = '이름을 알려주세요', desc = '결과에 이름이 표시됩니다' }: NameInputProps) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) onSubmit(name.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-5" style={{ background: '#F5F4FF' }}>
      <div className="max-w-[420px] w-full text-center">
        <div className="text-5xl mb-3">{emoji}</div>
        <h1 className="text-2xl font-extrabold mb-1">{title}</h1>
        <p className="text-sm text-gray-500 mb-6">{desc}</p>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="이름 입력"
          maxLength={10}
          autoFocus
          className="w-full py-4 px-5 border-2 border-gray-200 rounded-2xl text-lg font-semibold text-center outline-none focus:border-indigo-400 bg-white"
        />
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-base font-bold mt-4 disabled:opacity-30 transition-opacity"
        >
          시작하기 →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 커밋**

```bash
git add src/components/assessment/ModeSelect.tsx src/components/assessment/NameInput.tsx
git commit -m "feat: add ModeSelect and NameInput components"
```

---

## Task 9: QuestionTypeSelect 컴포넌트

**Files:**
- Create: `src/components/assessment/QuestionTypeSelect.tsx`

- [ ] **Step 1: 컴포넌트 생성**

```typescript
// src/components/assessment/QuestionTypeSelect.tsx
'use client';

import type { QuestionType } from '@/lib/assessment/types';

interface QuestionTypeSelectProps {
  onSelect: (qtype: QuestionType) => void;
}

const QTYPES = [
  { type: 'scenario' as QuestionType, icon: '📖', title: '시나리오형', desc: '현실적인 상황 선택', tag: '논리적' },
  { type: 'game' as QuestionType, icon: '🎮', title: '게임 비유형', desc: '게임 상황으로 질문', tag: '게임친화' },
  { type: 'image' as QuestionType, icon: '🖼️', title: '이미지 선택형', desc: '직관적으로 선택', tag: '직관적' },
  { type: 'rank' as QuestionType, icon: '📊', title: '순위 매기기형', desc: '우선순위 배열', tag: '분석적' },
];

export default function QuestionTypeSelect({ onSelect }: QuestionTypeSelectProps) {
  return (
    <div className="flex flex-col items-center min-h-screen px-5" style={{ background: '#F5F4FF' }}>
      <div className="pt-16 pb-8 text-center">
        <div className="text-5xl mb-2">🎯</div>
        <h1 className="text-2xl font-extrabold">검사 방식을 선택하세요</h1>
        <p className="text-sm text-gray-500 mt-2">어떤 유형을 선택하느냐도 당신의 인지 스타일입니다</p>
      </div>
      <div className="flex flex-col gap-3 max-w-[420px] w-full">
        {QTYPES.map(q => (
          <button
            key={q.type}
            onClick={() => onSelect(q.type)}
            className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-5 text-left hover:border-indigo-300 transition-colors"
          >
            <div className="text-3xl">{q.icon}</div>
            <div className="flex-1">
              <h4 className="font-extrabold text-base">{q.title}</h4>
              <p className="text-sm text-gray-500">{q.desc}</p>
              <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 mt-1">{q.tag}</span>
            </div>
          </button>
        ))}
        <button
          onClick={() => onSelect('scenario')}
          className="py-3 text-sm text-gray-400 hover:text-gray-600"
        >
          건너뛰기
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/components/assessment/QuestionTypeSelect.tsx
git commit -m "feat: add QuestionTypeSelect component"
```

---

## Task 10: AssessmentEngine 컴포넌트

이것이 가장 큰 컴포넌트 — 검사 8문항을 진행하는 메인 엔진.

**Files:**
- Create: `src/components/assessment/AssessmentEngine.tsx`
- Create: `src/components/assessment/ParticleEffect.tsx`
- Create: `src/components/assessment/BTGuide.tsx`

- [ ] **Step 1: ParticleEffect 컴포넌트**

```typescript
// src/components/assessment/ParticleEffect.tsx
'use client';

import { useRef, useCallback } from 'react';

export function useParticles() {
  const containerRef = useRef<HTMLDivElement>(null);

  const spawn = useCallback((x: number, y: number) => {
    const container = containerRef.current;
    if (!container) return;
    const emojis = ['✨','🌟','💫','⚡','🔥','💥','🎯','🚀'];
    for (let i = 0; i < 6; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.left = `${x + (Math.random() - 0.5) * 80}px`;
      p.style.top = `${y}px`;
      p.style.animationDuration = `${0.6 + Math.random() * 0.6}s`;
      container.appendChild(p);
      setTimeout(() => p.remove(), 1200);
    }
  }, []);

  const ParticleContainer = () => (
    <div ref={containerRef} className="particle-container" />
  );

  return { spawn, ParticleContainer };
}
```

- [ ] **Step 2: BTGuide 컴포넌트**

```typescript
// src/components/assessment/BTGuide.tsx
'use client';

import { BT_COMMENTS } from '@/lib/assessment/data';

export default function BTGuide({ round }: { round: number }) {
  const comment = BT_COMMENTS[round] || BT_COMMENTS[0];
  return (
    <div className="bt-guide">
      <div className="bt-avatar">{comment.emoji}</div>
      <div className="bt-msg">{comment.msg}</div>
    </div>
  );
}
```

- [ ] **Step 3: AssessmentEngine 컴포넌트**

이것은 기존 HTML의 핵심 검사 로직 전체를 React로 변환하는 대규모 컴포넌트. `bts-assessment-site.html` line 936~1200의 로직을 React state + useEffect로 재구현.

```typescript
// src/components/assessment/AssessmentEngine.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { QuestionType, Scores, Scenario, BehaviorEntry, AssessmentResult, SkillKey } from '@/lib/assessment/types';
/* 참고: ScenarioQuestion, ImageQuestion, RankQuestion은 이 파일 하단에 정의됨 */
import { buildScenarios, normalizeScores, classifyType, calculateAvgScore } from '@/lib/assessment/scoring';
import { SKILLS_INFO, FB_SUBS, BG_COLORS } from '@/lib/assessment/data';
import { useParticles } from './ParticleEffect';
import BTGuide from './BTGuide';

interface AssessmentEngineProps {
  questionType: QuestionType;
  playerName: string;
  onComplete: (result: AssessmentResult) => void;
}

export default function AssessmentEngine({ questionType, playerName, onComplete }: AssessmentEngineProps) {
  const [scenarios] = useState<Scenario[]>(() => buildScenarios(questionType));
  const [round, setRound] = useState(0);
  const [scores, setScores] = useState<Scores>({ structural:0, creative:0, emotional:0, adaptive:0, ethical:0, collab:0 });
  const [behaviorData, setBehaviorData] = useState<BehaviorEntry[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showIntermission, setShowIntermission] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; sub: string } | null>(null);
  const [comboCount, setComboCount] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const startTimeRef = useRef(Date.now());
  const roundStartRef = useRef(Date.now());
  const lastAnswerRef = useRef(0);
  const { spawn, ParticleContainer } = useParticles();

  const hasShownIntermissionRef = useRef(false);

  // 타이머 — useCallback으로 stale closure 방지
  const handleTimeoutCb = useCallback(() => {
    setBehaviorData(prev => [...prev, { round, type: scenarios[round]?.type || '', time: Date.now() - roundStartRef.current, skipped: true }]);
    showFeedbackMsg('⏰ 시간 초과');
    setTimeout(advanceRound, 1200);
  }, [round, scenarios]);

  useEffect(() => {
    if (showIntermission || feedback) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeoutCb();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [round, showIntermission, feedback, handleTimeoutCb]);

  // 배경색 변화
  useEffect(() => {
    document.body.style.background = BG_COLORS[Math.min(round, BG_COLORS.length - 1)];
    return () => { document.body.style.background = ''; };
  }, [round]);

  // 중간 인터미션 — ref로 무한 루프 방지
  useEffect(() => {
    if (round === 4 && !hasShownIntermissionRef.current) {
      hasShownIntermissionRef.current = true;
      setShowIntermission(true);
      setTimeout(() => setShowIntermission(false), 2500);
    }
  }, [round]);

  const showFeedbackMsg = (text: string) => {
    const sub = FB_SUBS[Math.floor(Math.random() * FB_SUBS.length)];
    setFeedback({ text, sub });
    setTimeout(() => setFeedback(null), 1000);
  };

  const checkCombo = () => {
    const now = Date.now();
    if (now - lastAnswerRef.current < 4000 && lastAnswerRef.current > 0) {
      setComboCount(prev => {
        const next = prev + 1;
        if (next >= 2) {
          setShowCombo(true);
          setTimeout(() => setShowCombo(false), 1500);
        }
        return next;
      });
    } else {
      setComboCount(1);
    }
    lastAnswerRef.current = now;
  };

  const selectChoice = (idx: number, scenario: Scenario) => {
    const choice = scenario.choices![idx];
    const newScores = { ...scores };
    for (const [k, v] of Object.entries(choice.skills)) {
      if (k in newScores) newScores[k as SkillKey] += v as number;
    }
    setScores(newScores);
    setBehaviorData(prev => [...prev, { round, type: scenario.type, choiceIdx: idx, time: Date.now() - roundStartRef.current }]);
    checkCombo();
    showFeedbackMsg(choice.fb || choice.label || '선택 완료');
    setTimeout(advanceRound, 900);
  };

  const submitRank = (scenario: Scenario, items: string[]) => {
    const newScores = { ...scores };
    items.forEach((item, i) => {
      const idx = scenario.items!.indexOf(item);
      const skillKey = scenario.skillMap![idx];
      const pts = Math.max(scenario.items!.length - i, 0);
      if (skillKey && skillKey in newScores) newScores[skillKey] += pts;
    });
    setScores(newScores);
    setBehaviorData(prev => [...prev, { round, type: 'rank', time: Date.now() - roundStartRef.current, order: items }]);
    checkCombo();
    showFeedbackMsg('순위 기록 완료!');
    setTimeout(advanceRound, 800);
  };

  const advanceRound = () => {
    const next = round + 1;
    if (next >= scenarios.length) {
      finishAssessment();
    } else {
      setFadeOut(true);
      setTimeout(() => {
        setRound(next);
        setTimeLeft(30);
        roundStartRef.current = Date.now();
        setFadeOut(false);
      }, 300);
    }
  };

  const finishAssessment = () => {
    document.body.style.background = '';
    const normScores = normalizeScores(scores);
    const typeKey = classifyType(normScores);
    const avgScore = calculateAvgScore(normScores);
    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    onComplete({ playerName, selectedQType: questionType, scores, normScores, typeKey, avgScore, behaviorData, durationSeconds });
  };

  // 인터미션 화면
  if (showIntermission) {
    const midNorm = normalizeScores(scores);
    const midSorted = (Object.entries(midNorm) as [SkillKey, number][]).sort((a, b) => b[1] - a[1]);
    const topSkill = SKILLS_INFO[midSorted[0][0]];
    return (
      <div className="intermission">
        <div className="inter-emoji">📊</div>
        <div className="inter-title">전반전 분석 완료!</div>
        <div className="inter-sub">4문항 동안 당신의 선택을 분석했어요.<br/>현재 가장 강한 역량은...</div>
        <div className="inter-peek">{topSkill.icon} {topSkill.name}</div>
        <div className="inter-sub" style={{ marginTop: 16, fontSize: 13 }}>후반전에서 뒤집힐 수 있을까요? 🤔</div>
      </div>
    );
  }

  const scenario = scenarios[round];
  if (!scenario) return null;

  return (
    <div className="assessment-wrap">
      <ParticleContainer />

      {/* 콤보 배지 */}
      <div className={`combo-badge ${showCombo ? 'show' : ''}`}>
        🔥 {comboCount}콤보!
      </div>

      {/* 피드백 */}
      {feedback && (
        <div className="feedback show">
          {feedback.text}
          <div className="fb-sub">{feedback.sub}</div>
        </div>
      )}

      {/* 진행바 + 타이머 */}
      <div className="assess-header">
        <span className="assess-round">{round + 1}/{scenarios.length}</span>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${((round + 1) / scenarios.length) * 100}%` }} /></div>
        <div className="assess-timer-wrap">
          <span>검사 끝내기</span>
          <span className={`assess-timer ${timeLeft <= 5 ? 'warning' : ''}`}>{timeLeft}</span>
        </div>
      </div>

      {/* 비티 가이드 */}
      <BTGuide round={round} />

      {/* 문항 렌더링 */}
      <div className={`assess-body ${fadeOut ? 'fade-out' : ''}`}>
        {scenario.type === 'scenario' && (
          <ScenarioQuestion scenario={scenario} onSelect={(idx) => selectChoice(idx, scenario)} spawn={spawn} />
        )}
        {scenario.type === 'image' && (
          <ImageQuestion scenario={scenario} onSelect={(idx) => selectChoice(idx, scenario)} spawn={spawn} />
        )}
        {scenario.type === 'rank' && (
          <RankQuestion scenario={scenario} onSubmit={(items) => submitRank(scenario, items)} spawn={spawn} />
        )}
      </div>
    </div>
  );
}

// --- 하위 컴포넌트: ScenarioQuestion ---
function ScenarioQuestion({ scenario, onSelect, spawn }: { scenario: Scenario; onSelect: (idx: number) => void; spawn: (x: number, y: number) => void }) {
  const keys = ['A','B','C','D'];
  return (
    <>
      <div className="assess-context">{scenario.ctx}</div>
      <div className="assess-emoji">{scenario.emoji}</div>
      <div className="assess-question">{scenario.text}</div>
      <div className="assess-choices">
        {scenario.choices!.map((c, i) => (
          <button key={i} className="assess-choice" onClick={(e) => {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            spawn(rect.left + rect.width / 2, rect.top);
            onSelect(i);
          }}>
            <div className="assess-key">{keys[i]}</div>
            <div className="assess-choice-text">{c.text}</div>
          </button>
        ))}
      </div>
    </>
  );
}

// --- 하위 컴포넌트: ImageQuestion ---
function ImageQuestion({ scenario, onSelect, spawn }: { scenario: Scenario; onSelect: (idx: number) => void; spawn: (x: number, y: number) => void }) {
  return (
    <>
      <div className="assess-context">{scenario.ctx}</div>
      <div className="assess-emoji">{scenario.emoji}</div>
      <div className="assess-question">{scenario.text}</div>
      <div className="assess-image-grid">
        {scenario.choices!.map((c, i) => (
          <button key={i} className="assess-image-card" onClick={(e) => {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            spawn(rect.left + rect.width / 2, rect.top);
            onSelect(i);
          }}>
            <div className="emoji">{c.emoji}</div>
            <div className="label">{c.label}</div>
            <div className="desc">{c.desc}</div>
          </button>
        ))}
      </div>
    </>
  );
}

// --- 하위 컴포넌트: RankQuestion (드래그 정렬) ---
function RankQuestion({ scenario, onSubmit, spawn }: { scenario: Scenario; onSubmit: (items: string[]) => void; spawn: (x: number, y: number) => void }) {
  const [items, setItems] = useState<string[]>([...scenario.items!]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const moveItem = (from: number, to: number) => {
    const next = [...items];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    setItems(next);
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      moveItem(dragIdx, idx);
      setDragIdx(idx);
    }
  };
  const handleDragEnd = () => setDragIdx(null);

  // 터치 드래그 지원
  const touchStartY = useRef(0);
  const touchIdx = useRef<number | null>(null);
  const handleTouchStart = (idx: number, e: React.TouchEvent) => {
    touchIdx.current = idx;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchIdx.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (Math.abs(diff) > 40) {
      const direction = diff > 0 ? 1 : -1;
      const newIdx = touchIdx.current + direction;
      if (newIdx >= 0 && newIdx < items.length) {
        moveItem(touchIdx.current, newIdx);
        touchIdx.current = newIdx;
        touchStartY.current = currentY;
      }
    }
  };
  const handleTouchEnd = () => { touchIdx.current = null; };

  return (
    <>
      <div className="assess-context">{scenario.ctx}</div>
      <div className="assess-emoji">{scenario.emoji}</div>
      <div className="assess-question">{scenario.text}</div>
      <div className="rank-list">
        {items.map((item, i) => (
          <div
            key={item}
            className={`rank-item ${dragIdx === i ? 'dragging' : ''}`}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDragEnd={handleDragEnd}
            onTouchStart={(e) => handleTouchStart(i, e)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="rank-num">{i + 1}</div>
            <div className="rank-text">{item}</div>
            <div className="rank-handle">☰</div>
          </div>
        ))}
      </div>
      <button className="rank-confirm" onClick={(e) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        spawn(rect.left + rect.width / 2, rect.top);
        onSubmit(items);
      }}>
        이 순서로 확정 ✓
      </button>
    </>
  );
}
```

- [ ] **Step 4: 커밋**

```bash
git add src/components/assessment/AssessmentEngine.tsx src/components/assessment/ParticleEffect.tsx src/components/assessment/BTGuide.tsx
git commit -m "feat: add AssessmentEngine with particles, combo, BT guide"
```

---

## Task 11: PersonalResult 컴포넌트

**Files:**
- Create: `src/components/assessment/PersonalResult.tsx`

- [ ] **Step 1: 결과 화면 컴포넌트 생성**

기존 HTML의 `renderResult()` 함수 (line 1200+)를 React로 변환. 게이지, 6차원 프로필, 유형 판정, 공유 버튼 포함.

```typescript
// src/components/assessment/PersonalResult.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import type { AssessmentResult } from '@/lib/assessment/types';
import { SKILLS_INFO, ARCHETYPES, TYPE_VERDICTS } from '@/lib/assessment/data';
import { useAuth } from '@/context/AuthContext';

interface PersonalResultProps {
  result: AssessmentResult;
  onSaved?: (resultId: string) => void;
}

export default function PersonalResult({ result, onSaved }: PersonalResultProps) {
  const { session } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const arch = ARCHETYPES[result.typeKey];
  const verdict = TYPE_VERDICTS[result.typeKey];

  // 결과 저장
  useEffect(() => {
    if (!session?.access_token || saved) return;
    setSaving(true);
    fetch('/api/assessment/save-result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(result),
    })
      .then(res => res.json())
      .then(data => {
        if (data.resultId) {
          setSaved(true);
          onSaved?.(data.resultId);
        }
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  }, [session, saved]);

  const sortedScores = Object.entries(result.normScores)
    .sort((a, b) => b[1] - a[1]) as [string, number][];

  return (
    <div className="flex flex-col items-center min-h-screen px-5 pb-20" style={{ background: '#F5F4FF' }}>
      {/* 게이지 + 유형 히어로 */}
      <div className="text-center pt-10 mb-6">
        <div className="text-6xl mb-2">{result.avgScore}</div>
        <div className="text-sm text-gray-500">종합 미래역량 점수</div>
        <div className="text-6xl mt-4">{arch.emoji}</div>
        <h1 className="text-2xl font-extrabold mt-2">{result.playerName}님은 {arch.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{arch.sub}</p>
      </div>

      {/* 한 줄 판결 */}
      <div className="max-w-[500px] w-full bg-white rounded-2xl p-5 border border-gray-200 mb-4">
        <h3 className="font-bold mb-2">📋 한 줄 판결</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{verdict}</p>
      </div>

      {/* 6차원 프로필 */}
      <div className="max-w-[500px] w-full bg-white rounded-2xl p-5 border border-gray-200 mb-4">
        <h3 className="font-bold mb-4">📊 6차원 역량 프로필</h3>
        {sortedScores.map(([key, val], i) => {
          const skill = SKILLS_INFO[key as keyof typeof SKILLS_INFO];
          const isStrength = i < 2;
          return (
            <div key={key} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>{skill.icon} {skill.name} {isStrength && <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded">강점</span>}</span>
                <span className="font-bold">{val}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${val}%`, background: skill.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 공유 버튼 */}
      <div className="max-w-[500px] w-full bg-white rounded-2xl p-5 border border-gray-200 mb-4">
        <h3 className="font-bold mb-3">📤 공유하기</h3>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const text = `나의 미래역량 검사 결과: ${arch.emoji} ${arch.title} (${result.avgScore}점)\n→ ${window.location.origin}/assessment`;
              navigator.clipboard.writeText(text).catch(() => {});
            }}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold"
          >
            📋 링크 복사
          </button>
          <button
            onClick={() => {
              const text = `나의 미래역량: ${arch.emoji}${arch.title} (${result.avgScore}점)\n→ ${window.location.origin}/assessment`;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold"
          >
            𝕏 공유
          </button>
        </div>
      </div>

      {/* BTS CTA */}
      <div className="max-w-[500px] w-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white text-center mb-4">
        <h3 className="text-lg font-bold mb-2">🔮 직업 미래도 분석하기</h3>
        <p className="text-sm opacity-80 mb-4">역량과 직업을 교차 분석하면 더 구체적인 전환 전략이 나옵니다</p>
        <button
          onClick={() => window.open('https://job-future-analyzer.vercel.app', '_blank')}
          className="bg-white text-indigo-600 font-bold py-3 px-6 rounded-xl"
        >
          BTS에서 심층 분석 받기 →
        </button>
      </div>

      {saving && <p className="text-xs text-gray-400 mt-2">결과 저장 중...</p>}

      {/* 면책 */}
      <p className="text-xs text-gray-400 text-center max-w-[500px] mt-8 leading-relaxed">
        본 검사는 자기인식 탐색 도구이며, 임상적 진단이나 채용 평가의 목적으로 사용될 수 없습니다.
        결과는 참고 자료이며, 전문적 진로 상담을 대체하지 않습니다.
      </p>
      <p className="text-xs text-gray-400 mt-2">© 2026 LoginFuture Ministry. All rights reserved.</p>
    </div>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/components/assessment/PersonalResult.tsx
git commit -m "feat: add PersonalResult component with auto-save"
```

---

## Task 12: 메인 검사 페이지 (SPA 스크린 관리)

**Files:**
- Create: `src/app/assessment/page.tsx`

- [ ] **Step 1: 페이지 컴포넌트 생성**

```typescript
// src/app/assessment/page.tsx
'use client';

import { useState } from 'react';
import type { GameMode, QuestionType, AssessmentResult } from '@/lib/assessment/types';
import LoginGate from '@/components/assessment/LoginGate';
import ModeSelect from '@/components/assessment/ModeSelect';
import NameInput from '@/components/assessment/NameInput';
import QuestionTypeSelect from '@/components/assessment/QuestionTypeSelect';
import AssessmentEngine from '@/components/assessment/AssessmentEngine';
import PersonalResult from '@/components/assessment/PersonalResult';
import './assessment.css';

type Screen = 'mode' | 'name' | 'qtype' | 'assess' | 'result';

export default function AssessmentPage() {
  const [screen, setScreen] = useState<Screen>('mode');
  const [gameMode, setGameMode] = useState<GameMode>('personal');
  const [playerName, setPlayerName] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('scenario');
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const handleModeSelect = (mode: GameMode) => {
    setGameMode(mode);
    if (mode === 'personal') {
      setScreen('name');
    } else {
      // 가족/팀은 플랜 2에서 구현. 현재는 개인만 지원.
      // TODO: 그룹 설정 화면으로 이동
      setScreen('name');
    }
  };

  const handleNameSubmit = (name: string) => {
    setPlayerName(name);
    setScreen('qtype');
  };

  const handleQTypeSelect = (qtype: QuestionType) => {
    setQuestionType(qtype);
    setScreen('assess');
  };

  const handleComplete = (result: AssessmentResult) => {
    setResult(result);
    setScreen('result');
  };

  return (
    <LoginGate>
      {screen === 'mode' && <ModeSelect onSelect={handleModeSelect} />}
      {screen === 'name' && <NameInput onSubmit={handleNameSubmit} />}
      {screen === 'qtype' && <QuestionTypeSelect onSelect={handleQTypeSelect} />}
      {screen === 'assess' && (
        <AssessmentEngine
          questionType={questionType}
          playerName={playerName}
          onComplete={handleComplete}
        />
      )}
      {screen === 'result' && result && <PersonalResult result={result} />}
    </LoginGate>
  );
}
```

- [ ] **Step 2: 빌드 테스트**

```bash
cd C:/Users/futur/job-future-analyzer
npm run build
```

빌드 오류가 있으면 수정. 주로 import 경로, 타입 오류 등.

- [ ] **Step 3: 로컬 테스트**

```bash
npm run dev
```

브라우저에서 `http://localhost:3000/assessment` 접속 → 로그인 → 모드 선택 → 이름 입력 → 검사 유형 → 8문항 → 결과 확인.

체크리스트:
- [ ] 로그인 게이트 작동 (미로그인 시 로그인 화면)
- [ ] Google 로그인 성공
- [ ] 모드 선택 → 이름 입력 → 검사 유형 → 검사 시작
- [ ] 파티클 + 콤보 작동
- [ ] 비티 가이드 표시
- [ ] 4문항 후 인터미션
- [ ] 배경색 변화
- [ ] 결과 화면 정상 표시
- [ ] Supabase DB에 결과 저장 확인
- [ ] 콘솔 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add src/app/assessment/page.tsx src/app/assessment/assessment.css
git commit -m "feat: add assessment main page with full personal mode flow"
```

---

## Task 13: 배포

- [ ] **Step 1: Vercel 배포**

```bash
cd C:/Users/futur/job-future-analyzer
git push origin main
```

Vercel이 자동 배포. `job-future-analyzer.vercel.app/assessment` 에서 확인.

- [ ] **Step 2: 라이브 테스트**

`https://job-future-analyzer.vercel.app/assessment` 에서 전체 플로우 테스트.

- [ ] **Step 3: 최종 커밋**

```bash
git add -A
git commit -m "chore: final adjustments for assessment integration"
```

---

## Summary

| Task | 내용 | 예상 시간 |
|------|------|-----------|
| 1 | TypeScript 타입 정의 | 5분 |
| 2 | 상수 데이터 추출 | 15분 |
| 3 | 스코어링 로직 추출 | 10분 |
| 4 | DB 마이그레이션 SQL | 10분 |
| 5 | 결과 저장 API | 10분 |
| 6 | 검사 CSS 추출 | 15분 |
| 7 | LoginGate 컴포넌트 | 10분 |
| 8 | ModeSelect + NameInput | 10분 |
| 9 | QuestionTypeSelect | 5분 |
| 10 | AssessmentEngine (메인) | 30분 |
| 11 | PersonalResult | 15분 |
| 12 | 메인 페이지 + 통합 테스트 | 20분 |
| 13 | 배포 | 10분 |
| **합계** | | **~165분** |

---

## 다음 플랜

**플랜 2: 그룹 모드 (가족/팀)** — 이 플랜 완료 후 작성
- 그룹 생성/참가 API
- 초대 링크 페이지
- 대기 화면 (Supabase Realtime)
- Claude AI 그룹 분석
- 가족 결과 (관계 개선 + 미션) / 팀 결과 (화합 전략 + 목표 달성)
