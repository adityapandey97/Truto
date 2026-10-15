import pytest
from app.services.agent_orchestrator import AgentOrchestrator
from app.services.tool_registry import tool_registry
from app.repositories.indexing_repository import indexing_repository


@pytest.mark.asyncio
async def test_tool_registry():
    # Verify core tools are registered
    definitions = tool_registry.get_definitions()
    tool_names = {t.name for t in definitions}

    assert "search_code" in tool_names
    assert "read_file" in tool_names
    assert "propose_patch" in tool_names
    assert "verify_code" in tool_names


@pytest.mark.asyncio
async def test_agent_orchestrator_execution(synthetic_files):
    # Index synthetic repository files first
    indexing_repository.save_indexed_repository(
        repository_id="test-repo",
        files=synthetic_files,
        chunks=[
            {
                "chunk_id": "c-1",
                "file_path": "math_utils.py",
                "language": "python",
                "start_line": 1,
                "end_line": 8,
                "symbol_name": "divide",
                "symbol_type": "function",
                "content": "def divide(a, b):\n    return a / b",
                "content_hash": "hash1",
            }
        ],
    )

    result = await AgentOrchestrator.run(
        repository_id="test-repo",
        prompt="Identify bug in divide function and inspect caller",
        max_iterations=4,
    )

    assert result.status == "COMPLETED"
    assert len(result.plan) > 0
    assert len(result.steps) >= 3

    # Check finite state machine progression
    states = [step.state for step in result.steps]
    assert "PLANNING" in states
    assert "RETRIEVING" in states
    assert "COMPLETED" in states
