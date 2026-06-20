
import { Player } from "../types";
import { WINNING_LINES } from "../constants";

export const calculateWinner = (board: Player[]): Player | 'Draw' | null => {
  for (let i = 0; i < WINNING_LINES.length; i++) {
    const [a, b, c] = WINNING_LINES[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every(cell => cell !== null)) return 'Draw';
  return null;
};

export const minimax = (board: Player[], depth: number, isMaximizing: boolean): number => {
  const winner = calculateWinner(board);
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (board.every(s => s !== null)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const score = minimax(board, depth + 1, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        const score = minimax(board, depth + 1, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
};

export const getRandomMove = (board: Player[]): number => {
  const availableMoves = board.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
};

export const getHeuristicMove = (board: Player[]): number => {
  const availableMoves = board.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
  
  // 1. Return early: Immediate Win (Highest Priority)
  for (const move of availableMoves) {
    const boardCopy = [...board];
    boardCopy[move] = 'O';
    if (calculateWinner(boardCopy) === 'O') return move;
  }

  // 2. Try-Except Logic: Block Opponent's Immediate Win (Exception Handling)
  // This is handled BEFORE any general optimizations like taking the center.
  for (const move of availableMoves) {
    const boardCopy = [...board];
    boardCopy[move] = 'X';
    if (calculateWinner(boardCopy) === 'X') return move;
  }

  // 3. Performance Optimization: Take the center
  if (board[4] === null) return 4;

  // 4. Load Balancing: Take corners
  const corners = [0, 2, 6, 8].filter(c => board[c] === null);
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // 5. Default Fallback: Random move
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
};

export const getMinimaxMove = (board: Player[]): number => {
  let bestScore = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'O';
      const score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
};
