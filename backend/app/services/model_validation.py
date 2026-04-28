from __future__ import annotations

from typing import Any

SEVERE_SYMPTOMS = {
    "Чёрные пятна",
    "Белый налёт",
    "Есть налёт на листьях",
    "Есть следы вредителей",
    "Есть насекомые",
    "Есть дырки или повреждения",
    "Пятна быстро распространяются",
    "Пятна с жёлтой каймой",
}

MODERATE_SYMPTOMS = {
    "Жёлтые листья",
    "Коричневые пятна",
    "Лист скручивается",
    "Лист деформирован",
    "Края листа засыхают",
    "Лист теряет цвет",
    "Лист вянет",
}

WEAK_SYMPTOMS = {
    "Рост растения замедлился",
    "Листья опадают",
}


def validate_model_result(
    selected_symptoms: list[str],
    model_result: dict[str, Any],
    plantnet_result: dict[str, Any],
) -> dict[str, Any]:
    raw_status = str(model_result.get("status", "недостаточно данных")).strip().lower()
    if raw_status in {"healthy", "здоровое"}:
        status = "здоровое"
    elif raw_status in {"diseased", "есть признаки проблемы"}:
        status = "есть признаки проблемы"
    else:
        status = "недостаточно данных"

    confidence = float(model_result.get("confidence", 0.0) or 0.0)
    confidence = min(1.0, max(0.0, confidence))

    severe_count = sum(1 for s in selected_symptoms if s in SEVERE_SYMPTOMS)
    moderate_count = sum(1 for s in selected_symptoms if s in MODERATE_SYMPTOMS)
    has_symptoms = len(selected_symptoms) > 0

    final_status = status
    overridden = False

    if has_symptoms:
        if severe_count >= 2:
            final_status = "есть признаки проблемы"
        elif severe_count >= 1 and moderate_count >= 2:
            final_status = "есть признаки проблемы"
        elif moderate_count >= 3:
            final_status = "недостаточно данных"

        if final_status == "здоровое" and status == "здоровое" and (severe_count >= 1 or moderate_count >= 3):
            final_status = "недостаточно данных"

        preliminary_status = str(plantnet_result.get("preliminary_status", ""))
        if preliminary_status == "Возможны признаки проблемы" and final_status == "здоровое":
            final_status = "недостаточно данных"

        overridden = final_status != status

    if overridden:
        confidence = round(confidence * 0.7, 4)

    note = "Итоговая оценка скорректирована с учётом выбранных симптомов." if overridden else ""

    return {
        "original_model_status": status,
        "final_status": final_status,
        "confidence": confidence,
        "overridden": overridden,
        "severe_count": severe_count,
        "moderate_count": moderate_count,
        "weak_count": sum(1 for s in selected_symptoms if s in WEAK_SYMPTOMS),
        "override_note": note,
    }
