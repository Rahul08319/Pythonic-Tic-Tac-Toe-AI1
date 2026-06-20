
import React from 'react';
import { Difficulty, GameMode } from './types';
import { DIFFICULTY_LABELS, DIFFICULTY_DESCRIPTIONS, MODE_DESCRIPTIONS, SYMBOL_DESCRIPTIONS } from './constants';
import Square from './components/Square';
import Terminal from './components/Terminal';
import { useTicTacToe } from './hooks/useTicTacToe';

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
  } = useTicTacToe();

  const currentStats = mode === GameMode.PVA ? stats.PVA[difficulty] : stats.PVP;

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
            <div className="flex gap-4 p-2 bg-slate-900/50 rounded-lg border border-slate-800 justify-center">
              <span className="text-xs text-slate-500 flex items-center px-2 uppercase font-bold">Player Identity:</span>
              <div className="tooltip">
                <button 
                  onClick={() => setUserSymbol('X')}
                  className={`w-10 h-10 rounded font-bold transition-all border active:scale-90 ${userSymbol === 'X' ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-900/40' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                >X</button>
                <span className="tooltiptext">{SYMBOL_DESCRIPTIONS.X}</span>
              </div>
              <div className="tooltip">
                <button 
                  onClick={() => setUserSymbol('O')}
                  className={`w-10 h-10 rounded font-bold transition-all border active:scale-90 ${userSymbol === 'O' ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/40' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                >O</button>
                <span className="tooltiptext">{SYMBOL_DESCRIPTIONS.O}</span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className={`grid grid-cols-3 gap-1 bg-slate-700 p-1 rounded-lg overflow-hidden shadow-2xl border transition-all duration-500 ${winner === 'Draw' && settings.animationsEnabled ? 'stalemate-active' : 'border-slate-600'}`}>
              {board.map((square, i) => (
                <Square
                  key={i}
                  value={square}
                  onClick={() => makeMove(i)}
                  isWinningSquare={winningLine?.includes(i) ?? false}
                  isLastAiMove={lastAiMoveIndex === i}
                  disabled={isProcessing || !!winner}
                  animationsEnabled={settings.animationsEnabled}
                />
              ))}
            </div>

            {winner === 'Draw' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="draw-message px-6 py-3 bg-slate-900/90 border border-slate-700 rounded-full shadow-2xl backdrop-blur-sm">
                  <span className="text-slate-200 font-bold uppercase tracking-widest text-lg">Deadlock Detected</span>
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
              <span className="text-slate-500 text-xs font-bold uppercase">Status:</span>
              <span className={`text-sm font-bold ${winner ? 'text-yellow-400' : 'text-emerald-400 animate-pulse'}`}>
                {winner ? (winner === 'Draw' ? 'STALEMATE' : `${winner} WINS`) : (isProcessing ? 'AI_THINKING...' : `${xIsNext ? 'X' : 'O'}_TURN`)}
              </span>
            </div>
          </div>

          {/* Game Stats Visualization */}
          <div className="w-full bg-slate-900/30 rounded-xl border border-slate-800 p-4 space-y-3">
             <div className="flex justify-between items-center border-b border-slate-800 pb-2">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Stats</span>
               <span className="text-[10px] text-slate-400 font-mono">{mode} - {mode === 'PVA' ? difficulty : 'LOCAL'}</span>
             </div>
             <div className="grid grid-cols-3 gap-4 text-center">
               <div className="space-y-1">
                 <p className="text-[10px] text-slate-500 uppercase">Wins</p>
                 <p className="text-lg font-bold text-emerald-400">{currentStats.wins}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] text-slate-500 uppercase">Losses</p>
                 <p className="text-lg font-bold text-red-400">{currentStats.losses}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] text-slate-500 uppercase">Draws</p>
                 <p className="text-lg font-bold text-slate-400">{currentStats.draws}</p>
               </div>
             </div>
          </div>
        </div>

        {/* Center/Right Column: Settings and History */}
        <div className="lg:col-span-3 space-y-6">
           <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4 shadow-xl">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Execution Mode</label>
              <div className="flex flex-col gap-2">
                <div className="tooltip w-full">
                  <button
                    onClick={() => changeMode(GameMode.PVA)}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-bold transition-all text-left active:scale-[0.98] ${mode === GameMode.PVA ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                  >
                    Human vs AI
                  </button>
                  <span className="tooltiptext">{MODE_DESCRIPTIONS.PVA}</span>
                </div>
                <div className="tooltip w-full">
                  <button
                    onClick={() => changeMode(GameMode.PVP)}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-bold transition-all text-left active:scale-[0.98] ${mode === GameMode.PVP ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                  >
                    PvP (Local)
                  </button>
                  <span className="tooltiptext">{MODE_DESCRIPTIONS.PVP}</span>
                </div>
              </div>

              {mode === GameMode.PVA && (
                <>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mt-4">AI Level</label>
                  <div className="flex flex-col gap-2">
                    {Object.values(Difficulty).map((diff) => (
                      <div key={diff} className="tooltip w-full">
                        <button
                          onClick={() => changeDifficulty(diff)}
                          className={`w-full px-4 py-2 rounded-lg text-xs font-mono text-left border transition-all active:scale-95 hover:scale-[1.02] hover:bg-slate-600 ${difficulty === diff ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-900/30' : 'bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-500'}`}
                        >
                          {DIFFICULTY_LABELS[diff]}
                        </button>
                        <span className="tooltiptext">{DIFFICULTY_DESCRIPTIONS[diff]}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
           </section>

           <section className="bg-slate-900/30 p-6 rounded-xl border border-slate-800 space-y-4 shadow-inner">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">History (Time Travel)</label>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-2 font-mono text-xs scrollbar-hide">
                {history.map((_, move) => (
                  <button
                    key={move}
                    onClick={() => jumpTo(move)}
                    className={`w-full text-left px-3 py-1.5 rounded transition-all active:scale-[0.98] flex justify-between items-center ${stepNumber === move ? 'bg-slate-700 text-white border-l-2 border-cyan-400 shadow' : 'text-slate-500 hover:bg-slate-800'}`}
                  >
                    <span>{move === 0 ? 'Init State' : `Move #${move}`}</span>
                    {stepNumber === move && <span className="text-[10px] text-cyan-400 uppercase font-bold">Current</span>}
                  </button>
                ))}
              </div>
           </section>

           <section className="bg-slate-800/20 p-6 rounded-xl border border-slate-800 space-y-4">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Environment Settings</label>
             <div className="space-y-4">
               <div>
                 <div className="flex justify-between text-[10px] mb-1 font-mono text-slate-400 uppercase">
                   <span>Volume</span>
                   <span>{Math.round(settings.volume * 100)}%</span>
                 </div>
                 <input 
                   type="range" min="0" max="1" step="0.01" 
                   value={settings.volume} 
                   onChange={(e) => setSettings({...settings, volume: parseFloat(e.target.value)})}
                   className="w-full accent-cyan-500 bg-slate-700 rounded-lg appearance-none h-1.5 cursor-pointer"
                 />
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-mono text-slate-400 uppercase">Animations</span>
                 <button 
                   onClick={() => setSettings({...settings, animationsEnabled: !settings.animationsEnabled})}
                   className={`w-10 h-5 rounded-full transition-all relative ${settings.animationsEnabled ? 'bg-cyan-600' : 'bg-slate-700'}`}
                 >
                   <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${settings.animationsEnabled ? 'left-6' : 'left-1'}`}></div>
                 </button>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-mono text-slate-400 uppercase">Sound Effects</span>
                 <button 
                   onClick={() => setSettings({...settings, soundsEnabled: !settings.soundsEnabled})}
                   className={`w-10 h-5 rounded-full transition-all relative ${settings.soundsEnabled ? 'bg-emerald-600' : 'bg-slate-700'}`}
                 >
                   <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${settings.soundsEnabled ? 'left-6' : 'left-1'}`}></div>
                 </button>
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
           <Terminal logs={logs} onClear={clearLogs} />
           <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-500 shadow-md">
             <p className="mb-1 uppercase tracking-widest text-slate-600 font-bold">Runtime Context</p>
             <div className="grid grid-cols-2 gap-y-1">
               <p>PLAYER_SYM:</p><p className="text-emerald-400">{userSymbol}</p>
               <p>AI_SYM:</p><p className="text-purple-400">{userSymbol === 'X' ? 'O' : 'X'}</p>
               <p>TURN_OWNER:</p><p className={xIsNext ? 'text-emerald-400' : 'text-purple-400'}>{xIsNext ? 'X' : 'O'}</p>
               <p>STACK_SIZE:</p><p>{history.length}</p>
               <p>ANIM_ENGINE:</p><p className={settings.animationsEnabled ? 'text-cyan-400' : 'text-slate-600'}>{settings.animationsEnabled ? 'Active' : 'Disabled'}</p>
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
