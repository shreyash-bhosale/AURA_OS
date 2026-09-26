/**
 * AURA — Main Application Bootstrap
 * Connects design systems, client-side router, modals, and persistent navigation.
 */

// Import CSS Design System & Page Styles
import './styles/variables.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/hero.css';
import './styles/core-canvas.css';
import './styles/workspace-preview.css';
import './styles/learning.css';
import './styles/coding.css';
import './styles/projects.css';
import './styles/intelligence.css';
import './styles/focus.css';
import './styles/analytics.css';
import './styles/command-center.css';
import './styles/transitions.css';
import './styles/page-product.css';
import './styles/page-experience.css';
import './styles/page-ai.css';
import './styles/page-workspace.css';
import './styles/page-projects-full.css';
import './styles/page-auth.css';
import './styles/page-onboarding.css';
import './styles/page-settings.css';
import './styles/page-dashboard-personalized.css';

// Import Core Modules & Router
import { initRouter } from './router.js';
import { initThemeManager } from './modules/themeManager.js';
import { initCommandCenter } from './modules/commandCenter.js';
import { initAuth } from './data/authService.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Global Theme, Auth & Navigation Listeners
  initThemeManager();
  initNavScroll();
  initMobileMenu();
  initCommandCenter();
  initAuth();

  // 2. Initialize Client-Side Router
  initRouter();

  console.log('AURA Multi-Page Application Bootstrapped.');
});

/**
 * Sticky Navbar Elevation on Scroll
 */
function initNavScroll() {
  const header = document.querySelector('.nav-header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 24) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/**
 * Mobile Drawer Menu with auto-close on navigation
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-nav-drawer');
  const closeBtn = document.getElementById('btn-close-mobile-nav');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !drawer) return;

  function toggle() {
    drawer.classList.toggle('open');
  }

  function close() {
    drawer.classList.remove('open');
  }

  toggleBtn.addEventListener('click', toggle);
  if (closeBtn) closeBtn.addEventListener('click', close);

  links.forEach((l) => {
    l.addEventListener('click', close);
  });
}
