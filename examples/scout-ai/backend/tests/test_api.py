import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_api_status():
    """Test /api/status returns application info."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/status")
        assert res.status_code == 200
        data = res.json()
        assert data["app_name"] == "ScoutAI"
        assert "solari_configured" in data
        assert "gemini_configured" in data


@pytest.mark.asyncio
async def test_create_task_and_get():
    """Test /api/tasks creation endpoint."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post(
            "/api/tasks",
            json={
                "objective": "Compare AI cloud sandboxes and pricing models",
                "is_demo": True,
            },
        )
        assert res.status_code == 200
        task_data = res.json()
        task_id = task_data["id"]
        assert task_data["objective"] == "Compare AI cloud sandboxes and pricing models"

        # Check retrieve
        get_res = await client.get(f"/api/tasks/{task_id}")
        assert get_res.status_code == 200
        assert get_res.json()["id"] == task_id
