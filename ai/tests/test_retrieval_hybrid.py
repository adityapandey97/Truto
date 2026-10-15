import pytest
import numpy as np
from app.services.embeddings import MockEmbeddingProvider
from app.services.lexical_search import LexicalSearchEngine
from app.services.vector_search import VectorSearchEngine
from app.services.hybrid_retrieval import HybridRetriever
from app.services.reranker import Reranker
from app.services.context_builder import ContextBuilder
from app.schemas.retrieval import SearchResultItem


def test_mock_embeddings():
    provider = MockEmbeddingProvider(dimension=128)
    vec1 = provider.embed_query("authentication token verification")
    vec2 = provider.embed_query("token authentication")
    vec3 = provider.embed_query("database postgres sql")

    assert len(vec1) == 128
    # Cosine similarity between semantically similar queries should be high
    sim_1_2 = float(np.dot(vec1, vec2))
    sim_1_3 = float(np.dot(vec1, vec3))
    assert sim_1_2 > sim_1_3


def test_lexical_and_vector_search():
    chunks = [
        {
            "chunk_id": "c1",
            "file_path": "auth.py",
            "content": "def verify_jwt(token):\n    return decode(token)",
            "start_line": 1,
            "end_line": 2,
        },
        {
            "chunk_id": "c2",
            "file_path": "db.py",
            "content": "def connect_postgres():\n    return pool.connect()",
            "start_line": 1,
            "end_line": 2,
        },
    ]

    # BM25 Lexical Search
    lex = LexicalSearchEngine()
    lex.index_chunks(chunks)
    lex_results = lex.search("verify jwt")
    assert len(lex_results) > 0
    assert lex_results[0][0]["chunk_id"] == "c1"

    # Vector Search
    provider = MockEmbeddingProvider(dimension=64)
    embeddings = provider.embed_documents([c["content"] for c in chunks])
    vec = VectorSearchEngine()
    vec.index_chunks(chunks, embeddings)
    vec_results = vec.search(provider.embed_query("jwt token"), top_k=2)
    assert len(vec_results) > 0
    assert vec_results[0][0]["chunk_id"] == "c1"


def test_hybrid_retriever_and_rrf():
    chunks = [
        {
            "chunk_id": "c1",
            "file_path": "auth.py",
            "content": "def login(user, password): pass",
            "start_line": 1,
            "end_line": 2,
            "symbol_name": "login",
            "symbol_type": "function",
        },
        {
            "chunk_id": "c2",
            "file_path": "data.py",
            "content": "def query_records(): pass",
            "start_line": 1,
            "end_line": 2,
            "symbol_name": "query_records",
            "symbol_type": "function",
        },
    ]
    emb = MockEmbeddingProvider(dimension=64)
    embeddings = emb.embed_documents([c["content"] for c in chunks])

    lex = LexicalSearchEngine()
    lex.index_chunks(chunks)
    vec = VectorSearchEngine()
    vec.index_chunks(chunks, embeddings)

    retriever = HybridRetriever(lex, vec, emb)
    results = retriever.search("login user", top_k=2)

    assert len(results) > 0
    assert results[0].file_path == "auth.py"
    assert results[0].retrieval_type in {"hybrid", "lexical", "semantic"}


def test_reranker_and_context_builder():
    items = [
        SearchResultItem(
            file_path="src/index.js",
            start_line=1,
            end_line=20,
            content="const app = express();",
            score=0.9,
            retrieval_type="hybrid",
        ),
        SearchResultItem(
            file_path="src/index.js",
            start_line=5,
            end_line=22,  # Overlapping range
            content="app.listen(5000);",
            score=0.8,
            retrieval_type="hybrid",
        ),
    ]

    filtered = Reranker.rerank_and_deduplicate(items)
    # The overlapping chunk should be deduplicated
    assert len(filtered) == 1

    context, citations = ContextBuilder.build_context(filtered)
    assert "src/index.js" in context
    assert len(citations) == 1
    assert citations[0].file_path == "src/index.js"
