import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FolderGit2,
  Bot,
  Activity,
  GitPullRequest,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { repositoryService } from '../../services/repositoryService.js';
import { assistantService } from '../../services/assistantService.js';
import { jobService } from '../../services/jobService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { CardSkeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { DemoBanner } from '../../components/shared/DemoBanner.jsx';

const activityData = [
  { day: 'Mon', indexJobs: 4, queries: 12, changes: 3 },
  { day: 'Tue', indexJobs: 6, queries: 18, changes: 5 },
  { day: 'Wed', indexJobs: 8, queries: 24, changes: 7 },
  { day: 'Thu', indexJobs: 5, queries: 32, changes: 4 },
  { day: 'Fri', indexJobs: 11, queries: 45, changes: 9 },
  { day: 'Sat', indexJobs: 3, queries: 16, changes: 2 },
  { day: 'Sun', indexJobs: 7, queries: 28, changes: 6 },
];

export function DashboardPage() {
  const { user } = useAuth();
  const { activeWorkspace } = useUI();
  const navigate = useNavigate();

  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Review indexed repositories', done: true, link: '/app/repositories' },
    { id: 2, text: 'Ask CodePilot AI to analyze architecture', done: true, link: '/app/assistant' },
    { id: 3, text: 'Inspect code review diff and approvals', done: false, link: '/app/reviews' },
    { id: 4, text: 'Examine background indexing logs', done: false, link: '/app/jobs' },
  ]);

  const {
    data: repositories = [],
    isLoading: reposLoading,
    isError: reposError,
    refetch: refetchRepos,
  } = useQuery({
    queryKey: ['dashboard-repos'],
    queryFn: () => repositoryService.getRepositories(),
  });

  const {
    data: conversations = [],
    isLoading: convsLoading,
  } = useQuery({
    queryKey: ['dashboard-convs'],
    queryFn: () => assistantService.getConversations(),
  });

  const {
    data: jobs = [],
    isLoading: jobsLoading,
  } = useQuery({
    queryKey: ['dashboard-jobs'],
    queryFn: () => jobService.getJobs(),
  });

  const toggleChecklistItem = (id) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  const handleNewConversation = async () => {
    const conv = await assistantService.createConversation(
      'repo-codepilot-core',
      'New Codebase Discussion'
    );
    navigate(`/app/assistant/${conv.id}`);
  };

  if (reposError) {
    return <ErrorState onRetry={refetchRepos} />;
  }

  const completedIndexed = repositories.filter((r) => r.indexStatus === 'completed').length;
  const inProgressJobs = jobs.filter((j) => j.status === 'in_progress').length;

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <DemoBanner message="Sample Metrics: Displayed statistics and activity graphs reflect local demo workspace telemetry." />

      {/* Page Header */}
      <PageHeader
        title={`Welcome back, ${user?.name ? user.name.split(' ')[0] : 'Developer'}`}
        description={`Current workspace: ${activeWorkspace} — Codebase intelligence & assistant active`}
        actions={
          <>
            <Link to="/app/repositories">
              <Button variant="secondary" size="sm" icon={Plus}>
                Add Repository
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              icon={Bot}
              onClick={handleNewConversation}
            >
              New AI Chat
            </Button>
          </>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reposLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <Card className="flex items-center justify-between">
              <div>
                <p className="text-xs text-codepilot-muted font-medium">
                  Total Repositories
                </p>
                <p className="text-2xl font-bold text-codepilot-text mt-1">
                  {repositories.length}
                </p>
                <p className="text-[11px] text-codepilot-subtle mt-0.5">
                  Sample tracked repos
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 flex items-center justify-center">
                <FolderGit2 className="w-5 h-5" />
              </div>
            </Card>

            <Card className="flex items-center justify-between">
              <div>
                <p className="text-xs text-codepilot-muted font-medium">
                  Indexed Repositories
                </p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {completedIndexed}
                </p>
                <p className="text-[11px] text-emerald-500/80 mt-0.5">
                  Ready for context query
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </Card>

            <Card className="flex items-center justify-between">
              <div>
                <p className="text-xs text-codepilot-muted font-medium">
                  Active Conversations
                </p>
                <p className="text-2xl font-bold text-violet-400 mt-1">
                  {conversations.length}
                </p>
                <p className="text-[11px] text-violet-500/80 mt-0.5">
                  AI assistant sessions
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-950/60 border border-violet-800/60 text-violet-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
            </Card>

            <Card className="flex items-center justify-between">
              <div>
                <p className="text-xs text-codepilot-muted font-medium">
                  Background Jobs
                </p>
                <p className="text-2xl font-bold text-amber-400 mt-1">
                  {jobs.length}
                </p>
                <p className="text-[11px] text-amber-500/80 mt-0.5">
                  {inProgressJobs} running in background
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Main Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Repository & AI Interaction Activity"
            description="Weekly query volume and background indexing frequency (Sample Data)"
          />

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="queryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="indexGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  stroke="#4B5563"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#23293D' }}
                />
                <YAxis
                  stroke="#4B5563"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#23293D' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161A28',
                    borderColor: '#23293D',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F3F4F6',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="queries"
                  name="AI Queries"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#queryGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="indexJobs"
                  name="Index Jobs"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#indexGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Getting Started Checklist */}
        <Card>
          <CardHeader
            title="Getting Started Checklist"
            description="Essential steps to explore CodePilot capabilities"
          />

          <div className="space-y-3">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleChecklistItem(item.id)}
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-codepilot-surface cursor-pointer border border-transparent hover:border-codepilot-border transition-all"
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => {}}
                  className="mt-0.5 rounded border-codepilot-border text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium ${
                      item.done
                        ? 'line-through text-codepilot-subtle'
                        : 'text-codepilot-text'
                    }`}
                  >
                    {item.text}
                  </p>
                  <Link
                    to={item.link}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:underline mt-0.5"
                  >
                    <span>Open view</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-codepilot-border">
            <div className="flex items-center justify-between text-xs text-codepilot-muted">
              <span>Setup completion</span>
              <span className="font-semibold text-indigo-400">
                {Math.round(
                  (checklist.filter((i) => i.done).length / checklist.length) * 100
                )}
                %
              </span>
            </div>
            <div className="w-full h-1.5 bg-codepilot-surface rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (checklist.filter((i) => i.done).length / checklist.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Repositories & Recent Conversations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Repositories */}
        <Card>
          <CardHeader
            title="Recent Repositories"
            description="Codebases linked to current workspace"
            action={
              <Link to="/app/repositories">
                <Button variant="ghost" size="sm" icon={ArrowRight}>
                  View All
                </Button>
              </Link>
            }
          />

          <div className="space-y-2.5">
            {repositories.slice(0, 3).map((repo) => (
              <div
                key={repo.id}
                onClick={() => navigate(`/app/repositories/${repo.id}`)}
                className="p-3 rounded-lg bg-codepilot-surface/40 border border-codepilot-border/60 hover:border-codepilot-border hover:bg-codepilot-surface transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-950/50 border border-indigo-900/50 text-indigo-400 flex items-center justify-center shrink-0">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-codepilot-text truncate">
                      {repo.name}
                    </h4>
                    <p className="text-[11px] text-codepilot-muted truncate max-w-xs">
                      {repo.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    variant={repo.indexStatus === 'completed' ? 'success' : 'warning'}
                    size="sm"
                    dot
                  >
                    {repo.indexStatus}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-codepilot-subtle" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Conversations */}
        <Card>
          <CardHeader
            title="Recent AI Conversations"
            description="Cached reasoning threads and prompts"
            action={
              <Link to="/app/assistant">
                <Button variant="ghost" size="sm" icon={ArrowRight}>
                  Open Chat
                </Button>
              </Link>
            }
          />

          <div className="space-y-2.5">
            {conversations.slice(0, 3).map((conv) => (
              <div
                key={conv.id}
                onClick={() => navigate(`/app/assistant/${conv.id}`)}
                className="p-3 rounded-lg bg-codepilot-surface/40 border border-codepilot-border/60 hover:border-codepilot-border hover:bg-codepilot-surface transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-violet-950/50 border border-violet-900/50 text-violet-400 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-codepilot-text truncate">
                      {conv.title}
                    </h4>
                    <p className="text-[11px] text-codepilot-muted truncate">
                      {conv.messages?.length || 0} messages recorded
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-xs text-codepilot-subtle">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Recent</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
