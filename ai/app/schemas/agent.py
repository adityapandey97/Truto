from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AgentRunRequest(BaseModel):
    repository_id: str
    prompt: str = Field(..., min_length=3)
    max_iterations: Optional[int] = None


class AgentStep(BaseModel):
    iteration: int
    state: str  # PLANNING, RETRIEVING, TOOL_EXECUTION, EVALUATION, VERIFICATION
    thought: str
    tool_name: Optional[str] = None
    tool_input: Optional[Dict[str, Any]] = None
    tool_output: Optional[Any] = None


class AgentRunResponse(BaseModel):
    run_id: str
    repository_id: str
    status: str  # PLANNING, RETRIEVING, TOOL_EXECUTION, EVALUATION, VERIFICATION, COMPLETED, FAILED, CANCELLED
    prompt: str
    plan: List[str] = []
    steps: List[AgentStep] = []
    result: Optional[str] = None
    error: Optional[str] = None
