from fastapi import APIRouter, HTTPException, Depends
from app.schemas.repository import IndexRepositoryRequest, IndexStatusResponse
from app.schemas.retrieval import SearchQuery, SearchResponse
from app.services.repository_loader import RepositoryLoader
from app.services.hybrid_retrieval import HybridRetriever
from app.services.lexical_search import LexicalSearchEngine
from app.services.vector_search import VectorSearchEngine
from app.services.embeddings import get_embedding_provider
from app.services.reranker import Reranker
from app.repositories.indexing_repository import indexing_repository
from app.repositories.vector_repository import vector_repository
from app.core.security import verify_internal_service_key

router = APIRouter(prefix="/api/v1/repositories", tags=["Repository Intelligence"])


@router.post("/{repository_id}/index", response_model=IndexStatusResponse)
async def index_repository(
    repository_id: str,
    request: IndexRepositoryRequest,
    _auth: bool = Depends(verify_internal_service_key),
):
    # Ensure URL param matches payload
    request.repository_id = repository_id
    result = await RepositoryLoader.index_repository(request)
    status = indexing_repository.get_job_status(repository_id)
    return status


@router.get("/{repository_id}/index-status", response_model=IndexStatusResponse)
async def get_index_status(
    repository_id: str,
    _auth: bool = Depends(verify_internal_service_key),
):
    status = indexing_repository.get_job_status(repository_id)
    if not status:
        return IndexStatusResponse(
            repository_id=repository_id,
            status="unindexed",
            progress=0,
            files_indexed=0,
            chunks_created=0,
        )
    return status


@router.post("/{repository_id}/search", response_model=SearchResponse)
async def search_repository(
    repository_id: str,
    query: SearchQuery,
    _auth: bool = Depends(verify_internal_service_key),
):
    chunks = indexing_repository.get_repository_chunks(repository_id)
    if not chunks:
        return SearchResponse(repository_id=repository_id, query=query.query, results=[], total=0)

    # Initialize search engines
    lex = LexicalSearchEngine()
    lex.index_chunks(chunks)

    vec = VectorSearchEngine()
    emb_provider = get_embedding_provider()
    sim_results = await vector_repository.search_similar(repository_id, emb_provider.embed_query(query.query), top_k=query.limit * 2)
    vec.index_chunks([r[0] for r in sim_results], [emb_provider.embed_query(r[0]["content"]) for r in sim_results])

    retriever = HybridRetriever(lex, vec, emb_provider)
    raw_results = retriever.search(query.query, top_k=query.limit * 2)
    filtered = Reranker.rerank_and_deduplicate(raw_results)[:query.limit]

    return SearchResponse(
        repository_id=repository_id,
        query=query.query,
        results=filtered,
        total=len(filtered),
    )
