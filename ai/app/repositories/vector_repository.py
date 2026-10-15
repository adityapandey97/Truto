from typing import List, Dict, Any, Tuple
import numpy as np
from app.core.config import settings
from app.core.logging import logger


class VectorRepository:
    """
    Manages vector embeddings and similarity queries.
    Uses PostgreSQL with pgvector when available; otherwise operates via
    a high-performance in-memory vector store.
    """

    def __init__(self):
        # In-memory storage: repo_id -> List[{ chunk_id, embedding, metadata }]
        self._in_memory_vectors: Dict[str, List[Dict[str, Any]]] = {}

    async def insert_chunks(
        self, repository_id: str, chunks: List[Dict[str, Any]], embeddings: List[List[float]]
    ):
        if settings.ENABLE_PGVECTOR:
            # PostgreSQL pgvector insertion branch
            try:
                import asyncpg

                conn = await asyncpg.connect(settings.POSTGRES_URI)
                try:
                    for chunk, emb in zip(chunks, embeddings):
                        emb_str = f"[{','.join(str(x) for x in emb)}]"
                        await conn.execute(
                            """
                            INSERT INTO code_chunks 
                            (repository_id, file_path, language, start_line, end_line, symbol_name, symbol_type, content, content_hash, embedding)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::vector)
                            """,
                            repository_id,
                            chunk["file_path"],
                            chunk["language"],
                            chunk["start_line"],
                            chunk["end_line"],
                            chunk.get("symbol_name"),
                            chunk.get("symbol_type"),
                            chunk["content"],
                            chunk["content_hash"],
                            emb_str,
                        )
                finally:
                    await conn.close()
                return
            except Exception as e:
                logger.warn(f"PostgreSQL pgvector insertion failed ({e}). Storing in local memory.")

        # In-memory fallback
        if repository_id not in self._in_memory_vectors:
            self._in_memory_vectors[repository_id] = []

        for chunk, emb in zip(chunks, embeddings):
            self._in_memory_vectors[repository_id].append(
                {
                    "chunk": chunk,
                    "embedding": np.array(emb, dtype=np.float32),
                }
            )

    async def search_similar(
        self, repository_id: str, query_embedding: List[float], top_k: int = 10
    ) -> List[Tuple[Dict[str, Any], float]]:
        if settings.ENABLE_PGVECTOR:
            try:
                import asyncpg

                conn = await asyncpg.connect(settings.POSTGRES_URI)
                try:
                    emb_str = f"[{','.join(str(x) for x in query_embedding)}]"
                    rows = await conn.fetch(
                        """
                        SELECT file_path, language, start_line, end_line, symbol_name, symbol_type, content, content_hash,
                               1 - (embedding <=> $1::vector) AS similarity
                        FROM code_chunks
                        WHERE repository_id = $2
                        ORDER BY embedding <=> $1::vector
                        LIMIT $3
                        """,
                        emb_str,
                        repository_id,
                        top_k,
                    )
                    return [
                        (
                            {
                                "chunk_id": f"{r['file_path']}::{r['start_line']}-{r['end_line']}",
                                "file_path": r["file_path"],
                                "language": r["language"],
                                "start_line": r["start_line"],
                                "end_line": r["end_line"],
                                "symbol_name": r["symbol_name"],
                                "symbol_type": r["symbol_type"],
                                "content": r["content"],
                                "content_hash": r["content_hash"],
                            },
                            float(r["similarity"]),
                        )
                        for r in rows
                    ]
                finally:
                    await conn.close()
            except Exception as e:
                logger.warn(f"PostgreSQL pgvector search failed ({e}). Falling back to local memory.")

        # In-memory vector cosine similarity
        items = self._in_memory_vectors.get(repository_id, [])
        if not items:
            return []

        q_vec = np.array(query_embedding, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm > 0:
            q_vec = q_vec / q_norm

        scored = []
        for item in items:
            vec = item["embedding"]
            v_norm = np.linalg.norm(vec)
            sim = float(np.dot(vec, q_vec) / (v_norm * q_norm)) if (v_norm * q_norm) > 0 else 0.0
            scored.append((item["chunk"], sim))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]


vector_repository = VectorRepository()
