import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  Bot,
  GitPullRequest,
  Activity,
  CheckCircle2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useUI } from '../../context/UIContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/repositories', label: 'Repositories', icon: FolderGit2 },
  { to: '/app/assistant', label: 'AI Assistant', icon: Bot },
  { to: '/app/reviews', label: 'Code Reviews', icon: GitPullRequest },
  { to: '/app/jobs', label: 'Indexing & Jobs', icon: Activity },
  { to: '/app/testing', label: 'Test Reports', icon: CheckCircle2 },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, activeWorkspace } = useUI();
  const { user } = useAuth();

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-codepilot-border bg-[#0E111A] transition-all duration-200 select-none ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-codepilot-border">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shrink-0 shadow-glow">
            <Sparkles className="w-4 h-4" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-codepilot-text">
                CodePilot <span className="text-indigo-400">AI</span>
              </span>
              <span className="text-[10px] text-codepilot-subtle uppercase tracking-wider font-mono">
                Phase 2 Core
              </span>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1 rounded-md text-codepilot-subtle hover:text-codepilot-text hover:bg-codepilot-surface transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Workspace Selector */}
      {!sidebarCollapsed && (
        <div className="px-3 py-2.5 border-b border-codepilot-border/60">
          <div className="flex items-center justify-between p-2 rounded-lg bg-codepilot-surface/50 border border-codepilot-border/60 text-xs">
            <div className="flex items-center gap-2 truncate">
              <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate text-codepilot-text font-medium">
                {activeWorkspace}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-codepilot-subtle shrink-0" />
          </div>
        </div>
      )}

      {/* Primary Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={sidebarCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20'
                    : 'text-codepilot-muted hover:text-codepilot-text hover:bg-codepilot-surface/70'
                } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}

        {/* Repository Shortcuts */}
        {!sidebarCollapsed && (
          <div className="pt-4 mt-4 border-t border-codepilot-border/60 text-left">
            <span className="px-3 text-[10px] font-semibold text-codepilot-subtle uppercase tracking-wider block mb-1">
              Active Repositories
            </span>
            <div className="space-y-0.5">
              <NavLink
                to="/app/repositories/repo-codepilot-core"
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-codepilot-muted hover:text-codepilot-text hover:bg-codepilot-surface/60 truncate"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="truncate">codepilot-core</span>
              </NavLink>
              <NavLink
                to="/app/repositories/repo-hyper-rag-pipeline"
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-codepilot-muted hover:text-codepilot-text hover:bg-codepilot-surface/60 truncate"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="truncate">hyper-rag-pipeline</span>
              </NavLink>
            </div>
          </div>
        )}
      </nav>

      {/* User profile footer */}
      <div className="p-2 border-t border-codepilot-border">
        <NavLink
          to="/app/profile"
          className={`flex items-center gap-2.5 p-2 rounded-lg hover:bg-codepilot-surface transition-colors ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
            {user?.name ? user.name[0] : 'A'}
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-xs font-semibold text-codepilot-text truncate">
                {user?.name || 'Aditya Pandey'}
              </span>
              <span className="text-[10px] text-codepilot-subtle truncate">
                {user?.role || 'Staff Engineer'}
              </span>
            </div>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
