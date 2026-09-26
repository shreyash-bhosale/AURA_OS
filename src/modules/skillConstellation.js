/**
 * AURA Skill Constellation & Learning Path Engine
 * 
 * Dynamically computes skill tracks, curriculum progression, and node visual rings
 * strictly from authenticated database progress.
 * Brand new users start at 0% with "Not Started" status.
 */

import { getCurrentUser } from '../data/authService.js';
import { learningStore } from '../data/learningStore.js';

export function getDynamicSkillData(userId) {
  const pyProgress = learningStore.getProgress(userId);
  const pyPercent = pyProgress.percentage;
  const pyCompletedCount = pyProgress.completedCount;
  const pyTotal = pyProgress.totalCount;

  function deriveStatus(percent) {
    if (percent >= 100) return 'Mastered';
    if (percent > 0) return 'In Progress';
    return 'Not Started';
  }

  function deriveBadgeClass(percent) {
    if (percent >= 100) return 'badge-emerald';
    if (percent > 0) return 'badge-cyan';
    return 'badge-secondary';
  }

  // First few foundational topics to display in inspector
  const pythonCurriculumPreview = [
    { name: 'Python Basics & Indentation', done: pyProgress.completedTopicIds.includes('py-basics') },
    { name: 'Variables & Dynamic References', done: pyProgress.completedTopicIds.includes('py-variables') },
    { name: 'Data Types & Casting', done: pyProgress.completedTopicIds.includes('py-datatypes') },
    { name: 'Input & Output Formatting', done: pyProgress.completedTopicIds.includes('py-io') },
    { name: 'Arithmetic & Logical Operators', done: pyProgress.completedTopicIds.includes('py-operators') },
    { name: 'Conditional Branching & Truthiness', done: pyProgress.completedTopicIds.includes('py-conditional-statements') }
  ];

  return {
    python: {
      title: 'Python Core & Systems',
      progress: pyPercent,
      status: deriveStatus(pyPercent),
      badgeClass: deriveBadgeClass(pyPercent),
      desc: 'Foundational syntax, data structures, control flow, functions, OOP, and advanced metaprogramming.',
      lessons: `${pyCompletedCount} / ${pyTotal}`,
      time: pyCompletedCount > 0 ? `${(pyCompletedCount * 0.5).toFixed(1)} hrs` : '0 hrs',
      mastery: `${pyPercent}%`,
      currentTopic: pyCompletedCount < pyTotal ? 'Continue Current Topic' : 'All Topics Verified',
      curriculum: pythonCurriculumPreview
    },
    dsa: {
      title: 'Data Structures & Algorithms',
      progress: 0,
      status: 'Not Started',
      badgeClass: 'badge-secondary',
      desc: 'Algorithmic complexity, trees, graphs, spatial indexes, and dynamic programming.',
      lessons: '0 / 40',
      time: '0 hrs',
      mastery: '0%',
      currentTopic: 'Big-O Notation & Asymptotic Bounds',
      curriculum: [
        { name: 'Big-O Analysis & Space Complexity', done: false },
        { name: 'Dynamic Arrays & Ring Buffers', done: false },
        { name: 'Self-Balancing Binary Trees', done: false },
        { name: 'Graph Traversal & Shortest Paths', done: false }
      ]
    },
    ml: {
      title: 'Machine Learning Foundations',
      progress: 0,
      status: 'Not Started',
      badgeClass: 'badge-secondary',
      desc: 'Statistical learning theory, regularization, kernel methods, and convex optimization.',
      lessons: '0 / 38',
      time: '0 hrs',
      mastery: '0%',
      currentTopic: 'Linear & Logistic Regression',
      curriculum: [
        { name: 'Loss Functions & Gradient Descent', done: false },
        { name: 'L1/L2 Regularization (Lasso/Ridge)', done: false },
        { name: 'Decision Trees & Ensembles', done: false },
        { name: 'Kernel SVM & Support Vectors', done: false }
      ]
    },
    dl: {
      title: 'Deep Learning & Vision',
      progress: 0,
      status: 'Not Started',
      badgeClass: 'badge-secondary',
      desc: 'Tensor operations, backpropagation dynamics, CNN feature extractors, and residual architectures.',
      lessons: '0 / 38',
      time: '0 hrs',
      mastery: '0%',
      currentTopic: 'Perceptrons & Computation Graphs',
      curriculum: [
        { name: 'Automatic Differentiation (Autograd)', done: false },
        { name: 'Convolutional Kernels & Feature Maps', done: false },
        { name: 'Residual Networks (ResNet)', done: false },
        { name: 'Vision Transformers (ViT)', done: false }
      ]
    },
    genai: {
      title: 'Generative AI & LLMs',
      progress: 0,
      status: 'Not Started',
      badgeClass: 'badge-secondary',
      desc: 'Transformer attention mechanics, rotary embeddings, KV caching, quantization, and LoRA fine-tuning.',
      lessons: '0 / 34',
      time: '0 hrs',
      mastery: '0%',
      currentTopic: 'Self-Attention & Masked Decoders',
      curriculum: [
        { name: 'BPE Tokenizers & Vocabulary', done: false },
        { name: 'Scaled Dot-Product Self-Attention', done: false },
        { name: 'Rotary Position Embeddings (RoPE)', done: false },
        { name: 'LoRA Parameter-Efficient Adaptation', done: false }
      ]
    }
  };
}

