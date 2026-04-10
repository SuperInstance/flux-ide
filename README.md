# FLUX IDE

**Fluid Language Universal eXecution** — A web-based IDE for the FLUX programming language.

FLUX is a markdown-to-bytecode system with agent-native A2A primitives. Write `.flux.md` files using structured markdown, compile through SSA IR, and execute on a 64-register virtual machine.

## Features

- **Code Editor** — Monaco-based editor with markdown syntax highlighting
- **FLUX Compiler** — Browser-side parser, FIR IR generator, and bytecode encoder
- **VM Simulator** — 64-register virtual machine with real-time state display
- **Agent Visualization** — Visual map of A2A agent connections and methods
- **30+ Templates** — Pre-built programs for learning, software recreation, and novel tools
- **Project Management** — File explorer, multi-tab editing, local storage persistence
- **Import/Export** — Share `.flux.md` files between projects

## FLUX Language

FLUX uses structured markdown (`.flux.md`) as its source format:

```markdown
---
title: Hello World
version: 1.0
---

# Hello World

## fn: main() -> i32

```c
int main() {
    int result = 42;
    return result;
}
```
```

### Key Concepts

| Concept | Syntax | Description |
|---------|--------|-------------|
| Functions | `## fn: name(params) -> ret` | Typed function declarations |
| Agents | `## agent: name` | Agent-to-agent communication endpoints |
| Code Blocks | ` ```c`, ` ```python`, ` ```flux` | Polyglot native code |
| Tiles | `## tile: name` | Composable computation patterns |
| Regions | `## region: name` | Memory sandbox definitions |
| Imports | `## import: module` | Module system |
| A2A Ops | TELL, ASK, DELEGATE, BARRIER | Agent communication primitives |

### Templates Include

**Getting Started:** Hello World, Fibonacci, Variables & Types, Control Flow, Functions

**Software Recreation:** HTTP Server, File Manager, JSON Parser, CSV Processor, Text Editor, Calculator, Todo List CLI, Regex Engine, Basic Database, Sort Algorithms, Web Scraper, Chat Bot, Logger System, Config Manager

**Agent Systems:** Multi-Agent Pipeline, A2A Handshake, Trust Network, Barrier Sync, Broadcast/Reduce, Hot-Swap A/B Testing

**Novel Tools:** Agent Orchestra, Memory Sandbox, Tile Compositor, Capability Manager, Gas Meter

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save project |
| `Ctrl+Enter` | Run program |
| `Ctrl+Shift+B` | Compile only |

## Architecture

```
src/
  app/
    page.tsx          — Main IDE SPA
    layout.tsx        — Root layout
    globals.css       — VS Code dark theme
  components/
    ide/
      IDEComponents.tsx — All IDE UI components
  lib/
    flux-parser.ts    — FLUX.MD parser (frontmatter, headings, code blocks)
    flux-compiler.ts  — FIR IR generator and bytecode encoder
    vm-simulator.ts   — 64-register VM with instruction execution
    templates.ts      — 30+ built-in template programs
    project-store.ts  — Local storage project persistence
  types/
    flux.ts           — TypeScript type definitions
```

## Tech Stack

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **Monaco Editor** for code editing
- **Lucide React** for icons

## Related Repositories

| Repo | Language | Description |
|------|----------|-------------|
| [flux-py](https://github.com/SuperInstance/flux-py) | Python | Research runtime (1,848 tests) |
| [flux-rust](https://github.com/SuperInstance/flux-rust) | Rust | Production runtime (286 tests) |
| [flux-os](https://github.com/SuperInstance/flux-os) | C11 | OS kernel implementation |

## License

MIT
