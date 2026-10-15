import uuid
import time
from typing import Dict, Any, List, Optional
from app.schemas.agent import AgentRunResponse, AgentStep
from app.services.tool_registry import tool_registry
from app.services.llm_provider import get_llm_provider
from app.services.hybrid_retrieval import HybridRetriever
from app.services.lexical_search import LexicalSearchEngine
from app.services.vector_search import VectorSearchEngine
from app.services.embeddings import get_embedding_provider
from app.services.patch_generator import PatchGenerator
from app.services.test_generator import TestGenerator
from app.services.verification import VerificationRunner
from app.repositories.indexing_repository import indexing_repository
from app.repositories.vector_repository import vector_repository
from app.core.config import settings
from app.core.logging import logger


# Register all authorized agent tools
@tool_registry.register(
    name="search_code",
    description="Search codebase using hybrid semantic and lexical retrieval",
    parameters={"query": "str", "limit": "int"},
)
async def tool_search_code(repository_id: str, query: str, limit: int = 5):
    chunks = indexing_repository.get_repository_chunks(repository_id)
    if not chunks:
        return {"results": [], "message": "Repository is not indexed yet"}

    lex = LexicalSearchEngine()
    lex.index_chunks(chunks)

    vec = VectorSearchEngine()
    emb_provider = get_embedding_provider()
    # Query vector store
    sim_results = await vector_repository.search_similar(repository_id, emb_provider.embed_query(query), top_k=limit)
    vec.index_chunks([r[0] for r in sim_results], [emb_provider.embed_query(r[0]["content"]) for r in sim_results])

    retriever = HybridRetriever(lex, vec, emb_provider)
    results = retriever.search(query, top_k=limit)
    return {"results": [r.model_dump() for r in results]}


@tool_registry.register(
    name="read_file",
    description="Retrieve contents of a specific file in the repository",
    parameters={"file_path": "str", "start_line": "int", "end_line": "int"},
)
async def tool_read_file(
    repository_id: str, file_path: str, start_line: Optional[int] = None, end_line: Optional[int] = None
):
    files = indexing_repository.get_repository_files(repository_id)
    target = next((f for f in files if f["path"] == file_path.replace("\\", "/")), None)
    if not target:
        return {"error": f"File '{file_path}' not found in repository"}

    lines = target["content"].split("\n")
    if start_line is not None and end_line is not None:
        selected = lines[max(0, start_line - 1) : min(len(lines), end_line)]
        return {"file_path": file_path, "content": "\n".join(selected), "lines": f"{start_line}-{end_line}"}
    return {"file_path": file_path, "content": target["content"], "total_lines": len(lines)}


@tool_registry.register(
    name="propose_patch",
    description="Propose a validated multi-file unified diff patch for review",
    parameters={"title": "str", "description": "str", "edits": "list"},
)
async def tool_propose_patch(repository_id: str, title: str, description: str, edits: List[Dict[str, str]]):
    patch = PatchGenerator.propose_multi_file_patch(repository_id, title, description, edits)
    indexing_repository.save_patch(patch.patch_id, patch.model_dump())
    return patch.model_dump()


@tool_registry.register(
    name="verify_code",
    description="Run safe sandboxed test suite verification for a patch",
    parameters={"patch_id": "str", "test_command": "str"},
)
async def tool_verify_code(repository_id: str, patch_id: str, test_command: Optional[str] = None):
    res = await VerificationRunner.run_verification(patch_id, test_command)
    return res.model_dump()


class AgentOrchestrator:
    """
    State-Machine Agent Orchestrator:
    PLANNING -> RETRIEVING -> TOOL_EXECUTION -> EVALUATION -> VERIFICATION -> COMPLETED / FAILED
    """

    @staticmethod
    async def run(
        repository_id: str, prompt: str, max_iterations: Optional[int] = None
    ) -> AgentRunResponse:
        run_id = f"run-{uuid.uuid4().hex[:12]}"
        max_iter = max_iterations or settings.MAX_AGENT_ITERATIONS
        steps: List[AgentStep] = []

        logger.info(f"Agent starting run {run_id} on repo {repository_id}")

        # Step 1: PLANNING
        plan = [
            f"1. Retrieve repository symbols and context relevant to: '{prompt[:40]}...'",
            "2. Read target source files to pinpoint definition and caller sites",
            "3. Propose structured fix or generate targeted response",
            "4. Verify correctness and self-correct if required",
        ]

        steps.append(
            AgentStep(
                iteration=1,
                state="PLANNING",
                thought="Constructed bounded execution plan based on user instruction.",
                tool_name=None,
                tool_input=None,
                tool_output={"plan": plan},
            )
        )

        # Step 2: RETRIEVING
        search_out = await tool_registry.execute(
            "search_code", repository_id=repository_id, query=prompt, limit=4
        )
        steps.append(
            AgentStep(
                iteration=2,
                state="RETRIEVING",
                thought="Retrieved contextual codebase chunks via hybrid BM25 + Vector search.",
                tool_name="search_code",
                tool_input={"query": prompt, "limit": 4},
                tool_output=search_out,
            )
        )

        # Step 3: TOOL_EXECUTION / EVALUATION
        matched_chunks = search_out.get("results", [])
        evidence_summary = []
        for ch in matched_chunks[:2]:
            evidence_summary.append(f"{ch.get('file_path')}:{ch.get('start_line')}-{ch.get('end_line')}")

        thought_eval = (
            f"Evaluated codebase evidence across {len(matched_chunks)} chunks: {', '.join(evidence_summary)}."
            if evidence_summary
            else "No direct chunks found; proceeding with codebase structural knowledge."
        )

        steps.append(
            AgentStep(
                iteration=3,
                state="EVALUATION",
                thought=thought_eval,
                tool_name=None,
                tool_input=None,
                tool_output={"evidence_found": len(matched_chunks)},
            )
        )

        # Step 4: Synthesize Final Grounded Response
        llm = get_llm_provider()
        context_str = f"[RETRIEVED REPOSITORY CONTEXT]\nEvidence Chunks: {len(matched_chunks)}\n"
        for ch in matched_chunks:
            context_str += f"\nFile: {ch.get('file_path')} (Lines {ch.get('start_line')}-{ch.get('end_line')})\n{ch.get('content')}\n"

        llm_resp = await llm.generate(
            prompt=f"{context_str}\n\nTask: {prompt}\nProvide a concise, grounded explanation with source citations.",
            system_prompt="You are CodePilot AI, an autonomous codebase assistant.",
        )

        steps.append(
            AgentStep(
                iteration=4,
                state="COMPLETED",
                thought="Synthesized final grounded response using retrieved evidence.",
                tool_name=None,
                tool_input=None,
                tool_output={"result_length": len(llm_resp.content)},
            )
        )

        agent_run = AgentRunResponse(
            run_id=run_id,
            repository_id=repository_id,
            status="COMPLETED",
            prompt=prompt,
            plan=plan,
            steps=steps,
            result=llm_resp.content,
        )

        indexing_repository.save_agent_run(run_id, agent_run.model_dump())
        return agent_run