export function initSkillConstellation() {
  const user = getCurrentUser();
  const skillData = getDynamicSkillData(user?.id);

  const nodes = document.querySelectorAll('.skill-node');
  const inspectorTitle = document.getElementById('inspector-title');
  const inspectorDesc = document.getElementById('inspector-desc');
  const inspectorBadge = document.getElementById('inspector-badge');
  const inspectorLessons = document.getElementById('inspector-stat-lessons');
  const inspectorTime = document.getElementById('inspector-stat-time');
  const inspectorMastery = document.getElementById('inspector-stat-mastery');
  const curriculumList = document.getElementById('inspector-curriculum-list');
  const startModuleBtn = document.getElementById('btn-start-next-module');

  // Update node progress displays in DOM
  nodes.forEach(node => {
    const skillKey = node.getAttribute('data-skill');
    const data = skillData[skillKey];
    if (data) {
      const label = node.querySelector('.node-progress-label');
      if (label) label.textContent = `${data.progress}%`;

      const statusEl = node.querySelector('.skill-node-status');
      if (statusEl) statusEl.textContent = data.status;

      const circle = node.querySelector('.node-progress-circle');
      if (circle) {
        // Circumference for r=28 is 2 * PI * 28 = ~176
        const offset = 176 - (176 * data.progress) / 100;
        circle.style.strokeDashoffset = String(offset);
      }
    }
  });

  function updateInspector(skillKey) {
    const data = skillData[skillKey];
    if (!data) return;

    if (inspectorTitle) inspectorTitle.textContent = data.title;
    if (inspectorDesc) inspectorDesc.textContent = data.desc;
    if (inspectorBadge) {
      inspectorBadge.textContent = data.status;
      inspectorBadge.className = `badge ${data.badgeClass}`;
    }
    if (inspectorLessons) inspectorLessons.textContent = data.lessons;
    if (inspectorTime) inspectorTime.textContent = data.time;
    if (inspectorMastery) inspectorMastery.textContent = data.mastery;

    if (startModuleBtn) {
      startModuleBtn.textContent = `Launch Topic: ${data.currentTopic}`;
    }

    if (curriculumList) {
      curriculumList.innerHTML = data.curriculum
        .map(c => `
          <li class="curriculum-item ${c.done ? 'completed' : ''}">
            <span>${c.name}</span>
            <span style="font-family: var(--font-mono); font-size: 0.72rem; color: ${c.done ? 'var(--accent-emerald)' : 'var(--text-tertiary)'}">
              ${c.done ? '✓ Completed' : '☐ Incomplete'}
            </span>
          </li>
        `)
        .join('');
    }
  }

  nodes.forEach(node => {
    node.addEventListener('click', () => {
      nodes.forEach(n => n.classList.remove('selected'));
      node.classList.add('selected');
      const skillKey = node.getAttribute('data-skill');
      updateInspector(skillKey);
    });
  });

  // Default selection
  updateInspector('python');
}
