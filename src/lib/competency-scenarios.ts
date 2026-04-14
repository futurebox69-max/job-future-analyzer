import { Scenario, QuestionType, CompetencyKey } from '@/types/competency';

export const questionTypeMap: Record<QuestionType, string> = {
  scenario: '논리적 · 현실지향',
  game:     '은유적 · 게임친화',
  image:    '직관적 · 감각형',
  rank:     '분석적 · 체계형',
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
