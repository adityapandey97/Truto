import os
import re
from typing import List, Set
from app.core.config import settings

IGNORED_DIRECTORIES: Set[str] = {
    ".git",
    "node_modules",
    "venv",
    ".venv",
    "env",
    "dist",
    "build",
    "out",
    "target",
    ".next",
    ".nuxt",
    ".idea",
    ".vscode",
    "coverage",
    "__pycache__",
    ".pytest_cache",
}

IGNORED_EXTENSIONS: Set[str] = {
    ".exe",
    ".dll",
    ".so",
    ".dylib",
    ".bin",
    ".zip",
    ".tar",
    ".gz",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".ico",
    ".pdf",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".mp4",
    ".mp3",
    ".pyc",
    ".pyo",
    ".pyd",
    ".map",
}

BINARY_BYTE_CHECK_SIZE = 1024


def is_binary_content(content_bytes: bytes) -> bool:
    """Checks if content has null bytes indicating a binary file."""
    return b"\x00" in content_bytes[:BINARY_BYTE_CHECK_SIZE]


class FileFilter:
    @staticmethod
    def should_index_file(file_path: str, file_size_bytes: int = 0) -> bool:
        # Check size threshold
        if file_size_bytes > settings.MAX_REPO_FILE_SIZE_BYTES:
            return False

        # Normalize path
        normalized = file_path.replace("\\", "/").strip("/")
        parts = normalized.split("/")

        # Check ignored directory names
        for part in parts:
            if part in IGNORED_DIRECTORIES:
                return False

        # Check file extension
        _, ext = os.path.splitext(normalized)
        if ext.lower() in IGNORED_EXTENSIONS:
            return False

        # Exclude lockfiles and minified bundles
        basename = os.path.basename(normalized)
        if (
            basename.endswith(".min.js")
            or basename.endswith(".min.css")
            or basename in {"package-lock.json", "yarn.lock", "pnpm-lock.yaml"}
        ):
            return False

        return True
