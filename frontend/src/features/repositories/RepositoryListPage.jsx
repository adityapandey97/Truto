import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FolderGit2,
  Plus,
  Search,
  GitBranch,
  FileCode2,
  Clock,
} from 'lucide-react';
import { repositoryService } from '../../services/repositoryService.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { CardSkeleton } from '../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { AddRepositoryModal } from './AddRepositoryModal.jsx';
import { DemoBanner } from '../../components/shared/DemoBanner.jsx';

export function RepositoryListPage() {
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();

  const {
    data: repositories = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['repositories-list'],
    queryFn: () => repositoryService.getRepositories(),
  });

  const languages = ['ALL', 'JavaScript', 'Python', 'Go', 'HTML', 'Shell'];
  const statuses = ['ALL', 'completed', 'indexing', 'failed', 'queued'];

  const filteredRepos = repositories
    .filter((repo) => {
      const matchesSearch =
        repo.name.toLowerCase().includes(search.toLowerCase()) ||
        repo.description.toLowerCase().includes(search.toLowerCase());

      const matchesLang =
        selectedLanguage === 'ALL' ||
        repo.languages?.some((l) => l.name.toLowerCase() === selectedLanguage.toLowerCase());

      const matchesStatus =
        selectedStatus === 'ALL' || repo.indexStatus === selectedStatus;

      return matchesSearch && matchesLang && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'files') return (b.fileCount || 0) - (a.fileCount || 0);
      if (sortBy === 'recent')
        return new Date(b.lastIndexedAt || 0) - new Date(a.lastIndexedAt || 0);
      return 0;
    });

  return (
    <div className="space-y-6 text-left">
      <DemoBanner message="Repository Ingestion: Connected repositories represent local demo projects. GitHub Webhook syncing will be enabled in Phase 3." />

      <PageHeader
        title="Repositories"
        description="Explore tracked codebases, view indexing health, and launch assistant queries."
        badge={
          <Badge variant="indigo" size="sm">
            {repositories.length} Tracked
          </Badge>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Repository
          </Button>
        }
      />

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-codepilot-panel p-3.5 rounded-xl border border-codepilot-border">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search repositories by name or description..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Language filter */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-codepilot-surface border border-codepilot-border text-xs rounded-lg px-2.5 py-2 text-codepilot-text focus:outline-none focus:border-indigo-500"
          >
            {languages.map((l) => (
              <option key={l} value={l}>
                Lang: {l}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-codepilot-surface border border-codepilot-border text-xs rounded-lg px-2.5 py-2 text-codepilot-text focus:outline-none focus:border-indigo-500"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                Status: {s}
              </option>
            ))}
          </select>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-codepilot-surface border border-codepilot-border text-xs rounded-lg px-2.5 py-2 text-codepilot-text focus:outline-none focus:border-indigo-500"
          >
            <option value="name">Sort: Name (A-Z)</option>
            <option value="recent">Sort: Recently Indexed</option>
            <option value="files">Sort: File Count</option>
          </select>
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : filteredRepos.length === 0 ? (
        <EmptyState
          title="No repositories found"
          description="Try modifying your search query or language filter criteria."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setSelectedLanguage('ALL');
            setSelectedStatus('ALL');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRepos.map((repo) => (
            <Card
              key={repo.id}
              hover
              onClick={() => navigate(`/app/repositories/${repo.id}`)}
              className="flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-indigo-950/60 border border-indigo-900/60 text-indigo-400 flex items-center justify-center shrink-0">
                      <FolderGit2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-codepilot-text hover:text-indigo-400 transition-colors truncate">
                        {repo.name}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-codepilot-subtle mt-0.5">
                        <span className="flex items-center gap-1 font-mono">
                          <GitBranch className="w-3 h-3 text-codepilot-subtle" />
                          {repo.defaultBranch}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FileCode2 className="w-3 h-3" />
                          {repo.fileCount} files
                        </span>
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant={
                      repo.indexStatus === 'completed'
                        ? 'success'
                        : repo.indexStatus === 'indexing'
                        ? 'warning'
                        : 'danger'
                    }
                    size="sm"
                    dot
                  >
                    {repo.indexStatus}
                  </Badge>
                </div>

                <p className="text-xs text-codepilot-muted line-clamp-2 my-3">
                  {repo.description}
                </p>

                {/* Language tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {repo.languages?.map((lang) => (
                    <span
                      key={lang.name}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-codepilot-surface text-codepilot-muted border border-codepilot-border/60"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: lang.color || '#6366F1' }}
                      />
                      {lang.name} ({lang.percentage}%)
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-codepilot-border/60 flex items-center justify-between text-xs text-codepilot-subtle">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Indexed {new Date(repo.lastIndexedAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/app/repositories/${repo.id}/files`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                  >
                    Browse Files →
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <AddRepositoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
