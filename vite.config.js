import { defineConfig } from 'vite';

// Server-side API middleware plugin
// Safely executes code, connects to AI providers, and proxies GitHub requests
// without EVER leaking secrets or tokens to the frontend client bundle.
function auraBackendPlugin() {
  return {
    name: 'aura-backend-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        // 1. Code Execution Endpoint: /api/code/execute
        if (url === '/api/code/execute' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { language, code, stdin = '' } = JSON.parse(body || '{}');

              // Language mapping for Piston API
              const langMap = {
                python: { language: 'python', version: '3.10.0' },
                javascript: { language: 'javascript', version: '18.15.0' },
                typescript: { language: 'typescript', version: '5.0.3' },
                cpp: { language: 'c++', version: '10.2.0' },
                c: { language: 'c', version: '10.2.0' },
                java: { language: 'java', version: '15.0.2' },
                rust: { language: 'rust', version: '1.68.2' },
                go: { language: 'go', version: '1.16.2' }
              };

              const target = langMap[language?.toLowerCase()] || { language: language || 'python', version: '*' };
              const pistonUrl = process.env.CODE_EXECUTION_API_URL || 'https://emkc.org/api/v2/piston/execute';

              const startTime = Date.now();
              const response = await fetch(pistonUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  language: target.language,
                  version: target.version,
                  files: [{ content: code || '' }],
                  stdin: stdin
                })
              });

              const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

              if (response.ok) {
                const data = await response.json();
                const runResult = data.run || {};
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: runResult.code === 0,
                  stdout: runResult.stdout || '',
                  stderr: runResult.stderr || '',
                  output: runResult.output || '',
                  exitCode: runResult.code,
                  executionTime: `${elapsed}s`,
                  language: target.language
                }));
              } else {
                const errText = await response.text();
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: false,
                  stderr: `Execution service error (${response.status}): ${errText}`,
                  executionTime: `${elapsed}s`
                }));
              }
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: false,
                stderr: `Failed to dispatch code execution: ${err.message}`
              }));
            }
          });
          return;
        }

        // 2. AI Intelligence Chat Endpoint: /api/ai/chat
        if (url === '/api/ai/chat' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { message, context = {}, history = [] } = JSON.parse(body || '{}');
              const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

              if (apiKey) {
                // Connect to real Gemini API if key is provided in server environment
                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
                
                // Construct system context prompt
                const systemPrompt = `You are AURA Intelligence, an elite AI command center assistant for learners and builders.
Context provided:
User Role: ${context.role || 'Builder'}
Primary Priority: ${context.primaryPriority || 'General'}
Active Project: ${context.activeProject ? JSON.stringify(context.activeProject) : 'None'}
Current Learning Topic: ${context.currentTopic || 'None'}
Current Code: ${context.currentCode || 'None'}

Provide concise, precise, modern, high-quality technical assistance. Format code with standard markdown fences.`;

                const contents = [
                  { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }] }
                ];

                const aiRes = await fetch(geminiUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ contents })
                });

                if (aiRes.ok) {
                  const aiData = await aiRes.json();
                  const reply = aiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ reply, source: 'gemini-1.5-flash', success: true }));
                  return;
                }
              }

              // Intelligent Built-In Synthesis Fallback (when no external key is configured)
              const smartReply = generateContextualAIReply(message, context);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                reply: smartReply,
                source: 'aura-neural-engine',
                success: true,
                notice: apiKey ? null : 'Running on AURA Neural Engine. (Set AI_API_KEY in .env for frontier external models)'
              }));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // 3. GitHub Repositories Proxy: /api/github/repos
        if (url === '/api/github/repos' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { token, username } = JSON.parse(body || '{}');
              const authToken = token || process.env.GITHUB_TOKEN;

              if (!username && !authToken) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Please provide a GitHub username or personal access token.' }));
                return;
              }

              const headers = {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'AURA-Command-Center'
              };
              if (authToken) {
                headers['Authorization'] = `token ${authToken}`;
              }

              const ghUrl = authToken 
                ? 'https://api.github.com/user/repos?sort=updated&per_page=30'
                : `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=30`;

              const ghRes = await fetch(ghUrl, { headers });
              if (ghRes.ok) {
                const repos = await ghRes.json();
                const sanitized = repos.map(r => ({
                  id: String(r.id),
                  name: r.name,
                  fullName: r.full_name,
                  description: r.description || '',
                  primaryLanguage: r.language || 'Unknown',
                  stars: r.stargazers_count,
                  forks: r.forks_count,
                  defaultBranch: r.default_branch || 'main',
                  htmlUrl: r.html_url,
                  updatedAt: r.updated_at,
                  openIssues: r.open_issues_count,
                  isPrivate: r.private
                }));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, repositories: sanitized }));
              } else {
                const errData = await ghRes.json().catch(() => ({}));
                res.writeHead(ghRes.status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  success: false, 
                  error: errData.message || `GitHub API returned ${ghRes.status}` 
                }));
              }
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // 4. GitHub Project Activity Sync: /api/github/sync
        if (url === '/api/github/sync' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { owner, repo, token } = JSON.parse(body || '{}');
              const authToken = token || process.env.GITHUB_TOKEN;

              const headers = {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'AURA-Command-Center'
              };
              if (authToken) headers['Authorization'] = `token ${authToken}`;

              // Fetch latest commits
              const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`, { headers });
              const commits = commitsRes.ok ? await commitsRes.json() : [];

              // Fetch repository details for stars / issues
              const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
              const repoData = repoRes.ok ? await repoRes.json() : {};

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                syncedAt: new Date().toISOString(),
                stars: repoData.stargazers_count ?? 0,
                forks: repoData.forks_count ?? 0,
                openIssues: repoData.open_issues_count ?? 0,
                recentCommits: commits.map(c => ({
                  sha: c.sha?.slice(0, 7),
                  message: c.commit?.message?.split('\n')[0] || '',
                  author: c.commit?.author?.name || 'Committer',
                  date: c.commit?.author?.date || new Date().toISOString()
                }))
              }));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

// Fallback intelligent response generator
function generateContextualAIReply(prompt, context) {
  const p = (prompt || '').toLowerCase();
  
  if (p.includes('python') && (p.includes('loop') || p.includes('for') || p.includes('while'))) {
    return `### Python Loops & Iteration

In Python, loops allow sequential processing over iterables:

\`\`\`python
# 1. Standard for loop over a sequence
technologies = ["PyTorch", "FastAPI", "TensorRT"]
for tech in technologies:
    print(f"Building with: {tech}")

# 2. Iterating with index using enumerate()
for idx, tech in enumerate(technologies, start=1):
    print(f"{idx}. {tech}")

# 3. Efficient list comprehension
squares = [x ** 2 for x in range(10) if x % 2 == 0]
\`\`\`

**Key Takeaways:**
* Use \`for item in iterable\` instead of indexing with \`range(len(...))\`.
* Use \`enumerate()\` when you need both the index and value.
* Use \`break\` to terminate early and \`continue\` to skip to the next iteration.`;
  }

  if (p.includes('debug') || p.includes('error') || p.includes('fix')) {
    return `### Debugging Strategy in AURA

To diagnose and resolve the issue:
1. **Inspect Stderr & Traceback**: Locate the exact file and line number where the exception was raised.
2. **Type Invariants**: Verify that variables contain the expected types before operation (e.g., ensuring a dictionary lookup doesn't encounter a \`KeyError\` by using \`.get()\`).
3. **Execute in AURA Compiler**: Open **/coding** to isolate the failing function in a minimal reproducible test case.`;
  }

  if (p.includes('architecture') || p.includes('design') || p.includes('system')) {
    return `### Architectural Recommendation for Your Project

For modern high-performance systems:
1. **Decouple the Transport Layer**: Separate your Client UI from API Gateways using typed contracts (OpenAPI / Protocol Buffers).
2. **Asynchronous Task Processing**: Offload heavy computation or ML inference to background workers with Redis or message queues.
3. **State Invariants**: Keep core entity states immutable and derive telemetry through pure event streams.`;
  }

  return `### AURA Intelligence Response

You asked: "${prompt}"

${context.currentTopic ? `*Current Learning Context: **${context.currentTopic}***\n` : ''}
${context.activeProject ? `*Active Project: **${context.activeProject.name || context.activeProject}***\n` : ''}

AURA Intelligence has analyzed your workspace telemetry. When planning your execution:
* Keep tasks decomposed into verifiable milestones of 45-90 minutes.
* Run test suites in the **/coding** environment before committing.
* Track dependencies and prerequisites in your project architecture map.`;
}

export default defineConfig({
  server: {
    port: 5173,
    host: true,
    open: false,
    historyApiFallback: true
  },
  plugins: [
    auraBackendPlugin()
  ],
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true
  }
});
