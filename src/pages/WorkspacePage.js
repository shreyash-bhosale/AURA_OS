/**
 * AURA Workspace Page (Route: /workspace)
 * Fully user-driven: all data sourced from authService, projectStore, analyticsService, learningStore.
 * No hardcoded personal data.
 */

import { initCodePlayground } from '../modules/codePlayground.js';
import { initFocusMode } from '../modules/focusMode.js';
import { initAnalyticsVisualizer } from '../modules/analyticsVisualizer.js';
import { initSkillConstellation, getDynamicSkillData } from '../modules/skillConstellation.js';
import { initProjectLab } from '../modules/projectLab.js';
import { getCurrentUser } from '../data/authService.js';
import { projectStore } from '../data/projectStore.js';
import { analyticsService } from '../data/analyticsService.js';
import { learningStore } from '../data/learningStore.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFirstName(name = '') {
  return name.split(' ')[0] || 'there';
}

// ─── Render ───────────────────────────────────────────────────────────────────

export function renderWorkspacePage() {
  const user = getCurrentUser();
  const userId = user?.id || null;
  const firstName = user ? getFirstName(user.name) : 'there';
  const greeting = getGreeting();

  // Live metrics from real events
  const metrics = userId ? analyticsService.getUserMetrics(userId) : null;
  const projects = userId ? projectStore.getProjects(userId) : [];
  const activeProjects = projects.filter(p => p.status === 'Active' || p.status === 'Planning');
  const skillData = getDynamicSkillData(userId);

  // Sidebar badge values (derived, never fabricated)
  const projectCount = projects.length;
  const focusMins = metrics?.focusMinutesTotal ?? 0;

  // Home panel metric strings
  const codingCount  = metrics?.codingSessions ?? 0;
  const focusDisplay = focusMins > 0 ? `${focusMins}m` : 'No sessions yet';
  const projectsLabel = activeProjects.length > 0
    ? `${activeProjects.length} active`
    : 'No active projects';
  const projectNamesDisplay = activeProjects.slice(0, 3).map(p => p.name).join(', ') || '—';

  // Render top 3 active projects for quick overview
  const projectCards = activeProjects.slice(0, 3).map(p => `
    <a href="/projects/${p.id}" class="workspace-mini-project-link">
      <div class="workspace-mini-project">
        <div class="wmp-name">${p.name}</div>
        <div class="wmp-progress-track"><div class="wmp-progress-fill" style="width:${p.progress ?? 0}%"></div></div>
        <div class="wmp-meta">
          <span class="badge ${p.status === 'Active' ? 'badge-emerald' : 'badge-cyan'}" style="font-size:0.62rem;padding:1px 6px;">${p.status}</span>
          <span style="font-size:0.72rem;color:var(--text-tertiary);font-family:var(--font-mono);">${p.progress ?? 0}%</span>
        </div>
      </div>
    </a>
  `).join('');

  const emptyProjectsHtml = `
    <div style="padding:20px 0;text-align:center;color:var(--text-tertiary);">
      <p style="font-size:0.85rem;margin-bottom:12px;">No active projects yet.</p>
      <a href="/projects" class="btn btn-secondary btn-sm">Create your first project →</a>
    </div>
  `;

  return `
    <div class="workspace-page-container">
      <!-- Dedicated Standalone App Sidebar -->
      <aside class="app-sidebar" aria-label="AURA Application Sidebar">
        <div class="app-sidebar-top">
          <div class="app-brand-lockup">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="brand-glyph" style="width: 26px; height: 26px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="2.5">
                  <circle cx="12" cy="12" r="9"></circle>
                  <circle cx="12" cy="12" r="3" fill="#38BDF8"></circle>
                </svg>
              </div>
              <span class="brand-text" style="font-size: 1.05rem;">AURA OS</span>
            </div>
            <a href="/" class="btn btn-ghost btn-sm" title="Exit to Public Website" style="padding: 4px 8px; font-size: 0.7rem;">
              ← Site
            </a>
          </div>

          <nav class="app-sidebar-nav">
            <button class="app-nav-item active" data-app-tab="home">
              <div class="app-nav-item-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                <span>Home</span>
              </div>
            </button>

            <button class="app-nav-item" data-app-tab="learning">
              <div class="app-nav-item-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                <span>Learning</span>
              </div>
            </button>

            <button class="app-nav-item" data-app-tab="coding">
              <div class="app-nav-item-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                <span>Coding</span>
              </div>
              ${codingCount > 0 ? `<span class="badge" style="padding:1px 6px;font-size:0.65rem;">${codingCount}</span>` : ''}
            </button>

            <button class="app-nav-item" data-app-tab="projects">
              <div class="app-nav-item-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                <span>Projects</span>
              </div>
              ${projectCount > 0 ? `<span class="badge badge-indigo" style="padding:1px 6px;font-size:0.65rem;">${projectCount}</span>` : ''}
            </button>

            <button class="app-nav-item" data-app-tab="focus">
              <div class="app-nav-item-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                <span>Focus</span>
              </div>
              ${focusMins > 0 ? `<span class="badge badge-cyan" style="padding:1px 6px;font-size:0.65rem;">${focusMins}m</span>` : ''}
            </button>

            <button class="app-nav-item" data-app-tab="analytics">
              <div class="app-nav-item-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                <span>Analytics</span>
              </div>
            </button>

            <button class="app-nav-item" data-app-tab="ai">
              <div class="app-nav-item-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
                <span>AI Intelligence</span>
              </div>
            </button>

            <button class="app-nav-item" data-app-tab="settings">
              <div class="app-nav-item-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                <span>Settings</span>
              </div>
            </button>
          </nav>
        </div>

        <div class="app-sidebar-bottom">
          <div class="os-sidebar-user">
            <div class="user-avatar">${user ? user.name.slice(0,2).toUpperCase() : 'AU'}</div>
            <div class="user-meta">
              <span class="user-name">${user?.name || 'AURA User'}</span>
              <span class="user-plan">${user?.plan || 'Command OS'}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Stage -->
      <main class="app-main-stage">
        <!-- Top App Toolbar -->
        <header class="app-top-header">
          <div class="app-breadcrumbs">
            <span>AURA OS</span>
            <span style="opacity: 0.4;">/</span>
            <span id="app-breadcrumb-current" style="color: var(--text-primary); font-weight: 600;">Home</span>
          </div>

          <div class="app-header-actions">
            <button class="btn-command-shortcut btn-enter-aura">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <span>Quick Search</span>
              <kbd style="font-family: var(--font-mono); font-size: 0.65rem; background: var(--surface-elevated); padding: 1px 4px; border-radius: 3px;">⌘K</kbd>
            </button>

            <button id="workspace-theme-btn" class="btn-icon-theme" title="Toggle Appearance">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line></svg>
            </button>

            <div class="status-indicator" style="font-size: var(--fs-micro); font-family: var(--font-mono); color: var(--accent-emerald);">
              <span class="status-dot"></span>
              <span id="workspace-clock">--:--:--</span>
            </div>
          </div>
        </header>

        <!-- View Panels -->
        <div class="app-view-container">
          <!-- 1. Home View -->
          <div class="workspace-module-view active" data-tab-panel="home">
            <div style="margin-bottom: var(--space-8);">
              <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 6px;">${greeting}, ${firstName}.</h1>
              <p style="color: var(--text-secondary); font-size: 1.05rem;">Here's your workspace — everything you've built so far.</p>
            </div>

            <!-- 4 Metric Boxes (all real data) -->
            <div class="analytics-metrics-grid" style="margin-bottom: var(--space-8);">
              <div class="analytics-metric-box">
                <span class="analytics-metric-label">Projects</span>
                <span class="analytics-metric-num">${projects.length > 0 ? projects.length : '—'}</span>
                <span class="analytics-metric-delta">${projectsLabel}</span>
              </div>
              <div class="analytics-metric-box">
                <span class="analytics-metric-label">Coding</span>
                <span class="analytics-metric-num">${codingCount > 0 ? codingCount : '—'}</span>
                <span class="analytics-metric-delta">${codingCount > 0 ? 'Total sessions' : 'No sessions yet'}</span>
              </div>
              <div class="analytics-metric-box">
                <span class="analytics-metric-label">Focus Today</span>
                <span class="analytics-metric-num">${focusMins > 0 ? focusMins : '—'}</span>
                <span class="analytics-metric-delta">${focusMins > 0 ? 'Minutes focused' : 'Start a session'}</span>
              </div>
              <div class="analytics-metric-box">
                <span class="analytics-metric-label">Events</span>
                <span class="analytics-metric-num">${metrics?.totalEvents ?? '—'}</span>
                <span class="analytics-metric-delta">${metrics?.totalEvents > 0 ? 'Total tracked' : 'Activity starts here'}</span>
              </div>
            </div>

            <!-- Two Columns: Active Projects + Quick Actions -->
            <div class="os-grid-two-col">
              <div class="os-card-widget">
                <div class="os-widget-title">
                  <span>Active Projects</span>
                  <a href="/projects" class="badge badge-indigo" style="text-decoration:none;cursor:pointer;font-size:0.65rem;">View all →</a>
                </div>
                <div style="margin-top:8px;">
                  ${activeProjects.length > 0 ? projectCards : emptyProjectsHtml}
                </div>
              </div>

              <div class="os-card-widget">
                <div class="os-widget-title">
                  <span>Quick Actions</span>
                  <span class="badge badge-emerald">Workspace</span>
                </div>
                <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px;">
                  <a href="/projects" class="btn btn-secondary btn-sm" style="justify-content:flex-start;text-decoration:none;">
                    + Create New Project
                  </a>
                  <button class="btn btn-secondary btn-sm" id="btn-workspace-go-coding" style="justify-content:flex-start;">
                    → Open Code Sandbox
                  </button>
                  <button class="btn btn-secondary btn-sm" id="btn-workspace-go-focus" style="justify-content:flex-start;">
                    ◉ Start Focus Session
                  </button>
                  <a href="/experience" class="btn btn-secondary btn-sm" style="justify-content:flex-start;text-decoration:none;">
                    ≡ View Learning Path
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Learning Module View -->
          <div class="workspace-module-view" data-tab-panel="learning">
            <div class="card" style="margin-bottom: var(--space-6);">
              <h2 style="font-size: 1.5rem; margin-bottom: 8px;">Skill Constellation Engine</h2>
              <p style="color: var(--text-secondary);">Your interconnected learning tracks. Click nodes to inspect curriculum progression.</p>
            </div>
            <div class="learning-constellation-container">
              <div class="constellation-viewport">
                <svg id="constellation-svg" class="constellation-svg-lines" aria-hidden="true"></svg>
                <div class="constellation-node-track">
                  <div class="skill-node selected" data-skill="python" role="button" tabindex="0">
                    <div class="node-progress-ring-box">
                      <svg class="node-progress-svg" viewBox="0 0 68 68">
                        <circle class="node-progress-bg" cx="34" cy="34" r="28"></circle>
                        <circle class="node-progress-circle" cx="34" cy="34" r="28" stroke-dasharray="176" stroke-dashoffset="${176 - (176 * (skillData.python?.progress || 0) / 100)}"></circle>
                      </svg>
                      <span class="node-progress-label">${skillData.python?.progress || 0}%</span>
                    </div>
                    <div class="skill-node-title">Python Core</div>
                    <div class="skill-node-status">${skillData.python?.status || 'Not Started'}</div>
                  </div>
                  <div class="skill-node" data-skill="dsa" role="button" tabindex="0">
                    <div class="node-progress-ring-box">
                      <svg class="node-progress-svg" viewBox="0 0 68 68">
                        <circle class="node-progress-bg" cx="34" cy="34" r="28"></circle>
                        <circle class="node-progress-circle" cx="34" cy="34" r="28" stroke-dasharray="176" stroke-dashoffset="${176 - (176 * (skillData.dsa?.progress || 0) / 100)}" style="stroke: var(--accent-cyan);"></circle>
                      </svg>
                      <span class="node-progress-label">${skillData.dsa?.progress || 0}%</span>
                    </div>
                    <div class="skill-node-title">Algorithms</div>
                    <div class="skill-node-status">${skillData.dsa?.status || 'Not Started'}</div>
                  </div>
                  <div class="skill-node" data-skill="ml" role="button" tabindex="0">
                    <div class="node-progress-ring-box">
                      <svg class="node-progress-svg" viewBox="0 0 68 68">
                        <circle class="node-progress-bg" cx="34" cy="34" r="28"></circle>
                        <circle class="node-progress-circle" cx="34" cy="34" r="28" stroke-dasharray="176" stroke-dashoffset="${176 - (176 * (skillData.ml?.progress || 0) / 100)}" style="stroke: var(--accent-primary);"></circle>
                      </svg>
                      <span class="node-progress-label">${skillData.ml?.progress || 0}%</span>
                    </div>
                    <div class="skill-node-title">Machine Learning</div>
                    <div class="skill-node-status">${skillData.ml?.status || 'Not Started'}</div>
                  </div>
                  <div class="skill-node" data-skill="dl" role="button" tabindex="0">
                    <div class="node-progress-ring-box">
                      <svg class="node-progress-svg" viewBox="0 0 68 68">
                        <circle class="node-progress-bg" cx="34" cy="34" r="28"></circle>
                        <circle class="node-progress-circle" cx="34" cy="34" r="28" stroke-dasharray="176" stroke-dashoffset="${176 - (176 * (skillData.dl?.progress || 0) / 100)}" style="stroke: var(--accent-violet);"></circle>
                      </svg>
                      <span class="node-progress-label">${skillData.dl?.progress || 0}%</span>
                    </div>
                    <div class="skill-node-title">Deep Learning</div>
                    <div class="skill-node-status">${skillData.dl?.status || 'Not Started'}</div>
                  </div>
                  <div class="skill-node" data-skill="genai" role="button" tabindex="0">
                    <div class="node-progress-ring-box">
                      <svg class="node-progress-svg" viewBox="0 0 68 68">
                        <circle class="node-progress-bg" cx="34" cy="34" r="28"></circle>
                        <circle class="node-progress-circle" cx="34" cy="34" r="28" stroke-dasharray="176" stroke-dashoffset="${176 - (176 * (skillData.genai?.progress || 0) / 100)}" style="stroke: #EC4899;"></circle>
                      </svg>
                      <span class="node-progress-label">${skillData.genai?.progress || 0}%</span>
                    </div>
                    <div class="skill-node-title">Generative AI</div>
                    <div class="skill-node-status">${skillData.genai?.status || 'Not Started'}</div>
                  </div>
                </div>
              </div>
              <div class="skill-inspector-panel">
                <div class="inspector-meta">
                  <span class="badge ${skillData.python?.badgeClass || 'badge-secondary'}" id="inspector-badge">${skillData.python?.status || 'Not Started'}</span>
                  <h3 class="inspector-title" id="inspector-title">${skillData.python?.title || 'Python Core & Systems'}</h3>
                  <p class="inspector-desc" id="inspector-desc">${skillData.python?.desc || 'Foundational syntax, data structures, control flow, functions, OOP, and advanced metaprogramming.'}</p>
                </div>
                <div class="inspector-curriculum">
                  <span class="curriculum-heading">Curriculum Progression</span>
                  <ul class="curriculum-list" id="inspector-curriculum-list"></ul>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Coding Module View -->
          <div class="workspace-module-view" data-tab-panel="coding">
            <div class="coding-playground-frame">
              <div class="editor-topbar">
                <div class="editor-lang-tabs">
                  <button class="editor-tab-btn active" data-lang="python">Python</button>
                  <button class="editor-tab-btn" data-lang="typescript">TypeScript</button>
                  <button class="editor-tab-btn" data-lang="rust">Rust</button>
                </div>
                <span class="badge badge-indigo">Sandbox Active</span>
              </div>
              <div class="editor-body-grid">
                <div class="code-view-container">
                  <div class="line-numbers" id="line-numbers-target" aria-hidden="true"></div>
                  <div class="code-content" id="code-content-target"></div>
                </div>
              </div>
              <div class="editor-terminal-bar">
                <div class="terminal-status-info">
                  <span class="test-badge" id="test-badge-target">Ready</span>
                  <span class="runtime-stat" id="runtime-stat-target">—</span>
                </div>
                <button class="btn-run-code" id="btn-run-tests">Run Suite</button>
              </div>
            </div>
          </div>

          <!-- 4. Projects Module View -->
          <div class="workspace-module-view" data-tab-panel="projects">
            <div class="projects-grid" id="workspace-projects-grid">
              ${projects.length === 0 ? `
                <div style="grid-column:1/-1;text-align:center;padding:60px 24px;color:var(--text-tertiary);">
                  <p style="font-size:1rem;margin-bottom:16px;">No projects yet — create one to get started.</p>
                  <a href="/projects" class="btn btn-primary btn-sm">Open Projects →</a>
                </div>
              ` : projects.slice(0,3).map(p => `
                <div class="project-card">
                  <div class="project-preview-viewport">
                    <canvas id="project-canvas-${p.id}" class="project-viz-canvas"></canvas>
                  </div>
                  <div class="project-content">
                    <span class="project-category">${p.technologies?.[0] || 'Project'}</span>
                    <h3 class="project-title">${p.name}</h3>
                    <div class="project-progress-track"><div class="project-progress-fill" style="width: ${p.progress ?? 0}%;"></div></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 5. Focus Module View -->
          <div class="workspace-module-view" data-tab-panel="focus">
            <div class="focus-environment-card">
              <canvas id="focus-ambient-canvas" aria-hidden="true"></canvas>
              <div class="focus-content-layer">
                <span class="focus-eyebrow">FOCUS SESSION</span>
                <div class="focus-timer-display" id="focus-timer-text">25 : 00</div>
                <div class="focus-active-task" id="focus-task-label">Ready to focus</div>
                <div class="focus-divider-line"></div>
                <div class="focus-actions-row">
                  <button class="btn-focus-primary" id="btn-focus-toggle">Start</button>
                  <button class="btn-focus-secondary" id="btn-focus-reset">Reset</button>
                </div>
                <div class="focus-progress-wrapper">
                  <div class="focus-progress-header"><span>Session Progress</span><span id="focus-progress-pct">0%</span></div>
                  <div class="focus-progress-bar"><div class="focus-progress-fill" id="focus-progress-fill"></div></div>
                </div>
              </div>
              <div class="focus-audio-bar">
                <button id="btn-toggle-sound" class="btn-toggle-audio">Ambient Sound</button>
                <div class="audio-sound-picker">
                  <button class="audio-chip active" data-sound="binaural">Binaural 432Hz</button>
                  <button class="audio-chip" data-sound="rain">Procedural Rain</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 6. Analytics Module View -->
          <div class="workspace-module-view" data-tab-panel="analytics">
            <div class="analytics-visual-container">
              <div class="analytics-top-bar">
                <div class="analytics-title-group">
                  <h3>Productivity Velocity</h3>
                </div>
                <div class="segmented-control" role="tablist">
                  <button class="segment-item active" data-timeframe="7d">7 Days</button>
                  <button class="segment-item" data-timeframe="30d">30 Days</button>
                </div>
              </div>
              <div class="flowing-activity-viewport">
                <svg id="flowing-svg-chart" class="flowing-svg-chart"></svg>
              </div>
              <div class="consistency-matrix-container">
                <div class="consistency-header"><span>Consistency Heatmap</span></div>
                <div class="consistency-grid" id="consistency-grid-target"></div>
              </div>
            </div>
          </div>

          <!-- 7. AI Intelligence View -->
          <div class="workspace-module-view" data-tab-panel="ai">
            <div class="card" style="padding: 32px;">
              <h3 style="font-size: 1.4rem; margin-bottom: 12px;">AURA Intelligence Engine</h3>
              <p style="color: var(--text-secondary); margin-bottom: 24px;">Ask questions regarding your projects, tasks, or sprint milestones.</p>
              <form id="ai-query-form" class="intelligence-input-bar">
                <input type="text" id="ai-input-query" placeholder="Ask AURA Intelligence anything..." autocomplete="off">
                <button type="submit" class="btn btn-secondary btn-sm">Submit</button>
              </form>
            </div>
          </div>

          <!-- 8. Settings View -->
          <div class="workspace-module-view" data-tab-panel="settings">
            <div class="card" style="padding: 32px; max-width: 680px;">
              <h3 style="font-size: 1.4rem; margin-bottom: 16px;">Workspace Preferences</h3>
              <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div><strong>Theme Appearance</strong><div style="font-size: 0.8rem; color: var(--text-secondary);">Switch between Dark and Light mode</div></div>
                  <button class="btn btn-secondary btn-sm" id="btn-settings-toggle-theme">Toggle Theme</button>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div><strong>Account Settings</strong><div style="font-size: 0.8rem; color: var(--text-secondary);">Manage profile and personalization</div></div>
                  <a href="/settings/profile" class="btn btn-secondary btn-sm" style="text-decoration:none;">Open Settings</a>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div><strong>AI Reasoning Engine</strong><div style="font-size: 0.8rem; color: var(--text-secondary);">Autonomous sprint synthesizer</div></div>
                  <span class="badge badge-emerald">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
}

