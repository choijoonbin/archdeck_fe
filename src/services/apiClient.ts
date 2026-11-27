import { Topic, ComparisonMatrix, GlossaryTerm, ChecklistItem, UserLearningState } from '../types';
import { initialTopics, initialComparisons, initialGlossaryTerms, initialChecklists } from '../data';

const API_BASE = '/api';

class ApiService {
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  async getTopics(): Promise<Topic[]> {
    try {
      const res = await fetch(`${API_BASE}/topics`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        return data.length ? data : initialTopics;
      }
    } catch {
      // Fallback
    }
    return initialTopics;
  }

  async getTopicById(id: string): Promise<Topic | null> {
    const topics = await this.getTopics();
    return topics.find(t => t.id === id || t.slug === id) || null;
  }

  async getComparisons(): Promise<ComparisonMatrix[]> {
    try {
      const res = await fetch(`${API_BASE}/comparisons`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        return data.length ? data : initialComparisons;
      }
    } catch {
      // Fallback
    }
    return initialComparisons;
  }

  async getGlossary(): Promise<GlossaryTerm[]> {
    try {
      const res = await fetch(`${API_BASE}/glossary`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        return data.length ? data : initialGlossaryTerms;
      }
    } catch {
      // Fallback
    }
    return initialGlossaryTerms;
  }

  async getChecklists(): Promise<ChecklistItem[]> {
    try {
      const res = await fetch(`${API_BASE}/checklists`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        return data.length ? data : initialChecklists;
      }
    } catch {
      // Fallback
    }
    return initialChecklists;
  }

  async getUserState(): Promise<UserLearningState | null> {
    try {
      const res = await fetch(`${API_BASE}/user/learning`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) return await res.json();
    } catch {
      // Fallback to localStorage handled in context
    }
    return null;
  }

  async syncUserState(state: UserLearningState): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/user/learning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
        signal: AbortSignal.timeout(2500)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async saveCustomTopic(topic: Topic): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topic),
        signal: AbortSignal.timeout(2500)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async saveCustomGlossary(term: GlossaryTerm): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/glossary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(term),
        signal: AbortSignal.timeout(2500)
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
