from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class VirtualFile(BaseModel):
    path: str
    content: str
    language: Optional[str] = None
    size: Optional[int] = None


class IndexRepositoryRequest(BaseModel):
    repository_id: str = Field(..., description="Unique repository identifier")
    owner_id: str = Field(default="system", description="Owner or tenant ID")
    snapshot_path: Optional[str] = Field(None, description="Local disk path to cloned repository")
    files: Optional[List[VirtualFile]] = Field(None, description="Direct virtual file array if in-memory")
    reindex: bool = Field(default=False, description="Force incremental or full re-indexing")


class IndexStatusResponse(BaseModel):
    repository_id: str
    status: str  # queued, processing, completed, failed, cancelled
    progress: int = 0
    files_indexed: int = 0
    chunks_created: int = 0
    error: Optional[str] = None
    completed_at: Optional[str] = None


class CodeSymbolSchema(BaseModel):
    name: str
    type: str  # function, class, method, import, struct, interface
    file_path: str
    start_line: int
    end_line: int
    parameters: Optional[List[str]] = None
    docstring: Optional[str] = None
