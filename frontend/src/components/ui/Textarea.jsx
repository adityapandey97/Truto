import { forwardRef } from 'react';

export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    className = '',
    id,
    rows = 4,
    ...props
  },
  ref
) {
  const textareaId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-medium text-codepilot-muted">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`w-full bg-codepilot-surface border text-codepilot-text text-sm rounded-lg placeholder-codepilot-subtle p-3 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500/80 resize-y ${
          error
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50'
            : 'border-codepilot-border focus:border-indigo-500/80 hover:border-codepilot-borderLight'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-codepilot-subtle mt-1">{helperText}</p>}
    </div>
  );
});
