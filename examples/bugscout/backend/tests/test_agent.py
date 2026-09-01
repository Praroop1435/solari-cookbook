import pytest

from app.models.schemas import AuditRequest, DiscoveredBug
from app.services.test_synthesizer import test_synthesizer


@pytest.mark.asyncio
async def test_schema_instantiation():
    req = AuditRequest(target_url="https://example.com", test_scope="Smoke Test")
    assert req.target_url == "https://example.com"
    assert req.stealth_mode is True

    bug = DiscoveredBug(
        id="bug-123",
        title="Uncaught TypeError in main.js",
        severity="critical",
        category="console_error",
        url="https://example.com",
        description="TypeError occurred during window load",
        repro_steps=["Open page", "Inspect console"],
    )
    assert bug.severity == "critical"
    assert bug.category == "console_error"


@pytest.mark.asyncio
async def test_test_synthesizer_generation():
    bug = DiscoveredBug(
        id="bug-test-1",
        title="404 on API endpoint",
        severity="high",
        category="network_error",
        url="https://example.com/api/broken",
        description="Endpoint returned 404",
        repro_steps=["Visit URL", "Click submit"],
    )
    ts_code, py_code = await test_synthesizer.synthesize(bug)
    assert "import { test, expect } from '@playwright/test'" in ts_code
    assert "https://example.com/api/broken" in ts_code
    assert "def test_reproduce_bug(page: Page)" in py_code
