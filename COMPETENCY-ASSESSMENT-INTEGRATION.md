# 미래역량 검사 통합 설계서 (Claude Code용)

## 개요
기존 "내 직업의 미래" 앱에 **미래역량 시나리오형 검사(무료버전)**를 통합한다.
사용자가 직업명을 입력하면 AI 분석이 돌아가는 동안(12~20초) 역량 검사를 먼저 진행하고,
분석 완료 후 결과 탭에 "미래역량 프로파일" 탭을 추가하여 **AI 대체율 + 역량 검사 결과를 종합**해서 보여준다.

**추가 API 비용: 0원** — 검사는 클라이언트 사이드에서 완전히 실행됨 (하드코딩된 시나리오 사용)

---

## 아키텍처

```
[직업 입력] → handleAnalyze() 호출
  ├─ POST /api/analyze (기존 그대로)  ← 서버에서 Claude API 호출 (12~20초)
  └─ 동시에 역량검사 UI 표시          ← 클라이언트 사이드 (API 호출 없음)
      └─ 사용자가 검사 진행하는 동안 API 응답 대기

[둘 다 완료] → 결과 화면
  ├─ 기존 10개 탭 (overview, dimensions, horizon, skills, iceberg, income, industry, transitions, consulting, coach)
  └─ 새 탭: "🧠 미래역량" (competency) ← 검사 결과 + AI 분석 결과 종합
```

---

## 파일 구조 (신규 생성/수정)

### 신규 생성
```
src/components/CompetencyAssessment.tsx   ← 검사 UI 컴포넌트 (메인)
src/components/CompetencyResult.tsx       ← 결과 탭 컴포넌트
src/lib/competency-scenarios.ts           ← 시나리오 데이터 (분리)
src/types/competency.ts                   ← 타입 정의
```

### 수정
```
src/app/page.tsx                          ← 검사 플로우 통합, 탭 추가
```

---

## 1. 타입 정의 (`src/types/competency.ts`)

```typescript
// 6차원 역량 모델
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

// 검사 질문 유형
export type QuestionType = 'scenario' | 'game' | 'image' | 'rank';

// 시나리오 선택지
export interface ScenarioChoice {
  text: string;
  skills: Partial<CompetencyScores>;
  fb: string;  // 피드백 메시지
}

// 시나리오 문제
export interface Scenario {
  context: string;
  emoji: string;
  text: string;
  type: 'scenario' | 'image' | 'rank';
  persona?: string;
  choices?: ScenarioChoice[];
  // image type
  // rank type
  items?: string[];
  skillMap?: CompetencyKey[];
}

// 행동 데이터
export interface BehaviorData {
  round: number;
  type: string;
  choiceIdx?: number;
  time: number;
  order?: string[];
  words?: string[];
}

// 검사 결과
export interface CompetencyResult {
  scores: CompetencyScores;
  topKey: CompetencyKey;
  archetype: string;
  metaAnalysis: {
    questionType: QuestionType;
    questionTypeMeaning: string;
    avgResponseTime: number;
    responseStyle: string;
  };
  behaviorData: BehaviorData[];
}

// 역량 메타 정보
export const COMPETENCY_INFO: Record<CompetencyKey, {
  icon: string;
  name: string;
  color: string;
  description: string;
}> = {
  structural: { icon: '🧩', name: '구조적 사고', color: '#6C63FF', description: '복잡한 문제를 분해하고 패턴을 찾는 능력' },
  creative:   { icon: '🎨', name: '창의적 재설계', color: '#FF6B6B', description: '기존 틀을 깨고 새로운 해법을 만드는 능력' },
  emotional:  { icon: '💫', name: '감성 연결', color: '#F472B6', description: '사람의 감정을 읽고 공감하는 능력' },
  adaptive:   { icon: '⚡', name: '적응 민첩성', color: '#FFE66D', description: '변화에 빠르게 대응하고 학습하는 능력' },
  ethical:    { icon: '⚖️', name: '윤리적 판단', color: '#A78BFA', description: '가치와 원칙에 기반한 판단 능력' },
  collab:     { icon: '🤝', name: '협업 지능', color: '#34D399', description: '다양한 사람과 시너지를 만드는 능력' },
};
```

---

## 2. 시나리오 데이터 (`src/lib/competency-scenarios.ts`)

기존 `future-skill-advanced.html`의 시나리오 뱅크를 TypeScript 모듈로 변환.

