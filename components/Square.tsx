
import React from 'react';
import { Player } from '../types';

interface SquareProps {
  value: Player;
  onClick: () => void;
  isWinningSquare: boolean;
  isLastAiMove: boolean;
  isLastMove: boolean;
  disabled: boolean;
  animationsEnabled: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, isWinningSquare, isLastAiMove, isLastMove, disabled, animationsEnabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || value !== null}
      className={`
        w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 
        border border-slate-700 
        flex items-center justify-center 
        text-4xl sm:text-5xl md:text-6xl font-bold 
        transition-all duration-300 transform
        ${value === null ? 'hover:bg-slate-800 active:bg-slate-700 active:scale-95' : 'cursor-default'}
        ${isWinningSquare && animationsEnabled ? 'winning-square bg-indigo-900/40 text-cyan-400 border-cyan-400 border-2 scale-105 z-10' : ''}
        ${isWinningSquare && !animationsEnabled ? 'bg-indigo-900/40 text-cyan-400 border-cyan-400 border-2 scale-105 z-10' : ''}
        ${isLastMove && animationsEnabled ? 'last-move-highlight border-sky-400 z-10' : ''}
        ${isLastMove && !animationsEnabled ? 'border-sky-400 bg-sky-950/20 z-10' : ''}
        ${isLastAiMove && animationsEnabled ? 'ai-pulse' : ''}
        ${value === 'X' ? 'text-emerald-400' : 'text-purple-400'}
        ${disabled && !value ? 'opacity-50' : ''}
      `}
    >
      <span className={`transition-all duration-300 ${value ? 'scale-110 opacity-100' : 'scale-0 opacity-0'} ${isWinningSquare && animationsEnabled ? 'winning-symbol' : ''}`}>
        {value}
      </span>
    </button>
  );
};

export default Square;
