/**
 * AURA Project Detail Workspace — /projects/:id
 * Tabs: Overview | Tasks (Kanban) | Architecture | Activity
 * Includes: Add Component modal, Connect Components, AI Insights, Timeline
 */

import { projectStore } from '../data/projectStore.js';
import { navigate } from '../router.js';
import { getCurrentUser } from '../data/authService.js';

let currentProjectId = null;
let currentUserId = null;

// ─── Render ──────────────────────────────────────────────────────────────────

export function renderProjectDetailPage(projectId) {
  currentProjectId = projectId;
  currentUserId = getCurrentUser()?.id || null;
  const project = projectStore.getProjectById(currentUserId, projectId);

  if (!project) {
    return `
      <div class="container" style="padding-top: clamp(8rem, 14vh, 10rem); text-align: center;">
        <h2 style="margin-bottom: 12px;">Project not found.</h2>
        <p style="color: var(--text-secondary); margin-bottom: 24px;">The project ID "${projectId}" doesn't exist in your workspace.</p>
        <a href="/projects" class="btn btn-primary">← Back to Projects</a>
      </div>
    `;
  }

  return `
    <!-- Add Component Modal -->
    ${renderAddComponentModal()}

    <!-- Task Creation Modal -->
    ${renderAddTaskModal()}

    <!-- Project Header + Sub-Navigation -->
    <div class="project-detail-header">
      <div class="container">
        <!-- Breadcrumbs -->
        <nav class="project-breadcrumbs" aria-label="Project breadcrumb">
          <a href="/projects">Projects</a>
          <span>›</span>
          <span>${project.name}</span>
        </nav>

        <!-- Project Title Row -->
        <div class="project-headline-row">
          <div class="project-headline-left">
            <h1 class="project-page-title">${project.name}</h1>
            <span class="badge ${project.status === 'Completed' ? 'badge-success' : 'badge-indigo'}">${project.status}</span>
            <span class="badge badge-cyan">${project.priority} Priority</span>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" id="btn-open-add-task">+ Add Task</button>
            <button class="btn btn-primary btn-sm" id="btn-open-add-component">+ Add Component</button>
          </div>
        </div>

        <!-- Sub-Tab Navigation -->
        <nav class="project-subnav-tabs" role="tablist">
          <button class="project-tab-btn active" data-proj-tab="overview" role="tab" aria-selected="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Overview
          </button>
          <button class="project-tab-btn" data-proj-tab="tasks" role="tab">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            Tasks
            <span style="background: var(--surface-elevated); border: 1px solid var(--border-subtle); border-radius: 20px; padding: 1px 7px; font-size: 0.68rem; font-family: var(--font-mono);">${project.tasks ? project.tasks.length : 0}</span>
          </button>
          <button class="project-tab-btn" data-proj-tab="architecture" role="tab">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Architecture
          </button>
          <button class="project-tab-btn" data-proj-tab="activity" role="tab">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            Activity
          </button>
        </nav>
      </div>
    </div>

    <!-- Tab Panels -->
    <div id="proj-detail-content" style="min-height: 60vh;">
      <!-- Overview Tab -->
      <div class="project-subview-panel active" data-proj-panel="overview">
        ${renderOverviewPanel(project)}
      </div>

      <!-- Tasks Tab -->
      <div class="project-subview-panel" data-proj-panel="tasks">
        ${renderTasksPanel(project)}
      </div>

      <!-- Architecture Tab -->
      <div class="project-subview-panel" data-proj-panel="architecture">
        ${renderArchitecturePanel(project)}
      </div>

      <!-- Activity Tab -->
      <div class="project-subview-panel" data-proj-panel="activity">
        ${renderActivityPanel(project)}
      </div>
    </div>
  `;
}

// ─── Overview Panel ───────────────────────────────────────────────────────────

