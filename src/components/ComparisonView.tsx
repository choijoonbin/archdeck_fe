import React, { useState } from 'react';
import { useLearning } from '../context/LearningContext';
import { 
  GitCompare, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Compass, 
  Layers
} from 'lucide-react';

export const ComparisonView: React.FC = () => {
  const { comparisons } = useLearning();
  const [activeComparisonId, setActiveComparisonId] = useState<string>(comparisons[0]?.id || 'spa-vs-bff');

  const currentComparison = comparisons.find(c => c.id === activeComparisonId) || comparisons[0];

  const getStatusBadge = (status: 'positive' | 'warning' | 'negative' | 'neutral') => {
    switch (status) {
      case 'positive':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Positive</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Caution</span>
          </span>
        );
      case 'negative':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3 text-rose-400" />
            <span>High Risk</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/[0.08]">
            <span>Neutral</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Switcher */}
      <div className="p-6 rounded-2xl glass-card hairline-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <GitCompare className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-semibold text-purple-300">
                Architecture Decision Matrix
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {currentComparison.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {currentComparison.subtitle}
            </p>
          </div>

          {/* Switcher Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto shrink-0">
            {comparisons.map(comp => (
              <button
                key={comp.id}
                onClick={() => setActiveComparisonId(comp.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  comp.id === currentComparison.id
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-glow-purple'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white hairline-border'
                }`}
              >
                {comp.title.split(' vs ')[0] || comp.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Subjects Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentComparison.subjects.map(subject => (
          <div 
            key={subject.id}
            className="p-5 rounded-xl glass-card hairline-border flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-cyan-300 border border-white/[0.08]">
                  {subject.tag}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                {subject.name}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {subject.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300 block mb-0.5">권장 환경:</span>
              <span className="leading-tight text-slate-400">{subject.recommendedFor}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Side-by-Side Matrix Table */}
      <div className="rounded-2xl glass-card hairline-border overflow-hidden">
        <div className="px-6 py-4 bg-[#0F1626] border-b border-white/[0.08] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>비교 항목별 정밀 매트릭스</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {currentComparison.dimensions.length}개 평가 차원
          </span>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {currentComparison.dimensions.map(dim => (
            <div key={dim.key} className="p-6 hover:bg-white/[0.01] transition-colors">
              <div className="mb-4">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>{dim.name}</span>
                </h4>
                {dim.description && (
                  <p className="text-xs text-slate-400 mt-0.5">{dim.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentComparison.subjects.map(subj => {
                  const val = dim.values[subj.id];
                  if (!val) return null;
                  return (
                    <div 
                      key={subj.id}
                      className="p-3.5 rounded-xl bg-[#090D18] hairline-border space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-semibold text-slate-400">
                            {subj.name}
                          </span>
                          {getStatusBadge(val.status)}
                        </div>
                        <div className="text-xs font-bold text-slate-100 leading-snug">
                          {val.text}
                        </div>
                      </div>

                      {val.detail && (
                        <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-white/[0.04]">
                          {val.detail}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Guide Cards (의사결정 나침반) */}
      <div className="p-6 rounded-2xl glass-card hairline-border space-y-4">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Compass className="w-4 h-4" />
          </span>
          <h3 className="text-base font-bold text-white">
            실무 아키텍처 의사결정 나침반 (Decision Guide)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentComparison.decisionGuide.map((rule, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-xl bg-[#090D18] hairline-border space-y-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="text-xs text-slate-400 leading-relaxed font-medium">
                  <span className="text-cyan-400 font-bold mr-1">Q.</span>
                  {rule.condition}
                </div>
                <div className="mt-2 text-sm font-bold text-emerald-300">
                  → {rule.recommendation}
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.06] text-[11px] text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-300">선택 이유: </span>
                {rule.reason}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
