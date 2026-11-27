import React, { useState } from 'react';
import { useLearning } from '../context/LearningContext';
import { X, Plus, Layers, BookOpen, CheckCircle2 } from 'lucide-react';
import { Topic, GlossaryTerm } from '../types';

interface CreateKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateKnowledgeModal: React.FC<CreateKnowledgeModalProps> = ({ isOpen, onClose }) => {
  const { addCustomTopic, addCustomGlossary } = useLearning();
  const [activeTab, setActiveTab] = useState<'topic' | 'glossary'>('topic');
  const [isSuccess, setIsSuccess] = useState(false);

  // Topic Form State
  const [topicTitle, setTopicTitle] = useState('');
  const [topicKoreanTitle, setTopicKoreanTitle] = useState('');
  const [topicCategory, setTopicCategory] = useState<'IAM & Auth' | 'Frontend Architecture' | 'Backend & BFF' | 'Security & Defense'>('Frontend Architecture');
  const [topicSummary, setTopicSummary] = useState('');
  const [topicOverview, setTopicOverview] = useState('');
  const [topicBadges, setTopicBadges] = useState('Custom, OAuth2.1');

  // Glossary Form State
  const [glossaryTerm, setGlossaryTerm] = useState('');
  const [glossaryKoreanName, setGlossaryKoreanName] = useState('');
  const [glossaryCategory, setGlossaryCategory] = useState<'Protocol & Spec' | 'Security Attack & Defense' | 'Architecture Pattern' | 'Identity & Cryptography'>('Protocol & Spec');
  const [glossaryShortDef, setGlossaryShortDef] = useState('');
  const [glossaryFullDef, setGlossaryFullDef] = useState('');
  const [glossarySpecRef, setGlossarySpecRef] = useState('RFC 9999');
  const [glossaryTags, setGlossaryTags] = useState('Custom, Spec');

