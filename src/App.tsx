import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LearningProvider, useLearning, View } from "./context/LearningContext";
import { AppearanceProvider, useAppearance } from "./context/AppearanceContext";
import { ArchitectureFlowViewer } from "./components/ArchitectureFlowViewer";
import { ComparisonView } from "./components/ComparisonView";
import { GlossaryView } from "./components/GlossaryView";
import { ChecklistView } from "./components/ChecklistView";
import { LearningNotebookView } from "./components/LearningNotebookView";
import { CommandPalette } from "./components/common/CommandPalette";
import { SettingsPanel } from "./components/SettingsPanel";
import { Insights, Research, Users, Studio } from "./components/AdminViews";
import {
  Layers,
  Home,
  GitCompare,
  BookOpen,
  CheckSquare,
  Bookmark,
  Newspaper,
  Bot,
  Users as UsersIcon,
  PenLine,
  Search,
  Settings,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Maximize,
  X,
  ArrowRight,
} from "lucide-react";
import { request, resetCsrf } from "./services/apiClient";
function Login() {
  const { login, refresh, user, error: connectionError } = useAuth();
  const [username, setUsername] = useState(""),
    [password, setPassword] = useState(""),
    [nextPassword, setNextPassword] = useState(""),
    [confirmation, setConfirmation] = useState(""),
    [message, msg] = useState(""),
    [busy, setBusy] = useState(false);
  const change = !!user?.mustChangePassword;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    msg("");
    try {
      if (change) {
        if (nextPassword !== confirmation)
          throw new Error("새 비밀번호가 일치하지 않습니다.");
        const count = Array.from(nextPassword).length;
        if (
          count < 15 ||
          count > 128 ||
          new TextEncoder().encode(nextPassword).length > 512
        )
          throw new Error(
            "비밀번호는 15~128자, UTF-8 512바이트 이내로 입력해 주세요.",
          );
        await request("/auth/password", {
          method: "POST",
          body: JSON.stringify({
            currentPassword: password,
            newPassword: nextPassword,
          }),
        });
        resetCsrf();
        await refresh();
        msg("비밀번호를 변경했습니다. 다시 로그인해 주세요.");
        setPassword("");
        setNextPassword("");
      } else await login(username, password);
    } catch (e) {
      msg((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="brand-mark">
          <Layers size={24} />
        </div>
        <span className="eyebrow">ARCHDECK · KNOWLEDGE WORKSPACE</span>
        <h1>{change ? "비밀번호 변경" : "지식이 설계의 기준이 되는 곳"}</h1>
        <p>
          {change
            ? "초기 비밀번호를 변경한 뒤 학습을 시작하세요."
            : "사내 계정으로 로그인하여 아키텍처와 새로운 기술을 탐색하세요."}
        </p>
        {!change && (
          <label>
            아이디
            <input
              name="username"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
        )}
        <label>
          {change ? "현재 비밀번호" : "비밀번호"}
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {change && (
          <label>
            새 비밀번호 (15자 이상)
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={15}
              value={nextPassword}
              onChange={(e) => setNextPassword(e.target.value)}
            />
          </label>
        )}
        {change && (
          <label>
            새 비밀번호 확인
            <input
              type="password"
              autoComplete="new-password"
              required
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
            />
          </label>
        )}
        <p role="alert" className="error-text">
          {message || connectionError}
        </p>
        <button className="primary-button" disabled={busy}>
          {busy ? "확인 중…" : change ? "비밀번호 변경" : "로그인"}
        </button>
        <small>계정 발급 또는 비밀번호 재설정은 관리자에게 요청하세요.</small>
      </form>
    </main>
  );
}
const navigation: [View, string, any][] = [
  ["home", "학습 시작", Home],
  ["topics", "아키텍처", Layers],
  ["comparisons", "비교", GitCompare],
  ["glossary", "용어 사전", BookOpen],
  ["checklists", "체크리스트", CheckSquare],
  ["learning", "내 서재", Bookmark],
  ["insights", "트렌드·인사이트", Newspaper],
];
function LearningHome() {
  const {
    topics,
    completedTopics,
    bookmarks,
    setActiveTopicId,
    setCurrentView,
  } = useLearning();
  const open = (id: string) => {
    setActiveTopicId(id);
    setCurrentView("topics");
  };
  return (
    <section>
      <div className="page-title">
        <span className="eyebrow">YOUR ENGINEERING WORKSPACE</span>
        <h1>이해하고, 비교하고, 설계하세요.</h1>
        <p>기술의 작동 원리부터 적용 전 점검까지 한 흐름으로 연결합니다.</p>
      </div>
      <div className="home-grid">
        <article className="surface welcome">
          <span className="eyebrow">CONTINUE LEARNING</span>
          <h2>다음 설계를 위한 한 단계</h2>
          <p>인증과 웹 아키텍처를 단계별 흐름과 비교로 이해하세요.</p>
          <div className="toolbar">
            <span>
              {completedTopics.length} / {topics.length} 이해 완료
            </span>
            <span>북마크 {bookmarks.length}개</span>
          </div>
          <button
            className="primary-button"
            onClick={() => {
              const next =
                topics.find((t) => !completedTopics.includes(t.id)) ||
                topics[0];
              if (next) open(next.id);
            }}
            disabled={!topics.length}
          >
            학습 이어가기 <ArrowRight size={16} />
          </button>
        </article>
        <article className="surface">
          <span className="eyebrow">DECISION GUIDE</span>
          <h2>어떤 구성이 맞을까요?</h2>
          <p>토큰 보관, 위험, 운영 비용을 같은 기준으로 비교합니다.</p>
          <button
            className="secondary-button"
            onClick={() => setCurrentView("comparisons")}
          >
            아키텍처 비교하기
          </button>
        </article>
      </div>
      <div className="section-heading">
        <h2>아키텍처 라이브러리</h2>
        <span className="muted">{topics.length}개 주제</span>
      </div>
      <div className="content-grid">
        {topics.map((t) => (
          <button
            className="surface topic-card"
            key={t.id}
            onClick={() => open(t.id)}
          >
            <span className="eyebrow">{t.category}</span>
            <h3>{t.koreanTitle || t.title}</h3>
            <p>{t.summary}</p>
            <div className="card-footer">
              <span>
                {t.readingTimeMinutes}분 · {t.flowSteps?.length || 0}단계
              </span>
              <ArrowRight size={16} />
            </div>
          </button>
        ))}
      </div>
      <article className="surface research-link">
        <div>
          <span className="eyebrow">REVIEWED INSIGHTS</span>
          <h2>지금 바뀌고 있는 기술</h2>
          <p>검토된 트렌드와 관련 지식의 연결을 확인하세요.</p>
        </div>
        <button
          className="secondary-button"
          onClick={() => setCurrentView("insights")}
        >
          인사이트 보기
        </button>
      </article>
    </section>
  );
}
function Shell() {
  const { user, logout } = useAuth();
  const { preferences: p, setPreferences: set } = useAppearance();
  const {
    currentView,
    setCurrentView,
    loading,
    error,
    storageError,
    refresh,
    topics,
  } = useLearning();
  const [search, setSearch] = useState(false),
    [settings, setSettings] = useState(false),
    [mobile, setMobile] = useState(false),
    [actionError, setActionError] = useState("");
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
      if (e.key === "Escape") setMobile(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (!mobile) return;
    const previous = document.activeElement as HTMLElement;
    const dialog = document.querySelector<HTMLElement>(".mobile-nav");
    const first = dialog?.querySelector<HTMLElement>("button,a");
    first?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const nodes = dialog?.querySelectorAll<HTMLElement>("button,a");
      if (!nodes?.length) return;
      const start = nodes[0],
        end = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === start) {
        event.preventDefault();
        end.focus();
      } else if (!event.shiftKey && document.activeElement === end) {
        event.preventDefault();
        start.focus();
      }
    };
    window.addEventListener("keydown", trap);
    return () => {
      window.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [mobile]);
  const admin = user.role === "ADMIN";
  const protectedView = ["research", "users", "studio"].includes(currentView);
  const go = (v: View) => {
    setCurrentView(v);
    setMobile(false);
  };
  const nav = (close = false) => (
    <>
      <div className="nav-heading">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            go("home");
          }}
          className="brand"
        >
          <Layers />
          <span>
            ArchDeck<small>지식과 설계의 연결</small>
          </span>
        </a>
        {close ? (
          <button
            className="icon-button"
            aria-label="메뉴 닫기"
            onClick={() => setMobile(false)}
          >
            <X />
          </button>
        ) : (
          <button
            className="icon-button collapse-button"
            aria-label={p.collapsed ? "메뉴 펼치기" : "메뉴 접기"}
            onClick={() => set({ ...p, collapsed: !p.collapsed })}
          >
            {p.collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
        )}
      </div>
      <nav aria-label="주 메뉴">
        {navigation.map(([id, label, Icon]) => (
          <button
            key={id}
            className={currentView === id ? "selected" : ""}
            aria-current={currentView === id ? "page" : undefined}
            title={label}
            onClick={() => go(id)}
          >
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}
        {admin && (
          <>
            <div className="nav-group">관리 도구</div>
            {(
              [
                ["studio", "콘텐츠 스튜디오", PenLine],
                ["research", "리서치 에이전트", Bot],
                ["users", "계정 관리", UsersIcon],
              ] as [View, string, any][]
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                className={currentView === id ? "selected" : ""}
                title={label}
                onClick={() => go(id)}
              >
                <Icon size={19} />
                <span>{label}</span>
              </button>
            ))}
          </>
        )}
      </nav>
      <div className="nav-bottom">
        <small>TEAM KNOWLEDGE HUB</small>
        <span>
          근거에서 이해로,
          <br />
          이해에서 설계로.
        </span>
      </div>
    </>
  );
  return (
    <div
      className={
        "workspace placement-" + p.placement + (p.collapsed ? " collapsed" : "")
      }
    >
      <a className="skip-link" href="#main-content">
        본문으로 이동
      </a>
      <aside className="desktop-nav">{nav()}</aside>
      <div className="workspace-body">
        <header className="shell-header">
          <button
            className="icon-button mobile-menu"
            aria-label="메뉴 열기"
            onClick={() => setMobile(true)}
          >
            <Menu />
          </button>
          <div className="breadcrumb">
            ArchDeck <span>/</span>
            <strong>
              {navigation.find((i) => i[0] === currentView)?.[1] ||
                {
                  studio: "콘텐츠 스튜디오",
                  research: "리서치 에이전트",
                  users: "계정 관리",
                }[currentView] ||
                "학습 시작"}
            </strong>
          </div>
          <div className="header-actions">
            <button
              className="search-button"
              onClick={() => setSearch(true)}
              aria-label="통합 검색"
            >
              <Search size={18} />
              <span>지식 검색</span>
              <kbd>⌘ K</kbd>
            </button>
            {admin && (
              <button className="header-create" onClick={() => go("studio")}>
                + 새 지식
              </button>
            )}
            <button
              className="icon-button fullscreen"
              aria-label="전체 화면"
              onClick={() => {
                if (document.fullscreenElement) document.exitFullscreen();
                else document.documentElement.requestFullscreen?.();
              }}
            >
              <Maximize size={18} />
            </button>
            <button
              className="icon-button"
              aria-label="화면 설정"
              onClick={() => {
                setMobile(false);
                setSettings(true);
              }}
            >
              <Settings size={19} />
            </button>
            <span className="user-name">{user.displayName}</span>
            <button
              className="icon-button"
              aria-label="로그아웃"
              onClick={async () => {
                try {
                  await logout();
                } catch (e) {
                  setActionError((e as Error).message);
                }
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main id="main-content" className="main-content" tabIndex={-1}>
          {(storageError || actionError) && (
            <div role="alert" className="notice">
              {storageError || actionError}
            </div>
          )}
          {loading ? (
            <div className="empty-state" role="status">
              지식을 불러오고 있습니다…
            </div>
          ) : error ? (
            <div className="empty-state" role="alert">
              <h2>지식을 불러오지 못했습니다.</h2>
              <p>{error}</p>
              <button className="primary-button" onClick={refresh}>
                다시 시도
              </button>
            </div>
          ) : protectedView && !admin ? (
            <div className="empty-state">관리자 권한이 필요합니다.</div>
          ) : (
            <>
              {currentView === "home" && <LearningHome />}
              {currentView === "topics" && <ArchitectureFlowViewer />}
              {currentView === "comparisons" && <ComparisonView />}
              {currentView === "glossary" && <GlossaryView />}
              {currentView === "checklists" && <ChecklistView />}
              {currentView === "learning" && <LearningNotebookView />}
              {currentView === "insights" && <Insights />}
              {currentView === "users" && <Users />}
              {currentView === "studio" && <Studio />}
              {currentView === "research" && <Research />}
            </>
          )}
        </main>
        <footer className="shell-footer">
          ArchDeck · 엔지니어의 지식과 판단을 연결합니다.
        </footer>
      </div>
      {mobile && (
        <div
          className="overlay mobile-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMobile(false);
          }}
        >
          <aside
            className="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="탐색 메뉴"
          >
            {nav(true)}
          </aside>
        </div>
      )}
      {search && (
        <CommandPalette isOpen={search} onClose={() => setSearch(false)} />
      )}
      {settings && <SettingsPanel close={() => setSettings(false)} />}
    </div>
  );
}
function Authenticated() {
  const { user, loading } = useAuth();
  if (loading) return <div className="empty-state">로그인 상태 확인 중…</div>;
  if (!user || user.mustChangePassword) return <Login />;
  return (
    <AppearanceProvider key={user.id}>
      <LearningProvider key={user.id}>
        <Shell />
      </LearningProvider>
    </AppearanceProvider>
  );
}
export function App() {
  return (
    <AuthProvider>
      <Authenticated />
    </AuthProvider>
  );
}
export default App;
