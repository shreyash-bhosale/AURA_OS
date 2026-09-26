/**
 * AURA AI Intelligence Page (Route: /ai)
 * Architecture, connected system diagram, and proactive recommendation engine.
 */

import { initIntelligenceEngine } from '../modules/intelligenceEngine.js';

export function renderAIPage() {
  return `
    <div class="page-header-banner">
      <div class="hero-ambient-glow" aria-hidden="true"></div>
      <div class="container">
        <span class="section-eyebrow indigo">Neural Intelligence Layer</span>
        <h1 class="hero-headline" style="font-size: var(--fs-hero); margin-top: 12px;">
          Intelligence that understands<br>
          <span class="gradient-text">how you work.</span>
        </h1>
        <p class="hero-subheadline">
          Not another generic chat assistant. A continuous intelligence layer connecting your goals, curriculum, projects, and active focus.
        </p>
      </div>
    </div>

    <div class="container" style="padding-bottom: clamp(4rem, 8vw, 7rem);">
      <!-- Interactive Pipeline Representation -->
      <div class="ai-pipeline-flow">
        <div class="pipeline-step">Your Goals</div>
        <span class="pipeline-arrow">→</span>
        <div class="pipeline-step">Your Learning</div>
        <span class="pipeline-arrow">→</span>
        <div class="pipeline-step">Your Projects</div>
        <span class="pipeline-arrow">→</span>
        <div class="pipeline-step">Your Activity</div>
        <span class="pipeline-arrow">→</span>
        <div class="pipeline-step highlight">AURA Intelligence</div>
        <span class="pipeline-arrow">→</span>
        <div class="pipeline-step">Personalized Recommendations</div>
      </div>

      <!-- Central Connected System Diagram Canvas -->
      <div class="ai-system-nexus-container">
        <div style="text-align: center; margin-bottom: var(--space-4);">
          <span class="badge badge-cyan">Unified Ingestion Topology</span>
          <h3 style="font-size: 1.35rem; margin-top: 6px;">Central System Node Graph</h3>
        </div>
        <canvas id="ai-system-canvas" aria-label="AURA Intelligence Connected System Topology Canvas"></canvas>
      </div>

      <!-- Examples of Real AI Interaction Patterns -->
      <div class="section-header" style="margin-top: var(--space-8);">
        <span class="section-eyebrow">Proactive Intelligence In Practice</span>
        <h2 class="section-title">Contextual, not conversational.</h2>
        <p class="section-subtitle">
          Instead of waiting for prompts, AURA Intelligence surfaces high-leverage insights based on your actual build velocity.
        </p>
      </div>

      <div class="ai-insights-grid">
        <!-- Example 1: Daily Recommendation -->
        <div class="ai-insight-card">
          <div class="ai-insight-badge-row">
            <span class="badge badge-cyan">Daily Recommendation</span>
            <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-tertiary);">08:30 AM</span>
          </div>
          <h3 class="ai-insight-title">Time-Optimized Sprint</h3>
          <div class="ai-insight-quote">
            “You have 45 minutes available. Continue your computer vision project?”
          </div>
          <p class="ai-insight-meta">
            Synthesized from your calendar availability and SignSense AI's 82% completion status.
          </p>
          <a href="/workspace" class="btn btn-secondary btn-sm" style="margin-top: auto;">Launch Sprint in Workspace →</a>
        </div>

        <!-- Example 2: Learning Recommendation -->
        <div class="ai-insight-card">
          <div class="ai-insight-badge-row">
            <span class="badge badge-emerald">Learning Milestone</span>
            <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-tertiary);">Curriculum</span>
          </div>
          <h3 class="ai-insight-title">Curriculum Progression</h3>
          <div class="ai-insight-quote">
            “You completed Python loops. Your next recommended topic is functions and async concurrency.”
          </div>
          <p class="ai-insight-meta">
            Prevents cognitive gaps by identifying prerequisite dependencies across algorithms and machine learning.
          </p>
          <a href="/product" class="btn btn-secondary btn-sm" style="margin-top: auto;">Inspect Curriculum Map →</a>
        </div>

        <!-- Example 3: Project Insight -->
        <div class="ai-insight-card">
          <div class="ai-insight-badge-row">
            <span class="badge badge-indigo">Code Health</span>
            <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-tertiary);">Repository</span>
          </div>
          <h3 class="ai-insight-title">Test Coverage Advisory</h3>
          <div class="ai-insight-quote">
            “Your project is progressing well, but unit test assertions have not been updated recently.”
          </div>
          <p class="ai-insight-meta">
            Flags technical debt before merging pull requests into production branches.
          </p>
          <a href="/workspace" class="btn btn-secondary btn-sm" style="margin-top: auto;">Open Code Invariant Suite →</a>
        </div>
      </div>

      <!-- Live Interactive Intelligence Sandbox Console -->
      <div style="margin-top: var(--space-12);">
        <div class="intelligence-container">
          <div class="intelligence-waveform-banner">
            <canvas id="neural-waveform-canvas"></canvas>
            <div class="waveform-status-badge">
              <span class="status-dot"></span>
              <span>SYNAPSE: ACTIVE • 240 T/S</span>
            </div>
          </div>

          <div class="intelligence-body">
            <div class="intelligence-dialogue-pane">
              <div class="intelligence-speech-bubble">
                <div class="intelligence-speech-greeting" id="ai-greeting-target">AURA Intelligence Briefing</div>
                <div class="intelligence-speech-body" id="ai-body-target">
                  You completed 3 tasks today across your curriculum. I recommend spending the next 45 minutes on your computer vision project.
                </div>
                <div class="intelligence-reasoning-quote">
                  <div class="reasoning-label">Reasoning Trace</div>
                  <div class="reasoning-text" id="ai-reason-target">
                    Your project is 82% complete and you haven't worked on it for 3 days. A 45-minute sprint will finalize the ST-GCN hand landmark classifier.
                  </div>
                </div>
                <a href="/workspace" class="btn btn-primary" id="ai-action-btn-target">
                  Start Focus Session (45m)
                </a>
              </div>

              <div class="intelligence-input-wrapper">
                <div class="intelligence-chips-row">
                  <button class="prompt-chip" data-prompt-key="sprint">Synthesize today's sprint</button>
                  <button class="prompt-chip" data-prompt-key="cv">Review CV priority</button>
                  <button class="prompt-chip" data-prompt-key="cuda">Debug CUDA VRAM</button>
                  <button class="prompt-chip" data-prompt-key="velocity">Analyze focus velocity</button>
                </div>

                <form id="ai-query-form" class="intelligence-input-bar">
                  <input type="text" id="ai-input-query" placeholder="Ask AURA Intelligence anything regarding your code or sprints..." autocomplete="off">
                  <button type="submit" class="btn btn-secondary btn-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </form>
              </div>
            </div>

            <div class="intelligence-context-pane">
              <div class="context-pane-header">
                <span>Contextual Telemetry</span>
                <span class="badge badge-emerald">Synced</span>
              </div>
              <div class="context-card">
                <div class="context-card-title">Active Knowledge Graph</div>
                <div class="context-card-value">12 Nodes • 4 Tracks</div>
                <div class="context-card-desc">Retention score indexed at 94% across Python and Deep Learning.</div>
              </div>
              <div class="context-card">
                <div class="context-card-title">Cognitive Energy Level</div>
                <div class="context-card-value">Optimal (Peak Flow)</div>
                <div class="context-card-desc">Ideal time window for architectural problem solving.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initAIPage() {
  initIntelligenceEngine();
  const cleanupNexus = initAINexusCanvas();

  return () => {
    if (typeof cleanupNexus === 'function') cleanupNexus();
  };
}

/**
 * Animated Central AURA Core Connected System Topology
 */
function initAINexusCanvas() {
  const canvas = document.getElementById('ai-system-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationId;
  let t = 0;

  function render() {
    t += 0.025;
    const w = (canvas.width = canvas.offsetWidth);
    const h = (canvas.height = canvas.offsetHeight);

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;

    const satellites = [
      { label: 'Learning', angle: 0 },
      { label: 'Coding', angle: (Math.PI * 2) / 5 },
      { label: 'Projects', angle: ((Math.PI * 2) / 5) * 2 },
      { label: 'Focus', angle: ((Math.PI * 2) / 5) * 3 },
      { label: 'Analytics', angle: ((Math.PI * 2) / 5) * 4 }
    ];

    const orbitRadius = Math.min(w, h) * 0.38;

    // Draw connecting beams
    satellites.forEach((sat, i) => {
      const curAngle = sat.angle + t * 0.2;
      const sx = cx + Math.cos(curAngle) * orbitRadius;
      const sy = cy + Math.sin(curAngle) * (orbitRadius * 0.55);

      // Beam line
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sx, sy);
      ctx.stroke();

      // Traveling data packet
      const packetPos = (t * 0.8 + i * 0.4) % 1;
      const px = cx + (sx - cx) * packetPos;
      const py = cy + (sy - cy) * packetPos;

      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Satellite node
      ctx.fillStyle = '#161617';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      const pillW = 76;
      const pillH = 26;
      ctx.fillRect(sx - pillW / 2, sy - pillH / 2, pillW, pillH);
      ctx.strokeRect(sx - pillW / 2, sy - pillH / 2, pillW, pillH);

      ctx.fillStyle = '#F5F5F7';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sat.label, sx, sy);
    });

    // Central Core Orb
    const coreGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 38);
    coreGrad.addColorStop(0, '#FFFFFF');
    coreGrad.addColorStop(0.4, 'rgba(99, 102, 241, 0.9)');
    coreGrad.addColorStop(1, 'rgba(56, 189, 248, 0.4)');

    ctx.save();
    ctx.shadowColor = 'rgba(99, 102, 241, 0.7)';
    ctx.shadowBlur = 24;
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 32 + Math.sin(t * 2) * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AURA CORE', cx, cy);

    animationId = requestAnimationFrame(render);
  }

  animationId = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(animationId);
  };
}
