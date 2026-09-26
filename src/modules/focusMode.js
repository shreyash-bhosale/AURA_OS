/**
 * AURA Focus Mode Engine
 * Manages minimal distraction-free countdown timer, ambient particle canvas,
 * and built-in Web Audio API generative soundscapes (Rain, Binaural Drone, Cosmic Static).
 */

export function initFocusMode() {
  initFocusTimer();
  initAmbientCanvas();
  initWebAudioSynthesizer();
}

/**
 * 1. Focus Timer Controller
 */
function initFocusTimer() {
  const display = document.getElementById('focus-timer-text');
  const btnToggle = document.getElementById('btn-focus-toggle');
  const btnReset = document.getElementById('btn-focus-reset');
  const progressFill = document.getElementById('focus-progress-fill');
  const progressPct = document.getElementById('focus-progress-pct');

  let totalSeconds = 25 * 60;
  let remainingSeconds = 24 * 60 + 38; // Initial state: 24:38
  let isRunning = false;
  let timerInterval = null;

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')} : ${String(s).padStart(2, '0')}`;
  }

  function updateUI() {
    if (display) display.textContent = formatTime(remainingSeconds);
    const elapsed = totalSeconds - remainingSeconds;
    const pct = Math.min(100, Math.round((elapsed / totalSeconds) * 100));
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressPct) progressPct.textContent = `${pct}%`;
  }

  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      isRunning = !isRunning;
      btnToggle.textContent = isRunning ? 'Pause' : 'Start Focus';

      if (isRunning) {
        timerInterval = setInterval(() => {
          if (remainingSeconds > 0) {
            remainingSeconds--;
            updateUI();
          } else {
            clearInterval(timerInterval);
            isRunning = false;
            btnToggle.textContent = 'Session Complete';
          }
        }, 1000);
      } else {
        clearInterval(timerInterval);
      }
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      clearInterval(timerInterval);
      isRunning = false;
      remainingSeconds = totalSeconds;
      if (btnToggle) btnToggle.textContent = 'Start Focus';
      updateUI();
    });
  }

  updateUI();
}

/**
 * 2. Atmospheric Particle Canvas
 */
function initAmbientCanvas() {
  const canvas = document.getElementById('focus-ambient-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationId;
  const particles = [];
  const COUNT = 32;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.4 + 0.1
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    animationId = requestAnimationFrame(render);
  }
  animationId = requestAnimationFrame(render);
}

/**
 * 3. Web Audio API Generative Ambient Soundscape
 */
function initWebAudioSynthesizer() {
  let audioCtx = null;
  let isPlaying = false;
  let currentPreset = 'binaural';
  let activeNodes = [];

  const toggleBtn = document.getElementById('btn-toggle-sound');
  const chips = document.querySelectorAll('.audio-chip');

  function startAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    stopActiveAudio();

    if (currentPreset === 'binaural') {
      // 432 Hz Left Ear, 436 Hz Right Ear -> 4 Hz Theta Brainwave Flow
      const oscL = audioCtx.createOscillator();
      const oscR = audioCtx.createOscillator();
      const merger = audioCtx.createChannelMerger(2);
      const masterGain = audioCtx.createGain();

      oscL.type = 'sine';
      oscL.frequency.value = 432;
      oscR.type = 'sine';
      oscR.frequency.value = 436;

      masterGain.gain.setValueAtTime(0.04, audioCtx.currentTime);

      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);
      merger.connect(masterGain);
      masterGain.connect(audioCtx.destination);

      oscL.start();
      oscR.start();
      activeNodes = [oscL, oscR, masterGain];
    } else if (currentPreset === 'rain') {
      // Procedural White/Brown Noise for Rain
      const bufferSize = audioCtx.sampleRate * 2;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02; // Brown noise approximation
        lastOut = data[i];
        data[i] *= 3.5;
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 750;

      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.03, audioCtx.currentTime);

      noise.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(audioCtx.destination);

      noise.start();
      activeNodes = [noise, filter, masterGain];
    } else if (currentPreset === 'cosmic') {
      // Low Ambient Cosmic Pad Drone
      const osc = audioCtx.createOscillator();
      const filter = audioCtx.createBiquadFilter();
      const masterGain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.value = 108;
      filter.type = 'lowpass';
      filter.frequency.value = 240;

      masterGain.gain.setValueAtTime(0.03, audioCtx.currentTime);

      osc.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(audioCtx.destination);

      osc.start();
      activeNodes = [osc, filter, masterGain];
    }
  }

  function stopActiveAudio() {
    activeNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    activeNodes = [];
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      toggleBtn.innerHTML = isPlaying
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> Mute Ambient`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> Ambient Sound`;

      if (isPlaying) {
        startAudio();
      } else {
        stopActiveAudio();
      }
    });
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      currentPreset = chip.getAttribute('data-sound');
      if (isPlaying) {
        startAudio();
      }
    });
  });
}
