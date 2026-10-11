import { forwardRef } from 'react';

export const Select = forwardRef(function Select(
  {
    label,
    options = [],
    error,
    helperText,
    className = '',
    id,
    ...props
  },
  ref
) {
  const selectId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-codepilot-muted">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`w-full bg-codepilot-surface border text-codepilot-text text-sm rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500/80 ${
          error
            ? 'border-rose-500 focus:border-rose-500'
            : 'border-codepilot-border focus:border-indigo-500/80 hover:border-codepilot-borderLight'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-codepilot-panel text-codepilot-text">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-codepilot-subtle mt-1">{helperText}</p>}
    </div>
  );
});