function renderOverviewPanel(project) {
  const doneTasks = project.tasks ? project.tasks.filter(t => t.status === 'Done').length : 0;
  const totalTasks = project.tasks ? project.tasks.length : 0;
  const currentPhase = project.milestones
    ? (project.milestones.find(m => m.status === 'In Progress') || project.milestones[0])
    : null;

  return `
    <div class="container">
      <div class="proj-overview-grid">

        <!-- LEFT COLUMN: Status Cards + Progress + Timeline -->
        <div class="proj-overview-left">

          <!-- Quick Stats Row -->
          <div class="proj-stat-cards-row">
            <div class="proj-quick-stat">
              <div class="proj-qs-label">Progress</div>
              <div class="proj-qs-value">${project.progress}<span style="font-size: 0.6em;">%</span></div>
            </div>
            <div class="proj-quick-stat">
              <div class="proj-qs-label">Tasks Done</div>
              <div class="proj-qs-value">${doneTasks}<span style="font-size: 0.6em; font-weight:400;">/${totalTasks}</span></div>
            </div>
            <div class="proj-quick-stat">
              <div class="proj-qs-label">Deadline</div>
              <div class="proj-qs-value" style="font-size: 1.1rem;">${formatDate(project.deadline)}</div>
            </div>
            <div class="proj-quick-stat">
              <div class="proj-qs-label">Phase</div>
              <div class="proj-qs-value" style="font-size: 1rem; font-weight: 500;">${currentPhase ? currentPhase.status : '—'}</div>
            </div>
          </div>

          <!-- Main Progress Bar -->
          <div class="proj-overview-progress-card">
            <div class="proj-progress-label-row" style="margin-bottom: 10px;">
              <div>
                <div style="font-size: var(--fs-micro); font-weight:700; text-transform: uppercase; letter-spacing: var(--ls-caps); color: var(--text-tertiary);">Project Completion</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">${doneTasks} of ${totalTasks} tasks complete</div>
              </div>
              <div style="font-size: 2.5rem; font-weight: 700; font-variant-numeric: tabular-nums; color: var(--text-primary); line-height: 1;">${project.progress}%</div>
            </div>
            <div class="proj-progress-track" style="height: 10px; border-radius: 999px;">
              <div class="proj-progress-fill" style="width: ${project.progress}%; height: 100%;"></div>
            </div>
            ${currentPhase ? `<div style="margin-top: 10px; font-size: var(--fs-micro); color: var(--accent-cyan);">Current phase: ${currentPhase.name}</div>` : ''}
          </div>

          <!-- Milestone Timeline -->
          <div class="proj-overview-card">
            <div class="proj-card-section-title">Project Timeline</div>
            <div class="proj-milestone-timeline">
              ${(project.milestones || []).map((m, i) => `
                <div class="proj-timeline-step ${m.status === 'Completed' ? 'done' : m.status === 'In Progress' ? 'active' : ''}">
                  <div class="proj-timeline-dot">
                    ${m.status === 'Completed' ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>` : `<span>${i + 1}</span>`}
                  </div>
                  <div class="proj-timeline-content">
                    <div class="proj-timeline-name">${m.name}</div>
                    <div class="proj-timeline-date">${m.date}</div>
                  </div>
                  <div class="proj-timeline-status-badge">
                    <span class="badge ${m.status === 'Completed' ? 'badge-success' : m.status === 'In Progress' ? 'badge-cyan' : ''}" style="font-size: 0.65rem;">${m.status}</span>
                  </div>
                </div>
                ${i < (project.milestones.length - 1) ? '<div class="proj-timeline-connector"></div>' : ''}
              `).join('')}
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Description + Tech + AI Insights -->
        <div class="proj-overview-right">

          <!-- Project Description -->
          <div class="proj-overview-card">
            <div class="proj-card-section-title">About this project</div>
            <p style="font-size: var(--fs-small); color: var(--text-secondary); line-height: var(--lh-relaxed);">${project.description}</p>
            <div class="project-card-meta-line" style="margin-top: 14px;">
              <span>Category: <strong style="color: var(--text-primary);">${project.category}</strong></span>
            </div>
          </div>

          <!-- Technology Stack -->
          <div class="proj-overview-card">
            <div class="proj-card-section-title">Technology Stack</div>
            <div class="proj-tech-badges">
              ${(project.technologies || []).map(t => `
                <div class="proj-tech-badge">
                  <div class="proj-tech-dot"></div>
                  <span>${t}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Next Milestone -->
          ${project.nextMilestone ? `
            <div class="proj-overview-card proj-next-milestone-card">
              <div class="proj-card-section-title">Next Milestone</div>
              <div style="display: flex; align-items: flex-start; gap: 10px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <div>
                  <div style="font-size: var(--fs-small); font-weight: 600; color: var(--text-primary);">${project.nextMilestone}</div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- AI Insights Panel -->
          <div class="proj-overview-card proj-ai-insights-card">
            <div class="proj-card-section-title" style="color: var(--accent-cyan);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline; margin-right:5px;">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              AURA Intelligence
            </div>
            <ul class="proj-ai-insights-list">
              ${(project.aiInsights || ['No insights available for this project.']).map(insight => `
                <li class="proj-ai-insight-item">
                  <div class="proj-insight-dot"></div>
                  <span>${insight}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ─── Tasks Panel (Kanban) ──────────────────────────────────────────────────────

function renderTasksPanel(project) {
  const statuses = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'];
  const statusColors = {
    'Backlog': '#6B7280',
    'Todo': '#6366F1',
    'In Progress': '#F59E0B',
    'Review': '#38BDF8',
    'Done': '#10B981'
  };

  return `
    <div class="container">
      <div class="kanban-board-container" id="kanban-board">
        ${statuses.map(status => {
          const colTasks = (project.tasks || []).filter(t => t.status === status);
          return `
            <div class="kanban-column" data-column="${status}" id="col-${status.toLowerCase().replace(' ', '-')}">
              <div class="kanban-column-header">
                <div class="kanban-col-title">
                  <span class="kanban-col-dot" style="width:8px;height:8px;border-radius:50%;background:${statusColors[status]};display:inline-block;"></span>
                  ${status}
                </div>
                <span style="font-size: var(--fs-micro); color: var(--text-tertiary); font-family: var(--font-mono);">${colTasks.length}</span>
              </div>
              <div class="kanban-col-cards" id="kanban-col-${status.replace(' ', '-')}">
                ${colTasks.map(task => renderKanbanCard(task, project.id)).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderKanbanCard(task, projectId) {
  const priorityColors = { Critical: '#EF4444', High: '#F59E0B', Medium: '#6366F1', Low: '#6B7280' };
  const color = priorityColors[task.priority] || '#6B7280';

  return `
    <div class="kanban-task-card" draggable="true" data-task-id="${task.id}" data-project-id="${projectId}">
      <div class="task-card-header">
        <span class="task-card-title">${task.title}</span>
        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${color}; flex-shrink: 0;" title="${task.priority} Priority"></div>
      </div>
      <div class="task-card-desc">${task.description || ''}</div>
      <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
        ${(task.tags || []).map(tag => `<span class="tech-tag" style="font-size: 0.68rem;">${tag}</span>`).join('')}
      </div>
      <div class="task-card-footer">
        <span>${task.due ? '📅 ' + task.due : ''}</span>
        <select class="task-move-select" data-task-id="${task.id}" data-project-id="${projectId}" aria-label="Move task to column">
          <option value="">Move to…</option>
          ${['Backlog', 'Todo', 'In Progress', 'Review', 'Done']
            .filter(s => s !== task.status)
            .map(s => `<option value="${s}">${s}</option>`)
            .join('')}
        </select>
      </div>
    </div>
  `;
}

// ─── Architecture Panel ────────────────────────────────────────────────────────

function renderArchitecturePanel(project) {
  const arch = project.architecture || { layers: [], components: [], connections: [] };

  return `
    <div class="container">
      <!-- Controls Bar -->
      <div class="arch-controls-bar">
        <div style="display: flex; gap: 6px;" id="arch-view-tabs">
          <button class="filter-btn active" data-arch-view="diagram">Diagram</button>
          <button class="filter-btn" data-arch-view="list">List</button>
          <button class="filter-btn" data-arch-view="flow">Flow</button>
        </div>
        <div style="font-size: var(--fs-micro); color: var(--text-tertiary);">
          ${arch.components.length} components · ${arch.connections.length} connections
        </div>
      </div>

      <!-- Diagram View (default) -->
      <div id="arch-view-diagram" class="arch-view-panel">
        <div class="arch-canvas-viewport" id="arch-canvas-wrapper">
          <canvas id="arch-interactive-canvas" aria-label="Architecture diagram canvas"></canvas>
          <div id="arch-canvas-tooltip" style="position:absolute;background:var(--surface-elevated);border:1px solid var(--border-standard);border-radius:var(--radius-sm);padding:8px 12px;font-size:0.78rem;pointer-events:none;opacity:0;transition:opacity 0.15s;max-width:220px;z-index:10;"></div>
        </div>
        <div style="margin-top: 14px; display: flex; gap: 16px; flex-wrap: wrap;">
          ${arch.layers.map((layer, i) => `
            <div style="display: flex; align-items: center; gap: 6px; font-size: var(--fs-micro); color: var(--text-secondary);">
              <div style="width: 10px; height: 10px; border-radius: 3px; background: ${getLayerColor(i)};"></div>
              ${layer}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- List View -->
      <div id="arch-view-list" class="arch-view-panel" style="display: none;">
        <div class="arch-layer-groups-container">
          ${arch.layers.map(layer => {
            const comps = arch.components.filter(c => c.layer === layer);
            if (!comps.length) return '';
            return `
              <div class="arch-layer-block">
                <div class="arch-layer-title">${layer}</div>
                <div class="arch-components-grid">
                  ${comps.map(c => `
                    <div class="arch-comp-card">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <span style="font-weight: 600; font-size: var(--fs-small); color: var(--text-primary);">${c.name}</span>
                        <span class="badge badge-indigo" style="font-size: 0.65rem;">${c.type}</span>
                      </div>
                      <div style="font-size: var(--fs-micro); font-family: var(--font-mono); color: var(--accent-cyan);">${c.technology}</div>
                      <div style="font-size: var(--fs-micro); color: var(--text-secondary);">${c.description}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Flow View -->
      <div id="arch-view-flow" class="arch-view-panel" style="display: none;">
        <div class="arch-flow-sequence">
          ${arch.connections.map((conn, i) => {
            const from = arch.components.find(c => c.id === conn.from);
            const to = arch.components.find(c => c.id === conn.to);
            return `
              <div class="arch-flow-step">
                <div class="arch-flow-step-num">${i + 1}</div>
                <div style="flex: 1;">
                  <div style="font-weight: 600; font-size: var(--fs-small);">${from ? from.name : conn.from}</div>
                  <div style="font-size: var(--fs-micro); color: var(--accent-cyan); font-family: var(--font-mono);">→ ${conn.label || 'Data Flow'}</div>
                  <div style="font-size: var(--fs-micro); color: var(--text-secondary); margin-top: 3px;">${to ? to.name : conn.to}</div>
                </div>
              </div>
              ${i < arch.connections.length - 1 ? '<div class="arch-flow-connector-line"></div>' : ''}
            `;
          }).join('')}
          ${arch.connections.length === 0 ? '<div class="projects-empty-state"><h3>No connections defined yet.</h3><p>Add components and connect them to visualize data flow.</p></div>' : ''}
        </div>
      </div>
    </div>
  `;
}

// ─── Activity Panel ────────────────────────────────────────────────────────────

function renderActivityPanel(project) {
  const activity = project.activity || [];

  return `
    <div class="container" style="max-width: 760px;">
      <div class="proj-activity-header">
        <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 4px;">Activity Log</h2>
        <p style="font-size: var(--fs-small); color: var(--text-secondary);">${activity.length} recorded events for ${project.name}.</p>
      </div>

      <div class="proj-activity-timeline" style="margin-top: var(--space-6);">
        ${activity.length === 0 ? `
          <div class="projects-empty-state">
            <h3>No activity yet.</h3>
            <p>Start working on your project to see events here.</p>
          </div>
        ` : activity.map(evt => `
          <div class="proj-activity-item">
            <div class="proj-activity-dot"></div>
            <div class="proj-activity-content">
              <div class="proj-activity-text">${evt.text}</div>
              <div class="proj-activity-time">${evt.timestamp}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ─── Add Component Modal ──────────────────────────────────────────────────────

function renderAddComponentModal() {
  return `
    <div id="add-component-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-label="Add Architecture Component">
      <div class="modal-container" style="max-width: 560px;">
        <div class="modal-header">
          <div>
            <span class="badge badge-indigo" style="margin-bottom: 6px;">Architecture</span>
            <h3 class="modal-title">Add Component</h3>
          </div>
          <button id="btn-close-add-component" class="modal-close" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Component Name *</label>
            <input type="text" id="comp-name" class="form-input" placeholder="e.g. Vision Service">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Type</label>
              <select id="comp-type" class="form-select">
                <option>Frontend</option><option>Backend</option><option>Database</option>
                <option>AI Model</option><option>API</option><option>Service</option>
                <option>Queue</option><option>Storage</option><option>Authentication</option>
                <option>External API</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Architecture Layer</label>
              <input type="text" id="comp-layer" class="form-input" placeholder="e.g. AI Inference">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Technology</label>
            <input type="text" id="comp-tech" class="form-input" placeholder="e.g. Python + MediaPipe">
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea id="comp-desc" class="form-textarea" rows="2" placeholder="What does this component do?"></textarea>
          </div>
        </div>
        <div class="modal-footer" style="padding: 16px 24px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: flex-end; gap: 10px;">
          <button class="btn btn-secondary btn-sm" id="btn-close-add-component-footer">Cancel</button>
          <button class="btn btn-primary btn-sm" id="btn-submit-add-component">Add Component</button>
        </div>
      </div>
    </div>
  `;
}

// ─── Add Task Modal ───────────────────────────────────────────────────────────

function renderAddTaskModal() {
  return `
    <div id="add-task-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-label="Add Task">
      <div class="modal-container" style="max-width: 520px;">
        <div class="modal-header">
          <div>
            <span class="badge badge-cyan" style="margin-bottom: 6px;">Tasks</span>
            <h3 class="modal-title">New Task</h3>
          </div>
          <button id="btn-close-add-task" class="modal-close" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Task Title *</label>
            <input type="text" id="task-title" class="form-input" placeholder="e.g. Implement keypoint normalization">
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea id="task-desc" class="form-textarea" rows="2" placeholder="What needs to be done?"></textarea>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Status</label>
              <select id="task-status" class="form-select">
                <option>Backlog</option><option>Todo</option><option>In Progress</option>
                <option>Review</option><option>Done</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Priority</label>
              <select id="task-priority" class="form-select">
                <option>High</option><option>Critical</option><option>Medium</option><option>Low</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Due Date</label>
              <input type="text" id="task-due" class="form-input" placeholder="e.g. Oct 18">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Tags (comma separated)</label>
            <input type="text" id="task-tags" class="form-input" placeholder="e.g. Python, ML, Testing">
          </div>
        </div>
        <div class="modal-footer" style="padding: 16px 24px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: flex-end; gap: 10px;">
          <button class="btn btn-secondary btn-sm" id="btn-close-add-task-footer">Cancel</button>
          <button class="btn btn-primary btn-sm" id="btn-submit-add-task">Create Task</button>
        </div>
      </div>
    </div>
  `;
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initProjectDetailPage(projectId) {
  currentProjectId = projectId;
  currentUserId = getCurrentUser()?.id || null;

  initSubTabs();
  initKanbanDragDrop();
  initKanbanStatusSelects();
  initAddComponentModal();
  initAddTaskModal();
  initArchitectureCanvas();
  initArchViewTabs();

  return null;
}

// ─── Sub-Tab Switching ────────────────────────────────────────────────────────

function initSubTabs() {
  const tabs = document.querySelectorAll('[data-proj-tab]');
  const panels = document.querySelectorAll('[data-proj-panel]');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-proj-tab');

      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.querySelector(`[data-proj-panel="${target}"]`);
      if (panel) panel.classList.add('active');

      // Re-draw canvas when architecture tab becomes visible
      if (target === 'architecture') {
        setTimeout(initArchitectureCanvas, 50);
      }
    });
  });
}

// ─── Kanban Drag & Drop ────────────────────────────────────────────────────────

function initKanbanDragDrop() {
  let draggedCard = null;
  let draggedTaskId = null;
  let draggedProjectId = null;

  document.querySelectorAll('.kanban-task-card').forEach(card => {
    card.addEventListener('dragstart', (e) => {
      draggedCard = card;
      draggedTaskId = card.getAttribute('data-task-id');
      draggedProjectId = card.getAttribute('data-project-id');
      card.style.opacity = '0.5';
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      if (draggedCard) draggedCard.style.opacity = '';
      draggedCard = null;
    });
  });

  document.querySelectorAll('.kanban-col-cards').forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      col.classList.add('kanban-drop-target');
    });

    col.addEventListener('dragleave', () => {
      col.classList.remove('kanban-drop-target');
    });

    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('kanban-drop-target');

      if (!draggedCard || !draggedTaskId) return;

      const columnEl = col.closest('[data-column]');
      const newStatus = columnEl ? columnEl.getAttribute('data-column') : null;
      if (!newStatus) return;

      col.appendChild(draggedCard);
      projectStore.updateTaskStatus(currentUserId, draggedProjectId, draggedTaskId, newStatus);
      draggedCard.style.opacity = '';

      // Update the move select options
      const moveSelect = draggedCard.querySelector('.task-move-select');
      if (moveSelect) {
        moveSelect.innerHTML = `<option value="">Move to…</option>${
          ['Backlog', 'Todo', 'In Progress', 'Review', 'Done']
            .filter(s => s !== newStatus)
            .map(s => `<option value="${s}">${s}</option>`)
            .join('')
        }`;
        // Re-bind
        bindMoveSelectChange(moveSelect);
      }

      // Update column count badge
      updateColumnCounts();
    });
  });
}

function updateColumnCounts() {
  document.querySelectorAll('.kanban-column').forEach(col => {
    const count = col.querySelectorAll('.kanban-task-card').length;
    const badge = col.querySelector('.kanban-column-header span[style]');
    if (badge) badge.textContent = count;
  });
}

function initKanbanStatusSelects() {
  document.querySelectorAll('.task-move-select').forEach(sel => {
    bindMoveSelectChange(sel);
  });
}

function bindMoveSelectChange(sel) {
  sel.addEventListener('change', () => {
    const newStatus = sel.value;
    if (!newStatus) return;

    const taskId = sel.getAttribute('data-task-id');
    const projectId = sel.getAttribute('data-project-id');
    projectStore.updateTaskStatus(currentUserId, projectId, taskId, newStatus);

    // Move card to correct column
    const card = sel.closest('.kanban-task-card');
    const targetCol = document.getElementById(`kanban-col-${newStatus.replace(' ', '-')}`);
    if (card && targetCol) {
      targetCol.appendChild(card);
      sel.innerHTML = `<option value="">Move to…</option>${
        ['Backlog', 'Todo', 'In Progress', 'Review', 'Done']
          .filter(s => s !== newStatus)
          .map(s => `<option value="${s}">${s}</option>`)
          .join('')
      }`;
    }
    updateColumnCounts();
  });
}

// ─── Add Component Modal ──────────────────────────────────────────────────────

function initAddComponentModal() {
  const openBtn = document.getElementById('btn-open-add-component');
  const modal = document.getElementById('add-component-modal');
  const closeBtn = document.getElementById('btn-close-add-component');
  const closeFooterBtn = document.getElementById('btn-close-add-component-footer');
  const submitBtn = document.getElementById('btn-submit-add-component');

  function open() { if (modal) modal.classList.add('active'); }
  function close() { if (modal) modal.classList.remove('active'); }

  if (openBtn) openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (closeFooterBtn) closeFooterBtn.addEventListener('click', close);
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) close(); });

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const name = document.getElementById('comp-name')?.value.trim();
      if (!name) { alert('Please enter a component name.'); return; }

      const comp = {
        name,
        type: document.getElementById('comp-type')?.value || 'Service',
        layer: document.getElementById('comp-layer')?.value.trim() || 'General',
        technology: document.getElementById('comp-tech')?.value.trim() || 'TypeScript',
        description: document.getElementById('comp-desc')?.value.trim() || ''
      };

      projectStore.addArchitectureComponent(currentUserId, currentProjectId, comp);
      close();

      // Refresh architecture panel
      const archPanel = document.querySelector('[data-proj-panel="architecture"]');
      const project = projectStore.getProjectById(currentUserId, currentProjectId);
      if (archPanel && project) {
        archPanel.innerHTML = renderArchitecturePanel(project);
        initArchViewTabs();
        initArchitectureCanvas();
      }
    });
  }
}

