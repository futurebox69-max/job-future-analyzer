// 랜딩 이중언어 콘텐츠 — 한국어 / 영어.
// page.tsx의 하드코딩 한국어를 여기로 분리한다. ko는 한국어, 그 외 모든 언어(en/zh/ja/es)는
// 영어로 폴백한다 (랜딩 마케팅은 원래 한국어 전용이었으므로 영어 폴백이 개선이다).
// 정서적 카피(정체성·8눈 이름·한계 고백)는 직역이 아니라 영어로 재창작했다 — 명세서의
// "사람을 향한 애정" 톤을 영어 독자에게도 살리기 위함. 목사님 검수 대상.

import type { LangCode } from "./i18n";

interface EyeItem { icon: string; name: string; risk: string }
interface IdentityCase { job: string; primary: string; secondary: string }
interface IconRow { icon: string; title: string; desc: string }
interface TextRow { icon: string; text: string }
interface FooterPart { n: string; app: string; q: string }
interface PlanRow { icon: string; title: string; desc: string }
interface PaidCard { oneLiner: string; paragraph: string; rows: PlanRow[] }
interface GridPlanText { name: string; price: string; priceUnit: string | null; sub: string; features: string[]; limit: string }

export interface PaidContent {
  back: string;
  ebBadge: string;
  header: string;
  subPre: string; subBold: string; subPost: string;
  basic: PaidCard;
  standard: PaidCard & { badge: string };
  signature: PaidCard & { badge: string; title: string; priceUnit: string };
  edu: PaidCard & { badge: string; priceUnit: string; priceSub: string };
  perMonth: string;
  ctaTitle: string;
  ctaBody1: string;
  ctaPre: string; ctaBold: string;
  ctaButton: string;
  ctaFine: string;
  backToFree: string;
}

export interface GridContent {
  limitLabel: string;
  comingSoon: string;
  startFree: string;
  badgeRecommended: string;
  badgeInstitution: string;
  badgeHuman: string;
  plans: GridPlanText[]; // FREE · BASIC · STANDARD · SIGNATURE · EDU 순서
}

export interface LandingContent {
  // 무료 카드 하단 링크
  link_paid: string;
  link_beta_v3: string;
  // 무료 카드 사용량 문구
  login_free_3: string;          // "로그인하면 3회 무료 분석"
  auth_reason_3free: string;     // authReason 모달 문구
  usage_left: (n: number) => string;
  // 네비 로그인/로그아웃
  nav_login: string;
  nav_logout: string;
  brand_logo: string;
  brand_subtitle: string;
  // 업그레이드 팝업
  upgrade_title: string;
  upgrade_body: string;
  upgrade_cta: string;
  upgrade_later: string;
  // WHY THIS
  why_tag: string;
  why_title: string;
  why_lead: string;
  why_lead_strong: string;
  why_sub: string;
  why_highlight: string;
  // 여덟 개의 눈
  eyes_tag: string;
  eyes_title: string;
  eyes_sub: string;
  eyes: EyeItem[];
  // 정체성
  identity_tag: string;
  identity_title_1: string;
  identity_title_2: string;
  identity_sub: string;
  identity_cases: IdentityCase[];
  identity_close_1: string;
  identity_close_strong: string;
  // 차별점
  diff_tag: string;
  diff_title: string;
  diff_items: IconRow[];
  // 신뢰 / 한계
  honesty_tag: string;
  honesty_title: string;
  honesty_sub: string;
  honesty_lines: string[];
  honesty_footer: string;
  // 대상자
  who_tag: string;
  who_title: string;
  who_items: TextRow[];
  who_cta: string;
  // REFRAME 3부작 푸터
  reframe_prefix: string;
  reframe_parts: FooterPart[];
  // 요금제 헤더
  pricing_header_tag: string;
  pricing_header_title: string;
  pricing_header_sub: string;
  pricing_ladder: string;
  // 유료 미리보기 + 요금제 그리드
  paid: PaidContent;
  grid: GridContent;
}

