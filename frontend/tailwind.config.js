/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        codepilot: {
          bg: '#0B0D13',
          panel: '#11141E',
          surface: '#161A28',
          hover: '#1D2235',
          border: '#23293D',
          borderLight: '#2F3752',
          text: '#F3F4F6',
          muted: '#9CA3AF',
          subtle: '#6B7280',
          accent: '#6366F1',
          accentHover: '#4F46E5',
          violet: '#8B5CF6',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        panel: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        glow: '0 0 20px -5px rgba(99, 102, 241, 0.25)',
      }
    },
  },
  plugins: [],
}
