# 로그인 + 팀/가족 모드 강화 설계 스펙

## 목표

BTS 미래역량 검사를 기존 Next.js 앱(`job-future-analyzer`)에 통합하고, 로그인(Google/Kakao/이메일) 후 개인/가족/팀 3가지 모드로 검사할 수 있게 한다. 가족 모드는 관계 개선 방안과 가족 미션을, 팀 모드는 팀 화합 전략과 목표 달성 방안을 Claude AI로 생성한다.

## 아키텍처

### 통합 방식

기존 `job-future-analyzer` Next.js 앱에 `/assessment` 경로로 통합한다. 기존 HTML 단일 파일(`bts-assessment-site.html`)의 로직을 React 컴포넌트로 마이그레이션한다.

### 라우트 구조

| 경로 | 용도 |
|------|------|
| `/assessment` | 검사 메인 (모드 선택) |
| `/assessment/team/[groupId]` | 팀/가족 초대 링크 진입점 |
| `/assessment/result/[resultId]` | 개인 결과 조회 |
| `/assessment/group/[groupId]` | 팀/가족 그룹 결과 조회 |

### 기술 스택

- **프레임워크:** Next.js 16 (기존 앱)
- **인증:** Supabase Auth (Google OAuth + Kakao OAuth + 이메일 OTP)
- **DB:** Supabase PostgreSQL
- **AI 분석:** Anthropic Claude API (기존 연동)
- **캐싱:** Upstash Redis (기존 연동)
- **실시간:** Supabase Realtime (그룹 대기 화면용)
- **UI:** React 19 + Tailwind CSS (기존 스택)

## 인증 시스템

### 로그인 방법

1. **Google OAuth** — 이미 Supabase에 설정됨. 직장인/팀 사용자 대상.
2. **Kakao OAuth** — Supabase에 Kakao provider 추가 필요. 한국 가족 사용자 대상. Kakao Developers 앱 등록 + REST API 키 필요 (별도 가이드 제공).
3. **이메일 OTP** — 이미 Supabase에 설정됨. 소셜 로그인을 꺼리는 사용자 대상.

### 인증 플로우

```
/assessment 진입
  → 로그인 상태 확인 (Supabase session)
  → 미로그인 시 로그인 화면 표시
  → 로그인 완료 → 모드 선택 화면
```

기존 `AuthContext.tsx`를 재사용하되, Kakao provider를 추가한다.

## 모드 시스템

### 3가지 모드

| 모드 | 인원 | 방식 | AI 분석 내용 |
|------|------|------|-------------|
| 개인 | 1명 | 즉시 검사 | 개인 역량 분석 |
| 가족 | 2~10명 | 초대 링크 공유 | 가족 관계 개선 방안 + 가족 미션 |
| 팀 | 2~10명 | 초대 링크 공유 | 팀 화합 전략 + 팀 목표 달성 방안 |

### 개인 모드 플로우

```
모드 선택 → 이름 입력 → 검사 유형 선택 → 8문항 검사 → 로딩 → 결과 화면
```

기존 개인 검사와 동일. 결과를 DB에 저장한다.

### 가족/팀 모드 플로우

```
1. 리더가 그룹 생성
   → 모드 선택 (가족/팀)
   → 그룹 이름 입력 (예: "손 가족", "마케팅팀")
   → 초대 링크 생성 + 공유 (카카오톡, 복사 등)

2. 리더 본인도 검사 진행
   → 이름 입력 → 검사 → 결과 (개인 결과 먼저 표시)
   → 대기 화면으로 이동

3. 멤버들이 초대 링크로 진입
   → 로그인 → 자동으로 그룹 참가
   → 이름 입력 → 검사 → 개인 결과
   → 대기 화면으로 이동

4. 대기 화면
   → 참가자 목록 + 완료 현황 실시간 표시
   → 전원 완료 시 "그룹 결과 보기" 버튼 활성화

5. 그룹 결과
   → Claude AI가 전원의 결과를 분석하여 맞춤 방안 생성
   → 그룹 결과 페이지 표시
```

## Claude AI 분석 내용

### 가족 모드 AI 분석

Claude에게 전달하는 프롬프트 컨텍스트:
- 각 가족 구성원의 이름, 6차원 점수, 유형
- 모드: "family"

생성 내용:
1. **가족 역량 시너지 분석** — 가족 전체의 강점/약점 조합 해석
2. **관계별 시너지** — 구성원 쌍별 역량 조합이 만드는 시너지 (예: "아버지의 구조적 사고 + 딸의 창의성")
3. **가족 관계 개선 방안** — 역량 차이를 활용한 소통 전략 3가지
4. **가족 공동 미션** — 가족이 함께 할 수 있는 구체적 활동 3가지
5. **AI 시대 가족 준비 전략** — 가족 단위로 미래를 대비하는 방법