const KO: LandingContent = {
  link_paid: "유료 플랜 자세히 보기 →",
  link_beta_v3: "새 분석 방식 미리보기 (베타) →",
  login_free_3: "로그인하면 3회 무료 분석",
  auth_reason_3free: "로그인하면 무료로 3회 분석할 수 있습니다.",
  usage_left: (n) => `이번 달 ${n}회 남았습니다. 프리미엄으로 업그레이드하면 무제한 분석이 가능합니다.`,
  nav_login: "로그인",
  nav_logout: "로그아웃",
  brand_logo: "직업의 미래",
  brand_subtitle: "내 삶을 다시 설계하다",
  upgrade_title: "무료 분석 3회를\n모두 사용하셨습니다",
  upgrade_body: "프리미엄으로 업그레이드하면\n무제한 분석과 8가지 심화 기능을\n모두 이용할 수 있습니다.",
  upgrade_cta: "프리미엄 시작하기 · ₩4,900/월",
  upgrade_later: "다음에",
  why_tag: "WHY THIS",
  why_title: "직업만 보면 절반만 보는 것입니다",
  why_lead: "같은 직업이어도",
  why_lead_strong: "누구는 버티고, 누구는 밀립니다.",
  why_sub: "차이는 직업 이름이 아니라 준비 상태와 역량 구조에 있습니다.",
  why_highlight: "이 분석은 직업의 변화 가능성만 보지 않습니다. 당신도 함께 봅니다.",
  eyes_tag: "여덟 개의 눈",
  eyes_title: "직업을 보는 여덟 개의 눈",
  eyes_sub: "하나의 점수가 아니라, 여덟 개의 눈으로 당신의 직업을 입체적으로 봅니다",
  eyes: [
    { icon: "zap",         name: "자동화 압력",                    risk: "이 일의 어느 부분부터 AI가 먼저 들어오는지" },
    { icon: "handshake",   name: "AI와 함께 강해질 가능성",          risk: "AI를 도구로 써서 오히려 강해질 수 있는지" },
    { icon: "chart-line",  name: "수요 변화 방향",                  risk: "10년 후 이 직업의 사회적 필요가 늘어나는지" },
    { icon: "castle",      name: "남이 내 자리를 차지하기 어려운 정도", risk: "면허·숙련·신뢰가 내 자리를 지켜주는 정도" },
    { icon: "dollar-sign", name: "벌이가 흔들리지 않는 힘",          risk: "변화 속에서도 수입 수준을 유지할 수 있는지" },
    { icon: "waves",       name: "시장이 흔들릴 때 같이 흔들리는 정도", risk: "경기·기술·정책 변화에 얼마나 흔들리는지" },
    { icon: "refresh",     name: "다른 길로 옮겨갈 수 있는 힘",       risk: "지금의 경험이 다른 일에서도 통하는 정도" },
    { icon: "rocket",      name: "새 기회가 열리는 자리",            risk: "AI 시대에 오히려 새 기회가 생기는지" },
  ],
  identity_tag: "IDENTITY",
  identity_title_1: "이 앱은 점수를 매기지 않습니다.",
  identity_title_2: "당신의 결을 짚습니다.",
  identity_sub: "실제 분석에서 나온 정체성 이름들입니다 (익명 사례)",
  identity_cases: [
    { job: "의료기기 제조 기술자", primary: "장인형 손작업가", secondary: "The Gentle Crafter" },
    { job: "간호사",             primary: "곁에 머무는 사람", secondary: "The One Who Stays" },
    { job: "영어강사",           primary: "언어 안내자",     secondary: "The Language Guide" },
  ],
  identity_close_1: "같은 직업이라도, 같은 이름이 나오지 않습니다.",
  identity_close_strong: "당신이 다르기 때문입니다.",
  diff_tag: "DIFFERENCE",
  diff_title: "이 앱이 다른 이유",
  diff_items: [
    { icon: "search",     title: "직업 분석", desc: "당신의 직업이 앞으로 어떤 방향으로 움직일지 분석합니다" },
    { icon: "link",       title: "역량 연결", desc: "직업 변화와 나의 현재 역량을 함께 봅니다" },
    { icon: "target",     title: "행동 제안", desc: "지금 줄일 것, 키울 것, 시작할 것을 제안합니다" },
    { icon: "chart-line", title: "지속 추적", desc: "계속 변하는 미래를 따라갈 수 있게 돕습니다" },
  ],
  honesty_tag: "HONESTY",
  honesty_title: "이 앱이 모른다고 말하는 것들",
  honesty_sub: "진단 앱이 자기 한계를 첫 화면에 쓰는 일은 드뭅니다. 우리는 그것이 신뢰의 시작이라고 믿습니다.",
  honesty_lines: [
    "이 분석은 직업의 평균이지, 아직 '당신'이 아닙니다. 입력해주신 만큼만 당신에게 가까워집니다.",
    "입력하지 않으신 것은 분석하지 못합니다 — 그리고 그 사실을 보고서에 그대로 적습니다.",
    "시장은 계속 움직입니다. 오늘의 분석은 오늘의 자리이고, 6개월 뒤에는 다시 짚어야 합니다.",
    "당신의 사정, 당신의 기쁨, 당신이 일에서 찾는 의미 — 숫자가 닿지 못하는 자리가 있습니다.",
  ],
  honesty_footer: "그래서 모든 보고서의 마지막에는 “이 보고서가 받지 못한 입력값”을 정직하게 인쇄합니다.",
  who_tag: "WHO NEEDS THIS",
  who_title: "직업이 걱정되는 분이라면",
  who_items: [
    { icon: "briefcase", text: "내 직업의 미래가 걱정되는 직장인" },
    { icon: "refresh",   text: "이직과 전환을 고민하는 분" },
    { icon: "users",     text: "자녀 진로를 준비하는 부모" },
    { icon: "books",     text: "학생을 지도하는 교사와 상담자" },
    { icon: "church",    text: "청소년과 청년의 길을 돕는 교회와 기관" },
  ],
  who_cta: "내 직업 무료 분석하기",
  reframe_prefix: "REFRAME 3부작 — ",
  reframe_parts: [
    { n: "①", app: "역량평가", q: "나는 어떤 결인가" },
    { n: "②", app: "직업의 미래", q: "내 결은 시장에서 어떻게 살아남는가" },
    { n: "③", app: "REFRAME", q: "이 결을 어떻게 다시 짤 것인가" },
  ],
  pricing_header_tag: "요금제",
  pricing_header_title: "지금은 무료로 시작하세요",
  pricing_header_sub: "유료 플랜은 곧 출시됩니다 · 출시 시 사전 가입자 특별 혜택 제공",
  pricing_ladder: "내 자리 보기 → 내 결 알기 → 내 길 그리기 → 1인 맞춤 보고서",
  paid: {
    back: "← 처음으로",
    ebBadge: "⏳ 얼리버드 모집 중",
    header: "직업의 미래 유료 플랜 안내",
    subPre: "지금 얼리버드 신청하시면 ",
    subBold: "출시 즉시 30% 할인가",
    subPost: "가 자동 적용됩니다",
    basic: {
      oneLiner: "가볍게 시작하는 분께",
      paragraph: "기본 분석과 월간 요약으로 내 직업의 흐름을 꾸준히 확인합니다. 무료 분석은 3회로 끝나지만, Starter는 월 10회 분석으로 여러 직업을 비교하고 내 업무 중 어떤 세부 작업이 먼저 AI로 대체될지까지 알려드립니다.",
      rows: [
        { icon: "refresh", title: "매월 10회", desc: "다양한 직업을 자유롭게 분석" },
        { icon: "gear", title: "업무별 대체 분석", desc: "내 업무 중 AI가 먼저 대체할 세부 작업 식별" },
        { icon: "brain", title: "AI 협업 역량 점수", desc: "AI와 함께 일하는 능력을 수치로 측정·가이드" },
        { icon: "spa", title: "AI 불안 심리 케어", desc: "직업 불안감을 실질적 행동 계획으로 전환" },
      ],
    },
    standard: {
      badge: "가장 인기",
      oneLiner: "가장 추천하는 플랜",
      paragraph: "심층 분석과 90일 행동계획까지, 실제로 준비를 시작하고 싶은 분께 적합합니다. 분석 결과를 알아도 “그래서 나는 어떻게 해야 하지?”라는 질문이 남습니다. Builder는 내 직업의 미래를 3가지 시나리오로 보여주고, AI 코치와 함께 맞춤 역량 로드맵을 만들어 드립니다.",
      rows: [
        { icon: "refresh", title: "기본 분석 20회", desc: "매월 20회, 다양한 직업 시나리오 탐색 가능" },
        { icon: "globe", title: "비전 시나리오 3가지", desc: "현재 유지 / 부분 전환 / 완전 전환 경로를 구체적 그림으로 제시" },
        { icon: "map", title: "직업 추천 + 역량 로드맵", desc: "나에게 맞는 다음 직업과 갖춰야 할 역량을 단계별로 안내" },
        { icon: "sparkles", title: "AI 코치 월 30회", desc: "분석 결과 기반 맞춤 커리어 상담을 AI가 즉시 제공" },
        { icon: "dollar-sign", title: "연봉 협상 도우미", desc: "내 직업·역량·시장 데이터를 바탕으로 협상 전략 제안" },
      ],
    },
    signature: {
      badge: "사람의 결",
      title: "1인 맞춤 보고서",
      priceUnit: "/건 · 납기 5~7일",
      oneLiner: "자동화되지 않는 자리는, 사람이 짚습니다",
      paragraph: "사전 설문과 1:1 대담(서면·전화·줌)을 바탕으로 22페이지 맞춤 보고서를 만듭니다. AI가 초안을 쓰고, 정체성 작명 · 강점 자산 · The Decision · Letter — 이 네 자리는 반드시 사람이 함께 짚습니다. 같은 직업이라도 같은 보고서가 나오지 않습니다.",
      rows: [
        { icon: "users", title: "1:1 대담", desc: "서면·전화·줌 중 편한 방식으로 당신의 이야기를 듣습니다" },
        { icon: "sparkles", title: "정체성 작명", desc: "점수가 아니라, 당신의 결에 이름을 붙입니다" },
        { icon: "search", title: "강점 자산 (의중 읽기)", desc: "입력값에 없지만 대담에서 읽히는 결까지 담습니다" },
        { icon: "compass", title: "The Decision", desc: "이직·전직·창직·유지 — 당신이 쓴 단어를 함께 되짚습니다" },
        { icon: "pen-line", title: "Letter", desc: "보고서의 마지막은 당신에게 쓰는 편지입니다" },
      ],
    },
    edu: {
      badge: "기관용",
      priceUnit: "/년",
      priceSub: "학교·학원 30명 기준",
      oneLiner: "학생들의 진로를 체계적으로 지도하는 학교·학원·진로상담 기관 선생님",
      paragraph: "선생님 한 분이 30명의 학생을 일일이 진로 상담하기는 현실적으로 어렵습니다. EDU 플랜은 학생 30명이 각자 자신의 직업 적성과 미래를 AI로 분석하고, 선생님은 대시보드 하나에서 전체 현황을 파악합니다. AI 진로 코치가 청소년 눈높이에 맞춰 대화하고, 분석 결과는 학부모에게도 공유됩니다.",
      rows: [
        { icon: "graduation-cap", title: "학생 30명 계정", desc: "학생들이 각자 계정으로 자신의 진로를 직접 탐색" },
        { icon: "compass", title: "청소년 전용 진로 분석", desc: "성인 기준이 아닌 청소년 적성·학업·미래직업 맞춤 분석" },
        { icon: "monitor", title: "선생님 대시보드", desc: "반 전체 진행 상황·분석 결과를 한눈에 확인 및 관리" },
        { icon: "clipboard", title: "학급 단위 진로 리포트", desc: "반 전체의 진로 경향 통계와 집단 인사이트 리포트 제공" },
        { icon: "sparkles", title: "AI 진로 코치 (청소년 모드)", desc: "학생이 궁금한 점을 AI 코치가 쉽고 친근하게 안내" },
        { icon: "users", title: "학부모 결과 공유", desc: "자녀의 분석 결과를 학부모에게 안전하게 공유" },
      ],
    },
    perMonth: "/월",
    ctaTitle: "출시 알림 신청",
    ctaBody1: "유료 서비스 출시 시 이메일로 가장 먼저 알려드립니다",
    ctaPre: "사전 등록자 ",
    ctaBold: "30% 얼리버드 할인",
    ctaButton: "출시 알림 신청하기 →",
    ctaFine: "스팸 없음 · 언제든 취소 가능 · 출시 후 30일 환불 보장",
    backToFree: "지금은 무료로 먼저 체험해보기",
  },
  grid: {
    limitLabel: "이 단계가 말하는 한계",
    comingSoon: "곧 출시됩니다",
    startFree: "무료로 시작하기",
    badgeRecommended: "추천",
    badgeInstitution: "기관용",
    badgeHuman: "사람의 결",
    plans: [
      {
        name: "내 자리 보기", price: "무료", priceUnit: null,
        sub: "로그인 후 바로 시작 · 깊이 1페이지",
        features: ["종합 위험도 한 수치", "여덟 개의 눈 요약", "정체성 한 줄", "10년 시간 예측", "5개 언어 지원"],
        limit: "이것은 직업의 평균이지, 아직 당신이 아닙니다",
      },
      {
        name: "내 결 알기", price: "₩9,900", priceUnit: "/월",
        sub: "곧 출시 예정",
        features: ["핵심 5문항 심화 입력", "4~5p PDF 보고서", "시간 비중·AI 위험 지도", "미니 한계 페이지(P.17)"],
        limit: "당신의 결의 일부만 반영됩니다. 받지 못한 입력값을 그대로 적습니다",
      },
      {
        name: "내 길 그리기", price: "₩19,900", priceUnit: "/월",
        sub: "곧 출시 예정",
        features: ["심화 10문항 + 챗봇 대담", "8~10p PDF 보고서", "시나리오 A·B·C", "30일 액션 + 18개월 로드맵", "풀 한계 페이지(P.17)", "시장 변화 갱신 알림 (보고서가 자랍니다)"],
        limit: "AI가 생성하고 사람이 검수하지 않은 보고서입니다. 정체성·결단의 자리는 1인 맞춤에서 사람이 함께 짚습니다",
      },
      {
        name: "1인 맞춤 보고서", price: "₩149,000", priceUnit: "/건",
        sub: "곧 출시 예정 · 납기 5~7일",
        features: ["사전 설문 + 1:1 대담 (서면·전화·줌)", "22페이지 맞춤 보고서", "정체성 작명 — 사람이 짚습니다", "강점 자산 (의중 읽기)", "The Decision · Letter"],
        limit: "그래도 모르는 것이 있습니다. 이 보고서는 출발점이지 결승점이 아닙니다",
      },
      {
        name: "우리 아이들의 결", price: "₩1,000,000", priceUnit: "/년",
        sub: "학교·학원 30명 기준 · 학기 단위",
        features: ["학생 설문 + 교사 입력", "학생별 8~10p 보고서", "갈림길 비교 (관심 직업 2~4개 나란히)", "학급 통계 · 선생님 대시보드", "AI 진로 코치 (청소년 모드)", "학부모 결과 공유"],
        limit: "이 결과는 상담 대체가 아니라, 상담의 재료입니다",
      },
    ],
  },
};

