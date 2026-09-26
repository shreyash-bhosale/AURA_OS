/**
 * AURA Project Lab Visualizations & Architecture Inspector
 * Implements real-time canvas preview loops for computer vision tracking,
 * neural weight graphs, and AST parser visualization.
 */

const PROJECT_SPECS = {
  signsense: {
    title: 'SignSense AI',
    category: 'Computer Vision & Edge ML',
    completion: '82%',
    desc: 'Ultra-low latency American Sign Language recognition utilizing MediaPipe keypoint pipelines and spatial-temporal graph convolutional networks (ST-GCN).',
    tech: ['PyTorch', 'MediaPipe', 'WebRTC', 'TensorRT', 'FastAPI'],
    latency: '14.2 ms / frame',
    fps: '60 FPS @ 1080p',
    architecture: 'Input Frame -> 21 Landmark Keypoints -> ST-GCN Temporal Conv -> Transformer Classifier -> Speech Synthesis',
    prs: '4 Active / 28 Merged'
  },
  nexus: {
    title: 'Nexus AI',
    category: 'Autonomous Multi-Agent Assistant',
    completion: '61%',
    desc: 'Hierarchical agent orchestration framework with episodic memory vector stores, dynamic tool dispatching, and self-correcting code generation.',
    tech: ['TypeScript', 'LangGraph', 'Qdrant Vector DB', 'Claude API', 'Docker'],
    latency: '240 ms time-to-first-token',
    fps: '128 tokens / sec',
    architecture: 'User Intent -> Router Agent -> Memory Vector Recall -> Tool Sandbox Execution -> Verification Loop',
    prs: '6 Active / 42 Merged'
  },
  codemind: {
    title: 'CodeMind',
    category: 'Static Analysis & AST Developer Tool',
    completion: '91%',
    desc: 'High-throughput code refactoring and memory safety invariant checker with incremental semantic AST representation in Rust and WebAssembly.',
    tech: ['Rust', 'Tree-Sitter', 'WASM', 'WebWorkers', 'React'],
    latency: '1.2 ms per 10k LOC',
    fps: 'Zero Runtime Overhead',
    architecture: 'Source Code -> Tree-Sitter Incremental Parser -> Control Flow Graph -> Invariant Solver -> Diagnostics LSP',
    prs: '2 Active / 64 Merged'
  }
};

export function initProjectLab() {
  initSignSenseCanvas();
  initNexusCanvas();
  initCodeMindCanvas();
  initProjectModal();
}

/**
 * 1. SignSense Canvas: Real-time hand landmark tracker & bounding box scanner
 */
