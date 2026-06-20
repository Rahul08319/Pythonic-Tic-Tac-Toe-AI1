
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

export interface Settings {
  volume: number;
  animationsEnabled: boolean;
  soundsEnabled: boolean;
}

export interface StatRecord {
  wins: number;
  losses: number;
  draws: number;
}

export interface GameStats {
  PVA: Record<Difficulty, StatRecord>;
  PVP: StatRecord;
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
