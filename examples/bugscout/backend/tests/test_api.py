from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "BugScout AI"
    assert data["status"] == "online"


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_start_audit_endpoint():
    payload = {
        "target_url": "https://example.com",
        "test_scope": "Full Smoke Test",
        "stealth_mode": True,
    }
    response = client.post("/api/audit/start", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert data["target_url"] == "https://example.com"
