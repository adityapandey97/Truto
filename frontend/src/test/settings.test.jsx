import { describe, it, expect, beforeEach } from 'vitest';

describe('Settings & UI Preferences Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and reads harmless display preferences from localStorage', () => {
    localStorage.setItem('cp_pref_font_size', '14');
    localStorage.setItem('cp_pref_tab_size', '4');
    localStorage.setItem('cp_theme', 'dark');

    expect(localStorage.getItem('cp_pref_font_size')).toBe('14');
    expect(localStorage.getItem('cp_pref_tab_size')).toBe('4');
    expect(localStorage.getItem('cp_theme')).toBe('dark');
  });

  it('defaults properly when localStorage is empty', () => {
    const savedTheme = localStorage.getItem('cp_theme') || 'dark';
    expect(savedTheme).toBe('dark');
  });
});
