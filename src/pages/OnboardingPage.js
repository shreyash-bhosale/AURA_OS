/**
 * AURA — Conversational Personalized Onboarding
 * Multi-step discovery wizard configuring modules, priorities, and workflow.
 */

import { getCurrentUser, markOnboardingComplete } from '../data/authService.js';
import { loadProfile, updateProfile, ALL_MODULES } from '../data/userProfile.js';
import { navigate } from '../router.js';

export function renderOnboardingPage() {
  return `
    <div class="onboarding-viewport">
      <!-- Top Bar -->
      <header class="onboarding-topbar">
        <a href="/" class="onboarding-brand">
          <div class="brand-glyph" style="width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; background: rgba(56, 189, 248, 0.15);">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2.5">
              <circle cx="12" cy="12" r="9"></circle>
              <circle cx="12" cy="12" r="3" fill="#38BDF8"></circle>
            </svg>
          </div>
          <span>AURA ONBOARDING</span>
        </a>

        <!-- Desktop Multi-Node Stepper -->
        <div class="onboarding-progress-track" id="stepper-nodes">
          <!-- Rendered dynamically -->
        </div>

        <div class="onboarding-mobile-step" id="mobile-step-indicator">
          Step 1 of 7
        </div>

        <button type="button" id="btn-exit-onboarding" class="onboarding-exit-btn">
          Exit to Home
        </button>
      </header>

      <!-- Main Question Stage -->
      <main class="onboarding-main">
        <div id="onboarding-step-container" class="onboarding-card">
          <!-- Active step content inserted here dynamically -->
        </div>
      </main>
    </div>
  `;
}

