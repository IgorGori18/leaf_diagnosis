from __future__ import annotations

SYMPTOM_OPTIONS_RU = [
    "Жёлтые листья",
    "Коричневые пятна",
    "Чёрные пятна",
    "Белый налёт",
    "Есть налёт на листьях",
    "Лист скручивается",
    "Лист деформирован",
    "Края листа засыхают",
    "Лист вянет",
    "Есть дырки или повреждения",
    "Есть следы вредителей",
    "Есть насекомые",
    "Лист теряет цвет",
    "Рост растения замедлился",
    "Листья опадают",
    "Пятна быстро распространяются",
    "Пятна с жёлтой каймой",
]

AFFECTED_AREA_SUFFIX_RU = {
    "Нижние листья": "Проблема заметна в основном на нижних листьях",
    "Верхние листья": "Проблема заметна в основном на верхних листьях",
    "Всё растение": "Проблема заметна по всему растению",
}
 
AFFECTED_AREAS_RU = list(AFFECTED_AREA_SUFFIX_RU.keys())


def normalize_selected_symptoms(selected_symptoms: list[str], affected_area: str) -> list[str]:
    normalized: list[str] = []
    allowed = set(SYMPTOM_OPTIONS_RU)
    for value in selected_symptoms:
        key = (value or "").strip()
        if key in allowed:
            normalized.append(key)
    normalized.append(AFFECTED_AREA_SUFFIX_RU.get(affected_area, AFFECTED_AREA_SUFFIX_RU["Всё растение"]))

    seen: set[str] = set()
    unique: list[str] = []
    for item in normalized:
        if item not in seen:
            seen.add(item)
            unique.append(item)
    return unique
