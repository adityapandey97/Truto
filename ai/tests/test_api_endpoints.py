import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_and_readiness_endpoints():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

    res_ready = client.get("/ready")
    assert res_ready.status_code == 200
    assert res_ready.json()["status"] == "ready"


def test_repository_indexing_and_search_flow():
    repo_id = "test-synthetic-repo"

    # 1. Index repository with virtual files
    index_payload = {
        "repository_id": repo_id,
        "owner_id": "test-user",
        "files": [
            {
                "path": "math.py",
                "content": "def add(a, b):\n    return a + b\n\ndef divide(a, b):\n    return a / b",
            },
            {
                "path": "auth.js",
                "content": "export function authenticate(token) {\n  return token ? true : false;\n}",
            },
        ],
    }

    res_index = client.post(f"/api/v1/repositories/{repo_id}/index", json=index_payload)
    assert res_index.status_code == 200
    assert res_index.json()["status"] == "completed"
    assert res_index.json()["files_indexed"] == 2
    assert res_index.json()["chunks_created"] > 0

    # 2. Check index status
    res_status = client.get(f"/api/v1/repositories/{repo_id}/index-status")
    assert res_status.status_code == 200
    assert res_status.json()["status"] == "completed"

    # 3. Search codebase
    search_payload = {"repository_id": repo_id, "query": "divide numbers", "limit": 5}
    res_search = client.post(f"/api/v1/repositories/{repo_id}/search", json=search_payload)
    assert res_search.status_code == 200
    assert res_search.json()["total"] > 0
    assert res_search.json()["results"][0]["file_path"] == "math.py"

    # 4. Chat Q&A with repository grounding
    chat_payload = {"repository_id": repo_id, "message": "How does authentication function in this repo?"}
    res_chat = client.post(f"/api/v1/repositories/{repo_id}/chat", json=chat_payload)
    assert res_chat.status_code == 200
    assert "answer" in res_chat.json()
    assert len(res_chat.json()["citations"]) > 0

    # 5. Agent run execution
    agent_payload = {"repository_id": repo_id, "prompt": "Trace math divide function"}
    res_agent = client.post(f"/api/v1/repositories/{repo_id}/agent-runs", json=agent_payload)
    assert res_agent.status_code == 200
    run_id = res_agent.json()["run_id"]
    assert res_agent.json()["status"] == "COMPLETED"

    # Fetch agent run status
    res_get_run = client.get(f"/api/v1/agent-runs/{run_id}")
    assert res_get_run.status_code == 200
    assert res_get_run.json()["run_id"] == run_id

    # 6. Propose and validate multi-file patch
    patch_payload = {
        "repository_id": repo_id,
        "task_description": "Validate denominator in divide",
        "affected_files": ["math.py"],
    }
    res_patch = client.post(f"/api/v1/repositories/{repo_id}/patches", json=patch_payload)
    assert res_patch.status_code == 200
    patch_id = res_patch.json()["patch_id"]

    res_val = client.post(f"/api/v1/patches/{patch_id}/validate")
    assert res_val.status_code == 200
    assert res_val.json()["is_valid"] is True

    # 7. Apply patch
    res_apply = client.post(f"/api/v1/patches/{patch_id}/apply", json={"patch_id": patch_id, "repository_id": repo_id})
    assert res_apply.status_code == 200
    assert res_apply.json()["status"] == "applied"

    # 8. Generate tests
    gen_payload = {"file_path": "math.py", "symbol_name": "add"}
    res_tests = client.post(f"/api/v1/repositories/{repo_id}/generate-tests", json=gen_payload)
    assert res_tests.status_code == 200
    assert len(res_tests.json()["tests"]) > 0
