import { Scenario, QuestionType, CompetencyKey, CompetencyScores } from '@/types/competency';
import { Loc, LangCode, loc } from '@/lib/i18n';

/** 번역 진행 중인 시나리오 데이터의 내부 표현 (ko·en 필수, 나머지는 en 폴백) */
interface LocChoice {
  text?: Loc;
  emoji?: string;
  label?: Loc;
  desc?: Loc;
  skills: Partial<CompetencyScores>;
  fb?: Loc;
}
interface LocScenario {
  context: Loc;
  emoji: string;
  text: Loc;
  type: Scenario['type'];
  persona?: string;
  choices?: LocChoice[];
  items?: Loc[];
  skillMap?: CompetencyKey[];
}

export const questionTypeMap: Record<QuestionType, Loc> = {
  scenario: { ko: '논리적 · 현실지향', en: 'Logical · Reality-oriented' },
  game:     { ko: '은유적 · 게임친화', en: 'Metaphorical · Game-friendly' },
  image:    { ko: '직관적 · 감각형', en: 'Intuitive · Sensory' },
  rank:     { ko: '분석적 · 체계형', en: 'Analytical · Systematic' },
};

/** 질문 유형 의미를 현재 언어로 반환 */
export function questionTypeMeaning(type: QuestionType, lang: LangCode): string {
  return loc(questionTypeMap[type], lang);
}

