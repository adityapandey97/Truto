import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Editor from '@monaco-editor/react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  ChevronRight,
  ChevronDown,
  Copy,
  Download,
  Bot,
  Search,
  ArrowLeft,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import { repositoryService } from '../../services/repositoryService.js';
import { assistantService } from '../../services/assistantService.js';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { CardSkeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { DemoBanner } from '../../components/shared/DemoBanner.jsx';
import toast from 'react-hot-toast';

// Recursive File Tree Node
function FileTreeNode({ item, selectedFile, onSelectFile, level = 0 }) {
  const [isOpen, setIsOpen] = useState(true);

  if (item.type === 'directory') {
    return (
      <div>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{ paddingLeft: `${level * 14 + 8}px` }}
          className="flex items-center gap-1.5 py-1.5 px-2 rounded-md hover:bg-codepilot-surface cursor-pointer text-xs text-codepilot-muted hover:text-codepilot-text transition-colors"
        >
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-codepilot-subtle" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-codepilot-subtle" />
          )}
          {isOpen ? (
            <FolderOpen className="w-4 h-4 text-indigo-400" />
          ) : (
            <Folder className="w-4 h-4 text-indigo-400" />
          )}
          <span className="font-medium truncate">{item.name}</span>
        </div>

        {isOpen && item.children && (
          <div>
            {item.children.map((child) => (
              <FileTreeNode
                key={child.id || child.path}
                item={child}
                selectedFile={selectedFile}
                onSelectFile={onSelectFile}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isSelected = selectedFile?.path === item.path;

  const getFileIcon = (lang) => {
    if (lang === 'json') return <FileJson className="w-4 h-4 text-amber-400" />;
    if (lang === 'markdown') return <FileText className="w-4 h-4 text-blue-400" />;
    return <FileCode className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div
      onClick={() => onSelectFile(item)}
      style={{ paddingLeft: `${level * 14 + 20}px` }}
      className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer text-xs transition-colors ${
        isSelected
          ? 'bg-indigo-600/20 text-indigo-300 font-medium border-l-2 border-indigo-500'
          : 'text-codepilot-muted hover:text-codepilot-text hover:bg-codepilot-surface/60'
      }`}
    >
      {getFileIcon(item.language)}
      <span className="truncate">{item.name}</span>
    </div>
  );
}

// Helper to flatten files for quick search or first file selection
function flattenFiles(nodes) {
  let list = [];
  for (const node of nodes) {
    if (node.type === 'file') {
      list.push(node);
    } else if (node.children) {
      list = list.concat(flattenFiles(node.children));
    }
  }
  return list;
}

export function FileExplorerPage() {
  const { repositoryId } = useParams();
  const navigate = useNavigate();

  const [fileSearch, setFileSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState('');
  const [activeTab, setActiveTab] = useState('editor'); // for mobile: 'tree' | 'editor' | 'context'

  const {
    data: repo,
    isLoading: repoLoading,
    isError: repoError,
  } = useQuery({
    queryKey: ['repository-files', repositoryId],
    queryFn: () => repositoryService.getRepositoryById(repositoryId),
  });

  const files = repo?.files || [];
  const allFilesList = useMemo(() => flattenFiles(files), [files]);

  // Set initial selected file if none selected
  useMemo(() => {
    if (!selectedFile && allFilesList.length > 0) {
      setSelectedFile(allFilesList[0]);
      setEditedCode(allFilesList[0].content);
    }
  }, [allFilesList, selectedFile]);

  const handleSelectFile = (file) => {
    setSelectedFile(file);
    setEditedCode(file.content);
    setIsEditing(false);
    setActiveTab('editor');
  };

  const handleCopyCode = () => {
    if (selectedFile) {
      navigator.clipboard.writeText(editedCode || selectedFile.content);
      setCopied(true);
      toast.success('File contents copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!selectedFile) return;
    const blob = new Blob([editedCode || selectedFile.content], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${selectedFile.name}`);
  };

  const handleAskAssistant = async () => {
    if (!selectedFile) return;
    try {
      const conv = await assistantService.createConversation(
        repo.id,
        `Analyzing ${selectedFile.path}`
      );
      navigate(`/app/assistant/${conv.id}`);
    } catch {
      toast.error('Failed to start chat session');
    }
  };

  if (repoLoading) {
    return (
      <div className="space-y-4 text-left">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (repoError || !repo) {
    return (
      <ErrorState
        title="Unable to load files"
        message="Repository file hierarchy could not be retrieved."
      />
    );
  }

  const filteredFlatFiles = fileSearch
    ? allFilesList.filter((f) =>
        f.path.toLowerCase().includes(fileSearch.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-4 text-left">
      <DemoBanner message="Monaco Code Explorer: Read-only viewer active. In-memory edits are preserved locally during the demo session without committing." />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-codepilot-border">
        <div className="flex items-center gap-3">
          <Link
            to={`/app/repositories/${repo.id}`}
            className="p-1.5 rounded-lg text-codepilot-muted hover:text-codepilot-text hover:bg-codepilot-surface"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-codepilot-text">
                {repo.name}
              </h1>
              <span className="text-xs text-codepilot-subtle font-mono">
                / {selectedFile?.path || 'files'}
              </span>
            </div>
            <p className="text-[11px] text-codepilot-muted">
              Branch: <code className="text-indigo-300 font-mono">{repo.defaultBranch}</code>
            </p>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex lg:hidden items-center gap-1 bg-codepilot-surface p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('tree')}
            className={`px-3 py-1 rounded font-medium ${
              activeTab === 'tree' ? 'bg-indigo-600 text-white' : 'text-codepilot-muted'
            }`}
          >
            File Tree
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1 rounded font-medium ${
              activeTab === 'editor' ? 'bg-indigo-600 text-white' : 'text-codepilot-muted'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setActiveTab('context')}
            className={`px-3 py-1 rounded font-medium ${
              activeTab === 'context' ? 'bg-indigo-600 text-white' : 'text-codepilot-muted'
            }`}
          >
            Metadata
          </button>
        </div>

        {/* Actions */}
        <div className="hidden sm:flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={copied ? Check : Copy}
            onClick={handleCopyCode}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Download}
            onClick={handleDownload}
          >
            Download
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Bot}
            onClick={handleAskAssistant}
          >
            Ask AI
          </Button>
        </div>
      </div>

      {/* Main 3-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[680px]">
        {/* Panel 1: File Tree (Desktop: 3 cols) */}
        <div
          className={`${
            activeTab === 'tree' ? 'block' : 'hidden'
          } lg:block lg:col-span-3 bg-codepilot-panel border border-codepilot-border rounded-xl flex flex-col h-full overflow-hidden`}
        >
          <div className="p-3 border-b border-codepilot-border">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-codepilot-subtle" />
              <input
                type="text"
                placeholder="Filter files..."
                value={fileSearch}
                onChange={(e) => setFileSearch(e.target.value)}
                className="w-full bg-codepilot-surface text-xs rounded-lg pl-8 pr-3 py-1.5 border border-codepilot-border focus:outline-none focus:border-indigo-500 placeholder-codepilot-subtle text-codepilot-text"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {fileSearch ? (
              <div className="space-y-1">
                {filteredFlatFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handleSelectFile(file)}
                    className="p-1.5 rounded text-xs hover:bg-codepilot-surface cursor-pointer text-codepilot-muted hover:text-codepilot-text truncate font-mono"
                  >
                    {file.path}
                  </div>
                ))}
                {filteredFlatFiles.length === 0 && (
                  <p className="text-[11px] text-codepilot-subtle p-2 text-center">
                    No files found
                  </p>
                )}
              </div>
            ) : (
              files.map((item) => (
                <FileTreeNode
                  key={item.id || item.path}
                  item={item}
                  selectedFile={selectedFile}
                  onSelectFile={handleSelectFile}
                />
              ))
            )}
          </div>
        </div>

        {/* Panel 2: Monaco Editor (Desktop: 6 cols) */}
        <div
          className={`${
            activeTab === 'editor' ? 'block' : 'hidden'
          } lg:block lg:col-span-6 bg-[#0E111A] border border-codepilot-border rounded-xl flex flex-col h-full overflow-hidden`}
        >
          {/* Editor Header Bar */}
          <div className="h-10 bg-codepilot-panel border-b border-codepilot-border px-4 flex items-center justify-between text-xs text-codepilot-muted">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-codepilot-text font-medium">
                {selectedFile?.name || 'No file selected'}
              </span>
              {isEditing && (
                <span className="text-[10px] text-amber-400 font-sans">
                  (unsaved local buffer)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                  isEditing
                    ? 'border-amber-500 text-amber-400 bg-amber-950/30'
                    : 'border-codepilot-border text-codepilot-muted hover:text-codepilot-text'
                }`}
              >
                {isEditing ? 'Editing (Local)' : 'Read-Only'}
              </button>
            </div>
          </div>

          {/* Monaco Editor Canvas */}
          <div className="flex-1 w-full h-full relative">
            {selectedFile ? (
              <Editor
                height="100%"
                theme="vs-dark"
                language={
                  selectedFile.language === 'javascript'
                    ? 'javascript'
                    : selectedFile.language === 'json'
                    ? 'json'
                    : selectedFile.language === 'markdown'
                    ? 'markdown'
                    : 'plaintext'
                }
                value={editedCode || selectedFile.content}
                onChange={(value) => setEditedCode(value || '')}
                options={{
                  readOnly: !isEditing,
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  renderLineHighlight: 'all',
                  fontFamily: '"JetBrains Mono", Fira Code, monospace',
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-codepilot-subtle">
                Select a file from the repository tree
              </div>
            )}
          </div>
        </div>

        {/* Panel 3: File Details & AI Context Panel (Desktop: 3 cols) */}
        <div
          className={`${
            activeTab === 'context' ? 'block' : 'hidden'
          } lg:block lg:col-span-3 bg-codepilot-panel border border-codepilot-border rounded-xl flex flex-col h-full overflow-y-auto p-4 space-y-4`}
        >
          <div>
            <h3 className="text-xs font-semibold text-codepilot-text uppercase tracking-wider mb-2">
              File Metadata
            </h3>
            <div className="bg-codepilot-surface/60 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-codepilot-muted">Path</span>
                <span className="font-mono text-codepilot-text truncate max-w-[140px]">
                  {selectedFile?.path || '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-codepilot-muted">Language</span>
                <span className="capitalize text-codepilot-text">
                  {selectedFile?.language || '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-codepilot-muted">Size</span>
                <span className="text-codepilot-text">{selectedFile?.size || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-codepilot-muted">Lines</span>
                <span className="text-codepilot-text font-mono">
                  {selectedFile ? (selectedFile.content || '').split('\n').length : 0}
                </span>
              </div>
            </div>
          </div>

          {/* AI Quick Analysis Actions */}
          <div className="pt-2 border-t border-codepilot-border">
            <h4 className="text-xs font-semibold text-codepilot-text uppercase tracking-wider mb-2">
              AI Context Actions
            </h4>
            <div className="space-y-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start text-xs"
                icon={Sparkles}
                onClick={handleAskAssistant}
              >
                Explain this file
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start text-xs"
                icon={Bot}
                onClick={handleAskAssistant}
              >
                Find security issues
              </Button>
            </div>
          </div>

          {/* Indexing status badge */}
          <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200">
            <p className="font-semibold text-indigo-300">Semantic Index: Valid</p>
            <p className="text-[11px] text-indigo-300/80 mt-1">
              File is indexed in the AST symbol table. Available for contextual retrieval in AI conversations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
