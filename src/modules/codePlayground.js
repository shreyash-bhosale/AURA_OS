/**
 * AURA Code Playground Engine
 * Manages multi-language syntax samples, line numbering, interactive execution runner,
 * and test result telemetry.
 */

const SNIPPETS = {
  python: {
    lang: 'Python',
    filename: 'task_optimizer.py',
    lines: [
      '<span class="syn-keyword">def</span> <span class="syn-def">calculate_progress</span>(<span class="syn-param">tasks</span>: <span class="syn-builtin">list</span>[<span class="syn-builtin">dict</span>]) -> <span class="syn-builtin">float</span>:',
      '    <span class="syn-comment">"""Computes normalized velocity across active sprint tracks."""</span>',
      '    <span class="syn-keyword">if not</span> tasks:',
      '        <span class="syn-keyword">return</span> <span class="syn-number">0.0</span>',
      '    ',
      '    completed = <span class="syn-builtin">sum</span>(t[<span class="syn-string">"weight"</span>] <span class="syn-keyword">for</span> t <span class="syn-keyword">in</span> tasks <span class="syn-keyword">if</span> t[<span class="syn-string">"status"</span>] == <span class="syn-string">"done"</span>)',
      '    total_weight = <span class="syn-builtin">sum</span>(t[<span class="syn-string">"weight"</span>] <span class="syn-keyword">for</span> t <span class="syn-keyword">in</span> tasks)',
      '    <span class="syn-keyword">return</span> <span class="syn-builtin">round</span>((completed / total_weight) * <span class="syn-number">100</span>, <span class="syn-number">2</span>)'
    ],
    tests: '✓ 3/3 Tests Passed',
    runtime: '0.14s',
    memory: '12.4 MB'
  },
  typescript: {
    lang: 'TypeScript',
    filename: 'neural_bridge.ts',
    lines: [
      '<span class="syn-keyword">interface</span> <span class="syn-def">NeuralSignal</span> {',
      '  <span class="syn-param">tensor</span>: Float32Array;',
      '  <span class="syn-param">confidence</span>: <span class="syn-builtin">number</span>;',
      '}',
      '',
      '<span class="syn-keyword">export function</span> <span class="syn-def">optimizeSignal</span>(<span class="syn-param">input</span>: <span class="syn-def">NeuralSignal</span>): Float32Array {',
      '  <span class="syn-keyword">const</span> { tensor, confidence } = input;',
      '  <span class="syn-keyword">return</span> tensor.map(val => val * Math.tanh(confidence));',
      '}'
    ],
    tests: '✓ 5/5 Tests Passed',
    runtime: '0.08s',
    memory: '18.1 MB'
  },
  rust: {
    lang: 'Rust',
    filename: 'safety_core.rs',
    lines: [
      '<span class="syn-keyword">pub fn</span> <span class="syn-def">verify_invariants</span>(<span class="syn-param">buffer</span>: &[<span class="syn-builtin">u8</span>]) -> <span class="syn-builtin">Result</span>&lt;<span class="syn-builtin">usize</span>, <span class="syn-def">SafetyFault</span>&gt; {',
      '    <span class="syn-keyword">let</span> checksum = buffer.iter().fold(<span class="syn-number">0u32</span>, |acc, &amp;b| acc.wrapping_add(b <span class="syn-keyword">as</span> <span class="syn-builtin">u32</span>));',
      '    <span class="syn-keyword">match</span> checksum % <span class="syn-number">2</span> == <span class="syn-number">0</span> {',
      '        <span class="syn-keyword">true</span> => <span class="syn-builtin">Ok</span>(buffer.len()),',
      '        <span class="syn-keyword">false</span> => <span class="syn-builtin">Err</span>(<span class="syn-def">SafetyFault</span>::ParityMismatch),',
      '    }',
      '}'
    ],
    tests: '✓ 4/4 Tests Passed',
    runtime: '0.002s',
    memory: '2.1 MB'
  }
};

export function initCodePlayground() {
  const tabBtns = document.querySelectorAll('.editor-tab-btn');
  const codeContent = document.getElementById('code-content-target');
  const lineNumbers = document.getElementById('line-numbers-target');
  const runBtn = document.getElementById('btn-run-tests');
  const testBadge = document.getElementById('test-badge-target');
  const runtimeStat = document.getElementById('runtime-stat-target');
  const memoryStat = document.getElementById('memory-stat-target');

  let currentLang = 'python';

  function renderSnippet(lang) {
    const data = SNIPPETS[lang];
    if (!data || !codeContent || !lineNumbers) return;

    currentLang = lang;

    // Render line numbers
    lineNumbers.innerHTML = data.lines
      .map((_, i) => `<div>${i + 1}</div>`)
      .join('');

    // Render code
    codeContent.innerHTML = data.lines.join('\n');

    // Update telemetry
    if (testBadge) testBadge.textContent = data.tests;
    if (runtimeStat) runtimeStat.textContent = `Runtime: ${data.runtime}`;
    if (memoryStat) memoryStat.textContent = `Memory: ${data.memory}`;
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const lang = btn.getAttribute('data-lang');
      renderSnippet(lang);
    });
  });

  if (runBtn) {
    runBtn.addEventListener('click', () => {
      runBtn.classList.add('running');
      runBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.3"></circle>
          <path d="M12 2a10 10 0 0 1 10 10"></path>
        </svg>
        Compiling & Testing...
      `;

      if (testBadge) {
        testBadge.textContent = '● Executing sandbox runner...';
        testBadge.style.color = 'var(--accent-cyan)';
      }

      setTimeout(() => {
        const data = SNIPPETS[currentLang];
        runBtn.classList.remove('running');
        runBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"></polygon>
          </svg>
          Run Suite
        `;
        if (testBadge) {
          testBadge.textContent = data.tests;
          testBadge.style.color = 'var(--accent-emerald)';
        }
        if (runtimeStat) runtimeStat.textContent = `Runtime: ${data.runtime}`;
      }, 700);
    });
  }

  // Initial render
  renderSnippet('python');
}
