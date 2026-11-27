import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  Topic,
  GlossaryTerm,
  ComparisonMatrix,
  ChecklistItem,
  UserLearningState,
} from "../types";
import { apiService } from "../services/apiClient";
import { useAuth } from "./AuthContext";
export type View =
  | "home"
  | "topics"
  | "comparisons"
  | "glossary"
  | "checklists"
  | "learning"
  | "insights"
  | "research"
  | "users"
  | "studio";
const Context = createContext<any>(null);
const blank = (): UserLearningState => ({
  bookmarks: [],
  completedTopics: [],
  notes: {},
  checklistProgress: {},
});
function valid(data: any): data is UserLearningState {
  return (
    data &&
    Array.isArray(data.bookmarks) &&
    data.bookmarks.every((x: any) => typeof x === "string") &&
    Array.isArray(data.completedTopics) &&
    data.completedTopics.every((x: any) => typeof x === "string") &&
    data.notes &&
    typeof data.notes === "object" &&
    !Array.isArray(data.notes) &&
    Object.values(data.notes).every((x) => typeof x === "string") &&
    data.checklistProgress &&
    typeof data.checklistProgress === "object" &&
    !Array.isArray(data.checklistProgress) &&
    Object.values(data.checklistProgress).every((x) => typeof x === "boolean")
  );
}
export function LearningProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const key = "archdeck:learning:v2:" + location.origin + ":" + user.id;
  const [state, setState] = useState<UserLearningState>(() => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || "null");
      return valid(data) ? data : blank();
    } catch {
      return blank();
    }
  });
  const [topics, setTopics] = useState<Topic[]>([]),
    [glossaryTerms, setGlossary] = useState<GlossaryTerm[]>([]),
    [comparisons, setComparisons] = useState<ComparisonMatrix[]>([]),
    [checklists, setChecklists] = useState<ChecklistItem[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [storageError, setStorageError] = useState("");
  const parts = () => location.pathname.split("/").filter(Boolean);
  const [currentView, updateView] = useState<View>(
    (parts()[0] as View) || "home",
  );
  const [activeTopicId, updateTopic] = useState(
    decodeURIComponent(parts()[1] || ""),
  );
  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const [a, b, c, d] = await Promise.all([
        apiService.getTopics(),
        apiService.getGlossary(),
        apiService.getComparisons(),
        apiService.getChecklists(),
      ]);
      setTopics(a);
      setGlossary(b);
      setComparisons(c);
      setChecklists(d);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    refresh();
    const pop = () => {
      updateView((parts()[0] as View) || "home");
      updateTopic(decodeURIComponent(parts()[1] || ""));
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      setStorageError(
        "이 브라우저에 기록을 저장할 수 없습니다. JSON 백업을 사용해 주세요.",
      );
    }
  }, [state, key]);
  const activeRef = useRef(activeTopicId);
  const setCurrentView = (view: View) => {
    updateView(view);
    const suffix =
      view === "topics" && activeRef.current
        ? "/" + encodeURIComponent(activeRef.current)
        : "";
    history.pushState({}, "", view === "home" ? "/" : "/" + view + suffix);
  };
  const setActiveTopicId = (id: string) => {
    activeRef.current = id;
    updateTopic(id);
    history.replaceState({}, "", "/topics/" + encodeURIComponent(id));
  };
  const toggle = (field: "bookmarks" | "completedTopics", id: string) =>
    setState((p) => ({
      ...p,
      [field]: p[field].includes(id)
        ? p[field].filter((v) => v !== id)
        : [...p[field], id],
    }));
  const addCustomTopic = async (item: Topic) => {
    try {
      await apiService.saveCustomTopic(item);
      await refresh();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    }
  };
  const addCustomGlossary = async (item: GlossaryTerm) => {
    try {
      await apiService.saveCustomGlossary(item);
      await refresh();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    }
  };
  const importDataJson = (text: string) => {
    try {
      const data = JSON.parse(text);
      if (!valid(data.userLearning)) return false;
      setState(data.userLearning);
      return true;
    } catch {
      return false;
    }
  };
  return (
    <Context.Provider
      value={{
        topics,
        glossaryTerms,
        comparisons,
        checklists,
        ...state,
        loading,
        error,
        storageError,
        refresh,
        isBackendConnected: !error,
        toggleBookmark: (id: string) => toggle("bookmarks", id),
        toggleCompleted: (id: string) => toggle("completedTopics", id),
        updateNote: (id: string, text: string) =>
          setState((p) => ({ ...p, notes: { ...p.notes, [id]: text } })),
        toggleChecklist: (id: string) =>
          setState((p) => ({
            ...p,
            checklistProgress: {
              ...p.checklistProgress,
              [id]: !p.checklistProgress[id],
            },
          })),
        addCustomTopic,
        addCustomGlossary,
        exportDataJson: () =>
          JSON.stringify(
            {
              version: 2,
              exportedAt: new Date().toISOString(),
              userLearning: state,
            },
            null,
            2,
          ),
        importDataJson,
        currentView,
        setCurrentView,
        activeTopicId,
        setActiveTopicId,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useLearning = () => useContext(Context);
