import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Play,
  Search,
  ChevronDown,
  ChevronRight,
  RotateCw,
  Bug,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { testService } from '../../services/testService.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { DemoBanner } from '../../components/shared/DemoBanner.jsx';
import toast from 'react-hot-toast';

export function TestingDashboardPage() {
  const [search, setSearch] = useState('');
  const [running, setRunning] = useState(false);
  const [activeFailure, setActiveFailure] = useState(null);
  const [expandedSuites, setExpandedSuites] = useState({ 'suite-indexer': true });

  const {
    data: summary,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ['test-summary'],
    queryFn: () => testService.getTestSummary(),
  });

  const {
    data: suites = [],
    refetch: refetchSuites,
  } = useQuery({
    queryKey: ['test-suites'],
    queryFn: () => testService.getTestSuites(),
  });

  const handleRunTests = async () => {
    setRunning(true);
    try {
      await testService.runDemoTests();
      toast.success('Test suites executed (Local Demo Simulation)');
      refetchSummary();
      refetchSuites();
    } catch {
      toast.error('Failed to run test suites');
    } finally {
      setRunning(false);
    }
  };

  const toggleSuite = (id) => {
    setExpandedSuites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredSuites = suites.filter((s) =>
    s.suiteName.toLowerCase().includes(search.toLowerCase()) ||
    s.repository.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      <DemoBanner message="Testing Dashboard: Metrics and stack traces reflect sample test executions. Sandboxed code execution servers connect in future phases." />

      <PageHeader
        title="Testing & Verification"
        description="Continuous regression testing and unit test suite reliability analysis across repositories."
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={running ? RotateCw : Play}
            loading={running}
            onClick={handleRunTests}
          >
            {running ? 'Executing Tests...' : 'Run Demo Tests'}
          </Button>
        }
      />

      {/* Overview Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-codepilot-muted">Total Tests</span>
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-codepilot-text mt-1">
            {summary?.total || 0}
          </p>
          <p className="text-[11px] text-codepilot-subtle mt-0.5">
            4 test suites registered
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-codepilot-muted">Passed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {summary?.passed || 0}
          </p>
          <p className="text-[11px] text-emerald-500/80 mt-0.5">
            {Math.round(((summary?.passed || 0) / (summary?.total || 1)) * 100)}% pass rate
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-codepilot-muted">Failed</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-1">
            {summary?.failed || 0}
          </p>
          <p className="text-[11px] text-rose-500/80 mt-0.5">
            Requires engineering fix
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-codepilot-muted">Duration</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-codepilot-text mt-1">
            {summary?.duration || '0.00s'}
          </p>
          <p className="text-[11px] text-codepilot-subtle mt-0.5">
            Last run: {summary?.lastRunAt ? new Date(summary.lastRunAt).toLocaleTimeString() : 'Recent'}
          </p>
        </Card>
      </div>

      {/* Historical Trend Chart */}
      <Card>
        <CardHeader
          title="Historical Test Reliability Trend"
          description="Pass vs Fail telemetry across the last 6 test runs"
        />

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary?.historicalTrend || []}>
              <XAxis
                dataKey="date"
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
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="passed" name="Passed" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed" name="Failed" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="skipped" name="Skipped" fill="#6B7280" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Test Suites List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-codepilot-text">
            Test Suites & Cases
          </h3>
          <div className="w-64">
            <Input
              placeholder="Search test suite..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredSuites.map((suite) => {
          const isExpanded = expandedSuites[suite.id];
          return (
            <Card key={suite.id} className="p-0 overflow-hidden border border-codepilot-border">
              {/* Suite header */}
              <div
                onClick={() => toggleSuite(suite.id)}
                className="p-4 bg-codepilot-panel hover:bg-codepilot-surface/40 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-codepilot-subtle" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-codepilot-subtle" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-codepilot-text">
                        {suite.suiteName}
                      </span>
                      <span className="text-[11px] text-codepilot-subtle font-mono">
                        ({suite.repository})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-codepilot-muted mt-1">
                      <span>Total: {suite.total}</span>
                      <span className="text-emerald-400">
                        Passed: {suite.passed}
                      </span>
                      {suite.failed > 0 && (
                        <span className="text-rose-400 font-medium">
                          Failed: {suite.failed}
                        </span>
                      )}
                      <span>Time: {suite.duration}</span>
                    </div>
                  </div>
                </div>

                <Badge
                  variant={suite.failed === 0 ? 'success' : 'danger'}
                  size="sm"
                  dot
                >
                  {suite.failed === 0 ? 'Passing' : `${suite.failed} Failing`}
                </Badge>
              </div>

              {/* Suite test cases */}
              {isExpanded && (
                <div className="divide-y divide-codepilot-border/40 bg-[#0B0D13]">
                  {suite.testCases?.map((tc) => (
                    <div
                      key={tc.id}
                      className="p-3 pl-11 flex items-center justify-between text-xs hover:bg-codepilot-surface/30"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {tc.status === 'passed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : tc.status === 'failed' ? (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <span className="text-codepilot-text truncate font-mono text-[11px]">
                          {tc.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-codepilot-subtle font-mono text-[11px]">
                          {tc.duration}
                        </span>
                        {tc.error && (
                          <Button
                            variant="danger"
                            size="sm"
                            className="text-[10px] py-0.5 px-2"
                            icon={Bug}
                            onClick={() => setActiveFailure(tc)}
                          >
                            Trace
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Failure Diagnostic Drawer / Modal */}
      <Modal
        isOpen={!!activeFailure}
        onClose={() => setActiveFailure(null)}
        title="Test Failure Trace Diagnostics"
        description={activeFailure?.name}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-left">
          <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 text-xs text-rose-200">
            <p className="font-semibold text-rose-300">Assertion Error:</p>
            <p className="mt-1 font-mono text-[11px] text-rose-200">
              {activeFailure?.error}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-codepilot-text uppercase tracking-wider mb-2">
              Stack Trace Output
            </h4>
            <div className="bg-[#0B0D13] p-3 rounded-lg border border-codepilot-border font-mono text-[11px] text-codepilot-muted whitespace-pre-wrap overflow-x-auto">
              {activeFailure?.stackTrace ||
                'Stack trace generated by test runner harness (Simulated).'}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveFailure(null)}
            >
              Close Diagnostics
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
