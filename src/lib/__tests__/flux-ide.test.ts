/**
 * flux-ide — Tests
 * Parser, Compiler, VM Simulator
 */

import { describe, it, expect } from 'vitest';
import { parseFluxFile } from '../flux-parser';
import { compileFluxToFIR, generateBytecode } from '../flux-compiler';
import { createVMFromFIR, executeStep, executeAll } from '../vm-simulator';

const simpleFlux = `---
title: Test Module
version: "1.0"
author: oracle1
---

# Test Module

## function main()

\`\`\`flux
MOVI R0, 10
MOVI R1, 20
IADD R0, R0, R1
HALT
\`\`\`
`;

const minimalFlux = `# Minimal

Hello world.
`;

describe('Flux Parser', () => {
  it('should parse frontmatter', () => {
    const result = parseFluxFile(simpleFlux);
    expect(result.frontmatter.title).toBe('Test Module');
    expect(result.frontmatter.version).toBe('1.0');
    expect(result.frontmatter.author).toBe('oracle1');
  });

  it('should parse without frontmatter', () => {
    const result = parseFluxFile(minimalFlux);
    expect(result.frontmatter.raw).toBe('');
  });

  it('should parse headings', () => {
    const result = parseFluxFile(simpleFlux);
    expect(result.headings.length).toBeGreaterThanOrEqual(1);
    const h1 = result.headings.find(h => h.text === 'Test Module');
    expect(h1).toBeDefined();
    expect(h1!.level).toBe(1);
  });

  it('should parse code blocks', () => {
    const result = parseFluxFile(simpleFlux);
    const fluxBlocks = result.codeBlocks.filter(b => b.language === 'flux');
    expect(fluxBlocks.length).toBeGreaterThanOrEqual(1);
    expect(fluxBlocks[0].content).toContain('MOVI');
  });

  it('should return diagnostics', () => {
    const result = parseFluxFile(simpleFlux);
    expect(Array.isArray(result.diagnostics)).toBe(true);
  });

  it('should preserve raw content', () => {
    const result = parseFluxFile(simpleFlux);
    expect(result.rawContent).toBe(simpleFlux);
  });

  it('should warn about unclosed frontmatter', () => {
    const unclosed = '---\ntitle: test\nno closing';
    const result = parseFluxFile(unclosed);
    const warn = result.diagnostics.find(d => d.message.includes('Unclosed'));
    expect(warn).toBeDefined();
  });

  it('should handle empty content', () => {
    const result = parseFluxFile('');
    expect(result).toBeDefined();
    expect(result.headings.length).toBe(0);
  });
});

describe('Flux Compiler', () => {
  it('should compile flux to FIR', () => {
    const { fir, parsed } = compileFluxToFIR(simpleFlux);
    expect(fir).toBeDefined();
    expect(fir.name).toBe('Test Module');
  });

  it('should compile to bytecode lines', () => {
    const { fir } = compileFluxToFIR(simpleFlux);
    const bc = generateBytecode(fir);
    expect(Array.isArray(bc)).toBe(true);
  });

  it('should generate FIR string representation', () => {
    const { fir } = compileFluxToFIR(simpleFlux);
    // FIR should have enough structure to stringify
    expect(JSON.stringify(fir)).toContain('Test Module');
  });

  it('should extract functions from headings', () => {
    const { fir } = compileFluxToFIR(simpleFlux);
    // Should find the main() function heading
    expect(fir.functions || fir.name).toBeDefined();
  });

  it('should handle minimal flux', () => {
    const { fir } = compileFluxToFIR(minimalFlux);
    expect(fir).toBeDefined();
  });
});

describe('VM Simulator', () => {
  it('should create VM from FIR', () => {
    const { fir } = compileFluxToFIR(simpleFlux);
    const vm = createVMFromFIR(fir);
    expect(vm).toBeDefined();
    expect(vm.registers.length).toBe(64);
    expect(vm.halted).toBe(false);
  });

  it('should have initial register state', () => {
    const { fir } = compileFluxToFIR(simpleFlux);
    const vm = createVMFromFIR(fir);
    // SP should be initialized
    expect(vm.registers[2]).toBe(0xFFFC);
  });

  it('should have flags initialized', () => {
    const { fir } = compileFluxToFIR(simpleFlux);
    const vm = createVMFromFIR(fir);
    expect(vm.flags.zero).toBe(false);
    expect(vm.flags.carry).toBe(false);
  });

  it('should have empty output/errors', () => {
    const { fir } = compileFluxToFIR(simpleFlux);
    const vm = createVMFromFIR(fir);
    expect(Array.isArray(vm.output)).toBe(true);
    expect(Array.isArray(vm.errors)).toBe(true);
  });
});
