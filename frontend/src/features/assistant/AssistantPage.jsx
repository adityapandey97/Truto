import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Bot,
  Plus,
  Send,
  Trash2,
  Edit2,
  Sparkles,
  Paperclip,
  FolderGit2,
  CornerDownLeft,
  Search,
  Clock,
  Check,
  Code2,
  FileCode,
  X,
  ChevronRight,
} from 'lucide-react';
import { assistantService } from '../../services/assistantService.js';
import { repositoryService } from '../../services/repositoryService.js';
import { suggestedPrompts } from '../../data/conversations.js';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { CodeBlock } from '../../components/shared/CodeBlock.jsx';
import { DemoBanner } from '../../components/shared/DemoBanner.jsx';
import toast from 'react-hot-toast';

// Markdown-like message renderer supporting code blocks and quotes
function MessageRenderer({ content }) {
  // Split message by code block fences ```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-codepilot-text text-left">
      {parts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const firstLine = lines[0].trim();
          const language = firstLine.match(/^[a-zA-Z0-9_-]+$/) ? firstLine : 'javascript';
          const code = firstLine.match(/^[a-zA-Z0-9_-]+$/)
            ? lines.slice(1).join('\n')
            : lines.join('\n');

          return (
            <CodeBlock
              key={idx}
              code={code}
              language={language}
              showLineNumbers={true}
            />
          );
        }

        // Paragraphs & lines
        return (
          <div key={idx} className="space-y-1">
            {part.split('\n\n').map((paragraph, pIdx) => {
              if (paragraph.startsWith('> ')) {
                return (
                  <blockquote
                    key={pIdx}
                    className="border-l-2 border-indigo-500 pl-3 py-1 my-2 italic text-indigo-300 bg-indigo-950/20 rounded-r"
                  >
                    {paragraph.replace('> ', '')}
                  </blockquote>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h4 key={pIdx} className="font-bold text-sm text-white pt-1">
                    {paragraph.replace('### ', '')}
                  </h4>
                );
              }
              if (paragraph.startsWith('#### ')) {
                return (
                  <h5 key={pIdx} className="font-semibold text-xs text-indigo-300 pt-1">
                    {paragraph.replace('#### ', '')}
                  </h5>
                );
              }
              return (
                <p key={pIdx} className="text-codepilot-text/90 whitespace-pre-line">
                  {paragraph}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function AssistantPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [convSearch, setConvSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [editingConv, setEditingConv] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('repo-codepilot-core');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer toggle

  const messagesEndRef = useRef(null);

  const {
    data: conversations = [],
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => assistantService.getConversations(),
  });

  const { data: repositories = [] } = useQuery({
    queryKey: ['repositories-assistant'],
    queryFn: () => repositoryService.getRepositories(),
  });

  // Current active conversation
  const activeConversation =
    conversations.find((c) => c.id === conversationId) ||
    conversations[0] ||
    null;

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isSending]);

  // Navigate to first conversation if root /app/assistant was hit
  useEffect(() => {
    if (!conversationId && conversations.length > 0) {
      navigate(`/app/assistant/${conversations[0].id}`, { replace: true });
    }
  }, [conversationId, conversations, navigate]);

  const handleCreateNewConversation = async () => {
    try {
      const newConv = await assistantService.createConversation(
        selectedRepo,
        'New Conversation'
      );
      await refetchConversations();
      navigate(`/app/assistant/${newConv.id}`);
      setSidebarOpen(false);
    } catch {
      toast.error('Failed to create conversation');
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isSending || !activeConversation) return;

    setIsSending(true);
    setInputMessage('');

    try {
      await assistantService.sendMessage(activeConversation.id, text.trim());
      await refetchConversations();
    } catch (err) {
      toast.error(err.message || 'Error communicating with assistant');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteConversation = async () => {
    if (!deleteId) return;
    try {
      await assistantService.deleteConversation(deleteId);
      toast.success('Conversation removed');
      await refetchConversations();
      setDeleteId(null);
      if (activeConversation?.id === deleteId) {
        navigate('/app/assistant');
      }
    } catch {
      toast.error('Failed to delete conversation');
    }
  };

  const handleSaveTitle = async () => {
    if (!editingConv || !editTitle.trim()) return;
    try {
      await assistantService.renameConversation(editingConv.id, editTitle.trim());
      await refetchConversations();
      setEditingConv(null);
      toast.success('Conversation renamed');
    } catch {
      toast.error('Failed to rename');
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(convSearch.toLowerCase())
  );

  return (
    <div className="space-y-4 text-left">
      <DemoBanner message="CodePilot AI Assistant: Predefined deterministic responses are active. Full LLM semantic retrieval and RAG pipelines integrate in Phase 4." />

      <div className="h-[740px] flex rounded-xl border border-codepilot-border bg-codepilot-panel overflow-hidden relative">
        {/* Mobile toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden absolute top-3 left-3 z-20 p-1.5 rounded-lg bg-codepilot-surface border border-codepilot-border text-xs text-codepilot-text"
        >
          Conversations
        </button>

        {/* Conversation List Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'absolute inset-y-0 left-0 z-30 w-72' : 'hidden'
          } lg:relative lg:flex lg:w-72 flex-col border-r border-codepilot-border bg-[#0E111A] shrink-0`}
        >
          {/* Header */}
          <div className="p-3 border-b border-codepilot-border flex items-center justify-between">
            <span className="text-xs font-semibold text-codepilot-text uppercase tracking-wider">
              Conversations
            </span>
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={handleCreateNewConversation}
            >
              New Chat
            </Button>
          </div>

          {/* Search */}
          <div className="p-2 border-b border-codepilot-border/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-codepilot-subtle" />
              <input
                type="text"
                placeholder="Search history..."
                value={convSearch}
                onChange={(e) => setConvSearch(e.target.value)}
                className="w-full bg-codepilot-surface text-xs rounded-lg pl-8 pr-3 py-1.5 border border-codepilot-border focus:outline-none focus:border-indigo-500 placeholder-codepilot-subtle text-codepilot-text"
              />
            </div>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredConversations.map((conv) => {
              const isActive = activeConversation?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    navigate(`/app/assistant/${conv.id}`);
                    setSidebarOpen(false);
                  }}
                  className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/30'
                      : 'text-codepilot-muted hover:text-codepilot-text hover:bg-codepilot-surface/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Bot className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{conv.title}</span>
                  </div>

                  {/* Actions */}
                  <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingConv(conv);
                        setEditTitle(conv.title);
                      }}
                      className="p-1 rounded hover:bg-codepilot-panel text-codepilot-subtle hover:text-codepilot-text"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(conv.id);
                      }}
                      className="p-1 rounded hover:bg-rose-950/40 text-codepilot-subtle hover:text-rose-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredConversations.length === 0 && (
              <p className="text-center text-xs text-codepilot-subtle py-8">
                No conversations found
              </p>
            )}
          </div>
        </div>

        {/* Main Chat Workspace Panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0B0D13]">
          {/* Chat Workspace Header */}
          <div className="h-14 border-b border-codepilot-border bg-codepilot-panel px-4 flex items-center justify-between">
            <div className="flex items-center gap-3 pl-8 lg:pl-0 truncate">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="truncate">
                <h2 className="text-xs sm:text-sm font-semibold text-codepilot-text truncate">
                  {activeConversation?.title || 'CodePilot Assistant'}
                </h2>
                <div className="flex items-center gap-2 text-[11px] text-codepilot-subtle">
                  <span>Context:</span>
                  <select
                    value={selectedRepo}
                    onChange={(e) => setSelectedRepo(e.target.value)}
                    className="bg-transparent border-none text-indigo-400 font-medium focus:outline-none p-0 cursor-pointer"
                  >
                    {repositories.map((r) => (
                      <option key={r.id} value={r.id} className="bg-codepilot-panel">
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <Badge variant="indigo" size="sm">
              AST Index Loaded
            </Badge>
          </div>

          {/* Message Thread Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {activeConversation?.messages?.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-indigo-950/50 border border-indigo-800/50 flex items-center justify-center text-indigo-400 mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-white">
                  CodePilot Assistant Ready
                </h3>
                <p className="text-xs text-codepilot-muted mt-1 mb-6">
                  Select a suggested codebase exploration prompt or enter a custom technical question below.
                </p>

                {/* Suggested prompts buttons */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {suggestedPrompts.slice(0, 4).map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSendMessage(prompt)}
                      className="p-3 rounded-lg border border-codepilot-border bg-codepilot-panel hover:bg-codepilot-surface hover:border-indigo-500/60 transition-all text-xs text-codepilot-text"
                    >
                      <p className="font-medium">{prompt}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              activeConversation?.messages?.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-2xl rounded-xl p-4 ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-codepilot-panel border border-codepilot-border rounded-tl-none shadow-subtle'
                      }`}
                    >
                      {isUser ? (
                        <p className="text-xs sm:text-sm whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      ) : (
                        <MessageRenderer content={msg.content} />
                      )}

                      {/* File reference chips */}
                      {msg.fileReferences && msg.fileReferences.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-codepilot-border/60">
                          <span className="text-[10px] text-codepilot-subtle uppercase tracking-wider font-semibold">
                            Context:
                          </span>
                          {msg.fileReferences.map((ref) => (
                            <span
                              key={ref}
                              className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-codepilot-surface text-indigo-300 border border-codepilot-border"
                            >
                              <FileCode className="w-3 h-3 text-indigo-400" />
                              {ref}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="text-[10px] text-right mt-1.5 opacity-60">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-700/60 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        ME
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {isSending && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-codepilot-panel border border-codepilot-border rounded-xl p-3 text-xs text-codepilot-muted flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <span>Synthesizing repository context & AST index...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestions Bar (above input) */}
          <div className="px-4 py-2 border-t border-codepilot-border/60 flex items-center gap-2 overflow-x-auto bg-[#0E111A]/80">
            <span className="text-[10px] font-semibold text-codepilot-subtle uppercase tracking-wider shrink-0">
              Suggestions:
            </span>
            {suggestedPrompts.map((p) => (
              <button
                key={p}
                onClick={() => handleSendMessage(p)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-codepilot-surface border border-codepilot-border text-codepilot-muted hover:text-codepilot-text hover:border-indigo-500/50 whitespace-nowrap transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Composer Input Bar */}
          <div className="p-3 border-t border-codepilot-border bg-codepilot-panel">
            <div className="relative flex items-end bg-codepilot-surface border border-codepilot-border rounded-xl focus-within:border-indigo-500 transition-colors p-2">
              <textarea
                rows={2}
                placeholder="Ask about functions, request flows, architecture, or performance bottlenecks... (Enter to send, Shift+Enter for newline)"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-xs sm:text-sm text-codepilot-text placeholder-codepilot-subtle resize-none focus:outline-none max-h-32 p-1 font-sans"
              />

              <div className="flex items-center gap-1.5 ml-2 shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!inputMessage.trim() || isSending}
                  loading={isSending}
                  onClick={() => handleSendMessage()}
                  icon={Send}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rename Modal */}
      <Modal
        isOpen={!!editingConv}
        onClose={() => setEditingConv(null)}
        title="Rename Conversation"
      >
        <div className="space-y-4">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full bg-codepilot-surface border border-codepilot-border text-sm rounded-lg p-2.5 text-codepilot-text focus:outline-none focus:border-indigo-500"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingConv(null)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveTitle}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConversation}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation thread from local history?"
        danger
      />
    </div>
  );
}
