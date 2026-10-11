import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from '../features/landing/LandingPage.jsx';
import { NotFoundPage } from '../features/landing/NotFoundPage.jsx';
import { AppProviders } from '../app/providers.jsx';

describe('Application Routing', () => {
  it('renders landing page with headline and action links', () => {
    render(
      <AppProviders>
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>
      </AppProviders>
    );

    expect(
      screen.getByText(/Understand Your Codebase\./i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Get Started/i)).toBeInTheDocument();
  });

  it('renders 404 not found page on invalid routes', () => {
    render(
      <AppProviders>
        <MemoryRouter initialEntries={['/nonexistent-route']}>
          <Routes>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MemoryRouter>
      </AppProviders>
    );

    expect(screen.getByText(/Page Does Not Exist/i)).toBeInTheDocument();
    expect(screen.getByText(/404 — Route Not Found/i)).toBeInTheDocument();
  });
});
