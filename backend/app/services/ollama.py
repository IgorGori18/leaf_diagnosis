import logging
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


async def ollama_generate_text(prompt: str, model: str | None = None) -> str | None:
    payload: dict[str, Any] = {
        "model": model or settings.ollama_model,
        "prompt": prompt,
        "stream": False,
    }
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(settings.ollama_url, json=payload)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPError as exc:
        logger.warning("Ollama request failed: %s", exc)
        return None

    text = data.get("response")
    if text is None:
        logger.warning("Ollama response missing 'response' field: %s", data)
        return None
    return str(text).strip()
