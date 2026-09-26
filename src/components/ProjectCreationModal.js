/**
 * AURA Multi-Step Project Creation Wizard Modal
 * 01 Project -> 02 Goals -> 03 Technology -> 04 Architecture -> 05 Plan
 */

import { projectStore } from '../data/projectStore.js';
import { navigate } from '../router.js';

export function renderProjectCreationModal() {
  return `
    <div id="project-wizard-backdrop" class="modal-overlay" role="dialog" aria-modal="true" aria-label="Create New Project">
      <div class="wizard-modal-box">
        <!-- Wizard Steps Indicator Header -->
        <div class="wizard-steps-header">
          <span class="wizard-step-pill active" data-wizard-step-indicator="1">01 Project</span>
          <span style="opacity: 0.3;">→</span>
          <span class="wizard-step-pill" data-wizard-step-indicator="2">02 Goals</span>
          <span style="opacity: 0.3;">→</span>
          <span class="wizard-step-pill" data-wizard-step-indicator="3">03 Tech</span>
          <span style="opacity: 0.3;">→</span>
          <span class="wizard-step-pill" data-wizard-step-indicator="4">04 Arch</span>
          <span style="opacity: 0.3;">→</span>
          <span class="wizard-step-pill" data-wizard-step-indicator="5">05 Plan</span>
        </div>

        <!-- Wizard Body -->
        <div class="wizard-body">
          <!-- Step 1: Project Details -->
          <div class="wizard-step-content active" data-wizard-step="1">
            <h3 style="font-size: 1.3rem; margin-bottom: 6px;">Define your project</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 20px;">
              Give your new software system a clear identity and category.
            </p>

            <div class="form-group">
              <label class="form-label">Project Name *</label>
              <input type="text" id="wiz-name" class="form-input" placeholder="e.g. NeuroSync AI" required>
            </div>

            <div class="form-group">
              <label class="form-label">Short Description *</label>
              <textarea id="wiz-desc" class="form-textarea" rows="2" placeholder="What does this system build or solve?"></textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Category</label>
                <select id="wiz-cat" class="form-select">
                  <option value="Computer Vision & Edge ML">Computer Vision & Edge ML</option>
                  <option value="Autonomous Multi-Agent">Autonomous Multi-Agent</option>
                  <option value="Developer Tool & LSP">Developer Tool & LSP</option>
                  <option value="Generative AI & LLMs">Generative AI & LLMs</option>
                  <option value="Fullstack Web Application">Fullstack Web Application</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Priority</label>
                <select id="wiz-priority" class="form-select">
                  <option value="High">High Priority</option>
                  <option value="Critical">Critical Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Step 2: Goals & Deadlines -->
          <div class="wizard-step-content" data-wizard-step="2">
            <h3 style="font-size: 1.3rem; margin-bottom: 6px;">Goals & Milestones</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 20px;">
              Set the primary target outcome and target ship deadline.
            </p>

            <div class="form-group">
              <label class="form-label">Primary Target Goal</label>
              <input type="text" id="wiz-goal" class="form-input" placeholder="e.g. Ship v1.0 real-time inference pipeline">
            </div>

            <div class="form-group">
              <label class="form-label">Initial Milestone</label>
              <input type="text" id="wiz-milestone" class="form-input" placeholder="e.g. Phase 1: Architecture specification & benchmarks">
            </div>

            <div class="form-group">
              <label class="form-label">Target Completion Date</label>
              <input type="date" id="wiz-deadline" class="form-input" value="2026-11-20">
            </div>
          </div>

          <!-- Step 3: Technology Stack -->
          <div class="wizard-step-content" data-wizard-step="3">
            <h3 style="font-size: 1.3rem; margin-bottom: 6px;">Technology Stack</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">
              Select the core languages, frameworks, and libraries powering this project.
            </p>

            <div class="tag-chips-selector" id="wiz-tech-chips">
              <button type="button" class="chip-select-btn selected" data-tech="Python">Python</button>
              <button type="button" class="chip-select-btn selected" data-tech="TypeScript">TypeScript</button>
              <button type="button" class="chip-select-btn" data-tech="Rust">Rust</button>
              <button type="button" class="chip-select-btn" data-tech="PyTorch">PyTorch</button>
              <button type="button" class="chip-select-btn" data-tech="FastAPI">FastAPI</button>
              <button type="button" class="chip-select-btn" data-tech="Next.js">Next.js</button>
              <button type="button" class="chip-select-btn" data-tech="React">React</button>
              <button type="button" class="chip-select-btn" data-tech="Docker">Docker</button>
              <button type="button" class="chip-select-btn" data-tech="WebAssembly">WebAssembly</button>
              <button type="button" class="chip-select-btn" data-tech="PostgreSQL">PostgreSQL</button>
              <button type="button" class="chip-select-btn" data-tech="Redis">Redis</button>
              <button type="button" class="chip-select-btn" data-tech="Qdrant">Qdrant</button>
            </div>
          </div>

          <!-- Step 4: Architecture Template -->
          <div class="wizard-step-content" data-wizard-step="4">
            <h3 style="font-size: 1.3rem; margin-bottom: 6px;">Architecture Layers</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">
              Choose how systems communicate across client, API, AI, and storage tiers.
            </p>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <label class="card" style="padding: 14px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                <input type="radio" name="wiz-arch-template" value="ai-pipeline" checked style="accent-color: var(--accent-primary);">
                <div>
                  <strong>AI Pipeline Architecture</strong>
                  <div style="font-size: 0.78rem; color: var(--text-secondary);">Client → Streaming Gateway → Model Inference → Vector & State Store</div>
                </div>
              </label>

              <label class="card" style="padding: 14px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                <input type="radio" name="wiz-arch-template" value="fullstack" style="accent-color: var(--accent-primary);">
                <div>
                  <strong>Modern Fullstack Web Application</strong>
                  <div style="font-size: 0.78rem; color: var(--text-secondary);">Client UI → REST/GraphQL API → Relational DB + Redis Cache</div>
                </div>
              </label>

              <label class="card" style="padding: 14px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                <input type="radio" name="wiz-arch-template" value="compiler" style="accent-color: var(--accent-primary);">
                <div>
                  <strong>Language Server & Compiler System</strong>
                  <div style="font-size: 0.78rem; color: var(--text-secondary);">Editor Client → LSP Bridge → Incremental Parser → Invariant Solver</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Step 5: Review & Initial Plan -->
          <div class="wizard-step-content" data-wizard-step="5">
            <h3 style="font-size: 1.3rem; margin-bottom: 6px;">Confirm & Initialize Plan</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">
              AURA will initialize the project repository, kanban board, and architecture map.
            </p>

            <div class="card" style="padding: 18px; background: var(--surface-elevated);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong id="wiz-review-name" style="font-size: 1.1rem; color: var(--text-primary);">Untitled</strong>
                <span class="badge badge-cyan" id="wiz-review-priority">High Priority</span>
              </div>
              <p id="wiz-review-desc" style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 12px;">No description</p>
              <div id="wiz-review-tech" style="display: flex; flex-wrap: wrap; gap: 6px;"></div>
            </div>
          </div>
        </div>

        <!-- Wizard Navigation Footer -->
        <div class="wizard-footer">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-wiz-prev">Cancel</button>
          <button type="button" class="btn btn-primary btn-sm" id="btn-wiz-next">Continue →</button>
        </div>
      </div>
    </div>
  `;
}

