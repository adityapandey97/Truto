import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    endIcon: EndIcon,
    className = '',
    id,
    type = 'text',
    ...props
  },
  ref
) {
  const inputId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-codepilot-muted">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-codepilot-subtle pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`w-full bg-codepilot-surface border text-codepilot-text text-sm rounded-lg placeholder-codepilot-subtle transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500/80 ${
            Icon ? 'pl-9' : 'pl-3.5'
          } ${EndIcon ? 'pr-9' : 'pr-3.5'} py-2 ${
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50'
              : 'border-codepilot-border focus:border-indigo-500/80 hover:border-codepilot-borderLight'
          } ${className}`}
          {...props}
        />
        {EndIcon && (
          <div className="absolute right-3 flex items-center">
            {EndIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-codepilot-subtle mt-1">{helperText}</p>}
    </div>
  );
});
