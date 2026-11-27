import React, { useState } from 'react';
import { useLearning } from '../../context/LearningContext';
import { BookOpen, ExternalLink, ShieldAlert } from 'lucide-react';

interface GlossaryTooltipProps {
  termId: string;
  children?: React.ReactNode;
}

export const GlossaryTooltip: React.FC<GlossaryTooltipProps> = ({ termId, children }) => {
  const { glossaryTerms, setCurrentView } = useLearning();
  const [isOpen, setIsOpen] = useState(false);

  const termData = glossaryTerms.find(g => g.id.toLowerCase() === termId.toLowerCase() || g.term.toLowerCase() === termId.toLowerCase());

  if (!termData) {
    return <span className="font-mono text-cyan-300 underline decoration-cyan-500/40">{children || termId}</span>;
  }

  return (
    <span 
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="font-mono text-cyan-300 hover:text-cyan-200 underline decoration-cyan-500/50 decoration-1 underline-offset-4 font-medium transition-colors cursor-help inline-flex items-center space-x-0.5"
      >
        <span>{children || termData.term}</span>
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-3.5 rounded-xl glass-panel shadow-2xl border border-cyan-500/30 text-left animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
          role="tooltip"
        >
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>

          <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08] mb-2">
            <div className="flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono font-bold text-xs text-white">{termData.term}</span>
            </div>
            {termData.specRef && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/20">
                {termData.specRef}
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
            {termData.shortDef}
          </p>

          {termData.securityRelevance && (
            <div className="p-2 rounded bg-rose-950/30 border border-rose-500/20 text-[10.5px] text-rose-200/90 leading-tight flex items-start space-x-1.5 mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span>{termData.securityRelevance}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
            <span className="text-slate-500">{termData.koreanName}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentView('glossary');
              }}
              className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-0.5 underline font-medium"
            >
              <span>사전에서 보기</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      )}
    </span>
  );
};