const EN: LandingContent = {
  link_paid: "See paid plans →",
  link_beta_v3: "Try the new analysis flow (beta) →",
  login_free_3: "Log in for 3 free analyses",
  auth_reason_3free: "Log in to get 3 free analyses.",
  usage_left: (n) => `${n} left this month. Upgrade to premium for unlimited analyses.`,
  nav_login: "Log in",
  nav_logout: "Log out",
  brand_logo: "Future of My Job",
  brand_subtitle: "Redesign your life",
  upgrade_title: "You've used all 3\nfree analyses",
  upgrade_body: "Upgrade to premium for\nunlimited analyses and all 8\nin-depth features.",
  upgrade_cta: "Start Premium · ₩4,900/mo",
  upgrade_later: "Maybe later",
  why_tag: "WHY THIS",
  why_title: "Look at the job alone, and you see only half.",
  why_lead: "In the same job —",
  why_lead_strong: "some hold on, some get pushed out.",
  why_sub: "The difference isn't the job title. It's your readiness and the shape of your skills.",
  why_highlight: "This analysis doesn't only read the job's future. It reads you, too.",
  eyes_tag: "EIGHT EYES",
  eyes_title: "Eight eyes on your job",
  eyes_sub: "Not a single score — eight eyes that see your job in full dimension.",
  eyes: [
    { icon: "zap",         name: "Where AI moves in first",          risk: "Which parts of the work AI reaches first" },
    { icon: "handshake",   name: "Room to grow stronger with AI",    risk: "Whether using AI as a tool makes you stronger" },
    { icon: "chart-line",  name: "Which way demand is moving",        risk: "Whether this job is needed more in 10 years" },
    { icon: "castle",      name: "How hard your seat is to take",     risk: "How much licensing, skill, and trust guard your seat" },
    { icon: "dollar-sign", name: "How steady the pay stays",         risk: "Whether your income holds through the change" },
    { icon: "waves",       name: "How much you sway with the market", risk: "How much shifts in economy, tech, and policy shake it" },
    { icon: "refresh",     name: "How easily you can change paths",   risk: "How well today's experience carries to other work" },
    { icon: "rocket",      name: "Where new doors open",             risk: "Whether the AI era opens new opportunities instead" },
  ],
  identity_tag: "IDENTITY",
  identity_title_1: "This app doesn't give you a score.",
  identity_title_2: "It names the grain of who you are.",
  identity_sub: "Real identity names from actual analyses (anonymized)",
  identity_cases: [
    { job: "Medical device maker", primary: "The Gentle Crafter",   secondary: "장인형 손작업가" },
    { job: "Nurse",                primary: "The One Who Stays",     secondary: "곁에 머무는 사람" },
    { job: "English teacher",      primary: "The Language Guide",    secondary: "언어 안내자" },
  ],
  identity_close_1: "Same job, never the same name.",
  identity_close_strong: "Because you are not the same.",
  diff_tag: "DIFFERENCE",
  diff_title: "Why this app is different",
  diff_items: [
    { icon: "search",     title: "Job analysis",  desc: "We map where your job is headed." },
    { icon: "link",       title: "Skill linkage", desc: "We read the job's change alongside your skills today." },
    { icon: "target",     title: "What to do",    desc: "What to cut, what to grow, what to start — now." },
    { icon: "chart-line", title: "Keep tracking", desc: "We help you keep pace with a future that keeps moving." },
  ],
  honesty_tag: "HONESTY",
  honesty_title: "What this app admits it doesn't know",
  honesty_sub: "Few diagnostic apps print their limits on the front page. We believe that's where trust begins.",
  honesty_lines: [
    "This analysis is the job's average, not yet 'you.' It comes closer to you only as much as you tell us.",
    "What you don't enter, we can't analyze — and we write that plainly in the report.",
    "The market keeps moving. Today's reading is today's; in six months, it's worth looking again.",
    "Your circumstances, your joy, the meaning you find in your work — some places numbers can't reach.",
  ],
  honesty_footer: "So every report ends by honestly printing “the inputs this report didn't receive.”",
  who_tag: "WHO NEEDS THIS",
  who_title: "If your work is on your mind",
  who_items: [
    { icon: "briefcase", text: "Workers wondering about their job's future" },
    { icon: "refresh",   text: "Anyone weighing a move or a career change" },
    { icon: "users",     text: "Parents preparing a child's path" },
    { icon: "books",     text: "Teachers and counselors guiding students" },
    { icon: "church",    text: "Churches and groups walking with young people" },
  ],
  who_cta: "Analyze my job — free",
  reframe_prefix: "The REFRAME trilogy — ",
  reframe_parts: [
    { n: "①", app: "Skills Assessment", q: "What is my grain?" },
    { n: "②", app: "Future of My Job", q: "How does my grain survive the market?" },
    { n: "③", app: "REFRAME", q: "How do I reweave it?" },
  ],
  pricing_header_tag: "PLANS",
  pricing_header_title: "Start free today",
  pricing_header_sub: "Paid plans are coming soon · early sign-ups get special benefits",
  pricing_ladder: "See Your Place → Know Your Grain → Map Your Path → 1:1 Custom Report",
  paid: {
    back: "← Back",
    ebBadge: "⏳ Early-bird open",
    header: "Future of My Job — paid plans",
    subPre: "Sign up as an early bird now and a ",
    subBold: "30% launch discount",
    subPost: " applies automatically",
    basic: {
      oneLiner: "For an easy start",
      paragraph: "Keep a steady read on where your job is heading with core analyses and a monthly summary. The free tier stops at 3 — Starter gives you 10 analyses a month to compare several jobs and see which specific tasks in your work AI reaches first.",
      rows: [
        { icon: "refresh", title: "10 per month", desc: "Analyze a range of jobs freely" },
        { icon: "gear", title: "Task-level analysis", desc: "Spot the tasks AI reaches first in your work" },
        { icon: "brain", title: "AI-collaboration score", desc: "Measure and guide your ability to work with AI" },
        { icon: "spa", title: "Easing AI anxiety", desc: "Turn job anxiety into a concrete plan of action" },
      ],
    },
    standard: {
      badge: "Most popular",
      oneLiner: "Our top recommendation",
      paragraph: "In-depth analysis through a 90-day action plan, for those ready to actually start preparing. Even with the results in hand, the question remains: “So what do I do?” Builder shows your job's future in three scenarios and builds a tailored skill roadmap with an AI coach.",
      rows: [
        { icon: "refresh", title: "20 analyses", desc: "20 a month to explore many job scenarios" },
        { icon: "globe", title: "3 vision scenarios", desc: "Stay / partial shift / full shift, each drawn concretely" },
        { icon: "map", title: "Job picks + skill roadmap", desc: "Your next-fit jobs and the skills to build, step by step" },
        { icon: "sparkles", title: "AI coach, 30/mo", desc: "Instant tailored career advice grounded in your results" },
        { icon: "dollar-sign", title: "Salary-negotiation aid", desc: "Negotiation strategy from your job, skills, and market data" },
      ],
    },
    signature: {
      badge: "The human touch",
      title: "1:1 Custom Report",
      priceUnit: "/report · 5–7 day delivery",
      oneLiner: "Where automation can't reach, a person does",
      paragraph: "Built from a pre-survey and a 1:1 conversation (written, phone, or video) into a 22-page custom report. AI drafts it, but four places — identity naming, strength assets, The Decision, and the Letter — are always shaped by a person. Same job, never the same report.",
      rows: [
        { icon: "users", title: "1:1 conversation", desc: "We hear your story by writing, phone, or video — your choice" },
        { icon: "sparkles", title: "Identity naming", desc: "Not a score — a name for the grain of who you are" },
        { icon: "search", title: "Strength assets", desc: "The grain read from the conversation, not just the inputs" },
        { icon: "compass", title: "The Decision", desc: "Move, switch, build, or stay — we revisit the word you chose" },
        { icon: "pen-line", title: "Letter", desc: "The report ends as a letter written to you" },
      ],
    },
    edu: {
      badge: "For institutions",
      priceUnit: "/yr",
      priceSub: "for 30 students",
      oneLiner: "For teachers at schools, academies, and counseling centers guiding students' paths",
      paragraph: "One teacher counseling 30 students one by one isn't realistic. With the EDU plan, 30 students each analyze their own aptitude and future with AI, while the teacher sees the whole class from a single dashboard. An AI career coach speaks at a youth's level, and results can be shared with parents.",
      rows: [
        { icon: "graduation-cap", title: "30 student accounts", desc: "Each student explores their own path in their own account" },
        { icon: "compass", title: "Youth-specific analysis", desc: "Tuned to youth aptitude, study, and future jobs — not adult metrics" },
        { icon: "monitor", title: "Teacher dashboard", desc: "See and manage the whole class's progress and results at a glance" },
        { icon: "clipboard", title: "Class-level report", desc: "Class-wide trend stats and group insight reports" },
        { icon: "sparkles", title: "AI coach (youth mode)", desc: "A friendly AI coach answers students' questions simply" },
        { icon: "users", title: "Parent sharing", desc: "Share a child's results with parents securely" },
      ],
    },
    perMonth: "/mo",
    ctaTitle: "Get launch notifications",
    ctaBody1: "We'll email you first when paid services launch",
    ctaPre: "Pre-registrants get a ",
    ctaBold: "30% early-bird discount",
    ctaButton: "Sign up for launch alerts →",
    ctaFine: "No spam · cancel anytime · 30-day refund after launch",
    backToFree: "Try it free first",
  },
  grid: {
    limitLabel: "What this tier admits",
    comingSoon: "Coming soon",
    startFree: "Start free",
    badgeRecommended: "Recommended",
    badgeInstitution: "For institutions",
    badgeHuman: "Human touch",
    plans: [
      {
        name: "See Your Place", price: "Free", priceUnit: null,
        sub: "Start right after login · 1-page depth",
        features: ["One overall risk number", "Eight-eyes summary", "One-line identity", "10-year forecast", "5 languages"],
        limit: "This is the job's average, not yet you",
      },
      {
        name: "Know Your Grain", price: "₩9,900", priceUnit: "/mo",
        sub: "Coming soon",
        features: ["5 core deepening questions", "4–5p PDF report", "Time-share · AI risk map", "Mini limits page (P.17)"],
        limit: "Only part of your grain is reflected. We print the inputs we didn't receive",
      },
      {
        name: "Map Your Path", price: "₩19,900", priceUnit: "/mo",
        sub: "Coming soon",
        features: ["10 deepening questions + chatbot", "8–10p PDF report", "Scenarios A·B·C", "30-day actions + 18-month roadmap", "Full limits page (P.17)", "Market-change update alerts (your report grows)"],
        limit: "AI-generated, not human-reviewed. Identity and decision are shaped with a person in the 1:1 Custom Report",
      },
      {
        name: "1:1 Custom Report", price: "₩149,000", priceUnit: "/report",
        sub: "Coming soon · 5–7 day delivery",
        features: ["Pre-survey + 1:1 (written·phone·video)", "22-page custom report", "Identity naming — shaped by a person", "Strength assets", "The Decision · Letter"],
        limit: "There are still things we don't know. This report is a starting line, not a finish line",
      },
      {
        name: "Our Children's Grain", price: "₩1,000,000", priceUnit: "/yr",
        sub: "For 30 students · per semester",
        features: ["Student survey + teacher input", "8–10p report per student", "Crossroads compare (2–4 jobs side by side)", "Class stats · teacher dashboard", "AI coach (youth mode)", "Parent sharing"],
        limit: "These results aren't a substitute for counseling — they're material for it",
      },
    ],
  },
};

export function getLanding(lang: LangCode): LandingContent {
  return lang === "ko" ? KO : EN;
}