function initSignSenseCanvas() {
  const canvas = document.getElementById('project-canvas-signsense');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  function loop() {
    t += 0.03;
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, w, h);

    // Simulated Hand Landmark Points
    const cx = w / 2 + Math.sin(t * 0.7) * 20;
    const cy = h / 2 + Math.cos(t * 0.8) * 12;

    const points = [
      { x: cx, y: cy + 30 },      // Wrist
      { x: cx - 25, y: cy + 10 }, // Thumb base
      { x: cx - 40, y: cy - 10 }, // Thumb tip
      { x: cx - 12, y: cy - 35 + Math.sin(t * 2) * 8 }, // Index tip
      { x: cx + 8, y: cy - 38 },  // Middle tip
      { x: cx + 25, y: cy - 30 }, // Ring tip
      { x: cx + 38, y: cy - 18 }  // Pinky tip
    ];

    // Draw Skeleton Lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    points.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Draw Keypoint Nodes
    points.forEach((p) => {
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Bounding Box
    const boxX = cx - 55;
    const boxY = cy - 48;
    const boxW = 110;
    const boxH = 96;

    ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Confidence Tag
    ctx.fillStyle = '#34D399';
    ctx.font = '10px monospace';
    ctx.fillText('Gesture: "Index Pinch" (98.4%)', boxX, boxY - 6);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/**
 * 2. Nexus AI Canvas: Neural network layer synapses
 */
function initNexusCanvas() {
  const canvas = document.getElementById('project-canvas-nexus');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  function loop() {
    t += 0.02;
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, w, h);

    const layers = [3, 4, 3];
    const layerCols = [w * 0.25, w * 0.5, w * 0.75];
    const nodeCoords = [];

    layers.forEach((count, lIdx) => {
      const x = layerCols[lIdx];
      const spacing = h / (count + 1);
      const colNodes = [];
      for (let i = 1; i <= count; i++) {
        const y = spacing * i + Math.sin(t + i) * 4;
        colNodes.push({ x, y });
      }
      nodeCoords.push(colNodes);
    });

    // Draw Synapses
    for (let l = 0; l < nodeCoords.length - 1; l++) {
      nodeCoords[l].forEach((n1, i1) => {
        nodeCoords[l + 1].forEach((n2, i2) => {
          const weight = Math.sin(t * 2 + i1 * 2 + i2) * 0.5 + 0.5;
          ctx.strokeStyle = `rgba(99, 102, 241, ${weight * 0.4})`;
          ctx.lineWidth = weight * 1.5;
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.stroke();
        });
      });
    }

    // Draw Nodes
    nodeCoords.flat().forEach((n) => {
      ctx.fillStyle = '#A855F7';
      ctx.beginPath();
      ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/**
 * 3. CodeMind Canvas: AST Syntax Graph
 */
function initCodeMindCanvas() {
  const canvas = document.getElementById('project-canvas-codemind');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  function loop() {
    t += 0.025;
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, w, h);

    const root = { x: w / 2, y: 35, label: 'Program' };
    const branches = [
      { x: w * 0.28, y: 95, label: 'FnDecl' },
      { x: w * 0.50, y: 95, label: 'Param' },
      { x: w * 0.72, y: 95, label: 'Block' }
    ];
    const leaves = [
      { x: w * 0.18, y: 155, label: 'Ident' },
      { x: w * 0.38, y: 155, label: 'Type' },
      { x: w * 0.65, y: 155, label: 'Return' },
      { x: w * 0.85, y: 155, label: 'BinaryExpr' }
    ];

    ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
    ctx.lineWidth = 1.2;

    // Root to branches
    branches.forEach((b) => {
      ctx.beginPath();
      ctx.moveTo(root.x, root.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });

    // Branches to leaves
    ctx.beginPath();
    ctx.moveTo(branches[0].x, branches[0].y);
    ctx.lineTo(leaves[0].x, leaves[0].y);
    ctx.moveTo(branches[0].x, branches[0].y);
    ctx.lineTo(leaves[1].x, leaves[1].y);
    ctx.moveTo(branches[2].x, branches[2].y);
    ctx.lineTo(leaves[2].x, leaves[2].y);
    ctx.moveTo(branches[2].x, branches[2].y);
    ctx.lineTo(leaves[3].x, leaves[3].y);
    ctx.stroke();

    // Draw Nodes with Pills
    [root, ...branches, ...leaves].forEach((node) => {
      ctx.fillStyle = '#161617';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;

      const tw = 48;
      const th = 20;
      ctx.fillRect(node.x - tw / 2, node.y - th / 2, tw, th);
      ctx.strokeRect(node.x - tw / 2, node.y - th / 2, tw, th);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);
    });

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/**
 * 4. Architectural Inspection Modal
 */
function initProjectModal() {
  const modal = document.getElementById('project-modal');
  const closeBtn = document.getElementById('btn-close-project-modal');
  const inspectBtns = document.querySelectorAll('.btn-inspect-project');

  const titleEl = document.getElementById('modal-project-title');
  const categoryEl = document.getElementById('modal-project-category');
  const descEl = document.getElementById('modal-project-desc');
  const latencyEl = document.getElementById('modal-project-latency');
  const fpsEl = document.getElementById('modal-project-fps');
  const archEl = document.getElementById('modal-project-arch');
  const tagsEl = document.getElementById('modal-project-tags');

  inspectBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-project');
      const data = PROJECT_SPECS[key];
      if (!data || !modal) return;

      if (titleEl) titleEl.textContent = data.title;
      if (categoryEl) categoryEl.textContent = data.category;
      if (descEl) descEl.textContent = data.desc;
      if (latencyEl) latencyEl.textContent = data.latency;
      if (fpsEl) fpsEl.textContent = data.fps;
      if (archEl) archEl.textContent = data.architecture;

      if (tagsEl) {
        tagsEl.innerHTML = data.tech
          .map((t) => `<span class="tech-tag">${t}</span>`)
          .join('');
      }

      modal.classList.add('active');
    });
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
}
