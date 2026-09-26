/**
 * AURA Settings Service
 * 
 * Manages user preferences and settings.
 * Source of truth: Supabase `user_settings` table with RLS.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { getCurrentUser } from './authService.js';

const FALLBACK_SETTINGS_KEY = 'aura_fallback_settings_v2_';

const DEFAULT_SETTINGS = {
  theme: 'dark',
  focusDuration: 25,
  workingTime: 'Flexible',
  personalizationEnabled: true,
  aiContextEnabled: true,
  analyticsEnabled: true,
  githubSyncEnabled: true
};

class SettingsService {
  async getSettings(userId) {
    const user = getCurrentUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) return { ...DEFAULT_SETTINGS };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', targetUserId)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          return {
            id: data.id,
            userId: data.user_id,
            theme: data.theme || 'dark',
            focusDuration: data.focus_duration || 25,
            workingTime: data.working_time || 'Flexible',
            personalizationEnabled: data.personalization_enabled ?? true,
            aiContextEnabled: data.ai_context_enabled ?? true,
            analyticsEnabled: data.analytics_enabled ?? true,
            githubSyncEnabled: data.github_sync_enabled ?? true,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          };
        }
      } catch (err) {
        console.warn('SettingsService getSettings notice:', err.message);
      }
    }

    try {
      const raw = localStorage.getItem(`${FALLBACK_SETTINGS_KEY}${targetUserId}`);
      if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {}

    return { ...DEFAULT_SETTINGS, userId: targetUserId };
  }

  async updateSettings(userId, updates) {
    const user = getCurrentUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) return null;

    const payload = {
      theme: updates.theme,
      focus_duration: updates.focusDuration,
      working_time: updates.workingTime,
      personalization_enabled: updates.personalizationEnabled,
      ai_context_enabled: updates.aiContextEnabled,
      analytics_enabled: updates.analyticsEnabled,
      github_sync_enabled: updates.githubSyncEnabled,
      updated_at: new Date().toISOString()
    };

    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .upsert({ user_id: targetUserId, ...payload }, { onConflict: 'user_id' })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('SettingsService updateSettings notice:', err.message);
      }
    }

    const current = await this.getSettings(targetUserId);
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(`${FALLBACK_SETTINGS_KEY}${targetUserId}`, JSON.stringify(updated));
    return updated;
  }
}

export const settingsService = new SettingsService();