export function initOnboardingPage() {
  const user = getCurrentUser();
  if (!user) {
    navigate('/login');
    return () => {};
  }

  let profile = loadProfile(user.id) || {
    id: user.id,
    roles: [],
    goals: [],
    modules: [],
    experienceLevels: {},
    primaryPriority: null,
    organizationStyle: null,
    preferences: { theme: 'dark', focusDuration: 25, workingTime: 'Flexible' }
  };

  let currentStep = 1;
  const TOTAL_STEPS = 7; // Steps 1 to 7, step 8 is generating

  // In-memory state accumulated during onboarding
  const state = {
    roles: [...(profile.roles || [])],
    goals: [...(profile.goals || [])],
    modules: [...(profile.modules || [])],
    experienceLevel: Object.values(profile.experienceLevels || {})[0] || '',
    primaryPriority: profile.primaryPriority || '',
    organizationStyle: profile.organizationStyle || '',
    preferences: {
      workingTime: profile.preferences?.workingTime || 'Flexible',
      focusDuration: profile.preferences?.focusDuration || 25,
      theme: profile.preferences?.theme || 'dark'
    }
  };

  const container = document.getElementById('onboarding-step-container');
  const stepperTrack = document.getElementById('stepper-nodes');
  const mobileStepIndicator = document.getElementById('mobile-step-indicator');
  const exitBtn = document.getElementById('btn-exit-onboarding');

  exitBtn?.addEventListener('click', () => {
    navigate('/');
  });

  function renderStepper() {
    if (!stepperTrack) return;
    let html = '';
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      const isCompleted = i < currentStep;
      const isActive = i === currentStep;
      const statusClass = isActive ? 'active' : isCompleted ? 'completed' : '';
      const numStr = i < 10 ? `0${i}` : `${i}`;

      html += `<div class="step-node ${statusClass}">${numStr}</div>`;
      if (i < TOTAL_STEPS) {
        html += `<div class="step-connector ${isCompleted ? 'completed' : ''}"></div>`;
      }
    }
    stepperTrack.innerHTML = html;

    if (mobileStepIndicator) {
      mobileStepIndicator.textContent = `Step ${currentStep} of ${TOTAL_STEPS}`;
    }
  }

  function renderStep(step) {
    renderStepper();
    if (!container) return;

    if (step === 1) {
      // Step 1: Who are you?
      const roles = [
        { id: 'Student', desc: 'Learning, coursework & exams' },
        { id: 'Developer', desc: 'Software engineering & coding' },
        { id: 'Designer', desc: 'UI/UX, visual & product design' },
        { id: 'Founder / Entrepreneur', desc: 'Startups, business & growth' },
        { id: 'Researcher', desc: 'Academic papers & experiments' },
        { id: 'Creator', desc: 'Digital content & media production' },
        { id: 'Professional', desc: 'Workplace projects & operations' },
        { id: 'Job Seeker', desc: 'Portfolio building & interview prep' },
        { id: 'Freelancer', desc: 'Client deliverables & contracts' },
        { id: 'Other', desc: 'Custom multidisciplinary focus' }
      ];

      container.innerHTML = `
        <div class="onboarding-eyebrow">01 — Identity</div>
        <h2 class="onboarding-question">What best describes what you do?</h2>
        <p class="onboarding-desc">Select all that apply. AURA will tailor its intelligent workspace around your profile.</p>

        <div class="options-grid">
          ${roles.map(r => `
            <div class="option-chip ${state.roles.includes(r.id) ? 'selected' : ''}" data-role="${r.id}">
              <div class="option-chip-content">
                <span class="option-chip-title">${r.id}</span>
                <span class="option-chip-subtitle">${r.desc}</span>
              </div>
              <div class="option-chip-check">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="onboarding-actions">
          <div></div>
          <button type="button" id="btn-next" class="btn-onboarding-continue" ${state.roles.length === 0 ? 'disabled' : ''}>
            <span>Continue</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      `;

      container.querySelectorAll('.option-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const role = chip.dataset.role;
          if (state.roles.includes(role)) {
            state.roles = state.roles.filter(r => r !== role);
            chip.classList.remove('selected');
          } else {
            state.roles.push(role);
            chip.classList.add('selected');
          }
          const nextBtn = document.getElementById('btn-next');
          if (nextBtn) nextBtn.disabled = state.roles.length === 0;
        });
      });

      document.getElementById('btn-next')?.addEventListener('click', () => {
        currentStep = 2;
        renderStep(currentStep);
      });
    }

    else if (step === 2) {
      // Step 2: What do you want to achieve?
      const goals = [
        { id: 'Learn new skills', desc: 'Master new technical or creative disciplines' },
        { id: 'Build projects', desc: 'Ship production-ready software or artifacts' },
        { id: 'Manage work', desc: 'Keep cross-functional tasks organized' },
        { id: 'Prepare for exams', desc: 'Structured study plans and curriculum mastery' },
        { id: 'Find a job', desc: 'Polish your portfolio and track applications' },
        { id: 'Grow a business', desc: 'Scale revenue, customers and strategy' },
        { id: 'Build a startup', desc: 'Validate ideas and launch MVPs fast' },
        { id: 'Manage personal goals', desc: 'Track daily habits and long-term milestones' },
        { id: 'Improve productivity', desc: 'Eliminate friction with AI and focus blocks' },
        { id: 'Research', desc: 'Collect references and run structured experiments' },
        { id: 'Create content', desc: 'Plan releases, scripts and media pipelines' },
        { id: 'Other', desc: 'Custom personal roadmap' }
      ];

      container.innerHTML = `
        <div class="onboarding-eyebrow">02 — Objectives</div>
        <h2 class="onboarding-question">What are you working toward?</h2>
        <p class="onboarding-desc">Select your key goals so AURA can prioritize relevant milestones.</p>

        <div class="options-grid">
          ${goals.map(g => `
            <div class="option-chip ${state.goals.includes(g.id) ? 'selected' : ''}" data-goal="${g.id}">
              <div class="option-chip-content">
                <span class="option-chip-title">${g.id}</span>
                <span class="option-chip-subtitle">${g.desc}</span>
              </div>
              <div class="option-chip-check">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="onboarding-actions">
          <button type="button" id="btn-back" class="btn-onboarding-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            <span>Back</span>
          </button>
          <button type="button" id="btn-next" class="btn-onboarding-continue" ${state.goals.length === 0 ? 'disabled' : ''}>
            <span>Continue</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      `;

      container.querySelectorAll('.option-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const goal = chip.dataset.goal;
          if (state.goals.includes(goal)) {
            state.goals = state.goals.filter(g => g !== goal);
            chip.classList.remove('selected');
          } else {
            state.goals.push(goal);
            chip.classList.add('selected');
          }
          const nextBtn = document.getElementById('btn-next');
          if (nextBtn) nextBtn.disabled = state.goals.length === 0;
        });
      });

      document.getElementById('btn-back')?.addEventListener('click', () => {
        currentStep = 1;
        renderStep(currentStep);
      });

      document.getElementById('btn-next')?.addEventListener('click', () => {
        // Auto-seed recommended modules based on selected roles if user hasn't explicitly set modules yet
        if (state.modules.length === 0) {
          if (state.roles.includes('Student')) {
            state.modules = ['learning', 'goals', 'focus', 'projects', 'analytics'];
          } else if (state.roles.includes('Developer')) {
            state.modules = ['projects', 'coding', 'architecture', 'ai', 'analytics'];
          } else if (state.roles.includes('Founder / Entrepreneur')) {
            state.modules = ['projects', 'goals', 'tasks', 'team', 'analytics'];
          } else if (state.roles.includes('Designer')) {
            state.modules = ['projects', 'tasks', 'goals', 'focus', 'analytics'];
          } else {
            state.modules = ['projects', 'tasks', 'goals', 'focus', 'analytics'];
          }
        }
        currentStep = 3;
        renderStep(currentStep);
      });
    }

    else if (step === 3) {
      // Step 3: What do you want AURA to help with?
      const modules = [
        { key: 'learning', label: 'Learning', icon: '📚', desc: 'Curricula, active study tracks & notes' },
        { key: 'projects', label: 'Projects', icon: '🚀', desc: 'Milestones, architecture & delivery' },
        { key: 'tasks', label: 'Tasks', icon: '✅', desc: 'Interactive Kanban & action items' },
        { key: 'coding', label: 'Coding', icon: '💻', desc: 'Developer workspace & code references' },
        { key: 'architecture', label: 'Architecture', icon: '🏗️', desc: 'Interactive system topology diagrams' },
        { key: 'goals', label: 'Goals', icon: '🎯', desc: 'Strategic milestones & quarterly targets' },
        { key: 'focus', label: 'Focus Sessions', icon: '🧘', desc: 'Deep work blocks & Pomodoro flow' },
        { key: 'analytics', label: 'Analytics', icon: '📊', desc: 'Velocity, study hours & metric insights' },
        { key: 'ai', label: 'AI Intelligence', icon: '🤖', desc: 'Proactive insights & synthesized assistance' },
        { key: 'research', label: 'Research', icon: '🔬', desc: 'Paper notes, citations & findings' },
        { key: 'content', label: 'Content', icon: '✍️', desc: 'Creative pipeline & script drafting' },
        { key: 'career', label: 'Career', icon: '💼', desc: 'Job hunt tracker & interview prep' }
      ];

      container.innerHTML = `
        <div class="onboarding-eyebrow">03 — Modules</div>
        <h2 class="onboarding-question">What would you like to manage in AURA?</h2>
        <p class="onboarding-desc">This directly shapes the tools and navigation bar enabled on your dashboard.</p>

        <div class="options-grid">
          ${modules.map(m => `
            <div class="option-chip ${state.modules.includes(m.key) ? 'selected' : ''}" data-mod="${m.key}">
              <div class="option-chip-content">
                <span class="option-chip-title">${m.icon} ${m.label}</span>
                <span class="option-chip-subtitle">${m.desc}</span>
              </div>
              <div class="option-chip-check">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="onboarding-actions">
          <button type="button" id="btn-back" class="btn-onboarding-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            <span>Back</span>
          </button>
          <button type="button" id="btn-next" class="btn-onboarding-continue" ${state.modules.length === 0 ? 'disabled' : ''}>
            <span>Continue</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      `;

      container.querySelectorAll('.option-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const mod = chip.dataset.mod;
          if (state.modules.includes(mod)) {
            state.modules = state.modules.filter(m => m !== mod);
            chip.classList.remove('selected');
          } else {
            state.modules.push(mod);
            chip.classList.add('selected');
          }
          const nextBtn = document.getElementById('btn-next');
          if (nextBtn) nextBtn.disabled = state.modules.length === 0;
        });
      });

      document.getElementById('btn-back')?.addEventListener('click', () => {
        currentStep = 2;
        renderStep(currentStep);
      });

      document.getElementById('btn-next')?.addEventListener('click', () => {
        currentStep = 4;
        renderStep(currentStep);
      });
    }

    else if (step === 4) {
      // Step 4: Experience Level (Context-aware based on roles/interests)
      let questionTitle = 'How experienced are you in your primary discipline?';
      let levels = [
        { id: 'Just getting started', desc: 'Learning fundamentals and core concepts' },
        { id: 'Beginner', desc: 'Building small prototypes and gaining confidence' },
        { id: 'Intermediate', desc: 'Comfortable tackling end-to-end deliverables' },
        { id: 'Advanced', desc: 'Designing complex systems and guiding others' },
        { id: 'Expert', desc: 'Master practitioner with deep domain mastery' }
      ];

      if (state.roles.includes('Developer') || state.modules.includes('coding')) {
        questionTitle = 'How experienced are you in software development?';
      } else if (state.roles.includes('Designer')) {
        questionTitle = 'How experienced are you in design?';
        levels = [
          { id: 'Learning design', desc: 'Exploring visual fundamentals & tooling' },
          { id: 'Beginner', desc: 'Designing layouts and UI components' },
          { id: 'Intermediate', desc: 'Crafting design systems and interactions' },
          { id: 'Advanced', desc: 'Leading product experience and strategy' },
          { id: 'Professional', desc: 'Industry veteran and principal designer' }
        ];
      } else if (state.roles.includes('Student')) {
        questionTitle = 'What stage of your academic journey are you in?';
        levels = [
          { id: 'High School / Prep', desc: 'Foundational secondary education' },
          { id: 'Undergraduate', desc: 'Pursuing bachelors degree studies' },
          { id: 'Graduate / Postgrad', desc: 'Masters, PhD, or advanced research' },
          { id: 'Self-Taught', desc: 'Independent learner curating own syllabus' }
        ];
      } else if (state.roles.includes('Founder / Entrepreneur')) {
        questionTitle = 'What stage is your venture currently in?';
        levels = [
          { id: 'Idea Stage', desc: 'Exploring problems and validating hypotheses' },
          { id: 'Early Stage / Pre-seed', desc: 'Building first MVP and testing with users' },
          { id: 'Growth / Scaling', desc: 'Acquiring customers and building revenue' },
          { id: 'Established', desc: 'Scaling operations and managing team' }
        ];
      }

      container.innerHTML = `
        <div class="onboarding-eyebrow">04 — Experience</div>
        <h2 class="onboarding-question">${questionTitle}</h2>
        <p class="onboarding-desc">This helps AURA calibrate AI suggestions and task pacing.</p>

        <div class="options-grid options-grid-wide">
          ${levels.map(l => `
            <div class="option-chip radio ${state.experienceLevel === l.id ? 'selected' : ''}" data-level="${l.id}">
              <div class="option-chip-content">
                <span class="option-chip-title">${l.id}</span>
                <span class="option-chip-subtitle">${l.desc}</span>
              </div>
              <div class="option-chip-check"></div>
            </div>
          `).join('')}
        </div>

        <div class="onboarding-actions">
          <button type="button" id="btn-back" class="btn-onboarding-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            <span>Back</span>
          </button>
          <button type="button" id="btn-next" class="btn-onboarding-continue" ${!state.experienceLevel ? 'disabled' : ''}>
            <span>Continue</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      `;

      container.querySelectorAll('.option-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          container.querySelectorAll('.option-chip').forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          state.experienceLevel = chip.dataset.level;
          const nextBtn = document.getElementById('btn-next');
          if (nextBtn) nextBtn.disabled = false;
        });
      });

      document.getElementById('btn-back')?.addEventListener('click', () => {
        currentStep = 3;
        renderStep(currentStep);
      });

      document.getElementById('btn-next')?.addEventListener('click', () => {
        currentStep = 5;
        renderStep(currentStep);
      });
    }

    else if (step === 5) {
      // Step 5: Current Priority (Single select)
      const priorities = [
        { id: 'Learning', desc: 'Absorbing new concepts and coursework' },
        { id: 'Building', desc: 'Designing and shipping active projects' },
        { id: 'Career', desc: 'Interviews, portfolio, and career transitions' },
        { id: 'Productivity', desc: 'Mastering execution and eliminating distractions' },
        { id: 'Business', desc: 'Customer traction and product-market fit' },
        { id: 'Research', desc: 'Deep synthesis, documentation and analysis' },
        { id: 'Personal Growth', desc: 'Consistency, wellness and daily habit loops' }
      ];

      container.innerHTML = `
        <div class="onboarding-eyebrow">05 — Priority</div>
        <h2 class="onboarding-question">What matters most right now?</h2>
        <p class="onboarding-desc">Select your single primary focus. This sets the hero section and top recommendation on your dashboard.</p>

        <div class="options-grid">
          ${priorities.map(p => `
            <div class="option-chip radio ${state.primaryPriority === p.id ? 'selected' : ''}" data-priority="${p.id}">
              <div class="option-chip-content">
                <span class="option-chip-title">${p.id}</span>
                <span class="option-chip-subtitle">${p.desc}</span>
              </div>
              <div class="option-chip-check"></div>
            </div>
          `).join('')}
        </div>

        <div class="onboarding-actions">
          <button type="button" id="btn-back" class="btn-onboarding-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            <span>Back</span>
          </button>
          <button type="button" id="btn-next" class="btn-onboarding-continue" ${!state.primaryPriority ? 'disabled' : ''}>
            <span>Continue</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      `;

      container.querySelectorAll('.option-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          container.querySelectorAll('.option-chip').forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          state.primaryPriority = chip.dataset.priority;
          const nextBtn = document.getElementById('btn-next');
          if (nextBtn) nextBtn.disabled = false;
        });
      });

      document.getElementById('btn-back')?.addEventListener('click', () => {
        currentStep = 4;
        renderStep(currentStep);
      });

      document.getElementById('btn-next')?.addEventListener('click', () => {
        currentStep = 6;
        renderStep(currentStep);
      });
    }

    else if (step === 6) {
      // Step 6: How do you work? (Organization style)
      const styles = [
        { id: 'Simple task list', desc: 'Clean, linear checklists without clutter' },
        { id: 'Kanban board', desc: 'Visual columns moving from To Do to Done' },
        { id: 'Timeline', desc: 'Date-sequenced roadmaps and deadlines' },
        { id: 'Goals and milestones', desc: 'Outcome-oriented checkpoints' },
        { id: 'Flexible workspace', desc: 'Mix and match views on the fly' },
        { id: 'Not sure yet', desc: 'Let AURA recommend the optimal balance' }
      ];

      container.innerHTML = `
        <div class="onboarding-eyebrow">06 — Workflow</div>
        <h2 class="onboarding-question">How do you prefer to organize your work?</h2>
        <p class="onboarding-desc">Choose your natural productivity layout style.</p>

        <div class="options-grid options-grid-wide">
          ${styles.map(s => `
            <div class="option-chip radio ${state.organizationStyle === s.id ? 'selected' : ''}" data-style="${s.id}">
              <div class="option-chip-content">
                <span class="option-chip-title">${s.id}</span>
                <span class="option-chip-subtitle">${s.desc}</span>
              </div>
              <div class="option-chip-check"></div>
            </div>
          `).join('')}
        </div>

        <div class="onboarding-actions">
          <button type="button" id="btn-back" class="btn-onboarding-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            <span>Back</span>
          </button>
          <button type="button" id="btn-next" class="btn-onboarding-continue" ${!state.organizationStyle ? 'disabled' : ''}>
            <span>Continue</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      `;

      container.querySelectorAll('.option-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          container.querySelectorAll('.option-chip').forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          state.organizationStyle = chip.dataset.style;
          const nextBtn = document.getElementById('btn-next');
          if (nextBtn) nextBtn.disabled = false;
        });
      });

      document.getElementById('btn-back')?.addEventListener('click', () => {
        currentStep = 5;
        renderStep(currentStep);
      });

      document.getElementById('btn-next')?.addEventListener('click', () => {
        currentStep = 7;
        renderStep(currentStep);
      });
    }

    else if (step === 7) {
      // Step 7: Optional fine-tuning (Working hours, Focus session, Theme)
      container.innerHTML = `
        <div class="onboarding-eyebrow">07 — Optional Fine-Tuning</div>
        <h2 class="onboarding-question">Tailor your daily flow.</h2>
        <p class="onboarding-desc">Fine-tune your working hours and focus intervals. You can skip this step anytime.</p>

        <div style="display: flex; flex-direction: column; gap: 24px; margin-bottom: 36px;">
          <div>
            <label style="display: block; font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.08em;">
              When do you usually do your deepest work?
            </label>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${['Morning', 'Afternoon', 'Evening', 'Night', 'Flexible'].map(t => `
                <button type="button" class="btn-archetype-chip ${state.preferences.workingTime === t ? 'active' : ''}" data-worktime="${t}">
                  ${t}
                </button>
              `).join('')}
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.08em;">
              Ideal Focus Sprint Duration
            </label>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${[25, 45, 60, 90].map(mins => `
                <button type="button" class="btn-archetype-chip ${state.preferences.focusDuration === mins ? 'active' : ''}" data-duration="${mins}">
                  ${mins} minutes
                </button>
              `).join('')}
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.08em;">
              Interface Appearance
            </label>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${['dark', 'light', 'system'].map(th => `
                <button type="button" class="btn-archetype-chip ${state.preferences.theme === th ? 'active' : ''}" data-theme-val="${th}">
                  ${th.charAt(0).toUpperCase() + th.slice(1)} Mode
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="onboarding-actions">
          <button type="button" id="btn-back" class="btn-onboarding-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            <span>Back</span>
          </button>
          <div style="display: flex; gap: 12px; align-items: center;">
            <button type="button" id="btn-skip" class="btn-onboarding-skip">Skip</button>
            <button type="button" id="btn-finish" class="btn-onboarding-continue">
              <span>Complete Setup</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      `;

      // Working time clicks
      container.querySelectorAll('[data-worktime]').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('[data-worktime]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.preferences.workingTime = btn.dataset.worktime;
        });
      });

      // Duration clicks
      container.querySelectorAll('[data-duration]').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('[data-duration]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.preferences.focusDuration = parseInt(btn.dataset.duration, 10);
        });
      });

      // Theme clicks
      container.querySelectorAll('[data-theme-val]').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('[data-theme-val]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.preferences.theme = btn.dataset.themeVal;
        });
      });

      document.getElementById('btn-back')?.addEventListener('click', () => {
        currentStep = 6;
        renderStep(currentStep);
      });

      const finishAction = () => {
        finishOnboarding();
      };

      document.getElementById('btn-skip')?.addEventListener('click', finishAction);
      document.getElementById('btn-finish')?.addEventListener('click', finishAction);
    }
  }

  function finishOnboarding() {
    // Transition to Screen 8: Workspace Generation Animation
    if (stepperTrack) stepperTrack.style.display = 'none';
    if (mobileStepIndicator) mobileStepIndicator.style.display = 'none';

    container.innerHTML = `
      <div class="workspace-generating-card">
        <div class="generating-aura-core">
          <div class="aura-core-ring ring-1"></div>
          <div class="aura-core-ring ring-2"></div>
          <div class="aura-core-ring ring-3"></div>
        </div>
        <div id="gen-status-text" class="generating-status-text">Understanding your goals...</div>
        <div class="generating-subtext">AURA Intelligence is configuring your personalized command center.</div>
      </div>
    `;

    const statusEl = document.getElementById('gen-status-text');

    const steps = [
      { text: 'Understanding your goals...', delay: 700 },
      { text: 'Organizing your workspace modules...', delay: 800 },
      { text: 'Preparing your personalized dashboard...', delay: 800 },
      { text: 'AURA is ready.', delay: 600 }
    ];

    let currentMsg = 0;
    function cycleMessages() {
      if (currentMsg < steps.length) {
        if (statusEl) {
          statusEl.style.opacity = '0';
          setTimeout(() => {
            statusEl.textContent = steps[currentMsg].text;
            statusEl.style.opacity = '1';
            const delay = steps[currentMsg].delay;
            currentMsg++;
            setTimeout(cycleMessages, delay);
          }, 180);
        }
      } else {
        // Save complete profile
        const updates = {
          roles: state.roles,
          goals: state.goals,
          modules: state.modules,
          experienceLevels: { primary: state.experienceLevel },
          primaryPriority: state.primaryPriority,
          organizationStyle: state.organizationStyle,
          preferences: state.preferences,
          onboardingCompleted: true
        };

        updateProfile(user.id, updates);
        markOnboardingComplete();

        // Redirect to personalized Home
        setTimeout(() => {
          navigate('/');
        }, 350);
      }
    }

    setTimeout(cycleMessages, 300);
  }

  // Initial render step 1
  renderStep(currentStep);

  return () => {
    // Cleanup if needed
  };
}