// 청소년/게임형 시나리오
const youthScenarios: LocScenario[] = [
  {
    context: { ko: '롤 상황', en: 'League of Legends' }, emoji: '⚔️',
    text: {
      ko: '랭크 게임 중, 정글러가 갱을 3번 실패했다. 팀 채팅에 욕이 올라오기 시작한다.',
      en: 'In a ranked game, the jungler has failed three ganks in a row. Insults start flooding the team chat.',
    },
    type: 'game',
    choices: [
      { text: { ko: '"왜 실패했는지 같이 봐보자" — 리플레이 분석 제안', en: '"Let\'s review why it failed together" — suggest watching the replay', }, skills: { structural: 3, collab: 1 }, fb: { ko: '팀의 분석가', en: 'The team\'s analyst' } },
      { text: { ko: '"괜찮아, 한타 때 캐리하면 돼" — 멘탈 케어', en: '"It\'s fine, we\'ll carry in the teamfight" — manage morale', }, skills: { emotional: 3, collab: 1 }, fb: { ko: '팀의 힐러', en: 'The team\'s healer' } },
      { text: { ko: '말 없이 다른 라인 로밍으로 스스로 전세 뒤집기 시도', en: 'Say nothing and try to turn the game by roaming other lanes yourself', }, skills: { adaptive: 3, creative: 1 }, fb: { ko: '행동으로 보여주는 타입', en: 'Leads by action' } },
      { text: { ko: '"욕하면 게임 더 망해. 뮤트하고 플레이하자"', en: '"Flaming only makes it worse. Let\'s mute and play"', }, skills: { ethical: 3, emotional: 1 }, fb: { ko: '팀의 기강', en: 'The team\'s discipline' } },
    ],
  },
  {
    context: { ko: '마인크래프트 상황', en: 'Minecraft' }, emoji: '⛏️',
    text: {
      ko: '친구와 같이 만든 건축물을 다른 사람이 몰래 부쉈다. 백업은 없다.',
      en: 'Someone secretly destroyed the build you made with a friend. There\'s no backup.',
    },
    type: 'game',
    choices: [
      { text: { ko: '누가 했는지 로그 추적 → 증거 확보 후 서버 관리자에게 신고', en: 'Trace the logs to find who did it → gather evidence and report to the server admin', }, skills: { structural: 3, ethical: 1 }, fb: { ko: '증거 기반 사고', en: 'Evidence-based thinking' } },
      { text: { ko: '친구와 더 멋진 걸 새로 짓자고 제안 — 오히려 업그레이드 기회', en: 'Suggest building something even better with your friend — turn it into an upgrade', }, skills: { creative: 3, emotional: 1 }, fb: { ko: '위기를 기회로', en: 'Crisis into opportunity' } },
      { text: { ko: '서버 보호 플러그인 설치 — 같은 일이 반복되지 않게 시스템 구축', en: 'Install a protection plugin — build a system so it can\'t happen again', }, skills: { adaptive: 3, structural: 1 }, fb: { ko: '시스템으로 방지', en: 'Prevent with systems' } },
      { text: { ko: '그 사람과 직접 대화 — 왜 그랬는지 먼저 물어보기', en: 'Talk to the person directly — ask why they did it first', }, skills: { emotional: 3, collab: 1 }, fb: { ko: '대화로 해결', en: 'Resolve by dialogue' } },
    ],
  },
  {
    context: { ko: '포트나이트 상황', en: 'Fortnite' }, emoji: '🏗️',
    text: {
      ko: '스쿼드 결승. 팀원 3명 다 죽고 나 혼자 남았다. 상대는 4명.',
      en: 'Squad finals. All three teammates are down and you\'re the last one. The enemy has four.',
    },
    type: 'game',
    choices: [
      { text: { ko: '지형 분석 → 고지대 확보 → 하나씩 유인해서 각개격파', en: 'Read the terrain → take the high ground → bait them out one by one', }, skills: { structural: 3, adaptive: 1 }, fb: { ko: '전략적 사고', en: 'Strategic thinking' } },
      { text: { ko: '예상 못한 루트로 기습 — 정석이 아닌 창의적 무빙', en: 'Ambush from an unexpected route — unconventional, creative movement', }, skills: { creative: 3, adaptive: 1 }, fb: { ko: '예측 불가능한 플레이', en: 'Unpredictable play' } },
      { text: { ko: '죽은 팀원에게 콜 받으면서 협동 — "왼쪽에서 온다!" 정보 활용', en: 'Coordinate with downed teammates calling it out — "Coming from the left!"', }, skills: { collab: 3, emotional: 1 }, fb: { ko: '팀이 죽어도 협업', en: 'Teamwork even when down' } },
      { text: { ko: '무리하지 않고 생존 우선 — 링 이동하면서 어부지리 노림', en: 'Play it safe and survive — rotate with the ring and let them fight', }, skills: { adaptive: 3, ethical: 1 }, fb: { ko: '냉정한 판단력', en: 'Cool-headed judgment' } },
    ],
  },
  {
    context: { ko: '로블록스 상황', en: 'Roblox' }, emoji: '🎭',
    text: {
      ko: '네가 만든 게임에 친구가 "재미없다"고 했다. 조회수도 3명.',
      en: 'A friend said the game you made is "boring." It only has 3 plays.',
    },
    type: 'game',
    choices: [
      { text: { ko: '다른 인기 게임 분석 — 뭐가 다른지 구조적으로 비교', en: 'Analyze other popular games — compare structurally what\'s different', }, skills: { structural: 3, creative: 1 }, fb: { ko: '벤치마킹의 힘', en: 'The power of benchmarking' } },
      { text: { ko: '완전히 새로운 컨셉으로 v2 도전', en: 'Try a v2 with a completely new concept', }, skills: { creative: 3, adaptive: 1 }, fb: { ko: '과감한 리빌드', en: 'A bold rebuild' } },
      { text: { ko: '친구한테 "정확히 어디가 재미없어?"라고 구체적으로 물어보기', en: 'Ask your friend specifically: "What exactly is boring?"', }, skills: { emotional: 3, collab: 1 }, fb: { ko: '피드백의 가치', en: 'The value of feedback' } },
      { text: { ko: '3명이라도 플레이한 사람에게 DM — "뭐가 좋았어?"', en: 'DM the 3 who did play — "What did you like?"', }, skills: { collab: 3, structural: 1 }, fb: { ko: '유저의 목소리', en: 'The user\'s voice' } },
    ],
  },
];

