/**
 * AURA Theme Manager
 * Implements Apple-inspired Dark & Light modes with persistent state
 * and seamless CSS token switching.
 */

export function initThemeManager() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const root = document.documentElement;

  // Retrieve saved preference or default to dark (as defined in GEMINI.md)
  const savedTheme = localStorage.getItem('aura-theme') || 'dark';
  setTheme(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('aura-theme', theme);
  }
}
