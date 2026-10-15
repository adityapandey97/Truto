import time
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(tags=["Health & Diagnostics"])
START_TIME = time.time()


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "codepilot-ai-service",
        "uptime_seconds": int(time.time() - START_TIME),
        "environment": settings.ENVIRONMENT,
        "llm_provider": settings.LLM_PROVIDER,
        "embedding_provider": settings.EMBEDDING_PROVIDER,
    }


@router.get("/ready")
async def readiness_check():
    return {
        "status": "ready",
        "pgvector_enabled": settings.ENABLE_PGVECTOR,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