// 성인 시나리오
const adultScenarios: LocScenario[] = [
  {
    context: { ko: '직장 현실', en: 'Workplace reality' }, emoji: '📊',
    text: {
      ko: '팀장이 AI 도입을 밀어붙이는데, 동료들이 "우리 일자리 없어지는 거 아냐?"라며 불안해한다. 당신은 중간 입장.',
      en: 'Your manager is pushing AI adoption, and colleagues worry, "Won\'t this take our jobs?" You\'re caught in the middle.',
    },
    type: 'scenario',
    choices: [
      { text: { ko: 'AI가 대체할 업무와 그렇지 않은 업무를 목록으로 정리해서 팀 미팅에서 공유', en: 'List which tasks AI will replace and which it won\'t, and share it at the team meeting', }, skills: { structural: 3, collab: 1 }, fb: { ko: '불안을 구조로 전환', en: 'Turning anxiety into structure' } },
      { text: { ko: '동료들의 감정을 먼저 인정하고, 1:1로 각자의 걱정을 들어본다', en: 'Acknowledge colleagues\' feelings first and hear each one\'s worries one-on-one', }, skills: { emotional: 3, ethical: 1 }, fb: { ko: '감정이 먼저다', en: 'Emotions come first' } },
      { text: { ko: 'AI 도입한 다른 팀 사례를 빠르게 조사해서 "이렇게 됐더라"고 공유', en: 'Quickly research other teams that adopted AI and share "here\'s how it went"', }, skills: { adaptive: 3, structural: 1 }, fb: { ko: '사례가 불안을 줄인다', en: 'Cases ease anxiety' } },
      { text: { ko: 'AI가 못하는 일을 우리 팀이 선점하자는 새로운 포지셔닝 제안', en: 'Propose a new positioning: claim the work AI can\'t do', }, skills: { creative: 3, adaptive: 1 }, fb: { ko: '위기를 기회로 전환', en: 'Crisis into opportunity' } },
    ],
  },
  {
    context: { ko: '이직 고민', en: 'Job-change dilemma' }, emoji: '🔄',
    text: {
      ko: '연봉 30% 오르는 이직 제안. 하지만 지금 팀에서 중요한 프로젝트가 한창이고, 팀원들이 당신에게 의지하고 있다.',
      en: 'A job offer with a 30% raise. But a critical project is mid-flight on your current team, and your teammates rely on you.',
    },
    type: 'scenario',
    choices: [
      { text: { ko: '현재 프로젝트 마무리 일정, 이직처 입사 가능일을 구조적으로 정리하고 양쪽과 조율', en: 'Map out the project finish date and the new start date, and coordinate with both sides', }, skills: { structural: 3, ethical: 1 }, fb: { ko: '구조적 의사결정', en: 'Structured decision-making' } },
      { text: { ko: '팀원들에게 솔직하게 상황 공유 — 숨기는 것보다 함께 고민', en: 'Share the situation honestly with teammates — think it through together rather than hide it', }, skills: { emotional: 3, collab: 1 }, fb: { ko: '투명함의 힘', en: 'The power of transparency' } },
      { text: { ko: '이직처에서 한 달 유예 요청 + 현재 프로젝트 인수인계 계획 수립', en: 'Ask the new employer for a month\'s grace + draw up a handover plan', }, skills: { adaptive: 3, collab: 1 }, fb: { ko: '양쪽 다 잡기', en: 'Win on both sides' } },
      { text: { ko: '연봉이 아니라 "3년 후 나의 성장"으로 기준을 재설정하고 판단', en: 'Reset the criterion from salary to "my growth three years out" and decide', }, skills: { ethical: 3, creative: 1 }, fb: { ko: '장기적 관점', en: 'The long view' } },
    ],
  },
  {
    context: { ko: '부업/창업', en: 'Side hustle / startup' }, emoji: '💡',
    text: {
      ko: '퇴근 후 시작한 부업이 월 200만원. 본업 월급과 비슷해졌다. 풀타임 전환할까?',
      en: 'Your after-hours side hustle now earns as much as your day job. Should you go full-time?',
    },
    type: 'scenario',
    choices: [
      { text: { ko: '6개월 치 수입, 비용, 성장률 데이터로 분석. 감이 아닌 숫자로 결정', en: 'Analyze 6 months of revenue, cost, and growth data. Decide by numbers, not gut', }, skills: { structural: 3, adaptive: 1 }, fb: { ko: '데이터 기반 결정', en: 'Data-driven decision' } },
      { text: { ko: '부업 고객 5명에게 직접 물어본다. "풀타임하면 더 쓸 의향 있어요?"', en: 'Ask 5 of your customers directly: "Would you spend more if I went full-time?"', }, skills: { collab: 3, emotional: 1 }, fb: { ko: '고객이 답이다', en: 'The customer is the answer' } },
      { text: { ko: '본업을 줄이면서(파트타임, 무급휴직) 중간 단계를 먼저 시도', en: 'Try an in-between step first — go part-time or take unpaid leave', }, skills: { adaptive: 3, ethical: 1 }, fb: { ko: '리스크 분산', en: 'Spreading the risk' } },
      { text: { ko: '부업의 비즈니스 모델을 완전히 재설계해서 본업을 대체할 수준으로 만들기', en: 'Redesign the side hustle\'s business model entirely so it can replace the day job', }, skills: { creative: 3, structural: 1 }, fb: { ko: '스케일업 설계', en: 'Designing the scale-up' } },
    ],
  },
  {
    context: { ko: '가정', en: 'Family' }, emoji: '👨‍👩‍👧',
    text: {
      ko: '초등학생 아이가 "유튜버 되고 싶다"고 한다. 배우자는 반대, 아이는 열정적.',
      en: 'Your grade-schooler says they want to be a YouTuber. Your spouse is against it; the child is passionate.',
    },
    type: 'scenario',
    choices: [
      { text: { ko: '"왜 유튜버?"를 깊이 물어본다. 영상 만들기가 좋은 건지, 유명해지고 싶은 건지', en: 'Dig into "why a YouTuber?" — is it about making videos, or about being famous?', }, skills: { structural: 3, emotional: 1 }, fb: { ko: '동기의 구조를 파악', en: 'Grasp the structure of motivation' } },
      { text: { ko: '가족 회의 소집. 아이, 배우자 각자 의견을 공평하게 듣고 규칙을 함께 정한다', en: 'Call a family meeting. Hear child and spouse fairly, and set the rules together', }, skills: { collab: 3, ethical: 1 }, fb: { ko: '함께 결정하는 힘', en: 'The power of deciding together' } },
      { text: { ko: '일단 해보게 한다. 한 달간 영상 3개 만들어보고 그 경험으로 다시 대화', en: 'Let them try. Make 3 videos over a month, then talk again with that experience', }, skills: { adaptive: 3, creative: 1 }, fb: { ko: '체험이 판단을 바꾼다', en: 'Experience changes judgment' } },
      { text: { ko: '유튜브 대신 영상 제작 수업을 제안. 꿈을 지지하되 기술을 먼저', en: 'Suggest a video-making class instead. Support the dream, but skills first', }, skills: { creative: 3, ethical: 1 }, fb: { ko: '방향을 재설계', en: 'Redesign the direction' } },
    ],
  },
];

