
import { GoogleGenAI } from "@google/genai";
import { Player, Difficulty, AIPersonality } from "../types";
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
          model: 'gemini-3.5-flash',
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

export const getGeminiCommentary = async (
  board: Player[], 
  lastMove: number, 
  winner: Player | 'Draw' | null, 
  difficulty?: Difficulty,
  personality: AIPersonality = 'Sarcastic Coder'
): Promise<string> => {
  try {
    const boardDisplay = board.map((v, i) => (i % 3 === 0 ? '\n' : '') + (v || '-')).join(' ');
    
    let stateCategory: keyof typeof STATE_JOKES = 'MISTAKE';
    if (winner === 'Draw') stateCategory = 'DRAW';
    else if (winner === 'O') stateCategory = 'WIN';
    else if (winner === 'X') stateCategory = 'LOSS';

    const baseJoke = STATE_JOKES[stateCategory][Math.floor(Math.random() * STATE_JOKES[stateCategory].length)];

    let personalityPrompt = "";
    if (personality === 'Sarcastic Coder') {
      personalityPrompt = `You are a snarky, passive-aggressive senior Python developer reviewing a junior dev's PR.
      Throw in deep Python/general developer humor (like "off-by-one error", "incorrect indentation", "Global Interpreter Lock", "duck typing", "monkey patching", or "unhandled exception").
      Offer a biting but humorous "code review" comment on their move at index ${lastMove}.`;
    } else if (personality === 'Helpful Mentor') {
      personalityPrompt = `You are an incredibly encouraging, warm, and helpful Python teacher and mentor.
      Use friendly programming references (like "beautiful docstring list", "excellent recursive strategy", "clean PEP8 formatting", "smart decorator usage", or "thoughtful variable naming").
      Review their move at index ${lastMove} positively, explaining why it was a constructive decision and offering gentle guidance for current best practices.`;
    } else if (personality === 'Aggressive Hacker') {
      personalityPrompt = `You are a high-stakes, intense netsec cyber-security expert / black-hat terminal hacker in a retro cyberpunk terminal.
      Use cool cyber-security lingo (like "security perimeter compromised", "stack frame overflow", "firewall bypass", "logic bomb armed", "root partition accessed", "injecting payload", or "intercepting packet headers").
      Review their move at index ${lastMove} like an elite hack, highlighting the defensive breach or tactical exploits of the board state.`;
    }

    const prompt = `Analyze the Tic-Tac-Toe state.
    Board Representation:${boardDisplay}
    Last Move Index: ${lastMove} (placed by Player ${board[lastMove] || '?'})
    Game State: ${winner ? (winner === 'Draw' ? 'Stalemate reached' : winner + ' wins') : 'Ongoing game'}
    Game Atmosphere: ${stateCategory}
    Theme Hint: ${baseJoke}

    Personality Guidance:
    ${personalityPrompt}

    Instruction: Generate a single witty, fully in-character, highly engaging, and relevant one-sentence comment on the move at index ${lastMove}. Do not include markdown formatting or quotes. Keep it to exactly one sentence.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (err) {
    return "RuntimeError: Brain database connection lost. Playback fallback initialized.";
  }
};
