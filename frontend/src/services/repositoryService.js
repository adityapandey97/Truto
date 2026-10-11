import { mockRepositories } from '../data/repositories.js';
import { simulateDelay, getStorageData, setStorageData } from './mockApi.js';
import { IS_DEMO_MODE, apiClient } from './api.js';

const STORAGE_KEY = 'repositories';

function getLocalRepos() {
  return getStorageData(STORAGE_KEY, mockRepositories);
}

export const repositoryService = {
  async getRepositories() {
    if (!IS_DEMO_MODE) {
      const response = await apiClient.get('/repositories');
      return response.data;
    }
    await simulateDelay(350);
    return getLocalRepos();
  },

  async getRepositoryById(id) {
    if (!IS_DEMO_MODE) {
      const response = await apiClient.get(`/repositories/${id}`);
      return response.data;
    }
    await simulateDelay(250);
    const repos = getLocalRepos();
    const repo = repos.find((r) => r.id === id);
    if (!repo) throw new Error(`Repository not found: ${id}`);
    return repo;
  },

  async getRepositoryFiles(repositoryId) {
    if (!IS_DEMO_MODE) {
      const response = await apiClient.get(`/repositories/${repositoryId}/files`);
      return response.data;
    }
    await simulateDelay(300);
    const repos = getLocalRepos();
    const repo = repos.find((r) => r.id === repositoryId);
    if (!repo) throw new Error(`Repository not found: ${repositoryId}`);
    return repo.files || [];
  },

  async createRepository(payload) {
    if (!IS_DEMO_MODE) {
      const response = await apiClient.post('/repositories', payload);
      return response.data;
    }
    await simulateDelay(500);
    const repos = getLocalRepos();
    const newRepo = {
      id: `repo-${Date.now()}`,
      name: payload.name || 'custom-repo',
      description: payload.description || 'Imported sample repository (Demo)',
      url: payload.url || 'https://github.com/custom/repo',
      defaultBranch: payload.branch || 'main',
      languages: [{ name: 'JavaScript', percentage: 100, color: '#F7DF1E' }],
      fileCount: 12,
      indexStatus: 'completed',
      lastIndexedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      stats: { commits: 14, branches: 1, contributors: 1, stars: 0, linesOfCode: '1,200' },
      files: [
        {
          id: 'cf-1',
          name: 'index.js',
          path: 'index.js',
          type: 'file',
          language: 'javascript',
          size: '350 B',
          content: '// Demo imported repository\nconsole.log("Initialized in CodePilot AI Demo");\n'
        }
      ]
    };
    const updated = [newRepo, ...repos];
    setStorageData(STORAGE_KEY, updated);
    return newRepo;
  }
};
