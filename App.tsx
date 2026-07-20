import React, { useEffect, useMemo, useState } from "react";
import { Difficulty, GameMode, AIPersonality } from "./types";
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_DESCRIPTIONS,
  MODE_DESCRIPTIONS,
  SYMBOL_DESCRIPTIONS,
  ACHIEVEMENTS,
} from "./constants";
import Square from "./components/Square";
import Terminal from "./components/Terminal";
import { useTicTacToe } from "./hooks/useTicTacToe";
import { sounds } from "./services/sounds";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { motion } from "motion/react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 15 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 220,
      damping: 18,
    },
  },
};

const App: React.FC = () => {
  const {
    board,
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
    lastMoveIndex,
    settings,
    stats,
    timeLeft,
    gameId,
    addLog,
    makeMove,
    resetGame,
    changeDifficulty,
    changeMode,
    setUserSymbol,
    jumpTo,
    clearLogs,
    setSettings,
    resetSettings,
  } = useTicTacToe();

  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
  };

  const currentStats =
    mode === GameMode.PVA ? stats.PVA[difficulty] : stats.PVP;

  useEffect(() => {
    const activeThm = settings.activeTheme || "Terminal";
    const themeClass =
      activeThm === "Solarized"
        ? "theme-solarized"
        : activeThm === "High Contrast"
          ? "theme-high-contrast"
          : "theme-terminal";

    document.documentElement.className = themeClass;
  }, [settings.activeTheme]);

  const chartData = useMemo(
    () => [
      { name: "Wins", value: currentStats.wins, fill: "#10b981" },
      { name: "Losses", value: currentStats.losses, fill: "#f43f5e" },
      { name: "Draws", value: currentStats.draws, fill: "#64748b" },
    ],
    [currentStats],
  );

  const downloadLogs = () => {
    if (logs.length === 0) return;
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `py_tic_tac_toe_logs_${Date.now()}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addLog("Gameplay telemetry logs downloaded successfully.", "success");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" &&
        (document.activeElement as HTMLInputElement).type === "text"
      ) {
        return;
      }

      const key = e.key.toUpperCase();

      if (key >= "1" && key <= "9") {
        const index = parseInt(key) - 1;
        if (!board[index] && !winner && !isProcessing) {
          addLog(
            `Captured Shortcut: Placing move at cell index ${index}.`,
            "info",
          );
          makeMove(index);
        }
      } else if (key === "R") {
        addLog("Captured Shortcut: Resetting motherboard state.", "info");
        resetGame();
      } else if (key === "S") {
        setSettings?.((prev) => {
          const nextSounds = !prev.soundsEnabled;
          addLog(
            `Captured Shortcut: Sound Effects toggled to ${nextSounds ? "ON" : "OFF"}.`,
            "info",
          );
          return { ...prev, soundsEnabled: nextSounds };
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [board, winner, isProcessing, makeMove, resetGame, setSettings, addLog]);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <header className="text-center space-y-2">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 tracking-tighter">
          PY_TIC_TAC_TOE.ai
        </h1>
        <p className="text-slate-400 text-sm md:text-base font-mono">
          from brain import logic as game
        </p>
      </header>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Game Board and Controls */}
        <div className="lg:col-span-5 flex flex-col items-center space-y-6">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex gap-4 p-2 bg-slate-900/50 rounded-lg border border-slate-800 justify-center bg-theme-panel border-theme-main">
              <span className="text-xs text-slate-500 flex items-center px-2 uppercase font-bold text-theme-muted">
                Player Identity:
              </span>
              <div className="tooltip">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setUserSymbol("X");
                  }}
                  className={`w-10 h-10 rounded font-bold transition-all border active:scale-90 ${userSymbol === "X" ? "bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-900/40" : "bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500 border-theme-main text-theme-muted"}`}
                >
                  X
                </button>
                <span className="tooltiptext">{SYMBOL_DESCRIPTIONS.X}</span>
              </div>
              <div className="tooltip">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setUserSymbol("O");
                  }}
                  className={`w-10 h-10 rounded font-bold transition-all border active:scale-90 ${userSymbol === "O" ? "bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/40" : "bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500 border-theme-main text-theme-muted"}`}
                >
                  O
                </button>
                <span className="tooltiptext">{SYMBOL_DESCRIPTIONS.O}</span>
              </div>
            </div>

            {!winner && (
              <div className="w-full bg-slate-900/60 rounded-lg p-3 border border-slate-800/85 flex flex-col space-y-1 font-mono bg-theme-panel border-theme-main">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-bold text-theme-dim flex items-center gap-1.5 uppercase">
                    <span>⏰</span>{" "}
                    {isProcessing
                      ? "AI COMPUTE HORIZON"
                      : `${xIsNext ? "X" : "O"}_TURN TIME`}
                  </span>
                  <span
                    className={`text-[11px] font-bold ${timeLeft <= 4 ? "text-red-400 animate-pulse" : "text-cyan-400 text-theme-secondary"}`}
                  >
                    {timeLeft.toString().padStart(2, "0")}s REMAINING
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden bg-theme-main">
                  <div
                    className={`h-full transition-all duration-1000 rounded-full ${
                      timeLeft <= 4
                        ? "bg-gradient-to-r from-red-600 to-rose-500 animate-pulse"
                        : timeLeft <= 8
                          ? "bg-gradient-to-r from-yellow-500 to-amber-400"
                          : "bg-gradient-to-r from-emerald-500 to-cyan-500"
                    }`}
                    style={{ width: `${(timeLeft / 15) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="relative group">
            <motion.div
              key={`grid-${gameId}`}
              variants={containerVariants}
              initial={settings.animationsEnabled ? "hidden" : "visible"}
              animate="visible"
              className={`grid grid-cols-3 gap-1 bg-slate-700 p-1 rounded-lg overflow-hidden shadow-2xl border transition-all duration-500 ${winner === "Draw" && settings.animationsEnabled ? "stalemate-active" : "border-slate-600"}`}
            >
              {board.map((square, i) => (
                <motion.div
                  key={i}
                  variants={settings.animationsEnabled ? itemVariants : {}}
                >
                  <Square
                    value={square}
                    onClick={() => makeMove(i)}
                    isWinningSquare={winningLine?.includes(i) ?? false}
                    isLastAiMove={lastAiMoveIndex === i}
                    isLastMove={lastMoveIndex === i}
                    disabled={isProcessing || !!winner}
                    animationsEnabled={settings.animationsEnabled}
                  />
                </motion.div>
              ))}
            </motion.div>

            {winner === "Draw" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="draw-message px-6 py-3 bg-slate-900/90 border border-slate-700 rounded-full shadow-2xl backdrop-blur-sm">
                  <span className="text-slate-200 font-bold uppercase tracking-widest text-lg">
                    Deadlock Detected
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4 w-full">
            {winner ? (
              <button
                onClick={resetGame}
                className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg border border-cyan-400 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-cyan-900/40"
              >
                <span>▶</span> PLAY AGAIN
              </button>
            ) : (
              <button
                onClick={resetGame}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 active:scale-95 text-slate-200 font-bold rounded-md border border-slate-600 transition-all flex items-center gap-2"
              >
                <span>↻</span> RESTART
              </button>
            )}

            <div className="px-6 py-2 bg-slate-900 border border-slate-700 rounded-md flex items-center gap-3">
              <span className="text-slate-500 text-xs font-bold uppercase">
                Status:
              </span>
              <span
                className={`text-sm font-bold ${winner ? "text-yellow-400" : "text-emerald-400 animate-pulse"}`}
              >
                {winner
                  ? winner === "Draw"
                    ? "STALEMATE"
                    : `${winner} WINS`
                  : isProcessing
                    ? "AI_THINKING..."
                    : `${xIsNext ? "X" : "O"}_TURN`}
              </span>
            </div>
          </div>

          {/* Game Stats Visualization */}
          <div className="w-full bg-slate-900/30 rounded-xl border border-slate-800 p-4 space-y-3 bg-theme-panel border-theme-main">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 border-theme-light">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-theme-dim">
                Global Stats
              </span>
              <span className="text-[10px] text-slate-400 font-mono text-theme-muted">
                {mode} - {mode === "PVA" ? difficulty : "LOCAL"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase text-theme-dim">Wins</p>
                <p className="text-lg font-bold text-emerald-400">
                  {currentStats.wins}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase text-theme-dim">Losses</p>
                <p className="text-lg font-bold text-red-400">
                  {currentStats.losses}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase text-theme-dim">Draws</p>
                <p className="text-lg font-bold text-slate-400">
                  {currentStats.draws}
                </p>
              </div>
            </div>

            {mode === GameMode.PVA && (
              <div className="grid grid-cols-2 gap-2 border-t border-b border-theme-light my-2 py-2 font-mono text-[10px] text-slate-400">
                <div className="flex justify-between items-center px-1">
                  <span>WIN STREAK:</span>
                  <span className="text-amber-400 font-bold text-xs">{(stats.pvaStreak ?? 0)} 🔥</span>
                </div>
                <div className="flex justify-between items-center px-1 border-l border-theme-light">
                  <span>MAX STREAK:</span>
                  <span className="text-cyan-400 font-bold text-xs">{(stats.maxPvaStreak ?? 0)} 🏆</span>
                </div>
              </div>
            )}

            {/* Dynamic Bar Chart visualization */}
            <div className="h-28 w-full font-mono select-none border-t border-slate-800/80 pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(51, 65, 85, 0.2)" }}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "6px",
                      fontSize: "10px",
                      color: "#cbd5e1",
                    }}
                    labelStyle={{ fontWeight: "bold", color: "#94a3b8" }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={24}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* System Achievements */}
          <div className="w-full bg-slate-900/30 rounded-xl border border-slate-800 p-4 space-y-3 bg-theme-panel border-theme-main shadow-lg">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 border-theme-light">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-theme-dim flex items-center gap-1.5">
                <span>🏆</span> Decoded Achievements
              </span>
              <span className="text-[10px] text-cyan-400 font-mono text-theme-secondary font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                {stats.achievements ? stats.achievements.length : 0} / {ACHIEVEMENTS.length}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {ACHIEVEMENTS.map((ach) => {
                const isUnlocked = stats.achievements?.includes(ach.id) ?? false;
                return (
                  <div
                    key={ach.id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-300 font-mono ${
                      isUnlocked
                        ? `${ach.color} border-slate-700/50 shadow-md`
                        : "opacity-35 bg-slate-950/20 border-slate-900 text-slate-600 grayscale"
                    }`}
                  >
                    <div className="text-lg shrink-0 p-1.5 bg-slate-900/80 rounded-md border border-slate-800/60">
                      {ach.icon}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className={`text-[10px] font-bold ${isUnlocked ? "text-slate-200" : "text-slate-500"}`}>
                        {ach.title}
                      </span>
                      <span className="text-[9px] text-slate-400/70 leading-tight">
                        {ach.description}
                      </span>
                    </div>
                    {isUnlocked && (
                      <span className="ml-auto text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold animate-pulse">
                        Unlocked
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center/Right Column: Settings and History */}
        <div className="lg:col-span-3 space-y-6">
          <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4 shadow-xl">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
              Execution Mode
            </label>
            <div className="flex flex-col gap-2">
              <div className="tooltip w-full">
                <button
                  onClick={() => changeMode(GameMode.PVA)}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-bold transition-all text-left active:scale-[0.98] ${mode === GameMode.PVA ? "bg-cyan-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}
                >
                  Human vs AI
                </button>
                <span className="tooltiptext">{MODE_DESCRIPTIONS.PVA}</span>
              </div>
              <div className="tooltip w-full">
                <button
                  onClick={() => changeMode(GameMode.PVP)}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-bold transition-all text-left active:scale-[0.98] ${mode === GameMode.PVP ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}
                >
                  PvP (Local)
                </button>
                <span className="tooltiptext">{MODE_DESCRIPTIONS.PVP}</span>
              </div>
            </div>

            {mode === GameMode.PVA && (
              <>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mt-4">
                  AI Level
                </label>
                <div className="flex flex-col gap-2">
                  {Object.values(Difficulty).map((diff) => (
                    <div key={diff} className="tooltip w-full">
                      <button
                        onClick={() => changeDifficulty(diff)}
                        className={`w-full px-4 py-2 rounded-lg text-xs font-mono text-left border transition-all active:scale-95 hover:scale-[1.02] hover:bg-slate-600 ${difficulty === diff ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-900/30" : "bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-500"}`}
                      >
                        {DIFFICULTY_LABELS[diff]}
                      </button>
                      <span className="tooltiptext">
                        {DIFFICULTY_DESCRIPTIONS[diff]}
                      </span>
                    </div>
                  ))}
                </div>

                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mt-5">
                  AI Personality
                </label>
                <div className="flex flex-col gap-1.5 pt-1">
                  {(
                    [
                      "Sarcastic Coder",
                      "Helpful Mentor",
                      "Aggressive Hacker",
                    ] as AIPersonality[]
                  ).map((pers) => (
                    <button
                      key={pers}
                      onClick={() => {
                        setSettings({ ...settings, aiPersonality: pers });
                        addLog(
                          `AI personality profile reassigned to: ${pers}`,
                          "info",
                        );
                      }}
                      className={`w-full px-4 py-2 rounded-lg text-xs font-mono text-left border transition-all active:scale-95 hover:scale-[1.02] ${
                        settings.aiPersonality === pers
                          ? "bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/30 font-bold"
                          : "bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600"
                      }`}
                      title={`Switch commentary persona to ${pers}`}
                    >
                      {pers === "Sarcastic Coder" && "🐍 "}
                      {pers === "Helpful Mentor" && "🎓 "}
                      {pers === "Aggressive Hacker" && "💻 "}
                      {pers}
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="bg-slate-900/30 p-6 rounded-xl border border-slate-800 space-y-4 shadow-inner">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
              History (Time Travel)
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1 pr-2 font-mono text-xs scrollbar-hide">
              {history.map((_, move) => (
                <button
                  key={move}
                  onClick={() => jumpTo(move)}
                  className={`w-full text-left px-3 py-1.5 rounded transition-all active:scale-[0.98] flex justify-between items-center ${stepNumber === move ? "bg-slate-700 text-white border-l-2 border-cyan-400 shadow" : "text-slate-500 hover:bg-slate-800"}`}
                >
                  <span>{move === 0 ? "Init State" : `Move #${move}`}</span>
                  {stepNumber === move && (
                    <span className="text-[10px] text-cyan-400 uppercase font-bold">
                      Current
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-slate-800/20 p-6 rounded-xl border border-slate-800 space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
              Environment Settings
            </label>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] mb-1 font-mono text-slate-400 uppercase">
                  <span>Volume</span>
                  <span>{Math.round(settings.volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={settings.volume}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      volume: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-cyan-500 bg-slate-700 rounded-lg appearance-none h-1.5 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Animations
                </span>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      animationsEnabled: !settings.animationsEnabled,
                    })
                  }
                  className={`w-10 h-5 rounded-full transition-all relative ${settings.animationsEnabled ? "bg-cyan-600" : "bg-slate-700"}`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${settings.animationsEnabled ? "left-6" : "left-1"}`}
                  ></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Sound Effects
                </span>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      soundsEnabled: !settings.soundsEnabled,
                    })
                  }
                  className={`w-10 h-5 rounded-full transition-all relative ${settings.soundsEnabled ? "bg-emerald-600" : "bg-slate-700"}`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${settings.soundsEnabled ? "left-6" : "left-1"}`}
                  ></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Adaptive AI
                  </span>
                  <span className="text-[8px] font-mono text-slate-600 uppercase">
                    Upgrades AI every 3 human wins
                  </span>
                </div>
                <button
                  onClick={() => {
                    const nextVal = !settings.adaptiveAIEnabled;
                    setSettings({
                      ...settings,
                      adaptiveAIEnabled: nextVal,
                    });
                    sounds.playClick();
                    addLog(`Adaptive AI Difficulty toggled to ${nextVal ? "ON" : "OFF"}.`, "info");
                  }}
                  className={`w-10 h-5 rounded-full transition-all relative ${settings.adaptiveAIEnabled ? "bg-amber-600 animate-pulse" : "bg-slate-700"}`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${settings.adaptiveAIEnabled ? "left-6" : "left-1"}`}
                  ></div>
                </button>
              </div>

              <div className="border-t border-slate-800/80 pt-3 border-theme-light">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-2">
                  Color Theme Scheme
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["Terminal", "Solarized", "High Contrast"] as const).map(
                    (thm) => (
                      <button
                        key={thm}
                        onClick={() => {
                          setSettings({ ...settings, activeTheme: thm });
                          sounds.playClick();
                          addLog(`Active theme reassigned to: ${thm}`, "info");
                        }}
                        className={`px-1 py-1.5 text-[9px] font-mono rounded text-center border transition-all active:scale-95 ${
                          (settings.activeTheme || "Terminal") === thm
                            ? "bg-amber-600 border-amber-400 text-white shadow font-bold"
                            : "bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600 border-theme-main text-theme-muted"
                        }`}
                      >
                        {thm}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={resetGame}
                  className="py-1.5 text-[10px] border border-emerald-700 text-emerald-500 hover:text-emerald-300 hover:border-emerald-500 transition-colors rounded uppercase font-bold"
                >
                  New Game
                </button>
                <button
                  onClick={resetSettings}
                  className="py-1.5 text-[10px] border border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-colors rounded uppercase font-bold"
                >
                  Reset Defaults
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Console */}
        <div className="lg:col-span-4 flex flex-col h-full space-y-4">
          <Terminal logs={logs} onClear={clearLogs} onDownload={downloadLogs} />
          <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-500 shadow-md">
            <p className="mb-1 uppercase tracking-widest text-slate-600 font-bold">
              Runtime Context
            </p>
            <div className="grid grid-cols-2 gap-y-1">
              <p>PLAYER_SYM:</p>
              <p className="text-emerald-400">{userSymbol}</p>
              <p>AI_SYM:</p>
              <p className="text-purple-400">
                {userSymbol === "X" ? "O" : "X"}
              </p>
              <p>TURN_OWNER:</p>
              <p className={xIsNext ? "text-emerald-400" : "text-purple-400"}>
                {xIsNext ? "X" : "O"}
              </p>
              <p>STACK_SIZE:</p>
              <p>{history.length}</p>
              <p>ANIM_ENGINE:</p>
              <p
                className={
                  settings.animationsEnabled
                    ? "text-cyan-400"
                    : "text-slate-600"
                }
              >
                {settings.animationsEnabled ? "Active" : "Disabled"}
              </p>
              <p>SESSION_TIME:</p>
              <p className="text-amber-400 font-bold">{formatSessionTime(sessionTime)}</p>
            </div>
            <div className="border-t border-slate-800/85 mt-3 pt-2 font-mono text-[10px]">
              <p className="uppercase tracking-widest text-slate-600 font-bold mb-1">
                Keyboard Shortcuts
              </p>
              <div className="grid grid-cols-2 gap-y-1 text-slate-400 uppercase text-[9px]">
                <p>[1-9]:</p>
                <p>Place move</p>
                <p>[R]:</p>
                <p>Reboot board</p>
                <p>[S]:</p>
                <p>Audio Toggle</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-slate-600 text-xs font-mono text-center pt-8 border-t border-slate-800 w-full max-w-4xl">
        built_with = ["ReactHooks", "WebAudioAPI", "GeminiAPI", "LocalStorage"]
        <br />
        print("Goodbye World")
      </footer>
    </div>
  );
};

export default App;
