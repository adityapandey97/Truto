import os
import hashlib
from typing import List, Tuple, Dict, Any


class PatchValidator:
    """
    Validates patch safety:
    1. Rejects path traversal attempts (e.g. ../../etc/passwd)
    2. Validates original content hash match (prevents applying to stale files)
    3. Prevents overlapping edits within the same file
    """

    @staticmethod
    def validate_path(file_path: str, repo_root: str = "") -> Tuple[bool, str]:
        normalized = os.path.normpath(file_path).replace("\\", "/")

        if normalized.startswith("/") or ".." in normalized.split("/"):
            return False, f"Path traversal detected in path '{file_path}'"

        if os.path.isabs(file_path):
            return False, f"Absolute paths are forbidden: '{file_path}'"

        return True, ""

    @staticmethod
    def validate_hash(current_content: str, expected_hash: str) -> Tuple[bool, str]:
        computed = hashlib.sha256(current_content.encode("utf-8")).hexdigest()
        if computed != expected_hash:
            return False, f"Stale file detected! Expected hash {expected_hash[:8]}, found {computed[:8]}"
        return True, ""

    @staticmethod
    def validate_file_patches(
        file_patches: List[Dict[str, Any]], current_files: Dict[str, str]
    ) -> Tuple[bool, List[str]]:
        errors = []

        seen_paths = set()
        for fp in file_patches:
            path = fp.get("file_path", "")
            orig_hash = fp.get("original_hash", "")

            # Path check
            valid_path, err_p = PatchValidator.validate_path(path)
            if not valid_path:
                errors.append(err_p)
                continue

            # Duplicate file check
            if path in seen_paths:
                errors.append(f"Conflicting duplicate edits proposed for same file: '{path}'")
            seen_paths.add(path)

            # Hash check if file exists
            if path in current_files:
                valid_h, err_h = PatchValidator.validate_hash(current_files[path], orig_hash)
                if not valid_h:
                    errors.append(f"File '{path}': {err_h}")

        return len(errors) == 0, errors
