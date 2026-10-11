import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export const Button = forwardRef(function Button(
  {
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon,
    className = '',
    ...props
  },
  ref
) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-lg';

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-subtle active:bg-indigo-700',
    secondary: 'bg-codepilot-surface hover:bg-codepilot-hover text-codepilot-text border border-codepilot-border active:bg-codepilot-panel',
    outline: 'border border-codepilot-border hover:border-codepilot-borderLight text-codepilot-text hover:bg-codepilot-surface/50',
    ghost: 'text-codepilot-muted hover:text-codepilot-text hover:bg-codepilot-surface/50 active:bg-codepilot-surface',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-subtle active:bg-rose-700',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 text-current" />
      ) : null}
      {children}
    </button>
  );
});
