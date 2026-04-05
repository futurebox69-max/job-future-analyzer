@AGENTS.md

# 내 직업의 미래 — AI 직업 대체율 분석기

## 프로젝트 개요
직업명을 입력하면 6차원으로 AI 대체 가능성을 분석하고, 구체적인 전환 경로를 제시하는 웹앱.
LoginFuture Ministry 제작. Claude API 기반.

## 기술 스택
- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Claude API (claude-sonnet-4-6) — 6차원 분석 엔진
- 반원형 게이지 시각화 (SVG 기반)

## 핵심 기능 (MVP Phase 1)
1. 직업명 입력 → 6차원 분석 (Claude API)
2. 반원형 게이지 시각화 (대체율 0-100%)
3. 시스템사고 빙산 모델 (4층 구조 분석)
4. 이직/전직/창직 경로 카드
5. 성인/청소년 모드 전환

## 6차원 분석 모델
- 반복적 업무 자동화 (Frey & Osborne 2013 기반)
- 인지적 판단 대체 (O*NET Analytical Skills)
- 신체적 작업 로봇화 (McKinsey 분류)
- 창의성/감성 영역 (Autor 2015)
- 대인관계/소통 (O*NET Social Skills)
- 윤리적/법적 판단 (EU AI Act 기준)

## 디자인 원칙
- 다크 테마 (배경 #0A0A0F, 강조 #6C63FF)
- 한국어 최적화 (Noto Sans KR)
- 모바일 퍼스트 반응형
- WCAG AA 접근성

## Claude API 설정
- Model: claude-sonnet-4-6
- Temperature: 0.1 (일관된 결과)
- 6차원 점수는 가중치 명시 (투명성)
- 프롬프트 인젝션 방어 필수

## 코딩 규칙
- TypeScript strict mode
- 컴포넌트별 분리 (src/components/)
- API 라우트는 src/app/api/ 아래
- 한국어 에러 메시지
- .env.local은 절대 커밋 금지

## Phase 구분
- Phase 1 (MVP): 핵심 분석 + 시각화
- Phase 2: 이력 저장 + PDF + 비교 분석
- Phase 3: Beehiiv 연동 + SaaS 생태계
