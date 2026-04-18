import { VMState, VMFlags, VMMemoryCell, BytecodeLine, FIRModule, FIRFunction } from '@/types/flux';
import { generateBytecode } from './flux-compiler';

const REGISTER_NAMES = [
  'ZERO', 'RA', 'SP', 'BP', 'PC', 'FLAGS', 'FP', 'R7',
  'R8', 'R9', 'R10', 'R11', 'R12', 'R13', 'R14', 'R15',
  'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7',
  'A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15',
  'A16', 'A17', 'A18', 'A19', 'A20', 'A21', 'A22', 'A23',
  'A24', 'A25', 'A26', 'A27', 'A28', 'A29', 'A30', 'A31',
  'AGENT0', 'AGENT1', 'AGENT2', 'AGENT3', 'AGENT4', 'AGENT5', 'AGENT6', 'AGENT7',
  'AGENT8', 'AGENT9', 'AGENT10', 'AGENT11', 'AGENT12', 'AGENT13', 'AGENT14', 'AGENT15',
];

function createInitialVM(): VMState {
  const registers = new Array(64).fill(0);
  return {
    registers,
    memory: [],
    stack: [],
    callStack: [],
    pc: 0,
    flags: { zero: false, carry: false, negative: false, overflow: false },
    halted: false,
    cycles: 0,
    output: [],
    errors: [],
  };
}

export function createVMFromFIR(fir: FIRModule): VMState {
  const vm = createInitialVM();
  // Set SP to a high address
  vm.registers[2] = 0xFFFC; // SP
  vm.registers[3] = 0x0000; // BP
  return vm;
}

function parseRegister(operand: string): number {
  const trimmed = operand.trim();
  const match = trimmed.match(/^[Rr](\d+)$/);
  if (match) return parseInt(match[1], 10);

  // Named registers
  const upperName = trimmed.toUpperCase();
  const idx = REGISTER_NAMES.indexOf(upperName);
  if (idx >= 0) return idx;

  // A0-A3 shortcuts
  const argMatch = trimmed.match(/^[Aa](\d+)$/);
  if (argMatch) return 16 + parseInt(argMatch[1], 10);

  return -1;
}