export function initWorkspacePage() {
  const tabBtns = document.querySelectorAll('.app-nav-item');
  const viewPanels = document.querySelectorAll('.workspace-module-view');
  const breadcrumbEl = document.getElementById('app-breadcrumb-current');
  const clockEl = document.getElementById('workspace-clock');
  const themeBtn = document.getElementById('workspace-theme-btn');
  const settingsThemeBtn = document.getElementById('btn-settings-toggle-theme');
  const goCodingBtn = document.getElementById('btn-workspace-go-coding');
  const goFocusBtn = document.getElementById('btn-workspace-go-focus');

  // Live clock
  function tick() {
    if (!clockEl) return;
    const now = new Date();
    clockEl.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  }
  tick();
  const clockInterval = setInterval(tick, 1000);

  // Tab switching
  function switchTab(tabKey) {
    tabBtns.forEach((b) => b.classList.toggle('active', b.getAttribute('data-app-tab') === tabKey));
    viewPanels.forEach((p) => p.classList.toggle('active', p.getAttribute('data-tab-panel') === tabKey));

    if (breadcrumbEl) {
      const labels = {
        home: 'Home', learning: 'Learning', coding: 'Coding',
        projects: 'Projects', focus: 'Focus', analytics: 'Analytics',
        ai: 'AI Intelligence', settings: 'Settings'
      };
      breadcrumbEl.textContent = labels[tabKey] || tabKey;
    }

    // Lazy init modules on first activation
    if (tabKey === 'learning') initSkillConstellation();
    if (tabKey === 'coding') initCodePlayground();
    if (tabKey === 'projects') initProjectLab();
    if (tabKey === 'focus') initFocusMode();
    if (tabKey === 'analytics') initAnalyticsVisualizer();
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabKey = btn.getAttribute('data-app-tab');
      switchTab(tabKey);
    });
  });

  if (goCodingBtn) goCodingBtn.addEventListener('click', () => switchTab('coding'));
  if (goFocusBtn) goFocusBtn.addEventListener('click', () => switchTab('focus'));

  // Theme toggling
  function toggleTheme() {
    const root = document.documentElement;
    const cur = root.getAttribute('data-theme') || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('aura-theme', next);
  }

  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  if (settingsThemeBtn) settingsThemeBtn.addEventListener('click', toggleTheme);

  return () => {
    clearInterval(clockInterval);
  };
}
