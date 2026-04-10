import { FluxFile, FluxProject } from '@/types/flux';

const STORAGE_KEY = 'flux-ide-project';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function createDefaultProject(): FluxProject {
  const files: FluxFile[] = [
    {
      id: generateId(),
      name: 'hello.flux.md',
      path: '/hello.flux.md',
      content: `---
title: Hello World
version: 1.0
description: The classic first FLUX program
author: FLUX IDE
---

# Hello World

A minimal FLUX program that demonstrates the basic structure.

## fn: main() -> i32

\`\`\`c
int main() {
    // FLUX Hello World
    // This program returns 42 as a success code
    int result = 42;
    return result;
}
\`\`\`
`,
      isDirty: false,
    },
    {
      id: generateId(),
      name: 'fibonacci.flux.md',
      path: '/fibonacci.flux.md',
      content: `---
title: Fibonacci Sequence
version: 1.0
description: Compute Fibonacci numbers using iterative approach
---

# Fibonacci

This module demonstrates iterative Fibonacci computation.

## fn: fibonacci(n: i32) -> i32

\`\`\`c
int fibonacci(int n) {
    int a = 0, b = 1, temp, i;
    for (i = 0; i < n; i++) {
        temp = a + b;
        a = b;
        b = temp;
    }
    return a;
}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    int n = 10;
    int result = fibonacci(n);
    // fibonacci(10) = 55
    return result;
}
\`\`\`
`,
      isDirty: false,
    },
    {
      id: generateId(),
      name: 'agents.flux.md',
      path: '/agents.flux.md',
      content: `---
title: Agent Chat
version: 1.0
description: Multi-agent communication example
---

# Agent Chat System

Demonstrates the agent-to-agent communication primitives in FLUX.

## agent: producer

\`\`\`python
def run():
    """Producer agent generates data"""
    return {"message": "hello from producer", "data": [1, 2, 3]}
\`\`\`

## agent: consumer

\`\`\`python
def on_receive(msg):
    """Consumer agent processes incoming messages"""
    processed = msg.get("message", "").upper()
    return {"processed": processed, "items": len(msg.get("data", []))}
\`\`\`

## agent: monitor

\`\`\`python
def on_receive(status):
    """Monitor agent tracks system health"""
    return {"status": "healthy", "timestamp": "now"}
\`\`\`

## fn: main() -> i32

\`\`\`c
int main() {
    // SPAWN producer agent
    // SPAWN consumer agent
    // SPAWN monitor agent
    // TELL producer -> run
    // TELL consumer <- producer result
    // BARRIER - wait for completion
    return 0;
}
\`\`\`
`,
      isDirty: false,
    },
  ];

  return {
    id: generateId(),
    name: 'FLUX Project',
    files,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function saveProject(project: FluxProject): void {
  try {
    const data = JSON.stringify(project);
    localStorage.setItem(STORAGE_KEY, data);
  } catch (e) {
    console.error('Failed to save project:', e);
  }
}

export function loadProject(): FluxProject | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as FluxProject;
  } catch (e) {
    console.error('Failed to load project:', e);
    return null;
  }
}

export function createFile(name: string, content: string): FluxFile {
  return {
    id: generateId(),
    name,
    path: `/${name}`,
    content,
    isDirty: true,
  };
}

export function renameFile(file: FluxFile, newName: string): FluxFile {
  return {
    ...file,
    name: newName,
    path: `/${newName}`,
    isDirty: true,
  };
}

export function duplicateFile(file: FluxFile): FluxFile {
  const baseName = file.name.replace(/\.flux\.md$/, '');
  const newName = `${baseName}-copy.flux.md`;
  return {
    ...file,
    id: generateId(),
    name: newName,
    path: `/${newName}`,
    isDirty: true,
  };
}

export function exportProjectAsFiles(project: FluxProject): Map<string, string> {
  const files = new Map<string, string>();
  for (const file of project.files) {
    files.set(file.name, file.content);
  }
  return files;
}

export function importFluxFiles(fileContents: Map<string, string>): FluxFile[] {
  const files: FluxFile[] = [];
  for (const [name, content] of fileContents) {
    if (name.endsWith('.flux.md')) {
      files.push(createFile(name, content));
    }
  }
  return files;
}
