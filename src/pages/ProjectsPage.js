/**
 * AURA Projects Page — /projects
 * User-isolated project workspace with search, filters, GitHub import wizard,
 * manual project creation, and status controls.
 */

import { projectStore } from '../data/projectStore.js';
import { githubService } from '../data/githubService.js';
import { getCurrentUser } from '../data/authService.js';
import { navigate } from '../router.js';
import { renderProjectCreationModal, initProjectCreationWizard, openProjectCreationWizard } from '../components/ProjectCreationModal.js';

// ─── Render ──────────────────────────────────────────────────────────────────

export function renderProjectsPage() {
  const user = getCurrentUser();
  const projects = projectStore.getProjects(user?.id);
  const stats = computeStats(projects);

  return `
    <!-- Project Wizard Modal -->
    ${renderProjectCreationModal()}

    <!-- GitHub Import Modal -->
    <div class="modal-overlay" id="modal-github-import" aria-hidden="true">
      <div class="modal-container" style="max-width: 680px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <h3 class="modal-title">Discover GitHub Repositories</h3>
          </div>
          <button type="button" class="modal-close" id="btn-close-gh-import" aria-label="Close modal">✕</button>
        </div>

        <div class="modal-body">
          <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 16px;">
            Select a repository to import as an active AURA project. Project tasks and architecture will be organized inside AURA without altering your GitHub code.
          </p>

          <div style="display: flex; gap: 10px; margin-bottom: 18px;">
            <input type="text" id="gh-import-username-input" class="form-input" placeholder="GitHub username or org (e.g. torvalds, vercel)" />
            <button type="button" id="btn-gh-fetch-repos" class="btn btn-primary btn-sm" style="white-space: nowrap;">
              Fetch Repositories
            </button>
          </div>

          <div id="gh-repos-list-container" style="max-height: 340px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;">
            <div style="text-align: center; padding: 30px; color: var(--text-tertiary); font-size: 0.8125rem;">
              Enter a GitHub username above to discover public repositories.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Projects Page Hero Header -->
    <section class="proj-page-hero">
      <div class="container">
        <div class="proj-hero-eyebrow">
          <span class="badge badge-indigo">Workspace Projects</span>
          <span class="proj-hero-count" id="proj-hero-count">${projects.length} project${projects.length !== 1 ? 's' : ''}</span>
        </div>
        <h1 class="proj-hero-headline">Build better projects.</h1>
        <p class="proj-hero-subtext">
          Plan milestones, design architecture, track development, and synchronize activity from GitHub into one command center.
        </p>

        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 18px;">
          <button class="btn btn-primary proj-new-btn" id="btn-open-create-project">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Project
          </button>

          <button class="btn btn-secondary proj-new-btn" id="btn-open-github-import" style="color: var(--accent-cyan); border-color: rgba(56, 189, 248, 0.3);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            Import from GitHub
          </button>
        </div>
      </div>
    </section>

    <!-- Statistics Band -->
    <section class="proj-stats-band">
      <div class="container">
        <div class="proj-stats-grid">
          <div class="proj-stat-item">
            <div class="proj-stat-value" id="stat-active">${String(stats.active).padStart(2, '0')}</div>
            <div class="proj-stat-label">Active Projects</div>
          </div>
          <div class="proj-stat-divider"></div>
          <div class="proj-stat-item">
            <div class="proj-stat-value" id="stat-completed">${String(stats.completed).padStart(2, '0')}</div>
            <div class="proj-stat-label">Completed</div>
          </div>
          <div class="proj-stat-divider"></div>
          <div class="proj-stat-item">
            <div class="proj-stat-value" id="stat-tasks">${String(stats.tasks)}</div>
            <div class="proj-stat-label">Tasks Tracked</div>
          </div>
          <div class="proj-stat-divider"></div>
          <div class="proj-stat-item">
            <div class="proj-stat-value" id="stat-progress">${stats.avgProgress}<span style="font-size: 0.55em; font-weight: 500;">%</span></div>
            <div class="proj-stat-label">Average Completion</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Toolbar: Search + Filters + Sort -->
    <section style="padding: 0 0 var(--space-6);">
      <div class="container">
        <div class="projects-toolbar">
          <div class="projects-search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" id="proj-search-input" placeholder="Search by name, tech, or source…" autocomplete="off">
          </div>

          <div class="projects-filter-group" id="proj-filter-group">
            <button class="filter-btn active" data-filter="all">All</button>
            <button class="filter-btn" data-filter="Active">Active</button>
            <button class="filter-btn" data-filter="Planning">Planning</button>
            <button class="filter-btn" data-filter="On Hold">On Hold</button>
            <button class="filter-btn" data-filter="Completed">Completed</button>
            <button class="filter-btn" data-filter="Archived">Archived</button>
          </div>

          <div class="projects-filter-group">
            <span style="font-size: var(--fs-micro); color: var(--text-tertiary); white-space: nowrap;">Source:</span>
            <button class="filter-btn active" data-source-filter="all">All</button>
            <button class="filter-btn" data-source-filter="github">GitHub</button>
            <button class="filter-btn" data-source-filter="manual">AURA</button>
          </div>

          <div class="projects-filter-group">
            <span style="font-size: var(--fs-micro); color: var(--text-tertiary); white-space: nowrap;">Sort:</span>
            <select class="filter-btn" id="proj-sort-select" style="border: 1px solid var(--border-subtle); cursor: pointer;">
              <option value="updated">Recently Updated</option>
              <option value="progress">Progress</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        <!-- Project Cards Grid -->
        <div class="proj-cards-grid" id="proj-cards-grid">
          ${projects.length > 0 ? renderProjectCards(projects) : renderEmptyState()}
        </div>
      </div>
    </section>
  `;
}

