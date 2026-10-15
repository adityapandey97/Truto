import numpy as np
from typing import List, Dict, Any, Tuple


class VectorSearchEngine:
    def __init__(self):
        self.chunks: List[Dict[str, Any]] = []
        self.embeddings: np.ndarray = None

    def index_chunks(self, chunks: List[Dict[str, Any]], embeddings: List[List[float]]):
        self.chunks = chunks
        if embeddings and len(embeddings) > 0:
            self.embeddings = np.array(embeddings, dtype=np.float32)
        else:
            self.embeddings = None

    def search(self, query_embedding: List[float], top_k: int = 10) -> List[Tuple[Dict[str, Any], float]]:
        if self.embeddings is None or len(self.chunks) == 0:
            return []

        q_vec = np.array(query_embedding, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm > 0:
            q_vec = q_vec / q_norm

        # Compute cosine similarities via matrix multiplication
        emb_norms = np.linalg.norm(self.embeddings, axis=1, keepdims=True)
        emb_norms[emb_norms == 0] = 1.0
        normalized_embs = self.embeddings / emb_norms

        similarities = np.dot(normalized_embs, q_vec)

        # Pair with chunks and sort descending
        scored_pairs = [(self.chunks[i], float(similarities[i])) for i in range(len(self.chunks))]
        scored_pairs.sort(key=lambda x: x[1], reverse=True)

        return scored_pairs[:top_k]
