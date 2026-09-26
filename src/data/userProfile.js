/**
 * AURA User Profile Store
 * Centralized personalization layer.
 * Stores user roles, goals, modules, preferences, and workspace config.
 * Persists to localStorage keyed by user ID.
 */

import { profileService } from './profileService.js';
import { settingsService } from './settingsService.js';

const PROFILE_KEY_PREFIX = 'aura_profile_v1_';

// ─── Default Profile Template ─────────────────────────────────────────────────

const DEFAULT_PROFILE = {
  id: null,
  name: '',
  email: '',
  avatar: null,

  // Onboarding answers
  roles: [],              // e.g. ['Student', 'Developer']
  goals: [],              // e.g. ['Learn new skills', 'Build projects']
  modules: [],            // e.g. ['Learning', 'Projects', 'Tasks']
  experienceLevels: {},   // e.g. { coding: 'Intermediate', design: 'Beginner' }
  primaryPriority: null,  // e.g. 'Learning'
  organizationStyle: null,// e.g. 'Kanban board'

  preferences: {
    theme: 'dark',        // 'dark' | 'light' | 'system'
    focusDuration: 25,    // minutes
    workingTime: 'Flexible'
  },

  // Dashboard
  dashboardOrder: [],     // ordered list of module keys visible on dashboard
  hiddenWidgets: [],

  onboardingCompleted: false,
  isDemo: false
};

// ─── Workspace Profile Configurations ─────────────────────────────────────────
// Configuration-driven: one definition per archetype, no scattered if/else chains.

export const WORKSPACE_PROFILES = {
  student: {
    label: 'Student',
    defaultModules: ['learning', 'goals', 'focus', 'projects', 'analytics'],
    priorityWidgets: ['today-learning', 'study-goals', 'focus-timer', 'progress'],
    navigation: [
      { label: 'Home', href: '/' },
      { label: 'Learning', href: '/experience' },
      { label: 'Goals', href: '/workspace' },
      { label: 'Projects', href: '/projects' },
      { label: 'Focus', href: '/workspace' },
      { label: 'AI Intelligence', href: '/ai' }
    ]
  },
  developer: {
    label: 'Developer',
    defaultModules: ['projects', 'coding', 'architecture', 'ai', 'analytics'],
    priorityWidgets: ['active-projects', 'tasks', 'git-activity', 'ai-insights'],
    navigation: [
      { label: 'Home', href: '/' },
      { label: 'Projects', href: '/projects' },
      { label: 'Workspace', href: '/workspace' },
      { label: 'AI Intelligence', href: '/ai' },
      { label: 'Experience', href: '/experience' }
    ]
  },
  designer: {
    label: 'Designer',
    defaultModules: ['projects', 'tasks', 'goals', 'focus', 'analytics'],
    priorityWidgets: ['creative-projects', 'deadlines', 'focus-timer', 'ideas'],
    navigation: [
      { label: 'Home', href: '/' },
      { label: 'Projects', href: '/projects' },
      { label: 'Focus', href: '/workspace' },
      { label: 'Goals', href: '/workspace' },
      { label: 'Experience', href: '/experience' }
    ]
  },
  founder: {
    label: 'Founder / Entrepreneur',
    defaultModules: ['projects', 'goals', 'tasks', 'analytics', 'ai'],
    priorityWidgets: ['top-priorities', 'milestones', 'tasks', 'business-goals'],
    navigation: [
      { label: 'Home', href: '/' },
      { label: 'Projects', href: '/projects' },
      { label: 'Goals', href: '/workspace' },
      { label: 'AI Intelligence', href: '/ai' },
      { label: 'Analytics', href: '/workspace' }
    ]
  },
  researcher: {
    label: 'Researcher',
    defaultModules: ['projects', 'goals', 'focus', 'analytics', 'ai'],
    priorityWidgets: ['research-projects', 'notes', 'experiments', 'knowledge'],
    navigation: [
      { label: 'Home', href: '/' },
      { label: 'Projects', href: '/projects' },
      { label: 'Focus', href: '/workspace' },
      { label: 'AI Intelligence', href: '/ai' },
      { label: 'Experience', href: '/experience' }
    ]
  },
  creator: {
    label: 'Creator',
    defaultModules: ['projects', 'goals', 'tasks', 'focus', 'analytics'],
    priorityWidgets: ['content-pipeline', 'deadlines', 'ideas', 'analytics'],
    navigation: [
      { label: 'Home', href: '/' },
      { label: 'Projects', href: '/projects' },
      { label: 'Focus', href: '/workspace' },
      { label: 'Goals', href: '/workspace' },
      { label: 'AI Intelligence', href: '/ai' }
    ]
  },
  professional: {
    label: 'Professional',
    defaultModules: ['tasks', 'projects', 'goals', 'analytics', 'focus'],
    priorityWidgets: ['top-tasks', 'deadlines', 'goals', 'productivity'],
    navigation: [
      { label: 'Home', href: '/' },
      { label: 'Projects', href: '/projects' },
      { label: 'Workspace', href: '/workspace' },
      { label: 'AI Intelligence', href: '/ai' }
    ]
  },
  default: {
    label: 'General',
    defaultModules: ['projects', 'tasks', 'goals', 'focus', 'analytics'],
    priorityWidgets: ['projects', 'tasks', 'focus', 'goals'],
    navigation: [
      { label: 'Home', href: '/' },
      { label: 'Projects', href: '/projects' },
      { label: 'Workspace', href: '/workspace' },
      { label: 'Experience', href: '/experience' },
      { label: 'AI Intelligence', href: '/ai' }
    ]
  }
};

