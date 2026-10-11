// Centralized Mock Conversations & Prompt Responses for CodePilot AI
export const mockConversations = [
  {
    id: 'conv-arch-overview',
    title: 'Architecture Overview & Request Lifecycle',
    repositoryId: 'repo-codepilot-core',
    createdAt: '2026-10-10T14:20:00Z',
    updatedAt: '2026-10-10T14:45:00Z',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Explain the architecture of this repository.',
        fileReferences: ['src/index.js', 'package.json'],
        createdAt: '2026-10-10T14:20:00Z'
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `### Architecture Analysis: \`codepilot-core\`

The repository is built around a layered microservices pattern powered by **Express.js** and an AST-driven indexing subsystem.

#### Core Layers:
1. **HTTP Ingestion Layer (\`src/index.js\`)**:
   - Central Express application configuring CORS, JSON parsing, and Winston request telemetry.
   - Routes grouped under \`/api/v1\` with dedicated sub-routers.
2. **Security & Auth Boundary (\`src/auth/\`)**:
   - Stateless JWT verification middleware (\`jwtMiddleware.js\`) intercepting protected routes.
3. **Symbol & Indexing Pipeline (\`src/indexer/\`)**:
   - \`SymbolParser\` extracts function and class identifiers using AST regex scanning.

\`\`\`javascript
// Request entry point in src/index.js
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/repos', repoRouter);
\`\`\`

> **Note**: In production (Phase 3), the in-memory symbol extraction will be enhanced by tree-sitter bindings and MongoDB vector stores.`,
        fileReferences: ['src/index.js', 'src/auth/jwtMiddleware.js', 'src/indexer/symbolParser.js'],
        createdAt: '2026-10-10T14:21:10Z'
      }
    ]
  },
  {
    id: 'conv-auth-flow',
    title: 'Explain how authentication works',
    repositoryId: 'repo-codepilot-core',
    createdAt: '2026-10-10T16:10:00Z',
    updatedAt: '2026-10-10T16:25:00Z',
    messages: [
      {
        id: 'msg-3',
        role: 'user',
        content: 'Explain how authentication works.',
        fileReferences: ['src/auth/jwtMiddleware.js'],
        createdAt: '2026-10-10T16:10:00Z'
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: `### Authentication Mechanics

Authentication is handled via Bearer JWT tokens in \`src/auth/jwtMiddleware.js\`.

1. **Header Extraction**: The middleware extracts \`Authorization: Bearer <token>\`.
2. **Signature Verification**: Validates the payload using the environment variable \`JWT_SECRET\`.
3. **Context Injection**: Attaches the decoded user payload to \`req.user\` for downstream handlers.

\`\`\`javascript
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}
\`\`\`

*Security Note*: Ensure token expiration (\`expiresIn\`) and refresh-token rotation are enforced in Phase 3.`,
        fileReferences: ['src/auth/jwtMiddleware.js'],
        createdAt: '2026-10-10T16:11:05Z'
      }
    ]
  }
];

export const suggestedPrompts = [
  'Explain the architecture of this repository.',
  'Find potential performance bottlenecks.',
  'Explain how authentication works.',
  'Trace the request flow through the backend.',
  'Identify missing error handling.',
  'Explain this function with an example.'
];

export const deterministicPromptResponses = {
  'Explain the architecture of this repository.': `### Architecture Breakdown

This repository follows a clean domain-driven structure:
- **Routing & Controllers**: Entrypoints handle HTTP parameter extraction and response serialization.
- **Service Layer**: Decoupled business logic responsible for coordination and validation.
- **Persistence / Indexing**: Specialized modules for symbol parsing and data caching.

\`\`\`bash
Client Request ──> Inbound Gateway ──> Auth Middleware ──> Domain Controller ──> Symbol Engine
\`\`\`

All modules communicate through defined interfaces for high testability and modular deployment.`,

  'Find potential performance bottlenecks.': `### Performance Audit Findings

1. **Synchronous Regex AST Parsing**:
   - In \`src/indexer/symbolParser.js\`, regex matching runs synchronously on the main thread for large files.
   - *Recommendation*: Offload parsing to worker threads or leverage stream-based tokenizers for files > 1MB.
2. **Missing In-Memory Caching**:
   - Repeated requests to identical repository files trigger re-parsing.
   - *Recommendation*: Add an LRU cache (e.g. Redis or local memoization) keyed by file commit SHA.
3. **Payload Buffering**:
   - JSON body parsing without strict content-length limits risks memory spikes during batch indexing.`,

  'Explain how authentication works.': `### Authentication Flow

1. **Credential Exchange**: The client sends credentials to \`/api/v1/auth/login\`.
2. **Token Generation**: The server signs a signed JWT containing user ID and permissions.
3. **Authorization Header**: Subsequent requests supply the token via the \`Authorization: Bearer <token>\` header.
4. **Middleware Verification**: \`jwtMiddleware.js\` intercepts requests and asserts token validity before passing control to route handlers.`,

  'Trace the request flow through the backend.': `### Request Flow Trace

1. **Incoming Request**: Client triggers an HTTP POST to \`/api/v1/repos/:id/index\`.
2. **Server Listener**: Express server in \`src/index.js\` captures the socket event.
3. **Global Middleware**: Logger writes request metadata; CORS headers validate origins.
4. **Route Dispatcher**: Request routed to \`repoRouter\`.
5. **Security Gate**: \`authenticateToken\` ensures the caller has indexer permissions.
6. **Execution**: Repository indexer schedules parsing jobs and returns an HTTP 202 Accepted.`,

  'Identify missing error handling.': `### Error Handling Review

1. **Unhandled Promise Rejections**:
   - Async route handlers lack centralized \`try/catch\` or an \`asyncHandler\` wrapper.
2. **No Global Error Middleware**:
   - An unhandled error currently terminates Express with default HTML stack traces.
3. **Missing File Size & MIME Checks**:
   - Indexer assumes all files are valid UTF-8 text without checking for binary blobs.

\`\`\`javascript
// Recommended fix: Add global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});
\`\`\``,

  'Explain this function with an example.': `### Function Analysis: \`parseSymbols\`

The \`parseSymbols\` method extracts declared functions and classes from JavaScript source text:

\`\`\`javascript
const parser = new SymbolParser('javascript');
const code = 'function calculateTotal(items) { return items.length; }';
const symbols = parser.parseSymbols(code);

console.log(symbols);
// Output: [{ type: 'function', name: 'calculateTotal', index: 0 }]
\`\`\`

**Strengths**: Extremely fast and requires zero native dependencies.
**Limitations**: Does not capture nested anonymous closures or TypeScript interface declarations.`
};
