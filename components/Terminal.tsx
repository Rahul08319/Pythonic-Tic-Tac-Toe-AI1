
import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface TerminalProps {
  logs: LogEntry[];
  onClear: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ logs, onClear }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full bg-slate-950 rounded-lg border border-slate-700 overflow-hidden flex flex-col h-64 shadow-2xl">
      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-xs text-slate-400 font-medium ml-2 uppercase tracking-widest">Python Console</span>
        </div>
        <button 
          onClick={onClear}
          className="text-[10px] text-slate-500 hover:text-slate-300 font-bold uppercase transition-colors"
        >
          Clear
        </button>
      </div>
      <div 
        ref={scrollRef}
        className="p-4 overflow-y-auto font-mono text-sm space-y-2 flex-1 scrollbar-hide"
      >
        <div className="text-emerald-400 mb-2">{">>>"} python3 tic_tac_toe.py --mode=AI_GOD</div>
        {logs.map((log, idx) => (
          <div key={idx} className="flex gap-2">
            <span className="text-slate-500 whitespace-nowrap">[{log.timestamp}]</span>
            <span className={`
              ${log.type === 'error' ? 'text-red-400' : ''}
              ${log.type === 'success' ? 'text-emerald-400' : ''}
              ${log.type === 'ai' ? 'text-cyan-400' : ''}
              ${log.type === 'info' ? 'text-slate-300' : ''}
            `}>
              {log.type === 'ai' ? '🤖 ' : ''}
              {log.message}
            </span>
          </div>
        ))}
        {logs.length === 0 && <div className="text-slate-600 italic">Waiting for process start...</div>}
      </div>
    </div>
  );
};

export default Terminal;
