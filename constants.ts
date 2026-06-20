
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
