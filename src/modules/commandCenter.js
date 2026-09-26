/**
 * AURA Command Center (⌘K Quick Launcher)
 * Handles global keyboard shortcuts, real-time command search,
 * and seamless multi-page route dispatching.
 */

import { navigate } from '../router.js';

const COMMANDS = [
  { id: 'jump-home', title: 'Home', desc: 'Overview, AURA Core, and product introduction', icon: 'home', route: '/' },
  { id: 'jump-product', title: 'Product Capabilities', desc: 'Learning, Coding, Projects, Focus, and Analytics', icon: 'layers', route: '/product' },
  { id: 'jump-experience', title: 'Experience Journey', desc: 'Cinematic 8-step daily flow walkthrough', icon: 'compass', route: '/experience' },
  { id: 'jump-ai', title: 'AI Intelligence', desc: 'Architecture, connected system graph, and recommendations', icon: 'cpu', route: '/ai' },
  { id: 'jump-workspace', title: 'Open Workspace OS', desc: 'Full application dashboard and tools', icon: 'layout', route: '/workspace' }
];

export function initCommandCenter() {
  const backdrop = document.getElementById('command-palette-backdrop');
  const searchInput = document.getElementById('palette-search-input');
  const resultsList = document.getElementById('palette-results-list');
  const triggerBtns = document.querySelectorAll('.btn-enter-aura, [data-open-aura]');

  if (!backdrop) return;

  function openPalette() {
    backdrop.classList.add('active');
    renderList(COMMANDS);
    setTimeout(() => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
    }, 50);
  }

  function closePalette() {
    backdrop.classList.remove('active');
  }

  function renderList(items) {
    if (!resultsList) return;
    if (items.length === 0) {
      resultsList.innerHTML = `<div style="padding: 16px; text-align: center; color: var(--text-tertiary); font-size: 0.85rem;">No commands or pages found.</div>`;
      return;
    }

    resultsList.innerHTML = items
      .map(
        (cmd, idx) => `
      <div class="palette-item ${idx === 0 ? 'selected' : ''}" data-route="${cmd.route}">
        <div class="palette-item-left">
          <svg class="palette-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <div>
            <div style="font-weight: 600; color: var(--text-primary);">${cmd.title}</div>
            <div class="palette-item-desc">${cmd.desc}</div>
          </div>
        </div>
        <span class="palette-shortcut-badge">↵ Jump to page</span>
      </div>
    `
      )
      .join('');

    resultsList.querySelectorAll('.palette-item').forEach((item) => {
      item.addEventListener('click', () => {
        const route = item.getAttribute('data-route');
        closePalette();
        navigate(route);
      });
    });
  }

  triggerBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      // If it's a direct link to /workspace, allow default if not holding modifiers, or open palette
      if (btn.tagName === 'A' && btn.getAttribute('href') === '/workspace') {
        return; // normal link navigation
      }
      e.preventDefault();
      openPalette();
    });
  });

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (backdrop.classList.contains('active')) closePalette();
      else openPalette();
    } else if (e.key === 'Escape' && backdrop.classList.contains('active')) {
      closePalette();
    }
  });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closePalette();
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      const filtered = COMMANDS.filter(
        (c) => c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
      );
      renderList(filtered);
    });
  }
}
