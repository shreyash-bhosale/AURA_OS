/**
 * AURA AI Service
 * Manages conversational AI interactions, contextual prompt generation,
 * and user-isolated message history.
 */

import { getCurrentUser } from './authService.js';
import { analyticsService } from './analyticsService.js';

const STORAGE_PREFIX = 'aura_ai_chats_v2_';

class AIService {
  getStorageKey(userId) {
    const id = userId || getCurrentUser()?.id || 'anonymous';
    return `${STORAGE_PREFIX}${id}`;
  }

  getConversations(userId) {
    try {
      const key = this.getStorageKey(userId);
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveConversations(userId, messages) {
    try {
      const key = this.getStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save AI conversation:', e);
    }
  }

  async sendMessage(userId, messageText, context = {}) {
    const user = getCurrentUser();
    const uId = userId || user?.id || 'anonymous';
    const history = this.getConversations(uId);

    const userMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      text: messageText,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...history, userMessage];
    this.saveConversations(uId, newHistory);
    analyticsService.track(uId, 'AI_QUERY', { length: messageText.length });

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          context,
          history: newHistory.slice(-8)
        })
      });

      const data = await res.json();
      const assistantMessage = {
        id: `msg_${Date.now()}_a`,
        role: 'assistant',
        text: data.reply || 'No response returned from assistant.',
        source: data.source || 'aura-engine',
        notice: data.notice || null,
        timestamp: new Date().toISOString()
      };

      const finalHistory = [...newHistory, assistantMessage];
      this.saveConversations(uId, finalHistory);

      return {
        success: true,
        message: assistantMessage,
        history: finalHistory
      };
    } catch (err) {
      const errorMsg = {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        text: `Network or dispatch error: ${err.message}`,
        isError: true,
        timestamp: new Date().toISOString()
      };
      const finalHistory = [...newHistory, errorMsg];
      this.saveConversations(uId, finalHistory);
      return { success: false, message: errorMsg, history: finalHistory };
    }
  }

  clearHistory(userId) {
    const uId = userId || getCurrentUser()?.id || 'anonymous';
    const key = this.getStorageKey(uId);
    localStorage.removeItem(key);
    return [];
  }
}

export const aiService = new AIService();
