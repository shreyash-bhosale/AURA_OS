/**
 * AURA Conversation Service
 * 
 * Manages user AI conversations and messages.
 * Source of truth: `conversations` and `messages` Supabase tables with RLS.
 * Brand new users start with strictly 0 conversations.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { getCurrentUser } from './authService.js';
import { analyticsService } from './analyticsService.js';

const CONV_CACHE_KEY = 'aura_conversations_cache_v3_';

class ConversationService {
  getCacheKey(userId) {
    const id = userId || getCurrentUser()?.id || 'anonymous';
    return `${CONV_CACHE_KEY}${id}`;
  }

  getConversations(userId) {
    try {
      const raw = localStorage.getItem(this.getCacheKey(userId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveConversations(userId, convs) {
    try {
      localStorage.setItem(this.getCacheKey(userId), JSON.stringify(convs));
    } catch (e) {
      console.warn('ConversationService cache save notice:', e);
    }
  }

  async fetchConversations(userId) {
    const user = getCurrentUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) return [];

    if (isSupabaseConfigured() && supabase && !targetUserId.startsWith('usr_') && !targetUserId.startsWith('demo_')) {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*, messages (*)')
          .eq('user_id', targetUserId)
          .order('updated_at', { ascending: false });

        if (!error && data) {
          this.saveConversations(targetUserId, data);
          return data;
        }
      } catch (err) {
        console.warn('ConversationService fetch notice:', err.message);
      }
    }

    return this.getConversations(targetUserId);
  }

  async createConversation(userId, title = 'New Conversation') {
    const user = getCurrentUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) return null;

    if (isSupabaseConfigured() && supabase && !targetUserId.startsWith('usr_') && !targetUserId.startsWith('demo_')) {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .insert({ user_id: targetUserId, title })
          .select()
          .single();

        if (!error && data) return data;
      } catch (err) {
        console.warn('ConversationService DB create notice:', err.message);
      }
    }

    const conv = {
      id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: targetUserId,
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const current = this.getConversations(targetUserId);
    current.unshift(conv);
    this.saveConversations(targetUserId, current);
    return conv;
  }

  async addMessage(userId, conversationId, { role, content, metadata = {} }) {
    const user = getCurrentUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId || !conversationId) return null;

    if (isSupabaseConfigured() && supabase && !targetUserId.startsWith('usr_') && !targetUserId.startsWith('demo_')) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            user_id: targetUserId,
            role,
            content,
            metadata
          })
          .select()
          .single();

        if (!error && data) {
          analyticsService.track(targetUserId, 'AI_QUERY', { conversationId });
          return data;
        }
      } catch (err) {
        console.warn('ConversationService DB addMessage notice:', err.message);
      }
    }

    const msg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      conversationId,
      userId: targetUserId,
      role,
      content,
      metadata,
      createdAt: new Date().toISOString()
    };

    analyticsService.track(targetUserId, 'AI_QUERY', { conversationId });
    return msg;
  }
}

export const conversationService = new ConversationService();
