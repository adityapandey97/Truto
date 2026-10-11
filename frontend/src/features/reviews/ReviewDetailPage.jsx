import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DiffEditor } from '@monaco-editor/react';
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  FileCode2,
  MessageSquare,
  Send,
  AlertCircle,
  Split,
  Columns,
} from 'lucide-react';
import { reviewService } from '../../services/reviewService.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { CardSkeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { DemoBanner } from '../../components/shared/DemoBanner.jsx';
import toast from 'react-hot-toast';

export function ReviewDetailPage() {
  const { reviewId } = useParams();
  const navigate = useNavigate();

  const [sideBySide, setSideBySide] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null); // 'approved' | 'rejected'
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);

  const {
    data: review,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['review-detail', reviewId],
    queryFn: () => reviewService.getReviewById(reviewId),
  });

  const handleUpdateStatus = async () => {
    if (!confirmAction) return;
    try {
      await reviewService.updateReviewStatus(review.id, confirmAction);
      toast.success(
        `Review marked as ${confirmAction.toUpperCase()} (Demo State Updated)`
      );
      setConfirmAction(null);
      refetch();
    } catch {
      toast.error('Failed to update review status');
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const added = {
      id: `c-${Date.now()}`,
      author: 'You (Reviewer)',
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, added]);
    setNewComment('');
    toast.success('Comment recorded in review thread');
  };

  if (isLoading) {
    return (
      <div className="space-y-4 text-left">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (isError || !review) {
    return (
      <ErrorState
        title="Review Not Found"
        message="The specified review ID does not exist."
      />
    );
  }

  const allComments = [...(review.comments || []), ...comments];
  const activeChange = review.changes?.[selectedFileIdx] || review.changes?.[0];

  return (
    <div className="space-y-6 text-left">
      <DemoBanner message="Review Diff Simulation: Accept/Reject updates local demo memory. No remote pull requests or branches are merged." />

      <div className="flex items-center gap-2 text-xs text-codepilot-muted">
        <Link
          to="/app/reviews"
          className="flex items-center gap-1 hover:text-codepilot-text transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Reviews</span>
        </Link>
      </div>

      <PageHeader
        title={review.title}
        description={`Repository: ${review.repositoryName} • Proposed by ${review.author}`}
        badge={
          <Badge
            variant={
              review.status === 'approved'
                ? 'success'
                : review.status === 'rejected'
                ? 'danger'
                : 'warning'
            }
            size="sm"
            dot
          >
            {review.status}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              icon={XCircle}
              disabled={review.status === 'rejected'}
              onClick={() => setConfirmAction('rejected')}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              disabled={review.status === 'approved'}
              onClick={() => setConfirmAction('approved')}
            >
              Approve & Merge (Demo)
            </Button>
          </div>
        }
      />

      {/* Review Summary Card */}
      <Card>
        <CardHeader
          title="Change Summary"
          description={review.description}
          action={
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-emerald-400 font-semibold">
                +{review.additions} additions
              </span>
              <span className="text-rose-400 font-semibold">
                -{review.deletions} deletions
              </span>
            </div>
          }
        />

        {/* Changed Files Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-codepilot-border/60">
          <span className="text-[10px] font-semibold text-codepilot-subtle uppercase tracking-wider">
            Files Changed:
          </span>
          {review.changes?.map((ch, idx) => (
            <button
              key={ch.filename}
              onClick={() => setSelectedFileIdx(idx)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                selectedFileIdx === idx
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'bg-codepilot-surface text-codepilot-muted hover:text-codepilot-text'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>{ch.filename}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Monaco Diff Viewer */}
      <Card className="p-0 overflow-hidden border border-codepilot-border">
        <div className="h-10 bg-codepilot-panel border-b border-codepilot-border px-4 flex items-center justify-between text-xs text-codepilot-muted">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-codepilot-text font-semibold">
              {activeChange?.filename || 'Diff Viewer'}
            </span>
            <span className="text-[11px] text-codepilot-subtle">
              (Original vs Proposed)
            </span>
          </div>

          <button
            onClick={() => setSideBySide(!sideBySide)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-codepilot-surface border border-codepilot-border text-xs text-codepilot-muted hover:text-codepilot-text"
          >
            {sideBySide ? <Split className="w-3.5 h-3.5" /> : <Columns className="w-3.5 h-3.5" />}
            <span>{sideBySide ? 'Side-by-Side' : 'Inline'}</span>
          </button>
        </div>

        <div className="h-[460px] w-full">
          {activeChange ? (
            <DiffEditor
              height="100%"
              theme="vs-dark"
              original={activeChange.oldCode}
              modified={activeChange.newCode}
              language="javascript"
              options={{
                readOnly: true,
                renderSideBySide: sideBySide,
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: '"JetBrains Mono", Fira Code, monospace',
                automaticLayout: true,
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-codepilot-subtle">
              No changes to display
            </div>
          )}
        </div>
      </Card>

      {/* Review Comments Thread */}
      <Card>
        <CardHeader
          title="Review Comments & Audit Notes"
          description="Code review discussion thread and automated findings"
        />

        <div className="space-y-3 mb-4">
          {allComments.map((comment) => (
            <div
              key={comment.id}
              className="p-3 rounded-lg bg-codepilot-surface/50 border border-codepilot-border/60 text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-indigo-300">
                  {comment.author}
                </span>
                <span className="text-[10px] text-codepilot-subtle">
                  {new Date(comment.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-codepilot-text">{comment.text}</p>
            </div>
          ))}

          {allComments.length === 0 && (
            <p className="text-xs text-codepilot-subtle py-2">
              No comments added yet.
            </p>
          )}
        </div>

        {/* Add comment input */}
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            placeholder="Add an engineering review comment or recommendation..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 bg-codepilot-surface border border-codepilot-border rounded-lg px-3 py-2 text-xs text-codepilot-text placeholder-codepilot-subtle focus:outline-none focus:border-indigo-500"
          />
          <Button type="submit" variant="secondary" size="sm" icon={Send}>
            Post
          </Button>
        </form>
      </Card>

      {/* Confirm Action Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleUpdateStatus}
        title={confirmAction === 'approved' ? 'Approve Code Review' : 'Reject Code Review'}
        message={
          confirmAction === 'approved'
            ? 'Are you sure you want to approve this proposal? (Demo mode: marks status as approved locally without merging to GitHub).'
            : 'Are you sure you want to reject this proposal?'
        }
        confirmText={confirmAction === 'approved' ? 'Approve' : 'Reject'}
        danger={confirmAction === 'rejected'}
      />
    </div>
  );
}
