import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  ChevronRight,
} from 'lucide-react';
import { jobService } from '../../services/jobService.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { CardSkeleton } from '../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { DemoBanner } from '../../components/shared/DemoBanner.jsx';

export function JobsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

  const {
    data: jobs = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['jobs-list'],
    queryFn: () => jobService.getJobs(),
  });

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.type.toLowerCase().includes(search.toLowerCase()) ||
      job.repositoryName.toLowerCase().includes(search.toLowerCase()) ||
      job.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return (
        <Badge variant="success" size="sm" dot>
          Completed
        </Badge>
      );
    }
    if (status === 'failed') {
      return (
        <Badge variant="danger" size="sm" dot>
          Failed
        </Badge>
      );
    }
    if (status === 'in_progress') {
      return (
        <Badge variant="warning" size="sm" dot>
          In Progress
        </Badge>
      );
    }
    return (
      <Badge variant="default" size="sm">
        Queued
      </Badge>
    );
  };

  return (
    <div className="space-y-6 text-left">
      <DemoBanner message="Background Operations: Indexing jobs, AST scanning, and vectorization events are deterministic simulations." />

      <PageHeader
        title="Background Jobs & Indexing"
        description="Monitor asynchronous repository indexing, symbol extraction, and embedding generation pipelines."
        badge={
          <Badge variant="indigo" size="sm">
            {jobs.length} Pipelines
          </Badge>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-codepilot-panel p-3.5 rounded-xl border border-codepilot-border">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by job ID, pipeline type, or repository..."
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
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      {isLoading ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          title="No indexing jobs found"
          description="Try adjusting your search query or status filter."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearch('');
            setStatusFilter('ALL');
          }}
        />
      ) : (
        <Card className="p-0 overflow-hidden border border-codepilot-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E111A] border-b border-codepilot-border text-codepilot-subtle uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Job ID</th>
                  <th className="py-3 px-4">Pipeline Type</th>
                  <th className="py-3 px-4">Repository</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-codepilot-border/60">
                {filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    onClick={() => navigate(`/app/jobs/${job.id}`)}
                    className="hover:bg-codepilot-surface/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-indigo-300">
                      {job.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-codepilot-text">
                      {job.type}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-codepilot-muted">
                      {job.repositoryName}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(job.status)}</td>
                    <td className="py-3.5 px-4 w-44">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-codepilot-surface h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              job.status === 'failed'
                                ? 'bg-rose-500'
                                : job.status === 'completed'
                                ? 'bg-emerald-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-codepilot-subtle w-8">
                          {job.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-codepilot-subtle">
                      {job.duration}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <ChevronRight className="w-4 h-4 text-codepilot-subtle inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
