from __future__ import annotations

import re
from typing import Any

STATUS_MAP = {
    "healthy": "Признаки проблемы не выявлены",
    "diseased": "Обнаружены признаки проблемы",
    "uncertain": "Недостаточно данных для уверенного вывода",
    "здоровое": "Признаки проблемы не выявлены",
    "есть признаки проблемы": "Обнаружены признаки проблемы",
    "недостаточно данных": "Недостаточно данных для уверенного вывода",
}


def score_to_percent(score: float, decimals: int = 1) -> float:
    return round(float(score) * 100, decimals)


def build_plantnet_preliminary_comment(plant_confidence: float) -> tuple[str, str]:
    # PlantNet stage is only for plant identification; not for disease verdict.
    _ = plant_confidence
    return (
        "По фото сложно определить состояние растения",
        "Если считаете, что растение больное, выберите симптомы, чтобы получить более точный анализ.",
    )


def _normalize_status(value: str) -> str:
    key = (value or "").strip().lower()
    if key in {"здоровое", "healthy"}:
        return "здоровое"
    if key in {"есть признаки проблемы", "diseased"}:
        return "есть признаки проблемы"
    return "недостаточно данных"


def _sanitize_causes(causes: list[Any]) -> list[str]:
    english_to_ru = {
        "pest": "вредители",
        "infestation": "вредители",
        "watering": "ошибки полива",
        "water stress": "ошибки полива",
        "sun": "избыточное солнечное освещение",
        "heat": "перегрев",
        "humidity": "повышенная влажность",
        "fungal": "грибковое поражение",
        "disease": "возможное заболевание",
        "nutrient": "дефицит питания",
        "deficiency": "дефицит питания",
    }
    out: list[str] = []
    for item in causes[:3]:
        text = str(item).strip()
        if not text:
            continue
        # Remove scientific names in parentheses to keep simple user wording.
        text = re.sub(r"\([^)]*\)", "", text).strip().strip(".,;:")
        low = text.lower()
        english_ratio = sum(1 for ch in text if "a" <= ch.lower() <= "z") / max(1, len(text))
        if english_ratio > 0.45:
            mapped = ""
            for key, ru in english_to_ru.items():
                if key in low:
                    mapped = ru
                    break
            out.append(mapped or "возможная стрессовая причина")
        else:
            out.append(text)
    if not out:
        out = ["недостаточно данных о причине"]
    return out


def _sanitize_recommendations(recs: list[Any]) -> list[str]:
    blocked = [
        "fungicide",
        "pesticide",
        "insecticide",
        "herbicide",
        "chemical",
        "дозиров",
        "препарат",
        "фунгиц",
        "инсектицид",
    ]
    out: list[str] = []
    for item in recs[:3]:
        text = str(item).strip()
        if not text:
            continue
        low = text.lower()
        if any(b in low for b in blocked):
            continue
        english_ratio = sum(1 for ch in text if "a" <= ch.lower() <= "z") / max(1, len(text))
        if english_ratio > 0.45:
            continue
        words = text.split()
        if len(words) > 12:
            text = " ".join(words[:12]).rstrip(".,;:") + "…"
        out.append(text)

    if not out:
        out = [
            "Удалите сильно повреждённые части растения, если поражение выражено.",
            "Проверьте, появляются ли похожие признаки на соседних листьях.",
            "Следите за изменением состояния растения в ближайшие дни.",
        ]
    return out[:3]


def normalize_qwen_result(data: dict[str, Any]) -> dict[str, Any]:
    status_raw = _normalize_status(str(data.get("status", "недостаточно данных")))
    confidence = float(data.get("confidence", 0.0) or 0.0)
    confidence = min(1.0, max(0.0, confidence))
    possible_causes = _sanitize_causes(data.get("possible_causes", []) or [])
    recommendations = _sanitize_recommendations(data.get("recommendations", []) or [])
    comment = str(data.get("comment", "")).strip() or "Результат сформирован на основе введённых симптомов."

    return {
        "status": status_raw,
        "status_label": STATUS_MAP[status_raw],
        "confidence": confidence,
        "confidence_percent": score_to_percent(confidence),
        "possible_causes": possible_causes,
        "recommendations": recommendations,
        "comment": comment,
    }
