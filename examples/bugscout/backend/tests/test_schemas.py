from app.models.schemas import AuditRequest, DiscoveredBug, QAReport


def test_audit_request_defaults():
    req = AuditRequest(target_url="https://getsolari.com")
    assert req.target_url == "https://getsolari.com"
    assert req.stealth_mode is True
    assert req.record_session is True
    assert req.max_depth == 3


def test_discovered_bug_structure():
    bug = DiscoveredBug(
        id="bug-101",
        title="Uncaught ReferenceError",
        severity="critical",
        category="console_error",
        url="https://example.com/app",
        description="Global variable is not defined",
        repro_steps=["Navigate to URL", "Check console"],
    )
    assert bug.id == "bug-101"
    assert bug.severity == "critical"
    assert bug.category == "console_error"
    assert bug.verified_in_sandbox is False


def test_qa_report_serialization():
    bug = DiscoveredBug(
        id="bug-102",
        title="Network 500 error",
        severity="high",
        category="network_error",
        url="https://example.com/api",
        description="API returned 500",
    )
    report = QAReport(
        session_id="aud_12345",
        target_url="https://example.com",
        test_scope="Smoke Test",
        quality_score="B+",
        health_percentage=85,
        summary="Audit summary",
        total_pages_visited=3,
        total_requests_analyzed=40,
        bugs=[bug],
    )
    data = report.model_dump()
    assert data["session_id"] == "aud_12345"
    assert len(data["bugs"]) == 1
    assert data["health_percentage"] == 85