### 팀 모드 AI 분석

Claude에게 전달하는 프롬프트 컨텍스트:
- 각 팀원의 이름, 6차원 점수, 유형
- 모드: "team"
- (선택) 팀 목표 입력 가능

생성 내용:
1. **팀 역량 프로필** — 팀 전체의 6차원 평균 + 강점/약점
2. **역할 배분 제안** — 각 팀원의 역량에 맞는 최적 역할
3. **팀 화합 전략** — 역량 차이를 갈등이 아닌 보완으로 활용하는 방법
4. **팀 목표 달성 방안** — 팀 역량 조합 기반 구체적 협업 전략 3가지
5. **보완 필요 역량** — 팀에 부족한 역량과 이를 강화하는 방법

### API 엔드포인트

```
POST /api/assessment/analyze-group
Body: { groupId, mode: 'family' | 'team' }
Response: { analysis: { synergy, relationships, missions, strategies, ... } }
```

Claude API 호출 비용: 그룹당 약 1회, ~$0.01-0.03

## 데이터베이스 스키마

### assessment_results (개인 검사 결과)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 결과 ID |
| user_id | uuid (FK → auth.users) | 사용자 |
| player_name | text | 검사 시 입력한 이름 |
| selected_qtype | text | 선택한 검사 유형 |
| scores | jsonb | 원시 점수 {structural: 5, creative: 3, ...} |
| norm_scores | jsonb | 정규화 점수 {structural: 72, creative: 45, ...} |
| type_key | text | 분류된 유형 키 |
| avg_score | integer | 종합 점수 |
| behavior_data | jsonb | 행동 데이터 (응답 시간, 선택 순서 등) |
| duration_seconds | integer | 총 소요 시간 |
| created_at | timestamptz | 검사 일시 |

### assessment_groups (팀/가족 그룹)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 그룹 ID |
| mode | text | 'family' 또는 'team' |
| name | text | 그룹 이름 |
| creator_id | uuid (FK → auth.users) | 생성자 |
| invite_code | text (unique) | 초대 코드 (URL용) |
| max_members | integer | 최대 인원 (2~10) |
| status | text | 'waiting' → 'complete' |
| ai_analysis | jsonb | Claude AI 분석 결과 |
| expires_at | timestamptz | 초대 링크 만료일 (생성 후 7일) |
| created_at | timestamptz | 생성 일시 |

### assessment_group_members (그룹 멤버)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| group_id | uuid (FK → assessment_groups) | 그룹 |
| user_id | uuid (FK → auth.users) | 사용자 |
| result_id | uuid (FK → assessment_results) | 검사 결과 (null = 미완료) |
| role | text | 'leader' 또는 'member' |
| joined_at | timestamptz | 참가 일시 |

## 재미 요소 유지

기존 HTML 파일의 재미 요소를 모두 React 컴포넌트로 마이그레이션:

- 파티클 이펙트 (선택 시 이모지 폭발)
- 콤보 시스템 (빠른 연속 답변 보상)
- 캐릭터 비티 가이드 (문항별 코멘트)
- 중간 인터미션 (4문항 후 전반전 분석)
- 배경색 점진 변화
- 드라마틱 결과 순차 공개

## API 엔드포인트 목록

| 엔드포인트 | 메서드 | 용도 |
|-----------|--------|------|
| `/api/assessment/save-result` | POST | 개인 결과 저장 |
| `/api/assessment/create-group` | POST | 그룹 생성 + 초대 코드 발급 |
| `/api/assessment/join-group` | POST | 그룹 참가 |
| `/api/assessment/group-status` | GET | 그룹 완료 현황 조회 |
| `/api/assessment/analyze-group` | POST | Claude AI 그룹 분석 |
| `/api/assessment/group/[groupId]` | GET | 그룹 결과 조회 |
| `/api/assessment/result/[resultId]` | GET | 개인 결과 조회 |

## 마이그레이션 범위

### HTML → React 변환 대상

- 검사 데이터 (SKILLS_INFO, ARCHETYPES, scenarioBanks, TYPE_VERDICTS 등)
- 검사 로직 (buildScenarios, normalizeScores, classifyType 등)
- UI 컴포넌트 (랜딩, 모드 선택, 이름 입력, 검사 화면, 결과 화면)
- 애니메이션 (파티클, 콤보, 비티 가이드 등)

### 컴포넌트 구조 (예상)

