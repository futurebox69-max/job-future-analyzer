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
}

const KO: LandingContent = {
  link_paid: "유료 플랜 자세히 보기 →",
  link_beta_v3: "새 분석 방식 미리보기 (베타) →",
  login_free_3: "로그인하면 3회 무료 분석",
  auth_reason_3free: "로그인하면 무료로 3회 분석할 수 있습니다.",
  usage_left: (n) => `이번 달 ${n}회 남았습니다. 프리미엄으로 업그레이드하면 무제한 분석이 가능합니다.`,
  nav_login: "로그인",
  nav_logout: "로그아웃",
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
};

const EN: LandingContent = {
  link_paid: "See paid plans →",
  link_beta_v3: "Try the new analysis flow (beta) →",
  login_free_3: "Log in for 3 free analyses",
  auth_reason_3free: "Log in to get 3 free analyses.",
  usage_left: (n) => `${n} left this month. Upgrade to premium for unlimited analyses.`,
  nav_login: "Log in",
  nav_logout: "Log out",
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
};

export function getLanding(lang: LangCode): LandingContent {
  return lang === "ko" ? KO : EN;
}