// ─── Template Helpers ─────────────────────────────────────────────────────────

function renderProjectCards(projects) {
  return projects.map(p => renderSingleCard(p)).join('');
}

function renderSingleCard(p) {
  const doneTasks = p.tasks ? p.tasks.filter(t => t.status === 'Done').length : 0;
  const totalTasks = p.tasks ? p.tasks.length : 0;
  const statusClass = p.status === 'Completed' ? 'badge-success' : p.status === 'On Hold' ? 'badge-warning' : p.status === 'Archived' ? 'badge' : 'badge-indigo';
  const priorityDot = p.priority === 'Critical' ? '#EF4444' : p.priority === 'High' ? '#F59E0B' : '#6366F1';
  const isGithub = p.source === 'github';

  return `
    <article class="proj-card" data-project-id="${p.id}" data-status="${p.status}" data-source="${p.source || 'manual'}" data-name="${p.name.toLowerCase()}" data-tech="${(p.technologies || []).join(' ').toLowerCase()}">
      <div class="proj-card-inner">
        <!-- Card Header -->
        <div class="proj-card-header">
          <div class="proj-card-title-row">
            <div class="proj-priority-indicator" style="background: ${priorityDot};" title="${p.priority} Priority"></div>
            <h3 class="proj-card-title">${escapeHtml(p.name)}</h3>
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <span class="badge ${isGithub ? 'badge-cyan' : 'badge'}">${isGithub ? 'GitHub' : 'AURA'}</span>
            <span class="badge ${statusClass}">${p.status}</span>
          </div>
        </div>

        <!-- Description -->
        <p class="proj-card-desc">${escapeHtml(p.description || 'No description provided.')}</p>

        <!-- Progress Bar -->
        <div class="proj-card-progress-section">
          <div class="proj-progress-label-row">
            <span>Progress</span>
            <span class="proj-progress-pct">${p.progress || 0}%</span>
          </div>
          <div class="proj-progress-track">
            <div class="proj-progress-fill" style="width: ${p.progress || 0}%;"></div>
          </div>
        </div>

        <!-- Tech Stack -->
        <div class="proj-card-tech-row">
          ${(p.technologies || []).slice(0, 4).map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
          ${(p.technologies || []).length > 4 ? `<span class="tech-tag">+${p.technologies.length - 4}</span>` : ''}
        </div>

        <!-- Meta Line -->
        <div class="project-card-meta-line">
          <span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            ${doneTasks}/${totalTasks} Tasks
          </span>
          ${isGithub ? `
            <span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              ★ ${p.stars || 0}
            </span>
          ` : ''}
        </div>

        <!-- CTA -->
        <div class="proj-card-footer">
          <button type="button" class="btn btn-ghost btn-sm proj-open-btn" data-project-id="${p.id}">
            Open Workspace
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderEmptyState() {
  return `
    <div class="projects-empty-state" id="proj-empty-state" style="grid-column: 1 / -1; padding: 48px 24px; text-align: center;">
      <div style="margin-bottom: 20px;">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="1.2" style="opacity: 0.6;">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      </div>
      <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
        Your workspace is ready.
      </h3>
      <p style="font-size: 0.875rem; color: var(--text-secondary); max-width: 420px; margin: 0 auto 24px; line-height: 1.45;">
        Connect GitHub to discover your existing repositories, or start fresh with a manual AURA project.
      </p>
      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
        <button type="button" class="btn btn-secondary btn-sm" id="btn-empty-import-gh">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
          Import from GitHub
        </button>
        <button type="button" class="btn btn-primary btn-sm" id="btn-empty-create">
          Create AURA Project
        </button>
      </div>
    </div>
  `;
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initProjectsPage() {
  const user = getCurrentUser();
  const uId = user?.id;

  const createBtn = document.getElementById('btn-open-create-project');
  if (createBtn) createBtn.addEventListener('click', openProjectCreationWizard);

  const emptyCreateBtn = document.getElementById('btn-empty-create');
  if (emptyCreateBtn) emptyCreateBtn.addEventListener('click', openProjectCreationWizard);

  // GitHub Import Modal triggers
  const ghModal = document.getElementById('modal-github-import');
  const openGhImportBtn = document.getElementById('btn-open-github-import');
  const emptyGhImportBtn = document.getElementById('btn-empty-import-gh');
  const closeGhImportBtn = document.getElementById('btn-close-gh-import');
  const fetchReposBtn = document.getElementById('btn-gh-fetch-repos');
  const ghUsernameInput = document.getElementById('gh-import-username-input');
  const reposContainer = document.getElementById('gh-repos-list-container');

  const openGhModal = () => {
    ghModal?.classList.add('active');
    ghUsernameInput?.focus();
  };

  const closeGhModal = () => {
    ghModal?.classList.remove('active');
  };

  openGhImportBtn?.addEventListener('click', openGhModal);
  emptyGhImportBtn?.addEventListener('click', openGhModal);
  closeGhImportBtn?.addEventListener('click', closeGhModal);
  ghModal?.addEventListener('click', (e) => {
    if (e.target === ghModal) closeGhModal();
  });

  // Fetch Repositories button handler
  fetchReposBtn?.addEventListener('click', async () => {
    const username = ghUsernameInput?.value.trim();
    if (!username) {
      alert('Please enter a GitHub username or organization.');
      return;
    }

    fetchReposBtn.disabled = true;
    fetchReposBtn.textContent = 'Discovering...';
    reposContainer.innerHTML = `<div style="text-align: center; padding: 24px;"><div class="auth-spinner" style="margin: 0 auto 10px;"></div><span>Fetching repositories for ${escapeHtml(username)}...</span></div>`;

    const res = await githubService.connectGitHub(uId, { username });
    fetchReposBtn.disabled = false;
    fetchReposBtn.textContent = 'Fetch Repositories';

    if (res.success && res.repositories.length > 0) {
      renderDiscoveredRepos(res.repositories);
    } else {
      reposContainer.innerHTML = `<div style="text-align: center; padding: 24px; color: #f87171;">${escapeHtml(res.error || 'No public repositories found for this account.')}</div>`;
    }
  });

  function renderDiscoveredRepos(repos) {
    reposContainer.innerHTML = repos.map(r => `
      <div style="background: var(--surface-elevated); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <div style="font-size: 0.875rem; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
            <span>${escapeHtml(r.name)}</span>
            <span class="badge" style="font-size: 0.65rem;">${r.primaryLanguage}</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-tertiary);">★ ${r.stars || 0} • Updated ${formatDate(r.updatedAt)}</div>
        </div>
        <button type="button" class="btn btn-primary btn-sm btn-add-gh-proj" data-repo-id="${r.id}" style="padding: 6px 14px; font-size: 0.75rem;">
          Add to AURA
        </button>
      </div>
    `).join('');

    reposContainer.querySelectorAll('.btn-add-gh-proj').forEach(btn => {
      btn.addEventListener('click', () => {
        const repoId = btn.dataset.repoId;
        const repo = repos.find(r => r.id === repoId);
        if (repo) {
          btn.disabled = true;
          btn.textContent = 'Adding...';
          const { project, isDuplicate } = projectStore.importGitHubProject(uId, repo);
          closeGhModal();
          if (isDuplicate) {
            alert(`"${repo.name}" is already in your AURA workspace.`);
          }
          navigate(`/projects/${project.id}`);
        }
      });
    });
  }

  // Init creation wizard
  initProjectCreationWizard((created) => {
    navigate(`/projects/${created.id}`);
  });

  bindCardButtons();
  initSearchFilter();

  return null;
}

function bindCardButtons() {
  document.querySelectorAll('.proj-open-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-project-id');
      if (id) navigate(`/projects/${id}`);
    });
  });

  document.querySelectorAll('.proj-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-project-id');
      if (id) navigate(`/projects/${id}`);
    });
  });
}

function initSearchFilter() {
  const searchInput = document.getElementById('proj-search-input');
  const statusFilterBtns = document.querySelectorAll('#proj-filter-group .filter-btn');
  const sourceFilterBtns = document.querySelectorAll('[data-source-filter]');
  const sortSelect = document.getElementById('proj-sort-select');

  let currentStatus = 'all';
  let currentSource = 'all';
  let searchQuery = '';

  function applyFilters() {
    const allCards = document.querySelectorAll('.proj-card');
    let visible = 0;

    allCards.forEach(card => {
      const name = card.getAttribute('data-name') || '';
      const tech = card.getAttribute('data-tech') || '';
      const status = card.getAttribute('data-status') || '';
      const source = card.getAttribute('data-source') || '';

      const matchesSearch = !searchQuery || name.includes(searchQuery) || tech.includes(searchQuery);
      const matchesStatus = currentStatus === 'all' || status === currentStatus;
      const matchesSource = currentSource === 'all' || source === currentSource;

      if (matchesSearch && matchesStatus && matchesSource) {
        card.style.display = '';
        visible++;
      } else {
        card.style.display = 'none';
      }
    });

    const emptyState = document.getElementById('proj-empty-state');
    if (emptyState) {
      emptyState.style.display = visible === 0 ? '' : 'none';
    }
  }

  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value.trim().toLowerCase();
    applyFilters();
  });

  statusFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      statusFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStatus = btn.getAttribute('data-filter');
      applyFilters();
    });
  });

  sourceFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sourceFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSource = btn.getAttribute('data-source-filter');
      applyFilters();
    });
  });

  sortSelect?.addEventListener('change', () => {
    const grid = document.getElementById('proj-cards-grid');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.proj-card'));
    const user = getCurrentUser();
    const projects = projectStore.getProjects(user?.id);

    cards.sort((a, b) => {
      const idA = a.getAttribute('data-project-id');
      const idB = b.getAttribute('data-project-id');
      const pA = projects.find(p => p.id === idA);
      const pB = projects.find(p => p.id === idB);
      if (!pA || !pB) return 0;

      if (sortSelect.value === 'progress') return (pB.progress || 0) - (pA.progress || 0);
      if (sortSelect.value === 'name') return pA.name.localeCompare(pB.name);
      return 0;
    });

    cards.forEach(card => grid.appendChild(card));
  });
}

function computeStats(projects) {
  const active = projects.filter(p => p.status === 'Active').length;
  const completed = projects.filter(p => p.status === 'Completed').length;
  const tasks = projects.reduce((acc, p) => acc + (p.tasks ? p.tasks.length : 0), 0);
  const avgProgress = projects.length > 0
    ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)
    : 0;
  return { active, completed, tasks, avgProgress };
}

function formatDate(dateStr) {
  if (!dateStr) return 'TBD';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