function parseImmediate(operand: string): number {
  const trimmed = operand.trim();
  // Hex
  if (trimmed.startsWith('0x') || trimmed.startsWith('0X')) {
    return parseInt(trimmed, 16);
  }
  // Binary
  if (trimmed.startsWith('0b') || trimmed.startsWith('0B')) {
    return parseInt(trimmed.slice(2), 2);
  }
  // String literal
  if (trimmed.startsWith('"') || trimmed.startsWith("'")) {
    const str = trimmed.slice(1, -1);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
  // Number
  const num = parseInt(trimmed, 10);
  return isNaN(num) ? 0 : num;
}

function isRegister(operand: string): boolean {
  return parseRegister(operand) >= 0;
}

export function compileAndRun(fir: FIRModule): VMState {
  const bytecode = generateBytecode(fir);
  const vm = createVMFromFIR(fir);

  // Find the main function
  const mainFn = fir.functions.find(f => f.name === 'main') || fir.functions[0];
  if (!mainFn) {
    vm.errors.push('No functions found to execute');
    vm.halted = true;
    return vm;
  }

  // Set up initial state - simulate main function
  vm.output.push(`[FLUX VM] Starting execution of ${fir.name}`);
  vm.output.push(`[FLUX VM] Module version: ${fir.version}`);
  vm.output.push(`[FLUX VM] Functions: ${fir.functions.map(f => f.name).join(', ')}`);
  if (fir.agents.length > 0) {
    vm.output.push(`[FLUX VM] Agents: ${fir.agents.map(a => a.name).join(', ')}`);
  }
  vm.output.push('');

  // Execute bytecode (simplified)
  executeBytecode(vm, bytecode, mainFn, fir);

  return vm;
}

function executeBytecode(vm: VMState, bytecode: BytecodeLine[], mainFn: FIRFunction, fir: FIRModule) {
  let instrIdx = 0;
  const maxCycles = 10000;

  // Find where main function starts in bytecode
  let mainStartIdx = 0;
  for (let i = 0; i < bytecode.length; i++) {
    if (bytecode[i].mnemonic === 'FUNC' && bytecode[i].operands.includes(mainFn.name)) {
      mainStartIdx = i + 1;
      break;
    }
  }

  // Find main function end
  let mainEndIdx = bytecode.length;
  for (let i = mainStartIdx; i < bytecode.length; i++) {
    if (bytecode[i].mnemonic === 'RET') {
      mainEndIdx = i;
      break;
    }
  }

  // Simulate execution
  for (let i = mainStartIdx; i <= mainEndIdx && vm.cycles < maxCycles; i++) {
    const instr = bytecode[i];
    vm.pc = instr.address;
    vm.cycles++;

    if (instr.mnemonic === 'NOP') continue;

    const operands = instr.operands.split(',').map(o => o.trim()).filter(o => o);

    switch (instr.mnemonic) {
      case 'MOVI': {
        const reg = parseRegister(operands[0]);
        const imm = parseImmediate(operands[1]);
        if (reg >= 0) vm.registers[reg] = imm;
        updateFlags(vm, vm.registers[reg]);
        break;
      }
      case 'MOV': {
        const dst = parseRegister(operands[0]);
        const src = parseRegister(operands[1]);
        if (dst >= 0 && src >= 0) {
          vm.registers[dst] = vm.registers[src];
        } else if (dst >= 0 && src < 0) {
          vm.registers[dst] = parseImmediate(operands[1]);
        }
        updateFlags(vm, vm.registers[dst]);
        break;
      }
      case 'IADD': {
        const dst = parseRegister(operands[0]);
        const src = parseRegister(operands[1]);
        if (dst >= 0) {
          const val = src >= 0 ? vm.registers[src] : parseImmediate(operands[1]);
          vm.registers[dst] = (vm.registers[dst] + val) | 0;
          updateFlags(vm, vm.registers[dst]);
        }
        break;
      }
      case 'ISUB': {
        const dst = parseRegister(operands[0]);
        const src = parseRegister(operands[1]);
        if (dst >= 0) {
          const val = src >= 0 ? vm.registers[src] : parseImmediate(operands[1]);
          vm.registers[dst] = (vm.registers[dst] - val) | 0;
          updateFlags(vm, vm.registers[dst]);
        }
        break;
      }
      case 'IMUL': {
        const dst = parseRegister(operands[0]);
        const src = parseRegister(operands[1]);
        if (dst >= 0) {
          const val = src >= 0 ? vm.registers[src] : parseImmediate(operands[1]);
          vm.registers[dst] = Math.imul(vm.registers[dst], val);
          updateFlags(vm, vm.registers[dst]);
        }
        break;
      }
      case 'IDIV': {
        const dst = parseRegister(operands[0]);
        const src = parseRegister(operands[1]);
        if (dst >= 0) {
          const val = src >= 0 ? vm.registers[src] : parseImmediate(operands[1]);
          if (val === 0) {
            vm.errors.push(`Division by zero at 0x${instr.address.toString(16)}`);
            vm.halted = true;
            return;
          }
          vm.registers[dst] = (vm.registers[dst] / val) | 0;
          updateFlags(vm, vm.registers[dst]);
        }
        break;
      }
      case 'IMOD': {
        const dst = parseRegister(operands[0]);
        const src = parseRegister(operands[1]);
        if (dst >= 0) {
          const val = src >= 0 ? vm.registers[src] : parseImmediate(operands[1]);
          if (val === 0) {
            vm.errors.push(`Modulo by zero at 0x${instr.address.toString(16)}`);
            vm.halted = true;
            return;
          }
          vm.registers[dst] = vm.registers[dst] % val;
          updateFlags(vm, vm.registers[dst]);
        }
        break;
      }
      case 'CMP': case 'CMPI': {
        const a = parseRegister(operands[0]);
        const b = parseRegister(operands[1]);
        if (a >= 0) {
          const valB = b >= 0 ? vm.registers[b] : parseImmediate(operands[1]);
          const diff = vm.registers[a] - valB;
          vm.flags.zero = diff === 0;
          vm.flags.negative = diff < 0;
          vm.flags.carry = vm.registers[a] < valB;
        }
        break;
      }
      case 'JMP': {
        // Simplified - just continue
        break;
      }
      case 'JZ': {
        if (vm.flags.zero) break;
        break;
      }
      case 'JNZ': {
        if (!vm.flags.zero) break;
        break;
      }
      case 'CALL': {
        const fnName = operands[0];
        vm.callStack.push(i);
        // Check if function exists
        const calledFn = fir.functions.find(f => f.name === fnName);
        if (calledFn) {
          vm.output.push(`[CALL] ${fnName}`);
          // Find function start
          for (let j = 0; j < bytecode.length; j++) {
            if (bytecode[j].mnemonic === 'FUNC' && bytecode[j].operands.includes(fnName)) {
              // Simulate function by just moving to its RET
              for (let k = j + 1; k < bytecode.length; k++) {
                if (bytecode[k].mnemonic === 'RET') {
                  // Execute the function's instructions
                  for (let m = j + 1; m < k; m++) {
                    const subInstr = bytecode[m];
                    if (subInstr.mnemonic === 'RET') continue;
                    if (subInstr.mnemonic === 'NOP') continue;
                    const subOps = subInstr.operands.split(',').map(o => o.trim()).filter(o => o);
                    if (subInstr.mnemonic === 'MOVI' && subOps.length >= 2) {
                      const reg = parseRegister(subOps[0]);
                      const imm = parseImmediate(subOps[1]);
                      if (reg >= 0) vm.registers[reg] = imm;
                    }
                  }
                  i = k;
                  vm.output.push(`[RET] ${fnName} -> R0=${vm.registers[0]}`);
                  break;
                }
              }
              break;
            }
          }
        } else {
          vm.errors.push(`Undefined function: ${fnName}`);
        }
        vm.callStack.pop();
        break;
      }
      case 'RET': {
        vm.output.push(`[RET] Return value: ${vm.registers[0]}`);
        break;
      }
      case 'LOAD': {
        const dst = parseRegister(operands[0]);
        if (dst >= 0) {
          const addr = operands.length > 1 ? parseImmediate(operands[1]) : 0;
          vm.registers[dst] = vm.memory.find(m => m.address === addr)?.value || 0;
        }
        break;
      }
      case 'STORE': {
        const val = parseRegister(operands[0]) >= 0 ? vm.registers[parseRegister(operands[0])] : parseImmediate(operands[0]);
        const addr = operands.length > 1 ? parseImmediate(operands[1]) : 0;
        const existing = vm.memory.findIndex(m => m.address === addr);
        if (existing >= 0) {
          vm.memory[existing].value = val;
        } else {
          vm.memory.push({ address: addr, value: val });
        }
        break;
      }
      case 'PUSH': {
        const reg = parseRegister(operands[0]);
        const val = reg >= 0 ? vm.registers[reg] : parseImmediate(operands[0]);
        vm.stack.push(val);
        vm.registers[2] = (vm.registers[2] - 4) & 0xFFFF; // SP
        break;
      }
      case 'POP': {
        const reg = parseRegister(operands[0]);
        const val = vm.stack.pop() || 0;
        if (reg >= 0) vm.registers[reg] = val;
        vm.registers[2] = (vm.registers[2] + 4) & 0xFFFF; // SP
        break;
      }
      case 'PRINT': {
        const reg = parseRegister(operands[0]);
        const val = reg >= 0 ? vm.registers[reg] : parseImmediate(operands[0]);
        vm.output.push(String(val));
        break;
      }
      case 'PRINTS': {
        vm.output.push('[output] (string output)');
        break;
      }
      case 'SPAWN': {
        const agentName = operands[0] || 'agent';
        vm.output.push(`[SPAWN] Agent: ${agentName}`);
        // Allocate agent register
        for (let r = 32; r < 48; r++) {
          if (vm.registers[r] === 0) {
            vm.registers[r] = 1;
            vm.output.push(`[SPAWN] ${agentName} assigned to AGENT${r - 32}`);
            break;
          }
        }
        break;
      }
      case 'TELL': {
        vm.output.push(`[TELL] Message sent from ${REGISTER_NAMES[parseRegister(operands[0])] || operands[0]}`);
        break;
      }
      case 'ASK': {
        vm.output.push(`[ASK] Query sent from ${REGISTER_NAMES[parseRegister(operands[0])] || operands[0]}`);
        break;
      }
      case 'DELEGATE': {
        vm.output.push(`[DELEGATE] Task delegated`);
        break;
      }
      case 'BROADCAST': {
        vm.output.push(`[BROADCAST] Message broadcast to all agents`);
        break;
      }
      case 'REDUCE': {
        vm.output.push(`[REDUCE] Reduction operation started`);
        break;
      }
      case 'BARRIER': {
        vm.output.push(`[BARRIER] Synchronization point reached`);
        break;
      }
      case 'HALT': {
        vm.halted = true;
        vm.output.push('');
        vm.output.push(`[FLUX VM] Execution complete (${vm.cycles} cycles)`);
        vm.output.push(`[FLUX VM] Return value: R0 = ${vm.registers[0]}`);
        return;
      }
      default:
        break;
    }
  }

  vm.halted = true;
  vm.output.push('');
  vm.output.push(`[FLUX VM] Execution complete (${vm.cycles} cycles)`);
  vm.output.push(`[FLUX VM] Return value: R0 = ${vm.registers[0]}`);
}

function updateFlags(vm: VMState, value: number) {
  vm.flags.zero = value === 0;
  vm.flags.negative = value < 0;
  vm.flags.carry = false;
  vm.flags.overflow = false;
}

export function getRegisterName(idx: number): string {
  return REGISTER_NAMES[idx] || `R${idx}`;
}

export function formatVMState(vm: VMState): string {
  const lines: string[] = [];
  lines.push('╔══════════════════════════════════════════════════╗');
  lines.push('║              FLUX VM STATE                       ║');
  lines.push('╠══════════════════════════════════════════════════╣');
  lines.push(`║  PC: 0x${vm.pc.toString(16).toUpperCase().padStart(4, '0')}  SP: 0x${vm.registers[2].toString(16).toUpperCase().padStart(4, '0')}  Cycles: ${vm.cycles}  ${vm.halted ? '[HALTED]' : '[RUNNING]'}  ║`);
  lines.push('╠══════════════════════════════════════════════════╣');
  lines.push('║  FLAGS: Z=' + (vm.flags.zero ? '1' : '0') + ' N=' + (vm.flags.negative ? '1' : '0') + ' C=' + (vm.flags.carry ? '1' : '0') + ' O=' + (vm.flags.overflow ? '1' : '0') + '                                 ║');
  lines.push('╠══════════════════════════════════════════════════╣');

  // System registers (R0-R7)
  lines.push('║  System Registers:                               ║');
  for (let i = 0; i < 8; i++) {
    const name = REGISTER_NAMES[i].padEnd(8);
    const val = vm.registers[i];
    const hex = val.toString(16).toUpperCase().padStart(8, '0');
    const dec = val.toString().padStart(12);
    lines.push(`║  ${name} = 0x${hex} (${dec})`);
  }

  lines.push('║  General Registers (R8-R15):                    ║');
  for (let i = 8; i < 16; i++) {
    const name = REGISTER_NAMES[i].padEnd(8);
    const val = vm.registers[i];
    const hex = val.toString(16).toUpperCase().padStart(8, '0');
    const dec = val.toString().padStart(12);
    lines.push(`║  ${name} = 0x${hex} (${dec})`);
  }

  // Only show non-zero argument registers
  const usedArgRegs = vm.registers.slice(16, 32).filter(v => v !== 0);
  if (usedArgRegs.length > 0) {
    lines.push('║  Argument Registers (A0-A15):                  ║');
    for (let i = 16; i < 32; i++) {
      if (vm.registers[i] !== 0) {
        const name = REGISTER_NAMES[i].padEnd(8);
        const val = vm.registers[i];
        const hex = val.toString(16).toUpperCase().padStart(8, '0');
        const dec = val.toString().padStart(12);
        lines.push(`║  ${name} = 0x${hex} (${dec})`);
      }
    }
  }

  // Only show non-zero agent registers
  const usedAgentRegs = vm.registers.slice(32, 48).filter(v => v !== 0);
  if (usedAgentRegs.length > 0) {
    lines.push('║  Agent Registers:                               ║');
    for (let i = 32; i < 48; i++) {
      if (vm.registers[i] !== 0) {
        const name = REGISTER_NAMES[i].padEnd(10);
        const val = vm.registers[i];
        const hex = val.toString(16).toUpperCase().padStart(8, '0');
        lines.push(`║  ${name} = 0x${hex} (${val})`);
      }
    }
  }

  // Stack
  if (vm.stack.length > 0) {
    lines.push('╠══════════════════════════════════════════════════╣');
    lines.push(`║  Stack (${vm.stack.length} items):`);
    for (let i = vm.stack.length - 1; i >= Math.max(0, vm.stack.length - 8); i--) {
      lines.push(`║    [${i.toString().padStart(3)}] = ${vm.stack[i]}`);
    }
    if (vm.stack.length > 8) {
      lines.push(`║    ... (${vm.stack.length - 8} more)`);
    }
  }

  // Memory
  if (vm.memory.length > 0) {
    lines.push('╠══════════════════════════════════════════════════╣');
    lines.push('║  Memory:');
    for (const cell of vm.memory) {
      const addr = cell.address.toString(16).toUpperCase().padStart(4, '0');
      const val = cell.value.toString(16).toUpperCase().padStart(8, '0');
      const label = cell.label ? ` [${cell.label}]` : '';
      lines.push(`║    [0x${addr}] = 0x${val}${label}`);
    }
  }

  lines.push('╚══════════════════════════════════════════════════╝');
  return lines.join('\n');
}