// 이미지형 시나리오
const imageScenarios: LocScenario[] = [
  {
    context: { ko: '직감 선택 1', en: 'Gut choice 1' }, emoji: '',
    text: { ko: '두 장면 중 끌리는 것을 고르세요.', en: 'Choose the scene that draws you in.' },
    type: 'image',
    choices: [
      { emoji: '🏔️', label: { ko: '혼자 정상에 선 사람', en: 'Alone at the summit' }, desc: { ko: '고독하지만 전체를 본다', en: 'Solitary, but sees the whole' }, skills: { structural: 3, ethical: 1 } },
      { emoji: '🎪', label: { ko: '축제에서 춤추는 사람들', en: 'Dancing at a festival' }, desc: { ko: '함께여서 즐겁다', en: 'Joyful because it\'s together' }, skills: { emotional: 3, collab: 1 } },
    ],
  },
  {
    context: { ko: '직감 선택 2', en: 'Gut choice 2' }, emoji: '',
    text: { ko: '어떤 도구가 더 끌리나요?', en: 'Which tool draws you more?' },
    type: 'image',
    choices: [
      { emoji: '🔭', label: { ko: '망원경', en: 'Telescope' }, desc: { ko: '멀리 내다보는 것', en: 'Seeing far ahead' }, skills: { structural: 2, ethical: 2 } },
      { emoji: '🎨', label: { ko: '물감 팔레트', en: 'Paint palette' }, desc: { ko: '새로운 것을 만드는 것', en: 'Making something new' }, skills: { creative: 3, adaptive: 1 } },
    ],
  },
  {
    context: { ko: '직감 선택 3', en: 'Gut choice 3' }, emoji: '',
    text: { ko: '위기 상황. 어떤 역할이 더 끌리나요?', en: 'A crisis hits. Which role draws you more?' },
    type: 'image',
    choices: [
      { emoji: '🧭', label: { ko: '길을 찾는 항해사', en: 'The navigator finding the way' }, desc: { ko: '방향을 정하는 사람', en: 'The one who sets direction' }, skills: { structural: 2, adaptive: 2 } },
      { emoji: '🩹', label: { ko: '상처를 치료하는 의료진', en: 'The medic tending wounds' }, desc: { ko: '사람을 돌보는 사람', en: 'The one who cares for people' }, skills: { emotional: 3, ethical: 1 } },
    ],
  },
  {
    context: { ko: '직감 선택 4', en: 'Gut choice 4' }, emoji: '',
    text: { ko: '팀에서 맡고 싶은 역할은?', en: 'Which role would you want on a team?' },
    type: 'image',
    choices: [
      { emoji: '🎯', label: { ko: '전략가', en: 'The strategist' }, desc: { ko: '계획을 세우는 사람', en: 'The one who makes the plan' }, skills: { structural: 3, creative: 1 } },
      { emoji: '🤝', label: { ko: '중재자', en: 'The mediator' }, desc: { ko: '사람들을 잇는 사람', en: 'The one who connects people' }, skills: { collab: 3, emotional: 1 } },
    ],
  },
];

