import pytest

from app.models.schemas import DiscoveredBug
from app.services.llm_ensemble import llm_ensemble
from app.services.security_scanner import security_scanner


def test_security_scanner_detects_missing_csp_and_hsts():
    headers = {"server": "nginx/1.18.0", "content-type": "text/html"}
    findings = security_scanner.audit_headers("https://example.com", headers)

    categories = [f.category for f in findings]
    titles = [f.title for f in findings]

    assert "security_misconfiguration" in categories
    assert any("Content-Security-Policy" in t for t in titles)
    assert any("HSTS" in t for t in titles)


def test_security_scanner_detects_insecure_cookies():
    cookie_headers = ["session_id=abc123xyz; Path=/; Domain=example.com"]
    findings = security_scanner.audit_cookies("https://example.com", cookie_headers)

    assert len(findings) >= 1
    assert findings[0].category == "insecure_auth_cookie"
    assert "HttpOnly" in findings[0].title


def test_security_scanner_detects_exposed_secrets():
    html_with_key = '<html><script>const apiKey = "AKIAIOSFODNN7EXAMPLE";</script></html>'
    findings = security_scanner.audit_dom_and_forms("https://example.com", html_with_key)

    assert len(findings) >= 1
    assert "Secret Exposed" in findings[0].title


@pytest.mark.asyncio
async def test_llm_ensemble_synthesizes_defensive_test():
    bug = DiscoveredBug(
        id="sec-123456",
        title="Missing Content-Security-Policy (CSP) Header",
        severity="medium",
        category="security_misconfiguration",
        url="https://example.com",
        description="Server response omits Content-Security-Policy header",
        cwe_id="CWE-1021",
        cvss_score=5.4,
        owasp_category="A05:2021-Security Misconfiguration",
    )

    ts_code, py_code = await llm_ensemble.synthesize_defensive_test(bug)
    assert "test.describe" in ts_code or "playwright" in ts_code.lower()
    assert "def test_verify_security_posture" in py_code
