import React, { useState } from 'react';
import { useLearning } from '../context/LearningContext';
import { 
  Bookmark, 
  CheckCircle2, 
  FileText, 
  Download, 
  Upload, 
  Trash2, 
  ArrowRight
} from 'lucide-react';

export const LearningNotebookView: React.FC = () => {
  const { 
    topics, 
    bookmarks, 
    completedTopics, 
    notes, 
    updateNote, 
    toggleBookmark, 
    toggleCompleted, 
    setActiveTopicId, 
    setCurrentView,
    exportDataJson,
    importDataJson
  } = useLearning();

  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const bookmarkedTopicList = topics.filter(t => bookmarks.includes(t.id));
  const completedTopicList = topics.filter(t => completedTopics.includes(t.id));
  const notesTopicList = topics.filter(t => notes[t.id] && notes[t.id].trim().length > 0);

  const handleExport = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archdeck-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const ok = importDataJson(importText);
    if (ok) {
      setImportStatus('데이터를 성공적으로 복원했습니다!');
      setImportText('');
    } else {
      setImportStatus('JSON 파싱 실패: 올바른 백업 파일 형식이 아닙니다.');
    }
    setTimeout(() => setImportStatus(null), 3000);
  };

  const handleGoToTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    setCurrentView('topics');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-card hairline-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Bookmark className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-semibold text-amber-300">
                My Learning Notebook
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              내 학습 서재 & 아키텍처 메모
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              관심 주제 북마크, 학습 진도 및 직접 작성한 기술 아키텍처 노트를 한곳에서 관리하세요.
            </p>
          </div>

          {/* Export / Import Button Group */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-slate-200 hairline-border transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>JSON 내보내기</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Bookmarks & Completed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bookmarked Topics */}
        <div className="p-6 rounded-2xl glass-card hairline-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Bookmark className="w-4 h-4 text-amber-400" />
              <span>북마크한 토픽 ({bookmarkedTopicList.length})</span>
            </h3>
          </div>

          {bookmarkedTopicList.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              북마크한 아키텍처 토픽이 없습니다. 아키텍처 가이드에서 북마크 아이콘을 눌러보세요.
            </p>
          ) : (
            <div className="space-y-2.5">
              {bookmarkedTopicList.map(topic => (
                <div
                  key={topic.id}
                  className="p-3.5 rounded-xl bg-[#090D18] hairline-border flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-white group-hover:text-cyan-300 truncate block">
                      {topic.title}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {topic.koreanTitle}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleGoToTopic(topic.id)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-xs font-mono text-cyan-400 flex items-center space-x-1"
                    >
                      <span>보기</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => toggleBookmark(topic.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                      title="북마크 해제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Topics */}
        <div className="p-6 rounded-2xl glass-card hairline-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>학습 완료한 토픽 ({completedTopicList.length}/{topics.length})</span>
            </h3>
          </div>

          {completedTopicList.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              아직 완료 체크된 토픽이 없습니다. 가이드를 읽고 '이해 완료'를 눌러보세요.
            </p>
          ) : (
            <div className="space-y-2.5">
              {completedTopicList.map(topic => (
                <div
                  key={topic.id}
                  className="p-3.5 rounded-xl bg-[#090D18] hairline-border flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-white group-hover:text-emerald-300 truncate block">
                      {topic.title}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {topic.koreanTitle}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleGoToTopic(topic.id)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-xs font-mono text-emerald-400 flex items-center space-x-1"
                    >
                      <span>복습</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => toggleCompleted(topic.id)}
                      className="p-1 text-slate-500 hover:text-amber-400"
                      title="완료 취소"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Written Notes Section */}
      <div className="p-6 rounded-2xl glass-card hairline-border space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>작성한 기술 아키텍처 메모 ({notesTopicList.length})</span>
        </h3>

        {notesTopicList.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center">
            작성된 메모가 없습니다. 각 아키텍처 상세 페이지의 '내 학습 메모' 탭에서 메모를 기록해 보세요.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notesTopicList.map(topic => (
              <div
                key={topic.id}
                className="p-4 rounded-xl bg-[#090D18] hairline-border flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">
                      {topic.koreanTitle}
                    </span>
                    <button
                      onClick={() => handleGoToTopic(topic.id)}
                      className="text-[10px] font-mono text-cyan-400 hover:underline"
                    >
                      가이드 보기 →
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans bg-black/30 p-3 rounded-lg border border-white/[0.04]">
                    {notes[topic.id]}
                  </p>
                </div>

                <div className="text-right">
                  <button
                    onClick={() => updateNote(topic.id, '')}
                    className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    메모 삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Import JSON Data Box */}
      <div className="p-6 rounded-2xl glass-card hairline-border space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Upload className="w-4 h-4 text-purple-400" />
          <span>JSON 데이터 복원 (Import)</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          이전에 내보낸 ArchDeck JSON 백업 문자열을 붙여넣어 학습 상태와 커스텀 토픽을 복원할 수 있습니다.
        </p>

        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="여기에 백업 JSON 문자열을 붙여넣으세요..."
          rows={3}
          className="w-full p-3 rounded-xl bg-[#090D18] border border-white/[0.08] text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500/50"
        />

        <div className="flex items-center justify-between">
          <button
            onClick={handleImport}
            className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-semibold text-xs border border-purple-500/30 transition-all active:scale-95"
          >
            데이터 복원하기
          </button>

          {importStatus && (
            <span className="text-xs font-mono text-cyan-300">
              {importStatus}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
