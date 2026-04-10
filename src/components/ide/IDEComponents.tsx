'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  FilePlus, Play, Settings, BookOpen, ChevronDown,
  Zap, Save, Download, Upload, X, Search, Star,
  FolderOpen, File, Trash2, Copy, Edit3
} from 'lucide-react';
import { templateCategories, searchTemplates, getTemplatesByCategory, fluxTemplates } from '@/lib/templates';
import type { FluxTemplate } from '@/types/flux';

// ============= TYPES =============
interface FluxFile {
  id: string;
  name: string;
  path: string;
  content: string;
  isDirty: boolean;
}

type RightTab = 'fir' | 'bytecode' | 'vm' | 'agents';
type BottomTab = 'output' | 'problems' | 'terminal';

interface ToolbarProps {
  onNewFile: () => void;
  onRun: () => void;
  onCompile: () => void;
  onOpenTemplates: () => void;
  onSave: () => void;
  onExport: () => void;
  onImport: () => void;
  projectName: string;
}

// ============= TOOLBAR =============
function Toolbar({ onNewFile, onRun, onCompile, onOpenTemplates, onSave, onExport, onImport, projectName }: ToolbarProps) {
  const [templateOpen, setTemplateOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onImport();
      e.target.value = '';
    }
  };

  return (
    <header className="flex items-center h-10 px-3 gap-1 shrink-0" style={{ background: 'var(--bg-toolbar)', borderBottom: '1px solid var(--border)' }}>
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'var(--accent)' }}>
          <Zap size={14} className="text-white" />
        </div>
        <span className="text-sm font-bold tracking-wide" style={{ color: 'var(--text-bright)' }}>FLUX IDE</span>
        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>v1.0</span>
      </div>

      {/* Separator */}
      <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

      {/* File actions */}
      <ToolbarButton icon={<FilePlus size={15} />} label="New File" onClick={onNewFile} />
      <ToolbarButton icon={<Save size={15} />} label="Save" onClick={onSave} />

      {/* Separator */}
      <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

      {/* Run/Compile */}
      <button
        onClick={onRun}
        className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium text-white transition-colors"
        style={{ background: '#2ea043' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#3fb950')}
        onMouseLeave={e => (e.currentTarget.style.background = '#2ea043')}
      >
        <Play size={13} fill="white" />
        Run
      </button>

      <ToolbarButton icon={<Settings size={15} />} label="Compile Only" onClick={onCompile} accent />

      {/* Separator */}
      <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

      {/* Templates */}
      <div className="relative">
        <ToolbarButton icon={<BookOpen size={15} />} label="Templates" onClick={() => setTemplateOpen(!templateOpen)} />
      </div>

      <ToolbarButton icon={<Download size={15} />} label="Export" onClick={onExport} />
      <ToolbarButton icon={<Upload size={15} />} label="Import" onClick={handleImportClick} />
      <input ref={fileInputRef} type="file" accept=".flux.md,.md" multiple className="hidden" onChange={handleFileChange} />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Project name */}
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs" style={{ color: 'var(--text-secondary)' }}>
        <FolderOpen size={12} />
        {projectName}
      </div>

      {/* GitHub link */}
      <a
        href="https://github.com/SuperInstance/flux-ide"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
        style={{ color: 'var(--text-secondary)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
      >
        <Star size={13} />
      </a>
    </header>
  );
}

function ToolbarButton({ icon, label, onClick, accent }: { icon: React.ReactNode; label: string; onClick: () => void; accent?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors"
      style={{ color: accent ? 'var(--text-accent)' : 'var(--text-secondary)' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ============= FILE EXPLORER =============
interface FileExplorerProps {
  files: FluxFile[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onCreateFile: () => void;
  onDeleteFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
  onDuplicateFile: (id: string) => void;
  onOpenTemplates: () => void;
}

function FileExplorer({ files, activeFileId, onSelectFile, onCreateFile, onDeleteFile, onRenameFile, onDuplicateFile, onOpenTemplates }: FileExplorerProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; fileId: string } | null>(null);

  const startRename = useCallback((file: FluxFile) => {
    setRenamingId(file.id);
    setRenameValue(file.name);
    setContextMenu(null);
  }, []);

  const finishRename = useCallback(() => {
    if (renamingId && renameValue.trim().endsWith('.flux.md')) {
      onRenameFile(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  }, [renamingId, renameValue, onRenameFile]);

  const handleContextMenu = useCallback((e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, fileId });
  }, []);

  return (
    <aside
      className="flex flex-col shrink-0 overflow-hidden"
      style={{ width: '220px', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-9 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          Explorer
        </span>
        <div className="flex gap-0.5">
          <button
            onClick={onCreateFile}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            title="New File"
          >
            <FilePlus size={14} />
          </button>
          <button
            onClick={onOpenTemplates}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            title="Templates"
          >
            <BookOpen size={14} />
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto py-1">
        <div className="px-2 mb-1">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <FolderOpen size={12} />
            project
          </div>
        </div>

        {files.map(file => (
          <div
            key={file.id}
            className={`group flex items-center gap-1.5 mx-1 px-2 py-1 rounded cursor-pointer text-sm transition-colors ${
              activeFileId === file.id ? '' : ''
            }`}
            style={{
              background: activeFileId === file.id ? 'var(--bg-list-active)' : 'transparent',
              color: activeFileId === file.id ? 'var(--text-bright)' : 'var(--text-primary)',
            }}
            onClick={() => onSelectFile(file.id)}
            onContextMenu={e => handleContextMenu(e, file.id)}
            onMouseEnter={e => { if (activeFileId !== file.id) e.currentTarget.style.background = 'var(--bg-list-hover)'; }}
            onMouseLeave={e => { if (activeFileId !== file.id) e.currentTarget.style.background = 'transparent'; }}
          >
            {renamingId === file.id ? (
              <input
                autoFocus
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onBlur={finishRename}
                onKeyDown={e => { if (e.key === 'Enter') finishRename(); if (e.key === 'Escape') setRenamingId(null); }}
                className="flex-1 text-xs px-1 py-0.5 rounded border outline-none"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--accent)', color: 'var(--text-bright)' }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <>
                <File size={13} style={{ color: 'var(--keyword)', flexShrink: 0 }} />
                <span className="flex-1 truncate">{file.name}</span>
                {file.isDirty && (
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--text-secondary)' }} />
                )}
              </>
            )}
          </div>
        ))}

        {files.length === 0 && (
          <div className="px-4 py-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            No files yet.<br />Click + to create one.
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <div
            className="fixed z-50 py-1 rounded-md shadow-xl animate-fade-in"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              background: 'var(--bg-dropdown)',
              border: '1px solid var(--border)',
              minWidth: '160px',
            }}
          >
            <ContextMenuItem icon={<Edit3 size={13} />} label="Rename" onClick={() => {
              const file = files.find(f => f.id === contextMenu.fileId);
              if (file) startRename(file);
            }} />
            <ContextMenuItem icon={<Copy size={13} />} label="Duplicate" onClick={() => { onDuplicateFile(contextMenu.fileId); setContextMenu(null); }} />
            <div className="mx-2 my-1" style={{ borderTop: '1px solid var(--border)' }} />
            <ContextMenuItem icon={<Trash2 size={13} />} label="Delete" danger onClick={() => { onDeleteFile(contextMenu.fileId); setContextMenu(null); }} />
          </div>
        </>
      )}
    </aside>
  );
}

function ContextMenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full px-3 py-1.5 text-xs transition-colors"
      style={{ color: danger ? 'var(--text-error)' : 'var(--text-primary)' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-list-hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {icon}
      {label}
    </button>
  );
}

// ============= TAB BAR =============
interface TabBarProps {
  files: FluxFile[];
  activeFileId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
}

function TabBar({ files, activeFileId, onSelectTab, onCloseTab }: TabBarProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex items-center h-9 overflow-x-auto shrink-0" style={{ background: 'var(--bg-tab)', borderBottom: '1px solid var(--border)' }}>
      {files.map(file => (
        <div
          key={file.id}
          className={`group flex items-center gap-1.5 px-3 h-full cursor-pointer text-xs border-r transition-colors ${
            activeFileId === file.id ? '' : 'border-transparent'
          }`}
          style={{
            background: activeFileId === file.id ? 'var(--bg-tab-active)' : 'transparent',
            color: activeFileId === file.id ? 'var(--text-bright)' : 'var(--text-secondary)',
            borderRightColor: activeFileId === file.id ? 'var(--border)' : 'transparent',
            borderTop: activeFileId === file.id ? '2px solid var(--accent)' : '2px solid transparent',
          }}
          onClick={() => onSelectTab(file.id)}
        >
          <File size={12} />
          <span className="max-w-[120px] truncate">{file.name}</span>
          {file.isDirty && <span className="w-2 h-2 rounded-full" style={{ background: 'var(--text-secondary)' }} />}
          <button
            onClick={e => { e.stopPropagation(); onCloseTab(file.id); }}
            className="p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-bright)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ============= CODE EDITOR =============
interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  path?: string;
}

function CodeEditor({ value, onChange, path }: CodeEditorProps) {
  // Since Monaco needs to be dynamically imported, we'll create a textarea fallback
  // and a Monaco wrapper that loads asynchronously
  const [editorType, setEditorType] = useState<'loading' | 'monaco' | 'textarea'>('loading');
  const monacoRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let mounted = true;
    // Try to load Monaco
    import('@monaco-editor/react').then(mod => {
      if (!mounted) return;
      setEditorType('monaco');
    }).catch(() => {
      if (mounted) setEditorType('textarea');
    });
    // Timeout fallback
    const timer = setTimeout(() => {
      if (mounted && editorType === 'loading') setEditorType('textarea');
    }, 5000);
    return () => { mounted = false; clearTimeout(timer); };
  }, []);

  if (editorType === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }} />
          Loading editor...
        </div>
      </div>
    );
  }

  if (editorType === 'monaco') {
    return <MonacoEditorWrapper value={value} onChange={onChange} path={path} />;
  }

  // Fallback textarea editor
  return (
    <div className="flex-1 overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-full p-4 font-mono text-sm outline-none resize-none"
        style={{
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          caretColor: 'var(--accent)',
          lineHeight: '1.6',
          tabSize: 4,
        }}
        spellCheck={false}
        placeholder="Start writing your FLUX program..."
      />
    </div>
  );
}

// Monaco wrapper - dynamically imported
function MonacoEditorWrapper({ value, onChange, path }: CodeEditorProps) {
  const MonacoEditor = React.useMemo(() => {
    try { return require('@monaco-editor/react').default; }
    catch { return null; }
  }, []);

  if (!MonacoEditor) {
    return (
      <div className="flex-1 overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full h-full p-4 font-mono text-sm outline-none resize-none"
          style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', caretColor: 'var(--accent)', lineHeight: '1.6', tabSize: 4 }}
          spellCheck={false}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <MonacoEditor
        height="100%"
        language="markdown"
        theme="vs-dark"
        value={value}
        onChange={(v: string | undefined) => onChange(v || '')}
        path={path}
        options={{
          fontSize: 13,
          fontFamily: "'Geist Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontLigatures: true,
          lineHeight: 1.6,
          minimap: { enabled: true, scale: 1, showSlider: 'mouseover' },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true },
          padding: { top: 12, bottom: 12 },
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: false,
          parameterHints: { enabled: false },
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
      />
    </div>
  );
}

// ============= RIGHT PANEL =============
interface RightPanelProps {
  firOutput: string;
  bytecodeOutput: string;
  vmOutput: string;
  agents: { name: string; type: string; methods: string[] }[];
  activeTab: RightTab;
  onTabChange: (tab: RightTab) => void;
  visible: boolean;
  onToggle: () => void;
}

function RightPanel({ firOutput, bytecodeOutput, vmOutput, agents, activeTab, onTabChange, visible, onToggle }: RightPanelProps) {
  if (!visible) {
    return (
      <div className="flex flex-col items-center py-2 shrink-0" style={{ width: '28px', background: 'var(--bg-sidebar)', borderLeft: '1px solid var(--border)' }}>
        <PanelToggleIcon direction="right" onClick={onToggle} active={false} />
      </div>
    );
  }

  return (
    <div className="flex flex-col shrink-0 overflow-hidden" style={{ width: '360px', borderLeft: '1px solid var(--border)' }}>
      {/* Tabs */}
      <div className="flex items-center h-9 shrink-0" style={{ background: 'var(--bg-tab)', borderBottom: '1px solid var(--border)' }}>
        <RightTabBtn label="FIR" active={activeTab === 'fir'} onClick={() => onTabChange('fir')} />
        <RightTabBtn label="Bytecode" active={activeTab === 'bytecode'} onClick={() => onTabChange('bytecode')} />
        <RightTabBtn label="VM State" active={activeTab === 'vm'} onClick={() => onTabChange('vm')} />
        <RightTabBtn label="Agents" active={activeTab === 'agents'} onClick={() => onTabChange('agents')} />
        <div className="flex-1" />
        <button onClick={onToggle} className="px-2 py-1 transition-colors" style={{ color: 'var(--text-secondary)' }}>
          <PanelToggleIcon direction="right" onClick={onToggle} active={true} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto" style={{ background: 'var(--bg-primary)' }}>
        {activeTab === 'fir' && (
          <pre className="p-3 text-xs font-mono leading-relaxed" style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {firOutput || '// Compile a file to see FIR output'}
          </pre>
        )}
        {activeTab === 'bytecode' && (
          <pre className="p-3 text-xs font-mono leading-relaxed" style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {bytecodeOutput || '// Compile a file to see bytecode'}
          </pre>
        )}
        {activeTab === 'vm' && (
          <pre className="p-3 text-xs font-mono leading-relaxed" style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {vmOutput || '// Run a file to see VM state'}
          </pre>
        )}
        {activeTab === 'agents' && (
          <div className="p-3">
            {agents.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>// No agents defined in current file</p>
            ) : (
              agents.map(agent => (
                <div key={agent.name} className="mb-3 p-3 rounded" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#c586c0' }} />
                    <span className="text-xs font-bold" style={{ color: 'var(--text-bright)' }}>{agent.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>agent</span>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {agent.methods.length > 0 && (
                      <div className="mt-1">
                        <span style={{ color: 'var(--text-muted)' }}>methods: </span>
                        {agent.methods.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RightTabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 h-full text-xs font-medium transition-colors"
      style={{
        color: active ? 'var(--text-bright)' : 'var(--text-secondary)',
        borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      {label}
    </button>
  );
}

function PanelToggleIcon({ direction, onClick, active }: { direction: 'right' | 'bottom'; onClick: () => void; active: boolean }) {
  return (
    <button onClick={onClick} className="p-0.5 rounded transition-colors" style={{ color: 'var(--text-secondary)' }}>
      {active ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      )}
    </button>
  );
}

// ============= BOTTOM PANEL =============
interface BottomPanelProps {
  output: string;
  problems: string;
  terminal: string;
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
  visible: boolean;
  onToggle: () => void;
}

function BottomPanel({ output, problems, terminal, activeTab, onTabChange, visible, onToggle }: BottomPanelProps) {
  if (!visible) return null;

  return (
    <div className="flex flex-col shrink-0 overflow-hidden" style={{ height: '200px', borderTop: '1px solid var(--border)' }}>
      {/* Tabs */}
      <div className="flex items-center h-8 shrink-0" style={{ background: 'var(--bg-tab)', borderBottom: '1px solid var(--border)' }}>
        <BottomTabBtn label="Output" active={activeTab === 'output'} onClick={() => onTabChange('output')} />
        <BottomTabBtn label="Problems" active={activeTab === 'problems'} onClick={() => onTabChange('problems')} />
        <BottomTabBtn label="Terminal" active={activeTab === 'terminal'} onClick={() => onTabChange('terminal')} />
        <div className="flex-1" />
        <button onClick={onToggle} className="px-2 py-0.5 transition-colors" style={{ color: 'var(--text-secondary)' }}>
          <X size={13} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-2" style={{ background: 'var(--bg-panel)' }}>
        {activeTab === 'output' && (
          <pre className="text-xs font-mono" style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {output || 'Run a program to see output...'}
          </pre>
        )}
        {activeTab === 'problems' && (
          <pre className="text-xs font-mono" style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {problems || 'No problems detected.'}
          </pre>
        )}
        {activeTab === 'terminal' && (
          <pre className="text-xs font-mono" style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {terminal || 'FLUX Terminal v1.0\nType commands here...'}
          </pre>
        )}
      </div>
    </div>
  );
}

function BottomTabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 h-full text-xs font-medium transition-colors"
      style={{
        color: active ? 'var(--text-bright)' : 'var(--text-secondary)',
        borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      {label}
    </button>
  );
}

// ============= TEMPLATE MODAL =============
interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (content: string, name: string) => void;
}

function TemplateModal({ isOpen, onClose, onSelectTemplate }: TemplateModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredTemplates = searchQuery
    ? searchTemplates(searchQuery)
    : selectedCategory === 'all'
      ? fluxTemplates
      : getTemplatesByCategory(selectedCategory as any);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[80vh] rounded-lg shadow-2xl modal-content flex flex-col overflow-hidden"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-bright)' }}>FLUX Templates</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {fluxTemplates.length} templates available across {templateCategories.length} categories
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-9 pr-3 py-2 rounded text-sm outline-none"
              style={{ background: 'var(--bg-input)', color: 'var(--text-bright)', border: '1px solid var(--border)' }}
            />
          </div>
          {/* Category pills */}
          <div className="flex gap-1.5 mt-2 flex-wrap">
            <CategoryPill label="All" active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')} />
            {templateCategories.map(cat => (
              <CategoryPill
                key={cat.id}
                label={`${cat.icon} ${cat.name}`}
                active={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
              />
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => { onSelectTemplate(template.content, template.name.toLowerCase().replace(/\s+/g, '-') + '.flux.md'); onClose(); }}
                className="text-left p-3 rounded-lg transition-all"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.background = 'var(--bg-hover)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-bright)' }}>{template.name}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{template.description}</p>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {template.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
              <p className="text-sm">No templates match your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
      style={{
        background: active ? 'var(--accent-subtle)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      }}
    >
      {label}
    </button>
  );
}

// ============= WELCOME SCREEN =============
function WelcomeScreen({ onCreateFile, onOpenTemplates }: { onCreateFile: () => void; onOpenTemplates: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--accent-subtle)' }}>
          <Zap size={32} style={{ color: 'var(--accent)' }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-bright)' }}>Welcome to FLUX IDE</h1>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Fluid Language Universal eXecution — a markdown-to-bytecode system with agent-native A2A primitives.
        </p>

        <div className="flex flex-col gap-2 items-center">
          <button
            onClick={onCreateFile}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: 'var(--accent)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
          >
            <FilePlus size={16} />
            Create New File
          </button>
          <button
            onClick={onOpenTemplates}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ color: 'var(--accent)', border: '1px solid var(--accent)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-subtle)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <BookOpen size={16} />
            Browse Templates
          </button>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-4 text-left">
          <div className="p-3 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-bright)' }}>.flux.md</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Structured markdown files compiled to bytecode</div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-bright)' }}>64-Reg VM</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Virtual machine with SSA IR and bytecode</div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-bright)' }}>A2A Native</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Agent-to-agent communication primitives</div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span><strong style={{ color: 'var(--keyword)' }}>fn</strong> Functions</span>
          <span>•</span>
          <span><strong style={{ color: 'var(--directive)' }}>agent</strong> Agents</span>
          <span>•</span>
          <span><strong style={{ color: 'var(--type)' }}>tile</strong> Tiles</span>
          <span>•</span>
          <span><strong style={{ color: 'var(--a2a-op)' }}>TELL/ASK</strong> A2A</span>
        </div>
      </div>
    </div>
  );
}

// ============= STATUS BAR =============
function StatusBar({ fileName, cursorPos, activeFile }: { fileName: string; cursorPos: { line: number; col: number }; activeFile: FluxFile | null }) {
  return (
    <footer className="flex items-center h-6 px-3 shrink-0 text-xs" style={{ background: 'var(--bg-statusbar)', color: 'white' }}>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <Zap size={10} />
          FLUX
        </span>
        <span>{fileName || 'No file open'}</span>
        {activeFile?.isDirty && <span className="px-1 py-0 rounded text-xs bg-white/20">Modified</span>}
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
        <span>Spaces: 4</span>
        <span>UTF-8</span>
        <span>FLUX</span>
      </div>
    </footer>
  );
}

// Export everything
export {
  Toolbar,
  FileExplorer,
  TabBar,
  CodeEditor,
  RightPanel,
  BottomPanel,
  TemplateModal,
  WelcomeScreen,
  StatusBar,
};

export type { FluxFile, RightTab, BottomTab };
