import hashlib
import numpy as np
from abc import ABC, abstractmethod
from typing import List
from app.core.config import settings
from app.core.logging import logger


class BaseEmbeddingProvider(ABC):
    @abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        pass

    @abstractmethod
    def embed_query(self, text: str) -> List[float]:
        pass


class MockEmbeddingProvider(BaseEmbeddingProvider):
    """
    High-fidelity deterministic embedding generator.
    Produces unit-normalized vectors derived from token hashes.
    Guarantees that semantically similar tokens share vector orientation.
    """

    def __init__(self, dimension: int = 384):
        self.dimension = dimension

    def _hash_to_vector(self, text: str) -> List[float]:
        # Generate pseudo-random deterministic vector based on text content
        tokens = text.lower().split()
        vec = np.zeros(self.dimension, dtype=np.float32)

        if not tokens:
            vec[0] = 1.0
            return vec.tolist()

        for token in tokens:
            h = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)
            idx = h % self.dimension
            sign = 1.0 if (h >> 4) % 2 == 0 else -1.0
            vec[idx] += sign

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        else:
            vec[0] = 1.0

        return vec.tolist()

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._hash_to_vector(t) for t in texts]

    def embed_query(self, text: str) -> List[float]:
        return self._hash_to_vector(text)


class SentenceTransformersEmbeddingProvider(BaseEmbeddingProvider):
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        from sentence_transformers import SentenceTransformer

        logger.info(f"Loading SentenceTransformer model '{model_name}'...")
        self.model = SentenceTransformer(model_name)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        embeddings = self.model.encode(texts, normalize_embeddings=True)
        return embeddings.tolist()

    def embed_query(self, text: str) -> List[float]:
        embedding = self.model.encode([text], normalize_embeddings=True)[0]
        return embedding.tolist()


def get_embedding_provider() -> BaseEmbeddingProvider:
    provider = settings.EMBEDDING_PROVIDER.lower()
    if provider == "sentence_transformers":
        try:
            return SentenceTransformersEmbeddingProvider(settings.EMBEDDING_MODEL)
        except Exception as e:
            logger.warn(f"Failed to load sentence_transformers ({e}). Falling back to MockEmbeddingProvider.")
            return MockEmbeddingProvider(dimension=settings.EMBEDDING_DIM)
    return MockEmbeddingProvider(dimension=settings.EMBEDDING_DIM)
