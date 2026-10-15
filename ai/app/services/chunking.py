import hashlib
from typing import List, Dict, Any, Optional
from app.schemas.repository import CodeSymbolSchema
from app.core.config import settings


class CodeChunk:
    def __init__(
        self,
        chunk_id: str,
        file_path: str,
        language: str,
        start_line: int,
        end_line: int,
        symbol_name: Optional[str],
        symbol_type: Optional[str],
        content: str,
        content_hash: str,
    ):
        self.chunk_id = chunk_id
        self.file_path = file_path
        self.language = language
        self.start_line = start_line
        self.end_line = end_line
        self.symbol_name = symbol_name
        self.symbol_type = symbol_type
        self.content = content
        self.content_hash = content_hash

    def to_dict(self) -> Dict[str, Any]:
        return {
            "chunk_id": self.chunk_id,
            "file_path": self.file_path,
            "language": self.language,
            "start_line": self.start_line,
            "end_line": self.end_line,
            "symbol_name": self.symbol_name,
            "symbol_type": self.symbol_type,
            "content": self.content,
            "content_hash": self.content_hash,
        }


class SyntaxChunker:
    """
    Syntax-aware chunker that prioritizes function and class boundaries,
    preserving exact line ranges and fallbacking safely to sliding line windows.
    """

    @staticmethod
    def chunk_file(
        code: str,
        file_path: str,
        language: str,
        symbols: List[CodeSymbolSchema],
        window_lines: int = 40,
        overlap_lines: int = 8,
    ) -> List[CodeChunk]:
        if not code.strip():
            return []

        lines = code.split("\n")
        total_lines = len(lines)
        chunks: List[CodeChunk] = []
        covered_lines = set()

        # 1. First priority: chunk explicit symbols (functions, classes)
        for sym in symbols:
            if sym.type in {"function", "class", "struct"}:
                s_line = max(1, sym.start_line)
                e_line = min(total_lines, sym.end_line)
                if s_line <= e_line:
                    chunk_text = "\n".join(lines[s_line - 1 : e_line])
                    ch_hash = hashlib.sha256(chunk_text.encode("utf-8")).hexdigest()
                    ch_id = f"{file_path}::{s_line}-{e_line}::{sym.name}"
                    chunks.append(
                        CodeChunk(
                            chunk_id=ch_id,
                            file_path=file_path,
                            language=language,
                            start_line=s_line,
                            end_line=e_line,
                            symbol_name=sym.name,
                            symbol_type=sym.type,
                            content=chunk_text,
                            content_hash=ch_hash,
                        )
                    )
                    for l in range(s_line, e_line + 1):
                        covered_lines.add(l)

        # 2. Second priority: chunk uncovered regions (imports, top-level scripts, configurations)
        step = max(1, window_lines - overlap_lines)
        current = 1
        while current <= total_lines:
            end = min(total_lines, current + window_lines - 1)
            # Only create chunk if it contains uncovered lines
            window_set = set(range(current, end + 1))
            if window_set - covered_lines:
                chunk_text = "\n".join(lines[current - 1 : end])
                ch_hash = hashlib.sha256(chunk_text.encode("utf-8")).hexdigest()
                ch_id = f"{file_path}::{current}-{end}"
                chunks.append(
                    CodeChunk(
                        chunk_id=ch_id,
                        file_path=file_path,
                        language=language,
                        start_line=current,
                        end_line=end,
                        symbol_name=None,
                        symbol_type="chunk",
                        content=chunk_text,
                        content_hash=ch_hash,
                    )
                )
            current += step

        return chunks
