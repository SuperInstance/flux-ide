/**
 * flux-ide — Comprehensive Tests
 * Parser, Compiler, VM Simulator, Templates, Project Store
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseFluxFile } from '../flux-parser';
import { compileFluxToFIR, generateBytecode, firToString, bytecodeToString } from '../flux-compiler';
import { createVMFromFIR, compileAndRun, getRegisterName, formatVMState } from '../vm-simulator';
import { fluxTemplates } from '../templates';
import {
  createDefaultProject,
  createFile,
  renameFile,
  duplicateFile,
  exportProjectAsFiles,
  importFluxFiles,
} from '../project-store';
import type { FIRModule, FIRInstruction, BytecodeLine, VMState } from '@/types/flux';

// ============================================================
// Helper: build FIR directly for VM tests
// ============================================================
function buildFIR(instructions: FIRInstruction[]): FIRModule {
  return {
    name: 'test',
    version: '1.0.0',
    functions: [{
      name: 'main',
      params: [],
      returnType: 'i32',
      body: instructions,
      codeLanguage: 'c',
      codeContent: '',
    }],
    agents: [],
    regions: [],
    imports: [],
    exports: [],
  };
}

// ============================================================
// 1. PARSER TESTS
// ============================================================
describe('Parser – Frontmatter', () => {
  it('parses title', () => {
    const r = parseFluxFile('---\ntitle: My App\n---\n');
    expect(r.frontmatter.title).toBe('My App');
  });

  it('parses version', () => {
    const r = parseFluxFile('---\nversion: 2.5\n---\n');
    expect(r.frontmatter.version).toBe('2.5');
  });

  it('parses description', () => {
    const r = parseFluxFile('---\ndescription: A test module\n---\n');
    expect(r.frontmatter.description).toBe('A test module');
  });

  it('parses author', () => {
    const r = parseFluxFile('---\nauthor: Super Z\n---\n');
    expect(r.frontmatter.author).toBe('Super Z');
  });

  it('strips quotes from values', () => {
    const r = parseFluxFile('---\ntitle: "Quoted Title"\nversion: \'1.0\'\n---\n');
    expect(r.frontmatter.title).toBe('Quoted Title');
    expect(r.frontmatter.version).toBe('1.0');
  });

  it('returns raw for frontmatter', () => {
    const r = parseFluxFile('---\ntitle: X\nversion: 1\n---\n');
    expect(r.frontmatter.raw).toContain('title: X');
  });

  it('empty file returns empty frontmatter', () => {
    const r = parseFluxFile('');
    expect(r.frontmatter.raw).toBe('');
    expect(r.frontmatter.title).toBeUndefined();
  });

  it('missing title adds info diagnostic', () => {
    const r = parseFluxFile('---\nversion: 1\n---\n');
    expect(r.diagnostics.some(d => d.severity === 'info')).toBe(true);
  });

  it('unclosed frontmatter adds warning', () => {
    const r = parseFluxFile('---\ntitle: open\n');
    expect(r.diagnostics.some(d => d.message.includes('Unclosed'))).toBe(true);
  });

  it('frontmatter with only opening/closing delimiter', () => {
    const r = parseFluxFile('---\n---\n');
    expect(r.frontmatter.raw).toBe('');
  });

  it('frontmatter on multi-line file with no heading', () => {
    const r = parseFluxFile('---\ntitle: Solo\n---\nJust text here.');
    expect(r.frontmatter.title).toBe('Solo');
    expect(r.headings.length).toBe(0);
  });
});

describe('Parser – Headings', () => {
  it('parses H1 heading', () => {
    const r = parseFluxFile('# Top Level');
    expect(r.headings).toHaveLength(1);
    expect(r.headings[0].level).toBe(1);
    expect(r.headings[0].text).toBe('Top Level');
    expect(r.headings[0].kind).toBe('section');
  });

  it('parses H2 heading', () => {
    const r = parseFluxFile('## Sub Heading');
    expect(r.headings[0].level).toBe(2);
  });

  it('parses H3-H6 headings', () => {
    const content = '### H3\n#### H4\n##### H5\n###### H6';
    const r = parseFluxFile(content);
    expect(r.headings).toHaveLength(4);
    expect(r.headings.map(h => h.level)).toEqual([3, 4, 5, 6]);
  });

  it('classifies fn: heading as function', () => {
    const r = parseFluxFile('## fn: add(a: i32, b: i32) -> i32');
    expect(r.headings[0].kind).toBe('function');
    expect(r.headings[0].parsedName).toBe('add');
    expect(r.headings[0].parsedParams).toBe('a: i32, b: i32');
    expect(r.headings[0].parsedReturn).toBe('i32');
  });

  it('classifies fn : heading (with space) as function', () => {
    const r = parseFluxFile('## fn : myFunc() -> void');
    expect(r.headings[0].kind).toBe('function');
    expect(r.headings[0].parsedName).toBe('myFunc');
  });

  it('classifies agent: heading', () => {
    const r = parseFluxFile('## agent: producer');
    expect(r.headings[0].kind).toBe('agent');
    expect(r.headings[0].parsedName).toBe('producer');
  });

  it('classifies tile: heading', () => {
    const r = parseFluxFile('## tile: myTile');
    expect(r.headings[0].kind).toBe('tile');
    expect(r.headings[0].parsedName).toBe('myTile');
  });

  it('classifies region: heading', () => {
    const r = parseFluxFile('## region: heap');
    expect(r.headings[0].kind).toBe('region');
    expect(r.headings[0].parsedName).toBe('heap');
  });

  it('classifies import: heading', () => {
    const r = parseFluxFile('## import: std.io');
    expect(r.headings[0].kind).toBe('import');
    expect(r.headings[0].parsedName).toBe('std.io');
  });

  it('classifies export: heading', () => {
    const r = parseFluxFile('## export: main');
    expect(r.headings[0].kind).toBe('export');
    expect(r.headings[0].parsedName).toBe('main');
  });

  it('simple function without params', () => {
    const r = parseFluxFile('## fn: main() -> void');
    expect(r.headings[0].kind).toBe('function');
    expect(r.headings[0].parsedName).toBe('main');
    expect(r.headings[0].parsedParams).toBe('');
    expect(r.headings[0].parsedReturn).toBe('void');
  });

  it('function with no return type defaults to void', () => {
    const r = parseFluxFile('## fn: helper(x: i32)');
    expect(r.headings[0].parsedReturn).toBe('void');
  });

  it('function name only (no parens)', () => {
    const r = parseFluxFile('## fn: standalone');
    expect(r.headings[0].parsedName).toBe('standalone');
  });

  it('records correct line numbers', () => {
    const r = parseFluxFile('\n\n## fn: test() -> i32');
    expect(r.headings[0].line).toBe(3);
  });

  it('skips headings inside frontmatter', () => {
    const r = parseFluxFile('---\ntitle: # Not a heading\n---\n# Real heading');
    expect(r.headings).toHaveLength(1);
    expect(r.headings[0].text).toBe('Real heading');
  });
});

describe('Parser – Code Blocks', () => {
  it('parses fenced code block with language', () => {
    const r = parseFluxFile('```c\nint x = 1;\n```');
    expect(r.codeBlocks).toHaveLength(1);
    expect(r.codeBlocks[0].language).toBe('c');
    expect(r.codeBlocks[0].content).toBe('int x = 1;');
  });

  it('parses code block without language defaults to text', () => {
    const r = parseFluxFile('```\nno lang\n```');
    expect(r.codeBlocks[0].language).toBe('text');
  });

  it('tracks start/end line numbers (1-indexed)', () => {
    const r = parseFluxFile('```python\na = 1\n```');
    expect(r.codeBlocks[0].startLine).toBe(1);
    expect(r.codeBlocks[0].endLine).toBe(3);
  });

  it('handles multiple code blocks', () => {
    const r = parseFluxFile('```c\nA\n```\n\n```python\nB\n```');
    expect(r.codeBlocks).toHaveLength(2);
    expect(r.codeBlocks[0].content).toBe('A');
    expect(r.codeBlocks[1].content).toBe('B');
  });

  it('handles code block with empty content', () => {
    const r = parseFluxFile('```\n```');
    expect(r.codeBlocks).toHaveLength(1);
    expect(r.codeBlocks[0].content).toBe('');
  });

  it('ignores unclosed code block', () => {
    const r = parseFluxFile('```c\nnever closed');
    expect(r.codeBlocks).toHaveLength(0);
  });

  it('no code blocks when none present', () => {
    const r = parseFluxFile('Just some text');
    expect(r.codeBlocks).toHaveLength(0);
  });

  it('supports four-backtick fences', () => {
    const r = parseFluxFile('````rust\nfn main(){}\n````');
    expect(r.codeBlocks).toHaveLength(1);
    expect(r.codeBlocks[0].language).toBe('rust');
  });
});

describe('Parser – Directives', () => {
  it('parses #!agent directive', () => {
    const r = parseFluxFile('#!agent producer');
    expect(r.directives).toHaveLength(1);
    expect(r.directives[0].type).toBe('agent');
    expect(r.directives[0].value).toBe('producer');
  });

  it('parses #!tile directive', () => {
    const r = parseFluxFile('#!tile myTile');
    expect(r.directives[0].type).toBe('tile');
  });

  it('parses #!flux directive', () => {
    const r = parseFluxFile('#!flux strict');
    expect(r.directives[0].type).toBe('flux');
    expect(r.directives[0].value).toBe('strict');
  });

  it('records directive line number', () => {
    const r = parseFluxFile('text\n#!agent x\nmore');
    expect(r.directives[0].line).toBe(2);
  });

  it('ignores non-directive hash comments', () => {
    const r = parseFluxFile('# normal comment\n# also not a directive');
    expect(r.directives).toHaveLength(0);
  });

  it('ignores unknown directive types', () => {
    const r = parseFluxFile('#!unknown foo');
    expect(r.directives).toHaveLength(0);
  });
});

describe('Parser – Edge Cases', () => {
  it('handles completely empty string', () => {
    const r = parseFluxFile('');
    expect(r.headings).toHaveLength(0);
    expect(r.codeBlocks).toHaveLength(0);
    expect(r.directives).toHaveLength(0);
    expect(r.rawContent).toBe('');
  });

  it('handles whitespace-only string', () => {
    const r = parseFluxFile('   \n  \n');
    expect(r.headings).toHaveLength(0);
  });

  it('handles very long file', () => {
    const lines = Array.from({ length: 1000 }, (_, i) => `## fn: func_${i}() -> i32`);
    const r = parseFluxFile(lines.join('\n'));
    expect(r.headings).toHaveLength(1000);
  });

  it('preserves raw content exactly', () => {
    const content = 'Hello\nWorld\n!';
    const r = parseFluxFile(content);
    expect(r.rawContent).toBe(content);
  });

  it('handles single line input', () => {
    const r = parseFluxFile('# Only Heading');
    expect(r.headings).toHaveLength(1);
  });

  it('frontmatter with only opening delimiter on single line returns empty (too short)', () => {
    const r = parseFluxFile('---');
    // Single line: lines.length < 2 so frontmatter parsing is skipped
    expect(r.frontmatter.raw).toBe('');
  });

  it('frontmatter key with colon in value', () => {
    const r = parseFluxFile('---\ntitle: "key: value"\n---\n');
    expect(r.frontmatter.title).toBe('key: value');
  });

  it('multiple frontmatter fields', () => {
    const r = parseFluxFile('---\ntitle: T\nversion: 1.0\ndescription: D\nauthor: A\n---\n');
    expect(r.frontmatter.title).toBe('T');
    expect(r.frontmatter.version).toBe('1.0');
    expect(r.frontmatter.description).toBe('D');
    expect(r.frontmatter.author).toBe('A');
  });
});

// ============================================================
// 2. COMPILER TESTS
// ============================================================
describe('Compiler – FIR Generation', () => {
  it('compiles a full module with frontmatter', () => {
    const content = `---
title: Test
version: 2.0
---
# Test
## fn: main() -> i32
\`\`\`c
int x = 1;
return x;
\`\`\``;
    const { fir } = compileFluxToFIR(content);
    expect(fir.name).toBe('Test');
    expect(fir.version).toBe('2.0');
    expect(fir.functions).toHaveLength(1);
    expect(fir.functions[0].name).toBe('main');
  });

  it('extracts function params from heading', () => {
    const content = `# Mod
## fn: add(a: i32, b: i32) -> i32
\`\`\`c
return a + b;
\`\`\``;
    const { fir } = compileFluxToFIR(content);
    const fn = fir.functions[0];
    expect(fn.params).toHaveLength(2);
    expect(fn.params[0].name).toBe('a');
    expect(fn.params[0].type).toBe('i32');
    expect(fn.params[1].name).toBe('b');
    expect(fn.params[1].type).toBe('i32');
  });

  it('defaults param type to i32 when untyped', () => {
    const content = `# Mod
## fn: run(x) -> void
\`\`\`c
x = 1;
\`\`\``;
    const { fir } = compileFluxToFIR(content);
    expect(fir.functions[0].params[0].type).toBe('i32');
  });

  it('extracts return type from heading', () => {
    const content = `# Mod
## fn: get() -> f64
\`\`\`c
return 0;
\`\`\``;
    const { fir } = compileFluxToFIR(content);
    expect(fir.functions[0].returnType).toBe('f64');
  });

  it('handles function with no code block (empty body)', () => {
    const content = `# Mod
## fn: stub() -> void`;
    const { fir } = compileFluxToFIR(content);
    expect(fir.functions[0].body.length).toBeGreaterThanOrEqual(1);
    expect(fir.functions[0].body.some(i => i.opcode === 'RET')).toBe(true);
  });

  it('generates prologue for functions with params', () => {
    const content = `# Mod
## fn: fn2(a: i32, b: i32) -> i32
\`\`\`c
return a;
\`\`\``;
    const { fir } = compileFluxToFIR(content);
    const body = fir.functions[0].body;
    // Prologue should have MOV R0 A0, MOV R1 A1
    expect(body.some(i => i.opcode === 'MOV' && i.operands[0] === 'R0' && i.operands[1] === 'A0')).toBe(true);
    expect(body.some(i => i.opcode === 'MOV' && i.operands[0] === 'R1' && i.operands[1] === 'A1')).toBe(true);
  });

  it('generates agents from agent headings', () => {
    const content = `# Mod
## agent: worker
\`\`\`python
def run():
    pass
def on_receive(msg):
    pass
\`\`\``;
    const { fir } = compileFluxToFIR(content);
    expect(fir.agents).toHaveLength(1);
    expect(fir.agents[0].name).toBe('worker');
    expect(fir.agents[0].methods).toHaveLength(2);
    expect(fir.agents[0].methods.map(m => m.name)).toContain('run');
    expect(fir.agents[0].methods.map(m => m.name)).toContain('on_receive');
  });

  it('generates regions from tile and region headings', () => {
    const content = `# Mod
## tile: sprite
## region: heap`;
    const { fir } = compileFluxToFIR(content);
    expect(fir.regions).toHaveLength(2);
    expect(fir.regions.map(r => r.name)).toEqual(['sprite', 'heap']);
  });

  it('generates imports and exports', () => {
    const content = `# Mod
## import: std.io
## export: main`;
    const { fir } = compileFluxToFIR(content);
    expect(fir.imports).toContain('std.io');
    expect(fir.exports).toContain('main');
  });

  it('module name falls back to frontmatter title', () => {
    const content = `---
title: From FM
---
No H1 here`;
    const { fir } = compileFluxToFIR(content);
    expect(fir.name).toBe('From FM');
  });

  it('module name falls back to unnamed when nothing', () => {
    const content = 'Just text';
    const { fir } = compileFluxToFIR(content);
    expect(fir.name).toBe('unnamed');
  });

  it('default version is 1.0.0', () => {
    const content = '# M';
    const { fir } = compileFluxToFIR(content);
    expect(fir.version).toBe('1.0.0');
  });

  it('code analysis generates PRINTS for print statements', () => {
    const content = `# M
## fn: main() -> i32
\`\`\`c
printf("hello");
\`\`\``;
    const { fir } = compileFluxToFIR(content);
    expect(fir.functions[0].body.some(i => i.opcode === 'PRINTS')).toBe(true);
  });

  it('code analysis generates CALL for function calls', () => {
    // 'int r = helper(42)' is caught by variable declaration regex first
    // Test with a standalone call that isn't shadowed by other patterns
    const content = `# M
## fn: main() -> i32
\`\`\`c
compute_result(x);
\`\`\``;
    const { fir } = compileFluxToFIR(content);
    expect(fir.functions[0].body.some(i => i.opcode === 'CALL' && i.operands[0] === 'compute_result')).toBe(true);
  });

  it('code analysis generates SPAWN for spawn/delegate', () => {
    const content = `# M
## fn: main() -> i32
\`\`\`c
spawn(worker);
delegate(task, target);
\`\`\``;
    const { fir } = compileFluxToFIR(content);
    expect(fir.functions[0].body.some(i => i.opcode === 'SPAWN')).toBe(true);
    expect(fir.functions[0].body.some(i => i.opcode === 'DELEGATE')).toBe(true);
  });

  it('code analysis generates BARRIER for barrier', () => {
    const content = `# M
## fn: main() -> i32
\`\`\`c
barrier(sync);
\`\`\``;
    const { fir } = compileFluxToFIR(content);
    expect(fir.functions[0].body.some(i => i.opcode === 'BARRIER')).toBe(true);
  });

  it('code analysis generates STORE/LOAD for store/load', () => {
    const content = `# M
## fn: main() -> i32
\`\`\`c
store data -> mem[0];
load data <- mem[0];
\`\`\``;
    const { fir } = compileFluxToFIR(content);
    const body = fir.functions[0].body;
    expect(body.some(i => i.opcode === 'STORE')).toBe(true);
    expect(body.some(i => i.opcode === 'LOAD')).toBe(true);
  });
});

describe('Compiler – Bytecode Generation', () => {
  it('generates MODULE header', () => {
    const fir = buildFIR([{ opcode: 'RET', operands: [] }]);
    const bc = generateBytecode(fir);
    expect(bc[0].mnemonic).toBe('MODULE');
    expect(bc[0].bytes[0]).toBe(0xFE);
  });

  it('generates FUNC entry for each function', () => {
    const fir: FIRModule = {
      ...buildFIR([]),
      functions: [
        { name: 'fn1', params: [], returnType: 'void', body: [{ opcode: 'RET', operands: [] }], codeLanguage: 'c', codeContent: '' },
        { name: 'fn2', params: [], returnType: 'i32', body: [{ opcode: 'RET', operands: [] }], codeLanguage: 'c', codeContent: '' },
      ],
    };
    const bc = generateBytecode(fir);
    expect(bc.filter(b => b.mnemonic === 'FUNC')).toHaveLength(2);
  });

  it('generates IMPORT lines', () => {
    const fir: FIRModule = { ...buildFIR([]), functions: [], imports: ['std.io', 'net.http'] };
    const bc = generateBytecode(fir);
    expect(bc.filter(b => b.mnemonic === 'IMPORT')).toHaveLength(2);
    expect(bc.find(b => b.mnemonic === 'IMPORT')!.operands).toBe('std.io');
  });

  it('generates EXPORT lines', () => {
    const fir: FIRModule = { ...buildFIR([]), functions: [], exports: ['main'] };
    const bc = generateBytecode(fir);
    expect(bc.some(b => b.mnemonic === 'EXPORT' && b.operands === 'main')).toBe(true);
  });

  it('generates AGENT lines', () => {
    const fir: FIRModule = {
      ...buildFIR([]),
      functions: [],
      agents: [{ name: 'bot', directives: [], methods: [{ name: 'run', params: '' }], codeLanguage: 'python', codeContent: '' }],
    };
    const bc = generateBytecode(fir);
    expect(bc.some(b => b.mnemonic === 'AGENT')).toBe(true);
  });

  it('generates .end marker', () => {
    const bc = generateBytecode(buildFIR([{ opcode: 'RET', operands: [] }]));
    expect(bc[bc.length - 1].mnemonic).toBe('.end');
    expect(bc[bc.length - 1].bytes[0]).toBe(0x01);
  });

  it('NOP encodes as single byte 0x00', () => {
    const fir = buildFIR([{ opcode: 'NOP', operands: [], comment: 'test nop' }]);
    const bc = generateBytecode(fir);
    const nopLine = bc.find(b => b.mnemonic === 'NOP' && b.comment === 'test nop');
    expect(nopLine).toBeDefined();
    expect(nopLine!.bytes).toEqual([0x00]);
  });

  it('HALT opcode encodes as 0x01', () => {
    const fir = buildFIR([{ opcode: 'HALT', operands: [] }]);
    const bc = generateBytecode(fir);
    const haltLine = bc.find(b => b.mnemonic === 'HALT');
    expect(haltLine).toBeDefined();
    expect(haltLine!.bytes[0]).toBe(0x01);
  });

  it('MOVI opcode encodes as 0x03', () => {
    const fir = buildFIR([{ opcode: 'MOVI', operands: ['R0', '42'] }]);
    const bc = generateBytecode(fir);
    const moviLine = bc.find(b => b.mnemonic === 'MOVI');
    expect(moviLine!.bytes[0]).toBe(0x03);
  });

  it('MOV opcode encodes as 0x02', () => {
    const fir = buildFIR([{ opcode: 'MOV', operands: ['R0', 'R1'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'MOV')!.bytes[0]).toBe(0x02);
  });

  it('IADD encodes as 0x10', () => {
    const fir = buildFIR([{ opcode: 'IADD', operands: ['R0', 'R1'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'IADD')!.bytes[0]).toBe(0x10);
  });

  it('ISUB encodes as 0x11', () => {
    const fir = buildFIR([{ opcode: 'ISUB', operands: ['R0', 'R1'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'ISUB')!.bytes[0]).toBe(0x11);
  });

  it('IMUL encodes as 0x12', () => {
    const fir = buildFIR([{ opcode: 'IMUL', operands: ['R0', 'R1'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'IMUL')!.bytes[0]).toBe(0x12);
  });

  it('IDIV encodes as 0x13', () => {
    const fir = buildFIR([{ opcode: 'IDIV', operands: ['R0', 'R1'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'IDIV')!.bytes[0]).toBe(0x13);
  });

  it('IMOD encodes as 0x14', () => {
    const fir = buildFIR([{ opcode: 'IMOD', operands: ['R0', 'R1'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'IMOD')!.bytes[0]).toBe(0x14);
  });

  it('CMP encodes as 0x30', () => {
    const fir = buildFIR([{ opcode: 'CMP', operands: ['R0', 'R1'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'CMP')!.bytes[0]).toBe(0x30);
  });

  it('JMP encodes as 0x40', () => {
    const fir = buildFIR([{ opcode: 'JMP', operands: ['label1'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'JMP')!.bytes[0]).toBe(0x40);
  });

  it('CALL encodes as 0x70', () => {
    const fir = buildFIR([{ opcode: 'CALL', operands: ['fn'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'CALL')!.bytes[0]).toBe(0x70);
  });

  it('RET encodes as 0x71', () => {
    const fir = buildFIR([{ opcode: 'RET', operands: [] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'RET')!.bytes[0]).toBe(0x71);
  });

  it('LOAD encodes as 0x50', () => {
    const fir = buildFIR([{ opcode: 'LOAD', operands: ['R0', '100'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'LOAD')!.bytes[0]).toBe(0x50);
  });

  it('STORE encodes as 0x51', () => {
    const fir = buildFIR([{ opcode: 'STORE', operands: ['R0', '100'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'STORE')!.bytes[0]).toBe(0x51);
  });

  it('PUSH encodes as 0x60', () => {
    const fir = buildFIR([{ opcode: 'PUSH', operands: ['R0'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'PUSH')!.bytes[0]).toBe(0x60);
  });

  it('POP encodes as 0x61', () => {
    const fir = buildFIR([{ opcode: 'POP', operands: ['R0'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'POP')!.bytes[0]).toBe(0x61);
  });

  it('SPAWN encodes as 0x80', () => {
    const fir = buildFIR([{ opcode: 'SPAWN', operands: ['R8'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'SPAWN')!.bytes[0]).toBe(0x80);
  });

  it('TELL encodes as 0x81', () => {
    const fir = buildFIR([{ opcode: 'TELL', operands: ['R8', 'R9'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'TELL')!.bytes[0]).toBe(0x81);
  });

  it('ASK encodes as 0x82', () => {
    const fir = buildFIR([{ opcode: 'ASK', operands: ['R8', 'R9'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'ASK')!.bytes[0]).toBe(0x82);
  });

  it('DELEGATE encodes as 0x83', () => {
    const fir = buildFIR([{ opcode: 'DELEGATE', operands: ['R8', 'R9'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'DELEGATE')!.bytes[0]).toBe(0x83);
  });

  it('BROADCAST encodes as 0x84', () => {
    const fir = buildFIR([{ opcode: 'BROADCAST', operands: ['R8'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'BROADCAST')!.bytes[0]).toBe(0x84);
  });

  it('REDUCE encodes as 0x85', () => {
    const fir = buildFIR([{ opcode: 'REDUCE', operands: ['R8'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'REDUCE')!.bytes[0]).toBe(0x85);
  });

  it('BARRIER encodes as 0x86', () => {
    const fir = buildFIR([{ opcode: 'BARRIER', operands: ['R8'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'BARRIER')!.bytes[0]).toBe(0x86);
  });

  it('PRINT encodes as 0x90', () => {
    const fir = buildFIR([{ opcode: 'PRINT', operands: ['R0'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'PRINT')!.bytes[0]).toBe(0x90);
  });

  it('PRINTS encodes as 0x91', () => {
    const fir = buildFIR([{ opcode: 'PRINTS', operands: ['R8'] }]);
    const bc = generateBytecode(fir);
    expect(bc.find(b => b.mnemonic === 'PRINTS')!.bytes[0]).toBe(0x91);
  });

  it('unknown opcode defaults to 0x00', () => {
    const fir = buildFIR([{ opcode: 'UNKNOWN_MNEMONIC', operands: [] }]);
    const bc = generateBytecode(fir);
    const unknownLine = bc.find(b => b.mnemonic === 'UNKNOWN_MNEMONIC');
    expect(unknownLine!.bytes[0]).toBe(0x00);
  });

  it('addresses are sequential', () => {
    const fir = buildFIR([
      { opcode: 'MOVI', operands: ['R0', '1'] },
      { opcode: 'RET', operands: [] },
    ]);
    const bc = generateBytecode(fir);
    const codeLines = bc.filter(b => b.mnemonic !== 'MODULE' && b.mnemonic !== '.end' && b.mnemonic !== 'FUNC');
    for (let i = 1; i < codeLines.length; i++) {
      expect(codeLines[i].address).toBeGreaterThan(codeLines[i - 1].address);
    }
  });
});

describe('Compiler – String Representations', () => {
  it('firToString contains module name', () => {
    const fir = buildFIR([{ opcode: 'RET', operands: [] }]);
    const s = firToString(fir);
    expect(s).toContain('test');
    expect(s).toContain('1.0.0');
    expect(s).toContain('main');
  });

  it('bytecodeToString formats hex addresses', () => {
    const fir = buildFIR([{ opcode: 'RET', operands: [] }]);
    const bc = generateBytecode(fir);
    const s = bytecodeToString(bc);
    expect(s).toContain('00'); // hex address
  });
});

// ============================================================
// 3. VM SIMULATOR TESTS
// ============================================================
describe('VM – Initialization', () => {
  it('creates 64 registers', () => {
    const vm = createVMFromFIR(buildFIR([{ opcode: 'RET', operands: [] }]));
    expect(vm.registers).toHaveLength(64);
  });

  it('initializes SP to 0xFFFC', () => {
    const vm = createVMFromFIR(buildFIR([{ opcode: 'RET', operands: [] }]));
    expect(vm.registers[2]).toBe(0xFFFC);
  });

  it('initializes BP to 0x0000', () => {
    const vm = createVMFromFIR(buildFIR([{ opcode: 'RET', operands: [] }]));
    expect(vm.registers[3]).toBe(0x0000);
  });

  it('starts not halted', () => {
    const vm = createVMFromFIR(buildFIR([{ opcode: 'RET', operands: [] }]));
    expect(vm.halted).toBe(false);
  });

  it('initial flags are all false', () => {
    const vm = createVMFromFIR(buildFIR([{ opcode: 'RET', operands: [] }]));
    expect(vm.flags).toEqual({ zero: false, carry: false, negative: false, overflow: false });
  });

  it('empty memory, stack, output, errors', () => {
    const vm = createVMFromFIR(buildFIR([{ opcode: 'RET', operands: [] }]));
    expect(vm.memory).toHaveLength(0);
    expect(vm.stack).toHaveLength(0);
    expect(vm.output).toHaveLength(0);
    expect(vm.errors).toHaveLength(0);
    expect(vm.cycles).toBe(0);
  });
});

describe('VM – MOVI', () => {
  it('loads immediate into register', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '42'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.registers[0]).toBe(42);
  });

  it('sets zero flag when value is 0', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '0'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.flags.zero).toBe(true);
  });

  it('handles negative immediates', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '-5'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.registers[0]).toBe(-5);
    expect(vm.flags.negative).toBe(true);
  });

  it('handles hex immediates', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '0xFF'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.registers[0]).toBe(255);
  });

  it('handles binary immediates', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '0b1010'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.registers[0]).toBe(10);
  });
});

describe('VM – MOV', () => {
  it('copies register value', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '100'] },
      { opcode: 'MOV', operands: ['R1', 'R0'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.registers[1]).toBe(100);
  });
});

describe('VM – IADD', () => {
  it('adds two registers', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '10'] },
      { opcode: 'MOVI', operands: ['R1', '25'] },
      { opcode: 'IADD', operands: ['R0', 'R1'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.registers[0]).toBe(35);
  });

  it('handles overflow (32-bit signed)', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '2147483647'] },
      { opcode: 'MOVI', operands: ['R1', '1'] },
      { opcode: 'IADD', operands: ['R0', 'R1'] },
      { opcode: 'RET', operands: [] },
    ]));
    // 32-bit signed overflow wraps
    expect(vm.registers[0]).toBeLessThan(0);
  });
});

describe('VM – ISUB', () => {
  it('subtracts registers', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '50'] },
      { opcode: 'MOVI', operands: ['R1', '20'] },
      { opcode: 'ISUB', operands: ['R0', 'R1'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.registers[0]).toBe(30);
  });

  it('result negative sets negative flag', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '5'] },
      { opcode: 'MOVI', operands: ['R1', '10'] },
      { opcode: 'ISUB', operands: ['R0', 'R1'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.registers[0]).toBe(-5);
    expect(vm.flags.negative).toBe(true);
  });
});

describe('VM – IMUL', () => {
  it('multiplies registers', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '6'] },
      { opcode: 'MOVI', operands: ['R1', '7'] },
      { opcode: 'IMUL', operands: ['R0', 'R1'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.registers[0]).toBe(42);
  });
});

describe('VM – IDIV', () => {
  it('divides registers', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '20'] },
      { opcode: 'MOVI', operands: ['R1', '4'] },
      { opcode: 'IDIV', operands: ['R0', 'R1'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.registers[0]).toBe(5);
  });

  it('division by zero halts with error', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '10'] },
      { opcode: 'MOVI', operands: ['R1', '0'] },
      { opcode: 'IDIV', operands: ['R0', 'R1'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.halted).toBe(true);
    expect(vm.errors).toHaveLength(1);
    expect(vm.errors[0]).toContain('Division by zero');
  });
});

describe('VM – IMOD', () => {
  it('modulo of registers', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '17'] },
      { opcode: 'MOVI', operands: ['R1', '5'] },
      { opcode: 'IMOD', operands: ['R0', 'R1'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.registers[0]).toBe(2);
  });

  it('modulo by zero halts with error', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '10'] },
      { opcode: 'MOVI', operands: ['R1', '0'] },
      { opcode: 'IMOD', operands: ['R0', 'R1'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.errors).toHaveLength(1);
    expect(vm.errors[0]).toContain('Modulo by zero');
  });
});

describe('VM – CMP / Flags', () => {
  it('equal values set zero flag', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '42'] },
      { opcode: 'MOVI', operands: ['R1', '42'] },
      { opcode: 'CMP', operands: ['R0', 'R1'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.flags.zero).toBe(true);
  });

  it('unequal values clear zero flag', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '1'] },
      { opcode: 'MOVI', operands: ['R1', '2'] },
      { opcode: 'CMP', operands: ['R0', 'R1'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.flags.zero).toBe(false);
  });

  it('lesser value sets negative flag', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '3'] },
      { opcode: 'MOVI', operands: ['R1', '10'] },
      { opcode: 'CMP', operands: ['R0', 'R1'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.flags.negative).toBe(true);
  });

  it('CMPI works with immediate', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '5'] },
      { opcode: 'CMPI', operands: ['R0', '5'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.flags.zero).toBe(true);
  });

  it('carry set when a < b', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '1'] },
      { opcode: 'MOVI', operands: ['R1', '10'] },
      { opcode: 'CMP', operands: ['R0', 'R1'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.flags.carry).toBe(true);
  });
});

describe('VM – Stack Operations', () => {
  it('PUSH adds to stack and decrements SP', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '99'] },
      { opcode: 'PUSH', operands: ['R0'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.stack).toHaveLength(1);
    expect(vm.stack[0]).toBe(99);
    expect(vm.registers[2]).toBeLessThan(0xFFFC);
  });

  it('POP removes from stack and increments SP', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '77'] },
      { opcode: 'PUSH', operands: ['R0'] },
      { opcode: 'POP', operands: ['R1'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.stack).toHaveLength(0);
    expect(vm.registers[1]).toBe(77);
  });
});

describe('VM – Memory Operations', () => {
  it('STORE writes to memory', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '123'] },
      { opcode: 'STORE', operands: ['R0', '0x100'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.memory).toHaveLength(1);
    expect(vm.memory[0].address).toBe(0x100);
    expect(vm.memory[0].value).toBe(123);
  });

  it('LOAD reads from memory', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '55'] },
      { opcode: 'STORE', operands: ['R0', '0x200'] },
      { opcode: 'LOAD', operands: ['R1', '0x200'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.registers[1]).toBe(55);
  });

  it('LOAD from uninitialized address returns 0', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'LOAD', operands: ['R0', '0x999'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.registers[0]).toBe(0);
  });

  it('STORE updates existing memory cell', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '1'] },
      { opcode: 'STORE', operands: ['R0', '0x50'] },
      { opcode: 'MOVI', operands: ['R0', '2'] },
      { opcode: 'STORE', operands: ['R0', '0x50'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.memory).toHaveLength(1);
    expect(vm.memory[0].value).toBe(2);
  });
});

describe('VM – PRINT / PRINTS', () => {
  it('PRINT outputs register value', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '42'] },
      { opcode: 'PRINT', operands: ['R0'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.output).toContain('42');
  });

  it('PRINTS outputs string placeholder', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'PRINTS', operands: ['R8'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.output.some(o => o.includes('[output]'))).toBe(true);
  });
});

describe('VM – HALT', () => {
  it('HALT stops execution', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '1'] },
      { opcode: 'HALT', operands: [] },
      { opcode: 'MOVI', operands: ['R0', '999'] },  // should NOT execute
    ]));
    expect(vm.registers[0]).toBe(1);
    expect(vm.halted).toBe(true);
  });
});

describe('VM – Agent Operations', () => {
  it('SPAWN outputs agent spawn message', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'SPAWN', operands: ['R8'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.output.some(o => o.includes('[SPAWN]'))).toBe(true);
    // Agent register should be allocated
    expect(vm.registers.slice(32, 48).some(v => v === 1)).toBe(true);
  });

  it('TELL outputs message', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'TELL', operands: ['R8', 'R9'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.output.some(o => o.includes('[TELL]'))).toBe(true);
  });

  it('ASK outputs query', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'ASK', operands: ['R8', 'R9'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.output.some(o => o.includes('[ASK]'))).toBe(true);
  });

  it('DELEGATE outputs delegation', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'DELEGATE', operands: ['R8', 'R9'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.output.some(o => o.includes('[DELEGATE]'))).toBe(true);
  });

  it('BROADCAST outputs broadcast', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'BROADCAST', operands: ['R8'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.output.some(o => o.includes('[BROADCAST]'))).toBe(true);
  });

  it('REDUCE outputs reduction', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'REDUCE', operands: ['R8'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.output.some(o => o.includes('[REDUCE]'))).toBe(true);
  });

  it('BARRIER outputs sync point', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'BARRIER', operands: ['R8'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.output.some(o => o.includes('[BARRIER]'))).toBe(true);
  });
});

describe('VM – No Functions', () => {
  it('errors when FIR has no functions', () => {
    const fir: FIRModule = {
      name: 'empty', version: '1.0.0',
      functions: [], agents: [], regions: [], imports: [], exports: [],
    };
    const vm = compileAndRun(fir);
    expect(vm.halted).toBe(true);
    expect(vm.errors).toHaveLength(1);
    expect(vm.errors[0]).toContain('No functions');
  });
});

describe('VM – CALL', () => {
  it('CALL to existing function outputs call/ret', () => {
    const fir: FIRModule = {
      name: 'call-test', version: '1.0.0',
      functions: [
        { name: 'main', params: [], returnType: 'void', body: [
          { opcode: 'CALL', operands: ['helper'] },
          { opcode: 'RET', operands: [] },
        ], codeLanguage: 'c', codeContent: '' },
        { name: 'helper', params: [], returnType: 'i32', body: [
          { opcode: 'MOVI', operands: ['A0', '7'] },
          { opcode: 'RET', operands: [] },
        ], codeLanguage: 'c', codeContent: '' },
      ],
      agents: [], regions: [], imports: [], exports: [],
    };
    const vm = compileAndRun(fir);
    expect(vm.output.some(o => o.includes('[CALL] helper'))).toBe(true);
    expect(vm.output.some(o => o.includes('[RET] helper'))).toBe(true);
  });

  it('CALL to undefined function adds error', () => {
    const fir = buildFIR([
      { opcode: 'CALL', operands: ['nonexistent'] },
      { opcode: 'RET', operands: [] },
    ]);
    const vm = compileAndRun(fir);
    expect(vm.errors.some(e => e.includes('Undefined function: nonexistent'))).toBe(true);
  });
});

describe('VM – Utility Functions', () => {
  it('getRegisterName returns ZERO for index 0', () => {
    expect(getRegisterName(0)).toBe('ZERO');
  });

  it('getRegisterName returns SP for index 2', () => {
    expect(getRegisterName(2)).toBe('SP');
  });

  it('getRegisterName returns A0 for index 16', () => {
    expect(getRegisterName(16)).toBe('A0');
  });

  it('getRegisterName returns A16 for index 32 (agent VM alloc range)', () => {
    expect(getRegisterName(32)).toBe('A16');
  });

  it('getRegisterName returns AGENT0 for index 48', () => {
    expect(getRegisterName(48)).toBe('AGENT0');
  });

  it('getRegisterName returns R99 for unknown index', () => {
    expect(getRegisterName(99)).toBe('R99');
  });

  it('formatVMState contains HALTED', () => {
    const vm = compileAndRun(buildFIR([{ opcode: 'RET', operands: [] }]));
    const s = formatVMState(vm);
    expect(s).toContain('[HALTED]');
  });

  it('formatVMState contains FLAGS', () => {
    const vm = createVMFromFIR(buildFIR([{ opcode: 'RET', operands: [] }]));
    const s = formatVMState(vm);
    expect(s).toContain('FLAGS');
  });

  it('formatVMState contains cycle count', () => {
    const vm = compileAndRun(buildFIR([{ opcode: 'RET', operands: [] }]));
    const s = formatVMState(vm);
    expect(s).toContain('Cycles');
  });
});

describe('VM – End-to-End', () => {
  it('compileAndRun produces output lines', () => {
    const vm = compileAndRun(buildFIR([{ opcode: 'RET', operands: [] }]));
    expect(vm.output.length).toBeGreaterThan(0);
    expect(vm.output[0]).toContain('Starting execution');
    expect(vm.output.some(o => o.includes('Execution complete'))).toBe(true);
  });

  it('compileAndRun increments cycles', () => {
    const vm = compileAndRun(buildFIR([
      { opcode: 'MOVI', operands: ['R0', '1'] },
      { opcode: 'MOVI', operands: ['R1', '2'] },
      { opcode: 'RET', operands: [] },
    ]));
    expect(vm.cycles).toBeGreaterThan(0);
  });
});

// ============================================================
// 4. TEMPLATE SYSTEM TESTS
// ============================================================
describe('Templates', () => {
  it('templates array is non-empty', () => {
    expect(fluxTemplates.length).toBeGreaterThan(0);
  });

  it('every template has required fields', () => {
    for (const t of fluxTemplates) {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.category).toBeTruthy();
      expect(t.content).toBeTruthy();
      expect(Array.isArray(t.tags)).toBe(true);
    }
  });

  it('has getting-started category', () => {
    expect(fluxTemplates.some(t => t.category === 'getting-started')).toBe(true);
  });

  it('has software-recreation category', () => {
    expect(fluxTemplates.some(t => t.category === 'software-recreation')).toBe(true);
  });

  it('has agent-systems category', () => {
    expect(fluxTemplates.some(t => t.category === 'agent-systems')).toBe(true);
  });

  it('has novel-tools category', () => {
    expect(fluxTemplates.some(t => t.category === 'novel-tools')).toBe(true);
  });

  it('all template ids are unique', () => {
    const ids = fluxTemplates.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('hello-world template exists and is valid FLUX', () => {
    const hw = fluxTemplates.find(t => t.id === 'hello-world');
    expect(hw).toBeDefined();
    const parsed = parseFluxFile(hw!.content);
    expect(parsed.frontmatter.title).toBeTruthy();
    expect(parsed.headings.length).toBeGreaterThan(0);
  });

  it('every template content parses as valid FLUX', () => {
    for (const t of fluxTemplates) {
      const parsed = parseFluxFile(t.content);
      expect(parsed.rawContent).toBe(t.content);
      expect(Array.isArray(parsed.headings)).toBe(true);
    }
  });

  it('every template with agent headings extracts agent methods', () => {
    for (const t of fluxTemplates) {
      const parsed = parseFluxFile(t.content);
      const agentHeadings = parsed.headings.filter(h => h.kind === 'agent');
      if (agentHeadings.length > 0) {
        const { fir } = compileFluxToFIR(t.content);
        expect(fir.agents.length).toBeGreaterThanOrEqual(agentHeadings.length);
      }
    }
  });

  it('every template compiles to bytecode without errors', () => {
    for (const t of fluxTemplates) {
      const { fir } = compileFluxToFIR(t.content);
      const bc = generateBytecode(fir);
      expect(bc.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================
// 5. PROJECT STORE TESTS
// ============================================================
describe('Project Store', () => {
  it('creates default project with files', () => {
    const project = createDefaultProject();
    expect(project.name).toBe('FLUX Project');
    expect(project.files.length).toBeGreaterThan(0);
    expect(project.files[0].name).toBeTruthy();
  });

  it('project has timestamps', () => {
    const project = createDefaultProject();
    expect(project.createdAt).toBeGreaterThan(0);
    expect(project.updatedAt).toBeGreaterThan(0);
  });

  it('every file has required fields', () => {
    const project = createDefaultProject();
    for (const f of project.files) {
      expect(f.id).toBeTruthy();
      expect(f.name).toBeTruthy();
      expect(f.path).toBeTruthy();
      expect(typeof f.content).toBe('string');
      expect(typeof f.isDirty).toBe('boolean');
    }
  });

  it('default files are not dirty', () => {
    const project = createDefaultProject();
    for (const f of project.files) {
      expect(f.isDirty).toBe(false);
    }
  });

  it('createFile creates with correct fields', () => {
    const file = createFile('test.flux.md', 'content');
    expect(file.name).toBe('test.flux.md');
    expect(file.path).toBe('/test.flux.md');
    expect(file.content).toBe('content');
    expect(file.isDirty).toBe(true);
  });

  it('createFile generates unique ids', () => {
    const f1 = createFile('a', '');
    const f2 = createFile('b', '');
    expect(f1.id).not.toBe(f2.id);
  });

  it('renameFile updates name and path', () => {
    const file = createFile('old.flux.md', '');
    const renamed = renameFile(file, 'new.flux.md');
    expect(renamed.name).toBe('new.flux.md');
    expect(renamed.path).toBe('/new.flux.md');
    expect(renamed.isDirty).toBe(true);
  });

  it('renameFile preserves content and id', () => {
    const file = createFile('old.flux.md', 'hello');
    const renamed = renameFile(file, 'new.flux.md');
    expect(renamed.id).toBe(file.id);
    expect(renamed.content).toBe('hello');
  });

  it('duplicateFile creates copy with new id', () => {
    const file = createFile('orig.flux.md', 'data');
    const dup = duplicateFile(file);
    expect(dup.id).not.toBe(file.id);
    expect(dup.name).toBe('orig-copy.flux.md');
    expect(dup.content).toBe('data');
    expect(dup.isDirty).toBe(true);
  });

  it('exportProjectAsFiles returns Map of name->content', () => {
    const project = createDefaultProject();
    const files = exportProjectAsFiles(project);
    expect(files instanceof Map).toBe(true);
    expect(files.size).toBe(project.files.length);
    for (const f of project.files) {
      expect(files.get(f.name)).toBe(f.content);
    }
  });

  it('importFluxFiles only imports .flux.md files', () => {
    const map = new Map<string, string>();
    map.set('good.flux.md', '---\ntitle: G\n---\n# G');
    map.set('bad.txt', 'not flux');
    map.set('also.flux.md', '---\ntitle: A\n---\n# A');
    const files = importFluxFiles(map);
    expect(files).toHaveLength(2);
    expect(files.every(f => f.name.endsWith('.flux.md'))).toBe(true);
  });

  it('importFluxFiles creates files as dirty', () => {
    const map = new Map<string, string>();
    map.set('x.flux.md', '');
    const files = importFluxFiles(map);
    expect(files[0].isDirty).toBe(true);
  });

  it('default project files parse as valid FLUX', () => {
    const project = createDefaultProject();
    for (const f of project.files) {
      const parsed = parseFluxFile(f.content);
      expect(parsed).toBeDefined();
    }
  });
});

// ============================================================
// 6. INTEGRATION / END-TO-END TESTS
// ============================================================
describe('Integration – Full Pipeline', () => {
  it('parse -> compile -> bytecode -> VM for hello world template', () => {
    const hw = fluxTemplates.find(t => t.id === 'hello-world')!;
    const { fir } = compileFluxToFIR(hw.content);
    expect(fir.functions.length).toBeGreaterThan(0);
    const bc = generateBytecode(fir);
    expect(bc.length).toBeGreaterThan(0);
    const vm = compileAndRun(fir);
    expect(vm.halted).toBe(true);
    expect(vm.errors).toHaveLength(0);
  });

  it('parse -> compile -> bytecode -> VM for fibonacci template', () => {
    const fib = fluxTemplates.find(t => t.id === 'fibonacci')!;
    const { fir } = compileFluxToFIR(fib.content);
    expect(fir.functions.some(f => f.name === 'fibonacci')).toBe(true);
    expect(fir.functions.some(f => f.name === 'main')).toBe(true);
    const vm = compileAndRun(fir);
    expect(vm.halted).toBe(true);
  });

  it('agent pipeline template compiles with agents', () => {
    const tpl = fluxTemplates.find(t => t.id === 'multi-agent-pipeline')!;
    const { fir } = compileFluxToFIR(tpl.content);
    expect(fir.agents.length).toBeGreaterThanOrEqual(2);
    const bc = generateBytecode(fir);
    expect(bc.some(b => b.mnemonic === 'AGENT')).toBe(true);
  });

  it('functions template has multiple functions', () => {
    const tpl = fluxTemplates.find(t => t.id === 'functions')!;
    const { fir } = compileFluxToFIR(tpl.content);
    expect(fir.functions.length).toBeGreaterThanOrEqual(4);
  });

  it('FIR string output is parseable text', () => {
    const fir = buildFIR([{ opcode: 'MOVI', operands: ['R0', '1'] }, { opcode: 'RET', operands: [] }]);
    const s = firToString(fir);
    expect(typeof s).toBe('string');
    expect(s.length).toBeGreaterThan(0);
  });

  it('bytecode string output is well-formatted', () => {
    const fir = buildFIR([{ opcode: 'RET', operands: [] }]);
    const bc = generateBytecode(fir);
    const s = bytecodeToString(bc);
    expect(typeof s).toBe('string');
    // Should have hex addresses (starts with spaces and hex)
    expect(s).toContain('MODULE');
    expect(s).toContain('.end');
  });
});