// ─── Add Task Modal ───────────────────────────────────────────────────────────

function initAddTaskModal() {
  const openBtn = document.getElementById('btn-open-add-task');
  const modal = document.getElementById('add-task-modal');
  const closeBtn = document.getElementById('btn-close-add-task');
  const closeFooterBtn = document.getElementById('btn-close-add-task-footer');
  const submitBtn = document.getElementById('btn-submit-add-task');

  function open() { if (modal) modal.classList.add('active'); }
  function close() { if (modal) modal.classList.remove('active'); }

  if (openBtn) openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (closeFooterBtn) closeFooterBtn.addEventListener('click', close);
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) close(); });

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const title = document.getElementById('task-title')?.value.trim();
      if (!title) { alert('Please enter a task title.'); return; }

      const tagsRaw = document.getElementById('task-tags')?.value.trim() || '';
      const task = {
        title,
        description: document.getElementById('task-desc')?.value.trim() || '',
        status: document.getElementById('task-status')?.value || 'Todo',
        priority: document.getElementById('task-priority')?.value || 'Medium',
        due: document.getElementById('task-due')?.value.trim() || 'Upcoming',
        tags: tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : ['Task']
      };

      const created = projectStore.addTask(currentUserId, currentProjectId, task);
      close();

      // Append card to correct kanban column
      const targetCol = document.getElementById(`kanban-col-${task.status.replace(' ', '-')}`);
      if (targetCol && created) {
        const div = document.createElement('div');
        div.innerHTML = renderKanbanCard(created, currentProjectId);
        const card = div.firstElementChild;
        targetCol.appendChild(card);
        initKanbanDragDrop();
        bindMoveSelectChange(card.querySelector('.task-move-select'));
        updateColumnCounts();
      }

      // Clear form
      ['task-title', 'task-desc', 'task-tags', 'task-due'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
    });
  }
}

