// Centralized Mock Repository Data
export const mockRepositories = [
  {
    id: 'repo-codepilot-core',
    name: 'codepilot-core',
    description: 'High-performance indexing engine and microservices router for repository intelligence.',
    url: 'https://github.com/truto/codepilot-core',
    defaultBranch: 'main',
    languages: [
      { name: 'JavaScript', percentage: 68, color: '#F7DF1E' },
      { name: 'Node.js', percentage: 22, color: '#339933' },
      { name: 'CSS', percentage: 10, color: '#264DE4' }
    ],
    fileCount: 142,
    indexStatus: 'completed',
    lastIndexedAt: '2026-10-10T22:15:00Z',
    createdAt: '2026-08-14T10:00:00Z',
    stats: {
      commits: 524,
      branches: 8,
      contributors: 14,
      stars: 342,
      linesOfCode: '34,890'
    },
    files: [
      {
        id: 'f-1',
        name: 'package.json',
        path: 'package.json',
        type: 'file',
        language: 'json',
        size: '1.2 KB',
        content: `{
  "name": "codepilot-core",
  "version": "2.4.0",
  "description": "Enterprise repository indexing engine",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "vitest run"
  },
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "jsonwebtoken": "^9.0.2",
    "winston": "^3.13.0"
  }
}`
      },
      {
        id: 'f-2',
        name: 'README.md',
        path: 'README.md',
        type: 'file',
        language: 'markdown',
        size: '2.4 KB',
        content: `# CodePilot Core Engine ⚡

Production-grade indexing service for multi-repository codebases.

## Architecture
- **Inbound Gateways**: Express.js REST & WebSockets
- **Symbol Extractor**: Tree-sitter AST parser
- **Embedding Generation**: Vectorized semantic chunking

## Getting Started
\`\`\`bash
npm install
npm run dev
\`\`\`
`
      },
      {
        id: 'f-3',
        name: '.env.example',
        path: '.env.example',
        type: 'file',
        language: 'plaintext',
        size: '420 B',
        content: `# Server Configuration
PORT=5000
NODE_ENV=development
API_PREFIX=/api/v1

# Security Settings (Demo Mock)
JWT_SECRET=demo_secret_token_change_in_production
TOKEN_EXPIRY=24h

# Database Configuration (Placeholder)
DATABASE_URL=mongodb://localhost:27017/codepilot
`
      },
      {
        id: 'f-dir-src',
        name: 'src',
        path: 'src',
        type: 'directory',
        children: [
          {
            id: 'f-4',
            name: 'index.js',
            path: 'src/index.js',
            type: 'file',
            language: 'javascript',
            size: '1.8 KB',
            content: `import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { repoRouter } from './routes/repos.js';
import { logger } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(\`\${req.method} \${req.url}\`);
  next();
});

// Primary routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/repos', repoRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

app.listen(PORT, () => {
  logger.info(\`Core engine running on port \${PORT}\`);
});
`
          },
          {
            id: 'f-dir-auth',
            name: 'auth',
            path: 'src/auth',
            type: 'directory',
            children: [
              {
                id: 'f-5',
                name: 'jwtMiddleware.js',
                path: 'src/auth/jwtMiddleware.js',
                type: 'file',
                language: 'javascript',
                size: '1.4 KB',
                content: `import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'demo_development_secret';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}
`
              }
            ]
          },
          {
            id: 'f-dir-indexer',
            name: 'indexer',
            path: 'src/indexer',
            type: 'directory',
            children: [
              {
                id: 'f-6',
                name: 'symbolParser.js',
                path: 'src/indexer/symbolParser.js',
                type: 'file',
                language: 'javascript',
                size: '2.1 KB',
                content: `/**
 * Symbol Parser - Extracts AST node declarations
 */
export class SymbolParser {
  constructor(language = 'javascript') {
    this.language = language;
  }

  parseSymbols(code) {
    // Regex based AST symbol extraction for lightweight indexing
    const functionRegex = /function\\s+([a-zA-Z0-9_$]+)|const\\s+([a-zA-Z0-9_$]+)\\s*=\\s*\\(/g;
    const classRegex = /class\\s+([a-zA-Z0-9_$]+)/g;
    const symbols = [];
    
    let match;
    while ((match = functionRegex.exec(code)) !== null) {
      symbols.push({
        type: 'function',
        name: match[1] || match[2],
        index: match.index
      });
    }

    while ((match = classRegex.exec(code)) !== null) {
      symbols.push({
        type: 'class',
        name: match[1],
        index: match.index
      });
    }

    return symbols;
  }
}
`
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'repo-nexus-gateway',
    name: 'nexus-gateway',
    description: 'Reverse proxy and edge routing layer with intelligent rate-limiting and telemetry.',
    url: 'https://github.com/truto/nexus-gateway',
    defaultBranch: 'main',
    languages: [
      { name: 'JavaScript', percentage: 55, color: '#F7DF1E' },
      { name: 'JSON', percentage: 25, color: '#CB171E' },
      { name: 'Shell', percentage: 20, color: '#89E051' }
    ],
    fileCount: 88,
    indexStatus: 'completed',
    lastIndexedAt: '2026-10-10T19:40:00Z',
    createdAt: '2026-09-02T14:30:00Z',
    stats: {
      commits: 210,
      branches: 4,
      contributors: 8,
      stars: 180,
      linesOfCode: '18,420'
    },
    files: [
      {
        id: 'ng-1',
        name: 'gateway.config.json',
        path: 'gateway.config.json',
        type: 'file',
        language: 'json',
        size: '890 B',
        content: `{
  "gateway": {
    "port": 8080,
    "timeoutMs": 5000,
    "rateLimit": {
      "windowMs": 60000,
      "maxRequests": 1000
    },
    "routes": [
      { "prefix": "/api/v1/auth", "upstream": "http://auth-service:5001" },
      { "prefix": "/api/v1/repos", "upstream": "http://repo-service:5002" },
      { "prefix": "/api/v1/ai", "upstream": "http://ai-service:8000" }
    ]
  }
}`
      },
      {
        id: 'ng-2',
        name: 'README.md',
        path: 'README.md',
        type: 'file',
        language: 'markdown',
        size: '1.1 KB',
        content: `# Nexus Gateway

Enterprise API proxy and edge routing for CodePilot AI infrastructure.
`
      }
    ]
  },
  {
    id: 'repo-hyper-rag-pipeline',
    name: 'hyper-rag-pipeline',
    description: 'Vector embeddings orchestration and contextual chunk retrieval pipeline.',
    url: 'https://github.com/truto/hyper-rag-pipeline',
    defaultBranch: 'develop',
    languages: [
      { name: 'Python', percentage: 85, color: '#3572A5' },
      { name: 'Dockerfile', percentage: 15, color: '#384d54' }
    ],
    fileCount: 64,
    indexStatus: 'indexing',
    lastIndexedAt: '2026-10-11T01:10:00Z',
    createdAt: '2026-09-18T16:15:00Z',
    stats: {
      commits: 145,
      branches: 3,
      contributors: 6,
      stars: 265,
      linesOfCode: '12,900'
    },
    files: [
      {
        id: 'hr-1',
        name: 'requirements.txt',
        path: 'requirements.txt',
        type: 'file',
        language: 'plaintext',
        size: '340 B',
        content: `fastapi>=0.110.0
uvicorn>=0.28.0
numpy>=1.26.0
pydantic>=2.6.0
`
      },
      {
        id: 'hr-2',
        name: 'README.md',
        path: 'README.md',
        type: 'file',
        language: 'markdown',
        size: '1.5 KB',
        content: `# Hyper RAG Pipeline 🧠

Semantic search and context retrieval pipeline for CodePilot AI.
`
      }
    ]
  },
  {
    id: 'repo-truto-react-client',
    name: 'truto-react-client',
    description: 'CodePilot AI frontend web application with Monaco integration and reactive workspace.',
    url: 'https://github.com/adityapandey97/Truto',
    defaultBranch: 'main',
    languages: [
      { name: 'JavaScript', percentage: 70, color: '#F7DF1E' },
      { name: 'CSS', percentage: 20, color: '#264DE4' },
      { name: 'HTML', percentage: 10, color: '#E34F26' }
    ],
    fileCount: 95,
    indexStatus: 'completed',
    lastIndexedAt: '2026-10-11T02:00:00Z',
    createdAt: '2026-10-11T00:00:00Z',
    stats: {
      commits: 88,
      branches: 2,
      contributors: 3,
      stars: 94,
      linesOfCode: '16,200'
    },
    files: [
      {
        id: 'tr-1',
        name: 'package.json',
        path: 'package.json',
        type: 'file',
        language: 'json',
        size: '1.1 KB',
        content: `{
  "name": "truto-react-client",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}`
      }
    ]
  }
];
