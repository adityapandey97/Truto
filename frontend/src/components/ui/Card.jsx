export function Card({
  children,
  className = '',
  onClick,
  hover = false,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-codepilot-panel border border-codepilot-border rounded-xl p-5 ${
        hover
          ? 'hover:border-codepilot-borderLight hover:bg-codepilot-surface/50 transition-all cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-codepilot-text tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-codepilot-muted mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
