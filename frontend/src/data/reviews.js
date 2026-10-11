// Centralized Mock Code Reviews Data
export const mockReviews = [
  {
    id: 'rev-101',
    title: 'feat: add rate limiting and security headers to API gateway',
    repositoryId: 'repo-codepilot-core',
    repositoryName: 'codepilot-core',
    status: 'pending', // 'pending' | 'approved' | 'rejected'
    author: 'alex.chen',
    createdAt: '2026-10-10T18:30:00Z',
    filesChanged: 2,
    additions: 28,
    deletions: 4,
    description: 'Implements sliding window rate limiting using express-rate-limit and introduces Helmet security headers.',
    changes: [
      {
        filename: 'src/index.js',
        oldCode: `import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { repoRouter } from './routes/repos.js';
import { logger } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/repos', repoRouter);

app.listen(PORT, () => {
  logger.info(\`Core engine running on port \${PORT}\`);
});`,
        newCode: `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authRouter } from './routes/auth.js';
import { repoRouter } from './routes/repos.js';
import { logger } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security and Rate Limiting
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/repos', repoRouter);

app.listen(PORT, () => {
  logger.info(\`Core engine running securely on port \${PORT}\`);
});`
      }
    ],
    comments: [
      {
        id: 'c-1',
        author: 'CodePilot AI Reviewer',
        text: 'Rate limiting window and max thresholds look well-calibrated for standard API tiers.',
        createdAt: '2026-10-10T18:35:00Z'
      }
    ]
  },
  {
    id: 'rev-102',
    title: 'fix: gracefully handle tokenizer timeout on malformed AST inputs',
    repositoryId: 'repo-codepilot-core',
    repositoryName: 'codepilot-core',
    status: 'approved',
    author: 'sarah.connor',
    createdAt: '2026-10-09T11:15:00Z',
    filesChanged: 1,
    additions: 14,
    deletions: 2,
    description: 'Catches infinite loop edge-case in regex scanner when encountering unclosed multi-line comments.',
    changes: [
      {
        filename: 'src/indexer/symbolParser.js',
        oldCode: `parseSymbols(code) {
  const functionRegex = /function\\s+([a-zA-Z0-9_$]+)/g;
  const symbols = [];
  let match;
  while ((match = functionRegex.exec(code)) !== null) {
    symbols.push({ type: 'function', name: match[1] });
  }
  return symbols;
}`,
        newCode: `parseSymbols(code) {
  if (typeof code !== 'string' || code.length === 0) return [];
  const functionRegex = /function\\s+([a-zA-Z0-9_$]+)/g;
  const symbols = [];
  let match;
  let iterations = 0;
  const MAX_ITERATIONS = 50000;

  while ((match = functionRegex.exec(code)) !== null) {
    if (++iterations > MAX_ITERATIONS) {
      console.warn('AST parse iteration ceiling reached');
      break;
    }
    symbols.push({ type: 'function', name: match[1] });
  }
  return symbols;
}`
      }
    ],
    comments: []
  },
  {
    id: 'rev-103',
    title: 'refactor: vectorize batch chunk size for hyper-rag pipeline',
    repositoryId: 'repo-hyper-rag-pipeline',
    repositoryName: 'hyper-rag-pipeline',
    status: 'rejected',
    author: 'dev.marcus',
    createdAt: '2026-10-08T09:40:00Z',
    filesChanged: 1,
    additions: 8,
    deletions: 12,
    description: 'Attempts to increase batch chunk size from 256 to 1024 tokens. Rejected due to GPU memory constraints.',
    changes: [
      {
        filename: 'pipeline/chunker.py',
        oldCode: `CHUNK_SIZE = 256
OVERLAP = 32`,
        newCode: `CHUNK_SIZE = 1024
OVERLAP = 128`
      }
    ],
    comments: [
      {
        id: 'c-2',
        author: 'lead.architect',
        text: '1024 token chunks caused OOM on testing clusters with 8GB VRAM. Needs optimization before merge.',
        createdAt: '2026-10-08T10:00:00Z'
      }
    ]
  }
];
