import { FolderSearch } from 'lucide-react';
import { Button } from './Button.jsx';

export function EmptyState({
  icon: Icon = FolderSearch,
  title = 'No items found',
  description = 'There are no records to display matching your criteria.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-codepilot-border bg-codepilot-panel/40 ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-codepilot-surface flex items-center justify-center text-codepilot-subtle mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-codepilot-text">{title}</h3>
      <p className="text-xs text-codepilot-muted max-w-sm mt-1 mb-4">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button size="sm" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
