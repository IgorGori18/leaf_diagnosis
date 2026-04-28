from __future__ import annotations

from typing import Any


def _disease_probability_percent(item: dict[str, Any]) -> int:
    if item.get("probability_percent") is not None:
        try:
            return int(item["probability_percent"])
        except (TypeError, ValueError):
            pass
    if item.get("confidence") is not None:
        try:
            return int(round(float(item["confidence"]) * 100))
        except (TypeError, ValueError):
            pass
    if item.get("score") is not None:
        try:
            return int(round(float(item["score"]) * 100))
        except (TypeError, ValueError):
            pass
    return 0


def _diseases_block(diseases_top3: list[dict[str, Any]] | None) -> str:
    if not diseases_top3:
        return ""
    lines: list[str] = []
    for item in diseases_top3[:3]:
        name = str(item.get("name", "")).strip()
        percent = _disease_probability_percent(item)
        if name:
            lines.append(f"- {name} — {percent}%")
    if not lines:
        return ""
    return "Возможные болезни по фото:\n" + "\n".join(lines) + "\n"


def build_qwen_prompt(
    plant_name: str,
    symptoms_ru: list[str],
    diseases_top3: list[dict[str, Any]] | None = None,
) -> str:
    symptoms_block = ", ".join(symptoms_ru) if symptoms_ru else "симптомы минимальны или отсутствуют"
    diseases_block = _diseases_block(diseases_top3)
    return (
        "Ты — помощник по анализу состояния растений.\n"
        "Тебе передаются название растения, симптомы и иногда подсказки по фото.\n"
        "Верни только JSON, без пояснений, без markdown и без лишнего текста.\n"
        "Критично: весь вывод строго на русском языке. Не используй английские слова и латиницу.\n"
        "Формат строго:\n"
        '{"status":"здоровое|есть признаки проблемы|недостаточно данных",'
        '"confidence":0,"possible_causes":["..."],"recommendations":["...","..."],"comment":"..."}\n'
        "Правила:\n"
        "- Не ставь точный диагноз.\n"
        "- Не предлагай химические препараты и лечение.\n"
        "- Не давай опасные или агрессивные советы.\n"
        "- Пиши коротко и по делу, простыми словами.\n"
        "- possible_causes: 1-3 простых причины.\n"
        "- recommendations: ровно 2 короткие безопасные рекомендации (до 12 слов каждая).\n"
        "- confidence: число от 0 до 1.\n"
        "- Если много явных симптомов, статус не может быть 'здоровое'.\n"
        "- Подсказки PlantNet по болезням — это не диагноз, а только ориентир.\n"
        "- Симптомы пользователя важнее подсказок PlantNet.\n"
        "- Если подсказки PlantNet и симптомы расходятся, опирайся в первую очередь на симптомы.\n"
        "- Запрещено упоминать препараты, химикаты, дозировки, инструкции по обработке.\n"
        "- Если не уверен, используй статус 'недостаточно данных'.\n"
        f"Растение: {plant_name}\n"
        f"Симптомы: {symptoms_block}\n"
        f"{diseases_block}"
    )
