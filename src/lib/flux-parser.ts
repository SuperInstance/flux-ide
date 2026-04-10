import { ParsedFluxFile, FluxFrontmatter, FluxHeading, FluxCodeBlock, FluxDirective, FluxDiagnostic } from '@/types/flux';

export function parseFluxFile(content: string, filename?: string): ParsedFluxFile {
  const lines = content.split('\n');
  const diagnostics: FluxDiagnostic[] = [];

  // Parse frontmatter
  const frontmatter = parseFrontmatter(lines, diagnostics);

  // Parse headings
  const headings = parseHeadings(lines, frontmatter);

  // Parse code blocks
  const codeBlocks = parseCodeBlocks(lines);

  // Parse directives
  const directives = parseDirectives(lines);

  return {
    frontmatter,
    headings,
    codeBlocks,
    directives,
    diagnostics,
    rawContent: content,
  };
}

function parseFrontmatter(lines: string[], diagnostics: FluxDiagnostic[]): FluxFrontmatter {
  if (lines.length < 2 || lines[0].trim() !== '---') {
    return { raw: '' };
  }

  const endIdx = lines.findIndex((line, idx) => idx > 0 && line.trim() === '---');
  if (endIdx === -1) {
    diagnostics.push({
      severity: 'warning',
      message: 'Unclosed frontmatter delimiter',
      line: 1,
      source: 'flux-parser',
    });
    return { raw: lines.slice(1).join('\n') };
  }

  const raw = lines.slice(1, endIdx).join('\n');
  const result: FluxFrontmatter = { raw };

  for (const line of lines.slice(1, endIdx)) {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const key = match[1].toLowerCase();
      const val = match[2].trim().replace(/^["']|["']$/g, '');
      switch (key) {
        case 'title': result.title = val; break;
        case 'version': result.version = val; break;
        case 'description': result.description = val; break;
        case 'author': result.author = val; break;
      }
    }
  }

  if (!result.title) {
    diagnostics.push({
      severity: 'info',
      message: 'Consider adding a title in frontmatter',
      line: 1,
      source: 'flux-parser',
    });
  }

  return result;
}

function parseHeadings(lines: string[], frontmatter: FluxFrontmatter): FluxHeading[] {
  const headings: FluxHeading[] = [];
  const fmEnd = lines[0]?.trim() === '---'
    ? lines.findIndex((l, i) => i > 0 && l.trim() === '---') + 1
    : 0;

  for (let i = Math.max(fmEnd, 0); i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const kind = classifyHeading(text);
      const parsed = parseHeadingContent(text, kind);

      headings.push({
        level,
        text,
        line: i + 1,
        kind,
        parsedName: parsed.name,
        parsedParams: parsed.params,
        parsedReturn: parsed.returnType,
      });
    }
  }

  return headings;
}

function classifyHeading(text: string): FluxHeading['kind'] {
  const lower = text.toLowerCase().trim();
  if (lower.startsWith('fn:') || lower.startsWith('fn :')) return 'function';
  if (lower.startsWith('agent:') || lower.startsWith('agent :')) return 'agent';
  if (lower.startsWith('tile:') || lower.startsWith('tile :')) return 'tile';
  if (lower.startsWith('region:') || lower.startsWith('region :')) return 'region';
  if (lower.startsWith('import:') || lower.startsWith('import :')) return 'import';
  if (lower.startsWith('export:') || lower.startsWith('export :')) return 'export';
  return 'section';
}

function parseHeadingContent(text: string, kind: FluxHeading['kind']) {
  const result: { name?: string; params?: string; returnType?: string } = {};

  const colonIdx = text.indexOf(':');
  const afterColon = text.slice(colonIdx + 1).trim();

  switch (kind) {
    case 'function': {
      // Parse: name(params) -> returnType
      const fnMatch = afterColon.match(/^(\w+)\s*\(([^)]*)\)\s*(?:->\s*(.+))?$/);
      if (fnMatch) {
        result.name = fnMatch[1];
        result.params = fnMatch[2].trim();
        result.returnType = fnMatch[3]?.trim() || 'void';
      } else {
        // Simple name without params
        const simpleMatch = afterColon.match(/^(\w+)$/);
        if (simpleMatch) result.name = simpleMatch[1];
      }
      break;
    }
    case 'agent':
    case 'tile':
    case 'region': {
      result.name = afterColon.split(/\s+/)[0];
      break;
    }
    case 'import':
    case 'export': {
      result.name = afterColon.trim();
      break;
    }
  }

  return result;
}

function parseCodeBlocks(lines: string[]): FluxCodeBlock[] {
  const blocks: FluxCodeBlock[] = [];
  let inBlock = false;
  let blockStart = 0;
  let blockLang = '';
  let blockContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fenceMatch = line.match(/^(`{3,})\s*(\w*)\s*$/);

    if (fenceMatch && !inBlock) {
      inBlock = true;
      blockStart = i;
      blockLang = fenceMatch[2] || 'text';
      blockContent = [];
    } else if (fenceMatch && inBlock) {
      inBlock = false;
      blocks.push({
        language: blockLang,
        content: blockContent.join('\n'),
        startLine: blockStart + 1,
        endLine: i + 1,
      });
    } else if (inBlock) {
      blockContent.push(line);
    }
  }

  return blocks;
}

function parseDirectives(lines: string[]): FluxDirective[] {
  const directives: FluxDirective[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^#!(agent|tile|flux)\b\s*(.*)$/);
    if (match) {
      directives.push({
        type: match[1] as FluxDirective['type'],
        value: match[2].trim(),
        line: i + 1,
      });
    }
  }

  return directives;
}
