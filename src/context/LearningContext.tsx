import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Topic, GlossaryTerm, ChecklistItem, ComparisonMatrix, UserLearningState } from '../types';
import { initialTopics, initialGlossaryTerms, initialChecklists, initialComparisons } from '../data';
import { apiService } from '../services/apiClient';

interface LearningContextType {
  topics: Topic[];
  glossaryTerms: GlossaryTerm[];
  comparisons: ComparisonMatrix[];
  checklists: ChecklistItem[];
  bookmarks: string[];
  completedTopics: string[];
  notes: Record<string, string>;
  checklistProgress: Record<string, boolean>;
  isBackendConnected: boolean;
  toggleBookmark: (topicId: string) => void;
  toggleCompleted: (topicId: string) => void;
  updateNote: (topicId: string, noteText: string) => void;
  toggleChecklist: (checklistId: string) => void;
  addCustomTopic: (topic: Topic) => Promise<boolean>;
  addCustomGlossary: (term: GlossaryTerm) => Promise<boolean>;
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => boolean;
  activeTopicId: string;
  setActiveTopicId: (id: string) => void;
  currentView: 'home' | 'topics' | 'comparisons' | 'glossary' | 'checklists' | 'learning';
  setCurrentView: (view: 'home' | 'topics' | 'comparisons' | 'glossary' | 'checklists' | 'learning') => void;
}

