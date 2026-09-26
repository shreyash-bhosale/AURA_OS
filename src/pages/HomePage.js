/**
 * AURA Home Page (Route: /)
 * Dynamically switches between:
 * 1. Personalized Command Center for authenticated users (with dynamic modular widgets,
 *    archetype persona switchers, AI recommendations, and customize workspace modal)
 * 2. Public high-impact landing page with 3D AURA Core & OS preview for visitors.
 */

import { initAuraCore } from '../modules/coreAnimation.js';
import { initWorkspacePreview } from '../modules/workspacePreview.js';
import { getCurrentUser, signInAsDemo } from '../data/authService.js';
import { loadProfile, updateProfile, getWorkspaceConfig, getEffectiveModules, getPersonalizedInsights, DEMO_PROFILES, ALL_MODULES } from '../data/userProfile.js';
import { projectStore } from '../data/projectStore.js';
import { navigate, updateGlobalNavigation } from '../router.js';

export function renderHomePage() {
  const user = getCurrentUser();

  if (user) {
    return renderPersonalizedDashboard(user);
  } else {
    return renderPublicLanding();
  }
}

// ─── 1. Personalized Dashboard View ──────────────────────────────────────────

function renderPersonalizedDashboard(user) {
  const profile = loadProfile(user.id) || {
    id: user.id,
    name: user.name,
    roles: ['Developer'],
    goals: ['Build projects'],
    modules: ['projects', 'coding', 'architecture', 'ai', 'analytics'],
    primaryPriority: 'Building',
    organizationStyle: 'Kanban board',
    preferences: { focusDuration: 25, workingTime: 'Morning', theme: 'dark' }
  };

  const projects = projectStore.getProjects() || [];
  const effectiveModules = getEffectiveModules(profile);
  const config = getWorkspaceConfig(profile);
  const insights = getPersonalizedInsights(profile, projects);

  const displayName = profile.name || user.name || 'Builder';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AU';
  const roleLabel = (profile.roles && profile.roles.join(', ')) || 'Member';
  const priorityLabel = profile.primaryPriority || 'Building';

  // Greeting by hour
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return `
    <div class="container personalized-dashboard-hero">
      <!-- Welcome Header -->
      <div class="dashboard-welcome-bar">
        <div class="welcome-user-info">
          <div class="welcome-avatar">${initials}</div>
          <div class="welcome-text-group">
            <h1 class="welcome-headline">${timeGreeting}, ${escapeHtml(displayName)}.</h1>
            <div class="welcome-subline">
              <span class="badge ${user.isDemo ? 'badge-cyan' : 'badge-emerald'}">
                ${user.isDemo ? 'Demo Mode' : 'Personal Workspace'}
              </span>
              <span>•</span>
              <span>${escapeHtml(roleLabel)}</span>
              <span>•</span>
              <span>Primary: <strong>${escapeHtml(priorityLabel)}</strong></span>
            </div>
          </div>
        </div>

        <div class="welcome-actions-group">
          <button type="button" id="btn-open-customizer" class="btn btn-secondary btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Customize Workspace
          </button>
          <a href="/workspace" class="btn btn-primary btn-sm">
            Enter Full OS
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>
      </div>

      <!-- Quick Archetype Switcher Bar -->
      <div class="dashboard-archetype-bar">
        <span class="archetype-bar-label">Switch Archetype:</span>
        <button type="button" class="archetype-quick-btn ${profile.roles.includes('Student') ? 'active' : ''}" data-home-persona="student">
          🎓 Alex Chen (Student)
        </button>
        <button type="button" class="archetype-quick-btn ${profile.roles.includes('Developer') ? 'active' : ''}" data-home-persona="developer">
          💻 Jordan Smith (Developer)
        </button>
        <button type="button" class="archetype-quick-btn ${profile.roles.includes('Founder / Entrepreneur') ? 'active' : ''}" data-home-persona="founder">
          🚀 Sam Rivera (Founder)
        </button>
        <button type="button" class="archetype-quick-btn ${profile.roles.includes('Designer') ? 'active' : ''}" data-home-persona="designer">
          🎨 Morgan Lee (Designer)
        </button>
      </div>

      <!-- Proactive AURA Intelligence Card -->
      <div class="dashboard-ai-card">
        <div class="ai-card-content">
          <div class="ai-card-glyph">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="9"></circle>
              <circle cx="12" cy="12" r="3" fill="#38BDF8"></circle>
            </svg>
          </div>
          <div class="ai-card-body">
            <div class="ai-card-title">
              <span>AURA Intelligence Recommendation</span>
              <span class="badge badge-indigo">Contextual</span>
            </div>
            <div class="ai-card-text">
              ${insights.map(msg => `<p style="margin: 2px 0;">${escapeHtml(msg)}</p>`).join('')}
            </div>
          </div>
        </div>
        <a href="/ai" class="btn btn-secondary btn-sm" style="flex-shrink: 0;">AI Layer →</a>
      </div>

      <!-- Modular Dynamic Grid -->
      <div class="dashboard-grid">
        ${renderDynamicWidgets(effectiveModules, profile, projects)}
      </div>
    </div>

    <!-- Customize Workspace Modal -->
    <div class="modal-overlay" id="modal-customize-dashboard" aria-hidden="true">
      <div class="modal-container" style="max-width: 620px;">
        <div class="modal-header">
          <h3 class="modal-title">Customize Dashboard Workspace</h3>
          <button type="button" class="modal-close" id="btn-close-customizer" aria-label="Close modal">✕</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 16px;">
            Select which active modules appear on your home command center. Changes persist immediately.
          </p>

          <div class="customizer-modules-list" id="customizer-checkboxes">
            ${ALL_MODULES.map(m => {
              const checked = effectiveModules.includes(m.key);
              return `
                <label class="option-chip ${checked ? 'selected' : ''}" style="cursor: pointer;" data-mod-toggle="${m.key}">
                  <div class="option-chip-content">
                    <span class="option-chip-title">${m.icon} ${m.label}</span>
                  </div>
                  <div class="option-chip-check">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </label>
              `;
            }).join('')}
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border-subtle); padding-top: 16px;">
            <button type="button" class="btn btn-primary btn-sm" id="btn-save-customizer-modal">Apply & Close</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render dynamic widgets based on user's active modules
 */
function renderDynamicWidgets(modules, profile, projects) {
  let widgetsHtml = '';

  // 1. Projects Widget
  if (modules.includes('projects')) {
    const activeProjects = projects.filter(p => p.status === 'Active');
    widgetsHtml += `
      <div class="widget-card widget-span-6">
        <div class="widget-header">
          <div class="widget-title-group">
            <span class="widget-icon">🚀</span>
            <span class="widget-title">Active Projects</span>
          </div>
          <a href="/projects" class="btn btn-ghost btn-sm" style="padding: 2px 8px; font-size: 0.75rem;">View All →</a>
        </div>
        <div class="widget-body">
          ${activeProjects.length > 0 ? activeProjects.slice(0, 3).map(p => `
            <a href="/projects/${p.id}" class="widget-item-row">
              <div class="widget-item-left">
                <span class="widget-item-title">${escapeHtml(p.name)}</span>
                <span class="widget-item-subtitle">${escapeHtml(p.nextMilestone || p.category)}</span>
              </div>
              <div style="text-align: right;">
                <span class="badge ${p.progress >= 80 ? 'badge-emerald' : 'badge-cyan'}">${p.progress}%</span>
                <div class="widget-progress-track" style="width: 70px;">
                  <div class="widget-progress-fill" style="width: ${p.progress}%;"></div>
                </div>
              </div>
            </a>
          `).join('') : `
            <div style="padding: 16px; text-align: center; color: var(--text-secondary); font-size: 0.8125rem;">
              No active projects yet. <a href="/projects" style="color: var(--accent-cyan);">Create your first project →</a>
            </div>
          `}
        </div>
      </div>
    `;
  }

  // 2. Learning Tracks Widget (Especially for Students / Learners)
  if (modules.includes('learning')) {
    widgetsHtml += `
      <div class="widget-card widget-span-6">
        <div class="widget-header">
          <div class="widget-title-group">
            <span class="widget-icon">📚</span>
            <span class="widget-title">Today's Learning & Study Goals</span>
          </div>
          <span class="badge badge-emerald">On Track</span>
        </div>
        <div class="widget-body">
          <div class="widget-item-row">
            <div class="widget-item-left">
              <span class="widget-item-title">Neural Networks & Graph Conv</span>
              <span class="widget-item-subtitle">Chapter 4: Spatial-Temporal Adjacency</span>
            </div>
            <span class="badge badge-cyan">72%</span>
          </div>
          <div class="widget-item-row">
            <div class="widget-item-left">
              <span class="widget-item-title">Modern System Design</span>
              <span class="widget-item-subtitle">Distributed consensus & cache invalidation</span>
            </div>
            <span class="badge badge-indigo">55%</span>
          </div>
          <div class="widget-item-row">
            <div class="widget-item-left">
              <span class="widget-item-title">Upcoming Milestone: Algorithm Review</span>
              <span class="widget-item-subtitle">Exam checkpoint in 4 days</span>
            </div>
            <span class="badge badge-warning">High Priority</span>
          </div>
        </div>
      </div>
    `;
  }

  // 3. Tasks / Kanban Widget
  if (modules.includes('tasks')) {
    widgetsHtml += `
      <div class="widget-card widget-span-6">
        <div class="widget-header">
          <div class="widget-title-group">
            <span class="widget-icon">✅</span>
            <span class="widget-title">Focus Action Items (${escapeHtml(profile.organizationStyle || 'Sprint')})</span>
          </div>
          <span class="widget-badge badge-cyan">4 Pending</span>
        </div>
        <div class="widget-body">
          <label class="widget-item-row" style="cursor: pointer;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="checkbox" checked style="accent-color: var(--accent-cyan); width: 16px; height: 16px;">
              <span style="text-decoration: line-through; color: var(--text-secondary); font-size: 0.8125rem;">
                Implement 21-landmark coordinate normalization
              </span>
            </div>
            <span class="badge badge-emerald" style="font-size: 0.65rem;">Done</span>
          </label>
          <label class="widget-item-row" style="cursor: pointer;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="checkbox" style="accent-color: var(--accent-cyan); width: 16px; height: 16px;">
              <span style="color: var(--text-primary); font-size: 0.8125rem;">
                WebRTC real-time frame transport verification
              </span>
            </div>
            <span class="badge badge-warning" style="font-size: 0.65rem;">Today</span>
          </label>
          <label class="widget-item-row" style="cursor: pointer;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="checkbox" style="accent-color: var(--accent-cyan); width: 16px; height: 16px;">
              <span style="color: var(--text-primary); font-size: 0.8125rem;">
                Verify clean client-side session handoff
              </span>
            </div>
            <span class="badge badge-indigo" style="font-size: 0.65rem;">Next</span>
          </label>
        </div>
      </div>
    `;
  }

  // 4. Focus Session Widget (Pomodoro Flow)
  if (modules.includes('focus')) {
    const duration = profile.preferences?.focusDuration || 25;
    widgetsHtml += `
      <div class="widget-card widget-span-6">
        <div class="widget-header">
          <div class="widget-title-group">
            <span class="widget-icon">🧘</span>
            <span class="widget-title">Deep Work Focus Sprint</span>
          </div>
          <span class="badge badge-indigo">${duration}m Target</span>
        </div>
        <div class="widget-body focus-mini-widget">
          <div class="focus-mini-timer" id="home-focus-timer">${duration < 10 ? '0' + duration : duration}:00</div>
          <div class="focus-mini-controls">
            <button type="button" class="btn btn-primary btn-sm" id="btn-home-focus-toggle">
              Start Session
            </button>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-home-focus-reset">
              Reset
            </button>
          </div>
          <span style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 10px;">
            Optimized for: ${escapeHtml(profile.preferences?.workingTime || 'Flexible')} flow
          </span>
        </div>
      </div>
    `;
  }

  // 5. Architecture Topology Preview (for Developer / Engineer)
  if (modules.includes('architecture') || modules.includes('coding')) {
    widgetsHtml += `
      <div class="widget-card widget-span-6">
        <div class="widget-header">
          <div class="widget-title-group">
            <span class="widget-icon">🏗️</span>
            <span class="widget-title">System Architecture Topology</span>
          </div>
          <span class="badge badge-cyan">4 Layers</span>
        </div>
        <div class="widget-body">
          <div style="background: var(--surface-elevated); border: 1px dashed var(--border-standard); border-radius: 12px; padding: 16px; text-align: center;">
            <div style="display: flex; justify-content: space-around; align-items: center; margin-bottom: 12px;">
              <span class="badge badge-cyan" style="font-size: 0.7rem;">Web Client</span>
              <span style="color: var(--text-tertiary); font-size: 0.8rem;">→</span>
              <span class="badge badge-indigo" style="font-size: 0.7rem;">Gateway API</span>
              <span style="color: var(--text-tertiary); font-size: 0.8rem;">→</span>
              <span class="badge badge-emerald" style="font-size: 0.7rem;">Neural Engine</span>
            </div>
            <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0;">
              Interactive topology active across <strong>${projects.length}</strong> planned systems.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  // 6. Analytics & Velocity Telemetry
  if (modules.includes('analytics')) {
    widgetsHtml += `
      <div class="widget-card widget-span-6">
        <div class="widget-header">
          <div class="widget-title-group">
            <span class="widget-icon">📊</span>
            <span class="widget-title">Productivity Telemetry</span>
          </div>
          <span class="badge badge-emerald">Velocity: 94%</span>
        </div>
        <div class="widget-body">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
            <div style="background: var(--surface-elevated); padding: 12px; border-radius: 12px;">
              <div style="font-size: 1.25rem; font-weight: 700; color: var(--accent-cyan);">18.5h</div>
              <div style="font-size: 0.6875rem; color: var(--text-secondary);">Focus Hours</div>
            </div>
            <div style="background: var(--surface-elevated); padding: 12px; border-radius: 12px;">
              <div style="font-size: 1.25rem; font-weight: 700; color: var(--accent-emerald);">14</div>
              <div style="font-size: 0.6875rem; color: var(--text-secondary);">Tasks Closed</div>
            </div>
            <div style="background: var(--surface-elevated); padding: 12px; border-radius: 12px;">
              <div style="font-size: 1.25rem; font-weight: 700; color: var(--accent-indigo);">99.2%</div>
              <div style="font-size: 0.6875rem; color: var(--text-secondary);">Consistency</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return widgetsHtml;
}

// ─── 2. Public Landing View (When Logged Out) ──────────────────────────────────

function renderPublicLanding() {
  return `
    <!-- Hero Section -->
    <section class="hero-section" id="hero">
      <div class="hero-ambient-glow" aria-hidden="true"></div>

      <div class="container">
        <div class="hero-content">
          <div class="hero-eyebrow">
            <span class="section-eyebrow">
              <span class="status-dot"></span>
              AURA SYSTEM 2.0 • INTELLIGENT WORKSPACE
            </span>
          </div>

          <h1 class="hero-headline">
            Your learning.<br>
            Your projects.<br>
            <span class="gradient-text">One intelligent workspace.</span>
          </h1>

          <p class="hero-subheadline">
            AURA discovers who you are and configures a personalized command center around your goals, workflow, and projects.
          </p>

          <div class="hero-actions">
            <a href="/signup" class="btn btn-primary btn-lg">
              Get Started
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </a>
            <a href="/login" class="btn btn-secondary btn-lg">
              Sign In
            </a>
            <button type="button" id="btn-hero-demo" class="btn btn-secondary btn-lg" style="color: var(--accent-cyan); border-color: rgba(56, 189, 248, 0.3);">
              Explore Demo
            </button>
          </div>

          <!-- AURA Core Graphic Canvas -->
          <div class="aura-core-wrapper">
            <canvas id="aura-core-canvas" aria-label="Interactive 3D AURA Core Intelligence Visualizer"></canvas>

            <div class="core-hud-controls" aria-label="Core Controls">
              <div class="core-hud-status">
                <span class="status-dot"></span>
                <span>CORE: ONLINE</span>
              </div>
              <span style="opacity: 0.3;">|</span>
              <button id="core-btn-pulse" class="core-hud-btn" title="Toggle Core Pulse Harmonic">Pulse: Resonant</button>
              <button id="core-btn-speed" class="core-hud-btn" title="Toggle Rotation Speed">Speed: 1x</button>
            </div>
          </div>

          <!-- Quick Metrics Strip -->
          <div class="hero-metrics-strip">
            <div class="metric-item">
              <span class="metric-value">3,800+</span>
              <span class="metric-label">Active Learners & Builders</span>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-item">
              <span class="metric-value">99.8%</span>
              <span class="metric-label">Focus Velocity Index</span>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-item">
              <span class="metric-value">1 Unified</span>
              <span class="metric-label">Personal OS Environment</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Product Preview Section -->
    <section class="section workspace-preview-section">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow indigo">Interactive System Preview</span>
          <h2 class="section-title">The Unified Command Center.</h2>
          <p class="section-subtitle">
            Experience an operating system built from the ground up to synthesize curriculum learning, code execution, and proactive AI guidance.
          </p>
        </div>

        <div class="os-mockup-frame">
          <div class="os-titlebar">
            <div class="os-traffic-lights" aria-hidden="true">
              <span class="traffic-light traffic-close"></span>
              <span class="traffic-light traffic-minimize"></span>
              <span class="traffic-light traffic-maximize"></span>
            </div>
            <div class="os-titlebar-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <span>AURA OS — <span id="os-clock-display">21:49:13</span></span>
            </div>
            <div class="os-status-pill">
              <span class="os-status-dot"></span>
              <span>Online • Neural Active</span>
            </div>
          </div>

          <div class="os-body">
            <aside class="os-sidebar" aria-label="Workspace Preview Sidebar">
              <div class="os-nav-group">
                <span class="os-group-label">Navigation</span>
                <button class="os-sidebar-btn active" data-view="home">
                  <svg class="os-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  </svg>
                  Home
                </button>
                <button class="os-sidebar-btn" data-view="learning">
                  <svg class="os-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Learning
                </button>
                <button class="os-sidebar-btn" data-view="coding">
                  <svg class="os-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                  Coding
                </button>
                <button class="os-sidebar-btn" data-view="projects">
                  <svg class="os-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Projects
                </button>
                <button class="os-sidebar-btn" data-view="focus">
                  <svg class="os-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  Focus
                </button>
                <button class="os-sidebar-btn" data-view="intelligence">
                  <svg class="os-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                  </svg>
                  AI Assistant
                </button>
                <button class="os-sidebar-btn" data-view="analytics">
                  <svg class="os-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                  Analytics
                </button>
              </div>

              <div class="os-sidebar-user">
                <div class="user-avatar">AU</div>
                <div class="user-meta">
                  <span class="user-name">Guest Explorer</span>
                  <span class="user-plan">Interactive Preview</span>
                </div>
              </div>
            </aside>

            <div class="os-viewport">
              <div class="os-view-panel active" data-view-panel="home">
                <div class="os-greeting-strip">
                  <div class="os-greeting">
                    <h4>Welcome to AURA.</h4>
                    <p>Here's a preview of an intelligent command center in action.</p>
                  </div>
                  <a href="/login" class="btn btn-secondary btn-sm">
                    Sign In
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </a>
                </div>

                <div class="os-stat-cards">
                  <div class="os-stat-card">
                    <div class="os-stat-header">
                      <span>Learning Mastery</span>
                      <span class="badge badge-emerald">Active</span>
                    </div>
                    <div class="os-stat-number" id="os-learning-progress-num">72%</div>
                    <div class="os-stat-progress-bar">
                      <div class="os-stat-progress-fill" id="os-learning-progress-fill" style="width: 72%;"></div>
                    </div>
                  </div>

                  <div class="os-stat-card">
                    <div class="os-stat-header">
                      <span>Coding Time</span>
                      <span class="badge badge-cyan">Today</span>
                    </div>
                    <div class="os-stat-number">48 <span style="font-size: 0.9rem; font-weight: 500; color: var(--text-secondary);">mins</span></div>
                    <div class="os-stat-progress-bar">
                      <div class="os-stat-progress-fill" style="width: 80%;"></div>
                    </div>
                  </div>

                  <div class="os-stat-card">
                    <div class="os-stat-header">
                      <span>Projects Velocity</span>
                      <span class="badge badge-indigo">Sprint 4</span>
                    </div>
                    <div class="os-stat-number">82%</div>
                    <div class="os-stat-progress-bar">
                      <div class="os-stat-progress-fill" style="width: 82%;"></div>
                    </div>
                  </div>
                </div>

                <div class="os-grid-two-col">
                  <div class="os-card-widget">
                    <div class="os-widget-title">
                      <span>Today's Focus Track</span>
                      <span style="font-size: 0.72rem; color: var(--accent-cyan);">3 of 4 Completed</span>
                    </div>
                    <div class="os-task-list">
                      <label class="os-task-item done">
                        <input type="checkbox" class="os-task-checkbox" checked>
                        <span>Python Concurrency: AsyncIO Tasks</span>
                      </label>
                      <label class="os-task-item done">
                        <input type="checkbox" class="os-task-checkbox" checked>
                        <span>SignSense AI: MediaPipe Hand Landmarks</span>
                      </label>
                      <label class="os-task-item done">
                        <input type="checkbox" class="os-task-checkbox" checked>
                        <span>Data Structures: Trie Prefix Lookups</span>
                      </label>
                      <label class="os-task-item">
                        <input type="checkbox" class="os-task-checkbox">
                        <span>PyTorch: ST-GCN Temporal Conv Layer</span>
                      </label>
                    </div>
                  </div>

                  <div class="os-card-widget">
                    <div class="os-widget-title">
                      <span>AURA Recommendation</span>
                      <span class="badge badge-indigo">Synthesized</span>
                    </div>
                    <div class="os-recommendation-box">
                      <p>Continue your computer vision project for <strong>45 minutes</strong>. Your project is 82% complete and has not been committed to in 3 days.</p>
                      <a href="/login" class="btn btn-accent btn-sm">
                        Sign In to Personalize
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Other mock panels -->
              <div class="os-view-panel" data-view-panel="learning">
                <div class="os-card-widget">
                  <div class="os-widget-title"><h4>Learning Pathways</h4><a href="/product" class="btn btn-secondary btn-sm">View in Product</a></div>
                  <p style="color: var(--text-secondary); margin: 12px 0;">Advancing through 5 interconnected tracks from Python to Generative AI.</p>
                </div>
              </div>
              <div class="os-view-panel" data-view-panel="coding">
                <div class="os-card-widget">
                  <div class="os-widget-title"><h4>Algorithmic Sandbox</h4><a href="/product" class="btn btn-secondary btn-sm">View in Product</a></div>
                  <p style="color: var(--text-secondary); margin: 12px 0;">Instant execution sandbox with test assertions and memory metrics.</p>
                </div>
              </div>
              <div class="os-view-panel" data-view-panel="projects">
                <div class="os-card-widget">
                  <div class="os-widget-title"><h4>Projects Sprint</h4><a href="/projects" class="btn btn-secondary btn-sm">View in Projects</a></div>
                  <p style="color: var(--text-secondary); margin: 12px 0;">SignSense AI (82%), Nexus AI (61%), CodeMind (91%).</p>
                </div>
              </div>
              <div class="os-view-panel" data-view-panel="focus">
                <div class="os-card-widget" style="text-align: center; padding: 28px;">
                  <div style="font-size: 2.5rem; font-weight: 200;">24 : 38</div>
                  <p style="color: var(--text-secondary); margin: 12px 0;">Distraction-free focus environment with ambient soundscapes.</p>
                  <a href="/product" class="btn btn-primary btn-sm">Explore Focus System</a>
                </div>
              </div>
              <div class="os-view-panel" data-view-panel="intelligence">
                <div class="os-card-widget">
                  <div class="os-widget-title"><h4>AURA Intelligence</h4><a href="/ai" class="btn btn-secondary btn-sm">Open AI Page</a></div>
                  <p style="color: var(--text-secondary); margin: 12px 0;">Synthesizing code velocity, test suites, and schedule constraints.</p>
                </div>
              </div>
              <div class="os-view-panel" data-view-panel="analytics">
                <div class="os-card-widget">
                  <div class="os-widget-title"><h4>Productivity Telemetry</h4><a href="/product" class="btn btn-secondary btn-sm">View Analytics</a></div>
                  <p style="color: var(--text-secondary); margin: 12px 0;">Flowing activity fields mapping study hours and consistency matrices.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Architecture Spotlights Linking to Pages -->
    <section class="section" style="padding-top: 0;">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">Explore the Architecture</span>
          <h2 class="section-title">Engineered with intention.</h2>
          <p class="section-subtitle">
            Every layer of AURA is purpose-built to accelerate learning and shipping.
          </p>
        </div>

        <div class="projects-grid">
          <div class="project-card" style="padding: 28px;">
            <span class="project-category">Core Architecture</span>
            <h3 class="project-title" style="margin-top: 8px;">What AURA Provides</h3>
            <p class="project-desc">A deep dive into the 6 foundational engines: Learning, Coding, Projects, Goals, Focus, and Analytics.</p>
            <a href="/product" class="btn btn-secondary" style="margin-top: 16px;">
              Explore Product Capabilities
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </a>
          </div>

          <div class="project-card" style="padding: 28px;">
            <span class="project-category">Interactive Journey</span>
            <h3 class="project-title" style="margin-top: 8px;">The Daily Experience</h3>
            <p class="project-desc">Experience an 8-step visual walkthrough showing how AURA turns cognitive fatigue into productive flow.</p>
            <a href="/experience" class="btn btn-secondary" style="margin-top: 16px;">
              See the Experience Journey
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </a>
          </div>

          <div class="project-card" style="padding: 28px;">
            <span class="project-category">Neural Intelligence</span>
            <h3 class="project-title" style="margin-top: 8px;">AI That Understands</h3>
            <p class="project-desc">Discover how AURA Intelligence synthesizes your active learning graph, code commits, and sprint deadlines.</p>
            <a href="/ai" class="btn btn-secondary" style="margin-top: 16px;">
              Explore AI Intelligence
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA Section -->
    <section class="section" id="cta" style="text-align: center;">
      <div class="container-narrow">
        <span class="section-eyebrow indigo">Next Generation Workspace</span>
        <h2 class="section-title" style="font-size: var(--fs-display);">Build what comes next.</h2>
        <p class="section-subtitle" style="margin: 0 auto var(--space-8); max-width: 620px;">
          Your ideas, learning, and projects deserve a workspace designed around you.
        </p>
        <a href="/signup" class="btn btn-primary btn-lg">
          Create Your AURA
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </a>
      </div>
    </section>
  `;
}

// ─── Interactivity Initialization ─────────────────────────────────────────────

export function initHomePage() {
  const user = getCurrentUser();

  if (user) {
    return initPersonalizedDashboardLogic(user);
  } else {
    return initPublicLandingLogic();
  }
}

function initPersonalizedDashboardLogic(user) {
  let profile = loadProfile(user.id);
  if (!profile) return () => {};

  // 1. Archetype Quick Switcher Buttons
  document.querySelectorAll('[data-home-persona]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pKey = btn.dataset.homePersona;
      const sample = DEMO_PROFILES[pKey];
      if (!sample) return;

      const updates = {
        name: sample.name,
        roles: sample.roles,
        goals: sample.goals,
        modules: sample.modules,
        primaryPriority: sample.primaryPriority,
        organizationStyle: sample.organizationStyle,
        preferences: sample.preferences
      };

      updateProfile(user.id, updates);
      // Re-trigger global nav & re-render
      updateGlobalNavigation(window.location.pathname);
      navigate('/');
    });
  });

  // 2. Customize Workspace Modal controls
  const customizerModal = document.getElementById('modal-customize-dashboard');
  const openCustomizerBtn = document.getElementById('btn-open-customizer');
  const closeCustomizerBtn = document.getElementById('btn-close-customizer');
  const applyCustomizerBtn = document.getElementById('btn-save-customizer-modal');

  openCustomizerBtn?.addEventListener('click', () => {
    customizerModal?.classList.add('active');
  });

  const closeModal = () => {
    customizerModal?.classList.remove('active');
  };

  closeCustomizerBtn?.addEventListener('click', closeModal);
  customizerModal?.addEventListener('click', (e) => {
    if (e.target === customizerModal) closeModal();
  });

  // Checkbox toggles inside modal
  let tempModules = [...(profile.modules || ['projects', 'tasks', 'goals', 'focus', 'analytics'])];
  document.querySelectorAll('[data-mod-toggle]').forEach(item => {
    item.addEventListener('click', () => {
      const key = item.dataset.modToggle;
      if (tempModules.includes(key)) {
        if (tempModules.length <= 1) return; // keep at least 1
        tempModules = tempModules.filter(k => k !== key);
        item.classList.remove('selected');
      } else {
        tempModules.push(key);
        item.classList.add('selected');
      }
    });
  });

  applyCustomizerBtn?.addEventListener('click', () => {
    updateProfile(user.id, { modules: tempModules });
    closeModal();
    navigate('/');
  });

  // 3. Mini Focus Timer Widget logic
  const timerDisplay = document.getElementById('home-focus-timer');
  const toggleBtn = document.getElementById('btn-home-focus-toggle');
  const resetBtn = document.getElementById('btn-home-focus-reset');

  let durationMins = profile.preferences?.focusDuration || 25;
  let remainingSecs = durationMins * 60;
  let timerInterval = null;

  function updateTimerText() {
    if (!timerDisplay) return;
    const m = Math.floor(remainingSecs / 60);
    const s = remainingSecs % 60;
    timerDisplay.textContent = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  }

  toggleBtn?.addEventListener('click', () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
      toggleBtn.textContent = 'Resume Session';
    } else {
      timerInterval = setInterval(() => {
        if (remainingSecs > 0) {
          remainingSecs--;
          updateTimerText();
        } else {
          clearInterval(timerInterval);
          timerInterval = null;
          toggleBtn.textContent = 'Completed!';
        }
      }, 1000);
      toggleBtn.textContent = 'Pause Session';
    }
  });

  resetBtn?.addEventListener('click', () => {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    remainingSecs = durationMins * 60;
    updateTimerText();
    if (toggleBtn) toggleBtn.textContent = 'Start Session';
  });

  return () => {
    if (timerInterval) clearInterval(timerInterval);
  };
}

function initPublicLandingLogic() {
  const cleanupCore = initAuraCore();
  initWorkspacePreview();

  // Instant demo button on public hero
  document.getElementById('btn-hero-demo')?.addEventListener('click', () => {
    const res = signInAsDemo();
    let profile = loadProfile(res.user.id);
    if (!profile) {
      import('../data/userProfile.js').then(({ createProfile }) => {
        createProfile(res.user);
        navigate('/onboarding');
      });
    } else {
      navigate('/');
    }
  });

  return () => {
    if (typeof cleanupCore === 'function') cleanupCore();
  };
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
