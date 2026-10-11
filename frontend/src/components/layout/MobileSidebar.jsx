import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  Bot,
  GitPullRequest,
  Activity,
  CheckCircle2,
  Settings,
  Sparkles,
  X,
  User,
  LogOut,
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

export function MobileSidebar() {
  const { mobileMenuOpen, setMobileMenuOpen } = useUI();
  const { user, logout } = useAuth();

  if (!mobileMenuOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 lg:hidden flex"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-72 max-w-[80vw] bg-[#0E111A] border-r border-codepilot-border h-full flex flex-col z-10 animate-in slide-in-from-left duration-200">
        <div className="h-14 flex items-center justify-between px-4 border-b border-codepilot-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-codepilot-text">
              CodePilot <span className="text-indigo-400">AI</span>
            </span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="p-1 rounded-md text-codepilot-subtle hover:text-codepilot-text hover:bg-codepilot-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20'
                      : 'text-codepilot-muted hover:text-codepilot-text hover:bg-codepilot-surface/70'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-codepilot-border space-y-2">
          <NavLink
            to="/app/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-codepilot-surface text-xs text-codepilot-text"
          >
            <User className="w-4 h-4 text-indigo-400" />
            <span>Profile ({user?.name || 'Developer'})</span>
          </NavLink>
          <button
            onClick={() => {
              logout();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-rose-950/30 text-xs text-rose-400"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