export function initProjectCreationWizard(onCreatedCallback) {
  const backdrop = document.getElementById('project-wizard-backdrop');
  if (!backdrop) return;

  let currentStep = 1;
  const TOTAL_STEPS = 5;

  const stepPills = backdrop.querySelectorAll('[data-wizard-step-indicator]');
  const stepPanels = backdrop.querySelectorAll('[data-wizard-step]');
  const btnPrev = document.getElementById('btn-wiz-prev');
  const btnNext = document.getElementById('btn-wiz-next');

  // Chip selectors
  const techChips = backdrop.querySelectorAll('#wiz-tech-chips .chip-select-btn');
  techChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
    });
  });

  function updateStepUI() {
    stepPills.forEach((pill, idx) => {
      pill.classList.toggle('active', idx + 1 === currentStep);
    });

    stepPanels.forEach((panel) => {
      const step = parseInt(panel.getAttribute('data-wizard-step'), 10);
      panel.classList.toggle('active', step === currentStep);
    });

    if (currentStep === 1) {
      btnPrev.textContent = 'Cancel';
    } else {
      btnPrev.textContent = '← Back';
    }

    if (currentStep === TOTAL_STEPS) {
      btnNext.textContent = 'Create Project 🚀';

      // Update review preview
      const name = document.getElementById('wiz-name').value.trim() || 'Untitled Project';
      const desc = document.getElementById('wiz-desc').value.trim() || 'No description provided.';
      const priority = document.getElementById('wiz-priority').value;

      const reviewName = document.getElementById('wiz-review-name');
      const reviewDesc = document.getElementById('wiz-review-desc');
      const reviewPriority = document.getElementById('wiz-review-priority');
      const reviewTech = document.getElementById('wiz-review-tech');

      if (reviewName) reviewName.textContent = name;
      if (reviewDesc) reviewDesc.textContent = desc;
      if (reviewPriority) reviewPriority.textContent = `${priority} Priority`;

      if (reviewTech) {
        const selectedTech = Array.from(backdrop.querySelectorAll('#wiz-tech-chips .chip-select-btn.selected'))
          .map((c) => c.getAttribute('data-tech'));
        reviewTech.innerHTML = selectedTech
          .map((t) => `<span class="tech-tag">${t}</span>`)
          .join('');
      }
    } else {
      btnNext.textContent = 'Continue →';
    }
  }

  btnPrev.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateStepUI();
    } else {
      closeWizard();
    }
  });

  btnNext.addEventListener('click', () => {
    if (currentStep < TOTAL_STEPS) {
      // Basic validation for step 1
      if (currentStep === 1) {
        const nameVal = document.getElementById('wiz-name').value.trim();
        if (!nameVal) {
          alert('Please enter a project name.');
          return;
        }
      }
      currentStep++;
      updateStepUI();
    } else {
      // Finalize Project Creation
      submitProject();
    }
  });

  function closeWizard() {
    backdrop.classList.remove('active');
    currentStep = 1;
    updateStepUI();
  }

  function submitProject() {
    const name = document.getElementById('wiz-name').value.trim();
    const description = document.getElementById('wiz-desc').value.trim();
    const category = document.getElementById('wiz-cat').value;
    const priority = document.getElementById('wiz-priority').value;
    const deadline = document.getElementById('wiz-deadline').value || '2026-11-30';
    const nextMilestone = document.getElementById('wiz-milestone').value.trim() || 'Phase 1: Architecture specification & benchmarks';

    const selectedTech = Array.from(backdrop.querySelectorAll('#wiz-tech-chips .chip-select-btn.selected'))
      .map((c) => c.getAttribute('data-tech'));

    const projectData = {
      name,
      description,
      category,
      priority,
      deadline,
      nextMilestone,
      technologies: selectedTech.length > 0 ? selectedTech : ['Python', 'TypeScript'],
      status: 'Active',
      progress: 15
    };

    const created = projectStore.createProject(projectData);
    closeWizard();

    if (typeof onCreatedCallback === 'function') {
      onCreatedCallback(created);
    } else {
      navigate(`/projects/${created.id}`);
    }
  }

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeWizard();
  });
}

export function openProjectCreationWizard() {
  const backdrop = document.getElementById('project-wizard-backdrop');
  if (backdrop) {
    backdrop.classList.add('active');
  }
}
