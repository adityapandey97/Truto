import os
import sys
import pytest

# Ensure ai directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.repositories.indexing_repository import indexing_repository
from app.repositories.vector_repository import vector_repository

settings.ENVIRONMENT = "test"
settings.LLM_PROVIDER = "mock"
settings.EMBEDDING_PROVIDER = "mock"


@pytest.fixture(autouse=True)
def clean_repositories():
    indexing_repository.jobs.clear()
    indexing_repository.documents.clear()
    indexing_repository.chunks.clear()
    indexing_repository.agent_runs.clear()
    indexing_repository.patches.clear()
    vector_repository._in_memory_vectors.clear()
    yield


@pytest.fixture
def synthetic_files():
    fixtures_dir = os.path.join(os.path.dirname(__file__), "fixtures", "synthetic_repo")
    files = []
    for fname in ["math_utils.py", "calculator.py", "auth_flow.js"]:
        fpath = os.path.join(fixtures_dir, fname)
        if os.path.exists(fpath):
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
            files.append({"path": fname, "content": content})
    return files
