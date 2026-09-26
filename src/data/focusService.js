/**
 * AURA Focus Service
 * 
 * Manages focus sessions with Supabase `focus_sessions` table.
 * Strictly starts at 0 sessions for new users.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { getCurrentUser } from './authService.js';
import { analyticsService } from './analyticsService.js';

const FOCUS_CACHE_KEY = 'aura_focus_sessions_cache_v3_';

class FocusService {
  getCacheKey(userId) {
    const id = userId || getCurrentUser()?.id || 'anonymous';
    return `${FOCUS_CACHE_KEY}${id}`;
  }

  getSessions(userId) {
    try {
      const raw = localStorage.getItem(this.getCacheKey(userId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveSessions(userId, sessions) {
    try {
      localStorage.setItem(this.getCacheKey(userId), JSON.stringify(sessions));
    } catch (e) {
      console.warn('FocusService cache save notice:', e);
    }
  }

  async createFocusSession(userId, { durationSeconds, sessionType = 'focus', completed = true }) {
    const user = getCurrentUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) return null;

    const sessionObj = {
      id: `foc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: targetUserId,
      durationSeconds,
      startedAt: new Date(Date.now() - durationSeconds * 1000).toISOString(),
      endedAt: new Date().toISOString(),
      completed,
      sessionType,
      createdAt: new Date().toISOString()
    };

    const current = this.getSessions(targetUserId);
    current.unshift(sessionObj);
    this.saveSessions(targetUserId, current);

    // Persist to Supabase DB
    if (isSupabaseConfigured() && supabase && !targetUserId.startsWith('usr_') && !targetUserId.startsWith('demo_') && targetUserId !== 'anonymous') {
      try {
        await supabase.from('focus_sessions').insert({
          user_id: targetUserId,
          duration_seconds: durationSeconds,
          started_at: sessionObj.startedAt,
          ended_at: sessionObj.endedAt,
          completed,
          session_type: sessionType
        });
      } catch (err) {
        console.warn('FocusService DB insert notice:', err.message);
      }
    }

    analyticsService.track(targetUserId, 'FOCUS_SESSION_COMPLETED', {
      durationMinutes: Math.round(durationSeconds / 60),
      sessionType
    });

    return sessionObj;
  }
}

export const focusService = new FocusService();