// 순위형 시나리오
const rankScenarios: LocScenario[] = [
  {
    context: { ko: '가치 순위', en: 'Ranking values' }, emoji: '⚖️',
    text: { ko: 'AI 시대에 가장 중요한 순서로 배열하세요.', en: 'Rank these from most to least important in the AI era.' },
    type: 'rank',
    items: [
      { ko: '공감 능력', en: 'Empathy' },
      { ko: '문제 해결력', en: 'Problem-solving' },
      { ko: '빠른 적응력', en: 'Fast adaptability' },
      { ko: '윤리적 판단', en: 'Ethical judgment' },
      { ko: '창의적 사고', en: 'Creative thinking' },
      { ko: '협업 능력', en: 'Collaboration' },
    ],
    skillMap: ['emotional', 'structural', 'adaptive', 'ethical', 'creative', 'collab'],
  },
  {
    context: { ko: '행동 순위', en: 'Ranking actions' }, emoji: '🎯',
    text: { ko: '새 프로젝트 시작 시, 먼저 하는 순서대로.', en: 'When starting a new project, order what you do first.' },
    type: 'rank',
    items: [
      { ko: '사람들 의견 듣기', en: 'Hear people\'s input' },
      { ko: '데이터 분석하기', en: 'Analyze the data' },
      { ko: '일단 시작하기', en: 'Just start' },
      { ko: '계획 세우기', en: 'Make a plan' },
      { ko: '기존 사례 조사', en: 'Research prior cases' },
      { ko: '목표 재정의', en: 'Redefine the goal' },
    ],
    skillMap: ['collab', 'structural', 'adaptive', 'structural', 'adaptive', 'creative'],
  },
];

/** LocScenario → 현재 언어로 해석된 Scenario */
function localize(s: LocScenario, lang: LangCode): Scenario {
  return {
    context: loc(s.context, lang),
    emoji: s.emoji,
    text: loc(s.text, lang),
    type: s.type,
    persona: s.persona,
    choices: s.choices?.map((c) => ({
      text: c.text ? loc(c.text, lang) : undefined,
      emoji: c.emoji,
      label: c.label ? loc(c.label, lang) : undefined,
      desc: c.desc ? loc(c.desc, lang) : undefined,
      skills: c.skills,
      fb: c.fb ? loc(c.fb, lang) : undefined,
    })),
    items: s.items?.map((i) => loc(i, lang)),
    skillMap: s.skillMap,
  };
}

export function buildScenarios(
  mode: 'adult' | 'youth',
  questionType: QuestionType,
  lang: LangCode
): Scenario[] {
  const isYouth = mode === 'youth';
  const mainBank = isYouth ? youthScenarios : adultScenarios;

  let picked: LocScenario[];
  switch (questionType) {
    case 'scenario':
      picked = [...mainBank.slice(0, 4), ...imageScenarios.slice(0, 2), ...rankScenarios.slice(0, 2)];
      break;
    case 'game':
      picked = [...youthScenarios.slice(0, 4), ...adultScenarios.slice(0, 2), ...imageScenarios.slice(0, 2)];
      break;
    case 'image':
      picked = [...imageScenarios.slice(0, 4), ...mainBank.slice(0, 2), ...rankScenarios.slice(0, 2)];
      break;
    case 'rank':
      picked = [...rankScenarios.slice(0, 2), ...imageScenarios.slice(0, 4), ...mainBank.slice(0, 2)];
      break;
    default:
      picked = mainBank.slice(0, 8);
  }
  return picked.map((s) => localize(s, lang));
}

// rank 시나리오에서 순위 점수 계산
export function calcRankScores(
  items: string[],
  scenario: Scenario
): Partial<Record<CompetencyKey, number>> {
  const result: Partial<Record<CompetencyKey, number>> = {};
  items.forEach((item, i) => {
    const idx = scenario.items?.indexOf(item) ?? -1;
    const skillKey = scenario.skillMap?.[idx];
    const pts = Math.max(4 - i, 0);
    if (skillKey && pts > 0) {
      result[skillKey] = (result[skillKey] ?? 0) + pts;
    }
  });
  return result;
}
