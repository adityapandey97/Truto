import { useState } from 'react';
import {
  Moon,
  Sun,
  Check,
} from 'lucide-react';
import { useUI } from '../../context/UIContext.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { DemoBanner } from '../../components/shared/DemoBanner.jsx';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const { theme, toggleTheme, sidebarCollapsed, setSidebarCollapsed } = useUI();

  // Local editor preferences
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('cp_pref_font_size') || '13';
  });
  const [tabSize, setTabSize] = useState(() => {
    return localStorage.getItem('cp_pref_tab_size') || '2';
  });
  const [defaultLang, setDefaultLang] = useState(() => {
    return localStorage.getItem('cp_pref_default_lang') || 'javascript';
  });
  const [notifSound, setNotifSound] = useState(() => {
    return localStorage.getItem('cp_pref_notif') !== 'false';
  });

  const handleSaveSettings = () => {
    localStorage.setItem('cp_pref_font_size', fontSize);
    localStorage.setItem('cp_pref_tab_size', tabSize);
    localStorage.setItem('cp_pref_default_lang', defaultLang);
    localStorage.setItem('cp_pref_notif', notifSound.toString());
    toast.success('Workspace preferences updated locally');
  };

  return (
    <div className="space-y-6 text-left max-w-4xl">
      <DemoBanner message="Settings & Preferences: Harmless display preferences are persisted in your browser's local storage." />

      <PageHeader
        title="Settings"
        description="Configure application display appearance, Monaco editor preferences, and notifications."
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Check}
            onClick={handleSaveSettings}
          >
            Save Preferences
          </Button>
        }
      />

      {/* Theme Preference */}
      <Card>
        <CardHeader
          title="Appearance & Theme"
          description="Select visual identity for CodePilot application interface"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button
            onClick={() => {
              if (theme !== 'dark') toggleTheme();
            }}
            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors ${
              theme === 'dark'
                ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300'
                : 'bg-codepilot-surface border-codepilot-border text-codepilot-muted hover:text-codepilot-text'
            }`}
          >
            <Moon className="w-4 h-4" />
            <div>
              <p className="text-xs font-semibold">Dark Theme</p>
              <p className="text-[10px] text-codepilot-subtle">High-contrast charcoal</p>
            </div>
          </button>

          <button
            onClick={() => {
              if (theme === 'dark') toggleTheme();
            }}
            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors ${
              theme === 'light'
                ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300'
                : 'bg-codepilot-surface border-codepilot-border text-codepilot-muted hover:text-codepilot-text'
            }`}
          >
            <Sun className="w-4 h-4" />
            <div>
              <p className="text-xs font-semibold">Light Theme</p>
              <p className="text-[10px] text-codepilot-subtle">Subtle clean daylight</p>
            </div>
          </button>
        </div>
      </Card>

      {/* Editor Preferences */}
      <Card>
        <CardHeader
          title="Monaco Code Viewer Preferences"
          description="Adjust code display typography and indentation formatting"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-codepilot-muted mb-1.5">
              Font Size (px)
            </label>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="w-full bg-codepilot-surface border border-codepilot-border rounded-lg px-3 py-2 text-codepilot-text focus:outline-none focus:border-indigo-500"
            >
              <option value="12">12 px</option>
              <option value="13">13 px (Default)</option>
              <option value="14">14 px</option>
              <option value="16">16 px</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-codepilot-muted mb-1.5">
              Tab Indentation
            </label>
            <select
              value={tabSize}
              onChange={(e) => setTabSize(e.target.value)}
              className="w-full bg-codepilot-surface border border-codepilot-border rounded-lg px-3 py-2 text-codepilot-text focus:outline-none focus:border-indigo-500"
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-codepilot-muted mb-1.5">
              Default Language Target
            </label>
            <select
              value={defaultLang}
              onChange={(e) => setDefaultLang(e.target.value)}
              className="w-full bg-codepilot-surface border border-codepilot-border rounded-lg px-3 py-2 text-codepilot-text focus:outline-none focus:border-indigo-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="go">Go</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Navigation & Layout Preferences */}
      <Card>
        <CardHeader
          title="Sidebar & Layout Configuration"
          description="Customize default navigation behavior"
        />

        <div className="space-y-3 text-xs">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sidebarCollapsed}
              onChange={(e) => setSidebarCollapsed(e.target.checked)}
              className="rounded border-codepilot-border text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-codepilot-text">
              Collapse sidebar by default on wider screens
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifSound}
              onChange={(e) => setNotifSound(e.target.checked)}
              className="rounded border-codepilot-border text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-codepilot-text">
              Notify on completed background indexing and review approvals
            </span>
          </label>
        </div>
      </Card>
    </div>
  );
}
