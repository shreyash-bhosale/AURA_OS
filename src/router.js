/**
 * AURA Client-Side Router
 * Provides clean HTML5 History API routing, active link tracking,
 * smooth page transitions, and browser back/forward integration.
 * Supports dynamic routes: /projects/:id and full Auth + Onboarding + Settings routes.
 */

import { renderHomePage, initHomePage } from './pages/HomePage.js';
import { renderProductPage, initProductPage } from './pages/ProductPage.js';
import { renderExperiencePage, initExperiencePage } from './pages/ExperiencePage.js';
import { renderAIPage, initAIPage } from './pages/AIPage.js';
import { renderWorkspacePage, initWorkspacePage } from './pages/WorkspacePage.js';
import { renderProjectsPage, initProjectsPage } from './pages/ProjectsPage.js';
import { renderProjectDetailPage, initProjectDetailPage } from './pages/ProjectDetailPage.js';
import { renderLoginPage, initLoginPage } from './pages/LoginPage.js';
import { renderSignupPage, initSignupPage } from './pages/SignupPage.js';
import { renderOnboardingPage, initOnboardingPage } from './pages/OnboardingPage.js';
import { renderSettingsProfilePage, initSettingsProfilePage } from './pages/SettingsProfilePage.js';
import { renderSettingsPersonalizationPage, initSettingsPersonalizationPage } from './pages/SettingsPersonalizationPage.js';
import { renderCodingPage, initCodingPage } from './pages/CodingPage.js';
import { getCurrentUser, isAuthenticated } from './data/authService.js';
import { loadProfile, getWorkspaceConfig } from './data/userProfile.js';

const STATIC_ROUTES = {
  '/': {
    title: 'AURA — AI Personal Command Center',
    render: renderHomePage,
    init: initHomePage
  },
  '/product': {
    title: 'Product Capabilities — AURA',
    render: renderProductPage,
    init: initProductPage
  },
  '/experience': {
    title: 'Experience Journey — AURA',
    render: renderExperiencePage,
    init: initExperiencePage
  },
  '/ai': {
    title: 'AURA Intelligence — AI Layer',
    render: renderAIPage,
    init: initAIPage
  },
  '/workspace': {
    title: 'AURA Workspace — Personal Command OS',
    render: renderWorkspacePage,
    init: initWorkspacePage,
    requiresAuth: true
  },
  '/projects': {
    title: 'Projects — AURA Command Center',
    render: renderProjectsPage,
    init: initProjectsPage
  },
  '/coding': {
    title: 'Code Sandbox — AURA',
    render: renderCodingPage,
    init: initCodingPage,
    requiresAuth: true
  },
  '/login': {
    title: 'Sign In — AURA',
    render: renderLoginPage,
    init: initLoginPage
  },
  '/signup': {
    title: 'Create Account — AURA',
    render: renderSignupPage,
    init: initSignupPage
  },
  '/onboarding': {
    title: 'Personalized Setup — AURA',
    render: renderOnboardingPage,
    init: initOnboardingPage,
    requiresAuth: true
  },
  '/settings/profile': {
    title: 'User Profile — AURA',
    render: renderSettingsProfilePage,
    init: initSettingsProfilePage,
    requiresAuth: true
  },
  '/settings/personalization': {
    title: 'Personalization Engine — AURA',
    render: renderSettingsPersonalizationPage,
    init: initSettingsPersonalizationPage,
    requiresAuth: true
  }
};

let currentCleanup = null;

export function initRouter() {
  // Listen for browser Back/Forward navigation
  window.addEventListener('popstate', () => {
    navigate(window.location.pathname, false);
  });

  // Global link interception for SPA navigation
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    // Check if link is an internal application route
    if (href.startsWith('/') && !href.startsWith('//')) {
      e.preventDefault();
      navigate(href);
    }
  });

  // Initial page load based on current browser path
  navigate(window.location.pathname, false);
}

