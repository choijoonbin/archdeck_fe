import React from 'react';
import { useLearning } from '../context/LearningContext';
import { 
  Layers, 
  ShieldCheck, 
  GitCompare, 
  BookOpen, 
  ArrowRight, 
  Lock, 
  Bookmark, 
  Zap,
  Radio,
  CheckSquare
} from 'lucide-react';
import { GlossaryTooltip } from './common/GlossaryTooltip';

interface BentoHomeProps {
  onOpenSearch: () => void;
}

export const BentoHome: React.FC<BentoHomeProps> = ({ onOpenSearch }) => {
  const { 
    topics, 
    glossaryTerms, 
    comparisons, 
    checklists, 
    bookmarks, 
    completedTopics, 
    setActiveTopicId, 
    setCurrentView 
  } = useLearning();

  const handleOpenTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    setCurrentView('topics');
  };

  const keycloakTopic = topics.find(t => t.id === 'keycloak-iam-overview') || topics[0];
  const bffTopic = topics.find(t => t.id === 'bff-token-relay') || topics[1];
  const spaTopic = topics.find(t => t.id === 'spa-pkce-direct') || topics[2];
  const xssTopic = topics.find(t => t.id === 'xss-vs-csrf-defense') || topics[4];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl glass-card p-6 sm:p-10 hairline-border bg-grid-pattern">
        {/* Glow orb background */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium mb-4">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Next-Gen Enterprise Architecture Deck</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            엔지니어를 위한 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
              인터랙티브 아키텍처 & 보안 허브
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Keycloak & OIDC 기반 통합 인증, SPA + PKCE와 BFF 패턴의 실무 비교, XSS/CSRF 심층 방어 전략 및 
            시스템 시퀀스를 단계별 인터랙티브 다이어그램으로 탐색하고 학습하세요.
          </p>

          {/* Quick CTA Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenTopic('bff-token-relay')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-glow-cyan transition-all active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>BFF + Token Relay 학습하기</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => setCurrentView('comparisons')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 font-medium text-xs sm:text-sm hairline-border transition-all active:scale-95"
            >
              <GitCompare className="w-4 h-4 text-purple-400" />
              <span>SPA vs BFF 비교 매트릭스</span>
            </button>

            <button
              onClick={onOpenSearch}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 text-xs sm:text-sm hairline-border transition-all"
            >
              <kbd className="font-mono text-cyan-400">⌘K</kbd>
              <span>실시간 검색</span>
            </button>
          </div>

          {/* Metric Stats */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold font-mono text-white">{topics.length}</div>
              <div className="text-xs text-slate-400 mt-0.5">핵심 아키텍처 토픽</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-cyan-400">{comparisons.length}</div>
              <div className="text-xs text-slate-400 mt-0.5">심층 비교 매트릭스</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{glossaryTerms.length}</div>
              <div className="text-xs text-slate-400 mt-0.5">엔터프라이즈 용어 사전</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-amber-400">{checklists.length}</div>
              <div className="text-xs text-slate-400 mt-0.5">보안·운영 체크포인트</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Keycloak & Open Source IAM Overview (Col-span-2) */}
        <div 
          onClick={() => handleOpenTopic(keycloakTopic.id)}
          className="md:col-span-2 rounded-2xl glass-card p-6 sm:p-7 glass-card-hover cursor-pointer relative overflow-hidden group flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/20">
                  IAM Architecture
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono flex items-center space-x-1 group-hover:text-cyan-400 transition-colors">
                <span>자세히 보기</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
              {keycloakTopic.title}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {keycloakTopic.koreanTitle}
            </p>

            <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
              비즈니스 로직과 물리적으로 분리된 별도 IAM(인증 서버) 구성 이유, OIDC/OAuth 2.0 표준화 및
              글로벌 오픈소스 솔루션(<GlossaryTooltip termId="jwks" />, <GlossaryTooltip termId="stateless-infinispan" />, authentik, ZITADEL, Ory) 트렌드를 총정리합니다.
            </p>

            {/* Visual Mini Pipeline */}
            <div className="mt-5 p-3.5 rounded-xl bg-[#090D18] hairline-border grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-white/[0.03]">
                <div className="font-mono text-[11px] text-cyan-400 font-semibold">1. Single Sign-On</div>
                <div className="text-[10px] text-slate-400 mt-0.5">OIDC & SAML 2.0</div>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.03]">
                <div className="font-mono text-[11px] text-purple-400 font-semibold">2. Infinispan HA</div>
                <div className="text-[10px] text-slate-400 mt-0.5">분산 세션 클러스터</div>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.03]">
                <div className="font-mono text-[11px] text-emerald-400 font-semibold">3. JWKS Stateless</div>
                <div className="text-[10px] text-slate-400 mt-0.5">무상태 고속 검증</div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center space-x-2 flex-wrap gap-y-1">
            {keycloakTopic.badges.map((b, i) => (
              <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Card 2: Interactive Architecture Quick Selector (Col-span-1) */}
        <div className="rounded-2xl glass-card p-6 sm:p-7 glass-card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Layers className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-500/20">
                Interactive Flows
              </span>
            </div>

            <h3 className="text-lg font-bold text-white">
              핵심 아키텍처 흐름도
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              단계별(Step 1, 2, 3...) 시퀀스 동작과 페이로드를 직접 제어해 보세요.
            </p>

            <div className="mt-4 space-y-2.5">
              {[
                { topic: bffTopic, label: 'BFF + Token Relay (추천)', badge: 'Confidential' },
                { topic: spaTopic, label: 'SPA + PKCE 직접 연동', badge: 'Public Client' },
                { topic: xssTopic, label: 'XSS vs CSRF 실무 방어선', badge: 'Security' },
              ].map(({ topic, label, badge }) => (
                <button
                  key={topic.id}
                  onClick={() => handleOpenTopic(topic.id)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] hairline-border text-left group transition-all"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate">
                      {label}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {topic.flowSteps.length} 단계 시퀀스 내장
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 shrink-0">
                    {badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setCurrentView('topics')}
            className="mt-4 w-full py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-slate-300 hover:text-white hairline-border flex items-center justify-center space-x-1 transition-all"
          >
            <span>전체 아키텍처 가이드 보기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: SPA vs BFF Comparison Matrix (Col-span-1) */}
        <div 
          onClick={() => setCurrentView('comparisons')}
          className="rounded-2xl glass-card p-6 sm:p-7 glass-card-hover cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <GitCompare className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/20">
                Comparison Matrix
              </span>
            </div>

            <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
              SPA + PKCE vs BFF 패턴
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              토큰의 물리적 보관 위치, 브라우저 인증 수단, 인프라 비용까지 정량 비교.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-[#090D18] hairline-border space-y-2 text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">토큰 위치</span>
                <span className="font-mono text-amber-300">메모리 vs Redis 격리</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">XSS 위험도</span>
                <span className="font-mono text-emerald-400">BFF가 원천 차단</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Kill Switch</span>
                <span className="font-mono text-cyan-400">BFF O(1) 지원</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-emerald-400 font-medium">
            <span>의사결정 매트릭스 열기</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: XSS vs CSRF Defense Summary (Col-span-1) */}
        <div 
          onClick={() => handleOpenTopic('xss-vs-csrf-defense')}
          className="rounded-2xl glass-card p-6 sm:p-7 glass-card-hover cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Lock className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-500/20">
                Security Defense
              </span>
            </div>

            <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
              XSS vs CSRF 실무 방어 요약
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              공격 원리와 목적의 근본적인 차이와 심층 방어(Defense in Depth) 전략.
            </p>

            <div className="mt-4 space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/20 text-slate-300">
                <span className="font-bold text-rose-400">XSS:</span> 스크립트 실행 권한 탈취 → CSP + 이스케이프 + 토큰 격리
              </div>
              <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-slate-300">
                <span className="font-bold text-amber-400">CSRF:</span> 인증 세션 요청 위조 → SameSite + X-XSRF-TOKEN 검증
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-rose-400 font-medium">
            <span>보안 가이드 확인</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 5: Core Tech Glossary Spotlight (Col-span-1) */}
        <div 
          onClick={() => setCurrentView('glossary')}
          className="rounded-2xl glass-card p-6 sm:p-7 glass-card-hover cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <BookOpen className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/20">
                Glossary Spotlight
              </span>
            </div>

            <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
              주요 테크 용어 하이라이트
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              본문 호버 인라인 툴팁 및 RFC 표준 스펙 링크 지원.
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {['PKCE', 'Token Relay', 'JWKS', 'Back-Channel', 'Kill Switch', 'SameSite'].map((term, i) => (
                <span 
                  key={i} 
                  className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-300 hover:text-white hover:bg-cyan-500/20 border border-white/[0.08] transition-colors"
                >
                  {term}
                </span>
              ))}
            </div>

            <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
              총 {glossaryTerms.length}개의 핵심 용어가 등록되어 있으며, 클릭 시 상세 정의와 보안 유의점을 확인할 수 있습니다.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-cyan-400 font-medium">
            <span>용어 사전 열기</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </section>

      {/* User Progress & Quick Start Banner */}
      <section className="rounded-2xl glass-panel p-6 hairline-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Bookmark className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white">
              나의 학습 진행 상황 ({completedTopics.length}/{topics.length} 완료)
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              북마크한 토픽 {bookmarks.length}개 · 작성한 개인 학습 메모와 함께 계속 학습을 이어가세요.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => setCurrentView('learning')}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs font-semibold text-white hairline-border transition-all"
          >
            내 서재 & 메모 열기
          </button>
          <button
            onClick={() => setCurrentView('checklists')}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-all flex items-center justify-center space-x-1"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>체크리스트 점검</span>
          </button>
        </div>
      </section>
    </div>
  );
};
