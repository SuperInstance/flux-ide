import { ParsedFluxFile, FIRModule, FIRFunction, FIRAgent, FIRInstruction, BytecodeLine } from '@/types/flux';
import { parseFluxFile } from './flux-parser';

// FLUX Opcodes
const OPCODES: Record<string, { code: number; cat: string; desc: string }> = {
  NOP:      { code: 0x00, cat: 'System', desc: 'No operation' },
  HALT:     { code: 0x01, cat: 'System', desc: 'Halt execution' },
  MOV:      { code: 0x02, cat: 'System', desc: 'Move value between registers' },
  MOVI:     { code: 0x03, cat: 'System', desc: 'Move immediate value' },
  IADD:     { code: 0x10, cat: 'Arithmetic', desc: 'Integer add' },
  ISUB:     { code: 0x11, cat: 'Arithmetic', desc: 'Integer subtract' },
  IMUL:     { code: 0x12, cat: 'Arithmetic', desc: 'Integer multiply' },
  IDIV:     { code: 0x13, cat: 'Arithmetic', desc: 'Integer divide' },
  IMOD:     { code: 0x14, cat: 'Arithmetic', desc: 'Integer modulo' },
  FADD:     { code: 0x15, cat: 'Arithmetic', desc: 'Float add' },
  FSUB:     { code: 0x16, cat: 'Arithmetic', desc: 'Float subtract' },
  FMUL:     { code: 0x17, cat: 'Arithmetic', desc: 'Float multiply' },
  FDIV:     { code: 0x18, cat: 'Arithmetic', desc: 'Float divide' },
  AND:      { code: 0x20, cat: 'Logic', desc: 'Bitwise AND' },
  OR:       { code: 0x21, cat: 'Logic', desc: 'Bitwise OR' },
  XOR:      { code: 0x22, cat: 'Logic', desc: 'Bitwise XOR' },
  NOT:      { code: 0x23, cat: 'Logic', desc: 'Bitwise NOT' },
  SHL:      { code: 0x24, cat: 'Logic', desc: 'Shift left' },
  SHR:      { code: 0x25, cat: 'Logic', desc: 'Shift right' },
  CMP:      { code: 0x30, cat: 'Compare', desc: 'Compare registers' },
  CMPI:     { code: 0x31, cat: 'Compare', desc: 'Compare with immediate' },
  JMP:      { code: 0x40, cat: 'Branch', desc: 'Unconditional jump' },
  JZ:       { code: 0x41, cat: 'Branch', desc: 'Jump if zero' },
  JNZ:      { code: 0x42, cat: 'Branch', desc: 'Jump if not zero' },
  JG:       { code: 0x43, cat: 'Branch', desc: 'Jump if greater' },
  JL:       { code: 0x44, cat: 'Branch', desc: 'Jump if less' },
  JGE:      { code: 0x45, cat: 'Branch', desc: 'Jump if greater or equal' },
  JLE:      { code: 0x46, cat: 'Branch', desc: 'Jump if less or equal' },
  CALL:     { code: 0x70, cat: 'Call', desc: 'Call function' },
  RET:      { code: 0x71, cat: 'Call', desc: 'Return from function' },
  LOAD:     { code: 0x50, cat: 'Memory', desc: 'Load from memory' },
  STORE:    { code: 0x51, cat: 'Memory', desc: 'Store to memory' },
  PUSH:     { code: 0x60, cat: 'Stack', desc: 'Push to stack' },
  POP:      { code: 0x61, cat: 'Stack', desc: 'Pop from stack' },
  SPAWN:    { code: 0x80, cat: 'Agent/A2A', desc: 'Spawn new agent' },
  TELL:     { code: 0x81, cat: 'Agent/A2A', desc: 'Send message to agent' },
  ASK:      { code: 0x82, cat: 'Agent/A2A', desc: 'Query agent' },
  DELEGATE: { code: 0x83, cat: 'Agent/A2A', desc: 'Delegate task to agent' },
  BROADCAST:{ code: 0x84, cat: 'Agent/A2A', desc: 'Broadcast to all agents' },
  REDUCE:   { code: 0x85, cat: 'Agent/A2A', desc: 'Reduce across agents' },
  BARRIER:  { code: 0x86, cat: 'Agent/A2A', desc: 'Synchronization barrier' },
  PRINT:    { code: 0x90, cat: 'I/O', desc: 'Print value' },
  PRINTS:   { code: 0x91, cat: 'I/O', desc: 'Print string' },
  READ:     { code: 0x92, cat: 'I/O', desc: 'Read input' },
};

export function compileFluxToFIR(content: string): { fir: FIRModule; parsed: ParsedFluxFile } {
  const parsed = parseFluxFile(content);
  const fir = generateFIR(parsed);
  return { fir, parsed };
}

