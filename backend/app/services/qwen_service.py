from __future__ import annotations

import json
import logging
import re
from typing import Any

from app.core.config import settings
from app.services.ollama import ollama_generate_text
from app.services.recommendation_prompt import build_qwen_prompt

logger = logging.getLogger(__name__)


def _extract_json(raw: str) -> dict[str, Any] | None:
    if not raw:
        return None
    raw = raw.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass
    m = re.search(r"\{[\s\S]*\}", raw)
    if not m:
        return None
    try:
        return json.loads(m.group(0))
    except json.JSONDecodeError:
        return None


def build_symptom_based_fallback() -> dict[str, Any]:
    return {
        "status": "недостаточно данных",
        "confidence": 0.35,
        "possible_causes": ["стресс условий", "переувлажнение или пересушивание"],
        "recommendations": [
            "Проверьте, появляются ли похожие признаки на соседних листьях.",
            "Следите за изменением состояния растения в ближайшие дни.",
        ],
        "comment": "Результат сформирован в безопасном режиме из-за нестабильного ответа модели.",
        "fallback_used": True,
    }


async def run_qwen_analysis(
    plant_name: str,
    symptoms_ru: list[str],
    diseases_top3: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    prompt = build_qwen_prompt(plant_name, symptoms_ru, diseases_top3=diseases_top3)
    raw = await ollama_generate_text(prompt, model=settings.qwen_model)
    parsed = _extract_json(raw or "")
    if not parsed:
        logger.warning("Qwen returned invalid JSON: %s", raw)
        return build_symptom_based_fallback()
    parsed["fallback_used"] = False
    return parsed
