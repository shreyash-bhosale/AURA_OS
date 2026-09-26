/**
 * AURA — Personalization Settings Page
 * Fine-tune modules, goals, organization styles, and test demo archetype profiles.
 */

import { getCurrentUser } from '../data/authService.js';
import { loadProfile, updateProfile, ALL_MODULES, DEMO_PROFILES } from '../data/userProfile.js';
import { navigate } from '../router.js';

export function renderSettingsPersonalizationPage() {
  const user = getCurrentUser();
  const profile = user ? loadProfile(user.id) : null;

  const currentModules = profile?.modules || ['projects', 'tasks', 'goals', 'focus', 'analytics'];
  const currentRoles = profile?.roles || ['Developer'];
  const currentGoals = profile?.goals || ['Build projects'];
  const currentPriority = profile?.primaryPriority || 'Building';
  const currentStyle = profile?.organizationStyle || 'Kanban board';

  return `
    <div class="settings-viewport">
      <div class="settings-header">
        <div class="settings-eyebrow">Workspace Calibration</div>
        <h1 class="settings-title">Personalization Engine</h1>
        <p class="settings-desc">Customize which modules, widgets, and workflow paradigms AURA activates for you.</p>
      </div>

      <!-- Settings Sub-Navigation Tabs -->
      <nav class="settings-tabs" aria-label="Settings navigation">
        <a href="/settings/profile" class="settings-tab-link">Profile</a>
        <a href="/settings/personalization" class="settings-tab-link active">Personalization</a>
      </nav>

      <div id="personalization-alert" style="display: none; margin-bottom: 20px;" class="auth-alert auth-alert-success">
        Workspace configuration updated.
      </div>

      <!-- Section 1: Instant Archetype Switcher (For Testing & Evaluation) -->
      <section class="settings-section">
        <div class="settings-section-header">
          <div>
            <h2 class="settings-section-title">Evaluation Archetypes</h2>
            <p class="settings-section-desc">Instantly test how AURA configures itself for distinct user personas.</p>
          </div>
        </div>

        <div class="archetype-quick-buttons">
          <button type="button" class="btn-archetype-chip" data-persona="student">
            🎓 Alex Chen (Student)
          </button>
          <button type="button" class="btn-archetype-chip" data-persona="developer">
            💻 Jordan Smith (Developer)
          </button>
          <button type="button" class="btn-archetype-chip" data-persona="founder">
            🚀 Sam Rivera (Founder)
          </button>
          <button type="button" class="btn-archetype-chip" data-persona="designer">
            🎨 Morgan Lee (Designer)
          </button>
        </div>
      </section>

      <!-- Section 2: Workspace Modules Customizer -->
      <section class="settings-section">
        <div class="settings-section-header">
          <div>
            <h2 class="settings-section-title">Enabled Workspace Modules</h2>
            <p class="settings-section-desc">Toggle the tools and domains displayed in your dashboard and navigation.</p>
          </div>
        </div>

        <div class="modules-customizer-grid" id="modules-grid">
          ${ALL_MODULES.map(m => {
            const isChecked = currentModules.includes(m.key);
            return `
              <div class="module-toggle-card ${isChecked ? 'active' : ''}" data-mod-key="${m.key}">
                <div class="module-toggle-info">
                  <span class="module-toggle-icon">${m.icon}</span>
                  <span class="module-toggle-name">${m.label}</span>
                </div>
                <div class="option-chip-check">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <!-- Section 3: Priority & Workflow Paradigm -->
      <section class="settings-section">
        <div class="settings-section-header">
          <div>
            <h2 class="settings-section-title">Workflow & Primary Priority</h2>
            <p class="settings-section-desc">Controls the hierarchy of cards and charts on your home dashboard.</p>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div>
            <label style="display: block; font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.08em;">
              Primary Current Priority
            </label>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;" id="priority-selector">
              ${['Learning', 'Building', 'Career', 'Productivity', 'Business', 'Research', 'Personal Growth'].map(p => `
                <button type="button" class="btn-archetype-chip ${currentPriority === p ? 'active' : ''}" data-priority-val="${p}">
                  ${p}
                </button>
              `).join('')}
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.08em;">
              Preferred Organization Style
            </label>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;" id="style-selector">
              ${['Simple task list', 'Kanban board', 'Timeline', 'Goals and milestones', 'Flexible workspace'].map(s => `
                <button type="button" class="btn-archetype-chip ${currentStyle === s ? 'active' : ''}" data-style-val="${s}">
                  ${s}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </section>

      <!-- Section 4: AI Intelligence Calibration -->
      <section class="settings-section">
        <div class="settings-section-header">
          <div>
            <h2 class="settings-section-title">AURA Intelligence Calibration</h2>
            <p class="settings-section-desc">Configure the tone and cadence of synthesized workspace recommendations.</p>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-row-info">
            <span class="setting-row-label">Milestone Deadline Warnings</span>
            <span class="setting-row-desc">Alert when milestones or exams are within 7 calendar days.</span>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="toggle-milestone-warnings" checked>
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div class="setting-row-info">
            <span class="setting-row-label">Deep Work Recommendations</span>
            <span class="setting-row-desc">Suggest focus intervals aligned with your preferred sprint duration.</span>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="toggle-deep-work" checked>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </section>

      <div style="display: flex; gap: 12px; margin-top: 24px;">
        <button type="button" id="btn-save-personalization" class="btn btn-primary">Save Workspace Setup</button>
        <a href="/" class="btn btn-secondary">View Dashboard</a>
      </div>
    </div>
  `;
}

export function initSettingsPersonalizationPage() {
  const user = getCurrentUser();
  if (!user) {
    navigate('/login');
    return () => {};
  }

  let profile = loadProfile(user.id) || {
    id: user.id,
    modules: ['projects', 'tasks', 'goals', 'focus', 'analytics'],
    primaryPriority: 'Building',
    organizationStyle: 'Kanban board'
  };

  const alertEl = document.getElementById('personalization-alert');

  function showAlert(msg) {
    if (!alertEl) return;
    alertEl.textContent = msg;
    alertEl.style.display = 'flex';
    setTimeout(() => {
      alertEl.style.display = 'none';
    }, 3000);
  }

  // Module toggle cards
  const moduleCards = document.querySelectorAll('.module-toggle-card');
  moduleCards.forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.modKey;
      let current = profile.modules || [];
      if (current.includes(key)) {
        if (current.length <= 1) {
          alert('You must have at least one active module.');
          return;
        }
        current = current.filter(k => k !== key);
        card.classList.remove('active');
      } else {
        current.push(key);
        card.classList.add('active');
      }
      profile.modules = current;
      updateProfile(user.id, { modules: current });
      showAlert('Module configuration saved.');
    });
  });

  // Priority buttons
  document.querySelectorAll('[data-priority-val]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-priority-val]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.dataset.priorityVal;
      profile.primaryPriority = val;
      updateProfile(user.id, { primaryPriority: val });
      showAlert(`Primary priority updated to ${val}.`);
    });
  });

  // Style buttons
  document.querySelectorAll('[data-style-val]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-style-val]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.dataset.styleVal;
      profile.organizationStyle = val;
      updateProfile(user.id, { organizationStyle: val });
      showAlert(`Workflow style updated to ${val}.`);
    });
  });

  // Archetype Persona Quick Switchers
  document.querySelectorAll('[data-persona]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pKey = btn.dataset.persona;
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
      showAlert(`Loaded archetype: ${sample.name} (${sample.roles[0]}). Reloading workspace...`);
      setTimeout(() => {
        navigate('/settings/personalization');
      }, 500);
    });
  });

  // Save button
  document.getElementById('btn-save-personalization')?.addEventListener('click', () => {
    updateProfile(user.id, profile);
    showAlert('Workspace setup saved successfully.');
  });

  return () => {};
}
