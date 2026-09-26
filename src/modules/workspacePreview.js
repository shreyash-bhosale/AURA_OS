/**
 * AURA Workspace Preview & OS Simulation
 * Manages live window tab switching, titlebar clock, interactive task toggles,
 * and seamless deep links.
 */

export function initWorkspacePreview() {
  const sidebarBtns = document.querySelectorAll('.os-sidebar-btn');
  const viewPanels = document.querySelectorAll('.os-view-panel');
  const clockElement = document.getElementById('os-clock-display');

  // 1. Live OS Titlebar Clock
  function updateClock() {
    if (!clockElement) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // 2. Sidebar Tab Navigation
  sidebarBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-view');

      // Update active button state
      sidebarBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Switch active view panel
      viewPanels.forEach((panel) => {
        if (panel.getAttribute('data-view-panel') === targetView) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });

  // 3. Interactive Task Checkbox & Progress Calculation
  const taskCheckboxes = document.querySelectorAll('.os-task-checkbox');
  const learningProgressBar = document.getElementById('os-learning-progress-fill');
  const learningProgressNum = document.getElementById('os-learning-progress-num');

  taskCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const taskItem = checkbox.closest('.os-task-item');
      if (taskItem) {
        taskItem.classList.toggle('done', checkbox.checked);
      }

      // Calculate new completion percentage
      const total = taskCheckboxes.length;
      const checked = document.querySelectorAll('.os-task-checkbox:checked').length;
      const basePercentage = 68;
      const added = Math.round((checked / total) * 32);
      const current = Math.min(100, basePercentage + added);

      if (learningProgressBar) {
        learningProgressBar.style.width = `${current}%`;
      }
      if (learningProgressNum) {
        learningProgressNum.textContent = `${current}%`;
      }
    });
  });

  // 4. Deep link action buttons inside the OS mockup
  const osActions = document.querySelectorAll('[data-os-jump]');
  osActions.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-os-jump');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
