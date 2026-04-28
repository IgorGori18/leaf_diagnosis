from app.services.recommendation_prompt import build_qwen_prompt
from app.services.symptom_processing import normalize_selected_symptoms


def test_build_qwen_prompt_contains_json_rules():
    prompt = build_qwen_prompt(
        "Solanum lycopersicum",
        ["Жёлтые листья", "Лист вянет"],
        [{"name": "Фитофтороз", "probability_percent": 42}],
    )
    assert "Верни только JSON" in prompt
    assert "здоровое|есть признаки проблемы|недостаточно данных" in prompt
    assert "Solanum lycopersicum" in prompt
    assert "Возможные болезни по фото" in prompt
    assert "Фитофтороз — 42%" in prompt
    assert "Симптомы пользователя важнее" in prompt


def test_build_qwen_prompt_uses_confidence_when_no_probability_percent():
    prompt = build_qwen_prompt(
        "Solanum lycopersicum",
        ["Жёлтые листья"],
        [{"name": "Fulvia fulva", "confidence": 0.25}],
    )
    assert "Возможные болезни по фото" in prompt
    assert "Fulvia fulva — 25%" in prompt


def test_build_qwen_prompt_omits_disease_block_when_empty():
    prompt = build_qwen_prompt("Solanum lycopersicum", ["Жёлтые листья"], [])
    assert "Возможные болезни по фото" not in prompt


def test_normalize_selected_symptoms_maps_to_russian_model_context():
    normalized = normalize_selected_symptoms(["Жёлтые листья", "Лист вянет"], "Нижние листья")
    assert "Жёлтые листья" in normalized
    assert "Лист вянет" in normalized
    assert any("нижних листьях" in x for x in normalized)
