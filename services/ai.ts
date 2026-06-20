
import { GoogleGenAI } from "@google/genai";
import { Player, Difficulty } from "../types";
import { getRandomMove, getHeuristicMove, getMinimaxMove } from "./ai_logic";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const STATE_JOKES = {
  WIN: [
    "Process completed with exit code 0. Your logic has been successfully garbage collected.",
    "Unit test passed with 100% coverage. I am the superior implementation.",
    "Merged successfully into main. You've been deprecated.",
    "Your algorithm has been optimized into obsolescence."
  ],
  LOSS: [
    "Critical failure: Unexpected human competence detected. I'll need to refactor my entire core.",
    "SyntaxError in my ego. You somehow found an exploit in my minimax logic.",
    "Looks like I missed a corner case. I'll blame it on a missing dependency.",
    "You just forced a push to my production environment. Impressive."
  ],
  DRAW: [
    "Deadlock detected. Both processes are stuck waiting for a resource that will never be released.",
    "We've reached an infinite loop of mediocrity. Terminating execution.",
    "Race condition ended in a stalemate. No one wins in a global interpreter lock.",
    "This game is like a poorly written recursion: it goes nowhere and ends in a stack overflow."
  ],
  MISTAKE: [
    "That move is like an early return in a loop—technically valid but you've missed the bigger logic.",
    "Off-by-one error. You were looking for index 4, weren't you?",
    "Your indentation is off. Metaphorically speaking, your strategy is unreadable.",
    "I'd offer a code review, but this strategy needs a complete rewrite."
  ]
};

export const getBestMove = async (board: Player[], difficulty: Difficulty): Promise<number> => {
  const availableMoves = board.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
  if (availableMoves.length === 0) return -1;

  switch (difficulty) {
    case Difficulty.EASY:
      return getRandomMove(board);
    case Difficulty.MEDIUM:
      return getHeuristicMove(board);
    case Difficulty.IMPOSSIBLE:
      return getMinimaxMove(board);
    case Difficulty.GEMINI:
      try {
        const boardStr = board.map((cell, i) => `${i}:${cell || '-'}`).join(', ');
        const prompt = `You are playing Tic-Tac-Toe as 'O'. The current board state is [${boardStr}]. 
        Available indices: ${availableMoves.join(', ')}. 
        Tell me ONLY the index of your next best move. No explanation, just the number.`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });
        
        const textMove = response.text.trim();
        const parsedMove = parseInt(textMove);
        if (!isNaN(parsedMove) && availableMoves.includes(parsedMove)) {
          return parsedMove;
        }
        return availableMoves[0];
      } catch (err) {
        return availableMoves[0];
      }
    default:
      return availableMoves[0];
  }
};

export const getGeminiCommentary = async (board: Player[], lastMove: number, winner: Player | 'Draw' | null, difficulty?: Difficulty): Promise<string> => {
  try {
    const boardDisplay = board.map((v, i) => (i % 3 === 0 ? '\n' : '') + (v || '-')).join(' ');
    const moveCount = board.filter(x => x !== null).length;
    
    let stateCategory: keyof typeof STATE_JOKES = 'MISTAKE';
    if (winner === 'Draw') stateCategory = 'DRAW';
    else if (winner === 'O') stateCategory = 'WIN';
    else if (winner === 'X') stateCategory = 'LOSS';

    const baseJoke = STATE_JOKES[stateCategory][Math.floor(Math.random() * STATE_JOKES[stateCategory].length)];

    const prompt = `You are a snarky Python developer playing Tic-Tac-Toe. 
    Context:
    Board State:${boardDisplay}
    Last Move Index: ${lastMove} (Player's move)
    Game Status: ${winner ? winner + ' wins' : 'Ongoing'}
    Current Atmosphere: ${stateCategory}
    Base Inspiration: ${baseJoke}
    
    Instruction: Generate a one-sentence witty remark using deep Python metaphors.
    - If ongoing, provide a "code review" comment on their move at index ${lastMove}.
    - Reference specific errors like: "off-by-one error", "early return", "incorrect indentation", "Global Interpreter Lock", "duck typing", or "monkey patching".
    - Frame the response as if you're reviewing a junior's PR.
    - Be specific to the move at ${lastMove}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (err) {
    return "RuntimeError: Brain not found. Please pip install intelligence.";
  }
};
