from datetime import datetime, timezone

from app.models.analysis import Analysis
from app.models.result import Result
from app.models.user import User
from conftest import TestingSessionLocal


def _auth_headers(client):
    email = "user@example.com"
    password = "very-secure"
    client.post("/api/auth/register", json={"name": "Test User", "email": email, "password": password})
    login = client.post("/api/auth/login", json={"email": email, "password": password})
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_register_and_login(client):
    payload = {"name": "Test", "email": "a@b.com", "password": "12345678"}
    register = client.post("/api/auth/register", json=payload)
    assert register.status_code == 200
    assert register.json()["access_token"]

    login = client.post("/api/auth/login", json=payload)
    assert login.status_code == 200
    assert login.json()["token_type"] == "bearer"


def test_history_list_and_detail(client):
    headers = _auth_headers(client)
    db = TestingSessionLocal()
    try:
        user = db.query(User).filter(User.email == "user@example.com").first()
        analysis = Analysis(
            user_id=user.id,
            image_path="uploads/test.jpg",
            created_at=datetime.now(timezone.utc),
        )
        db.add(analysis)
        db.flush()
        db.add(
            Result(
                analysis_id=analysis.id,
                plant_name="Cucumis sativus",
                plant_confidence=0.91,
                health_status="недостаточно данных",
                health_confidence=0.42,
                analysis_payload_json={"version": 1, "comment": "ok"},
                recommendations_text=None,
                created_at=datetime.now(timezone.utc),
            )
        )
        db.commit()
        analysis_id = analysis.id
    finally:
        db.close()

    history = client.get("/api/history", headers=headers)
    assert history.status_code == 200
    rows = history.json()
    assert len(rows) >= 1
    first = rows[0]
    assert "image_path" in first
    assert "final_status" in first
    assert "display_status" in first

    detail = client.get(f"/api/history/{analysis_id}", headers=headers)
    assert detail.status_code == 200
    body = detail.json()
    assert body["analysis_id"] == analysis_id
    assert body["image_path"] == "/uploads/test.jpg"
    assert body["result"]["analysis_json"]["comment"] == "ok"
    assert body["result"]["display_status"] == "Недостаточно данных"
