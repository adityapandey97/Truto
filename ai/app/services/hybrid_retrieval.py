from typing import List, Dict, Any
from app.services.lexical_search import LexicalSearchEngine
from app.services.vector_search import VectorSearchEngine
from app.services.embeddings import BaseEmbeddingProvider
from app.schemas.retrieval import SearchResultItem


class HybridRetriever:
    """
    Hybrid retriever combining Lexical (BM25) and Semantic (Vector) search
    using Reciprocal Rank Fusion (RRF) with a standard constant k = 60.
    """

    def __init__(
        self,
        lexical_engine: LexicalSearchEngine,
        vector_engine: VectorSearchEngine,
        embedding_provider: BaseEmbeddingProvider,
        rrf_k: int = 60,
    ):
        self.lexical_engine = lexical_engine
        self.vector_engine = vector_engine
        self.embedding_provider = embedding_provider
        self.rrf_k = rrf_k

    def search(self, query: str, top_k: int = 8) -> List[SearchResultItem]:
        # 1. Lexical BM25 Search
        lexical_results = self.lexical_engine.search(query, top_k=top_k * 2)

        # 2. Vector Semantic Search
        query_embedding = self.embedding_provider.embed_query(query)
        vector_results = self.vector_engine.search(query_embedding, top_k=top_k * 2)

        # 3. Reciprocal Rank Fusion (RRF)
        scores: Dict[str, float] = {}
        chunk_map: Dict[str, Dict[str, Any]] = {}
        match_types: Dict[str, set] = {}

        for rank, (chunk, _) in enumerate(lexical_results, start=1):
            cid = chunk["chunk_id"]
            chunk_map[cid] = chunk
            scores[cid] = scores.get(cid, 0.0) + (1.0 / (self.rrf_k + rank))
            if cid not in match_types:
                match_types[cid] = set()
            match_types[cid].add("lexical")

        for rank, (chunk, _) in enumerate(vector_results, start=1):
            cid = chunk["chunk_id"]
            chunk_map[cid] = chunk
            scores[cid] = scores.get(cid, 0.0) + (1.0 / (self.rrf_k + rank))
            if cid not in match_types:
                match_types[cid] = set()
            match_types[cid].add("semantic")

        # Sort by composite RRF score
        sorted_cids = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)[:top_k]

        results = []
        for cid in sorted_cids:
            chunk = chunk_map[cid]
            types = match_types.get(cid, set())
            retrieval_type = "hybrid" if len(types) > 1 else list(types)[0] if types else "hybrid"

            results.append(
                SearchResultItem(
                    file_path=chunk["file_path"],
                    start_line=chunk["start_line"],
                    end_line=chunk["end_line"],
                    symbol_name=chunk.get("symbol_name"),
                    symbol_type=chunk.get("symbol_type"),
                    content=chunk["content"],
                    score=round(scores[cid], 5),
                    retrieval_type=retrieval_type,
                )
            )

        return results
