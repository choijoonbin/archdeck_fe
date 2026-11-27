import React, { useState, useEffect, useRef } from 'react';
import { useLearning } from '../../context/LearningContext';
import { Search, Layers, GitCompare, BookOpen, CheckSquare, ArrowRight, CornerDownLeft, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { topics, glossaryTerms, comparisons, checklists, setActiveTopicId, setCurrentView } = useLearning();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'topics' | 'comparisons' | 'glossary' | 'checklists'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Aggregate searchable items
  const topicItems = topics.map(t => ({
    id: t.id,
    type: 'topic' as const,
    title: t.title,
    subtitle: t.koreanTitle,
    category: t.category,
    description: t.summary,
    badges: t.badges,
    action: () => {
      setActiveTopicId(t.id);
      setCurrentView('topics');
      onClose();
    }
  }));

  const comparisonItems = comparisons.map(c => ({
    id: c.id,
    type: 'comparison' as const,
    title: c.title,
    subtitle: c.subtitle,
    category: c.category,
    description: c.subjects.map(s => s.name).join(' vs '),
    badges: ['Comparison', 'Matrix'],
    action: () => {
      setCurrentView('comparisons');
      onClose();
    }
  }));

  const glossaryItems = glossaryTerms.map(g => ({
    id: g.id,
    type: 'glossary' as const,
    title: g.term,
    subtitle: g.koreanName,
    category: g.category,
    description: g.shortDef,
    badges: g.tags,
    action: () => {
      setCurrentView('glossary');
      onClose();
    }
  }));

  const checklistItems = checklists.map(chk => ({
    id: chk.id,
    type: 'checklist' as const,
    title: chk.title,
    subtitle: chk.category,
    category: chk.category,
    description: chk.description,
    badges: [chk.priority],
    action: () => {
      setCurrentView('checklists');
      onClose();
    }
  }));

  // Filter items
  const allItems = [...topicItems, ...comparisonItems, ...glossaryItems, ...checklistItems];

  const filteredItems = allItems.filter(item => {
    if (filterType === 'topics' && item.type !== 'topic') return false;
    if (filterType === 'comparisons' && item.type !== 'comparison') return false;
    if (filterType === 'glossary' && item.type !== 'glossary') return false;
    if (filterType === 'checklists' && item.type !== 'checklist') return false;

    if (!query.trim()) return true;

    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.badges.some(b => b.toLowerCase().includes(q))
    );
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#0C121E] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] z-10">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] bg-[#0F1626]">
          <Search className="w-5 h-5 text-cyan-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="아키텍처 토픽, OIDC/BFF/PKCE, 용어 사전, 체크리스트 검색..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.08]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white/[0.06] rounded border border-white/[0.08]">
            ESC
          </kbd>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1 px-4 py-2 bg-[#090D17] border-b border-white/[0.06] text-xs overflow-x-auto">
          {[
            { id: 'all', label: '전체 결과' },
            { id: 'topics', label: '아키텍처 가이드' },
            { id: 'comparisons', label: '비교 매트릭스' },
            { id: 'glossary', label: '용어 사전' },
            { id: 'checklists', label: '보안 체크리스트' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterType(tab.id as any);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filterType === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-slate-500 font-mono">
            {filteredItems.length} items
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-white/[0.03]">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
              <p>검색 결과가 없습니다.</p>
              <p className="text-xs text-slate-600 mt-1">다른 키워드나 태그로 검색해 보세요.</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-start justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950/50 to-slate-800/40 border border-cyan-500/30 text-white'
                      : 'hover:bg-white/[0.02] text-slate-300'
                  }`}
                >
                  <div className="flex items-start space-x-3 min-w-0 pr-3">
                    <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                      item.type === 'topic' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                      item.type === 'comparison' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      item.type === 'glossary' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {item.type === 'topic' && <Layers className="w-4 h-4" />}
                      {item.type === 'comparison' && <GitCompare className="w-4 h-4" />}
                      {item.type === 'glossary' && <BookOpen className="w-4 h-4" />}
                      {item.type === 'checklist' && <CheckSquare className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm truncate">{item.title}</span>
                        {item.subtitle && (
                          <span className="text-xs text-slate-400 truncate hidden sm:inline">
                            — {item.subtitle}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                      <div className="flex items-center space-x-1.5 mt-1.5 flex-wrap gap-y-1">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                          {item.category}
                        </span>
                        {item.badges.slice(0, 2).map((b, bIdx) => (
                          <span key={bIdx} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/40 text-cyan-300/80 border border-cyan-500/20">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-center">
                    {isSelected && (
                      <span className="flex items-center text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/30">
                        선택 <CornerDownLeft className="w-3 h-3 ml-1" />
                      </span>
                    )}
                    {!isSelected && (
                      <ArrowRight className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[#090D17] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center space-x-3">
            <span><kbd className="text-slate-400">↑↓</kbd> 이동</span>
            <span><kbd className="text-slate-400">Enter</kbd> 열기</span>
            <span><kbd className="text-slate-400">ESC</kbd> 닫기</span>
          </div>
          <span className="text-cyan-400/80">ArchDeck Quick Nav</span>
        </div>
      </div>
    </div>
  );
};
