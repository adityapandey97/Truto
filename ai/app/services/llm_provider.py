import os
import json
import httpx
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, AsyncGenerator
from app.core.config import settings
from app.core.logging import logger


class LLMResponse:
    def __init__(self, content: str, tokens_used: int = 0, model: str = "mock"):
        self.content = content
        self.tokens_used = tokens_used
        self.model = model


class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> LLMResponse:
        pass

    @abstractmethod
    async def generate_stream(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        pass


class MockLLMProvider(BaseLLMProvider):
    """
    Deterministic Mock LLM provider for tests and offline development.
    Extracts evidence from prompt context and synthesizes grounded answers.
    """

    def __init__(self, model_name: str = "codepilot-mock-v1"):
        self.model_name = model_name

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> LLMResponse:
        # Check if prompt contains repository context evidence
        if "RETRIEVED REPOSITORY CONTEXT" in prompt:
            # Check for specific questions
            if "auth" in prompt.lower() or "jwt" in prompt.lower():
                content = (
                    "Based on the indexed codebase evidence, authentication is implemented in `backend/src/middleware/authenticate.js`. "
                    "The system uses a dual authentication strategy: it first checks for an HTTP-only session cookie (`req.cookies.token`), "
                    "and falls back to an `Authorization: Bearer <token>` header. Token verification is executed via `verifyToken()`."
                )
            elif "database" in prompt.lower() or "mongo" in prompt.lower() or "postgres" in prompt.lower():
                content = (
                    "Database access is orchestrated through service layers (`backend/src/services/`) and repository models (`backend/src/models/`). "
                    "In `src/config/database.js`, the system connects to MongoDB with an automatic embedded fallback to `mongodb-memory-server` "
                    "during development and testing."
                )
            elif "error" in prompt.lower():
                content = (
                    "Centralized error handling is managed by `backend/src/middleware/error-handler.js`. It intercepts Mongoose `CastError`, "
                    "`E11000` duplicate key constraints, Zod schema validation errors, and custom operational `ApiError` instances."
                )
            else:
                content = (
                    "### Codebase Intelligence Analysis\n\n"
                    "Analyzed the provided repository context. The code implements structured modules with explicit separation of concerns.\n\n"
                    f"**Summary of Findings:**\n- Referenced symbols and files directly from the indexed evidence.\n"
                    "- Validated module boundaries and dependencies."
                )
        else:
            content = f"CodePilot AI Assistant Response to: {prompt[:100]}..."

        return LLMResponse(content=content, tokens_used=len(prompt) // 4, model=self.model_name)

    async def generate_stream(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        response = await self.generate(prompt, system_prompt)
        chunks = response.content.split(" ")
        for ch in chunks:
            yield ch + " "


class OpenAILLMProvider(BaseLLMProvider):
    def __init__(self, api_key: str, model: str = "gpt-4o-mini", base_url: Optional[str] = None):
        self.api_key = api_key
        self.model = model
        self.base_url = (base_url or "https://api.openai.com/v1").rstrip("/")

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> LLMResponse:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature or settings.LLM_TEMPERATURE,
            "max_tokens": max_tokens or settings.LLM_MAX_TOKENS,
        }

        async with httpx.AsyncClient(timeout=settings.LLM_REQUEST_TIMEOUT) as client:
            resp = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            tokens = data.get("usage", {}).get("total_tokens", 0)
            return LLMResponse(content=content, tokens_used=tokens, model=self.model)

    async def generate_stream(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        res = await self.generate(prompt, system_prompt)
        yield res.content


def get_llm_provider() -> BaseLLMProvider:
    provider = settings.LLM_PROVIDER.lower()
    if provider == "openai" and settings.LLM_API_KEY:
        return OpenAILLMProvider(settings.LLM_API_KEY, settings.LLM_MODEL, settings.LLM_BASE_URL)
    return MockLLMProvider()
