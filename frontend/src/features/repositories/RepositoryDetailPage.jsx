import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  GitBranch,
  FileCode2,
  Bot,
  ExternalLink,
  Star,
  Users,
  GitCommit,
  ArrowLeft,
} from 'lucide-react';
import { repositoryService } from '../../services/repositoryService.js';
import { assistantService } from '../../services/assistantService.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { CardSkeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { DemoBanner } from '../../components/shared/DemoBanner.jsx';
import toast from 'react-hot-toast';

export function RepositoryDetailPage() {
  const { repositoryId } = useParams();
  const navigate = useNavigate();

  const {
    data: repo,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['repository-detail', repositoryId],
    queryFn: () => repositoryService.getRepositoryById(repositoryId),
  });

  const handleOpenAssistant = async () => {
    try {
      const conv = await assistantService.createConversation(
        repo.id,
        `Discussion on ${repo.name}`
      );
      navigate(`/app/assistant/${conv.id}`);
    } catch {
      toast.error('Failed to create assistant session');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 text-left">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (isError || !repo) {
    return (
      <ErrorState
        title="Repository Not Found"
        message="The requested repository does not exist in your workspace."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 text-left">
      <DemoBanner message="Repository Detail: Static metrics and commit graphs are loaded from the mock repository service." />

      <div className="flex items-center gap-2 text-xs text-codepilot-muted">
        <Link
          to="/app/repositories"
          className="flex items-center gap-1 hover:text-codepilot-text transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Repositories</span>
        </Link>
      </div>

      <PageHeader
        title={repo.name}
        description={repo.description}
        badge={
          <Badge
            variant={repo.indexStatus === 'completed' ? 'success' : 'warning'}
            size="sm"
            dot
          >
            {repo.indexStatus}
          </Badge>
        }
        actions={
          <>
            <Link to={`/app/repositories/${repo.id}/files`}>
              <Button variant="secondary" size="sm" icon={FileCode2}>
                Browse Files
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              icon={Bot}
              onClick={handleOpenAssistant}
            >
              Open in Assistant
            </Button>
          </>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-codepilot-muted">
            <GitCommit className="w-4 h-4 text-indigo-400" />
            <span>Commits</span>
          </div>
          <p className="text-xl font-bold text-codepilot-text mt-1">
            {repo.stats?.commits || 0}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-codepilot-muted">
            <GitBranch className="w-4 h-4 text-emerald-400" />
            <span>Branches</span>
          </div>
          <p className="text-xl font-bold text-codepilot-text mt-1">
            {repo.stats?.branches || 1}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-codepilot-muted">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Contributors</span>
          </div>
          <p className="text-xl font-bold text-codepilot-text mt-1">
            {repo.stats?.contributors || 1}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-codepilot-muted">
            <Star className="w-4 h-4 text-violet-400" />
            <span>Lines of Code</span>
          </div>
          <p className="text-xl font-bold text-codepilot-text mt-1">
            {repo.stats?.linesOfCode || '10,000'}
          </p>
        </Card>
      </div>

      {/* Language Breakdown */}
      <Card>
        <CardHeader
          title="Language Distribution"
          description="Syntactic composition across codebase files"
        />

        {/* Multi-segment progress bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-codepilot-surface mb-4">
          {repo.languages?.map((lang) => (
            <div
              key={lang.name}
              title={`${lang.name}: ${lang.percentage}%`}
              style={{
                width: `${lang.percentage}%`,
                backgroundColor: lang.color || '#6366F1',
              }}
              className="h-full first:rounded-l-full last:rounded-r-full"
            />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {repo.languages?.map((lang) => (
            <div
              key={lang.name}
              className="flex items-center gap-2 p-2 rounded-lg bg-codepilot-surface/40 border border-codepilot-border/60"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: lang.color || '#6366F1' }}
              />
              <span className="text-xs font-medium text-codepilot-text">
                {lang.name}
              </span>
              <span className="text-xs text-codepilot-subtle ml-auto">
                {lang.percentage}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Repository Properties */}
      <Card>
        <CardHeader
          title="Repository Metadata"
          description="Configuration properties and indexing metadata"
        />

        <div className="divide-y divide-codepilot-border/60 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-codepilot-muted">Origin URL</span>
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:underline flex items-center gap-1 font-mono"
            >
              {repo.url}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-codepilot-muted">Default Branch</span>
            <span className="font-mono text-codepilot-text bg-codepilot-surface px-2 py-0.5 rounded">
              {repo.defaultBranch}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-codepilot-muted">Last Indexing Pass</span>
            <span className="text-codepilot-text">
              {new Date(repo.lastIndexedAt).toLocaleString()}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-codepilot-muted">File Count</span>
            <span className="text-codepilot-text font-medium">
              {repo.fileCount} tracked files
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
