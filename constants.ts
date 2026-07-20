
import { Achievement } from "./types";

export const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const INITIAL_BOARD = Array(9).fill(null);

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_win",
    title: "First Blood",
    description: "Register your first human victory.",
    icon: "⚔️",
    color: "text-emerald-400 border-emerald-500 bg-emerald-950/20",
  },
  {
    id: "ten_games",
    title: "Persistence Pays",
    description: "Complete 10 total matches.",
    icon: "💾",
    color: "text-blue-400 border-blue-500 bg-blue-950/20",
  },
  {
    id: "perfect_defeat",
    title: "Perfect AI Defeat",
    description: "Defeat the AI in the minimum of 3 moves.",
    icon: "⚡",
    color: "text-amber-400 border-amber-500 bg-amber-950/20",
  },
  {
    id: "hacker_defeat",
    title: "Hacker Defeated",
    description: "Defeat the AI on IMPOSSIBLE or GEMINI level.",
    icon: "💻",
    color: "text-purple-400 border-purple-500 bg-purple-950/20",
  },
  {
    id: "streak_master",
    title: "On Fire",
    description: "Achieve a win streak of 3 against the AI.",
    icon: "🔥",
    color: "text-rose-400 border-rose-500 bg-rose-950/20",
  },
];

export const DIFFICULTY_LABELS = {
  EASY: 'Script Kiddie',
  MEDIUM: 'Senior Dev',
  IMPOSSIBLE: 'Minimax Algorithm',
  GEMINI: 'The AI Overlord'
};

export const DIFFICULTY_DESCRIPTIONS = {
  EASY: 'Randomly selects moves. Perfect for your first hello-world.',
  MEDIUM: 'Heuristic-based logic. Prioritizes blocking threats before optimization.',
  IMPOSSIBLE: 'Mathematical perfection via Minimax. You cannot win.',
  GEMINI: 'Generative intelligence using Gemini 3 Flash. Unpredictable & witty.'
};

export const MODE_DESCRIPTIONS = {
  PVA: 'Challenge the machine. Select a difficulty level to test your logic.',
  PVP: 'Local multiplayer mode. Pass the keyboard to a friend.'
};

export const SYMBOL_DESCRIPTIONS = {
  X: 'X is the "default argument" of Tic-Tac-Toe. Starting first provides a tactical initialization advantage in the game state.',
  O: 'O functions as a "try-except" block. It is designed to catch the first player\'s errors and handle exceptions in their board logic.'
};
