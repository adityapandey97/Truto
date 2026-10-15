import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    AI_SERVICE_PORT: int = 8000
    AI_SERVICE_HOST: str = "0.0.0.0"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    INTERNAL_SERVICE_KEY: str = "dev-internal-service-secret-key-32chars-min"

    # PostgreSQL & pgvector settings
    POSTGRES_URI: str = "postgresql://postgres:postgres@localhost:5432/codepilot_vectors"
    ENABLE_PGVECTOR: bool = False
    POSTGRES_POOL_MIN: int = 2
    POSTGRES_POOL_MAX: int = 10

    # LLM Provider settings
    LLM_PROVIDER: str = "mock"  # mock | openai | anthropic | ollama
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_API_KEY: Optional[str] = None
    LLM_BASE_URL: Optional[str] = None
    LLM_TEMPERATURE: float = 0.2
    LLM_MAX_TOKENS: int = 2048
    LLM_REQUEST_TIMEOUT: int = 45

    # Embedding settings
    EMBEDDING_PROVIDER: str = "mock"  # mock | sentence_transformers | openai
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    EMBEDDING_DIM: int = 384
    EMBEDDING_BATCH_SIZE: int = 32

    # Repository Indexing Limits
    MAX_REPO_FILE_SIZE_BYTES: int = 1024 * 1024  # 1 MB
    MAX_TOTAL_REPO_BYTES: int = 50 * 1024 * 1024  # 50 MB
    MAX_CHUNK_TOKENS: int = 512
    CHUNK_OVERLAP_TOKENS: int = 64

    # Agent Orchestrator Limits
    MAX_AGENT_ITERATIONS: int = 8
    MAX_TOOL_CALLS: int = 12
    VERIFICATION_TIMEOUT_SECONDS: int = 30
    SANDBOX_MEMORY_LIMIT: str = "512m"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
