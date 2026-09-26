/**
 * AURA Coding Page (Route: /coding)
 * Real multi-language in-browser compilation and execution environment.
 * Connects directly to server-side code execution engine.
 */

import { codeExecutionService, SUPPORTED_LANGUAGES } from '../data/codeExecutionService.js';
import { getCurrentUser } from '../data/authService.js';

export function renderCodingPage() {
  const defaultLang = SUPPORTED_LANGUAGES[0];

  return `
    <div class="coding-viewport">
      <!-- Header Bar -->
      <div class="coding-header">
        <div class="coding-header-left">
          <div class="coding-eyebrow">Real In-Browser Runtime</div>
          <h1 class="coding-title">Code Execution Sandbox</h1>
        </div>

        <div class="coding-controls-bar">
          <select id="compiler-lang-select" class="lang-select-dropdown" aria-label="Select Programming Language">
            ${SUPPORTED_LANGUAGES.map(l => `
              <option value="${l.id}">${l.name}</option>
            `).join('')}
          </select>

          <button type="button" id="btn-compiler-reset" class="btn btn-secondary btn-sm" title="Reset to standard sample code">
            Reset Template
          </button>

          <button type="button" id="btn-compiler-clear" class="btn btn-secondary btn-sm" title="Clear editor content">
            Clear
          </button>

          <button type="button" id="btn-compiler-save" class="btn btn-secondary btn-sm" title="Save code snippet">
            Save Snippet
          </button>

          <button type="button" id="btn-compiler-run" class="btn btn-accent btn-sm" style="padding: 9px 20px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span id="run-btn-text">Run Code</span>
          </button>
        </div>
      </div>

      <!-- Main Compiler Workspace -->
      <div class="compiler-workspace-grid">
        <!-- Left: Code Editor -->
        <div class="editor-panel-card">
          <div class="editor-toolbar">
            <div class="editor-filename-tag">
              <span class="editor-filename-dot"></span>
              <span id="editor-active-filename">main.py</span>
            </div>
            <div class="editor-actions">
              <span class="badge badge-cyan" id="editor-runtime-tag">Python 3.10</span>
            </div>
          </div>

          <div class="code-editor-wrapper">
            <textarea 
              id="code-editor-input" 
              class="code-textarea" 
              spellcheck="false" 
              autocomplete="off" 
              autocorrect="off" 
              autocapitalize="off"
            >${defaultLang.defaultCode}</textarea>
          </div>
        </div>

        <!-- Right: Execution Terminal Console -->
        <div class="terminal-panel-card">
          <div class="terminal-header">
            <div class="terminal-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="4 17 10 11 4 5"></polyline>
                <line x1="12" y1="19" x2="20" y2="19"></line>
              </svg>
              <span>Terminal Output</span>
            </div>
            <div id="compiler-status-badge" class="badge">Idle</div>
          </div>

          <div class="terminal-body">
            <!-- Stdin Input Section -->
            <div class="terminal-stdin-section">
              <label class="terminal-section-label" for="terminal-stdin-box">Standard Input (stdin)</label>
              <textarea 
                id="terminal-stdin-box" 
                class="terminal-stdin-input" 
                placeholder="Optional input passed to program..."
              ></textarea>
            </div>

            <!-- Stdout Output Section -->
            <div class="terminal-stdout-section">
              <div class="terminal-section-label">Execution Results (stdout / stderr)</div>
              <div id="terminal-stdout-box" class="terminal-stdout-box idle">
                Click "Run Code" above to execute program.
              </div>
            </div>
          </div>

          <div class="terminal-footer-metrics">
            <span id="compiler-metric-time">Runtime: --</span>
            <span id="compiler-metric-exit">Exit Code: --</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initCodingPage() {
  const user = getCurrentUser();
  const langSelect = document.getElementById('compiler-lang-select');
  const editorInput = document.getElementById('code-editor-input');
  const filenameTag = document.getElementById('editor-active-filename');
  const runtimeTag = document.getElementById('editor-runtime-tag');
  const runBtn = document.getElementById('btn-compiler-run');
  const runBtnText = document.getElementById('run-btn-text');
  const resetBtn = document.getElementById('btn-compiler-reset');
  const clearBtn = document.getElementById('btn-compiler-clear');
  const saveBtn = document.getElementById('btn-compiler-save');
  const stdinBox = document.getElementById('terminal-stdin-box');
  const stdoutBox = document.getElementById('terminal-stdout-box');
  const statusBadge = document.getElementById('compiler-status-badge');
  const timeMetric = document.getElementById('compiler-metric-time');
  const exitMetric = document.getElementById('compiler-metric-exit');

  let currentLangObj = SUPPORTED_LANGUAGES[0];

  // Language Change Listener
  langSelect?.addEventListener('change', () => {
    const langId = langSelect.value;
    const found = SUPPORTED_LANGUAGES.find(l => l.id === langId);
    if (found) {
      currentLangObj = found;
      editorInput.value = found.defaultCode;
      filenameTag.textContent = `main.${found.ext}`;
      runtimeTag.textContent = found.name;
    }
  });

  // Reset Template
  resetBtn?.addEventListener('click', () => {
    editorInput.value = currentLangObj.defaultCode;
  });

  // Clear
  clearBtn?.addEventListener('click', () => {
    editorInput.value = '';
    editorInput.focus();
  });

  // Save Snippet
  saveBtn?.addEventListener('click', () => {
    const code = editorInput.value;
    if (!code.trim()) return;
    const name = prompt('Enter a name for this code snippet:', `${currentLangObj.name} Snippet`);
    if (name) {
      codeExecutionService.saveSnippet(user?.id, {
        name,
        language: currentLangObj.id,
        code
      });
      alert(`Snippet "${name}" saved to your personal library.`);
    }
  });

  // Run Code Execution
  runBtn?.addEventListener('click', async () => {
    const code = editorInput.value;
    const stdin = stdinBox?.value || '';

    if (!code.trim()) {
      stdoutBox.className = 'terminal-stdout-box has-error';
      stdoutBox.textContent = 'Error: Code editor is empty. Please enter code to run.';
      return;
    }

    // Set loading state
    runBtn.disabled = true;
    runBtnText.textContent = 'Running...';
    statusBadge.className = 'badge badge-warning';
    statusBadge.textContent = 'Executing';
    stdoutBox.className = 'terminal-stdout-box';
    stdoutBox.textContent = 'Executing in isolated container runtime...\n';

    try {
      const result = await codeExecutionService.executeCode({
        language: currentLangObj.id,
        code,
        stdin
      });

      runBtn.disabled = false;
      runBtnText.textContent = 'Run Code';

      if (result.success) {
        statusBadge.className = 'badge badge-emerald';
        statusBadge.textContent = 'Completed';
        stdoutBox.className = 'terminal-stdout-box';
        stdoutBox.textContent = result.stdout || result.output || '(Program completed with no output)';
      } else {
        statusBadge.className = 'badge badge-error';
        statusBadge.textContent = 'Failed';
        stdoutBox.className = 'terminal-stdout-box has-error';
        stdoutBox.textContent = result.stderr || result.output || 'Execution failed.';
      }

      timeMetric.textContent = `Runtime: ${result.executionTime || '0.05s'}`;
      exitMetric.textContent = `Exit Code: ${result.exitCode ?? 1}`;
    } catch (err) {
      runBtn.disabled = false;
      runBtnText.textContent = 'Run Code';
      statusBadge.className = 'badge badge-error';
      statusBadge.textContent = 'Error';
      stdoutBox.className = 'terminal-stdout-box has-error';
      stdoutBox.textContent = `Client execution error: ${err.message}`;
    }
  });

  // Tab key indents in textarea
  editorInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editorInput.selectionStart;
      const end = editorInput.selectionEnd;
      editorInput.value = editorInput.value.substring(0, start) + '    ' + editorInput.value.substring(end);
      editorInput.selectionStart = editorInput.selectionEnd = start + 4;
    }
  });

  return () => {};
}