```
src/app/assessment/
  page.tsx                    — 검사 메인 (모드 선택)
  layout.tsx                  — 검사 레이아웃
  team/[groupId]/page.tsx     — 초대 링크 진입
  result/[resultId]/page.tsx  — 개인 결과
  group/[groupId]/page.tsx    — 그룹 결과

src/components/assessment/
  LoginGate.tsx               — 로그인 필수 래퍼
  ModeSelect.tsx              — 모드 선택 (개인/가족/팀)
  NameInput.tsx               — 이름 입력
  GroupSetup.tsx              — 그룹 생성 + 초대 링크
  QuestionTypeSelect.tsx      — 검사 유형 선택
  AssessmentScreen.tsx        — 검사 화면 (8문항)
  LoadingScreen.tsx           — 분석 중 로딩
  PersonalResult.tsx          — 개인 결과
  GroupResult.tsx             — 그룹 결과 (가족/팀)
  GroupWaiting.tsx            — 대기 화면 (완료 현황)
  ParticleEffect.tsx          — 파티클 애니메이션
  ComboSystem.tsx             — 콤보 배지
  BTGuide.tsx                 — 캐릭터 비티
  Intermission.tsx            — 중간 인터미션

src/lib/assessment/
  data.ts                     — SKILLS_INFO, ARCHETYPES, scenarioBanks 등
  scoring.ts                  — normalizeScores, classifyType, buildScenarios
  types.ts                    — TypeScript 타입 정의
```

## Kakao OAuth 설정 가이드

별도 문서로 제공: Kakao Developers 앱 등록 → REST API 키 발급 → Supabase에 Custom Provider 등록 → 리다이렉트 URI 설정

## RLS (Row Level Security) 정책

모든 테이블에 RLS를 활성화하고, API 라우트에서는 Supabase service-role key를 사용한다.

### assessment_results

- **SELECT:** 본인의 결과만 조회 가능 (`user_id = auth.uid()`)
- **INSERT:** 로그인 사용자만 본인 결과 삽입 가능

### assessment_groups

- **SELECT:** 그룹 멤버만 조회 가능 (assessment_group_members에 user_id 존재)
- **INSERT:** 로그인 사용자만 생성 가능
- **UPDATE:** 리더만 수정 가능 (`creator_id = auth.uid()`)

### assessment_group_members

- **SELECT:** 같은 그룹 멤버만 조회 가능
- **INSERT:** 로그인 사용자만 본인 참가 가능

API 라우트(`/api/assessment/*`)에서는 service-role key로 RLS를 우회하되, 라우트 핸들러 내부에서 인증/인가를 검증한다.

## API 인증/인가

| 엔드포인트 | 인증 | 인가 |
|-----------|------|------|
| `save-result` | 필수 | 본인 결과만 저장 |
| `create-group` | 필수 | 누구나 생성 가능 |
| `join-group` | 필수 | 유효한 invite_code 필요 |
| `group-status` | 필수 | 그룹 멤버만 조회 |
| `analyze-group` | 필수 | 리더만 트리거 가능 + 전원 완료 상태 |
| `group/[groupId]` | 필수 | 그룹 멤버만 조회 |
| `result/[resultId]` | 필수 | 본인 결과만 조회 |

## 그룹 멤버 결과 연결 메커니즘

1. 멤버가 검사를 완료하면 `/api/assessment/save-result`가 호출된다.
2. `save-result`는 `assessment_results`에 결과를 INSERT하고, result ID를 반환한다.
3. 그룹 모드인 경우, 클라이언트가 result ID와 함께 `/api/assessment/join-group`을 호출한다 (이미 참가한 경우 `assessment_group_members.result_id`를 UPDATE).
4. 이 UPDATE가 Supabase Realtime을 통해 대기 화면에 반영된다.

## 대기 화면 실시간 구현

**Supabase Realtime** 구독을 사용한다:
- 클라이언트가 `assessment_group_members` 테이블의 해당 `group_id` 변경을 구독
- 멤버의 `result_id`가 null → uuid로 변경되면 "완료" 상태로 UI 업데이트
- 모든 멤버의 `result_id`가 채워지면 "그룹 결과 보기" 버튼 활성화

## 제약 사항

- 팀/가족 인원 제한: 2~10명
- 초대 링크 유효 기간: 7일 (`assessment_groups.expires_at` 컬럼 추가)
- Claude AI 그룹 분석: 그룹당 1회. 재분석 시도 시 기존 분석 결과를 표시하고 "이미 분석이 완료되었습니다" 안내
- Kakao OAuth는 Kakao Developers 앱 등록 후 사용 가능. 1차 출시에서는 Google + 이메일 OTP만 지원하고, Kakao는 앱 등록 완료 후 2차로 추가 가능
- `behavior_data`는 기존 HTML의 행동 추적 로직(응답 시간, 선택 순서)을 React로 마이그레이션하여 수집
- 기존 `bts-assessment.vercel.app`은 메인 앱 통합 후 리다이렉트 또는 폐지
