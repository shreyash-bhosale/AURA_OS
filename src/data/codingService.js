/**
 * AURA Coding Service
 * 
 * Manages coding sessions and code snippets with Supabase DB.
 * Source of truth: `coding_sessions` and `code_snippets` tables.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { getCurrentUser } from './authService.js';
import { analyticsService } from './analyticsService.js';

const CODING_CACHE_KEY = 'aura_coding_sessions_cache_v3_';
const SNIPPETS_CACHE_KEY = 'aura_code_snippets_cache_v3_';

class CodingService {
  async recordCodingSession(userId, { projectId = null, language = 'python', durationSeconds = 0 }) {
    const user = getCurrentUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) return null;

    const sessionObj = {
      id: `cs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: targetUserId,
      projectId,
      language,
      startedAt: new Date(Date.now() - durationSeconds * 1000).toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase && !targetUserId.startsWith('usr_') && !targetUserId.startsWith('demo_')) {
      try {
        await supabase.from('coding_sessions').insert({
          user_id: targetUserId,
          project_id: projectId,
          language,
          started_at: sessionObj.startedAt,
          ended_at: sessionObj.endedAt,
          duration_seconds: durationSeconds
        });
      } catch (err) {
        console.warn('CodingService DB session notice:', err.message);
      }
    }

    analyticsService.track(targetUserId, 'CODE_EXECUTED', { language, durationSeconds });
    return sessionObj;
  }

  async saveSnippet(userId, { projectId = null, title, language = 'python', code }) {
    const user = getCurrentUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) return null;

    const snippetObj = {
      id: `snip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: targetUserId,
      projectId,
      title: title || 'Untitled Snippet',
      language,
      code,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase && !targetUserId.startsWith('usr_') && !targetUserId.startsWith('demo_')) {
      try {
        const { data, error } = await supabase.from('code_snippets').insert({
          user_id: targetUserId,
          project_id: projectId,
          title: snippetObj.title,
          language,
          code
        }).select().single();

        if (!error && data) return data;
      } catch (err) {
        console.warn('CodingService DB snippet notice:', err.message);
      }
    }

    try {
      const key = `${SNIPPETS_CACHE_KEY}${targetUserId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.unshift(snippetObj);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}

    return snippetObj;
  }
}

export const codingService = new CodingService();
