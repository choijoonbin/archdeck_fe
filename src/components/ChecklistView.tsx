import React, { useState } from "react";
import { useLearning } from "../context/LearningContext";
import { CheckSquare, Square, Terminal } from "lucide-react";
import { CodeBlock } from "./common/CodeBlock";

export const ChecklistView: React.FC = () => {
  const { checklists, checklistProgress, toggleChecklist } = useLearning();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");

  const categories = [
    { id: "ALL", label: "전체" },
    { id: "XSS Defense", label: "XSS 방어" },
    { id: "CSRF Defense", label: "CSRF 방어" },
    { id: "OIDC & Token", label: "OIDC & 토큰" },
    { id: "BFF & Session", label: "BFF & 세션" },
    { id: "Infra & IAM", label: "인프라 & IAM" },
  ];

  const filteredChecklists = checklists.filter((item) => {
    if (selectedCategory !== "ALL" && item.category !== selectedCategory)
      return false;
    if (selectedPriority !== "ALL" && item.priority !== selectedPriority)
      return false;
    return true;
  });

  const checkedCount = checklists.filter(
    (item) => checklistProgress[item.id],
  ).length;
  const progressPercent = checklists.length
    ? Math.round((checkedCount / checklists.length) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Overall Score */}
      <div className="p-6 rounded-2xl glass-card hairline-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <CheckSquare className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-semibold text-amber-300">
                Security & Operations Checklist
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              보안 & 운영 실무 체크리스트
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              배포 전 필수 점검: 토큰 탈취 방지, 쿠키 보호, 암호 알고리즘 강제
              및 HA 장애 복구
            </p>
          </div>

          {/* Progress Indicator Card */}
          <div className="p-4 rounded-xl bg-[#090D18] hairline-border sm:w-64 space-y-2 shrink-0">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">보안 준수 진도율</span>
              <span className="font-mono font-bold text-emerald-400">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-slate-500 text-right">
              {checkedCount} / {checklists.length} 완료됨
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-glow-amber"
                    : "bg-white/[0.03] text-slate-400 hover:text-white hairline-border"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-mono text-[11px]">
              우선순위:
            </span>
            {["ALL", "CRITICAL", "HIGH"].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  selectedPriority === p
                    ? "bg-white/[0.1] text-white border border-white/[0.2]"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Checklist Items List */}
      <div className="space-y-4">
        {filteredChecklists.map((item) => {
          const isDone = checklistProgress[item.id] || false;
          return (
            <div
              key={item.id}
              id={item.id}
              className={`p-6 rounded-2xl glass-card hairline-border transition-all ${
                isDone
                  ? "border-emerald-500/40 bg-emerald-950/5"
                  : "hover:border-white/[0.12]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <button
                    onClick={() => toggleChecklist(item.id)}
                    className={`mt-1 p-1 rounded-lg transition-colors ${
                      isDone
                        ? "bg-emerald-500 text-slate-950 shadow-glow-emerald"
                        : "bg-white/[0.05] text-slate-500 hover:text-slate-200 hairline-border"
                    }`}
                  >
                    {isDone ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          item.priority === "CRITICAL"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {item.priority}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400">
                        {item.category}
                      </span>
                    </div>

                    <h3
                      className={`text-base font-bold mt-1.5 transition-colors ${
                        isDone
                          ? "text-emerald-300 line-through opacity-80"
                          : "text-white"
                      }`}
                    >
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification Method Box */}
              <div className="mt-4 p-3.5 rounded-xl bg-[#090D18] hairline-border text-xs text-slate-300 flex items-start space-x-2.5">
                <Terminal className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-cyan-300 mr-2">
                    검증 및 점검 절차:
                  </span>
                  <span className="text-slate-300 leading-relaxed font-mono text-[11px]">
                    {item.verificationMethod}
                  </span>
                </div>
              </div>

              {/* Code Example if present */}
              {item.codeExample && (
                <div className="mt-3">
                  <CodeBlock
                    code={item.codeExample}
                    language="typescript"
                    title="방어 코드 & 설정 스니펫"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
