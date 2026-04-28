from app.services.analysis_service import _diseases_top3_for_storage, _top_diseases_for_api


def test_diseases_top3_for_storage_skips_unknown_and_uses_score():
    rows = [
        {"name": "unknown", "score": 0.53},
        {"name": "Fulvia fulva", "score": 0.25},
        {"name": "Oidium neolycopersici", "score": 0.17},
        {"name": "Phytophthora infestans", "score": 0.06},
    ]
    stored = _diseases_top3_for_storage(rows)
    assert stored == [
        {"name": "Fulvia fulva", "confidence": 0.25},
        {"name": "Oidium neolycopersici", "confidence": 0.17},
        {"name": "Phytophthora infestans", "confidence": 0.06},
    ]


def test_top_diseases_for_api_from_stored_confidence():
    api = _top_diseases_for_api([{"name": "Phytophthora infestans", "confidence": 0.06}])
    assert api[0]["name"] == "Phytophthora infestans"
    assert api[0]["score"] == 0.06
    assert api[0]["probability_percent"] == 6
