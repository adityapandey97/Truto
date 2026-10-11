import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FolderGit2, MessageSquare, GitPullRequest, Activity, ArrowRight, X } from 'lucide-react';
import { useUI } from '../../context/UIContext.jsx';
import { mockRepositories } from '../../data/repositories.js';
import { mockConversations } from '../../data/conversations.js';
import { mockReviews } from '../../data/reviews.js';
import { mockJobs } from '../../data/jobs.js';

export function GlobalSearchModal() {
  const { isSearchOpen, setIsSearchOpen } = useUI();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredRepos = mockRepositories
    .filter((r) => !q || r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
    .slice(0, 3);

  const filteredConvs = mockConversations
    .filter((c) => !q || c.title.toLowerCase().includes(q))
    .slice(0, 3);

  const filteredReviews = mockReviews
    .filter((rev) => !q || rev.title.toLowerCase().includes(q))
    .slice(0, 2);

  const filteredJobs = mockJobs
    .filter((j) => !q || j.type.toLowerCase().includes(q) || j.repositoryName.toLowerCase().includes(q))
    .slice(0, 2);

  const handleSelect = (path) => {
    setIsSearchOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4"
    >
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => setIsSearchOpen(false)}
      />

      <div className="relative w-full max-w-xl bg-codepilot-panel border border-codepilot-border rounded-xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-codepilot-border">
          <Search className="w-4 h-4 text-codepilot-subtle mr-2.5 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search repositories, conversations, reviews, jobs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent py-3.5 text-sm text-codepilot-text placeholder-codepilot-subtle focus:outline-none"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search"
            className="text-codepilot-subtle hover:text-codepilot-text p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-codepilot-border/40 text-left">
          {/* Repositories */}
          {filteredRepos.length > 0 && (
            <div className="py-2">
              <span className="text-[10px] font-semibold text-codepilot-subtle uppercase tracking-wider px-3 py-1 block">
                Repositories
              </span>
              {filteredRepos.map((r) => (
                <div
                  key={r.id}
                  onClick={() => handleSelect(`/app/repositories/${r.id}`)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-codepilot-surface cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderGit2 className="w-4 h-4 text-indigo-400" />
                    <div>
                      <p className="text-xs font-medium text-codepilot-text group-hover:text-indigo-300">
                        {r.name}
                      </p>
                      <p className="text-[11px] text-codepilot-muted truncate max-w-sm">
                        {r.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-codepilot-subtle group-hover:text-codepilot-text" />
                </div>
              ))}
            </div>
          )}

          {/* Conversations */}
          {filteredConvs.length > 0 && (
            <div className="py-2">
              <span className="text-[10px] font-semibold text-codepilot-subtle uppercase tracking-wider px-3 py-1 block">
                Assistant Conversations
              </span>
              {filteredConvs.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelect(`/app/assistant/${c.id}`)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-codepilot-surface cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-medium text-codepilot-text group-hover:text-violet-300">
                      {c.title}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-codepilot-subtle group-hover:text-codepilot-text" />
                </div>
              ))}
            </div>
          )}

          {/* Reviews */}
          {filteredReviews.length > 0 && (
            <div className="py-2">
              <span className="text-[10px] font-semibold text-codepilot-subtle uppercase tracking-wider px-3 py-1 block">
                Code Reviews
              </span>
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  onClick={() => handleSelect(`/app/reviews/${rev.id}`)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-codepilot-surface cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <GitPullRequest className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-medium text-codepilot-text group-hover:text-amber-300">
                      {rev.title}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-codepilot-subtle group-hover:text-codepilot-text" />
                </div>
              ))}
            </div>
          )}

          {/* Jobs */}
          {filteredJobs.length > 0 && (
            <div className="py-2">
              <span className="text-[10px] font-semibold text-codepilot-subtle uppercase tracking-wider px-3 py-1 block">
                Background Jobs
              </span>
              {filteredJobs.map((j) => (
                <div
                  key={j.id}
                  onClick={() => handleSelect(`/app/jobs/${j.id}`)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-codepilot-surface cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-medium text-codepilot-text group-hover:text-emerald-300">
                      {j.type} ({j.repositoryName})
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-codepilot-subtle group-hover:text-codepilot-text" />
                </div>
              ))}
            </div>
          )}

          {filteredRepos.length === 0 &&
            filteredConvs.length === 0 &&
            filteredReviews.length === 0 &&
            filteredJobs.length === 0 && (
              <div className="py-8 text-center text-xs text-codepilot-muted">
                No matching results for &ldquo;{query}&rdquo;
              </div>
            )}
        </div>

        <div className="bg-codepilot-surface/40 px-4 py-2 border-t border-codepilot-border flex items-center justify-between text-[11px] text-codepilot-subtle">
          <span>
            Navigate with <kbd className="px-1.5 py-0.5 bg-codepilot-panel rounded border border-codepilot-border">↵</kbd>
          </span>
          <span>
            Close with <kbd className="px-1.5 py-0.5 bg-codepilot-panel rounded border border-codepilot-border">ESC</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}