```typescript
import { Scenario, QuestionType } from '@/types/competency';

// 성인 시나리오 (현실 직장/이직/부업/가정 상황)
export const adultScenarios: Scenario[] = [
  {
    context: '직장 위기',
    emoji: '💼',
    text: '당신의 팀에서 AI 도구를 도입했는데, 동료가 "우리 일자리가 위험하다"며 불안해합니다. 팀장으로서 어떻게 하겠습니까?',
    type: 'scenario',
    choices: [
      { text: '"AI가 대체하는 업무 vs 우리만의 강점"을 정리해서 팀 미팅을 연다', skills: { structural: 3, collab: 1 }, fb: '구조로 불안을 해소하다' },
      { text: '"이걸 기회로 새 역할을 만들자"며 AI+인간 협업 모델을 제안한다', skills: { creative: 3, adaptive: 1 }, fb: '위기를 기회로 전환' },
      { text: '동료의 감정을 먼저 들어주고, 함께 대응 방안을 찾자고 한다', skills: { emotional: 3, collab: 1 }, fb: '사람을 먼저 보는 리더' },
      { text: 'AI 도입의 윤리적 가이드라인을 먼저 만들자고 경영진에 건의한다', skills: { ethical: 3, structural: 1 }, fb: '원칙이 있는 대응' },
    ]
  },
  // ... (future-skill-advanced.html의 adult_scenario 배열에서 가져오기)
];

// 청소년 시나리오 (게임 맥락)
export const youthScenarios: Scenario[] = [
  // ... (future-skill-advanced.html의 youth_game 배열에서 가져오기)
];

// 이미지형 질문
export const imageScenarios: Scenario[] = [
  // ... (future-skill-advanced.html의 image_type 배열에서 가져오기)
];

// 순위형 질문
export const rankScenarios: Scenario[] = [
  // ... (future-skill-advanced.html의 rank_type 배열에서 가져오기)
];

// 질문유형 메타 의미
export const questionTypeMap: Record<QuestionType, string> = {
  scenario: '논리적 · 현실지향',
  game: '은유적 · 게임친화',
  image: '직관적 · 감각형',
  rank: '분석적 · 체계형',
};

// 모드(성인/청소년)와 질문유형에 따라 시나리오 빌드
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

---

## 3. 검사 UI 컴포넌트 (`src/components/CompetencyAssessment.tsx`)

### 동작 플로우
```
1. [질문유형 선택] — 4가지 카드 중 택 1 (시나리오/게임은유/이미지/순위)
   ※ 질문유형 선택 자체가 인지 스타일 메타데이터
   
2. [검사 진행] — 8문제, 각 문제당 20초 타이머
   - 시나리오형: 4지선다 텍스트
   - 이미지형: 이모지+설명 2x2 그리드
   - 순위형: 드래그로 순서 변경 (터치 지원 필수!)
   - 각 선택마다 반응시간 기록

3. [검사 완료] — CompetencyResult 객체 생성, 부모에 콜백
```

### Props 인터페이스
```typescript
interface CompetencyAssessmentProps {
  mode: 'adult' | 'youth';
  onComplete: (result: CompetencyResult) => void;
  onSkip?: () => void;  // 검사 건너뛰기
}
```

### 핵심 구현 포인트
1. **타이머**: 20초, 5초 이하 시 경고 색상
2. **터치 지원**: 모든 버튼에 `touch-action: manipulation` + `addEventListener('touchend', ...)` 패턴 사용 (inline onclick 사용 금지!)
3. **순위형 드래그**: HTML5 drag + touch 이벤트 병렬 처리
4. **진행 표시**: 상단 프로그레스 바 (현재/전체)
5. **피드백**: 선택 후 짧은 긍정 피드백 표시 (0.8초)
6. **스타일**: 앱의 기존 디자인 시스템 따르기 (배경 #F8F7FF, 카드 white, 보라 #6C63FF)

### 스타일 가이드 (기존 앱에 맞춤)
- 배경: `#F8F7FF` (기존 앱 메인 배경)
- 카드: `white`, `border-radius: 28px`, `box-shadow: 0 4px 24px rgba(0,0,0,0.06)`
- 프라이머리: `#6C63FF`
- 텍스트: `#1E1B4B` (제목), `#6B7280` (설명)
- 폰트: 시스템 폰트 (앱 기존과 동일)

---

## 4. 결과 탭 컴포넌트 (`src/components/CompetencyResult.tsx`)

### Props
```typescript
interface CompetencyResultProps {
  competencyResult: CompetencyResult;
  analysisResult: AnalysisResult;  // 기존 AI 분석 결과
  jobName: string;
  mode: 'adult' | 'youth';
}
```

