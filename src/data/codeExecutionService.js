/**
 * AURA Code Execution Service
 * Connects frontend editor with the server-side code execution endpoint.
 * Supports Python, JavaScript, TypeScript, C++, C, Java, Rust, and Go.
 */

import { getCurrentUser } from './authService.js';
import { analyticsService } from './analyticsService.js';

const SNIPPETS_PREFIX = 'aura_user_snippets_v2_';

export const SUPPORTED_LANGUAGES = [
  { id: 'python', name: 'Python 3', ext: 'py', defaultCode: `# Python 3.10 Interactive Environment\ndef solve():\n    numbers = [1, 2, 3, 4, 5]\n    squares = [x ** 2 for x in numbers]\n    print("Calculated squares:", squares)\n\nsolve()\n` },
  { id: 'javascript', name: 'JavaScript (Node.js)', ext: 'js', defaultCode: `// Node.js Execution Environment\nfunction main() {\n  const message = "AURA Compiler Online";\n  console.log(message.toUpperCase());\n  console.log("Memory limit: 256MB");\n}\n\nmain();\n` },
  { id: 'typescript', name: 'TypeScript', ext: 'ts', defaultCode: `// TypeScript 5.0 Environment\ninterface Task {\n  id: number;\n  title: string;\n  status: string;\n}\n\nconst tasks: Task[] = [\n  { id: 1, title: "Optimize graph kernel", status: "Done" },\n  { id: 2, title: "Verify WebRTC stream", status: "Active" }\n];\n\nconsole.log(tasks.filter(t => t.status === "Active"));\n` },
  { id: 'cpp', name: 'C++ (GCC 10)', ext: 'cpp', defaultCode: `#include <iostream>\n#include <vector>\n#include <numeric>\n\nint main() {\n    std::vector<int> data = {10, 20, 30, 40, 50};\n    int sum = std::accumulate(data.begin(), data.end(), 0);\n    std::cout << "Sum of elements: " << sum << std::endl;\n    return 0;\n}\n` },
  { id: 'c', name: 'C (GCC 10)', ext: 'c', defaultCode: `#include <stdio.h>\n\nint main() {\n    printf("Hello from AURA C Environment!\\n");\n    int a = 14, b = 28;\n    printf("Result: %d\\n", a + b);\n    return 0;\n}\n` },
  { id: 'java', name: 'Java (OpenJDK 15)', ext: 'java', defaultCode: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Java Environment Initialized.");\n        for (int i = 1; i <= 3; i++) {\n            System.out.println("Iteration: " + i);\n        }\n    }\n}\n` },
  { id: 'rust', name: 'Rust (1.68)', ext: 'rs', defaultCode: `fn main() {\n    let items = vec!["Memory Safety", "Zero-Cost Abstractions", "Concurrency"];\n    println!("Rust Features in AURA:");\n    for item in items {\n        println!("• {}", item);\n    }\n}\n` },
  { id: 'go', name: 'Go (1.16)', ext: 'go', defaultCode: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Go Micro-Runtime Active in AURA")\n    sum := 0\n    for i := 1; i <= 5; i++ {\n        sum += i\n    }\n    fmt.Printf("Total: %d\\n", sum)\n}\n` }
];

class CodeExecutionService {
  getStorageKey(userId) {
    const id = userId || getCurrentUser()?.id || 'anonymous';
    return `${SNIPPETS_PREFIX}${id}`;
  }

  async executeCode({ language, code, stdin = '' }) {
    const user = getCurrentUser();
    const uId = user?.id || 'anonymous';

    try {
      const res = await fetch('/api/code/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code, stdin })
      });

      const data = await res.json();
      analyticsService.track(uId, 'CODE_EXECUTED', {
        language,
        success: data.success,
        executionTime: data.executionTime
      });

      return data;
    } catch (err) {
      return {
        success: false,
        stderr: `Network execution dispatch failed: ${err.message}`
      };
    }
  }

  getUserSnippets(userId) {
    try {
      const key = this.getStorageKey(userId);
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveSnippet(userId, { name, language, code }) {
    const uId = userId || getCurrentUser()?.id || 'anonymous';
    const snippets = this.getUserSnippets(uId);

    const snippet = {
      id: `snip_${Date.now()}`,
      name: name || `Snippet ${new Date().toLocaleTimeString()}`,
      language,
      code,
      updatedAt: new Date().toISOString()
    };

    const updated = [snippet, ...snippets.filter(s => s.name !== name)].slice(0, 30);
    const key = this.getStorageKey(uId);
    localStorage.setItem(key, JSON.stringify(updated));
    return snippet;
  }
}

export const codeExecutionService = new CodeExecutionService();
