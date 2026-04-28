import uuid


def _auth_headers(client):
    email = f"user-{uuid.uuid4().hex[:8]}@example.com"
    password = "very-secure"
    client.post("/api/auth/register", json={"name": "Test User", "email": email, "password": password})
    login = client.post("/api/auth/login", json={"email": email, "password": password})
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_identify_plant_endpoint(client, monkeypatch):
    async def fake_identify_plant(image_bytes: bytes, filename: str):
        return {"plant_name": "Solanum lycopersicum", "confidence": 0.86}

    def fake_diseases(image_path: str):
        return {
            "raw": {"results": [{"score": 0.42}, {"score": 0.27}]},
            "top_diseases": [
                {"name": "Фитофтороз", "score": 0.42, "probability_percent": 42},
                {"name": "Мучнистая роса", "score": 0.27, "probability_percent": 27},
            ],
        }

    monkeypatch.setattr("app.services.plantnet_service.identify_plant", fake_identify_plant)
    monkeypatch.setattr("app.services.analysis_service.get_disease_candidates", fake_diseases)

    headers = _auth_headers(client)
    files = {"file": ("leaf.jpg", b"fake", "image/jpeg")}
    response = client.post("/api/identify-plant", headers=headers, files=files)

    assert response.status_code == 200
    body = response.json()
    assert body["analysis_id"] > 0
    assert body["plant_name"] == "Solanum lycopersicum"
    assert body["plant_confidence_percent"] == 86.0
    assert body["preliminary_status"]
    assert len(body["top_diseases"]) == 2
    assert body["top_diseases"][0]["name"] == "Фитофтороз"
    assert body["top_diseases"][0]["probability_percent"] == 42
    assert body["analysis_json"]["plantnet"]["diseases_raw"]["results"]
    assert body["analysis_json"]["plantnet"]["diseases_top3"][0]["name"] == "Фитофтороз"
    assert body["analysis_json"]["plantnet"]["diseases_top3"][0]["confidence"] == 0.42
    assert "top_diseases" not in body["analysis_json"]["plantnet"]


def test_analyze_symptoms_endpoint(client, monkeypatch):
    async def fake_identify_plant(image_bytes: bytes, filename: str):
        return {"plant_name": "Solanum lycopersicum", "confidence": 0.8}

    def fake_diseases(image_path: str):
        return {"raw": {"results": []}, "top_diseases": []}

    async def fake_model(plant_name: str, symptoms_ru: list[str], diseases_top3=None):
        assert plant_name == "Solanum lycopersicum"
        assert "Жёлтые листья" in symptoms_ru
        assert diseases_top3 == []
        return {
            "status": "есть признаки проблемы",
            "confidence": 0.52,
            "possible_causes": ["fungal disease"],
            "recommendations": ["monitor", "isolate"],
        }

    monkeypatch.setattr("app.services.plantnet_service.identify_plant", fake_identify_plant)
    monkeypatch.setattr("app.services.analysis_service.run_qwen_analysis", fake_model)
    monkeypatch.setattr("app.services.analysis_service.get_disease_candidates", fake_diseases)

    headers = _auth_headers(client)
    files = {"file": ("leaf.jpg", b"fake", "image/jpeg")}
    created = client.post("/api/identify-plant", headers=headers, files=files)
    aid = created.json()["analysis_id"]

    response = client.post(
        "/api/analyze-symptoms",
        headers=headers,
        json={
            "analysis_id": aid,
            "selected_symptoms": ["Жёлтые листья", "Лист вянет"],
            "affected_area": "Нижние листья",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["final_status"] == "Обнаружены признаки проблемы"
    assert body["confidence_percent"] == 52.0
    assert body["possible_causes"][0] in {"Грибковое заболевание", "грибковое поражение"} or body["possible_causes"][0].startswith("Возможная причина:")
    assert "status_adjusted" in body
    assert body["raw_model_result"]["status"] == "есть признаки проблемы"
    assert body["selected_symptoms"] == ["Жёлтые листья", "Лист вянет"]
    assert body["affected_area"] == "Нижние листья"
    assert body["analysis_json"]["symptoms"]["selected_symptoms_ru"] == ["Жёлтые листья", "Лист вянет"]
