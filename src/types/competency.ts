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
  structural: { icon: '🧩', name: '구조적 사고',   color: '#6C63FF', description: '복잡한 문제를 분해하고 패턴을 찾는 능력' },
  creative:   { icon: '🎨', name: '창의적 재설계', color: '#FF6B6B', description: '기존 틀을 깨고 새로운 해법을 만드는 능력' },
  emotional:  { icon: '💫', name: '감성 연결',     color: '#F472B6', description: '사람의 감정을 읽고 공감하는 능력' },
  adaptive:   { icon: '⚡', name: '적응 민첩성',   color: '#F59E0B', description: '변화에 빠르게 대응하고 학습하는 능력' },
  ethical:    { icon: '⚖️', name: '윤리적 판단',   color: '#A78BFA', description: '가치와 원칙에 기반한 판단 능력' },
  collab:     { icon: '🤝', name: '협업 지능',     color: '#34D399', description: '다양한 사람과 시너지를 만드는 능력' },
};

export const ARCHETYPES: Record<CompetencyKey, { emoji: string; title: string; subtitle: string }> = {
  structural: { emoji: '🧩', title: '구조 해석자',    subtitle: '복잡한 세상의 지도를 그리는 사람' },
  creative:   { emoji: '🎨', title: '재설계자',        subtitle: '틀을 깨고 새로운 가능성을 여는 사람' },
  emotional:  { emoji: '💫', title: '감성 연결자',    subtitle: '기술이 닿지 못하는 마음을 돌보는 사람' },
  adaptive:   { emoji: '⚡', title: '변화 서퍼',       subtitle: '파도를 두려워하지 않고 타는 사람' },
  ethical:    { emoji: '⚖️', title: '기술의 양심',    subtitle: '할 수 있다와 해야 한다 사이의 판단자' },
  collab:     { emoji: '🤝', title: '시너지 설계자', subtitle: '사람과 AI의 다리를 놓는 사람' },
};
