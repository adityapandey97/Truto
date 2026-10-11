import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { RepositoryListPage } from '../features/repositories/RepositoryListPage.jsx';
import { AppProviders } from '../app/providers.jsx';
import { repositoryService } from '../services/repositoryService.js';

describe('Repository Search & Filtering', () => {
  it('retrieves sample repositories from the service', async () => {
    const repos = await repositoryService.getRepositories();
    expect(repos.length).toBeGreaterThanOrEqual(3);
    expect(repos.some((r) => r.name === 'codepilot-core')).toBe(true);
  });

  it('filters repositories based on user search query', async () => {
    const user = userEvent.setup();
    render(
      <AppProviders>
        <MemoryRouter>
          <RepositoryListPage />
        </MemoryRouter>
      </AppProviders>
    );

    // Wait for repos to load
    await waitFor(() => {
      expect(screen.getByText('codepilot-core')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search repositories/i);
    await user.type(searchInput, 'hyper-rag');

    await waitFor(() => {
      expect(screen.getByText('hyper-rag-pipeline')).toBeInTheDocument();
      expect(screen.queryByText('codepilot-core')).not.toBeInTheDocument();
    });
  });
});