/**
 * Resolve path to a route config object.
 * Handles static routes and dynamic /projects/:id.
 */
function resolveRoute(path) {
  // Try exact static match first
  if (STATIC_ROUTES[path]) {
    return { route: STATIC_ROUTES[path], params: {}, matchedPath: path };
  }

  // Dynamic /projects/:id
  const projectDetailMatch = path.match(/^\/projects\/([^/]+)$/);
  if (projectDetailMatch) {
    const projectId = projectDetailMatch[1];
    return {
      route: {
        title: 'Project — AURA',
        render: () => renderProjectDetailPage(projectId),
        init: () => initProjectDetailPage(projectId)
      },
      params: { projectId },
      matchedPath: `/projects/${projectId}`
    };
  }

  // Fallback: home
  return { route: STATIC_ROUTES['/'], params: {}, matchedPath: '/' };
}

export function navigate(path, pushState = true) {
  let targetPath = path;

  // Route Guards
  const { route: checkRoute } = resolveRoute(targetPath);
  if (checkRoute.requiresAuth && !isAuthenticated()) {
    targetPath = '/login';
  }

  const { route, matchedPath } = resolveRoute(targetPath);
  const pageContainer = document.getElementById('page-content');

  if (!pageContainer) return;

  // Cleanup any active event listeners or canvas loops from previous page
  if (typeof currentCleanup === 'function') {
    try {
      currentCleanup();
    } catch (err) {
      console.warn('Router cleanup error:', err);
    }
    currentCleanup = null;
  }

  // Update browser history
  if (pushState && window.location.pathname !== targetPath) {
    window.history.pushState({}, '', targetPath);
  }

  // Update document title
  document.title = route.title;

  // Transition: Exit current page
  pageContainer.classList.add('page-exit');

  setTimeout(() => {
    // Mount new page HTML
    pageContainer.innerHTML = route.render();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Transition: Enter new page
    pageContainer.classList.remove('page-exit');
    pageContainer.classList.add('page-enter');

    // Run page specific setup and capture cleanup
    if (typeof route.init === 'function') {
      currentCleanup = route.init();
    }

    // Update active state in top and mobile navigation
    updateActiveNavLinks(matchedPath, targetPath);

    // Dynamic Navigation & Auth Header integration
    updateGlobalNavigation(targetPath);

    // Adjust header/footer visibility
    adjustNavForRoute(targetPath);

    // Frame cleanup for smooth enter animation
    requestAnimationFrame(() => {
      pageContainer.classList.remove('page-enter');
    });
  }, 90);
}

function updateActiveNavLinks(matchedPath, rawPath) {
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    const isActive = href === matchedPath
      || href === rawPath
      || (href === '/projects' && rawPath.startsWith('/projects/'))
      || (href === '/' && matchedPath === '/');

    link.classList.toggle('active-route', isActive);
  });
}

function adjustNavForRoute(path) {
  const header = document.querySelector('.nav-header');
  const footer = document.querySelector('.footer');

  // Hide global navbar and footer on focused fullscreen views
  const isFullscreenView = ['/workspace', '/onboarding', '/login', '/signup'].includes(path);

  if (isFullscreenView) {
    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';
  } else {
    if (header) header.style.display = 'block';
    if (footer) footer.style.display = 'block';
  }
}

/**
 * Dynamically adjust navigation actions (Sign In vs Avatar/Workspace) & links
 */