const STORAGE_KEY = 'archdeck_user_learning_v1';
const CUSTOM_TOPICS_KEY = 'archdeck_custom_topics_v1';
const CUSTOM_GLOSSARY_KEY = 'archdeck_custom_glossary_v1';

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>(initialGlossaryTerms);
  const [comparisons] = useState<ComparisonMatrix[]>(initialComparisons);
  const [checklists] = useState<ChecklistItem[]>(initialChecklists);
  
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [checklistProgress, setChecklistProgress] = useState<Record<string, boolean>>({});
  
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [activeTopicId, setActiveTopicId] = useState<string>('keycloak-iam-overview');
  const [currentView, setCurrentView] = useState<'home' | 'topics' | 'comparisons' | 'glossary' | 'checklists' | 'learning'>('home');

  // Load from local storage and remote API on mount
  useEffect(() => {
    // 1. Local Storage First
    try {
      const savedLearning = localStorage.getItem(STORAGE_KEY);
      if (savedLearning) {
        const parsed: UserLearningState = JSON.parse(savedLearning);
        setBookmarks(parsed.bookmarks || []);
        setCompletedTopics(parsed.completedTopics || []);
        setNotes(parsed.notes || {});
        setChecklistProgress(parsed.checklistProgress || {});
      }

      const savedCustomTopics = localStorage.getItem(CUSTOM_TOPICS_KEY);
      if (savedCustomTopics) {
        const parsedTopics: Topic[] = JSON.parse(savedCustomTopics);
        setTopics([...initialTopics, ...parsedTopics]);
      }

      const savedCustomGlossary = localStorage.getItem(CUSTOM_GLOSSARY_KEY);
      if (savedCustomGlossary) {
        const parsedGlossary: GlossaryTerm[] = JSON.parse(savedCustomGlossary);
        setGlossaryTerms([...initialGlossaryTerms, ...parsedGlossary]);
      }
    } catch (e) {
      console.warn('로컬 스토리지 파싱 에러:', e);
    }

    // 2. Remote Backend Check
    apiService.checkHealth().then(isOk => {
      setIsBackendConnected(isOk);
      if (isOk) {
        apiService.getUserState().then(remoteState => {
          if (remoteState) {
            setBookmarks(remoteState.bookmarks || []);
            setCompletedTopics(remoteState.completedTopics || []);
            setNotes(remoteState.notes || {});
            setChecklistProgress(remoteState.checklistProgress || {});
          }
        });

        apiService.getTopics().then(remoteTopics => {
          if (remoteTopics && remoteTopics.length > 0) {
            setTopics(remoteTopics);
          }
        });

        apiService.getGlossary().then(remoteGlossary => {
          if (remoteGlossary && remoteGlossary.length > 0) {
            setGlossaryTerms(remoteGlossary);
          }
        });
      }
    });
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    const state: UserLearningState = {
      bookmarks,
      completedTopics,
      notes,
      checklistProgress
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('로컬 스토리지 저장 실패:', e);
    }

    if (isBackendConnected) {
      apiService.syncUserState(state);
    }
  }, [bookmarks, completedTopics, notes, checklistProgress, isBackendConnected]);

  const toggleBookmark = (topicId: string) => {
    setBookmarks(prev => 
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
    );
  };

  const toggleCompleted = (topicId: string) => {
    setCompletedTopics(prev => 
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
    );
  };

  const updateNote = (topicId: string, noteText: string) => {
    setNotes(prev => ({
      ...prev,
      [topicId]: noteText
    }));
  };

  const toggleChecklist = (checklistId: string) => {
    setChecklistProgress(prev => ({
      ...prev,
      [checklistId]: !prev[checklistId]
    }));
  };

  const addCustomTopic = async (newTopic: Topic): Promise<boolean> => {
    setTopics(prev => [newTopic, ...prev]);
    try {
      const customOnly = topics.filter(t => !initialTopics.some(it => it.id === t.id));
      localStorage.setItem(CUSTOM_TOPICS_KEY, JSON.stringify([...customOnly, newTopic]));
    } catch (e) {
      console.warn(e);
    }

    if (isBackendConnected) {
      await apiService.saveCustomTopic(newTopic);
    }
    return true;
  };

  const addCustomGlossary = async (newTerm: GlossaryTerm): Promise<boolean> => {
    setGlossaryTerms(prev => [newTerm, ...prev]);
    try {
      const customOnly = glossaryTerms.filter(g => !initialGlossaryTerms.some(ig => ig.id === g.id));
      localStorage.setItem(CUSTOM_GLOSSARY_KEY, JSON.stringify([...customOnly, newTerm]));
    } catch (e) {
      console.warn(e);
    }

    if (isBackendConnected) {
      await apiService.saveCustomGlossary(newTerm);
    }
    return true;
  };

  const exportDataJson = (): string => {
    const exportObject = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      userLearning: {
        bookmarks,
        completedTopics,
        notes,
        checklistProgress
      },
      customTopics: topics.filter(t => !initialTopics.some(it => it.id === t.id)),
      customGlossary: glossaryTerms.filter(g => !initialGlossaryTerms.some(ig => ig.id === g.id))
    };
    return JSON.stringify(exportObject, null, 2);
  };

  const importDataJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.userLearning) {
        setBookmarks(data.userLearning.bookmarks || []);
        setCompletedTopics(data.userLearning.completedTopics || []);
        setNotes(data.userLearning.notes || {});
        setChecklistProgress(data.userLearning.checklistProgress || {});
      }
      if (Array.isArray(data.customTopics)) {
        setTopics([...initialTopics, ...data.customTopics]);
        localStorage.setItem(CUSTOM_TOPICS_KEY, JSON.stringify(data.customTopics));
      }
      if (Array.isArray(data.customGlossary)) {
        setGlossaryTerms([...initialGlossaryTerms, ...data.customGlossary]);
        localStorage.setItem(CUSTOM_GLOSSARY_KEY, JSON.stringify(data.customGlossary));
      }
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  return (
    <LearningContext.Provider
      value={{
        topics,
        glossaryTerms,
        comparisons,
        checklists,
        bookmarks,
        completedTopics,
        notes,
        checklistProgress,
        isBackendConnected,
        toggleBookmark,
        toggleCompleted,
        updateNote,
        toggleChecklist,
        addCustomTopic,
        addCustomGlossary,
        exportDataJson,
        importDataJson,
        activeTopicId,
        setActiveTopicId,
        currentView,
        setCurrentView
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};
