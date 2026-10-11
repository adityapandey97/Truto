import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  ArrowLeft,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';
import { jobService } from '../../services/jobService.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { CardSkeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { DemoBanner } from '../../components/shared/DemoBanner.jsx';
import toast from 'react-hot-toast';

export function JobDetailPage() {
  const { jobId } = useParams();
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const {
    data: job,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['job-detail', jobId],
    queryFn: () => jobService.getJobById(jobId),
  });

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await jobService.retryJob(job.id);
      toast.success('Simulation: Job restarted in background');
      refetch();
    } catch {
      toast.error('Failed to trigger retry');
    } finally {
      setRetrying(false);
    }
  };

  const handleCopyLogs = () => {
    if (job?.logs) {
      navigator.clipboard.writeText(job.logs.join('\n'));
      setCopiedLogs(true);
      toast.success('Logs copied to clipboard');
      setTimeout(() => setCopiedLogs(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 text-left">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <ErrorState
        title="Job Not Found"
        message="The requested job pipeline could not be located."
      />
    );
  }

  return (
    <div className="space-y-6 text-left">
      <DemoBanner message="Pipeline Telemetry: Logs and event steps simulate indexing worker telemetry in demo mode." />

      <div className="flex items-center gap-2 text-xs text-codepilot-muted">
        <Link
          to="/app/jobs"
          className="flex items-center gap-1 hover:text-codepilot-text transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Jobs</span>
        </Link>
      </div>

      <PageHeader
        title={`${job.type} — ${job.repositoryName}`}
        description={`Job ID: ${job.id} • Started: ${new Date(job.startedAt).toLocaleString()}`}
        badge={
          <Badge
            variant={
              job.status === 'completed'
                ? 'success'
                : job.status === 'failed'
                ? 'danger'
                : 'warning'
            }
            size="sm"
            dot
          >
            {job.status}
          </Badge>
        }
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            loading={retrying}
            onClick={handleRetry}
          >
            Retry Pipeline (Demo)
          </Button>
        }
      />

      {/* Progress & Overview */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-codepilot-text">
              Pipeline Progress
            </span>
            <span className="font-mono text-indigo-400 font-bold">
              {job.progress}%
            </span>
          </div>

          <div className="w-full bg-codepilot-surface h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                job.status === 'failed'
                  ? 'bg-rose-500'
                  : job.status === 'completed'
                  ? 'bg-emerald-500'
                  : 'bg-indigo-500'
              }`}
              style={{ width: `${job.progress}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
            <div>
              <p className="text-codepilot-subtle">Target Repository</p>
              <p className="font-mono text-codepilot-text mt-0.5">
                {job.repositoryName}
              </p>
            </div>
            <div>
              <p className="text-codepilot-subtle">Total Duration</p>
              <p className="text-codepilot-text mt-0.5">{job.duration}</p>
            </div>
            <div>
              <p className="text-codepilot-subtle">Completed At</p>
              <p className="text-codepilot-text mt-0.5">
                {job.completedAt ? new Date(job.completedAt).toLocaleTimeString() : 'In Flight'}
              </p>
            </div>
            <div>
              <p className="text-codepilot-subtle">Worker Node</p>
              <p className="text-codepilot-text font-mono mt-0.5">
                worker-node-03 (Demo)
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Failure Box if failed */}
      {job.error && (
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs text-rose-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-rose-300">Failure Diagnostics</h4>
            <p className="mt-1 font-mono text-[11px] text-rose-200">
              {job.error}
            </p>
          </div>
        </div>
      )}

      {/* Event Timeline */}
      <Card>
        <CardHeader
          title="Pipeline Event Timeline"
          description="Sequential execution stages recorded by the indexing worker"
        />

        <div className="space-y-4 pt-2">
          {job.events?.map((ev, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  ev.status === 'completed'
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                    : ev.status === 'failed'
                    ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                    : ev.status === 'in_progress'
                    ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60 animate-pulse'
                    : 'bg-codepilot-surface text-codepilot-subtle'
                }`}
              >
                {ev.status === 'completed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : ev.status === 'failed' ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-codepilot-text">
                    {ev.step}
                  </span>
                  <span className="font-mono text-[11px] text-codepilot-subtle">
                    {ev.time}
                  </span>
                </div>
                <span className="capitalize text-[11px] text-codepilot-muted">
                  Status: {ev.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Logs Viewer */}
      <Card className="p-0 overflow-hidden border border-codepilot-border">
        <div className="h-10 bg-codepilot-panel border-b border-codepilot-border px-4 flex items-center justify-between text-xs text-codepilot-muted">
          <div className="flex items-center gap-2 font-mono">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span className="text-codepilot-text font-medium">Standard Output</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            icon={copiedLogs ? Check : Copy}
            onClick={handleCopyLogs}
          >
            {copiedLogs ? 'Copied' : 'Copy Logs'}
          </Button>
        </div>

        <div className="p-4 bg-[#0B0D13] font-mono text-xs text-codepilot-text leading-relaxed overflow-x-auto max-h-72">
          {job.logs?.map((line, idx) => (
            <div
              key={idx}
              className={`py-0.5 ${
                line.includes('ERROR')
                  ? 'text-rose-400'
                  : line.includes('Discovered') || line.includes('successfully')
                  ? 'text-emerald-400'
                  : 'text-codepilot-muted'
              }`}
            >
              {line}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
