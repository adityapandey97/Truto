-- =========================================================================
-- CodePilot AI: pgvector & Codebase Intelligence Migration
-- =========================================================================

-- Enable pgvector extension for high-performance vectorized similarity search
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Repository Indexing Jobs Table
CREATE TABLE IF NOT EXISTS repository_indexing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id VARCHAR(100) NOT NULL,
    owner_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'queued', -- queued, processing, completed, failed, cancelled
    progress INTEGER NOT NULL DEFAULT 0,
    files_indexed INTEGER NOT NULL DEFAULT 0,
    chunks_created INTEGER NOT NULL DEFAULT 0,
    error TEXT,
    index_version VARCHAR(50) DEFAULT 'v1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_indexing_jobs_repo_owner ON repository_indexing_jobs(repository_id, owner_id);

-- 2. Indexed Documents / File Metadata Table
CREATE TABLE IF NOT EXISTS indexed_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id VARCHAR(100) NOT NULL,
    file_path VARCHAR(1024) NOT NULL,
    language VARCHAR(50) NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    total_lines INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_repo_file_path UNIQUE (repository_id, file_path)
);

CREATE INDEX IF NOT EXISTS idx_indexed_docs_repo ON indexed_documents(repository_id);

-- 3. Code Chunks with Symbol Metadata and Vector Embeddings
-- Note: Vector dimension defaults to 384 (standard for all-MiniLM-L6-v2, configurable via ENV)
CREATE TABLE IF NOT EXISTS code_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id VARCHAR(100) NOT NULL,
    document_id UUID REFERENCES indexed_documents(id) ON DELETE CASCADE,
    file_path VARCHAR(1024) NOT NULL,
    language VARCHAR(50) NOT NULL,
    start_line INTEGER NOT NULL,
    end_line INTEGER NOT NULL,
    symbol_name VARCHAR(255),
    symbol_type VARCHAR(50), -- function, class, method, import, struct, interface, chunk
    content TEXT NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    embedding vector(384),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_code_chunks_repo ON code_chunks(repository_id);
CREATE INDEX IF NOT EXISTS idx_code_chunks_symbol ON code_chunks(symbol_name);
CREATE INDEX IF NOT EXISTS idx_code_chunks_path ON code_chunks(file_path);

-- Vector Cosine Similarity HNSW index for high-scale retrieval
CREATE INDEX IF NOT EXISTS idx_code_chunks_embedding_hnsw 
ON code_chunks USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 4. Agent Execution Runs Table
CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id VARCHAR(100) NOT NULL,
    owner_id VARCHAR(100) NOT NULL,
    prompt TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNING', -- PLANNING, RETRIEVING, TOOL_EXECUTION, EVALUATION, VERIFICATION, COMPLETED, FAILED, CANCELLED
    plan JSONB DEFAULT '[]'::jsonb,
    steps JSONB DEFAULT '[]'::jsonb,
    result TEXT,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_repo_owner ON agent_runs(repository_id, owner_id);

-- 5. Proposed Multi-File Patches Table
CREATE TABLE IF NOT EXISTS proposed_patches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_run_id UUID REFERENCES agent_runs(id) ON DELETE SET NULL,
    repository_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, applied, rejected
    diff TEXT NOT NULL,
    files JSONB NOT NULL, -- Array of { path, oldHash, newContent }
    original_hashes JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposed_patches_repo ON proposed_patches(repository_id);

-- 6. Verification Results Table
CREATE TABLE IF NOT EXISTS verification_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patch_id UUID REFERENCES proposed_patches(id) ON DELETE CASCADE,
    passed BOOLEAN NOT NULL,
    checks JSONB DEFAULT '[]'::jsonb,
    stdout TEXT,
    stderr TEXT,
    exit_code INTEGER,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_patch ON verification_results(patch_id);