### 화면 구성
```
┌──────────────────────────────────┐
│  🧠 {직업명}의 미래역량 프로파일   │
│                                   │
│  ┌─────────────────────────────┐  │
│  │  6차원 레이더 차트 (SVG)     │  │
│  │  or 수평 바 차트              │  │
│  └─────────────────────────────┘  │
│                                   │
│  📊 AI 대체율과 역량 교차 분석    │
│  ┌─────────────────────────────┐  │
│  │ "AI 대체율 72%인 {직업명}에서 │  │
│  │  가장 중요한 역량은           │  │
│  │  {top역량}이며, 당신의       │  │
│  │  {top역량} 점수는 {N}%입니다" │  │
│  │                              │  │
│  │  ✅ 강점: {높은 역량} → 유지  │  │
│  │  ⚠️ 보완: {낮은 역량} → 개발 │  │
│  └─────────────────────────────┘  │
│                                   │
│  🎯 맞춤 성장 전략               │
│  ┌─────────────────────────────┐  │
│  │ AI 대체율 + 역량 조합 기반    │  │
│  │ 3가지 구체적 행동 제안        │  │
│  └─────────────────────────────┘  │
│                                   │
│  💡 사고방식 메타분석             │
│  ┌─────────────────────────────┐  │
│  │ 선택한 질문유형: {type}       │  │
│  │ → {의미 해석}                │  │
│  │ 평균 응답시간: {N}초          │  │
│  │ → {빠른/신중한} 의사결정자    │  │
│  └─────────────────────────────┘  │
└──────────────────────────────────┘
```

### 종합 분석 로직 (클라이언트 사이드)

```typescript
function generateCrossAnalysis(
  competency: CompetencyResult,
  analysis: AnalysisResult,
  jobName: string
): CrossAnalysis {
  const overallRisk = analysis.overallScore; // AI 대체율 0~100
  const topCompetency = competency.topKey;
  const scores = competency.scores;
  
  // AI 대체율이 높은 직업에서 어떤 역량이 생존에 중요한지 매핑
  const survivalSkills: Record<string, CompetencyKey[]> = {
    high_risk:   ['creative', 'emotional', 'ethical'],   // 대체율 70%+
    medium_risk: ['adaptive', 'structural', 'collab'],   // 대체율 40~70%
    low_risk:    ['structural', 'adaptive', 'creative'], // 대체율 ~40%
  };
  
  const riskLevel = overallRisk >= 70 ? 'high_risk' : overallRisk >= 40 ? 'medium_risk' : 'low_risk';
  const importantSkills = survivalSkills[riskLevel];
  
  // 중요 역량 중 사용자가 약한 것 = 보완 필요
  const weakPoints = importantSkills.filter(k => scores[k] < Math.max(...Object.values(scores)) * 0.6);
  // 중요 역량 중 사용자가 강한 것 = 강점
  const strengths = importantSkills.filter(k => scores[k] >= Math.max(...Object.values(scores)) * 0.7);
  
  return { riskLevel, importantSkills, weakPoints, strengths, ... };
}
```

---

## 5. page.tsx 수정사항

### 5-1. import 추가
```typescript
import CompetencyAssessment from "@/components/CompetencyAssessment";
import CompetencyResult from "@/components/CompetencyResult";
import { CompetencyResult as CompetencyResultType } from "@/types/competency";
```

### 5-2. state 추가
```typescript
const [competencyResult, setCompetencyResult] = useState<CompetencyResultType | null>(null);
const [showAssessment, setShowAssessment] = useState(false);
const [assessmentCompleted, setAssessmentCompleted] = useState(false);
```

### 5-3. SECTIONS 배열에 탭 추가
```typescript
const SECTIONS = [
  { id: "overview",    icon: "📊", label: t.section_overview },
  { id: "competency",  icon: "🧠", label: "미래역량" },  // ← 새 탭 (2번째)
  { id: "dimensions",  icon: "🎯", label: t.section_dimensions },
  // ... 나머지 기존 탭
];
```

### 5-4. handleAnalyze 수정
```typescript
const handleAnalyze = async (job: string) => {
  // ... 기존 권한 체크 그대로 ...
  
  setIsLoading(true);
  setShowAssessment(true);       // ← 추가: 검사 UI 표시
  setAssessmentCompleted(false); // ← 추가
  setCompetencyResult(null);     // ← 추가
  
  // ... 기존 API 호출 로직 그대로 ...
};
```

### 5-5. 로딩 UI 영역 변경
기존 로딩 메시지 영역을 역량검사 UI로 교체:

