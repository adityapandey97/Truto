from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.agent import AgentRunRequest, AgentRunResponse
from app.services.agent_orchestrator import AgentOrchestrator
from app.repositories.indexing_repository import indexing_repository
from app.core.security import verify_internal_service_key

router = APIRouter(tags=["Agent Orchestration"])


@router.post("/api/v1/repositories/{repository_id}/agent-runs", response_model=AgentRunResponse)
async def create_agent_run(
    repository_id: str,
    request: AgentRunRequest,
    _auth: bool = Depends(verify_internal_service_key),
):
    request.repository_id = repository_id
    run_response = await AgentOrchestrator.run(
        repository_id=repository_id,
        prompt=request.prompt,
        max_iterations=request.max_iterations,
    )
    return run_response


@router.get("/api/v1/agent-runs/{run_id}", response_model=AgentRunResponse)
async def get_agent_run(
    run_id: str,
    _auth: bool = Depends(verify_internal_service_key),
):
    data = indexing_repository.get_agent_run(run_id)
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Agent run '{run_id}' not found")
    return AgentRunResponse(**data)


@router.post("/api/v1/agent-runs/{run_id}/cancel")
async def cancel_agent_run(
    run_id: str,
    _auth: bool = Depends(verify_internal_service_key),
):
    data = indexing_repository.get_agent_run(run_id)
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Agent run '{run_id}' not found")
    data["status"] = "CANCELLED"
    indexing_repository.save_agent_run(run_id, data)
    return {"run_id": run_id, "status": "CANCELLED"}
