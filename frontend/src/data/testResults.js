// Centralized Mock Test Results Data
export const mockTestSummary = {
  total: 48,
  passed: 44,
  failed: 3,
  skipped: 1,
  duration: '4.82s',
  lastRunAt: '2026-10-10T23:50:00Z',
  historicalTrend: [
    { date: 'Oct 05', passed: 38, failed: 5, skipped: 2 },
    { date: 'Oct 06', passed: 40, failed: 4, skipped: 2 },
    { date: 'Oct 07', passed: 41, failed: 4, skipped: 1 },
    { date: 'Oct 08', passed: 43, failed: 3, skipped: 1 },
    { date: 'Oct 09', passed: 44, failed: 3, skipped: 1 },
    { date: 'Oct 10', passed: 44, failed: 3, skipped: 1 }
  ]
};

export const mockTestSuites = [
  {
    id: 'suite-auth',
    suiteName: 'src/auth/jwtMiddleware.test.js',
    repository: 'codepilot-core',
    total: 12,
    passed: 12,
    failed: 0,
    skipped: 0,
    duration: '0.94s',
    testCases: [
      { id: 't-1', name: 'returns 401 if authorization header is absent', status: 'passed', duration: '14ms' },
      { id: 't-2', name: 'verifies valid bearer token and injects req.user', status: 'passed', duration: '28ms' },
      { id: 't-3', name: 'returns 403 on expired jwt signature', status: 'passed', duration: '22ms' },
      { id: 't-4', name: 'handles malformed token payload gracefully', status: 'passed', duration: '19ms' }
    ]
  },
  {
    id: 'suite-indexer',
    suiteName: 'src/indexer/symbolParser.test.js',
    repository: 'codepilot-core',
    total: 16,
    passed: 14,
    failed: 2,
    skipped: 0,
    duration: '1.45s',
    testCases: [
      { id: 't-5', name: 'extracts standard function declarations', status: 'passed', duration: '32ms' },
      { id: 't-6', name: 'extracts arrow function variable declarations', status: 'passed', duration: '41ms' },
      { id: 't-7', name: 'extracts ES6 class declarations', status: 'passed', duration: '35ms' },
      { 
        id: 't-8', 
        name: 'safely terminates when encountering unbounded regex loops', 
        status: 'failed', 
        duration: '500ms',
        error: 'AssertionError: expected parse time < 100ms, but received 500ms timeout',
        stackTrace: `AssertionError: Timeout exceeded in SymbolParser.parseSymbols()
    at Context.<anonymous> (test/symbolParser.test.js:48:12)
    at processImmediate (node:internal/timers:478:21)`
      },
      { 
        id: 't-9', 
        name: 'identifies typescript typed function signatures', 
        status: 'failed', 
        duration: '18ms',
        error: 'TypeError: Cannot read properties of undefined (reading "returnType")',
        stackTrace: `TypeError: SymbolParser does not yet parse TS returnType annotations
    at SymbolParser.parseSymbols (src/indexer/symbolParser.js:34:18)`
      }
    ]
  },
  {
    id: 'suite-gateway',
    suiteName: 'gateway/rateLimiter.test.js',
    repository: 'nexus-gateway',
    total: 10,
    passed: 9,
    failed: 1,
    skipped: 0,
    duration: '1.10s',
    testCases: [
      { id: 't-10', name: 'allows requests within sliding window threshold', status: 'passed', duration: '24ms' },
      { 
        id: 't-11', 
        name: 'rejects requests exceeding 100 req/min with HTTP 429', 
        status: 'failed', 
        duration: '85ms',
        error: 'Expected 429 Too Many Requests, received 200 OK (limiter storage key collision)'
      }
    ]
  },
  {
    id: 'suite-rag',
    suiteName: 'pipeline/embeddings.test.py',
    repository: 'hyper-rag-pipeline',
    total: 10,
    passed: 9,
    failed: 0,
    skipped: 1,
    duration: '1.33s',
    testCases: [
      { id: 't-12', name: 'generates 1536-dim vector for code snippet', status: 'passed', duration: '120ms' },
      { id: 't-13', name: 'GPU accelerated batch embedding pass', status: 'skipped', duration: '0ms', reason: 'CUDA device not available in local test environment' }
    ]
  }
];
