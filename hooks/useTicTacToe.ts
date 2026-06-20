
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Player, Difficulty, GameMode, LogEntry, Settings, GameStats } from '../types';
import { WINNING_LINES, INITIAL_BOARD } from '../constants';
import { getBestMove, getGeminiCommentary } from '../services/ai';
import { sounds } from '../services/sounds';

const STORAGE_KEY_SETTINGS = 'py_ttt_settings';
const STORAGE_KEY_STATS = 'py_ttt_stats';

const DEFAULT_SETTINGS: Settings = { volume: 0.5, animationsEnabled: true, soundsEnabled: true };

const DEFAULT_STATS: GameStats = {
  PVA: {
    [Difficulty.EASY]: { wins: 0, losses: 0, draws: 0 },
    [Difficulty.MEDIUM]: { wins: 0, losses: 0, draws: 0 },
    [Difficulty.IMPOSSIBLE]: { wins: 0, losses: 0, draws: 0 },
    [Difficulty.GEMINI]: { wins: 0, losses: 0, draws: 0 },
  },
  PVP: { wins: 0, losses: 0, draws: 0 }
};

export const useTicTacToe = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STATS);
    return saved ? JSON.parse(saved) : DEFAULT_STATS;
  });

  const [history, setHistory] = useState<Player[][]>([INITIAL_BOARD]);
  const [stepNumber, setStepNumber] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState<Player | 'Draw'>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [mode, setMode] = useState<GameMode>(GameMode.PVA);
  const [userSymbol, setUserSymbol] = useState<'X' | 'O'>('X');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAiMoveIndex, setLastAiMoveIndex] = useState<number | null>(null);

  const currentBoard = useMemo(() => history[stepNumber], [history, stepNumber]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    sounds.volumeMultiplier = settings.volume;
    sounds.enabled = settings.soundsEnabled;
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  }, [stats]);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    setLogs(prev => [...prev, { timestamp, type, message }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    addLog('Environment Settings restored to factory defaults.', 'info');
  }, [addLog]);

  const updateStats = useCallback((gameWinner: Player | 'Draw') => {
    setStats(prev => {
      const newStats = { ...prev };
      if (mode === GameMode.PVP) {
        if (gameWinner === 'Draw') newStats.PVP.draws++;
        else newStats.PVP.wins++;
      } else {
        const record = newStats.PVA[difficulty];
        if (gameWinner === 'Draw') record.draws++;
        else if (gameWinner === userSymbol) record.wins++;
        else record.losses++;
      }
      return newStats;
    });
  }, [mode, difficulty, userSymbol]);

  const calculateWinner = (board: Player[]) => {
    for (let i = 0; i < WINNING_LINES.length; i++) {
      const [a, b, c] = WINNING_LINES[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line: WINNING_LINES[i] };
      }
    }
    if (board.every(cell => cell !== null)) {
      return { winner: 'Draw' as const, line: null };
    }
    return null;
  };

  const jumpTo = (step: number) => {
    setStepNumber(step);
    setXIsNext(step % 2 === 0);
    setWinner(null);
    setWinningLine(null);
    setLastAiMoveIndex(null);
    addLog(`System rollback: Reverted to step ${step}.`, 'info');
  };

  const makeMove = async (i: number) => {
    if (currentBoard[i] || winner || isProcessing) return;

    sounds.playMove();
    setLastAiMoveIndex(null); // Clear AI highlight on human move
    const newBoard = [...currentBoard];
    newBoard[i] = xIsNext ? 'X' : 'O';
    
    const nextHistory = history.slice(0, stepNumber + 1).concat([newBoard]);
    setHistory(nextHistory);
    setStepNumber(nextHistory.length - 1);
    
    const result = calculateWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      updateStats(result.winner);
      if (result.winner === 'Draw') sounds.playDraw(); else sounds.playWin();
      addLog(`${result.winner === 'Draw' ? 'Game Over: Draw' : `Game Over: ${result.winner} wins`}`, result.winner === 'Draw' ? 'info' : 'success');
      const comment = await getGeminiCommentary(newBoard, i, result.winner, difficulty);
      addLog(comment, 'ai');
    } else {
      setXIsNext(!xIsNext);
      addLog(`Move recorded at index ${i}`, 'info');
    }
  };

  const resetGame = useCallback(() => {
    setHistory([INITIAL_BOARD]);
    setStepNumber(0);
    setXIsNext(true);
    setWinner(null);
    setWinningLine(null);
    setIsProcessing(false);
    setLastAiMoveIndex(null);
    addLog('System Rebooted. Board Initialized.', 'info');
  }, [addLog]);

  const changeDifficulty = (diff: Difficulty) => {
    sounds.playDifficultySelect();
    setDifficulty(diff);
    resetGame();
  };

  const changeMode = (m: GameMode) => {
    sounds.playModeSwitch();
    setMode(m);
    resetGame();
  };

  useEffect(() => {
    const triggerAI = async () => {
      const isAITurn = mode === GameMode.PVA && 
                       ((xIsNext && userSymbol === 'O') || (!xIsNext && userSymbol === 'X'));

      if (isAITurn && !winner && !isProcessing) {
        setIsProcessing(true);
        addLog(`AI calculating move (Complexity: ${difficulty})...`, 'info');
        
        await new Promise(r => setTimeout(r, 600));
        const move = await getBestMove(currentBoard, difficulty);

        if (move !== -1) {
          sounds.playAiMove();
          setLastAiMoveIndex(move);
          const newBoard = [...currentBoard];
          newBoard[move] = xIsNext ? 'X' : 'O';
          
          const nextHistory = history.slice(0, stepNumber + 1).concat([newBoard]);
          setHistory(nextHistory);
          setStepNumber(nextHistory.length - 1);
          
          const result = calculateWinner(newBoard);
          if (result) {
            setWinner(result.winner);
            setWinningLine(result.line);
            updateStats(result.winner);
            if (result.winner === 'Draw') sounds.playDraw(); else sounds.playWin();
            addLog(`AI matched logic at index ${move}.`, 'success');
          } else {
            setXIsNext(!xIsNext);
            addLog(`AI move executed at index ${move}.`, 'info');
          }

          const comment = await getGeminiCommentary(newBoard, move, result?.winner || null, difficulty);
          addLog(comment, 'ai');
        }
        setIsProcessing(false);
      }
    };

    triggerAI();
  }, [xIsNext, mode, winner, difficulty, userSymbol, currentBoard, history, stepNumber, isProcessing, addLog, updateStats]);

  return {
    board: currentBoard,
    xIsNext,
    winner,
    winningLine,
    difficulty,
    mode,
    userSymbol,
    logs,
    isProcessing,
    history,
    stepNumber,
    lastAiMoveIndex,
    settings,
    stats,
    makeMove,
    resetGame,
    changeDifficulty,
    changeMode,
    setUserSymbol,
    jumpTo,
    clearLogs,
    setSettings,
    resetSettings
  };
};