  if (!isOpen) return null;

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim() || !topicKoreanTitle.trim()) return;

    const newTopic: Topic = {
      id: `custom-topic-${Date.now()}`,
      slug: topicTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: topicTitle,
      koreanTitle: topicKoreanTitle,
      category: topicCategory,
      summary: topicSummary,
      overview: topicOverview || topicSummary,
      badges: topicBadges.split(',').map(b => b.trim()).filter(Boolean),
      readingTimeMinutes: 5,
      diagramNodes: [
        { id: 'client', label: 'Client App', subLabel: 'Web / Mobile', type: 'client', icon: 'Layout' },
        { id: 'gateway', label: 'API Gateway', subLabel: 'Reverse Proxy', type: 'gateway', icon: 'Network' },
        { id: 'backend', label: 'Backend Server', subLabel: 'Microservice', type: 'server', icon: 'Server' }
      ],
      flowSteps: [
        {
          step: 1,
          title: '초기 클라이언트 요청 전달',
          actor: 'Client App',
          target: 'API Gateway',
          protocol: 'HTTPS REST',
          action: '클라이언트가 인가된 토큰과 함께 게이트웨이로 요청을 전송합니다.',
          description: topicSummary,
          activeNodes: ['client', 'gateway']
        },
        {
          step: 2,
          title: '백엔드 마이크로서비스 처리',
          actor: 'API Gateway',
          target: 'Backend Server',
          protocol: 'Internal HTTP',
          action: '게이트웨이 검증 후 다운스트림 서비스로 전달되어 비즈니스 로직을 수행합니다.',
          description: '정상 인가 처리 후 데이터 응답을 생성합니다.',
          activeNodes: ['gateway', 'backend']
        }
      ],
      keyTakeaways: [
        `${topicKoreanTitle} 핵심 설계 패턴 적용`,
        '보안 규격 및 시스템 안정성 확보',
        '확장 가능한 모듈형 아키텍처 채택'
      ],
      tradeOffs: {
        pros: ['유연한 확장성 및 명확한 책임 분리', '표준 기술 준수로 유지보수성 향상'],
        cons: ['초기 설정 및 인프라 학습 비용 발생']
      },
      codeSnippets: [
        {
          id: 'sample-config',
          title: `${topicTitle} 기본 구성 스니펫`,
          filename: 'config.ts',
          language: 'typescript',
          code: `// ${topicTitle} 기본 설정 샘플
export const config = {
  enabled: true,
  name: "${topicTitle}",
  category: "${topicCategory}"
};`,
          description: '프로젝트에 적용할 기본 설정 코드 스니펫입니다.'
        }
      ],
      securityChecklistIds: ['chk-xss-1'],
      relatedTermIds: ['pkce'],
      relatedTopicIds: ['spa-pkce-direct']
    };

    await addCustomTopic(newTopic);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  const handleCreateGlossary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!glossaryTerm.trim()) return;

    const newTerm: GlossaryTerm = {
      id: `custom-term-${Date.now()}`,
      term: glossaryTerm,
      koreanName: glossaryKoreanName || glossaryTerm,
      category: glossaryCategory,
      shortDef: glossaryShortDef,
      fullDef: glossaryFullDef || glossaryShortDef,
      keyPoints: [
        '사용자 정의 엔터프라이즈 기술 용어',
        '사내 표준 아키텍처 용어집 등재'
      ],
      specRef: glossarySpecRef,
      securityRelevance: '실무 시스템 구축 시 표준 용어 정의에 맞게 구현되었는지 점검하세요.',
      tags: glossaryTags.split(',').map(t => t.trim()).filter(Boolean)
    };

    await addCustomGlossary(newTerm);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-[#0C121E] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0F1626]">
          <div className="flex items-center space-x-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm sm:text-base font-bold text-white">
              새 지식 등록 (Custom Architecture / Glossary)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/[0.06] bg-[#090D17]">
          <button
            onClick={() => setActiveTab('topic')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition-all ${
              activeTab === 'topic'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>새 아키텍처 토픽</span>
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition-all ${
              activeTab === 'glossary'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>새 테크 용어</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {isSuccess ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-base font-bold text-white">성공적으로 등록되었습니다!</h3>
              <p className="text-xs text-slate-400">새 지식이 목록과 사전에 즉시 반영되었습니다.</p>
            </div>
          ) : activeTab === 'topic' ? (
            <form onSubmit={handleCreateTopic} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">영문 제목 (Title) *</label>
                <input
                  type="text"
                  required
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  placeholder="예: Zero Trust Service Mesh Architecture"
                  className="w-full p-2.5 rounded-xl bg-[#090D18] hairline-border text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">한글 제목 (Korean Title) *</label>
                <input
                  type="text"
                  required
                  value={topicKoreanTitle}
                  onChange={(e) => setTopicKoreanTitle(e.target.value)}
                  placeholder="예: 제로 트러스트 서비스 메시 아키텍처"
                  className="w-full p-2.5 rounded-xl bg-[#090D18] hairline-border text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">카테고리</label>
                <select
                  value={topicCategory}
                  onChange={(e) => setTopicCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#090D18] hairline-border text-slate-100 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="IAM & Auth">IAM & Auth</option>
                  <option value="Frontend Architecture">Frontend Architecture</option>
                  <option value="Backend & BFF">Backend & BFF</option>
                  <option value="Security & Defense">Security & Defense</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">한 줄 요약 (Summary)</label>
                <input
                  type="text"
                  value={topicSummary}
                  onChange={(e) => setTopicSummary(e.target.value)}
                  placeholder="이 아키텍처의 핵심 설계 의도와 해결하려는 문제를 요약하세요."
                  className="w-full p-2.5 rounded-xl bg-[#090D18] hairline-border text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">상세 배경 및 아키텍처 설명</label>
                <textarea
                  rows={3}
                  value={topicOverview}
                  onChange={(e) => setTopicOverview(e.target.value)}
                  placeholder="시스템 구성 방식과 동작 원리를 작성하세요."
                  className="w-full p-2.5 rounded-xl bg-[#090D18] hairline-border text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">태그 / 배지 (쉼표 구분)</label>
                <input
                  type="text"
                  value={topicBadges}
                  onChange={(e) => setTopicBadges(e.target.value)}
                  placeholder="mTLS, Envoy, Istio, Zero Trust"
                  className="w-full p-2.5 rounded-xl bg-[#090D18] hairline-border text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-glow-cyan transition-all active:scale-95"
                >
                  아키텍처 토픽 추가하기
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateGlossary} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">영문 용어 (Term) *</label>
                <input
                  type="text"
                  required
                  value={glossaryTerm}
                  onChange={(e) => setGlossaryTerm(e.target.value)}
                  placeholder="예: DPoP"
                  className="w-full p-2.5 rounded-xl bg-[#090D18] hairline-border text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">한글 명칭</label>
                <input
                  type="text"
                  value={glossaryKoreanName}
                  onChange={(e) => setGlossaryKoreanName(e.target.value)}
                  placeholder="예: 애플리케이션 계층 지분 증명 (RFC 9449)"
                  className="w-full p-2.5 rounded-xl bg-[#090D18] hairline-border text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">카테고리</label>
                <select
                  value={glossaryCategory}
                  onChange={(e) => setGlossaryCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#090D18] hairline-border text-slate-100 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="Protocol & Spec">Protocol & Spec</option>
                  <option value="Security Attack & Defense">Security Attack & Defense</option>
                  <option value="Architecture Pattern">Architecture Pattern</option>
                  <option value="Identity & Cryptography">Identity & Cryptography</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">한 줄 정의 (Short Definition) *</label>
                <input
                  type="text"
                  required
                  value={glossaryShortDef}
                  onChange={(e) => setGlossaryShortDef(e.target.value)}
                  placeholder="용어 호버 툴팁에 표시될 핵심 정의를 입력하세요."
                  className="w-full p-2.5 rounded-xl bg-[#090D18] hairline-border text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">스펙 규격 / RFC 번호</label>
                <input
                  type="text"
                  value={glossarySpecRef}
                  onChange={(e) => setGlossarySpecRef(e.target.value)}
                  placeholder="RFC 9449 / OAuth 2.1"
                  className="w-full p-2.5 rounded-xl bg-[#090D18] hairline-border text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-glow-emerald transition-all active:scale-95"
                >
                  용어 사전에 등록하기
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