// Role → profile key mapping
const ROLE_TO_PROFILE = {
  'Student': 'student',
  'Developer': 'developer',
  'Designer': 'designer',
  'Founder / Entrepreneur': 'founder',
  'Researcher': 'researcher',
  'Creator': 'creator',
  'Professional': 'professional',
  'Job Seeker': 'professional',
  'Freelancer': 'developer'
};

// All available modules for customization UI
export const ALL_MODULES = [
  { key: 'learning', label: 'Learning', icon: '📚' },
  { key: 'projects', label: 'Projects', icon: '🚀' },
  { key: 'tasks', label: 'Tasks', icon: '✅' },
  { key: 'coding', label: 'Coding', icon: '💻' },
  { key: 'architecture', label: 'Architecture', icon: '🏗️' },
  { key: 'goals', label: 'Goals', icon: '🎯' },
  { key: 'focus', label: 'Focus Sessions', icon: '🧘' },
  { key: 'analytics', label: 'Analytics', icon: '📊' },
  { key: 'ai', label: 'AI Intelligence', icon: '🤖' },
  { key: 'research', label: 'Research', icon: '🔬' },
  { key: 'content', label: 'Content', icon: '✍️' },
  { key: 'career', label: 'Career', icon: '💼' }
];

// ─── Profile Store ────────────────────────────────────────────────────────────

function getKey(userId) {
  return PROFILE_KEY_PREFIX + (userId || 'anonymous');
}

/**
 * Load a user's profile. Returns null if no profile exists.
 */
