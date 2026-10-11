// Centralized Mock Background Jobs Data
export const mockJobs = [
  {
    id: 'job-9821',
    type: 'Repository import',
    repositoryId: 'repo-codepilot-core',
    repositoryName: 'codepilot-core',
    status: 'completed', // 'completed' | 'in_progress' | 'failed' | 'queued'
    progress: 100,
    startedAt: '2026-10-10T22:10:00Z',
    completedAt: '2026-10-10T22:15:00Z',
    duration: '5m 00s',
    error: null,
    events: [
      { step: 'Git clone & unpack', status: 'completed', time: '22:10:05' },
      { step: 'Manifest file validation', status: 'completed', time: '22:11:15' },
      { step: 'Branch & commit graph build', status: 'completed', time: '22:13:00' },
      { step: 'Import finalized', status: 'completed', time: '22:15:00' }
    ],
    logs: [
      '[2026-10-10 22:10:00] Initializing repository checkout for codepilot-core (ref: main)...',
      '[2026-10-10 22:10:05] Remote origin verified: https://github.com/truto/codepilot-core',
      '[2026-10-10 22:11:15] Validating package.json and project workspace structure...',
      '[2026-10-10 22:12:40] Processed 142 repository files across 18 directories.',
      '[2026-10-10 22:14:10] Generating commit graph metadata (524 commits detected).',
      '[2026-10-10 22:15:00] Repository import successfully finished.'
    ]
  },
  {
    id: 'job-9822',
    type: 'Symbol extraction',
    repositoryId: 'repo-codepilot-core',
    repositoryName: 'codepilot-core',
    status: 'completed',
    progress: 100,
    startedAt: '2026-10-10T22:15:05Z',
    completedAt: '2026-10-10T22:17:30Z',
    duration: '2m 25s',
    error: null,
    events: [
      { step: 'AST parser initialization', status: 'completed', time: '22:15:10' },
      { step: 'Function & class declaration scan', status: 'completed', time: '22:16:00' },
      { step: 'Symbol cross-reference indexing', status: 'completed', time: '22:17:30' }
    ],
    logs: [
      '[2026-10-10 22:15:05] Starting AST parser for JavaScript and Node.js targets...',
      '[2026-10-10 22:15:45] Discovered 482 exported functions and 38 classes.',
      '[2026-10-10 22:16:30] Resolving import graph dependencies across 42 modules...',
      '[2026-10-10 22:17:30] Symbol table successfully written to index cache.'
    ]
  },
  {
    id: 'job-9823',
    type: 'Embedding generation',
    repositoryId: 'repo-hyper-rag-pipeline',
    repositoryName: 'hyper-rag-pipeline',
    status: 'in_progress',
    progress: 64,
    startedAt: '2026-10-11T01:05:00Z',
    completedAt: null,
    duration: '22m elapsed',
    error: null,
    events: [
      { step: 'Source chunk segmentation', status: 'completed', time: '01:06:12' },
      { step: 'Dense vector embeddings', status: 'in_progress', time: '01:10:00' },
      { step: 'HNSW vector index serialization', status: 'queued', time: '--' }
    ],
    logs: [
      '[2026-10-11 01:05:00] Batch job queued: Generating 1536-dimensional embeddings...',
      '[2026-10-11 01:06:12] Segmented codebase into 1,280 semantic code chunks.',
      '[2026-10-11 01:10:00] Encoding batch 42/65 using local embedding transformer...',
      '[2026-10-11 01:25:00] Processing chunk batch 52/65 (Current throughput: 48 chunks/sec)...'
    ]
  },
  {
    id: 'job-9824',
    type: 'Index validation',
    repositoryId: 'repo-nexus-gateway',
    repositoryName: 'nexus-gateway',
    status: 'failed',
    progress: 42,
    startedAt: '2026-10-10T19:35:00Z',
    completedAt: '2026-10-10T19:37:10Z',
    duration: '2m 10s',
    error: 'Checksum mismatch detected during gateway.config.json validation pass.',
    events: [
      { step: 'Integrity scan', status: 'completed', time: '19:35:10' },
      { step: 'Config schema verification', status: 'failed', time: '19:37:10' },
      { step: 'Index publish', status: 'skipped', time: '--' }
    ],
    logs: [
      '[2026-10-10 19:35:00] Initiating index validation pass for nexus-gateway...',
      '[2026-10-10 19:36:00] Verifying file content SHAs against git commit tree...',
      '[2026-10-10 19:37:10] ERROR: gateway.config.json checksum mismatch. Parsing terminated.'
    ]
  }
];
