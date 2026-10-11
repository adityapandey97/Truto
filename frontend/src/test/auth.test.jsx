import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '../features/auth/LoginPage.jsx';
import { SignupPage } from '../features/auth/SignupPage.jsx';
import { AppProviders } from '../app/providers.jsx';

describe('Auth Form Validation & Demo Auth', () => {
  it('validates required email and password on login submit', async () => {
    const user = userEvent.setup();
    render(
      <AppProviders>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AppProviders>
    );

    const emailInput = screen.getByLabelText(/Work Email/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('validates password mismatch on signup form', async () => {
    const user = userEvent.setup();
    render(
      <AppProviders>
        <MemoryRouter>
          <SignupPage />
        </MemoryRouter>
      </AppProviders>
    );

    await user.type(screen.getByLabelText(/Full Name/i), 'Dev Tester');
    await user.type(screen.getByLabelText(/Work Email/i), 'tester@example.com');
    await user.type(screen.getByLabelText(/^Password$/i), 'password123');
    await user.type(screen.getByLabelText(/Confirm Password/i), 'password456');

    await user.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText(/Passwords don't match/i)).toBeInTheDocument();
    });
  });
});
