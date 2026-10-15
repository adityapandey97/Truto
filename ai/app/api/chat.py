from fastapi import APIRouter, Depends, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.hybrid_retrieval import HybridRetriever
from app.services.lexical_search import LexicalSearchEngine
from app.services.vector_search import VectorSearchEngine
from app.services.embeddings import get_embedding_provider
from app.services.reranker import Reranker
from app.services.context_builder import ContextBuilder
from app.services.llm_provider import get_llm_provider
from app.repositories.indexing_repository import indexing_repository
from app.repositories.vector_repository import vector_repository
from app.core.security import verify_internal_service_key

router = APIRouter(prefix="/api/v1/repositories", tags=["Repository Q&A Chat"])


@router.post("/{repository_id}/chat", response_model=ChatResponse)
async def repository_chat(
    repository_id: str,
    request: ChatRequest,
    _auth: bool = Depends(verify_internal_service_key),
):
    chunks = indexing_repository.get_repository_chunks(repository_id)

    citations = []
    context_text = ""

    # If chunks exist, perform hybrid retrieval for grounding
    if chunks:
        lex = LexicalSearchEngine()
        lex.index_chunks(chunks)

        vec = VectorSearchEngine()
        emb_provider = get_embedding_provider()
        sim_results = await vector_repository.search_similar(
            repository_id, emb_provider.embed_query(request.message), top_k=8
        )
        vec.index_chunks([r[0] for r in sim_results], [emb_provider.embed_query(r[0]["content"]) for r in sim_results])

        retriever = HybridRetriever(lex, vec, emb_provider)
        raw_results = retriever.search(request.message, top_k=8)
        filtered_results = Reranker.rerank_and_deduplicate(raw_results, max_per_file=2)

        context_text, citations = ContextBuilder.build_context(filtered_results)

    prompt = (
        f"{context_text}\n\n"
        f"User Query: {request.message}\n\n"
        f"Instruction: Answer the user query using the codebase context above. "
        f"Cite relevant files, functions, and lines. If evidence is missing, state uncertainty clearly."
    )

    llm = get_llm_provider()
    system_prompt = (
        "You are CodePilot AI, a senior repository intelligence assistant. "
        "Provide direct, technically accurate, grounded explanations with code citations."
    )

    llm_resp = await llm.generate(prompt=prompt, system_prompt=system_prompt)

    return ChatResponse(
        answer=llm_resp.content,
        citations=citations,
        tokens_used=llm_resp.tokens_used,
        model=llm_resp.model,
        repository_id=repository_id,
    )