export function updateGlobalNavigation(currentPath) {
  const user = getCurrentUser();
  const navActions = document.querySelector('.nav-actions');
  const navLinksContainer = document.querySelector('.nav-links');
  const mobileNavLinks = document.querySelector('.mobile-nav-links');
  const mobileNavActions = document.querySelector('.mobile-nav-actions');

  if (!navActions) return;

  // Let's update the desktop nav CTA
  let userMenu = document.getElementById('nav-user-menu');
  let enterBtn = document.getElementById('nav-btn-enter');
  let signInLink = document.getElementById('nav-btn-signin');

  if (user) {
    const profile = loadProfile(user.id);
    const displayName = profile?.name || user.name || 'User';
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AU';
    const role = (profile?.roles && profile.roles[0]) || (user.isDemo ? 'Demo Mode' : 'Member');

    if (enterBtn) enterBtn.style.display = 'none';
    if (signInLink) signInLink.style.display = 'none';

    if (!userMenu) {
      userMenu = document.createElement('div');
      userMenu.id = 'nav-user-menu';
      userMenu.className = 'nav-user-dropdown-container';
      navActions.insertBefore(userMenu, navActions.querySelector('.nav-mobile-toggle'));
    }

    userMenu.innerHTML = `
      <div class="nav-user-trigger" id="user-menu-trigger" tabindex="0" role="button" aria-haspopup="true" aria-expanded="false">
        <div class="user-avatar-badge">${initials}</div>
        <span class="user-name-text">${escapeHtml(displayName)}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div class="nav-user-dropdown" id="user-menu-dropdown">
        <div class="dropdown-header">
          <div class="dropdown-name">${escapeHtml(displayName)}</div>
          <div class="dropdown-role">${escapeHtml(role)}</div>
        </div>
        <div class="dropdown-divider"></div>
        <a href="/workspace" class="dropdown-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          Personal Workspace
        </a>
        <a href="/settings/personalization" class="dropdown-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          Personalization
        </a>
        <a href="/settings/profile" class="dropdown-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          Profile Settings
        </a>
        <div class="dropdown-divider"></div>
        <button type="button" class="dropdown-item dropdown-logout" id="menu-btn-signout">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Sign Out
        </button>
      </div>
    `;

    // Dropdown toggle handler
    const trigger = userMenu.querySelector('#user-menu-trigger');
    const dropdown = userMenu.querySelector('#user-menu-dropdown');
    trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown?.classList.toggle('open');
    });

    userMenu.querySelector('#menu-btn-signout')?.addEventListener('click', () => {
      import('./data/authService.js').then(({ signOut }) => {
        signOut();
        navigate('/login');
      });
    });

    // Close on click outside
    document.addEventListener('click', () => {
      dropdown?.classList.remove('open');
    }, { once: true });

    // Dynamic Navigation links based on user profile
    if (profile && navLinksContainer) {
      const config = getWorkspaceConfig(profile);
      if (config && config.navigation && config.navigation.length > 0) {
        navLinksContainer.innerHTML = config.navigation.map(nav => `
          <li><a href="${nav.href}" class="nav-link">${escapeHtml(nav.label)}</a></li>
        `).join('');
      }
    }

  } else {
    // Logged out
    if (userMenu) userMenu.remove();

    if (!signInLink) {
      signInLink = document.createElement('a');
      signInLink.id = 'nav-btn-signin';
      signInLink.href = '/login';
      signInLink.className = 'btn btn-ghost btn-sm';
      signInLink.textContent = 'Sign In';
      navActions.insertBefore(signInLink, enterBtn || navActions.firstChild);
    }
    signInLink.style.display = 'inline-flex';

    if (enterBtn) {
      enterBtn.style.display = 'inline-flex';
      enterBtn.href = '/signup';
      enterBtn.innerHTML = `
        Get Started
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M5 12h14M12 5l7 7-7 7"></path>
        </svg>
      `;
    }

    // Default nav links
    if (navLinksContainer) {
      navLinksContainer.innerHTML = `
        <li><a href="/product" class="nav-link">Product</a></li>
        <li><a href="/experience" class="nav-link">Experience</a></li>
        <li><a href="/ai" class="nav-link">AI Intelligence</a></li>
        <li><a href="/workspace" class="nav-link">Workspace</a></li>
        <li><a href="/projects" class="nav-link" style="color: var(--accent-cyan);">Projects</a></li>
      `;
    }
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
