/**
 * AURA Learning Store & Evaluation Adapter
 * 
 * Provides unified interface to LearningService.
 * Strictly calculates dynamic progress from verified question evaluations.
 * Brand new user accounts start strictly at 0% with no completed topics.
 */

import { getCurrentUser } from './authService.js';
import { learningService } from './learningService.js';
import { PYTHON_FALLBACK_CURRICULUM } from './curriculumData.js';

export const PYTHON_CURRICULUM = PYTHON_FALLBACK_CURRICULUM;

const CACHE_PREFIX = 'aura_user_learning_cache_v3_';

class LearningStore {
  getStorageKey(userId) {
    const id = userId || getCurrentUser()?.id || 'anonymous';
    return `${CACHE_PREFIX}${id}`;
  }

  getLocalData(userId) {
    try {
      const key = this.getStorageKey(userId);
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      completedTopicIds: [],
      attempts: {},
      lastActivity: null
    };
  }

  saveLocalData(userId, data) {
    try {
      const key = this.getStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('LearningStore local save notice:', e);
    }
  }

  /**
   * Synchronous progress lookup for fast rendering.
   * Brand new users return strictly 0% and 0 count.
   */
  getProgress(userId) {
    const user = getCurrentUser();
    const targetId = userId || user?.id || 'anonymous';
    const data = this.getLocalData(targetId);
    const total = PYTHON_CURRICULUM.length;
    const completed = (data.completedTopicIds || []).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      percentage,
      completedCount: completed,
      totalCount: total,
      completedTopicIds: data.completedTopicIds || [],
      attempts: data.attempts || {}
    };
  }

  /**
   * Asynchronous progress sync with Supabase database.
   */
  async fetchProgress(userId) {
    const user = getCurrentUser();
    const targetId = userId || user?.id;
    if (!targetId) return this.getProgress();

    const progress = await learningService.getSubjectProgress(targetId, 'python');
    this.saveLocalData(targetId, {
      completedTopicIds: progress.completedTopicIds,
      attempts: progress.attempts,
      lastActivity: new Date().toISOString()
    });
    return progress;
  }

  /**
   * Evaluates an answer to a topic question.
   * Only correct answers complete a topic and increment progress.
   */
  async submitAnswer(userId, topicId, selectedIndex) {
    const user = getCurrentUser();
    const targetId = userId || user?.id || 'anonymous';

    const result = await learningService.submitAnswer(targetId, topicId, selectedIndex);
    if (result.error) return result;

    // Sync local cache
    const current = this.getLocalData(targetId);
    if (!current.attempts[topicId]) {
      current.attempts[topicId] = { attempts: 0, passed: false };
    }
    current.attempts[topicId].attempts += 1;
    if (result.isCorrect) {
      current.attempts[topicId].passed = true;
      if (!current.completedTopicIds.includes(topicId)) {
        current.completedTopicIds.push(topicId);
      }
    }
    current.lastActivity = new Date().toISOString();
    this.saveLocalData(targetId, current);

    return {
      ...result,
      progress: this.getProgress(targetId)
    };
  }

  resetProgress(userId) {
    const targetId = userId || getCurrentUser()?.id || 'anonymous';
    this.saveLocalData(targetId, {
      completedTopicIds: [],
      attempts: {},
      lastActivity: null
    });
  }
}

export const learningStore = new LearningStore();