export function loadProfile(userId) {
  try {
    const raw = localStorage.getItem(getKey(userId));
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

/**
 * Save a user's profile to localStorage.
 */
export function saveProfile(userId, profile) {
  try {
    localStorage.setItem(getKey(userId), JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
}

/**
 * Create a fresh profile for a new user.
 */
export function createProfile(user) {
  const profile = {
    ...DEFAULT_PROFILE,
    id: user.id,
    name: user.name,
    email: user.email,
    isDemo: user.isDemo || false
  };
  saveProfile(user.id, profile);
  return profile;
}

/**
 * Update specific fields of a user's profile.
 */
export function updateProfile(userId, updates) {
  const existing = loadProfile(userId) || { ...DEFAULT_PROFILE, id: userId };
  const updated = deepMerge(existing, updates);
  saveProfile(userId, updated);

  if (userId) {
    profileService.updateProfile(userId, {
      name: updated.name,
      roles: updated.roles,
      goals: updated.goals,
      primaryPriority: updated.primaryPriority,
      experienceLevels: updated.experienceLevels,
      organizationStyle: updated.organizationStyle,
      onboardingCompleted: updated.onboardingCompleted
    }).catch(() => {});

    if (updated.preferences) {
      settingsService.updateSettings(userId, {
        theme: updated.preferences.theme,
        focusDuration: updated.preferences.focusDuration,
        workingTime: updated.preferences.workingTime
      }).catch(() => {});
    }
  }

  return updated;
}

/**
 * Get the workspace profile configuration based on user's primary role.
 * Returns the config-driven profile object.
 */
export function getWorkspaceConfig(profile) {
  if (!profile || !profile.roles || profile.roles.length === 0) {
    return WORKSPACE_PROFILES.default;
  }

  // Find the first role that maps to a defined profile
  for (const role of profile.roles) {
    const key = ROLE_TO_PROFILE[role];
    if (key && WORKSPACE_PROFILES[key]) {
      return WORKSPACE_PROFILES[key];
    }
  }

  return WORKSPACE_PROFILES.default;
}

/**
 * Get the effective module list for a user.
 * Uses their custom selection if onboarding is complete, else defaults from profile config.
 */
export function getEffectiveModules(profile) {
  if (profile.modules && profile.modules.length > 0) {
    return profile.modules;
  }
  return getWorkspaceConfig(profile).defaultModules;
}

/**
 * Get the AI insights message personalized to the user.
 */
export function getPersonalizedInsights(profile, projects) {
  const config = getWorkspaceConfig(profile);
  const insights = [];

  if (profile.primaryPriority) {
    insights.push(`Your primary focus is ${profile.primaryPriority}.`);
  }

  if (projects && projects.length > 0) {
    const active = projects.filter(p => p.status === 'Active');
    if (active.length > 0) {
      insights.push(`You have ${active.length} active project${active.length > 1 ? 's' : ''} in progress.`);
    }

    const overdueMilestones = projects
      .flatMap(p => p.milestones || [])
      .filter(m => m.status === 'Upcoming' && m.date && new Date(m.date) < new Date());
    if (overdueMilestones.length > 0) {
      insights.push(`${overdueMilestones.length} milestone${overdueMilestones.length > 1 ? 's are' : ' is'} overdue across your projects.`);
    }
  }

  if (profile.roles.includes('Student') && profile.goals.includes('Prepare for exams')) {
    insights.push('You have exam preparation as a goal — consider scheduling focused study sessions.');
  }

  if (profile.roles.includes('Founder / Entrepreneur')) {
    insights.push('Focus on your highest-priority project milestones to maintain business momentum.');
  }

  if (insights.length === 0) {
    insights.push(`Welcome to AURA, ${profile.name || 'there'}. Your workspace is ready.`);
  }

  return insights;
}

// ─── Demo Profiles ────────────────────────────────────────────────────────────

export const DEMO_PROFILES = {
  student: {
    name: 'Alex Chen',
    roles: ['Student'],
    goals: ['Learn new skills', 'Prepare for exams', 'Find a job'],
    modules: ['learning', 'goals', 'focus', 'projects', 'analytics'],
    primaryPriority: 'Learning',
    organizationStyle: 'Timeline',
    preferences: { theme: 'dark', focusDuration: 25, workingTime: 'Evening' }
  },
  developer: {
    name: 'Jordan Smith',
    roles: ['Developer'],
    goals: ['Build projects', 'Improve productivity'],
    modules: ['projects', 'coding', 'architecture', 'ai', 'analytics'],
    primaryPriority: 'Building',
    organizationStyle: 'Kanban board',
    preferences: { theme: 'dark', focusDuration: 60, workingTime: 'Morning' }
  },
  founder: {
    name: 'Sam Rivera',
    roles: ['Founder / Entrepreneur'],
    goals: ['Build a startup', 'Grow a business', 'Manage work'],
    modules: ['projects', 'goals', 'tasks', 'analytics', 'ai'],
    primaryPriority: 'Business',
    organizationStyle: 'Goals and milestones',
    preferences: { theme: 'dark', focusDuration: 45, workingTime: 'Morning' }
  },
  designer: {
    name: 'Morgan Lee',
    roles: ['Designer'],
    goals: ['Build projects', 'Create content'],
    modules: ['projects', 'tasks', 'goals', 'focus', 'analytics'],
    primaryPriority: 'Building',
    organizationStyle: 'Simple task list',
    preferences: { theme: 'light', focusDuration: 45, workingTime: 'Afternoon' }
  }
};

// ─── Utilities ─────────────────────────────────────────────────────────────────

function deepMerge(base, overrides) {
  const result = { ...base };
  for (const key of Object.keys(overrides)) {
    if (
      typeof overrides[key] === 'object' &&
      overrides[key] !== null &&
      !Array.isArray(overrides[key]) &&
      typeof base[key] === 'object' &&
      base[key] !== null &&
      !Array.isArray(base[key])
    ) {
      result[key] = deepMerge(base[key], overrides[key]);
    } else {
      result[key] = overrides[key];
    }
  }
  return result;
}
