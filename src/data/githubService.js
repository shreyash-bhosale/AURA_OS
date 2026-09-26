/**
 * AURA GitHub Integration Service
 * 
 * Manages GitHub account authorization, repository discovery,
 * and project activity synchronization with Supabase persistence.
 * 
 * Tables:
 * - github_connections
 * - github_repositories
 * 
 * CRITICAL RULE:
 * Deleting an AURA project NEVER deletes the external GitHub repository.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { getCurrentUser } from './authService.js';
import { analyticsService } from './analyticsService.js';
import { projectStore } from './projectStore.js';

const STORAGE_PREFIX = 'aura_github_conn_v3_';

class GitHubService {
  getStorageKey(userId) {
    const id = userId || getCurrentUser()?.id || 'anonymous';
    return `${STORAGE_PREFIX}${id}`;
  }

  getConnection(userId) {
    try {
      const key = this.getStorageKey(userId);
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
      return {
        status: 'Disconnected',
        username: null,
        token: null,
        connectedAt: null,
        lastSyncedAt: null,
        discoveredRepos: []
      };
    } catch {
      return { status: 'Disconnected', username: null, token: null, discoveredRepos: [] };
    }
  }

  saveConnection(userId, data) {
    try {
      const key = this.getStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save GitHub connection:', e);
    }
  }

  /**
   * Connect with GitHub username or personal access token
   */
  async connectGitHub(userId, { username, token }) {
    const user = getCurrentUser();
    const uId = userId || user?.id || 'anonymous';

    try {
      // Test credentials with server proxy
      const res = await fetch('/api/github/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username?.trim(), token: token?.trim() })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to connect to GitHub.');
      }

      const updated = {
        status: 'Connected',
        username: username || 'GitHub User',
        token: token ? token.trim() : null,
        connectedAt: new Date().toISOString(),
        lastSyncedAt: new Date().toISOString(),
        discoveredRepos: data.repositories || []
      };

      this.saveConnection(uId, updated);

      // Persist to Supabase DB if authenticated
      if (isSupabaseConfigured() && supabase && !uId.startsWith('usr_') && !uId.startsWith('demo_') && uId !== 'anonymous') {
        try {
          await supabase.from('github_connections').upsert({
            user_id: uId,
            github_username: updated.username,
            status: 'connected',
            last_synced_at: updated.lastSyncedAt
          }, { onConflict: 'user_id' });

          // Sync discovered repositories
          if (Array.isArray(data.repositories)) {
            for (const repo of data.repositories) {
              await supabase.from('github_repositories').upsert({
                user_id: uId,
                github_repository_id: String(repo.id || repo.name),
                owner: repo.owner || updated.username,
                name: repo.name,
                description: repo.description || '',
                url: repo.url || repo.html_url || '',
                default_branch: repo.defaultBranch || 'main',
                primary_language: repo.primaryLanguage || repo.language || 'Unknown',
                stars: repo.stars || repo.stargazers_count || 0,
                forks: repo.forks || 0,
                open_issues: repo.openIssues || repo.open_issues_count || 0,
                private: Boolean(repo.private),
                last_updated_at: repo.updatedAt || new Date().toISOString(),
                last_synced_at: new Date().toISOString()
              }, { onConflict: 'user_id,github_repository_id' });
            }
          }
        } catch (dbErr) {
          console.warn('GitHub DB sync notice:', dbErr.message);
        }
      }

      analyticsService.track(uId, 'GITHUB_SYNC', { username: updated.username, count: data.repositories?.length || 0 });

      return { success: true, connection: updated, repositories: data.repositories || [] };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Refresh/Fetch user's repositories from GitHub
   */
  async fetchRepositories(userId) {
    const user = getCurrentUser();
    const uId = userId || user?.id || 'anonymous';
    const conn = this.getConnection(uId);

    if (conn.status !== 'Connected' && !conn.username && !conn.token) {
      return { success: false, error: 'GitHub is not connected.' };
    }

    try {
      const res = await fetch('/api/github/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: conn.username, token: conn.token })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch repositories.');
      }

      conn.discoveredRepos = data.repositories || [];
      conn.lastSyncedAt = new Date().toISOString();
      this.saveConnection(uId, conn);

      return { success: true, repositories: data.repositories || [] };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Disconnect GitHub account
   */
  disconnectGitHub(userId) {
    const uId = userId || getCurrentUser()?.id || 'anonymous';
    const key = this.getStorageKey(uId);
    localStorage.removeItem(key);

    if (isSupabaseConfigured() && supabase && !uId.startsWith('usr_') && !uId.startsWith('demo_') && uId !== 'anonymous') {
      supabase.from('github_connections').delete().eq('user_id', uId).then(() => {});
    }
  }
}

export const githubService = new GitHubService();
