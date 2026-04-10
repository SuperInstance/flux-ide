// FLUX Language Types

export interface FluxFile {
  id: string;
  name: string;
  path: string;
  content: string;
  isDirty: boolean;
}

export interface FluxProject {
  id: string;
  name: string;
  files: FluxFile[];
  createdAt: number;
  updatedAt: number;
}

// Parser types
export interface FluxFrontmatter {
  title?: string;
  version?: string;
  description?: string;
  author?: string;
  raw: string;
}

export interface FluxCodeBlock {
  language: string;
  content: string;
  startLine: number;
  endLine: number;
}

export interface FluxHeading {
  level: number;
  text: string;
  line: number;
  kind: 'module' | 'function' | 'agent' | 'tile' | 'region' | 'import' | 'export' | 'section';
  parsedName?: string;
  parsedParams?: string;
  parsedReturn?: string;
}

export interface FluxDirective {
  type: 'agent' | 'tile' | 'flux';
  value: string;
  line: number;
}

export interface FluxDiagnostic {
  severity: 'error' | 'warning' | 'info';
  message: string;
  line: number;
  column?: number;
  source?: string;
}

export interface ParsedFluxFile {
  frontmatter: FluxFrontmatter;
  headings: FluxHeading[];
  codeBlocks: FluxCodeBlock[];
  directives: FluxDirective[];
  diagnostics: FluxDiagnostic[];
  rawContent: string;
}

// Compiler / FIR types
export interface FIRModule {
  name: string;
  version: string;
  functions: FIRFunction[];
  agents: FIRAgent[];
  regions: FIRRegion[];
  imports: string[];
  exports: string[];
}

export interface FIRFunction {
  name: string;
  params: FIRParam[];
  returnType: string;
  body: FIRInstruction[];
  codeLanguage: string;
  codeContent: string;
}

export interface FIRParam {
  name: string;
  type: string;
}

export interface FIRAgent {
  name: string;
  directives: string[];
  methods: FIRAgentMethod[];
  codeLanguage: string;
  codeContent: string;
}

export interface FIRAgentMethod {
  name: string;
  params: string;
}

export interface FIRRegion {
  name: string;
  size?: number;
}

export interface FIRInstruction {
  label?: string;
  opcode: string;
  operands: string[];
  comment?: string;
  line?: number;
}

// VM Types
export interface VMState {
  registers: number[];
  memory: VMMemoryCell[];
  stack: number[];
  callStack: number[];
  pc: number;
  flags: VMFlags;
  halted: boolean;
  cycles: number;
  output: string[];
  errors: string[];
}

export interface VMFlags {
  zero: boolean;
  carry: boolean;
  negative: boolean;
  overflow: boolean;
}

export interface VMMemoryCell {
  address: number;
  value: number;
  label?: string;
}

export interface VMOpcode {
  code: number;
  mnemonic: string;
  operands: number;
  description: string;
  category: string;
}

// Bytecode types
export interface BytecodeLine {
  address: number;
  bytes: number[];
  mnemonic: string;
  operands: string;
  comment?: string;
}

// Template types
export interface FluxTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  content: string;
  tags: string[];
}

export type TemplateCategory =
  | 'getting-started'
  | 'software-recreation'
  | 'agent-systems'
  | 'novel-tools';

// Agent Map types
export interface AgentNode {
  id: string;
  name: string;
  type: 'producer' | 'consumer' | 'orchestrator' | 'relay' | 'monitor';
  x: number;
  y: number;
  state: 'idle' | 'running' | 'waiting' | 'error';
}

export interface AgentEdge {
  from: string;
  to: string;
  type: 'tell' | 'ask' | 'delegate' | 'broadcast' | 'reduce' | 'barrier';
}
