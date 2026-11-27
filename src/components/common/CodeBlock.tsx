import React, { useState } from 'react';
import { Check, Copy, FileCode } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  title?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, filename, title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
    }
  };

  return (
    <div className="rounded-xl overflow-hidden hairline-border bg-[#0B0F19] text-xs my-4 shadow-xl">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0F1626] border-b border-white/[0.06]">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60 inline-block"></span>
          </div>
          {filename && (
            <div className="flex items-center text-slate-300 font-mono text-xs">
              <FileCode className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              <span>{filename}</span>
            </div>
          )}
          {title && !filename && (
            <span className="text-slate-300 font-medium">{title}</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.05] text-slate-400 border border-white/[0.05]">
            {language}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-all hairline-border active:scale-95"
            title="코드 복사"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">복사됨</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>복사</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto max-h-[420px] font-mono leading-relaxed text-slate-200">
        <pre className="selection:bg-cyan-500/30">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
