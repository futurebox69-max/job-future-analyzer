# HORIZON MVP — Design System Guide

## 1. Color System

### Primary: Navy (신뢰, 깊이)
| Token | Hex | Usage |
|-------|-----|-------|
| navy-900 | #0a1628 | 배경, 사이드바 |
| navy-800 | #0f2140 | 헤더, 그라데이션 |
| navy-700 | #162d54 | 버튼, 강조 영역 |
| navy-600 | #1e3a6a | 라벨, 아이콘 |
| navy-500 | #2a4f8f | 링크, 보조 강조 |

### Accent: Gold (따뜻함, 은혜)
| Token | Hex | Usage |
|-------|-----|-------|
| gold-500 | #c9a84c | 주 강조, 액티브 상태 |
| gold-400 | #d4b85c | 보조 강조, 호버 |
| gold-300 | #e0c96e | 밝은 강조 |
| gold-200 | #f0dda0 | 배지, 태그 배경 |
| gold-100 | #faf3e0 | 연한 배경 |

### Neutrals
| Token | Hex | Usage |
|-------|-----|-------|
| warm-white | #faf8f5 | 페이지 배경 |
| warm-gray | #f0ece6 | 구분선, 카드 푸터 |
| text-primary | #1a1a2e | 본문 제목 |
| text-secondary | #4a4a5a | 본문 텍스트 |
| text-muted | #8a8a9a | 보조 텍스트 |

### Semantic
| Token | Hex | Usage |
|-------|-----|-------|
| green / green-bg | #4caf50 / #e8f5e9 | 성공, 활동 상태 |
| red / red-bg | #e53935 / #ffebee | 경고, 미접속 |
| blue / blue-bg | #2196f3 / #e3f2fd | 정보 |

## 2. Typography

### Font Stack
- 본문: `'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif`
- 말씀/강조: `'Noto Serif KR', serif`

### Scale
| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| Display | 28-32px | 700 | 브랜드명, 대시보드 수치 |
| H1 | 22px | 600 | 페이지 제목 |
| H2 | 18px | 600 | 카드 섹션 강조 (질문 등) |
| H3 | 15-17px | 500 | 말씀 본문, Claim 텍스트 |
| Body | 13-14px | 400 | 일반 텍스트 |
| Caption | 11-12px | 400-500 | 라벨, 메타 정보 |
| Tiny | 10px | 500 | 배지, 설명 |

### 원칙
- 한국어 가독성 최우선: line-height 1.6~1.7
- 말씀 인용은 Noto Serif KR 사용
- 본문은 Noto Sans KR 사용
- letter-spacing: 라벨/브랜드에만 적용 (1~3px)

## 3. Spacing & Layout

### Base Unit: 4px
| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | 아이콘 간격 |
| sm | 8px | 텍스트 간격 |
| md | 12px | 요소 간 간격 |
| lg | 16px | 섹션 패딩 |
| xl | 20px | 카드 패딩 |
| 2xl | 24px | 강조 섹션 패딩 |
| 3xl | 28px | 페이지 패딩 |

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| sm | 4px | 작은 배지 |
| md | 10px | 버튼, 입력 필드 |
| lg | 12px | 미션 카드, 태그 |
| xl | 14px | 카드, 패널 |
| 2xl | 20px | 메인 Daily Card |
| full | 50% | 아바타, 체크박스 |

## 4. Components

### Daily Card (성도용 핵심)
```
구조:
├── Gold accent bar (top, 4px)
├── Section 1: 오늘의 말씀 (warm background)
├── Section 2: Claim 핵심 (white)
├── Section 3: 오늘의 질문 (navy, 강조)
├── Section 4: 삼분 응답 (interactive)
│   ├── 붙들어야 (gold tone)
│   ├── 보류 (navy tone)
│   └── 맡김 (green tone)
├── Section 5: 기도 포인트 (italic, left border)
├── Section 6: 실천 미션 (checkable)
└── Card Footer (nav dots + share)
```

### Login
```
구조:
├── Visual Header (40vh, navy gradient)
│   ├── Cross/Horizon symbol
│   ├── Brand name (serif, 32px)
│   └── Tagline
├── Form Area (rounded top corners)
│   ├── Email input
│   ├── Password input
│   ├── Options (remember + forgot)
│   ├── Login button (navy → gold hover)
│   ├── Divider
│   ├── Google SSO
│   └── Contact link
└── Church badge
```

### Admin Dashboard
```
구조:
├── Sidebar (240px, navy-900)
│   ├── Brand
│   ├── Navigation (grouped sections)
│   └── User info
└── Main Content
    ├── Header (title + actions)
    ├── Stats Grid (4 cards)
    └── Content Grid
        ├── Charts (삼분 응답 추이)
        ├── Member list
        └── Recent cards
```

## 5. Interaction Patterns

### 삼분 응답 태그
- Default: 연한 배경 + 투명 보더
- Hover: 보더 색상 강조
- Active: scale(1.03) + shadow
- 각 태그는 고유 색상 체계 유지

### 버튼
- Primary: navy gradient, 호버 시 gold 전환
- Outline: white bg, 호버 시 gold border + gold-100 bg
- Active: scale(0.97)

### 카드 트랜지션
- 좌우 스와이프로 날짜 이동 (모바일)
- 부드러운 fade 전환 (0.3s ease)

## 6. Responsive Breakpoints

| Breakpoint | Target | Layout |
|------------|--------|--------|
| < 440px | 모바일 (기본) | 단일 컬럼, 풀 카드 |
| 441-768px | 태블릿 | 사이드바 숨김, 2열 stats |
| 769-1024px | 소형 데스크톱 | 사이드바 표시, 2열 stats |
| > 1024px | 데스크톱 | 풀 레이아웃, 4열 stats |

### 모바일 원칙
- max-width: 440px 컨테이너
- safe-area-inset 적용 (하단 내비)
- 터치 타겟 최소 44px
- 카드 패딩 20px (데스크톱과 동일하되 마진 축소)

## 7. Shadows

| Token | Value | Usage |
|-------|-------|-------|
| shadow-card | 0 8px 32px rgba(10,22,40,0.12) | 메인 카드 |
| shadow-soft | 0 2px 12px rgba(10,22,40,0.06) | 내부 카드 |
| shadow-subtle | 0 2px 8px rgba(0,0,0,0.04) | 패널, stat 카드 |

## 8. Iconography
- 이모지 기반 (Phase 0)
- 추후 Lucide 또는 커스텀 아이콘 전환 가능
- 아이콘 크기: 섹션 라벨 10px, 삼분 응답 22px, 하단 내비 20px

## 9. 접근성 (WCAG AA)
- 색상 대비: 본문 4.5:1 이상, 대형 텍스트 3:1 이상
- 포커스 상태: gold-500 outline (3px offset)
- 터치 타겟: 최소 44x44px
- 스크린 리더: 모든 아이콘에 aria-label
