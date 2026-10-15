from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
from app.schemas.patches import (
    ProposedPatchRequest,
    ProposedPatchResponse,
    ApplyPatchRequest,
    VerifyPatchRequest,
    VerifyPatchResponse,
    FilePatch,
)
from app.services.patch_generator import PatchGenerator
from app.services.patch_validator import PatchValidator
from app.services.verification import VerificationRunner
from app.repositories.indexing_repository import indexing_repository
from app.core.security import verify_internal_service_key

router = APIRouter(tags=["Multi-File Patch Generation & Verification"])


@router.post("/api/v1/repositories/{repository_id}/patches", response_model=ProposedPatchResponse)
async def propose_patch(
    repository_id: str,
    request: ProposedPatchRequest,
    _auth: bool = Depends(verify_internal_service_key),
):
    files = indexing_repository.get_repository_files(repository_id)
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Repository contains no indexed files to generate patch against",
        )

    # Generate a contextual multi-file fix based on target files
    target_files = request.affected_files or [files[0]["path"]]
    edits = []

    for path in target_files:
        f_obj = next((f for f in files if f["path"] == path), None)
        if f_obj:
            old = f_obj["content"]
            lang = f_obj.get("language", "javascript")
            comment_prefix = "#" if (path.endswith(".py") or lang == "python") else "//"
            new = f"{comment_prefix} CodePilot AI Verified Fix: {request.task_description}\n" + old
            edits.append({"path": path, "old_content": old, "new_content": new})

    if not edits:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Specified affected files not found in repository",
        )

    patch_resp = PatchGenerator.propose_multi_file_patch(
        repository_id=repository_id,
        title=f"Fix: {request.task_description[:50]}",
        description=request.task_description,
        edits=edits,
    )

    indexing_repository.save_patch(patch_resp.patch_id, patch_resp.model_dump())
    return patch_resp


@router.post("/api/v1/patches/{patch_id}/validate")
async def validate_patch(
    patch_id: str,
    _auth: bool = Depends(verify_internal_service_key),
):
    patch_data = indexing_repository.get_patch(patch_id)
    if not patch_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Patch '{patch_id}' not found")

    repo_id = patch_data["repository_id"]
    files = indexing_repository.get_repository_files(repo_id)
    current_files = {f["path"]: f["content"] for f in files}

    is_valid, errors = PatchValidator.validate_file_patches(patch_data["files"], current_files)

    return {
        "patch_id": patch_id,
        "is_valid": is_valid,
        "errors": errors,
        "status": "valid" if is_valid else "invalid",
    }


@router.post("/api/v1/patches/{patch_id}/apply")
async def apply_patch(
    patch_id: str,
    request: ApplyPatchRequest,
    _auth: bool = Depends(verify_internal_service_key),
):
    patch_data = indexing_repository.get_patch(patch_id)
    if not patch_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Patch '{patch_id}' not found")

    repo_id = request.repository_id
    files = indexing_repository.get_repository_files(repo_id)
    current_files = {f["path"]: f["content"] for f in files}

    file_patches = [FilePatch(**fp) for fp in patch_data["files"]]
    ok, updated_files, errors = PatchGenerator.apply_patch_to_memory(file_patches, current_files)

    if not ok:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"message": "Failed to apply patch due to conflicts or stale hashes", "errors": errors},
        )

    # Update in-memory document state with preserved languages
    from app.services.language_detector import LanguageDetector
    updated_list = [
        {
            "path": k,
            "content": v,
            "language": next(
                (f.get("language") for f in files if f["path"] == k),
                LanguageDetector.detect_language(k),
            ),
        }
        for k, v in updated_files.items()
    ]
    indexing_repository.documents[repo_id] = updated_list
    patch_data["status"] = "applied"
    indexing_repository.save_patch(patch_id, patch_data)

    return {"patch_id": patch_id, "status": "applied", "files_modified": len(file_patches)}


@router.post("/api/v1/patches/{patch_id}/verify", response_model=VerifyPatchResponse)
async def verify_patch(
    patch_id: str,
    request: VerifyPatchRequest,
    _auth: bool = Depends(verify_internal_service_key),
):
    patch_data = indexing_repository.get_patch(patch_id)
    if not patch_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Patch '{patch_id}' not found")

    result = await VerificationRunner.run_verification(
        patch_id=patch_id, test_command=request.test_command
    )
    return result
