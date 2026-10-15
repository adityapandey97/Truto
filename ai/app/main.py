import uuid
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import logger
from app.api.health import router as health_router
from app.api.repositories import router as repositories_router
from app.api.chat import router as chat_router
from app.api.agent import router as agent_router
from app.api.patches import router as patches_router
from app.api.tests import router as tests_router

app = FastAPI(
    title="CodePilot AI — AI & Repository Intelligence Service",
    description="Production-grade AI microservice for AST parsing, hybrid code retrieval, LLM agents, and multi-file patching.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration allowing Express backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def correlation_id_middleware(request: Request, call_next):
    req_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    start_time = time.time()

    response = await call_next(request)

    duration_ms = round((time.time() - start_time) * 1000, 2)
    response.headers["X-Request-ID"] = req_id
    response.headers["X-Response-Time"] = f"{duration_ms}ms"

    logger.info(
        f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms) [id={req_id}]"
    )
    return response


# Centralized exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_AI_SERVICE_ERROR",
                "message": str(exc),
            },
        },
    )


# Mount routers
app.include_router(health_router)
app.include_router(repositories_router)
app.include_router(chat_router)
app.include_router(agent_router)
app.include_router(patches_router)
app.include_router(tests_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.AI_SERVICE_HOST,
        port=settings.AI_SERVICE_PORT,
        reload=settings.ENVIRONMENT == "development",
    )
