import os
import hashlib
from typing import List, Dict, Any, Optional
from app.schemas.repository import IndexRepositoryRequest
from app.services.file_filter import FileFilter
from app.services.language_detector import LanguageDetector
from app.services.code_parser import CodeParser
from app.services.symbol_extractor import SymbolExtractor
from app.services.chunking import SyntaxChunker
from app.services.embeddings import get_embedding_provider
from app.repositories.indexing_repository import indexing_repository
from app.repositories.vector_repository import vector_repository
from app.core.logging import logger


class RepositoryLoader:
    """
    Orchestrates repository ingestion:
    Enumeration -> Filtering -> Symbol Extraction -> Syntax Chunking -> Embedding -> Storage.
    """

    @staticmethod
    async def index_repository(request: IndexRepositoryRequest) -> Dict[str, Any]:
        repo_id = request.repository_id
        indexing_repository.set_job_status(repo_id, "processing", progress=5)

        files_to_index: List[Dict[str, Any]] = []

        # 1. Gather files from snapshot path or in-memory array
        if request.files:
            for vf in request.files:
                content = vf.content
                lang = vf.language or LanguageDetector.detect_language(vf.path)
                if FileFilter.should_index_file(vf.path, len(content.encode("utf-8"))):
                    files_to_index.append(
                        {
                            "path": vf.path.replace("\\", "/"),
                            "content": content,
                            "language": lang,
                            "size": len(content.encode("utf-8")),
                        }
                    )
        elif request.snapshot_path and os.path.exists(request.snapshot_path):
            for root, _, filenames in os.walk(request.snapshot_path):
                for fname in filenames:
                    abs_path = os.path.join(root, fname)
                    rel_path = os.path.relpath(abs_path, request.snapshot_path).replace("\\", "/")
                    fsize = os.path.getsize(abs_path)

                    if FileFilter.should_index_file(rel_path, fsize):
                        try:
                            with open(abs_path, "r", encoding="utf-8", errors="ignore") as f:
                                content = f.read()
                            lang = LanguageDetector.detect_language(rel_path)
                            files_to_index.append(
                                {
                                    "path": rel_path,
                                    "content": content,
                                    "language": lang,
                                    "size": fsize,
                                }
                            )
                        except Exception as read_err:
                            logger.warn(f"Failed to read file {rel_path}: {read_err}")

        indexing_repository.set_job_status(
            repo_id, "processing", progress=30, files_indexed=len(files_to_index)
        )

        # 2. Extract symbols and create syntax-aware chunks
        all_chunks: List[Dict[str, Any]] = []
        for file_info in files_to_index:
            path = file_info["path"]
            content = file_info["content"]
            lang = file_info["language"]

            symbols = SymbolExtractor.extract_symbols(content, path, lang)
            chunks = SyntaxChunker.chunk_file(content, path, lang, symbols)
            all_chunks.extend([c.to_dict() for c in chunks])

        indexing_repository.set_job_status(
            repo_id,
            "processing",
            progress=60,
            files_indexed=len(files_to_index),
            chunks_created=len(all_chunks),
        )

        # 3. Generate embeddings
        embedding_provider = get_embedding_provider()
        chunk_texts = [c["content"] for c in all_chunks]
        embeddings = embedding_provider.embed_documents(chunk_texts) if chunk_texts else []

        indexing_repository.set_job_status(
            repo_id,
            "processing",
            progress=85,
            files_indexed=len(files_to_index),
            chunks_created=len(all_chunks),
        )

        # 4. Save to Repository and Vector store
        indexing_repository.save_indexed_repository(repo_id, files_to_index, all_chunks)
        await vector_repository.insert_chunks(repo_id, all_chunks, embeddings)

        indexing_repository.set_job_status(
            repo_id,
            "completed",
            progress=100,
            files_indexed=len(files_to_index),
            chunks_created=len(all_chunks),
        )

        return {
            "repository_id": repo_id,
            "status": "completed",
            "files_indexed": len(files_to_index),
            "chunks_created": len(all_chunks),
        }
