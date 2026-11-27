import React, { useState } from 'react';
import { LearningProvider, useLearning } from './context/LearningContext';
import { Header } from './components/common/Header';
import { CommandPalette } from './components/common/CommandPalette';
import { BentoHome } from './components/BentoHome';
import { ArchitectureFlowViewer } from './components/ArchitectureFlowViewer';
import { ComparisonView } from './components/ComparisonView';
import { GlossaryView } from './components/GlossaryView';
import { ChecklistView } from './components/ChecklistView';
import { LearningNotebookView } from './components/LearningNotebookView';
import { CreateKnowledgeModal } from './components/CreateKnowledgeModal';
import { Layers } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentView } = useLearning();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-deck-bg text-slate-100">
      {/* Top Navigation */}
      <Header 
        onOpenSearch={() => setIsSearchOpen(true)} 
        onOpenCreateModal={() => setIsCreateModalOpen(true)} 
      />

      {/* Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && <BentoHome onOpenSearch={() => setIsSearchOpen(true)} />}
        {currentView === 'topics' && <ArchitectureFlowViewer />}
        {currentView === 'comparisons' && <ComparisonView />}
        {currentView === 'glossary' && <GlossaryView />}
        {currentView === 'checklists' && <ChecklistView />}
        {currentView === 'learning' && <LearningNotebookView />}
      </main>

      {/* Modern Footer */}
      <footer className="w-full hairline-t glass-panel mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Layers className="w-3 h-3 text-cyan-400" />
            </div>
            <span className="font-semibold text-slate-300">ArchDeck (아크덱)</span>
            <span>— 엔터프라이즈 아키텍처 & OIDC/BFF/보안 인사이트 허브</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="font-mono text-[11px] text-slate-400">
              React + TypeScript + Tailwind CSS
            </span>
            <span className="text-slate-700">|</span>
            <span className="font-mono text-[11px] text-cyan-400/80">
              RFC 7636 • OAuth 2.1 • Zero Trust
            </span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <CommandPalette 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      <CreateKnowledgeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <LearningProvider>
      <MainContent />
    </LearningProvider>
  );
}

export default App;
