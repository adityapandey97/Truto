import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { useUI } from '../../context/UIContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Breadcrumbs } from './Breadcrumbs.jsx';
import { Badge } from '../ui/Badge.jsx';

export function Topbar() {
  const { theme, toggleTheme, setIsSearchOpen, setMobileMenuOpen } = useUI();
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 border-b border-codepilot-border bg-codepilot-panel/90 backdrop-blur-md px-4 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left section: Mobile menu & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation menu"
          className="lg:hidden p-1.5 rounded-lg text-codepilot-muted hover:text-codepilot-text hover:bg-codepilot-surface"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Breadcrumbs />
      </div>

      {/* Right section: Search bar, theme, notifications, user */}
      <div className="flex items-center gap-2.5">
        {/* Global Search Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-codepilot-surface border border-codepilot-border hover:border-codepilot-borderLight text-xs text-codepilot-muted hover:text-codepilot-text transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quick search...</span>
          <kbd className="text-[10px] bg-codepilot-panel px-1.5 py-0.5 rounded border border-codepilot-border font-mono text-codepilot-subtle">
            ⌘K
          </kbd>
        </button>

        {/* Demo Mode Badge */}
        <div className="hidden md:flex">
          <Badge variant="indigo" size="sm">
            Demo Mode
          </Badge>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg text-codepilot-muted hover:text-codepilot-text hover:bg-codepilot-surface transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen((prev) => !prev)}
            aria-label="Notifications"
            className="p-2 rounded-lg text-codepilot-muted hover:text-codepilot-text hover:bg-codepilot-surface transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-codepilot-panel" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-codepilot-panel border border-codepilot-border rounded-xl shadow-panel p-3 z-40 text-left">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-codepilot-border">
                <span className="text-xs font-semibold text-codepilot-text">
                  Notifications
                </span>
                <span className="text-[11px] text-indigo-400">Mark read</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-codepilot-surface/60">
                  <p className="font-medium text-codepilot-text">
                    Indexing Completed
                  </p>
                  <p className="text-[11px] text-codepilot-muted">
                    Repository codepilot-core indexed in 5m 00s.
                  </p>
                </div>
                <div className="p-2 rounded hover:bg-codepilot-surface/40">
                  <p className="font-medium text-codepilot-text">
                    New Review Request
                  </p>
                  <p className="text-[11px] text-codepilot-muted">
                    feat: add rate limiting to API gateway
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            aria-label="User profile menu"
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-codepilot-surface transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-xs font-bold uppercase shadow-subtle">
              {user?.name ? user.name[0] : 'U'}
            </div>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-codepilot-panel border border-codepilot-border rounded-xl shadow-panel py-1.5 z-40 text-left">
              <div className="px-3.5 py-2 border-b border-codepilot-border">
                <p className="text-xs font-semibold text-codepilot-text truncate">
                  {user?.name || 'Developer'}
                </p>
                <p className="text-[11px] text-codepilot-subtle truncate">
                  {user?.email || 'dev@codepilot.ai'}
                </p>
              </div>

              <div className="py-1">
                <Link
                  to="/app/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs text-codepilot-muted hover:text-codepilot-text hover:bg-codepilot-surface transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>My Profile</span>
                </Link>
                <Link
                  to="/app/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs text-codepilot-muted hover:text-codepilot-text hover:bg-codepilot-surface transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </Link>
              </div>

              <div className="border-t border-codepilot-border pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
