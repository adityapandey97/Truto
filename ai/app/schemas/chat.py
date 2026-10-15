from typing import List, Optional
from pydantic import BaseModel, Field


class SourceCitation(BaseModel):
    file_path: str
    start_line: int
    end_line: int
    symbol_name: Optional[str] = None
    snippet: str


class ChatRequest(BaseModel):
    repository_id: str
    message: str = Field(..., min_length=1, description="User query or instruction")
    conversation_id: Optional[str] = None
    stream: bool = False


class ChatResponse(BaseModel):
    answer: str
    citations: List[SourceCitation] = []
    tokens_used: int = 0
    model: str
    repository_id: str
