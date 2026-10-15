from typing import List, Optional
from pydantic import BaseModel, Field


class SearchQuery(BaseModel):
    repository_id: str
    query: str = Field(..., min_length=1)
    limit: int = Field(default=8, ge=1, le=50)
    language: Optional[str] = None
    symbol_only: bool = False


class SearchResultItem(BaseModel):
    file_path: str
    start_line: int
    end_line: int
    symbol_name: Optional[str] = None
    symbol_type: Optional[str] = None
    content: str
    score: float
    retrieval_type: str  # lexical, semantic, hybrid


class SearchResponse(BaseModel):
    repository_id: str
    query: str
    results: List[SearchResultItem]
    total: int
