'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Toolbar, FileExplorer, TabBar, CodeEditor, RightPanel, BottomPanel,
  TemplateModal, WelcomeScreen, StatusBar,
} from '@/components/ide/IDEComponents';
import type { FluxFile, RightTab, BottomTab } from '@/components/ide/IDEComponents';
import { compileFluxToFIR, firToString, bytecodeToString, generateBytecode } from '@/lib/flux-compiler';
import { parseFluxFile } from '@/lib/flux-parser';
import { compileAndRun, formatVMState } from '@/lib/vm-simulator';
import {
  createDefaultProject, saveProject, loadProject,
  createFile, renameFile, duplicateFile,
} from '@/lib/project-store';
import type { FluxProject } from '@/types/flux';

export default function FluxIDEPage() {
  // ---- State ----
  const [project, setProject] = useState<FluxProject | null>(null);
  const [openFileIds, setOpenFileIds] = useState<string[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  // Right panel
  const [rightTab, setRightTab] = useState<RightTab>('fir');
  const [rightPanelVisible, setRightPanelVisible] = useState(true);
  const [firOutput, setFirOutput] = useState('');
  const [bytecodeOutput, setBytecodeOutput] = useState('');
  const [vmOutput, setVmOutput] = useState('');
  const [agentList, setAgentList] = useState<{ name: string; type: string; methods: string[] }[]>([]);

  // Bottom panel
  const [bottomTab, setBottomTab] = useState<BottomTab>('output');
  const [bottomPanelVisible, setBottomPanelVisible] = useState(true);
  const [outputContent, setOutputContent] = useState('');
  const [problemsContent, setProblemsContent] = useState('');
  const [terminalContent, setTerminalContent] = useState('FLUX Terminal v1.0\n');

  // Cursor position
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // ---- Initialization ----
  useEffect(() => {
    const loaded = loadProject();
    if (loaded) {
      setProject(loaded);
      if (loaded.files.length > 0) {
        setOpenFileIds([loaded.files[0].id]);
        setActiveFileId(loaded.files[0].id);
      }
    } else {
      const defaultProject = createDefaultProject();
      setProject(defaultProject);
      saveProject(defaultProject);
      if (defaultProject.files.length > 0) {
        setOpenFileIds([defaultProject.files[0].id]);
        setActiveFileId(defaultProject.files[0].id);
      }
    }
  }, []);

  // Auto-save on project change
  useEffect(() => {
    if (project) {
      const timer = setTimeout(() => saveProject(project), 1000);
      return () => clearTimeout(timer);
    }
  }, [project]);

  // ---- Computed values ----
  const activeFile = project?.files.find(f => f.id === activeFileId) || null;
  const openFiles = project?.files.filter(f => openFileIds.includes(f.id)) || [];

  // ---- File operations ----
  const handleCreateFile = useCallback(() => {
    if (!project) return;
    const count = project.files.length + 1;
    const newFile = createFile(`untitled-${count}.flux.md`, `---
title: Untitled ${count}
version: 1.0
---

# Untitled ${count}

## fn: main() -> i32

\`\`\`c
int main() {
    return 0;
}
\`\`\`
`);
    const updatedProject = { ...project, files: [...project.files, newFile], updatedAt: Date.now() };
    setProject(updatedProject);
    setOpenFileIds(prev => [...prev, newFile.id]);
    setActiveFileId(newFile.id);
  }, [project]);

  const handleSelectFile = useCallback((id: string) => {
    if (!openFileIds.includes(id)) {
      setOpenFileIds(prev => [...prev, id]);
    }
    setActiveFileId(id);
  }, [openFileIds]);

  const handleDeleteFile = useCallback((id: string) => {
    if (!project) return;
    const updatedFiles = project.files.filter(f => f.id !== id);
    const updatedProject = { ...project, files: updatedFiles, updatedAt: Date.now() };
    setProject(updatedProject);
    setOpenFileIds(prev => prev.filter(fid => fid !== id));
    if (activeFileId === id) {
      const remaining = updatedFiles.length > 0 ? updatedFiles[0].id : null;
      setActiveFileId(remaining);
      if (remaining && !openFileIds.includes(remaining)) {
        setOpenFileIds(prev => [...prev, remaining]);
      }
    }
  }, [project, activeFileId, openFileIds]);

  const handleRenameFile = useCallback((id: string, newName: string) => {
    if (!project) return;
    const updatedFiles = project.files.map(f => f.id === id ? renameFile(f, newName) : f);
    setProject({ ...project, files: updatedFiles, updatedAt: Date.now() });
  }, [project]);

  const handleDuplicateFile = useCallback((id: string) => {
    if (!project) return;
    const file = project.files.find(f => f.id === id);
    if (!file) return;
    const dup = duplicateFile(file);
    const updatedProject = { ...project, files: [...project.files, dup], updatedAt: Date.now() };
    setProject(updatedProject);
    setOpenFileIds(prev => [...prev, dup.id]);
    setActiveFileId(dup.id);
  }, [project]);

  const handleCloseTab = useCallback((id: string) => {
    setOpenFileIds(prev => {
      const next = prev.filter(fid => fid !== id);
      if (activeFileId === id) {
        const newActive = next.length > 0 ? next[next.length - 1] : null;
        setActiveFileId(newActive);
      }
      return next;
    });
  }, [activeFileId]);

  const handleContentChange = useCallback((value: string) => {
    if (!project || !activeFileId) return;
    const updatedFiles = project.files.map(f =>
      f.id === activeFileId ? { ...f, content: value, isDirty: true } : f
    );
    setProject({ ...project, files: updatedFiles, updatedAt: Date.now() });
  }, [project, activeFileId]);

  // ---- Template ----
  const handleSelectTemplate = useCallback((content: string, name: string) => {
    if (!project) return;
    const newFile = createFile(name, content);
    const updatedProject = { ...project, files: [...project.files, newFile], updatedAt: Date.now() };
    setProject(updatedProject);
    setOpenFileIds(prev => [...prev, newFile.id]);
    setActiveFileId(newFile.id);
  }, [project]);

  // ---- Compile & Run ----
  const handleCompile = useCallback(() => {
    if (!activeFile) return;

    const { fir, parsed } = compileFluxToFIR(activeFile.content);
    const firStr = firToString(fir);
    const bytecode = generateBytecode(fir);
    const bytecodeStr = bytecodeToString(bytecode);

    setFirOutput(firStr);
    setBytecodeOutput(bytecodeStr);
    setVmOutput('');
    setRightTab('fir');
    setRightPanelVisible(true);

    // Problems
    if (parsed.diagnostics.length > 0) {
      const problems = parsed.diagnostics.map(d =>
        `[${d.severity.toUpperCase()}] Line ${d.line}: ${d.message}`
      ).join('\n');
      setProblemsContent(problems);
      setBottomTab('problems');
      setBottomPanelVisible(true);
    } else {
      setProblemsContent('✓ No problems detected.\n\nModule: ' + fir.name + '\nFunctions: ' + fir.functions.map(f => f.name).join(', ') + '\nAgents: ' + fir.agents.map(a => a.name).join(', ') || 'none');
    }

    // Agents
    setAgentList(fir.agents.map(a => ({
      name: a.name,
      type: 'agent',
      methods: a.methods.map(m => m.name),
    })));

    setTerminalContent(prev => prev + `\n[FLUX] Compiled ${activeFile.name} — ${fir.functions.length} functions, ${fir.agents.length} agents\n`);
    setOutputContent(`[FLUX Compiler] Compiled "${activeFile.name}"\nModule: ${fir.name}\nVersion: ${fir.version}\nFunctions: ${fir.functions.length}\nAgents: ${fir.agents.length}\nRegions: ${fir.regions.length}\n`);
  }, [activeFile]);

  const handleRun = useCallback(() => {
    if (!activeFile) return;

    // First compile
    const { fir, parsed } = compileFluxToFIR(activeFile.content);
    const firStr = firToString(fir);
    const bytecode = generateBytecode(fir);
    const bytecodeStr = bytecodeToString(bytecode);

    setFirOutput(firStr);
    setBytecodeOutput(bytecodeStr);

    // Update agents
    setAgentList(fir.agents.map(a => ({
      name: a.name,
      type: 'agent',
      methods: a.methods.map(m => m.name),
    })));

    // Then run VM
    const vmState = compileAndRun(fir);
    const vmStr = formatVMState(vmState);

    setVmOutput(vmStr);
    setRightTab('vm');
    setRightPanelVisible(true);

    // Output
    const outputLines = vmState.output.join('\n');
    setOutputContent(outputLines);

    // Problems
    if (vmState.errors.length > 0) {
      setProblemsContent(vmState.errors.join('\n'));
    } else {
      setProblemsContent('✓ Execution completed successfully.\n\nReturn value: ' + vmState.registers[0] + '\nCycles: ' + vmState.cycles);
    }

    // Bottom panel
    setBottomTab('output');
    setBottomPanelVisible(true);

    setTerminalContent(prev => prev + `[FLUX] Ran ${activeFile.name} — ${vmState.cycles} cycles, result: ${vmState.registers[0]}\n`);
  }, [activeFile]);

  // ---- Export / Import ----
  const handleExport = useCallback(() => {
    if (!project) return;
    // Create a simple text export
    let content = '';
    for (const file of project.files) {
      content += `=== ${file.name} ===\n${file.content}\n\n`;
    }
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}.flux-bundle.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [project]);

  const handleImport = useCallback(() => {
    // Triggered by file input — handled in Toolbar
  }, []);

  const handleSave = useCallback(() => {
    if (project) {
      saveProject(project);
      setTerminalContent(prev => prev + `[FLUX] Project saved.\n`);
    }
  }, [project]);

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        handleCompile();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave, handleRun, handleCompile]);

  // ---- Render ----
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Toolbar */}
      <Toolbar
        onNewFile={handleCreateFile}
        onRun={handleRun}
        onCompile={handleCompile}
        onOpenTemplates={() => setTemplateModalOpen(true)}
        onSave={handleSave}
        onExport={handleExport}
        onImport={handleImport}
        projectName={project?.name || 'FLUX Project'}
      />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer */}
        <FileExplorer
          files={project?.files || []}
          activeFileId={activeFileId}
          onSelectFile={handleSelectFile}
          onCreateFile={handleCreateFile}
          onDeleteFile={handleDeleteFile}
          onRenameFile={handleRenameFile}
          onDuplicateFile={handleDuplicateFile}
          onOpenTemplates={() => setTemplateModalOpen(true)}
        />

        {/* Center area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {openFiles.length > 0 ? (
            <>
              <TabBar
                files={openFiles}
                activeFileId={activeFileId}
                onSelectTab={handleSelectFile}
                onCloseTab={handleCloseTab}
              />

              <div className="flex flex-1 overflow-hidden">
                {/* Editor */}
                <div className="flex-1 overflow-hidden flex flex-col min-w-0">
                  {activeFile ? (
                    <>
                      {/* Breadcrumb */}
                      <div className="flex items-center h-7 px-3 text-xs shrink-0" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-light)' }}>
                        <span>{activeFile.name}</span>
                        <span className="mx-1.5">›</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {(() => {
                            const parsed = parseFluxFile(activeFile.content);
                            const fns = parsed.headings.filter(h => h.kind === 'function').length;
                            const ags = parsed.headings.filter(h => h.kind === 'agent').length;
                            return `${fns} function${fns !== 1 ? 's' : ''}, ${ags} agent${ags !== 1 ? 's' : ''}`;
                          })()}
                        </span>
                      </div>
                      <CodeEditor
                        value={activeFile.content}
                        onChange={handleContentChange}
                        path={activeFile.path}
                      />
                    </>
                  ) : (
                    <WelcomeScreen onCreateFile={handleCreateFile} onOpenTemplates={() => setTemplateModalOpen(true)} />
                  )}
                </div>

                {/* Right Panel */}
                <RightPanel
                  firOutput={firOutput}
                  bytecodeOutput={bytecodeOutput}
                  vmOutput={vmOutput}
                  agents={agentList}
                  activeTab={rightTab}
                  onTabChange={setRightTab}
                  visible={rightPanelVisible}
                  onToggle={() => setRightPanelVisible(!rightPanelVisible)}
                />
              </div>
            </>
          ) : (
            <WelcomeScreen onCreateFile={handleCreateFile} onOpenTemplates={() => setTemplateModalOpen(true)} />
          )}

          {/* Bottom Panel */}
          <BottomPanel
            output={outputContent}
            problems={problemsContent}
            terminal={terminalContent}
            activeTab={bottomTab}
            onTabChange={setBottomTab}
            visible={bottomPanelVisible}
            onToggle={() => setBottomPanelVisible(!bottomPanelVisible)}
          />
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        fileName={activeFile?.name || ''}
        cursorPos={cursorPos}
        activeFile={activeFile}
      />

      {/* Template Modal */}
      <TemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}