function generateFIR(parsed: ParsedFluxFile): FIRModule {
  const module: FIRModule = {
    name: parsed.headings.find(h => h.level === 1)?.text || parsed.frontmatter.title || 'unnamed',
    version: parsed.frontmatter.version || '1.0.0',
    functions: [],
    agents: [],
    regions: [],
    imports: [],
    exports: [],
  };

  let codeBlockIdx = 0;

  for (const heading of parsed.headings) {
    switch (heading.kind) {
      case 'function': {
        const fn = generateFIRFunction(heading, parsed.codeBlocks[codeBlockIdx]);
        module.functions.push(fn);
        codeBlockIdx++;
        break;
      }
      case 'agent': {
        const agent = generateFIRAgent(heading, parsed.codeBlocks[codeBlockIdx], parsed.directives);
        module.agents.push(agent);
        codeBlockIdx++;
        break;
      }
      case 'tile': {
        module.regions.push({
          name: heading.parsedName || heading.text,
        });
        break;
      }
      case 'region': {
        module.regions.push({
          name: heading.parsedName || heading.text,
        });
        break;
      }
      case 'import': {
        module.imports.push(heading.parsedName || heading.text);
        break;
      }
      case 'export': {
        module.exports.push(heading.parsedName || heading.text);
        break;
      }
    }
  }

  return module;
}

function generateFIRFunction(heading: import('@/types/flux').FluxHeading, codeBlock?: import('@/types/flux').FluxCodeBlock): FIRFunction {
  const name = heading.parsedName || 'anonymous';
  const params: { name: string; type: string }[] = [];

  if (heading.parsedParams) {
    for (const param of heading.parsedParams.split(',')) {
      const parts = param.trim().split(':');
      if (parts.length >= 2) {
        params.push({ name: parts[0].trim(), type: parts[1].trim() });
      } else {
        params.push({ name: parts[0].trim(), type: 'i32' });
      }
    }
  }

  const returnType = heading.parsedReturn || 'void';
  const instructions = generateInstructions(name, params, returnType, codeBlock);

  return {
    name,
    params,
    returnType,
    body: instructions,
    codeLanguage: codeBlock?.language || 'c',
    codeContent: codeBlock?.content || '',
  };
}

function generateInstructions(fnName: string, params: { name: string; type: string }[], returnType: string, codeBlock?: import('@/types/flux').FluxCodeBlock): FIRInstruction[] {
  const instructions: FIRInstruction[] = [];

  if (!codeBlock) {
    instructions.push({ opcode: 'RET', operands: [], comment: 'empty function' });
    return instructions;
  }

  const lang = codeBlock.language.toLowerCase();
  instructions.push({ opcode: 'NOP', operands: [], comment: `; --- ${fnName} (${lang}) ---` });
  instructions.push({ opcode: 'NOP', operands: [], comment: `; Source: ${codeBlock.content.split('\n').length} lines of ${lang}` });

  // Generate param loading instructions
  if (params.length > 0) {
    instructions.push({ opcode: 'NOP', operands: [], comment: '; Prologue: Load parameters' });
    for (let i = 0; i < Math.min(params.length, 4); i++) {
      instructions.push({
        opcode: 'MOV',
        operands: [`R${i}`, `A${i}`],
        comment: `; ${params[i].name}: ${params[i].type} -> R${i}`,
      });
    }
  }

  // Analyze the code and generate representative FIR instructions
  const code = codeBlock.content;
  const lines = code.split('\n').filter(l => l.trim());
  let labelCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    const instr = analyzeCodeLine(trimmed, instructions, () => labelCount++);
    if (instr) instructions.push(instr);
  }

  // Epilogue
  if (returnType !== 'void') {
    instructions.push({ opcode: 'MOV', operands: ['A0', 'R0'], comment: '; Return value' });
  }
  instructions.push({ opcode: 'RET', operands: [], comment: `; End ${fnName}` });

  return instructions;
}

