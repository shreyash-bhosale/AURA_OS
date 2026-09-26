/**
 * AURA Authentication Service
 * 
 * Powered by Supabase Auth with automatic session caching and profile hydration.
 * Strictly uses Supabase publishable/anon client.
 * 
 * Fallback mode is maintained for offline development when Supabase credentials
 * are being provisioned in .env.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient.js';

const CACHED_USER_KEY = 'aura_cached_auth_user_v2';
const FALLBACK_USERS_KEY = 'aura_fallback_users_v2';
const FALLBACK_SESSION_KEY = 'aura_fallback_session_v2';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCachedUser() {
  try {
    const raw = localStorage.getItem(CACHED_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCachedUser(user) {
  if (user) {
    localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CACHED_USER_KEY);
  }
}

function loadFallbackUsers() {
  try {
    return JSON.parse(localStorage.getItem(FALLBACK_USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveFallbackUsers(users) {
  localStorage.setItem(FALLBACK_USERS_KEY, JSON.stringify(users));
}

function loadFallbackSession() {
  try {
    const raw = localStorage.getItem(FALLBACK_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveFallbackSession(user) {
  localStorage.setItem(FALLBACK_SESSION_KEY, JSON.stringify(user));
  setCachedUser(user);
}

function clearFallbackSession() {
  localStorage.removeItem(FALLBACK_SESSION_KEY);
  setCachedUser(null);
}

// ─── Supabase Session Sync ───────────────────────────────────────────────────

let authInitialized = false;

export async function initAuth(onStateChangeCallback) {
  if (!isSupabaseConfigured() || !supabase) {
    return getCachedUser() || loadFallbackSession();
  }

  if (authInitialized) {
    return getCachedUser();
  }
  authInitialized = true;

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;

    if (session?.user) {
      const user = await hydrateUserFromProfile(session.user);
      setCachedUser(user);
    } else {
      setCachedUser(null);
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await hydrateUserFromProfile(session.user);
        setCachedUser(user);
        if (onStateChangeCallback) onStateChangeCallback(user, event);
      } else {
        setCachedUser(null);
        if (onStateChangeCallback) onStateChangeCallback(null, event);
      }
    });

    return getCachedUser();
  } catch (err) {
    console.warn('Supabase auth initialization notice:', err.message);
    return getCachedUser();
  }
}

async function hydrateUserFromProfile(sbUser) {
  if (!sbUser) return null;

  let profile = null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', sbUser.id)
      .maybeSingle();

    if (!error && data) {
      profile = data;
    }
  } catch {
    // If table not yet migrated or network hiccup, fallback to user metadata
  }

  const name = profile?.name ||
    sbUser.user_metadata?.name ||
    sbUser.user_metadata?.full_name ||
    sbUser.email?.split('@')[0] ||
    'Explorer';

  return {
    id: sbUser.id,
    email: sbUser.email,
    name,
    avatarUrl: profile?.avatar_url || sbUser.user_metadata?.avatar_url || null,
    onboardingCompleted: Boolean(profile?.onboarding_completed),
    roles: profile?.roles || [],
    goals: profile?.goals || [],
    primaryPriority: profile?.primary_priority || null,
    createdAt: sbUser.created_at
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns currently authenticated user synchronously from cache.
 */
export function getCurrentUser() {
  if (isSupabaseConfigured()) {
    return getCachedUser();
  }
  return loadFallbackSession();
}

/**
 * Returns true if a user session is active.
 */
export function isAuthenticated() {
  return getCurrentUser() !== null;
}

/**
 * Asynchronously fetch and refresh current user session from Supabase.
 */
export async function fetchCurrentUser() {
  if (!isSupabaseConfigured() || !supabase) {
    return getCurrentUser();
  }
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const hydrated = await hydrateUserFromProfile(user);
      setCachedUser(hydrated);
      return hydrated;
    }
    setCachedUser(null);
    return null;
  } catch {
    return getCurrentUser();
  }
}

/**
 * Sign up a new user.
 */
