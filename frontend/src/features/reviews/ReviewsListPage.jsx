import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  GitPullRequest,
  Search,
  FileCode2,
  ChevronRight,
} from 'lucide-react';
import { reviewService } from '../../services/reviewService.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { CardSkeleton } from '../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { DemoBanner } from '../../components/shared/DemoBanner.jsx';

export function ReviewsListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

  const {
    data: reviews = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['reviews-list'],
    queryFn: () => reviewService.getReviews(),
  });

  const filteredReviews = reviews.filter((rev) => {
    const matchesSearch =
      rev.title.toLowerCase().includes(search.toLowerCase()) ||
      rev.repositoryName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || rev.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    if (status === 'approved') {
      return (
        <Badge variant="success" size="sm" dot>
          Approved
        </Badge>
      );
    }
    if (status === 'rejected') {
      return (
        <Badge variant="danger" size="sm" dot>
          Rejected
        </Badge>
      );
    }
    return (
      <Badge variant="warning" size="sm" dot>
        Pending Review
      </Badge>
    );
  };

  return (
    <div className="space-y-6 text-left">
      <DemoBanner message="Code Reviews: Diff approval states update local demo state. Git remote merges and PR triggers occur in future backend phases." />

      <PageHeader
        title="Code Reviews"
        description="Inspect code changes, review additions and deletions, and verify proposed modifications."
        badge={
          <Badge variant="indigo" size="sm">
            {reviews.length} Active Diffs
          </Badge>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-codepilot-panel p-3.5 rounded-xl border border-codepilot-border">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search reviews by title or repository..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-codepilot-surface border border-codepilot-border text-xs rounded-lg px-3 py-2 text-codepilot-text focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : filteredReviews.length === 0 ? (
        <EmptyState
          title="No reviews found"
          description="There are no code reviews matching your filter criteria."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setStatusFilter('ALL');
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((rev) => (
            <Card
              key={rev.id}
              hover
              onClick={() => navigate(`/app/reviews/${rev.id}`)}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-indigo-950/60 border border-indigo-900/60 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <GitPullRequest className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-codepilot-text hover:text-indigo-400 transition-colors truncate">
                      {rev.title}
                    </h3>
                  </div>
                  <p className="text-xs text-codepilot-muted mt-0.5 truncate max-w-xl">
                    {rev.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-codepilot-subtle mt-2">
                    <span className="font-mono text-indigo-300">
                      {rev.repositoryName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FileCode2 className="w-3 h-3" />
                      {rev.filesChanged} files changed
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-mono font-medium">
                      +{rev.additions}
                    </span>
                    <span className="text-rose-400 font-mono font-medium">
                      -{rev.deletions}
                    </span>
                    <span>•</span>
                    <span>Author: {rev.author}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                {getStatusBadge(rev.status)}
                <ChevronRight className="w-4 h-4 text-codepilot-subtle" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
