
export type Player = 'X' | 'O' | null;

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  IMPOSSIBLE = 'IMPOSSIBLE',
  GEMINI = 'GEMINI'
}

export enum GameMode {
  PVP = 'PVP',
  PVA = 'PVA'
}

export type AIPersonality = 'Sarcastic Coder' | 'Helpful Mentor' | 'Aggressive Hacker';

export interface Settings {
  volume: number;
  animationsEnabled: boolean;
  soundsEnabled: boolean;
  aiPersonality: AIPersonality;
}

export interface StatRecord {
  wins: number;
  losses: number;
  draws: number;
}

export interface GameStats {
  PVA: Record<Difficulty, StatRecord>;
  PVP: StatRecord;
  pvaStreak?: number;
  maxPvaStreak?: number;
}

export interface GameState {
  board: Player[];
  xIsNext: boolean;
  winner: Player | 'Draw';
  winningLine: number[] | null;
  history: Player[][];
  stepNumber: number;
}

export interface LogEntry {
  timestamp: string;
  type: 'info' | 'error' | 'success' | 'ai';
  message: string;
}