export async function signUp({ name, email, password, confirmPassword }) {
  if (!name || !name.trim()) return { error: 'Please enter your name.' };
  if (!email || !email.includes('@')) return { error: 'Please enter a valid email address.' };
  if (!password || password.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  // 1. Supabase Auth
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: cleanName,
            full_name: cleanName
          }
        }
      });

      if (error) return { error: error.message };

      if (data.user) {
        // Ensure profile record exists
        await supabase
          .from('profiles')
          .upsert({
            user_id: data.user.id,
            name: cleanName,
            onboarding_completed: false
          }, { onConflict: 'user_id' });

        // Ensure user_settings record exists
        await supabase
          .from('user_settings')
          .upsert({
            user_id: data.user.id
          }, { onConflict: 'user_id' });

        const hydrated = await hydrateUserFromProfile(data.user);
        setCachedUser(hydrated);
        return { user: hydrated };
      }

      return { error: 'Registration incomplete. Please try again.' };
    } catch (err) {
      return { error: err.message || 'Signup failed' };
    }
  }

  // 2. Local Fallback Mode (for initial local development without Supabase credentials)
  const users = loadFallbackUsers();
  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return { error: 'An account with this email already exists.' };
  }

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: cleanName,
    email: cleanEmail,
    password, // Fallback demo only
    onboardingCompleted: false,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveFallbackUsers(users);
  saveFallbackSession(newUser);

  return { user: newUser };
}

/**
 * Sign in existing user.
 */
export async function signIn({ email, password }) {
  if (!email || !email.includes('@')) return { error: 'Please enter a valid email address.' };
  if (!password) return { error: 'Please enter your password.' };

  const cleanEmail = email.trim().toLowerCase();

  // 1. Supabase Auth
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) return { error: error.message };

      if (data.user) {
        const hydrated = await hydrateUserFromProfile(data.user);
        setCachedUser(hydrated);
        return { user: hydrated };
      }
      return { error: 'Login failed. Please verify credentials.' };
    } catch (err) {
      return { error: err.message || 'Login failed' };
    }
  }

  // 2. Local Fallback Mode
  const users = loadFallbackUsers();
  const found = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
  if (!found) {
    return { error: 'Incorrect email or password.' };
  }

  saveFallbackSession(found);
  return { user: found };
}

/**
 * Sign in as a temporary Explorer / Demo account with ZERO fabricated progress.
 */
export async function signInAsDemo() {
  const demoUser = {
    id: `demo_${Date.now()}`,
    name: 'Explorer',
    email: 'demo@aura.local',
    onboardingCompleted: true,
    isDemo: true,
    createdAt: new Date().toISOString()
  };

  if (isSupabaseConfigured() && supabase) {
    // If Supabase is active, sign in anonymously or use fallback demo session
    setCachedUser(demoUser);
    return { user: demoUser };
  }

  saveFallbackSession(demoUser);
  return { user: demoUser };
}

/**
 * Sign out.
 */
export async function signOut() {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
  }
  clearFallbackSession();
}

/**
 * Mark onboarding as completed for a user.
 */
export async function markOnboardingComplete(userId) {
  const current = getCurrentUser();
  if (!current) return;

  const targetId = userId || current.id;
  current.onboardingCompleted = true;
  setCachedUser(current);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
        .eq('user_id', targetId);
    } catch (e) {
      console.warn('Failed to update onboarding state in Supabase:', e);
    }
  } else {
    const users = loadFallbackUsers();
    const idx = users.findIndex(u => u.id === targetId);
    if (idx !== -1) {
      users[idx].onboardingCompleted = true;
      saveFallbackUsers(users);
    }
    saveFallbackSession(current);
  }
}

/**
 * Update user's display name.
 */
export async function updateUserName(userId, newName) {
  if (!newName || !newName.trim()) return;
  const current = getCurrentUser();
  if (!current) return;

  const targetId = userId || current.id;
  current.name = newName.trim();
  setCachedUser(current);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('profiles')
        .update({ name: current.name, updated_at: new Date().toISOString() })
        .eq('user_id', targetId);

      await supabase.auth.updateUser({
        data: { name: current.name, full_name: current.name }
      });
    } catch (e) {
      console.warn('Failed to update name in Supabase:', e);
    }
  } else {
    const users = loadFallbackUsers();
    const idx = users.findIndex(u => u.id === targetId);
    if (idx !== -1) {
      users[idx].name = current.name;
      saveFallbackUsers(users);
    }
    saveFallbackSession(current);
  }
}