// ─── Architecture Canvas Diagram ──────────────────────────────────────────────

function initArchViewTabs() {
  const tabs = document.querySelectorAll('[data-arch-view]');
  const views = { diagram: 'arch-view-diagram', list: 'arch-view-list', flow: 'arch-view-flow' };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const view = tab.getAttribute('data-arch-view');
      Object.values(views).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      const targetEl = document.getElementById(views[view]);
      if (targetEl) targetEl.style.display = 'block';

      if (view === 'diagram') setTimeout(initArchitectureCanvas, 50);
    });
  });
}

function getLayerColor(index) {
  const palette = ['#6366F1', '#38BDF8', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  return palette[index % palette.length];
}

function initArchitectureCanvas() {
  const canvas = document.getElementById('arch-interactive-canvas');
  if (!canvas) return;

  const project = projectStore.getProjectById(currentUserId, currentProjectId);
  if (!project || !project.architecture) return;


  const arch = project.architecture;
  const comps = arch.components || [];
  const conns = arch.connections || [];
  const layers = arch.layers || [];

  const wrapper = document.getElementById('arch-canvas-wrapper');
  if (!wrapper) return;

  const W = wrapper.clientWidth || 800;
  const H = wrapper.clientHeight || 560;
  canvas.width = W * window.devicePixelRatio;
  canvas.height = H * window.devicePixelRatio;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  // Determine positions: lay out by layer horizontally
  const nodeW = 160, nodeH = 68, nodeRadius = 10;
  const padding = 40;

  // Group components by layer
  const layerGroups = {};
  layers.forEach(l => { layerGroups[l] = []; });
  comps.forEach(c => {
    if (!layerGroups[c.layer]) layerGroups[c.layer] = [];
    layerGroups[c.layer].push(c);
  });

  const layerList = layers.filter(l => layerGroups[l] && layerGroups[l].length > 0);
  const numLayers = layerList.length;
  const availW = W - padding * 2;
  const layerSpacingX = numLayers > 1 ? availW / (numLayers - 1) : availW / 2;

  const nodePositions = {};
  layerList.forEach((layer, li) => {
    const group = layerGroups[layer];
    const cx = numLayers === 1 ? W / 2 : padding + li * layerSpacingX;
    group.forEach((comp, ci) => {
      const groupH = group.length * (nodeH + 20) - 20;
      const startY = H / 2 - groupH / 2;
      const y = startY + ci * (nodeH + 20);
      nodePositions[comp.id] = { x: cx, y, comp, li };
    });
  });

  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const bgColor = isDark ? '#0A0A0B' : '#F5F5F7';
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const textPrimary = isDark ? '#F5F5F7' : '#1D1D1F';
  const textSecondary = isDark ? '#86868B' : '#6E6E73';

  // Polyfill for browsers without native roundRect (older Safari)
  if (!ctx.roundRect) {
    ctx.roundRect = function(x, y, w, h, r) {
      const radii = Array.isArray(r) ? r : [r, r, r, r];
      const [tl, tr, br, bl] = radii;
      this.moveTo(x + tl, y);
      this.lineTo(x + w - tr, y);
      this.quadraticCurveTo(x + w, y, x + w, y + tr);
      this.lineTo(x + w, y + h - br);
      this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
      this.lineTo(x + bl, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - bl);
      this.lineTo(x, y + tl);
      this.quadraticCurveTo(x, y, x + tl, y);
    };
  }



  function draw(highlightId = null) {
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    // Draw connections
    conns.forEach(conn => {
      const from = nodePositions[conn.from];
      const to = nodePositions[conn.to];
      if (!from || !to) return;

      const fx = from.x, fy = from.y + nodeH / 2;
      const tx = to.x, ty = to.y + nodeH / 2;

      // Bezier curve
      const cpx1 = fx + (tx - fx) * 0.5;
      const cpy1 = fy;
      const cpx2 = fx + (tx - fx) * 0.5;
      const cpy2 = ty;

      // Animated dash
      const isHighlighted = highlightId === conn.from || highlightId === conn.to;
      ctx.beginPath();
      ctx.strokeStyle = isHighlighted ? '#38BDF8' : 'rgba(99,102,241,0.45)';
      ctx.lineWidth = isHighlighted ? 2 : 1.5;
      ctx.setLineDash(isHighlighted ? [] : [5, 4]);
      ctx.moveTo(fx, fy);
      ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrow head
      const angle = Math.atan2(ty - cpy2, tx - cpx2);
      const arrowLen = 10;
      ctx.beginPath();
      ctx.fillStyle = isHighlighted ? '#38BDF8' : 'rgba(99,102,241,0.7)';
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - arrowLen * Math.cos(angle - 0.4), ty - arrowLen * Math.sin(angle - 0.4));
      ctx.lineTo(tx - arrowLen * Math.cos(angle + 0.4), ty - arrowLen * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fill();

      // Label
      if (conn.label) {
        const mx = (fx + tx) / 2;
        const my = (fy + ty) / 2 - 8;
        ctx.font = '10px monospace';
        ctx.fillStyle = textSecondary;
        ctx.textAlign = 'center';
        ctx.fillText(conn.label, mx, my);
      }
    });

    // Draw nodes
    Object.values(nodePositions).forEach(({ x, y, comp, li }) => {
      const isHighlighted = highlightId === comp.id;
      const nx = x - nodeW / 2;
      const layerColor = getLayerColor(li);

      // Card shadow
      ctx.shadowColor = isHighlighted ? layerColor : 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = isHighlighted ? 16 : 8;
      ctx.shadowOffsetY = 2;

      // Card background
      ctx.beginPath();
      ctx.roundRect(nx, y, nodeW, nodeH, nodeRadius);
      ctx.fillStyle = cardBg;
      ctx.fill();

      // Card border
      ctx.strokeStyle = isHighlighted ? layerColor : cardBorder;
      ctx.lineWidth = isHighlighted ? 2 : 1;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      // Colored top accent strip
      ctx.beginPath();
      ctx.roundRect(nx, y, nodeW, 4, [nodeRadius, nodeRadius, 0, 0]);
      ctx.fillStyle = layerColor;
      ctx.fill();

      // Component name
      ctx.font = 'bold 11.5px -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
      ctx.fillStyle = textPrimary;
      ctx.textAlign = 'center';
      const displayName = comp.name.length > 20 ? comp.name.substring(0, 18) + '…' : comp.name;
      ctx.fillText(displayName, x, y + 28);

      // Technology
      ctx.font = '10px monospace';
      ctx.fillStyle = '#38BDF8';
      const displayTech = (comp.technology || '').length > 22 ? comp.technology.substring(0, 20) + '…' : comp.technology;
      ctx.fillText(displayTech, x, y + 44);

      // Type badge
      ctx.font = '9px -apple-system, sans-serif';
      ctx.fillStyle = textSecondary;
      ctx.fillText(comp.type, x, y + 60);
    });
  }

  draw();

  // Hover tooltip
  const tooltip = document.getElementById('arch-canvas-tooltip');
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left);
    const my = (e.clientY - rect.top);

    let hovered = null;
    Object.values(nodePositions).forEach(({ x, y, comp }) => {
      const nx = x - nodeW / 2;
      if (mx >= nx && mx <= nx + nodeW && my >= y && my <= y + nodeH) {
        hovered = comp;
      }
    });

    draw(hovered ? hovered.id : null);

    if (hovered && tooltip) {
      tooltip.style.opacity = '1';
      tooltip.style.left = (mx + 16) + 'px';
      tooltip.style.top = (my - 8) + 'px';
      tooltip.innerHTML = `
        <strong>${hovered.name}</strong><br>
        <span style="color: #38BDF8; font-family: monospace; font-size: 0.75rem;">${hovered.technology}</span><br>
        <span style="color: var(--text-secondary); font-size: 0.75rem;">${hovered.description || ''}</span>
      `;
    } else if (tooltip) {
      tooltip.style.opacity = '0';
    }
  });

  canvas.addEventListener('mouseleave', () => {
    draw();
    if (tooltip) tooltip.style.opacity = '0';
  });
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return 'TBD';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}
