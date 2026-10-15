import re
from typing import List, Dict, Any, Tuple
from rank_bm25 import BM25Plus


class LexicalSearchEngine:
    def __init__(self):
        self.chunks: List[Dict[str, Any]] = []
        self.bm25: BM25Plus = None

    def _tokenize(self, text: str) -> List[str]:
        # Replace punctuation and underscores with spaces to separate snake_case and dot syntax
        cleaned = text.replace("_", " ").replace(".", " ").replace("/", " ").replace("-", " ")
        # Split by camelCase and words
        tokens = re.findall(r"[A-Z]?[a-z]+|[A-Z]+(?=[A-Z][a-z]|\d|\W|$)|\d+|[a-zA-Z0-9]+", cleaned)
        return [t.lower() for t in tokens if len(t) > 1]

    def index_chunks(self, chunks: List[Dict[str, Any]]):
        self.chunks = chunks
        if not chunks:
            self.bm25 = None
            return

        corpus = [self._tokenize(c.get("content", "") + " " + c.get("file_path", "")) for c in chunks]
        self.bm25 = BM25Plus(corpus)

    def search(self, query: str, top_k: int = 10) -> List[Tuple[Dict[str, Any], float]]:
        if not self.bm25 or not self.chunks:
            return []

        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        scores = self.bm25.get_scores(query_tokens)
        scored_pairs = [(self.chunks[i], float(scores[i])) for i in range(len(scores)) if scores[i] > 0]
        scored_pairs.sort(key=lambda x: x[1], reverse=True)

        return scored_pairs[:top_k]
