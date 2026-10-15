import pytest
from app.services.llm_provider import MockLLMProvider


@pytest.mark.asyncio
async def test_mock_llm_provider_generation():
    provider = MockLLMProvider()

    # Grounded query with context
    prompt = "RETRIEVED REPOSITORY CONTEXT\nFile: auth.js\nExplain how JWT verification works"
    resp = await provider.generate(prompt)

    assert resp.content is not None
    assert "authenticate" in resp.content.lower() or "jwt" in resp.content.lower()
    assert resp.tokens_used > 0


@pytest.mark.asyncio
async def test_mock_llm_streaming():
    provider = MockLLMProvider()
    stream_chunks = []

    async for chunk in provider.generate_stream("How is database connected?"):
        stream_chunks.append(chunk)

    assert len(stream_chunks) > 0
    full_text = "".join(stream_chunks)
    assert len(full_text) > 10