function analyzeCodeLine(line: string, _instructions: FIRInstruction[], labelCounter: () => number): FIRInstruction | null {
  const lower = line.toLowerCase();

  // Variable declarations
  if (lower.match(/^(int|float|double|char|void|long|short)\s+\w+\s*=/) ||
      lower.match(/^(let|var|const)\s+\w+\s*=/)) {
    return { opcode: 'MOVI', operands: ['R8', '0'], comment: `; ${line}` };
  }

  // Return statement
  if (lower.startsWith('return ') || lower === 'return') {
    const val = line.replace(/^(return)\s+/, '').replace(/;$/, '').trim();
    if (val.match(/^\d+$/)) {
      return { opcode: 'MOVI', operands: ['A0', val], comment: `; return ${val}` };
    }
    return { opcode: 'MOV', operands: ['A0', 'R8'], comment: `; return ${val}` };
  }

  // Print / output
  if (lower.includes('print') || lower.includes('printf') || lower.includes('println')) {
    return { opcode: 'PRINTS', operands: ['R8'], comment: `; ${line}` };
  }

  // For loop
  if (lower.match(/^for\s*\(/)) {
    const label = `L${labelCounter()}`;
    return { opcode: 'MOVI', operands: ['R8', '0'], comment: `; for loop init` };
  }

  // While loop
  if (lower.match(/^while\s*\(/)) {
    return { opcode: 'NOP', operands: [], comment: `; while condition` };
  }

  // If statement
  if (lower.match(/^if\s*\(/) || lower.match(/^}\s*else\s*if/)) {
    return { opcode: 'CMP', operands: ['R8', 'R9'], comment: `; if condition` };
  }

  // Function call
  if (lower.match(/\w+\s*\(/) && !lower.match(/^(if|while|for|switch|return)/)) {
    const fnMatch = line.match(/(\w+)\s*\(/);
    if (fnMatch && !['int', 'float', 'double', 'char', 'void', 'long', 'short', 'let', 'var', 'const'].includes(fnMatch[1])) {
      return { opcode: 'CALL', operands: [fnMatch[1]], comment: `; ${line}` };
    }
  }

  // Assignment
  if (line.includes('=') && !line.includes('==') && !line.match(/^(if|while|for|int|float|double|char|void|long|short|let|var|const)/)) {
    return { opcode: 'MOV', operands: ['R8', 'R9'], comment: `; ${line}` };
  }

  // Store
  if (lower.startsWith('store') || lower.includes('->')) {
    return { opcode: 'STORE', operands: ['R8', 'R9'], comment: `; ${line}` };
  }

  // Load
  if (lower.startsWith('load') || lower.includes('<-')) {
    return { opcode: 'LOAD', operands: ['R8', 'R9'], comment: `; ${line}` };
  }

  // Agent operations
  if (lower.includes('tell') || lower.includes('send')) {
    return { opcode: 'TELL', operands: ['R8', 'R9'], comment: `; ${line}` };
  }
  if (lower.includes('ask') || lower.includes('query')) {
    return { opcode: 'ASK', operands: ['R8', 'R9'], comment: `; ${line}` };
  }
  if (lower.includes('delegate')) {
    return { opcode: 'DELEGATE', operands: ['R8', 'R9'], comment: `; ${line}` };
  }
  if (lower.includes('broadcast')) {
    return { opcode: 'BROADCAST', operands: ['R8'], comment: `; ${line}` };
  }
  if (lower.includes('spawn')) {
    return { opcode: 'SPAWN', operands: ['R8'], comment: `; ${line}` };
  }
  if (lower.includes('barrier')) {
    return { opcode: 'BARRIER', operands: ['R8'], comment: `; ${line}` };
  }

  // Spawn agent (Python def run / def on_receive)
  if (lower.includes('def ') && (lower.includes('run') || lower.includes('on_receive') || lower.includes('handle'))) {
    return { opcode: 'SPAWN', operands: ['R8'], comment: `; agent method: ${line}` };
  }

  return null;
}

function generateFIRAgent(heading: import('@/types/flux').FluxHeading, codeBlock?: import('@/types/flux').FluxCodeBlock, directives?: import('@/types/flux').FluxDirective[]): FIRAgent {
  const name = heading.parsedName || 'anonymous';
  const methods: { name: string; params: string }[] = [];

  // Extract Python methods from code
  if (codeBlock) {
    const methodRegex = /def\s+(\w+)\s*\(([^)]*)\)/g;
    let match;
    while ((match = methodRegex.exec(codeBlock.content)) !== null) {
      methods.push({ name: match[1], params: match[2] });
    }
  }

  const directiveStrings = (directives || [])
    .filter(d => d.type === 'agent')
    .map(d => d.value);

  return {
    name,
    directives: directiveStrings,
    methods,
    codeLanguage: codeBlock?.language || 'python',
    codeContent: codeBlock?.content || '',
  };
}

export function generateBytecode(fir: FIRModule): BytecodeLine[] {
  const lines: BytecodeLine[] = [];
  let addr = 0;

  lines.push({
    address: addr,
    bytes: [0xFE],
    mnemonic: 'MODULE',
    operands: `"${fir.name}"`,
    comment: `v${fir.version}`,
  });
  addr += 4;

  for (const imp of fir.imports) {
    lines.push({
      address: addr,
      bytes: [0xFC],
      mnemonic: 'IMPORT',
      operands: imp,
    });
    addr += 4;
  }

  for (const exp of fir.exports) {
    lines.push({
      address: addr,
      bytes: [0xFD],
      mnemonic: 'EXPORT',
      operands: exp,
    });
    addr += 4;
  }

  for (const fn of fir.functions) {
    lines.push({
      address: addr,
      bytes: [0xA0],
      mnemonic: 'FUNC',
      operands: `${fn.name}(${fn.params.map(p => `${p.name}: ${p.type}`).join(', ')}) -> ${fn.returnType}`,
      comment: `${fn.body.length} instructions`,
    });
    addr += 4;

    for (const instr of fn.body) {
      if (instr.opcode === 'NOP') {
        lines.push({
          address: addr,
          bytes: [0x00],
          mnemonic: 'NOP',
          operands: '',
          comment: instr.comment,
        });
        addr += 1;
      } else {
        const opcode = OPCODES[instr.opcode];
        const code = opcode?.code || 0x00;
        lines.push({
          address: addr,
          bytes: [code, 0x00, 0x00, 0x00],
          mnemonic: instr.opcode,
          operands: instr.operands.join(', '),
          comment: instr.comment,
        });
        addr += 4;
      }
    }
  }

  for (const agent of fir.agents) {
    lines.push({
      address: addr,
      bytes: [0xB0],
      mnemonic: 'AGENT',
      operands: agent.name,
      comment: `methods: [${agent.methods.map(m => m.name).join(', ')}]`,
    });
    addr += 4;
  }

  lines.push({
    address: addr,
    bytes: [0x01],
    mnemonic: '.end',
    operands: '',
    comment: 'End of module',
  });

  return lines;
}

export function firToString(fir: FIRModule): string {
  const lines: string[] = [];
  lines.push(`; FLUX IR — Module: ${fir.name}`);
  lines.push(`; Version: ${fir.version}`);
  lines.push(`; Generated by FLUX IDE`);
  lines.push('');

  if (fir.imports.length > 0) {
    lines.push(`; --- Imports ---`);
    for (const imp of fir.imports) {
      lines.push(`  import ${imp}`);
    }
    lines.push('');
  }

  if (fir.exports.length > 0) {
    lines.push(`; --- Exports ---`);
    for (const exp of fir.exports) {
      lines.push(`  export ${exp}`);
    }
    lines.push('');
  }

  if (fir.regions.length > 0) {
    lines.push(`; --- Memory Regions ---`);
    for (const region of fir.regions) {
      lines.push(`  region ${region.name}${region.size ? ` size=${region.size}` : ''}`);
    }
    lines.push('');
  }

  for (const fn of fir.functions) {
    lines.push(`; --- Function: ${fn.name} ---`);
    const paramsStr = fn.params.map(p => `${p.name}: ${p.type}`).join(', ');
    lines.push(`  func ${fn.name}(${paramsStr}) -> ${fn.returnType} {`);

    if (fn.codeContent) {
      lines.push(`    ; Source (${fn.codeLanguage}):`);
      for (const srcLine of fn.codeContent.split('\n').slice(0, 5)) {
        lines.push(`    ;  ${srcLine}`);
      }
      if (fn.codeContent.split('\n').length > 5) {
        lines.push(`    ;  ...`);
      }
      lines.push('');
    }

    for (const instr of fn.body) {
      const comment = instr.comment ? `  ${instr.comment}` : '';
      const operands = instr.operands.length > 0 ? ` ${instr.operands.join(', ')}` : '';
      lines.push(`    ${instr.opcode}${operands}${comment}`);
    }

    lines.push(`  }`);
    lines.push('');
  }

  for (const agent of fir.agents) {
    lines.push(`; --- Agent: ${agent.name} ---`);
    if (agent.directives.length > 0) {
      lines.push(`  directives: ${agent.directives.join(', ')}`);
    }
    lines.push(`  agent ${agent.name} {`);
    lines.push(`    lang: ${agent.codeLanguage}`);
    if (agent.methods.length > 0) {
      lines.push(`    methods:`);
      for (const method of agent.methods) {
        lines.push(`      - ${method.name}(${method.params})`);
      }
    }
    if (agent.codeContent) {
      lines.push(`    source:`);
      for (const srcLine of agent.codeContent.split('\n')) {
        lines.push(`      ${srcLine}`);
      }
    }
    lines.push(`  }`);
    lines.push('');
  }

  lines.push(`; --- End Module: ${fir.name} ---`);
  return lines.join('\n');
}

export function bytecodeToString(bytecode: BytecodeLine[]): string {
  return bytecode.map(line => {
    const hexBytes = line.bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
    const comment = line.comment ? `  ; ${line.comment}` : '';
    const operands = line.operands ? ` ${line.operands}` : '';
    return `  ${line.address.toString(16).toUpperCase().padStart(4, '0')}:  ${hexBytes.padEnd(16)}  ${line.mnemonic}${operands}${comment}`;
  }).join('\n');
}
