from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class FilePatch(BaseModel):
    file_path: str
    original_hash: str
    new_content: str
    diff: str


class ProposedPatchRequest(BaseModel):
    repository_id: str
    task_description: str = Field(..., min_length=5)
    affected_files: Optional[List[str]] = None


class ProposedPatchResponse(BaseModel):
    patch_id: str
    repository_id: str
    title: str
    description: Optional[str] = None
    diff: str
    files: List[FilePatch]
    status: str = "pending"  # pending, approved, applied, rejected
    validation_status: str = "valid"
    validation_errors: List[str] = []


class ApplyPatchRequest(BaseModel):
    patch_id: str
    repository_id: str


class VerifyPatchRequest(BaseModel):
    patch_id: str
    test_command: Optional[str] = None


class VerifyPatchResponse(BaseModel):
    patch_id: str
    passed: bool
    checks: List[Dict[str, Any]] = []
    stdout: str = ""
    stderr: str = ""
    exit_code: int = 0
    duration_ms: int = 0
