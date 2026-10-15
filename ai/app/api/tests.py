from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from app.services.test_generator import TestGenerator
from app.services.symbol_extractor import SymbolExtractor
from app.repositories.indexing_repository import indexing_repository
from app.core.security import verify_internal_service_key

router = APIRouter(tags=["AI Test Generation"])


class GenerateTestRequest(BaseModel):
    file_path: str
    symbol_name: Optional[str] = None


@router.post("/api/v1/repositories/{repository_id}/generate-tests")
async def generate_tests(
    repository_id: str,
    request: GenerateTestRequest,
    _auth: bool = Depends(verify_internal_service_key),
):
    files = indexing_repository.get_repository_files(repository_id)
    target_file = next((f for f in files if f["path"] == request.file_path.replace("\\", "/")), None)

    if not target_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target file '{request.file_path}' not found in indexed repository",
        )

    symbols = SymbolExtractor.extract_symbols(
        target_file["content"], target_file["path"], target_file.get("language", "javascript")
    )

    if request.symbol_name:
        matched = next((s for s in symbols if s.name == request.symbol_name), None)
        if not matched:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Symbol '{request.symbol_name}' not found in file '{request.file_path}'",
            )
        test_plan = TestGenerator.generate_tests_for_symbol(
            matched, target_file.get("language", "javascript"), target_file["content"]
        )
        return {"tests": [test_plan]}

    # Generate for all detected symbols (or general file test)
    tests = [
        TestGenerator.generate_tests_for_symbol(
            sym, target_file.get("language", "javascript"), target_file["content"]
        )
        for sym in symbols[:3]
    ]

    return {"tests": tests}
