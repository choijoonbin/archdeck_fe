import React, { useState, useEffect } from 'react';
import { useLearning } from '../../context/LearningContext';
import { 
  Layers, 
  GitCompare, 
  BookOpen, 
  CheckSquare, 
  Bookmark, 
  Search, 
  PlusCircle, 
  Menu, 
  X,
  Server,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenCreateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onOpenCreateModal }) => {
  const { currentView, setCurrentView, bookmarks, completedTopics, topics, isBackendConnected } = useLearning();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Keyboard Shortcut for Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  const navItems = [
    { id: 'home', label: '홈', icon: Sparkles },
    { id: 'topics', label: '아키텍처 가이드', icon: Layers },
    { id: 'comparisons', label: '비교 매트릭스', icon: GitCompare },
    { id: 'glossary', label: '용어 사전', icon: BookOpen },
    { id: 'checklists', label: '보안 체크리스트', icon: CheckSquare },
    { id: 'learning', label: '내 서재 & 메모', icon: Bookmark },
  ];

  const completionPercent = topics.length > 0 ? Math.round((completedTopics.length / topics.length) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel hairline-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center space-x-3 group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1px] shadow-glow-cyan group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#080B12] rounded-[11px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="text-left">
              <span className="font-bold text-base tracking-tight text-white flex items-center space-x-1.5">
                <span>ArchDeck</span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  v2.0
                </span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight -mt-0.5 hidden sm:block">
                테크 아키텍처 & 보안 인사이트 허브
              </p>
            </div>
          </button>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as any)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white/[0.08] text-white shadow-inner-glow border border-white/[0.08]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Search, Stats, Actions */}
        <div className="flex items-center space-x-3">
          {/* Quick Search Bar Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] hairline-border text-xs text-slate-400 hover:text-slate-200 transition-all group cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="hidden lg:inline text-slate-400">통합 검색...</span>
            <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/[0.06] rounded border border-white/[0.08]">
              ⌘K
            </kbd>
          </button>

          {/* Progress / Bookmark Indicator (Desktop) */}
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-white/[0.03] hairline-border text-xs">
            <div className="flex items-center space-x-1 text-slate-400" title="북마크한 토픽">
              <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              <span className="font-mono text-[11px] font-semibold text-slate-300">{bookmarks.length}</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-1.5" title="학습 진도율">
              <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500" 
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <span className="font-mono text-[11px] text-emerald-400 font-semibold">{completionPercent}%</span>
            </div>
          </div>

          {/* Backend Health Badge */}
          <div 
            className="hidden xl:flex items-center space-x-1.5 px-2 py-1 rounded-md text-[11px] font-mono border"
            style={{
              borderColor: isBackendConnected ? 'rgba(52, 211, 153, 0.2)' : 'rgba(148, 163, 184, 0.15)',
              backgroundColor: isBackendConnected ? 'rgba(52, 211, 153, 0.05)' : 'rgba(255, 255, 255, 0.02)'
            }}
            title={isBackendConnected ? 'Express 백엔드 API 연결됨' : '프론트엔드 내장 모드 (오프라인 지원)'}
          >
            <Server className={`w-3 h-3 ${isBackendConnected ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className={isBackendConnected ? 'text-emerald-300' : 'text-slate-400'}>
              {isBackendConnected ? 'API Live' : 'Offline Mode'}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          </div>

          {/* Add Knowledge Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-cyan transition-all active:scale-95"
            title="새 아키텍처 또는 용어 등록"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">새 지식 추가</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-1 bg-[#0B0F19] border-b border-white/[0.08] animate-in slide-in-from-top-2 duration-150">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
