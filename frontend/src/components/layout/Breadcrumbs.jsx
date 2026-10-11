import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS = {
  app: 'Dashboard',
  repositories: 'Repositories',
  files: 'File Explorer',
  assistant: 'AI Assistant',
  reviews: 'Code Reviews',
  jobs: 'Background Jobs',
  testing: 'Test Suite',
  settings: 'Settings',
  profile: 'Profile',
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden md:flex items-center gap-1.5 text-xs text-codepilot-muted select-none"
    >
      <Link
        to="/app"
        className="flex items-center text-codepilot-subtle hover:text-codepilot-text transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {pathnames.slice(1).map((segment, index) => {
        const to = `/${pathnames.slice(0, index + 2).join('/')}`;
        const isLast = index === pathnames.slice(1).length - 1;
        const label =
          ROUTE_LABELS[segment] ||
          (segment.startsWith('repo-')
            ? segment.replace('repo-', '')
            : segment.startsWith('conv-')
            ? 'Conversation'
            : segment.startsWith('rev-')
            ? 'Review #' + segment.replace('rev-', '')
            : segment.startsWith('job-')
            ? 'Job #' + segment.replace('job-', '')
            : segment);

        return (
          <div key={to} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-codepilot-subtle" />
            {isLast ? (
              <span className="font-medium text-codepilot-text truncate max-w-[180px]">
                {label}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-codepilot-text transition-colors truncate max-w-[140px]"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
