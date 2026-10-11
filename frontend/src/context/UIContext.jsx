import { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  // Harmless UI preferences saved to localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('cp_sidebar_collapsed') === 'true';
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('cp_theme') || 'dark';
  });

  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    return localStorage.getItem('cp_workspace') || 'Truto Engineering';
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cp_sidebar_collapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('cp_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);
  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <UIContext.Provider
      value={{
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        theme,
        toggleTheme,
        activeWorkspace,
        setActiveWorkspace,
        isSearchOpen,
        setIsSearchOpen,
        mobileMenuOpen,
        setMobileMenuOpen
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
