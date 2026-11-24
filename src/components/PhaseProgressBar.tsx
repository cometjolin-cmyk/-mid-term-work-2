import React from 'react';
import { ProjectPhase } from '../types';
import { Check, Lock } from 'lucide-react';

interface PhaseProgressBarProps {
  currentPhase: ProjectPhase;
  phaseNames: [string, string, string];
  onSelectPhase?: (phase: ProjectPhase) => void;
  interactive?: boolean;
}

export const PhaseProgressBar: React.FC<PhaseProgressBarProps> = ({
  currentPhase,
  phaseNames,
  onSelectPhase,
  interactive = false,
}) => {
  const phases: { number: ProjectPhase; label: string }[] = [
    { number: 1, label: phaseNames[0] || '1. 提案對焦' },
    { number: 2, label: phaseNames[1] || '2. 實作推進' },
    { number: 3, label: phaseNames[2] || '3. 交付結案' },
  ];

  return (
    <div className="w-full bg-slate-100/90 rounded-2xl p-3 border border-slate-200/70">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-1">
        <span className="font-medium text-slate-700">專案位階推進</span>
        <span>當前：第 {currentPhase} 階段</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {phases.map((p) => {
          const isCompleted = p.number < currentPhase;
          const isCurrent = p.number === currentPhase;
          const isLocked = p.number > currentPhase;

          return (
            <button
              key={p.number}
              type="button"
              disabled={!interactive && isLocked}
              onClick={() => interactive && onSelectPhase && onSelectPhase(p.number)}
              className={`relative flex flex-col items-start p-2.5 rounded-xl text-left transition-all min-h-[56px] ${
                isCurrent
                  ? 'bg-white shadow-sm ring-1 ring-slate-900/10 text-slate-900'
                  : isCompleted
                  ? 'bg-slate-200/60 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-100/40 text-slate-400 cursor-not-allowed'
              } ${interactive ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span
                  className={`text-[11px] font-mono font-medium ${
                    isCurrent ? 'text-indigo-600' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  PHASE 0{p.number}
                </span>

                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : isCurrent ? (
                  <div className="w-2 h-2 rounded-full bg-indigo-600" />
                ) : (
                  <Lock className="w-3 h-3 text-slate-400" />
                )}
              </div>

              <span
                className={`text-xs font-semibold truncate w-full ${
                  isCurrent ? 'text-slate-900' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {p.label.replace(/^\d+\.\s*/, '')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
