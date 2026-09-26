/**
 * AURA Intelligence Engine
 * Manages animated neural waveform visualizer, proactive contextual dialogue,
 * streaming thought synthesis, and smart action triggers.
 */

const RESPONSES = {
  sprint: {
    greeting: 'Sprint Telemetry Synthesized',
    body: 'You completed 3 core objectives today across your Python and Machine Learning tracks with a 94% test pass velocity.',
    reason: 'Why? You are 1 module away from completing the AsyncIO milestone. Spending 30 minutes tonight will lock in your retention before tomorrow.',
    actionText: 'Launch AsyncIO Sandbox',
    actionTarget: 'coding'
  },
  cv: {
    greeting: 'Computer Vision Priority Notice',
    body: 'I recommend spending the next 45 minutes on SignSense AI: ST-GCN hand keypoint regression.',
    reason: 'Why? Your project is 82% complete and has been dormant for 3 days. Merging PR #29 will unblock real-time latency validation.',
    actionText: 'Start Focus Session (45m)',
    actionTarget: 'focus'
  },
  cuda: {
    greeting: 'CUDA Memory Analysis',
    body: 'Detected peak VRAM fragmentation at 11.4 GB during batch training. Recommended fix: invoke torch.cuda.empty_cache() after epoch validations.',
    reason: 'Why? Reducing memory fragmentation prevents Out-Of-Memory exceptions and increases tensor throughput by 18%.',
    actionText: 'Review Code Playground',
    actionTarget: 'coding'
  },
  velocity: {
    greeting: 'Focus Velocity Assessment',
    body: 'Your weekly focus consistency index is at 94%, with 38.4 recorded study hours and an 18-day unbroken streak.',
    reason: 'Why? You are currently in the top 2% of focused learners on AURA. Keep your evening session under 50m to avoid cognitive fatigue.',
    actionText: 'View Deep Analytics',
    actionTarget: 'analytics'
  }
};

export function initIntelligenceEngine() {
  initWaveformCanvas();
  initDialogue();
}

/**
 * Animated Neural Waveform Visualizer Canvas
 */
function initWaveformCanvas() {
  const canvas = document.getElementById('neural-waveform-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let t = 0;

  function render() {
    t += 0.035;
    const w = (canvas.width = canvas.offsetWidth);
    const h = (canvas.height = canvas.offsetHeight);

    ctx.clearRect(0, 0, w, h);

    const waves = [
      { color: 'rgba(99, 102, 241, 0.45)', amp: 24, freq: 0.015, speed: 1.0, phase: 0 },
      { color: 'rgba(56, 189, 248, 0.40)', amp: 18, freq: 0.022, speed: -1.2, phase: 2 },
      { color: 'rgba(168, 85, 247, 0.35)', amp: 28, freq: 0.018, speed: 0.8, phase: 4 }
    ];

    waves.forEach((wave) => {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = wave.color;

      for (let x = 0; x < w; x++) {
        // Center attenuation envelope (Gaussian bell curve)
        const normX = (x - w / 2) / (w * 0.38);
        const envelope = Math.exp(-0.5 * normX * normX);

        const y =
          h / 2 +
          Math.sin(x * wave.freq + t * wave.speed + wave.phase) *
            wave.amp *
            envelope;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

/**
 * Interactive Dialogue Controller
 */
function initDialogue() {
  const chips = document.querySelectorAll('.prompt-chip');
  const greetingEl = document.getElementById('ai-greeting-target');
  const bodyEl = document.getElementById('ai-body-target');
  const reasonEl = document.getElementById('ai-reason-target');
  const actionBtn = document.getElementById('ai-action-btn-target');
  const inputEl = document.getElementById('ai-input-query');
  const formEl = document.getElementById('ai-query-form');

  function triggerResponse(key) {
    const data = RESPONSES[key] || RESPONSES.cv;

    // Simulate streaming appearance
    if (greetingEl) greetingEl.textContent = 'AURA Intelligence is synthesizing...';
    if (bodyEl) bodyEl.textContent = 'Connecting neural models...';

    setTimeout(() => {
      if (greetingEl) greetingEl.textContent = data.greeting;
      if (bodyEl) bodyEl.textContent = data.body;
      if (reasonEl) reasonEl.textContent = data.reason;
      if (actionBtn) {
        actionBtn.textContent = data.actionText;
        actionBtn.setAttribute('data-target-sec', data.actionTarget);
      }
    }, 350);
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      const key = chip.getAttribute('data-prompt-key');
      triggerResponse(key);
    });
  });

  if (formEl) {
    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = inputEl ? inputEl.value.trim().toLowerCase() : '';
      if (!val) return;

      if (val.includes('cuda') || val.includes('gpu') || val.includes('memory')) {
        triggerResponse('cuda');
      } else if (val.includes('velocity') || val.includes('stat') || val.includes('hours')) {
        triggerResponse('velocity');
      } else if (val.includes('sprint') || val.includes('task')) {
        triggerResponse('sprint');
      } else {
        triggerResponse('cv');
      }
      if (inputEl) inputEl.value = '';
    });
  }

  if (actionBtn) {
    actionBtn.addEventListener('click', () => {
      const targetSec = actionBtn.getAttribute('data-target-sec') || 'focus';
      const secEl = document.getElementById(targetSec);
      if (secEl) {
        secEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}
