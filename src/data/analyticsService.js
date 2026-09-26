/**
 * AURA Analytics Service & Telemetry Engine
 * 
 * Powered by Supabase `activity_events` table with RLS isolation.
 * Computes strictly derived metrics from real user actions.
 * Brand new accounts start with ZERO across all metrics.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { getCurrentUser } from './authService.js';

const EVENTS_CACHE_PREFIX = 'aura_analytics_events_cache_v3_';

class AnalyticsService {
  getStorageKey(userId) {
    const id = userId || getCurrentUser()?.id || 'anonymous';
    return `${EVENTS_CACHE_PREFIX}${id}`;
  }

  getEvents(userId) {
    try {
      const key = this.getStorageKey(userId);
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveEvents(userId, events) {
    try {
      const key = this.getStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(events));
    } catch (e) {
      console.warn('Analytics cache save notice:', e);
    }
  }

  /**
   * Track telemetry event.
   * Persists to Supabase `activity_events` table and local cache.
   */
  async track(userId, eventName, metadata = {}) {
    const user = getCurrentUser();
    const uId = userId || user?.id || 'anonymous';
    const events = this.getEvents(uId);

    const event = {
      id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: eventName,
      timestamp: new Date().toISOString(),
      metadata
    };

    const updated = [event, ...events].slice(0, 500);
    this.saveEvents(uId, updated);

    // Persist to Supabase if configured and user is authenticated
    if (isSupabaseConfigured() && supabase && uId && !uId.startsWith('usr_') && !uId.startsWith('demo_') && uId !== 'anonymous') {
      try {
        await supabase.from('activity_events').insert({
          user_id: uId,
          event_type: eventName,
          metadata
        });
      } catch (err) {
        console.warn('Supabase activity_event sync notice:', err.message);
      }
    }

    return event;
  }

  /**
   * Derive live metrics from actual event history.
   * Starts strictly at 0 for accounts with no activity.
   */
  getUserMetrics(userId) {
    const uId = userId || getCurrentUser()?.id || 'anonymous';
    const events = this.getEvents(uId);

    let focusMinutesTotal = 0;
    let focusSessionsCount = 0;
    let codingSessionsCount = 0;
    let questionsSolvedCount = 0;
    let questionsAttemptedCount = 0;
    let topicsCompletedCount = 0;
    let projectsCompletedCount = 0;
    let aiQueriesCount = 0;
    let githubSyncCount = 0;

    events.forEach(ev => {
      switch (ev.name) {
        case 'FOCUS_SESSION_COMPLETED':
          focusSessionsCount++;
          focusMinutesTotal += (ev.metadata?.durationMinutes || 25);
          break;
        case 'CODE_EXECUTED':
        case 'CODING_SESSION_STARTED':
          codingSessionsCount++;
          break;
        case 'QUESTION_SOLVED':
          questionsSolvedCount++;
          break;
        case 'QUESTION_ATTEMPTED':
          questionsAttemptedCount++;
          break;
        case 'LEARNING_TOPIC_COMPLETED':
          topicsCompletedCount++;
          break;
        case 'PROJECT_COMPLETED':
          projectsCompletedCount++;
          break;
        case 'AI_QUERY':
          aiQueriesCount++;
          break;
        case 'GITHUB_SYNC':
        case 'PROJECT_IMPORTED':
          githubSyncCount++;
          break;
        default:
          break;
      }
    });

    const hoursTracked = (focusMinutesTotal / 60).toFixed(1);

    return {
      hoursTracked: Number(hoursTracked),
      focusMinutesTotal,
      focusSessionsCount,
      codingSessionsCount,
      questionsSolvedCount,
      questionsAttemptedCount,
      topicsCompletedCount,
      projectsCompletedCount,
      aiQueriesCount,
      githubSyncCount,
      totalEvents: events.length
    };
  }

  /**
   * Asynchronously sync events from Supabase `activity_events` table.
   */
  async fetchEvents(userId) {
    const user = getCurrentUser();
    const uId = userId || user?.id;
    if (!uId || !isSupabaseConfigured() || !supabase) {
      return this.getEvents(uId);
    }

    try {
      const { data, error } = await supabase
        .from('activity_events')
        .select('*')
        .eq('user_id', uId)
        .order('created_at', { ascending: false })
        .limit(200);

      if (!error && data) {
        const mapped = data.map(d => ({
          id: d.id,
          name: d.event_type,
          timestamp: d.created_at,
          metadata: d.metadata || {}
        }));
        this.saveEvents(uId, mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('fetchEvents notice:', err.message);
    }
    return this.getEvents(uId);
  }
}

export const analyticsService = new AnalyticsService();
