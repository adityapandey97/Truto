import { Repository } from '../models/Repository.js';
import { BackgroundJob } from '../models/BackgroundJob.js';
import { ApiError } from '../utils/ApiError.js';
import { assertOwnership } from '../middleware/authorize.js';

// Default seed repository when a user creates their workspace
const DEFAULT_SEED_REPO = {
  name: 'codepilot-core',
  description: 'High-performance indexing engine and microservices router for repository intelligence.',
  url: 'https://github.com/truto/codepilot-core',
  defaultBranch: 'main',
  languages: [
    { name: 'JavaScript', percentage: 68, color: '#F7DF1E' },
    { name: 'Node.js', percentage: 22, color: '#339933' },
    { name: 'CSS', percentage: 10, color: '#264DE4' },
  ],
  fileCount: 142,
  indexStatus: 'completed',
  stats: {
    commits: 524,
    branches: 8,
    contributors: 14,
    stars: 342,
    linesOfCode: '34,890',
  },
  files: [
    {
      id: 'f-1',
      name: 'package.json',
      path: 'package.json',
      type: 'file',
      language: 'json',
      size: '1.2 KB',
      content: JSON.stringify(
        {
          name: 'codepilot-core',
          version: '2.4.0',
          description: 'Enterprise repository indexing engine',
          main: 'src/index.js',
          dependencies: {
            express: '^4.19.2',
            cors: '^2.8.5',
            dotenv: '^16.4.5',
            jsonwebtoken: '^9.0.2',
          },
        },
        null,
        2
      ),
    },
    {
      id: 'f-2',
      name: 'README.md',
      path: 'README.md',
      type: 'file',
      language: 'markdown',
      size: '2.4 KB',
      content:
        '# CodePilot Core Engine\n\nProduction-grade indexing service for multi-repository codebases.\n\n## Architecture\n- REST & WebSocket Gateways\n- Tree-sitter AST Parser\n- Vectorized Semantic Chunking\n',
    },
    {
      id: 'f-3',
      name: 'index.js',
      path: 'src/index.js',
      type: 'file',
      language: 'javascript',
      size: '3.1 KB',
      content:
        'import express from "express";\nconst app = express();\nconst PORT = process.env.PORT || 5000;\n\napp.get("/health", (req, res) => res.json({ status: "healthy" }));\napp.listen(PORT, () => console.log(`Engine listening on ${PORT}`));\n',
    },
  ],
};

export class RepositoryService {
  /**
   * Get all repositories owned by user.
   * Auto-seeds a default repository if user currently has zero repositories.
   */
  static async getRepositories(userId, query = {}) {
    let repos = await Repository.find({ ownerId: userId }).sort({ createdAt: -1 });

    if (repos.length === 0) {
      const seeded = await Repository.create({
        ...DEFAULT_SEED_REPO,
        ownerId: userId,
      });
      repos = [seeded];
    }

    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      repos = repos.filter((r) => regex.test(r.name) || regex.test(r.description));
    }

    return repos;
  }

  static async getRepositoryById(userId, repoId) {
    const repo = await Repository.findById(repoId);
    assertOwnership(repo, userId);
    return repo;
  }

  static async getRepositoryFiles(userId, repoId) {
    const repo = await Repository.findById(repoId).select('files ownerId name');
    assertOwnership(repo, userId);
    return repo.files || [];
  }

  static async getFileContent(userId, repoId, fileId) {
    const repo = await Repository.findById(repoId);
    assertOwnership(repo, userId);
    const file = repo.files.find((f) => f.id === fileId || f.path === fileId);
    if (!file) {
      throw ApiError.notFound(`File '${fileId}' not found in repository`);
    }
    return file;
  }

  static async createRepository(userId, payload) {
    const existing = await Repository.findOne({ ownerId: userId, name: payload.name });
    if (existing) {
      throw ApiError.conflict(`A repository named '${payload.name}' already exists in your workspace`);
    }

    const newRepo = await Repository.create({
      name: payload.name,
      description: payload.description || 'Imported codebase',
      url: payload.url,
      defaultBranch: payload.branch || 'main',
      ownerId: userId,
      projectId: payload.projectId || null,
      languages: [{ name: 'JavaScript', percentage: 100, color: '#F7DF1E' }],
      fileCount: 2,
      indexStatus: 'completed',
      lastIndexedAt: new Date(),
      stats: {
        commits: 1,
        branches: 1,
        contributors: 1,
        stars: 0,
        linesOfCode: '120',
      },
      files: [
        {
          id: `file-${Date.now()}-1`,
          name: 'index.js',
          path: 'src/index.js',
          type: 'file',
          language: 'javascript',
          size: '420 B',
          content: `// Repository: ${payload.name}\nconsole.log("Initialized repository in CodePilot AI");\n`,
        },
        {
          id: `file-${Date.now()}-2`,
          name: 'README.md',
          path: 'README.md',
          type: 'file',
          language: 'markdown',
          size: '200 B',
          content: `# ${payload.name}\n\n${payload.description || 'Created via CodePilot API'}\n`,
        },
      ],
    });

    return newRepo;
  }

  static async triggerReindex(userId, repoId) {
    const repo = await Repository.findById(repoId);
    assertOwnership(repo, userId);

    repo.indexStatus = 'indexing';
    repo.lastIndexedAt = new Date();
    await repo.save();

    // Spawn a BackgroundJob tracking this indexing operation
    const job = await BackgroundJob.create({
      ownerId: userId,
      repositoryId: repo._id,
      type: 'Symbol extraction',
      status: 'in_progress',
      progress: 25,
      duration: '4s',
      events: [
        { step: 'AST Parser Initialization', status: 'completed', time: '1s' },
        { step: 'Symbol Graph Extraction', status: 'in_progress', time: '3s' },
      ],
      logs: [
        `[${new Date().toISOString()}] Re-index triggered for repository ${repo.name}`,
        `[${new Date().toISOString()}] Parsing AST tokens across ${repo.files.length} indexed files`,
      ],
    });

    return { repository: repo, job };
  }

  static async deleteRepository(userId, repoId) {
    const repo = await Repository.findById(repoId);
    assertOwnership(repo, userId);
    await Repository.deleteOne({ _id: repoId });
    return true;
  }
}
