import React, { useState, useEffect } from 'react';
import { useLearning } from '../context/LearningContext';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Code, 
  CheckSquare, 
  Edit3, 
  ThumbsUp, 
  ThumbsDown, 
  Laptop,
  Server,
  Database,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { CodeBlock } from './common/CodeBlock';
import { GlossaryTooltip } from './common/GlossaryTooltip';

export const ArchitectureFlowViewer: React.FC = () => {
  const { 
    topics, 
    activeTopicId, 
    setActiveTopicId, 
    bookmarks, 
    completedTopics, 
    notes, 
    toggleBookmark, 
    toggleCompleted, 
    updateNote, 
    checklists, 
    checklistProgress, 
    toggleChecklist 
  } = useLearning();

  const currentTopic = topics.find(t => t.id === activeTopicId) || topics[0];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'takeaways' | 'tradeoffs' | 'code' | 'checklists' | 'note'>('overview');
  const [localNoteText, setLocalNoteText] = useState('');
  const [isNoteSaved, setIsNoteSaved] = useState(false);

  // Sync note when active topic changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setLocalNoteText(notes[currentTopic.id] || '');
  }, [currentTopic.id, notes]);

  // Auto-play interval
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev < currentTopic.flowSteps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return 0;
          }
        });
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTopic.flowSteps.length]);

  const activeStep = currentTopic.flowSteps[currentStepIndex] || currentTopic.flowSteps[0];
  const isBookmarked = bookmarks.includes(currentTopic.id);
  const isCompleted = completedTopics.includes(currentTopic.id);

  const handleSaveNote = () => {
    updateNote(currentTopic.id, localNoteText);
    setIsNoteSaved(true);
    setTimeout(() => setIsNoteSaved(false), 2000);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'User': return Laptop;
      case 'Layout': return Layers;
      case 'ShieldCheck': return ShieldCheck;
      case 'Network': return Server;
      case 'Server': return Server;
      case 'Database': return Database;
      case 'Cpu': return Cpu;
      default: return Server;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Topic Switcher Strip */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
        {topics.map(topic => {
          const isActive = topic.id === currentTopic.id;
          const isDone = completedTopics.includes(topic.id);
          return (
            <button
              key={topic.id}
              onClick={() => setActiveTopicId(topic.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                  : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] hairline-border'
              }`}
            >
              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{topic.koreanTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Main Topic Header Card */}
      <div className="p-6 rounded-2xl glass-card hairline-border relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/20">
                {currentTopic.category}
              </span>
              <div className="flex items-center text-xs text-slate-400 font-mono space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{currentTopic.readingTimeMinutes}분 소요</span>
              </div>
              {currentTopic.badges.map((b, i) => (
                <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                  {b}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {currentTopic.title}
            </h1>
            <p className="text-sm font-medium text-slate-400">
              {currentTopic.koreanTitle}
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
              {currentTopic.summary}
            </p>
          </div>

          {/* Action Buttons: Bookmark & Complete */}
          <div className="flex items-center space-x-2 shrink-0 self-start">
            <button
              onClick={() => toggleBookmark(currentTopic.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium hairline-border transition-all ${
                isBookmarked
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{isBookmarked ? '북마크됨' : '북마크'}</span>
            </button>

            <button
              onClick={() => toggleCompleted(currentTopic.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold hairline-border transition-all ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-400' : ''}`} />
              <span>{isCompleted ? '이해 완료' : '완료 체크'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Architecture Flow Section */}
      <div className="rounded-2xl glass-card hairline-border overflow-hidden">
        {/* Step Navigation Bar */}
        <div className="px-6 py-3.5 bg-[#0F1626] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-cyan-400 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>STEP {activeStep.step} of {currentTopic.flowSteps.length}</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-md">
              {activeStep.title}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Step Pills */}
            <div className="hidden sm:flex items-center space-x-1">
              {currentTopic.flowSteps.map((step, idx) => (
                <button
                  key={step.step}
                  onClick={() => {
                    setCurrentStepIndex(idx);
                    setIsPlaying(false);
                  }}
                  className={`w-6 h-6 rounded-lg text-[11px] font-mono font-bold transition-all ${
                    idx === currentStepIndex
                      ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan scale-105'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {step.step}
                </button>
              ))}
            </div>

            {/* Prev / Play / Next Controls */}
            <div className="flex items-center space-x-1 bg-white/[0.04] p-0.5 rounded-lg hairline-border">
              <button
                onClick={() => {
                  setCurrentStepIndex(prev => Math.max(0, prev - 1));
                  setIsPlaying(false);
                }}
                disabled={currentStepIndex === 0}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                title="이전 단계"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(prev => !prev)}
                className="px-2 py-1 rounded text-xs font-mono flex items-center space-x-1 text-cyan-300 hover:bg-white/[0.08]"
                title={isPlaying ? '일시정지' : '자동 재생'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span className="text-[10px] hidden sm:inline">{isPlaying ? '정지' : '재생'}</span>
              </button>

              <button
                onClick={() => {
                  setCurrentStepIndex(prev => Math.min(currentTopic.flowSteps.length - 1, prev + 1));
                  setIsPlaying(false);
                }}
                disabled={currentStepIndex === currentTopic.flowSteps.length - 1}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                title="다음 단계"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Visual Architecture Diagram (Dynamic SVG & Nodes) */}
        <div className="p-6 sm:p-8 bg-grid-pattern relative min-h-[260px] flex flex-col justify-center">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 relative z-10">
            {currentTopic.diagramNodes.map(node => {
              const isActive = activeStep.activeNodes.includes(node.id);
              const IconComp = getIconComponent(node.icon);
              return (
                <div
                  key={node.id}
                  className={`p-3.5 rounded-xl transition-all duration-300 relative flex flex-col items-center text-center ${
                    isActive
                      ? 'bg-gradient-to-b from-[#182B48] to-[#0F1E33] border-2 border-cyan-400 shadow-glow-cyan scale-105'
                      : 'bg-[#0B101C]/80 hairline-border opacity-60 hover:opacity-80'
                  }`}
                >
                  {isActive && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                    </span>
                  )}

                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                    isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/[0.04] text-slate-400'
                  }`}>
                    <IconComp className="w-5 h-5" />
                  </div>

                  <span className="font-bold text-xs text-white leading-tight">
                    {node.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {node.subLabel}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Active Flow Line Indicator */}
          <div className="mt-6 p-4 rounded-xl bg-[#090D18] hairline-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="font-bold text-cyan-300">{activeStep.actor}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold text-purple-300">{activeStep.target}</span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                {activeStep.protocol}
              </span>
            </div>

            <span className="text-slate-300 text-xs font-medium">
              {activeStep.action}
            </span>
          </div>
        </div>

        {/* Detailed Sequence Step Card */}
        <div className="p-6 bg-[#0B0F19] border-t border-white/[0.08] space-y-4">
          <p className="text-sm text-slate-200 leading-relaxed">
            {activeStep.description}
          </p>

          {/* Payload Example Snippet if available */}
          {activeStep.payloadExample && (
            <div className="mt-2">
              <div className="text-[11px] font-mono font-semibold text-slate-400 mb-1 flex items-center space-x-1">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>요청/응답 페이로드 & 파라미터 구조</span>
              </div>
              <CodeBlock 
                code={activeStep.payloadExample} 
                language="http" 
                title={`${activeStep.actor} → ${activeStep.target}`} 
              />
            </div>
          )}

          {/* Security Note Alert */}
          {activeStep.securityNote && (
            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-start space-x-2.5 text-xs text-rose-200">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold text-rose-300 mr-1.5">[보안 핵심 유의점]</span>
                {activeStep.securityNote}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lower Details Tabs */}
      <div className="rounded-2xl glass-card hairline-border overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center space-x-2 px-6 pt-4 border-b border-white/[0.08] overflow-x-auto">
          {[
            { id: 'overview', label: '상세 개요' },
            { id: 'takeaways', label: '핵심 시사점' },
            { id: 'tradeoffs', label: '장단점 분석' },
            { id: 'code', label: `실무 코드 (${currentTopic.codeSnippets.length})` },
            { id: 'checklists', label: `체크리스트 (${currentTopic.securityChecklistIds.length})` },
            { id: 'note', label: '내 학습 메모' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4 max-w-4xl text-sm text-slate-300 leading-relaxed">
              <div className="whitespace-pre-line">
                {currentTopic.overview}
              </div>

              {currentTopic.relatedTermIds.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/[0.08]">
                  <span className="text-xs font-mono font-semibold text-slate-400 mr-2">관련 용어:</span>
                  <div className="inline-flex flex-wrap gap-2 mt-1">
                    {currentTopic.relatedTermIds.map(tid => (
                      <span key={tid} className="text-xs">
                        <GlossaryTooltip termId={tid} />
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'takeaways' && (
            <div className="space-y-3 max-w-4xl">
              {currentTopic.keyTakeaways.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3.5 rounded-xl bg-white/[0.02] hairline-border">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tradeoffs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-500/20 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                  <ThumbsUp className="w-4 h-4" />
                  <span>핵심 장점 및 이점 (Pros)</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {currentTopic.tradeOffs.pros.map((p, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span className="leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-rose-950/15 border border-rose-500/20 space-y-3">
                <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                  <ThumbsDown className="w-4 h-4" />
                  <span>고려사항 및 단점 (Cons)</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {currentTopic.tradeOffs.cons.map((c, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span className="leading-relaxed">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-6">
              {currentTopic.codeSnippets.map(snippet => (
                <div key={snippet.id} className="space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>{snippet.title}</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    {snippet.description}
                  </p>
                  <CodeBlock 
                    code={snippet.code} 
                    language={snippet.language} 
                    filename={snippet.filename} 
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'checklists' && (
            <div className="space-y-3 max-w-4xl">
              {currentTopic.securityChecklistIds.map(chkId => {
                const item = checklists.find(c => c.id === chkId);
                if (!item) return null;
                const isChecked = checklistProgress[item.id] || false;
                return (
                  <div 
                    key={item.id}
                    className="p-4 rounded-xl bg-white/[0.02] hairline-border space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => toggleChecklist(item.id)}
                          className={`mt-0.5 p-1 rounded-md transition-colors ${
                            isChecked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.05] text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <CheckSquare className="w-4 h-4" />
                        </button>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-white">
                            {item.title}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                        item.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {item.priority}
                      </span>
                    </div>

                    <div className="pl-7 text-[11px] text-cyan-300/90 font-mono bg-[#090D18] p-2.5 rounded-lg border border-white/[0.04]">
                      <span className="text-slate-500 mr-2">검증 수칙:</span>
                      {item.verificationMethod}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'note' && (
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  이 아키텍처에 대해 학습한 내용이나 사내 적용 아이디어를 기록하세요.
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  로컬 및 백엔드 자동 보존
                </span>
              </div>

              <textarea
                value={localNoteText}
                onChange={(e) => setLocalNoteText(e.target.value)}
                placeholder="예: 우리 프로젝트에서는 BFF를 Next.js Route Handler로 구성하고 Redis Sentinel로 세션을 관리하면 좋겠다..."
                rows={6}
                className="w-full p-4 rounded-xl bg-[#090D18] border border-white/[0.08] text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 leading-relaxed font-sans"
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={handleSaveNote}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all active:scale-95 flex items-center space-x-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>메모 저장</span>
                </button>

                {isNoteSaved && (
                  <span className="text-xs text-emerald-400 font-mono flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>저장되었습니다.</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
