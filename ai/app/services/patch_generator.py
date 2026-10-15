import difflib
import hashlib
import uuid
from typing import List, Dict, Any, Tuple
from app.schemas.patches import FilePatch, ProposedPatchResponse
from app.services.patch_validator import PatchValidator


class PatchGenerator:
    @staticmethod
    def create_diff(file_path: str, old_content: str, new_content: str) -> str:
        old_lines = old_content.splitlines(keepends=True)
        new_lines = new_content.splitlines(keepends=True)

        diff_lines = list(
            difflib.unified_diff(
                old_lines,
                new_lines,
                fromfile=f"a/{file_path}",
                tofile=f"b/{file_path}",
                lineterm="",
            )
        )
        return "\n".join(diff_lines)

    @staticmethod
    def propose_multi_file_patch(
        repository_id: str,
        title: str,
        description: str,
        edits: List[Dict[str, str]],  # [{ path, old_content, new_content }]
    ) -> ProposedPatchResponse:
        patch_id = f"patch-{uuid.uuid4().hex[:12]}"
        file_patches: List[FilePatch] = []
        combined_diffs = []
        current_files: Dict[str, str] = {}

        for edit in edits:
            path = edit["path"]
            old = edit.get("old_content", "")
            new = edit["new_content"]
            old_hash = hashlib.sha256(old.encode("utf-8")).hexdigest()
            current_files[path] = old

            diff = PatchGenerator.create_diff(path, old, new)
            combined_diffs.append(diff)

            file_patches.append(
                FilePatch(
                    file_path=path,
                    original_hash=old_hash,
                    new_content=new,
                    diff=diff,
                )
            )

        # Validate proposed patch
        is_valid, validation_errors = PatchValidator.validate_file_patches(
            [fp.model_dump() for fp in file_patches], current_files
        )

        return ProposedPatchResponse(
            patch_id=patch_id,
            repository_id=repository_id,
            title=title,
            description=description,
            diff="\n\n".join(combined_diffs),
            files=file_patches,
            status="pending",
            validation_status="valid" if is_valid else "invalid",
            validation_errors=validation_errors,
        )

    @staticmethod
    def apply_patch_to_memory(
        file_patches: List[FilePatch], current_files: Dict[str, str]
    ) -> Tuple[bool, Dict[str, str], List[str]]:
        """
        Validates hashes and safely updates the files in memory.
        """
        is_valid, errors = PatchValidator.validate_file_patches(
            [fp.model_dump() for fp in file_patches], current_files
        )
        if not is_valid:
            return False, current_files, errors

        updated = dict(current_files)
        for fp in file_patches:
            updated[fp.file_path] = fp.new_content

        return True, updated, []
