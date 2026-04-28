from app.services.model_validation import validate_model_result


def test_override_healthy_with_severe_symptoms():
    out = validate_model_result(
        selected_symptoms=["Чёрные пятна", "Есть насекомые"],
        model_result={"status": "healthy", "confidence": 0.9},
        plantnet_result={"preliminary_status": "Возможны признаки проблемы"},
    )
    assert out["final_status"] == "есть признаки проблемы"
    assert out["overridden"] is True
    assert out["confidence"] == 0.63


def test_keep_healthy_without_symptoms():
    out = validate_model_result(
        selected_symptoms=[],
        model_result={"status": "healthy", "confidence": 0.8},
        plantnet_result={"preliminary_status": "Недостаточно данных для уверенного вывода"},
    )
    assert out["final_status"] == "здоровое"
    assert out["overridden"] is False
