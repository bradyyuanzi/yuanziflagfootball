
export type Position = 'QB' | 'WR' | 'RB' | 'CB' | 'LB' | 'S' | 'RUSH';
export type AgeGroup = 'U6' | 'U8' | 'U10' | 'U12';

export enum StatType {
  OFFENSE_QB = 'OFFENSE_QB',
  OFFENSE_SKILL = 'OFFENSE_SKILL', // WR/RB
  DEFENSE = 'DEFENSE',
}

// QB Stats
export interface QBStats {
  passAttempts: number;
  passCompletions: number;
  passYards: number;
  passTDs: number;
  interceptionsThrown: number;
  sacksTaken: number;
}

// WR/RB Stats
export interface SkillStats {
  targets: number;
  catches: number;
  receivingYards: number;
  receivingTDs: number;
  rushingYards: number;
  rushingTDs: number;
}

// Defense Stats (CB, LB, S, RUSH)
export interface DefenseStats {
  flagPullsAttempts: number;
  flagPullsSuccess: number;
  interceptionsCaught: number;
  passDeflections: number;
  sacksMade: number;
  defensiveTDs: number;
}

export type PlayerStats = QBStats | SkillStats | DefenseStats;

export interface Player {
  id: string;
  name: string;
  number: number;
  positions: Position[]; // Changed to array
  ageGroup: AgeGroup;    // New field
  avatar: string; 
  stats: { [key in Position]?: PlayerStats }; // Map position to stats
  aiAnalysis?: string;
}

// Training Types
export type FileType = 'image' | 'pdf' | 'word' | 'excel' | 'other';

export interface TrainingFile {
  id: string;
  name: string;
  type: FileType;
  data: string; // Base64 or URL
  size?: string;
}

export interface TrainingSession {
  id: string;
  title: string;
  date: string;
  description: string;
  files: TrainingFile[];
}

export const isQB = (p: Position): boolean => p === 'QB';
export const isSkill = (p: Position): boolean => p === 'WR' || p === 'RB';
export const isDefense = (p: Position): boolean => ['CB', 'LB', 'S', 'RUSH'].includes(p);

export const getStatType = (pos: Position): StatType => {
  if (isQB(pos)) return StatType.OFFENSE_QB;
  if (isSkill(pos)) return StatType.OFFENSE_SKILL;
  return StatType.DEFENSE;
};

export const getInitialStats = (pos: Position): PlayerStats => {
  if (isQB(pos)) {
    return {
      passAttempts: 0,
      passCompletions: 0,
      passYards: 0,
      passTDs: 0,
      interceptionsThrown: 0,
      sacksTaken: 0,
    } as QBStats;
  }
  if (isSkill(pos)) {
    return {
      targets: 0,
      catches: 0,
      receivingYards: 0,
      receivingTDs: 0,
      rushingYards: 0,
      rushingTDs: 0,
    } as SkillStats;
  }
  return {
    flagPullsAttempts: 0,
    flagPullsSuccess: 0,
    interceptionsCaught: 0,
    passDeflections: 0,
    sacksMade: 0,
    defensiveTDs: 0,
  } as DefenseStats;
};