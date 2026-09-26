/**
 * AURA Profile Service
 * 
 * Manages user profile data (roles, goals, experience levels, priorities).
 * Source of truth: Supabase `profiles` table with RLS (auth.uid() = user_id).
 */

import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { getCurrentUser } from './authService.js';

const FALLBACK_PROFILE_KEY = 'aura_fallback_profile_v2_';

class ProfileService {
  async getProfile(userId) {
    const user = getCurrentUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) return null;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', targetUserId)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          return {
            id: data.id,
            userId: data.user_id,
            name: data.name || user?.name || 'Explorer',
            avatarUrl: data.avatar_url || null,
            roles: data.roles || [],
            goals: data.goals || [],
            primaryPriority: data.primary_priority || null,
            experienceLevels: data.experience_levels || {},
            organizationStyle: data.organization_style || null,
            onboardingCompleted: Boolean(data.onboarding_completed),
            createdAt: data.created_at,
            updatedAt: data.updated_at
          };
        }
      } catch (err) {
        console.warn('ProfileService getProfile notice:', err.message);
      }
    }

    // Fallback mode
    try {
      const raw = localStorage.getItem(`${FALLBACK_PROFILE_KEY}${targetUserId}`);
      if (raw) return JSON.parse(raw);
    } catch {}

    return {
      userId: targetUserId,
      name: user?.name || 'Explorer',
      avatarUrl: null,
      roles: user?.roles || [],
      goals: user?.goals || [],
      primaryPriority: null,
      experienceLevels: {},
      organizationStyle: null,
      onboardingCompleted: Boolean(user?.onboardingCompleted),
      createdAt: new Date().toISOString()
    };
  }

  async updateProfile(userId, updates) {
    const user = getCurrentUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) return null;

    const payload = {
      name: updates.name,
      avatar_url: updates.avatarUrl,
      roles: updates.roles,
      goals: updates.goals,
      primary_priority: updates.primaryPriority,
      experience_levels: updates.experienceLevels,
      organization_style: updates.organizationStyle,
      onboarding_completed: updates.onboardingCompleted,
      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert({ user_id: targetUserId, ...payload }, { onConflict: 'user_id' })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('ProfileService updateProfile notice:', err.message);
      }
    }

    // Local fallback update
    const current = await this.getProfile(targetUserId);
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(`${FALLBACK_PROFILE_KEY}${targetUserId}`, JSON.stringify(updated));
    return updated;
  }
}

export const profileService = new ProfileService();
