import React, { useState } from "react";
import { useLearning } from "../context/LearningContext";
import {
  BookOpen,
  Search,
  ShieldAlert,
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export const GlossaryView: React.FC = () => {
  const { glossaryTerms, setActiveTopicId, setCurrentView } = useLearning();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(
    decodeURIComponent(location.pathname.split("/")[2] || "") || null,
  );

  const categories = [
    { id: "ALL", label: "전체" },
    { id: "Protocol & Spec", label: "프로토콜 & 표준" },
    { id: "Security Attack & Defense", label: "보안 공격 & 방어" },
    { id: "Architecture Pattern", label: "아키텍처 패턴" },
    { id: "Identity & Cryptography", label: "인증 & 암호학" },
  ];

  const filteredTerms = glossaryTerms.filter((term) => {
    if (selectedCategory !== "ALL" && term.category !== selectedCategory)
      return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    return (
      term.term.toLowerCase().includes(q) ||
      term.koreanName.toLowerCase().includes(q) ||
      term.shortDef.toLowerCase().includes(q) ||
      term.fullDef.toLowerCase().includes(q) ||
      term.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    history.replaceState({}, "", "/glossary/" + encodeURIComponent(id));
  };

  const handleGoToTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    setCurrentView("topics");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Search */}
      <div className="p-6 rounded-2xl glass-card hairline-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <BookOpen className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-semibold text-emerald-300">
                Enterprise Tech Glossary
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              핵심 아키텍처 & 보안 용어 사전
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              PKCE, Token Relay, JWKS, Kill Switch 등 실무 아키텍처 수립에
              필수적인 핵심 개념 총정리
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="용어, 개념, RFC 규격 검색..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#090D18] hairline-border text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center space-x-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-emerald"
                  : "bg-white/[0.03] text-slate-400 hover:text-white hairline-border"
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="ml-auto text-xs font-mono text-slate-500 shrink-0">
            {filteredTerms.length} terms
          </span>
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTerms.map((term) => {
          const isExpanded = expandedId === term.id;
          return (
            <div
              key={term.id}
              className={`p-6 rounded-2xl glass-card hairline-border transition-all flex flex-col justify-between ${
                isExpanded
                  ? "border-cyan-500/40 shadow-2xl"
                  : "hover:border-white/[0.15]"
              }`}
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-bold text-white font-mono tracking-tight">
                        {term.term}
                      </h3>
                      {term.specRef && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/20">
                          {term.specRef}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      {term.koreanName}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06] shrink-0">
                    {term.category}
                  </span>
                </div>

                {/* Short Definition */}
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mt-3">
                  {term.shortDef}
                </p>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-4 animate-in fade-in duration-150">
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        <span>상세 아키텍처 메커니즘</span>
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                        {term.fullDef}
                      </p>
                    </div>

                    {term.keyPoints.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-[#090D18] hairline-border space-y-1.5">
                        <span className="text-xs font-bold text-cyan-300 block mb-1">
                          핵심 포인트:
                        </span>
                        {term.keyPoints.map((pt, pIdx) => (
                          <div
                            key={pIdx}
                            className="text-xs text-slate-300 flex items-start space-x-2"
                          >
                            <span className="text-cyan-400 font-bold">•</span>
                            <span className="leading-relaxed">{pt}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {term.securityRelevance && (
                      <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-200 flex items-start space-x-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          <span className="font-bold text-rose-300 mr-1">
                            [실무 보안 주의점]
                          </span>
                          {term.securityRelevance}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                {/* Tags */}
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  {term.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.03] text-slate-400"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {term.relatedTopicIds && term.relatedTopicIds[0] && (
                    <button
                      onClick={() => handleGoToTopic(term.relatedTopicIds![0])}
                      className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1 text-[11px] underline"
                      title="관련 아키텍처 가이드로 이동"
                    >
                      <span>가이드 보기</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}

                  <button
                    onClick={() => toggleExpand(term.id)}
                    className="p-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300"
                    title={isExpanded ? "접기" : "상세 열기"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
