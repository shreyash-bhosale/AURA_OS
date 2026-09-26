/**
 * AURA Product Page (Route: /product)
 * Deep dive into the 6 core systems: Learning, Coding, Projects, Goals, Focus, Analytics.
 */

import { initSkillConstellation } from '../modules/skillConstellation.js';
import { initCodePlayground } from '../modules/codePlayground.js';
import { initProjectLab } from '../modules/projectLab.js';
import { initFocusMode } from '../modules/focusMode.js';
import { initAnalyticsVisualizer } from '../modules/analyticsVisualizer.js';

export function renderProductPage() {
  return `
    <div class="page-header-banner">
      <div class="hero-ambient-glow" aria-hidden="true"></div>
      <div class="container">
        <span class="section-eyebrow indigo">AURA Systems Architecture</span>
        <h1 class="hero-headline" style="font-size: var(--fs-hero); margin-top: 12px;">
          Everything you need to<br>
          <span class="gradient-text">learn and build.</span>
        </h1>
        <p class="hero-subheadline">
          A unified workspace for learning, coding, projects, goals, and productivity. Every engine connects into a cohesive feedback loop.
        </p>
      </div>
    </div>

    <div class="container" style="padding-bottom: clamp(4rem, 8vw, 7rem);">
      <!-- Capability 1: Learning -->
      <section class="section" id="learning" style="padding-top: 0;">
        <div class="capability-info" style="margin-bottom: var(--space-6);">
          <span class="capability-num">01 / System Engine</span>
          <h2 class="capability-title">Visual Learning Constellation</h2>
          <p class="capability-desc">
            Rather than disjointed video playlists, subjects are mapped as an interconnected neural constellation. Track lesson progression, concept retention, and prerequisites from foundational Python to frontier Generative AI.
          </p>
        </div>

        <div class="learning-constellation-container">
          <div class="constellation-viewport">
            <svg id="constellation-svg" class="constellation-svg-lines" aria-hidden="true"></svg>
            <div class="constellation-node-track">
              <div class="skill-node selected" data-skill="python" role="button" tabindex="0">
                <div class="node-progress-ring-box">
                  <svg class="node-progress-svg" viewBox="0 0 68 68">
                    <circle class="node-progress-bg" cx="34" cy="34" r="28"></circle>
                    <circle class="node-progress-circle" cx="34" cy="34" r="28" stroke-dasharray="176" stroke-dashoffset="10"></circle>
                  </svg>
                  <span class="node-progress-label">94%</span>
                </div>
                <div class="skill-node-title">Python Core</div>
                <div class="skill-node-status">Mastered</div>
              </div>

              <div class="skill-node" data-skill="dsa" role="button" tabindex="0">
                <div class="node-progress-ring-box">
                  <svg class="node-progress-svg" viewBox="0 0 68 68">
                    <circle class="node-progress-bg" cx="34" cy="34" r="28"></circle>
                    <circle class="node-progress-circle" cx="34" cy="34" r="28" stroke-dasharray="176" stroke-dashoffset="21" style="stroke: var(--accent-cyan);"></circle>
                  </svg>
                  <span class="node-progress-label">88%</span>
                </div>
                <div class="skill-node-title">Algorithms</div>
                <div class="skill-node-status">Mastered</div>
              </div>

              <div class="skill-node" data-skill="ml" role="button" tabindex="0">
                <div class="node-progress-ring-box">
                  <svg class="node-progress-svg" viewBox="0 0 68 68">
                    <circle class="node-progress-bg" cx="34" cy="34" r="28"></circle>
                    <circle class="node-progress-circle" cx="34" cy="34" r="28" stroke-dasharray="176" stroke-dashoffset="44" style="stroke: var(--accent-primary);"></circle>
                  </svg>
                  <span class="node-progress-label">75%</span>
                </div>
                <div class="skill-node-title">Machine Learning</div>
                <div class="skill-node-status">Active Track</div>
              </div>

              <div class="skill-node" data-skill="dl" role="button" tabindex="0">
                <div class="node-progress-ring-box">
                  <svg class="node-progress-svg" viewBox="0 0 68 68">
                    <circle class="node-progress-bg" cx="34" cy="34" r="28"></circle>
                    <circle class="node-progress-circle" cx="34" cy="34" r="28" stroke-dasharray="176" stroke-dashoffset="74" style="stroke: var(--accent-violet);"></circle>
                  </svg>
                  <span class="node-progress-label">58%</span>
                </div>
                <div class="skill-node-title">Deep Learning</div>
                <div class="skill-node-status">Active Track</div>
              </div>

              <div class="skill-node" data-skill="genai" role="button" tabindex="0">
                <div class="node-progress-ring-box">
                  <svg class="node-progress-svg" viewBox="0 0 68 68">
                    <circle class="node-progress-bg" cx="34" cy="34" r="28"></circle>
                    <circle class="node-progress-circle" cx="34" cy="34" r="28" stroke-dasharray="176" stroke-dashoffset="102" style="stroke: #EC4899;"></circle>
                  </svg>
                  <span class="node-progress-label">42%</span>
                </div>
                <div class="skill-node-title">Generative AI</div>
                <div class="skill-node-status">Exploring</div>
              </div>
            </div>
          </div>

          <div class="skill-inspector-panel">
            <div class="inspector-meta">
              <div class="inspector-badge-row">
                <span class="badge badge-emerald" id="inspector-badge">Mastered Tier</span>
                <span style="font-size: var(--fs-micro); color: var(--text-tertiary);">Curriculum ID: AUR-SK-01</span>
              </div>
              <h3 class="inspector-title" id="inspector-title">Python Core & Advanced</h3>
              <p class="inspector-desc" id="inspector-desc">
                High-performance Python covering concurrency, metaclasses, C-extensions, and memory optimization.
              </p>
              <div class="inspector-stats-grid">
                <div class="inspector-stat-box">
                  <div class="inspector-stat-label">Lessons Done</div>
                  <div class="inspector-stat-val" id="inspector-stat-lessons">48 / 50</div>
                </div>
                <div class="inspector-stat-box">
                  <div class="inspector-stat-label">Total Time</div>
                  <div class="inspector-stat-val" id="inspector-stat-time">42 hrs</div>
                </div>
                <div class="inspector-stat-box">
                  <div class="inspector-stat-label">Quiz Mastery</div>
                  <div class="inspector-stat-val" id="inspector-stat-mastery">98.2%</div>
                </div>
              </div>
              <div style="margin-top: 10px;">
                <button class="btn btn-primary" id="btn-start-next-module">
                  Launch Session: AsyncIO Event Loops
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            </div>

            <div class="inspector-curriculum">
              <span class="curriculum-heading">Curriculum Progression</span>
              <ul class="curriculum-list" id="inspector-curriculum-list"></ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Capability 2: Coding -->
      <section class="section" id="coding">
        <div class="capability-info" style="margin-bottom: var(--space-6);">
          <span class="capability-num">02 / Execution Sandbox</span>
          <h2 class="capability-title">Integrated Algorithmic Sandbox</h2>
          <p class="capability-desc">
            Code with instant runtime telemetry, assertion testing, and sub-millisecond execution verification. Practice algorithms directly adjacent to your curriculum tracks.
          </p>
        </div>

        <div class="coding-playground-frame">
          <div class="editor-topbar">
            <div class="editor-lang-tabs">
              <button class="editor-tab-btn active" data-lang="python">Python</button>
              <button class="editor-tab-btn" data-lang="typescript">TypeScript</button>
              <button class="editor-tab-btn" data-lang="rust">Rust</button>
            </div>
            <div class="editor-meta-badges">
              <span class="badge badge-indigo">Streak: 18 Days</span>
              <span class="badge">Algorithmic Sandbox</span>
            </div>
          </div>

          <div class="editor-body-grid">
            <div class="code-view-container">
              <div class="line-numbers" id="line-numbers-target" aria-hidden="true"></div>
              <div class="code-content" id="code-content-target"></div>
            </div>
          </div>

          <div class="editor-terminal-bar">
            <div class="terminal-status-info">
              <span class="test-badge" id="test-badge-target">✓ 3/3 Tests Passed</span>
              <span class="runtime-stat" id="runtime-stat-target">Runtime: 0.14s</span>
              <span class="runtime-stat" id="memory-stat-target">Memory: 12.4 MB</span>
            </div>
            <div class="editor-actions">
              <button class="btn-run-code" id="btn-run-tests">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"></polygon>
                </svg>
                Run Suite
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Capability 3: Projects -->
      <section class="section" id="projects">
        <div class="capability-info" style="margin-bottom: var(--space-6);">
          <span class="capability-num">03 / Project Lab</span>
          <h2 class="capability-title">Systems Engineering & Deployment</h2>
          <p class="capability-desc">
            Organize complex, real-world repositories with live simulated architecture previews, latency profiling, and pull request tracking.
          </p>
        </div>

        <div class="projects-grid">
          <div class="project-card">
            <div class="project-preview-viewport">
              <canvas id="project-canvas-signsense" class="project-viz-canvas"></canvas>
              <div class="project-viz-overlay-badge">ST-GCN • 60 FPS</div>
            </div>
            <div class="project-content">
              <div class="project-category-row"><span class="project-category">Computer Vision</span><span class="project-completion-stat">82%</span></div>
              <h3 class="project-title">SignSense AI</h3>
              <p class="project-desc">Real-time ASL translation utilizing 21-landmark spatial-temporal graph convolution.</p>
              <div class="project-progress-track"><div class="project-progress-fill" style="width: 82%;"></div></div>
              <div class="project-footer">
                <span style="font-size: var(--fs-micro); color: var(--text-tertiary);">Latency: 14.2ms</span>
                <button class="btn-inspect-project" data-project="signsense">Inspect Architecture →</button>
              </div>
            </div>
          </div>

          <div class="project-card">
            <div class="project-preview-viewport">
              <canvas id="project-canvas-nexus" class="project-viz-canvas"></canvas>
              <div class="project-viz-overlay-badge">Neural Synapse • 22ms</div>
            </div>
            <div class="project-content">
              <div class="project-category-row"><span class="project-category">Multi-Agent</span><span class="project-completion-stat">61%</span></div>
              <h3 class="project-title">Nexus AI</h3>
              <p class="project-desc">Hierarchical agent orchestration with episodic memory vector stores.</p>
              <div class="project-progress-track"><div class="project-progress-fill" style="width: 61%;"></div></div>
              <div class="project-footer">
                <span style="font-size: var(--fs-micro); color: var(--text-tertiary);">Latency: 240ms</span>
                <button class="btn-inspect-project" data-project="nexus">Inspect Architecture →</button>
              </div>
            </div>
          </div>

          <div class="project-card">
            <div class="project-preview-viewport">
              <canvas id="project-canvas-codemind" class="project-viz-canvas"></canvas>
              <div class="project-viz-overlay-badge">AST Incremental • 1.2ms</div>
            </div>
            <div class="project-content">
              <div class="project-category-row"><span class="project-category">Developer Tool</span><span class="project-completion-stat">91%</span></div>
              <h3 class="project-title">CodeMind</h3>
              <p class="project-desc">High-throughput AST code refactoring and memory safety invariant engine.</p>
              <div class="project-progress-track"><div class="project-progress-fill" style="width: 91%;"></div></div>
              <div class="project-footer">
                <span style="font-size: var(--fs-micro); color: var(--text-tertiary);">Latency: 1.2ms</span>
                <button class="btn-inspect-project" data-project="codemind">Inspect Architecture →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Capability 4 & 5: Goals & Focus -->
      <section class="section" id="focus">
        <div class="capability-info" style="margin-bottom: var(--space-6);">
          <span class="capability-num">04 & 05 / Goals & Focus</span>
          <h2 class="capability-title">Distraction-Free Sensory Isolation</h2>
          <p class="capability-desc">
            When it's time to build, strip away all notifications and mental clutter. Activate procedural acoustic soundscapes (binaural 432Hz theta waves, procedural rain) directly inside your workspace.
          </p>
        </div>

        <div class="focus-environment-card">
          <canvas id="focus-ambient-canvas" aria-hidden="true"></canvas>
          <div class="focus-content-layer">
            <span class="focus-eyebrow">FOCUS SESSION</span>
            <div class="focus-timer-display" id="focus-timer-text">24 : 38</div>
            <div class="focus-active-task">Python — Loops & Concurrency Practice</div>
            <div class="focus-divider-line"></div>
            <div class="focus-actions-row">
              <button class="btn-focus-primary" id="btn-focus-toggle">Pause</button>
              <button class="btn-focus-secondary" id="btn-focus-reset">Reset</button>
            </div>
            <div class="focus-progress-wrapper">
              <div class="focus-progress-header"><span>Session Progress</span><span id="focus-progress-pct">64%</span></div>
              <div class="focus-progress-bar"><div class="focus-progress-fill" id="focus-progress-fill"></div></div>
            </div>
          </div>
          <div class="focus-audio-bar">
            <button id="btn-toggle-sound" class="btn-toggle-audio">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>
              Ambient Sound
            </button>
            <div class="audio-sound-picker">
              <button class="audio-chip active" data-sound="binaural">Binaural 432Hz</button>
              <button class="audio-chip" data-sound="rain">Procedural Rain</button>
              <button class="audio-chip" data-sound="cosmic">Cosmic Drone</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Capability 6: Analytics -->
      <section class="section" id="analytics">
        <div class="capability-info" style="margin-bottom: var(--space-6);">
          <span class="capability-num">06 / Continuous Telemetry</span>
          <h2 class="capability-title">Flowing Velocity Analytics</h2>
          <p class="capability-desc">
            A continuous activity landscape showing cognitive velocity, study volume, and commit regularity across days and months.
          </p>
        </div>

        <div class="analytics-visual-container">
          <div class="analytics-top-bar">
            <div class="analytics-title-group">
              <h3>Flowing Velocity Matrix</h3>
              <p>Continuous telemetry tracking study cadence and commit density</p>
            </div>
            <div class="segmented-control" role="tablist">
              <button class="segment-item active" data-timeframe="7d">7 Days</button>
              <button class="segment-item" data-timeframe="30d">30 Days</button>
              <button class="segment-item" data-timeframe="90d">90 Days</button>
            </div>
          </div>

          <div class="analytics-metrics-grid">
            <div class="analytics-metric-box">
              <span class="analytics-metric-label">Study Hours</span>
              <span class="analytics-metric-num" id="stat-study-hours">38.4 hrs</span>
              <span class="analytics-metric-delta" id="stat-hours-delta">+14% vs last week</span>
            </div>
            <div class="analytics-metric-box">
              <span class="analytics-metric-label">Learning Streak</span>
              <span class="analytics-metric-num" id="stat-streak">18 Days</span>
              <span class="analytics-metric-delta"><span class="status-dot"></span> Unbroken</span>
            </div>
            <div class="analytics-metric-box">
              <span class="analytics-metric-label">Goal Completion</span>
              <span class="analytics-metric-num" id="stat-velocity">94%</span>
              <span class="analytics-metric-delta">Top 2%</span>
            </div>
            <div class="analytics-metric-box">
              <span class="analytics-metric-label">Lines & Commits</span>
              <span class="analytics-metric-num" id="stat-lines">1,420</span>
              <span class="analytics-metric-delta">3 Repositories</span>
            </div>
          </div>

          <div class="flowing-activity-viewport">
            <svg id="flowing-svg-chart" class="flowing-svg-chart"></svg>
          </div>

          <div class="consistency-matrix-container">
            <div class="consistency-header"><span>16-Week Consistency Matrix</span></div>
            <div class="consistency-grid" id="consistency-grid-target"></div>
          </div>
        </div>
      </section>

      <!-- Bottom Jump CTA -->
      <div style="text-align: center; margin-top: var(--space-8);">
        <a href="/workspace" class="btn btn-primary btn-lg">
          Launch AURA Workspace
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
        </a>
      </div>
    </div>
  `;
}

export function initProductPage() {
  initSkillConstellation();
  initCodePlayground();
  initProjectLab();
  initFocusMode();
  initAnalyticsVisualizer();

  return () => {
    // Teardown if required
  };
}
