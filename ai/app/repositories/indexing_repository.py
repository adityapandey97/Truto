import time
from typing import Dict, List, Optional, Any
from app.schemas.repository import IndexStatusResponse
from app.repositories.vector_repository import vector_repository


class IndexingRepository:
    def __init__(self):
        # repository_id -> IndexStatusResponse
        self.jobs: Dict[str, IndexStatusResponse] = {}
        # repository_id -> List[Dict[str, Any]] (files)
        self.documents: Dict[str, List[Dict[str, Any]]] = {}
        # repository_id -> List[Dict[str, Any]] (chunks)
        self.chunks: Dict[str, List[Dict[str, Any]]] = {}
        # run_id -> Dict[str, Any] (agent runs)
        self.agent_runs: Dict[str, Dict[str, Any]] = {}
        # patch_id -> Dict[str, Any] (patches)
        self.patches: Dict[str, Dict[str, Any]] = {}

    def set_job_status(
        self,
        repository_id: str,
        status: str,
        progress: int = 0,
        files_indexed: int = 0,
        chunks_created: int = 0,
        error: Optional[str] = None,
    ):
        completed_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()) if status in {"completed", "failed"} else None
        self.jobs[repository_id] = IndexStatusResponse(
            repository_id=repository_id,
            status=status,
            progress=progress,
            files_indexed=files_indexed,
            chunks_created=chunks_created,
            error=error,
            completed_at=completed_at,
        )

    def get_job_status(self, repository_id: str) -> Optional[IndexStatusResponse]:
        return self.jobs.get(repository_id)

    def save_indexed_repository(
        self,
        repository_id: str,
        files: List[Dict[str, Any]],
        chunks: List[Dict[str, Any]],
    ):
        self.documents[repository_id] = files
        self.chunks[repository_id] = chunks

    def get_repository_files(self, repository_id: str) -> List[Dict[str, Any]]:
        return self.documents.get(repository_id, [])

    def get_repository_chunks(self, repository_id: str) -> List[Dict[str, Any]]:
        return self.chunks.get(repository_id, [])

    def save_agent_run(self, run_id: str, run_data: Dict[str, Any]):
        self.agent_runs[run_id] = run_data

    def get_agent_run(self, run_id: str) -> Optional[Dict[str, Any]]:
        return self.agent_runs.get(run_id)

    def save_patch(self, patch_id: str, patch_data: Dict[str, Any]):
        self.patches[patch_id] = patch_data

    def get_patch(self, patch_id: str) -> Optional[Dict[str, Any]]:
        return self.patches.get(patch_id)


indexing_repository = IndexingRepository()
