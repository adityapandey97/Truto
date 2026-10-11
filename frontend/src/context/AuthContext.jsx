import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const DEMO_USER = {
  id: 'usr-101',
  name: 'Aditya Pandey',
  email: 'aditya@codepilot.dev',
  role: 'Staff Engineer & Architect',
  workspace: 'Truto Core Engineering',
  avatarUrl: null
};

export function AuthProvider({ children }) {
  // In demo mode, start with an authenticated demo user or allow toggling
  const [user, setUser] = useState(() => {
    // Session state only, never persistent sensitive tokens
    const saved = sessionStorage.getItem('codepilot_demo_auth');
    return saved ? JSON.parse(saved) : DEMO_USER;
  });
  const [loading, setLoading] = useState(false);

  const login = async ({ email, password }) => {
    setLoading(true);
    // Artificial mock auth delay
    await new Promise((res) => setTimeout(res, 500));
    const loggedUser = {
      ...DEMO_USER,
      email: email || DEMO_USER.email,
      name: email ? email.split('@')[0] : DEMO_USER.name
    };
    setUser(loggedUser);
    sessionStorage.setItem('codepilot_demo_auth', JSON.stringify(loggedUser));
    setLoading(false);
    return loggedUser;
  };

  const signup = async ({ email, name }) => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 600));
    const newUser = {
      id: `usr-${Date.now()}`,
      name: name || 'Developer',
      email,
      role: 'Software Engineer',
      workspace: 'Personal Workspace',
      avatarUrl: null
    };
    setUser(newUser);
    sessionStorage.setItem('codepilot_demo_auth', JSON.stringify(newUser));
    setLoading(false);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('codepilot_demo_auth');
  };

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    sessionStorage.setItem('codepilot_demo_auth', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        isDemoMode: true
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
