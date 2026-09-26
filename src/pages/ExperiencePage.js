/**
 * AURA Experience & Learning Page (Route: /experience)
 * Features the interactive Python Learning Progression Engine (with non-clickable checkboxes,
 * mandatory question evaluation, and real dynamic progress calculation) alongside
 * the visual workflow journey.
 * 
 * Brand new user accounts start strictly at 0% with 0 topics completed.
 */

import { getCurrentUser } from '../data/authService.js';
import { learningStore, PYTHON_CURRICULUM } from '../data/learningStore.js';
import { analyticsService } from '../data/analyticsService.js';

export function renderExperiencePage() {
  const user = getCurrentUser();
  const progress = learningStore.getProgress(user?.id);

  // Collect unique categories for filter pills
  const categories = Array.from(new Set(PYTHON_CURRICULUM.map(t => t.category)));

  return `
    <div class="learning-curriculum-container">
      <!-- Curriculum Header Banner -->
      <div class="learning-overview-banner">
        <div class="learning-banner-info">
          <span class="section-eyebrow">Verified Curriculum Progression</span>
          <h1 class="learning-banner-title">Python Core & Systems Mastery</h1>
          <p class="learning-banner-desc">
            Topics complete only when you verify understanding by solving the associated challenge. Checkboxes cannot be clicked directly.
          </p>
        </div>

        <div class="learning-progress-stat">
          <div class="learning-progress-number" id="curriculum-percentage-display">${progress.percentage}%</div>
          <div class="learning-progress-bar-wrap">
            <div class="learning-progress-bar-fill" id="curriculum-progress-bar" style="width: ${progress.percentage}%;"></div>
          </div>
          <span style="font-size: 0.75rem; color: var(--text-tertiary);" id="curriculum-fraction-display">
            ${progress.completedCount} of ${progress.totalCount} Topics Verified
          </span>
        </div>
      </div>

      <!-- Category Filter Pills -->
      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;">
        <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; align-self: center; margin-right: 6px;">Filter:</span>
        <button type="button" class="btn-archetype-chip active" data-curriculum-filter="all">All Topics (${PYTHON_CURRICULUM.length})</button>
        ${categories.map(cat => `
          <button type="button" class="btn-archetype-chip" data-curriculum-filter="${escapeHtml(cat)}">${escapeHtml(cat)}</button>
        `).join('')}
      </div>

      <!-- Topics Grid -->
      <div class="curriculum-topics-grid" id="curriculum-topics-list">
        ${renderTopicCards(user?.id)}
      </div>

      <!-- Visual Experience Journey Section -->
      <section class="section" style="padding-top: 40px; border-top: 1px solid var(--border-subtle); margin-top: 40px;">
        <div class="section-header">
          <span class="section-eyebrow indigo">The Daily Experience</span>
          <h2 class="section-title">From cognitive friction to flow.</h2>
          <p class="section-subtitle">
            How AURA eliminates context switching, tracks your real velocity, and powers focused learning.
          </p>
        </div>

        <div class="os-stat-cards" style="width: 100%; margin-bottom: 30px;">
          <div class="os-stat-card">
            <div class="os-stat-header">Current Progress</div>
            <div class="os-stat-number" id="journey-stat-progress">${progress.percentage}%</div>
          </div>
          <div class="os-stat-card">
            <div class="os-stat-header">Verified Topics</div>
            <div class="os-stat-number" id="journey-stat-topics">${progress.completedCount}</div>
          </div>
          <div class="os-stat-card">
            <div class="os-stat-header">Focus State</div>
            <div class="os-stat-number" style="font-size: 1.25rem; font-weight: 600; color: var(--accent-emerald);">Ready</div>
          </div>
        </div>
      </section>
    </div>

    <!-- Topic Quiz & Evaluation Modal -->
    <div class="modal-overlay" id="modal-topic-quiz" aria-hidden="true">
      <div class="modal-container" style="max-width: 680px;">
        <div class="modal-header">
          <div>
            <span class="badge badge-cyan" id="quiz-topic-category" style="margin-bottom: 4px;">Foundations</span>
            <h3 class="modal-title" id="quiz-topic-title">Python Topic</h3>
          </div>
          <button type="button" class="modal-close" id="btn-close-quiz" aria-label="Close modal">✕</button>
        </div>

        <div class="modal-body">
          <div style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 20px;" id="quiz-lesson-text">
            Lesson explanation
          </div>

          <div class="quiz-question-box">
            <div class="quiz-prompt-text" id="quiz-prompt-content" style="white-space: pre-wrap; font-family: var(--font-mono, monospace);">Question content</div>
            <div class="quiz-options-list" id="quiz-options-container">
              <!-- Options rendered dynamically -->
            </div>
            <div id="quiz-feedback-banner" style="display: none;"></div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 16px;">
            <a href="/coding" class="btn btn-ghost btn-sm">Practice in Online Compiler →</a>
            <div style="display: flex; gap: 10px;">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-quiz-retry" style="display: none;">Try Again</button>
              <button type="button" class="btn btn-primary btn-sm" id="btn-submit-answer" disabled>Submit Answer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderTopicCards(userId) {
  const progress = learningStore.getProgress(userId);
  const completedIds = progress.completedTopicIds || [];

  return PYTHON_CURRICULUM.map(topic => {
    const isCompleted = completedIds.includes(topic.id) || completedIds.includes(topic.slug);
    return `
      <div class="topic-card-item ${isCompleted ? 'completed' : ''}" data-topic-id="${topic.id}" data-category="${topic.category}">
        <div class="topic-card-content">
          <div class="topic-card-title">
            <span>${escapeHtml(topic.title)}</span>
          </div>
          <div class="topic-card-meta">
            <span class="badge ${isCompleted ? 'badge-emerald' : 'badge-cyan'}" style="font-size: 0.65rem;">
              ${isCompleted ? '✓ Completed' : topic.difficulty}
            </span>
            <span>•</span>
            <span>${escapeHtml(topic.category)}</span>
          </div>
        </div>

        <!-- Checkbox indicator: intentionally disabled from direct clicking -->
        <div class="topic-check-indicator" title="${isCompleted ? 'Completed' : 'Solve question to complete'}" aria-hidden="true">
          ${isCompleted ? `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

export function initExperiencePage() {
  const user = getCurrentUser();
  const quizModal = document.getElementById('modal-topic-quiz');
  const closeQuizBtn = document.getElementById('btn-close-quiz');
  const submitBtn = document.getElementById('btn-submit-answer');
  const retryBtn = document.getElementById('btn-quiz-retry');
  const optionsContainer = document.getElementById('quiz-options-container');
  const feedbackBanner = document.getElementById('quiz-feedback-banner');

  let activeTopic = null;
  let selectedOptionIndex = null;

  // Asynchronously fetch latest progress from database and re-render cards if needed
  if (user?.id) {
    learningStore.fetchProgress(user.id).then(prog => {
      updateProgressDisplay(prog);
      const list = document.getElementById('curriculum-topics-list');
      if (list) {
        list.innerHTML = renderTopicCards(user.id);
        bindTopicClicks();
      }
    }).catch(() => {});
  }

  // Category filter
  document.querySelectorAll('[data-curriculum-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-curriculum-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.curriculumFilter;
      document.querySelectorAll('.topic-card-item').forEach(card => {
        if (cat === 'all' || card.dataset.category === cat || card.dataset.category.includes(cat)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Topic Click -> Open Quiz Modal
  function bindTopicClicks() {
    document.querySelectorAll('.topic-card-item').forEach(card => {
      card.addEventListener('click', () => {
        const topicId = card.dataset.topicId;
        const topic = PYTHON_CURRICULUM.find(t => t.id === topicId || t.slug === topicId);
        if (!topic) return;

        activeTopic = topic;
        selectedOptionIndex = null;

        document.getElementById('quiz-topic-title').textContent = topic.title;
        document.getElementById('quiz-topic-category').textContent = topic.category;
        document.getElementById('quiz-lesson-text').textContent = topic.lesson;
        document.getElementById('quiz-prompt-content').textContent = topic.question.prompt;

        if (feedbackBanner) feedbackBanner.style.display = 'none';
        if (retryBtn) retryBtn.style.display = 'none';
        if (submitBtn) {
          submitBtn.style.display = 'inline-flex';
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submit Answer';
        }

        // Render options
        optionsContainer.innerHTML = topic.question.options.map((opt, idx) => `
          <label class="quiz-option-label" data-opt-idx="${idx}">
            <input type="radio" name="quiz_opt" class="quiz-option-radio" value="${idx}">
            <span>${escapeHtml(opt)}</span>
          </label>
        `).join('');

        optionsContainer.querySelectorAll('.quiz-option-label').forEach(label => {
          label.addEventListener('click', () => {
            optionsContainer.querySelectorAll('.quiz-option-label').forEach(l => l.classList.remove('selected'));
            label.classList.add('selected');
            selectedOptionIndex = parseInt(label.dataset.optIdx, 10);
            if (submitBtn) submitBtn.disabled = false;
          });
        });

        quizModal?.classList.add('active');
      });
    });
  }

  bindTopicClicks();

  const closeModal = () => {
    quizModal?.classList.remove('active');
  };

  closeQuizBtn?.addEventListener('click', closeModal);
  quizModal?.addEventListener('click', (e) => {
    if (e.target === quizModal) closeModal();
  });

  // Submit Answer
  submitBtn?.addEventListener('click', async () => {
    if (selectedOptionIndex === null || !activeTopic) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Evaluating...';

    try {
      const res = await learningStore.submitAnswer(user?.id, activeTopic.id, selectedOptionIndex);

      feedbackBanner.style.display = 'block';
      if (res.isCorrect) {
        feedbackBanner.className = 'quiz-feedback-box correct';
        feedbackBanner.innerHTML = `
          <strong>✓ Correct!</strong>
          <p style="margin: 4px 0 0;">${escapeHtml(res.explanation)}</p>
          <p style="margin: 6px 0 0; font-size: 0.8125rem;">Topic marked as completed! Overall progress updated.</p>
        `;
        submitBtn.style.display = 'none';
        if (retryBtn) retryBtn.style.display = 'none';

        // Update UI cards and progress display
        updateProgressDisplay(res.progress);
        const card = document.querySelector(`.topic-card-item[data-topic-id="${activeTopic.id}"]`);
        if (card) {
          card.classList.add('completed');
          const badge = card.querySelector('.topic-card-meta .badge');
          if (badge) {
            badge.className = 'badge badge-emerald';
            badge.textContent = '✓ Completed';
          }
          const checkEl = card.querySelector('.topic-check-indicator');
          if (checkEl) {
            checkEl.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
          }
        }
      } else {
        feedbackBanner.className = 'quiz-feedback-box incorrect';
        feedbackBanner.innerHTML = `
          <strong>✕ Incorrect Answer</strong>
          <p style="margin: 4px 0 0;">${escapeHtml(res.explanation)}</p>
          <p style="margin: 6px 0 0; font-size: 0.8125rem;">Review the lesson and try again to demonstrate understanding.</p>
        `;
        submitBtn.style.display = 'none';
        if (retryBtn) retryBtn.style.display = 'inline-flex';
      }
    } catch (e) {
      console.error('Answer evaluation error:', e);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Answer';
    }
  });

  retryBtn?.addEventListener('click', () => {
    selectedOptionIndex = null;
    optionsContainer.querySelectorAll('.quiz-option-label').forEach(l => {
      l.classList.remove('selected');
      const radio = l.querySelector('input');
      if (radio) radio.checked = false;
    });
    feedbackBanner.style.display = 'none';
    retryBtn.style.display = 'none';
    submitBtn.style.display = 'inline-flex';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submit Answer';
  });

  function updateProgressDisplay(prog) {
    if (!prog) return;
    const pct = document.getElementById('curriculum-percentage-display');
    const bar = document.getElementById('curriculum-progress-bar');
    const frac = document.getElementById('curriculum-fraction-display');
    const jStat = document.getElementById('journey-stat-progress');
    const jTopics = document.getElementById('journey-stat-topics');

    if (pct) pct.textContent = `${prog.percentage}%`;
    if (bar) bar.style.width = `${prog.percentage}%`;
    if (frac) frac.textContent = `${prog.completedCount} of ${prog.totalCount} Topics Verified`;
    if (jStat) jStat.textContent = `${prog.percentage}%`;
    if (jTopics) jTopics.textContent = `${prog.completedCount}`;
  }

  return () => {};
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
