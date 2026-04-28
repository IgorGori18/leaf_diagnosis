from app.providers.plantnet_provider import _extract_top_diseases, _latin_name_only


def test_latin_name_only_strips_description_after_dash():
    assert _latin_name_only("Fulvia fulva - Leaf mould of tomato") == "Fulvia fulva"
    assert _latin_name_only("Oidium neolycopersici - Powdery mildew of tomato") == "Oidium neolycopersici"
    assert _latin_name_only("Phytophthora infestans - Late blight of potato") == "Phytophthora infestans"


def test_extract_top_diseases_uses_latin_name_only():
    payload = {
        "results": [
            {"label": "Fulvia fulva - Leaf mould of tomato", "score": 0.25},
            {"label": "Oidium neolycopersici - Powdery mildew of tomato", "score": 0.17},
            {"label": "Phytophthora infestans - Late blight of potato", "score": 0.06},
        ]
    }
    top = _extract_top_diseases(payload)

    assert top[0]["name"] == "Fulvia fulva"
    assert top[1]["name"] == "Oidium neolycopersici"
    assert top[2]["name"] == "Phytophthora infestans"


def test_extract_top_diseases_uses_description_when_name_missing():
    payload = {
        "results": [
            {
                "score": 0.53,
                "disease": {"scientificName": "unknown"},
                "description": "Fulvia fulva - Leaf mould of tomato",
            },
            {
                "score": 0.07,
                "disease": {"scientificName": None},
                "description": "Oidium neolycopersici - Powdery mildew of tomato",
            },
            {
                "score": 0.04,
                "disease": {},
                "description": "Phytophthora infestans - Late blight of potato",
            },
        ]
    }
    top = _extract_top_diseases(payload)

    assert top[0]["name"] == "Fulvia fulva"
    assert top[1]["name"] == "Oidium neolycopersici"
    assert top[2]["name"] == "Phytophthora infestans"
