from datetime import UTC, datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class AuditRequest(BaseModel):
    target_url: str = Field(..., description="Target web application URL to audit")
    test_scope: str = Field(
        default="Full Security & Anomaly Discovery",
        description="Testing scope: OWASP Top 10, Security Headers & TLS, Cookie & Auth Posture, or Full Pentest Crawl",
    )
    stealth_mode: bool = Field(
        default=True, description="Enable Solari stealth mode & residential proxy"
    )
    record_session: bool = Field(
        default=True, description="Enable Solari browser session video recording"
    )
    max_depth: int = Field(
        default=3, ge=1, le=10, description="Exploration depth for autonomous agent"
    )
    audit_profile: Literal["owasp_top_10", "headers_and_cookies", "full_security_audit"] = (
        "full_security_audit"
    )
    enabled_models: list[str] = Field(
        default_factory=lambda: ["gemini", "claude", "gpt"],
        description="Active AI models for vulnerability triage and multi-model consensus",
    )
    # Authenticated Testing Support (Solari Persistent Profiles & Auto-Login)
    auth_username: str | None = Field(
        default=None, description="Optional username/email for behind-login security testing"
    )
    auth_password: str | None = Field(
        default=None, description="Optional password for behind-login security testing"
    )
    profile_id: str | None = Field(
        default=None, description="Optional Solari persistent profile ID to reuse logged-in session"
    )
    storage_state: str | None = Field(
        default=None, description="Optional JSON storageState / cookies"
    )


class DiscoveredBug(BaseModel):
    id: str
    title: str
    severity: Literal["critical", "high", "medium", "low", "visual"]
    category: Literal[
        "security_misconfiguration",
        "broken_access_control",
        "cryptographic_failure",
        "insecure_auth_cookie",
        "console_error",
        "network_error",
        "broken_asset",
        "dom_anomaly",
        "accessibility",
    ]
    url: str
    description: str
    cwe_id: str | None = None
    cvss_score: float | None = None
    owasp_category: str | None = None
    models_confirmed: list[str] = Field(default_factory=list)
    confidence_score: float = 0.92
    remediation_patch: dict[str, str] | None = None
    stack_trace: str | None = None
    status_code: int | None = None
    repro_steps: list[str] = Field(default_factory=list)
    playwright_ts_code: str | None = None
    playwright_py_code: str | None = None
    verified_in_sandbox: bool = False
    sandbox_logs: str | None = None
    screenshot_b64: str | None = None
    timestamp: str = Field(default_factory=lambda: datetime.now(UTC).isoformat())


class AgentEvent(BaseModel):
    session_id: str
    type: Literal[
        "thought",
        "action",
        "browser_screenshot",
        "bug_detected",
        "model_consensus",
        "sandbox_exec",
        "sandbox_output",
        "report_ready",
        "error",
    ]
    stage: Literal[
        "initialization",
        "browser_crawling",
        "anomaly_detection",
        "multi_model_consensus",
        "test_synthesis",
        "sandbox_verification",
        "completed",
    ]
    message: str
    data: dict[str, Any] | None = None
    timestamp: str = Field(default_factory=lambda: datetime.now(UTC).isoformat())


class QAReport(BaseModel):
    session_id: str
    target_url: str
    test_scope: str
    quality_score: str
    health_percentage: int
    summary: str
    total_pages_visited: int
    total_requests_analyzed: int
    bugs: list[DiscoveredBug]
    security_grade: str = "A"
    mean_cvss: float = 0.0
    owasp_breakdown: dict[str, int] = Field(default_factory=dict)
    models_used: list[str] = Field(default_factory=list)
    session_recording_url: str | None = None
    sandbox_verified_count: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(UTC).isoformat())
