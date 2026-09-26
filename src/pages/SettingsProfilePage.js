/**
 * AURA — Profile Settings Page
 * Manage user identity, contact details, privacy toggles, and re-run onboarding.
 */

import { getCurrentUser, signOut } from '../data/authService.js';
import { loadProfile, updateProfile } from '../data/userProfile.js';
import { navigate } from '../router.js';

export function renderSettingsProfilePage() {
  const user = getCurrentUser();
  const profile = user ? loadProfile(user.id) : null;

  const name = profile?.name || user?.name || '';
  const email = profile?.email || user?.email || '';
  const roles = (profile?.roles || []).join(', ') || 'General User';
  const priority = profile?.primaryPriority || 'Not set';

  return `
    <div class="settings-viewport">
      <div class="settings-header">
        <div class="settings-eyebrow">Account & Workspace</div>
        <h1 class="settings-title">User Profile</h1>
        <p class="settings-desc">Manage your workspace credentials, personal identity, and privacy controls.</p>
      </div>

      <!-- Settings Sub-Navigation Tabs -->
      <nav class="settings-tabs" aria-label="Settings navigation">
        <a href="/settings/profile" class="settings-tab-link active">Profile</a>
        <a href="/settings/personalization" class="settings-tab-link">Personalization</a>
      </nav>

      <div id="settings-save-alert" style="display: none; margin-bottom: 20px;" class="auth-alert auth-alert-success">
        Profile preferences saved.
      </div>

      <!-- Section 1: Basic Identity -->
      <section class="settings-section">
        <div class="settings-section-header">
          <div>
            <h2 class="settings-section-title">Personal Identity</h2>
            <p class="settings-section-desc">Your visible name and contact address across workspace artifacts.</p>
          </div>
          <span class="badge ${user?.isDemo ? 'badge-cyan' : 'badge-emerald'}">
            ${user?.isDemo ? 'Demo Mode' : 'Local Account'}
          </span>
        </div>

        <form id="profile-form" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="form-group">
            <label for="profile-name" class="form-label">Display Name</label>
            <input type="text" id="profile-name" class="form-input" value="${escapeHtml(name)}" required />
          </div>

          <div class="form-group">
            <label for="profile-email" class="form-label">Email Address</label>
            <input type="email" id="profile-email" class="form-input" value="${escapeHtml(email)}" ${user?.isDemo ? 'readonly' : ''} />
          </div>

          <div style="display: flex; gap: 12px; margin-top: 8px;">
            <button type="submit" class="btn btn-primary btn-sm">Save Changes</button>
          </div>
        </form>
      </section>

      <!-- Section 2: Onboarding & Calibration -->
      <section class="settings-section">
        <div class="settings-section-header">
          <div>
            <h2 class="settings-section-title">Personalization Calibration</h2>
            <p class="settings-section-desc">Current profile calibration: <strong>${escapeHtml(roles)}</strong> (Priority: <strong>${escapeHtml(priority)}</strong>).</p>
          </div>
        </div>

        <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5;">
          If your goals or career trajectory have shifted, you can restart the conversational onboarding. Your existing projects, tasks, and history are preserved untouched.
        </p>

        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button type="button" id="btn-redo-onboarding" class="btn btn-secondary btn-sm" style="color: var(--accent-cyan);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
            </svg>
            Redo Personalization Onboarding
          </button>
          <a href="/settings/personalization" class="btn btn-secondary btn-sm">Fine-Tune Modules & Workflow</a>
        </div>
      </section>

      <!-- Section 3: Privacy & Data Transparency -->
      <section class="settings-section">
        <div class="settings-section-header">
          <div>
            <h2 class="settings-section-title">Privacy & Data Governance</h2>
            <p class="settings-section-desc">Complete transparency over how AURA handles your telemetry and context.</p>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-row-info">
            <span class="setting-row-label">Workspace Personalization</span>
            <span class="setting-row-desc">Dynamically order dashboard widgets and quick navigation based on your selected role.</span>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="toggle-personalization" checked>
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div class="setting-row-info">
            <span class="setting-row-label">AI Contextual Insights</span>
            <span class="setting-row-desc">Allow AURA Intelligence to reference your active goals when recommending tasks.</span>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="toggle-ai-insights" checked>
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div class="setting-row-info">
            <span class="setting-row-label">Activity Pacing & Metrics</span>
            <span class="setting-row-desc">Compute velocity, study hours, and milestone progress locally.</span>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="toggle-activity" checked>
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="privacy-notice-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <div class="privacy-notice-text">
            <strong>Transparent & Private by Design:</strong> AURA uses your preferences and workspace activity strictly to personalize your experience. No personal telemetry or credentials leave your client environment.
          </div>
        </div>
      </section>

      <!-- Section 4: Session Control -->
      <section class="settings-section" style="border-color: rgba(239, 68, 68, 0.2);">
        <div class="settings-section-header">
          <div>
            <h2 class="settings-section-title" style="color: #ef4444;">Session Management</h2>
            <p class="settings-section-desc">Sign out of this session on your current device.</p>
          </div>
        </div>

        <button type="button" id="btn-logout" class="btn btn-secondary btn-sm" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">
          Sign Out of AURA
        </button>
      </section>
    </div>
  `;
}

export function initSettingsProfilePage() {
  const user = getCurrentUser();
  if (!user) {
    navigate('/login');
    return () => {};
  }

  const profileForm = document.getElementById('profile-form');
  const nameInput = document.getElementById('profile-name');
  const alertEl = document.getElementById('settings-save-alert');
  const redoBtn = document.getElementById('btn-redo-onboarding');
  const logoutBtn = document.getElementById('btn-logout');

  profileForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const newName = nameInput?.value.trim();
    if (!newName) return;

    updateProfile(user.id, { name: newName });
    import('../data/authService.js').then(({ updateUserName }) => {
      updateUserName(newName);
    });

    if (alertEl) {
      alertEl.style.display = 'flex';
      setTimeout(() => {
        alertEl.style.display = 'none';
      }, 3000);
    }
  });

  redoBtn?.addEventListener('click', () => {
    navigate('/onboarding');
  });

  logoutBtn?.addEventListener('click', () => {
    signOut();
    navigate('/login');
  });

  return () => {};
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
