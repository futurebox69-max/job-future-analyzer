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