```tsx
{isLoading && !result && (
  showAssessment && !assessmentCompleted ? (
    // 검사 진행 중: 검사 UI 표시
    <CompetencyAssessment
      mode={mode}
      onComplete={(res) => {
        setCompetencyResult(res);
        setAssessmentCompleted(true);
      }}
      onSkip={() => {
        setAssessmentCompleted(true);
      }}
    />
  ) : (
    // 검사 완료 but API 아직 로딩 중: 기존 로딩 메시지
    <div className="loading-area">
      <p>{loadingMsg}</p>
      {assessmentCompleted && <p style={{color:'#6C63FF',fontSize:'13px'}}>✅ 역량 검사 완료! AI 분석 결과를 기다리는 중...</p>}
    </div>
  )
)}
```

### 5-6. 결과 영역에 CompetencyResult 탭 추가
```tsx
{activeSection === "competency" && competencyResult && result && (
  <CompetencyResult
    competencyResult={competencyResult}
    analysisResult={result}
    jobName={jobName}
    mode={mode}
  />
)}
```

### 5-7. 검사 안 했을 경우 처리
```tsx
{activeSection === "competency" && !competencyResult && (
  <div style={{ textAlign: 'center', padding: '40px' }}>
    <p style={{ color: '#6B7280' }}>역량 검사를 진행하지 않았습니다.</p>
    <button onClick={() => {/* 검사 다시 시작 */}}>
      지금 검사하기
    </button>
  </div>
)}
```

---

## 6. 핵심 주의사항

### 모바일 터치 호환성 (중요!)
```
❌ 절대 하면 안 되는 것:
- body에 touch-action: none
- inline onclick="함수()" 사용
- HTML5 drag만 사용 (touch 미지원)

✅ 반드시 해야 하는 것:
- 모든 인터랙티브 요소에 touch-action: manipulation
- addEventListener('click', ...) + addEventListener('touchend', ...) 병렬
- 순위형은 touchstart/touchmove/touchend 별도 구현
- -webkit-tap-highlight-color: transparent
```

### 기존 코드와의 충돌 방지
- 기존 `AnalysisResult` 타입 변경 없음
- 기존 `/api/analyze` 라우트 변경 없음
- 기존 컴포넌트 수정 없음 (page.tsx만 수정)
- 새 state만 추가, 기존 state 변경 없음

### 디자인 일관성
- 기존 앱은 **라이트 테마** (`#F8F7FF` 배경)
- `future-skill-advanced.html`은 다크 테마 → **라이트로 변환 필요**
- 카드 스타일: `background: white; border-radius: 28px; box-shadow: 0 4px 24px rgba(0,0,0,0.06)`
- 강조색: `#6C63FF` (보라), `#4ECDC4` (민트), `#FF6B6B` (코랄)

---

## 7. 구현 순서

```
1. src/types/competency.ts 생성
2. src/lib/competency-scenarios.ts 생성 (future-skill-advanced.html에서 데이터 추출)
3. src/components/CompetencyAssessment.tsx 생성
4. src/components/CompetencyResult.tsx 생성
5. src/app/page.tsx 수정 (import, state, 플로우, 탭)
6. 테스트: npm run dev → 직업 입력 → 검사 → 결과 확인
7. 빌드: npm run build → 에러 없는지 확인
```

---

## 8. 데이터 플로우 다이어그램

```
사용자 입력 (직업명)
       │
       ▼
 ┌─────────────────┐
 │  handleAnalyze() │
 └────┬────────────┘
      │
      ├──────────────────────────────┐
      ▼                              ▼
 [POST /api/analyze]          [CompetencyAssessment]
  (Claude API 호출)            (클라이언트 사이드)
  12~20초 소요                  사용자가 8문제 풀기
      │                              │
      ▼                              ▼
 setResult(data)              setCompetencyResult(res)
      │                              │
      └──────────┬───────────────────┘
                 ▼
        [결과 화면 표시]
         ├─ 기존 10개 탭
         └─ 🧠 미래역량 탭 (신규)
              └─ CompetencyResult
                  ├─ competencyResult (검사 결과)
                  └─ analysisResult (AI 분석 결과)
                      → 교차 분석 → 맞춤 전략 생성
```

---

## 요약

| 항목 | 내용 |
|------|------|
| 신규 파일 | 4개 (types, scenarios, assessment, result) |
| 수정 파일 | 1개 (page.tsx) |
| API 변경 | 없음 |
| 추가 비용 | 0원 |
| 핵심 UX | API 대기시간 = 검사시간 (대기 체감 제거) |
| 모바일 | touch-action + addEventListener 필수 |
