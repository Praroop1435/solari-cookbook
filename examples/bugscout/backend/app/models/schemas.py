from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime, timezone


class AuditRequest(BaseModel):
    target_url: str = Field(..., description="Target web application URL to audit")
    test_scope: str = Field(
        default="Full Smoke Test & Anomaly Discovery",
        description="Testing scope: Smoke Test, Form Validation, Broken Assets, or Deep Crawl",
    )
    stealth_mode: bool = Field(default=True, description="Enable Solari stealth mode & residential proxy")
    record_session: bool = Field(default=True, description="Enable Solari browser session video recording")
    max_depth: int = Field(default=3, ge=1, le=10, description="Exploration depth for autonomous agent")
    # Authenticated Testing Support (Solari Persistent Profiles & Auto-Login)
    auth_username: Optional[str] = Field(default=None, description="Optional username/email for authenticated QA testing")
    auth_password: Optional[str] = Field(default=None, description="Optional password for authenticated QA testing")
    profile_id: Optional[str] = Field(default=None, description="Optional Solari persistent profile ID to reuse logged-in session")
    storage_state: Optional[str] = Field(default=None, description="Optional JSON storageState / cookies")


class DiscoveredBug(BaseModel):
    id: str
    title: str
    severity: Literal["critical", "high", "medium", "low", "visual"]
    category: Literal["console_error", "network_error", "broken_asset", "dom_anomaly", "accessibility"]
    url: str
    description: str
    stack_trace: Optional[str] = None
    status_code: Optional[int] = None
    repro_steps: List[str] = Field(default_factory=list)
    playwright_ts_code: Optional[str] = None
    playwright_py_code: Optional[str] = None
    verified_in_sandbox: bool = False
    sandbox_logs: Optional[str] = None
    screenshot_b64: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AgentEvent(BaseModel):
    session_id: str
    type: Literal["thought", "action", "browser_screenshot", "bug_detected", "sandbox_exec", "sandbox_output", "report_ready", "error"]
    stage: Literal["initialization", "browser_crawling", "anomaly_detection", "test_synthesis", "sandbox_verification", "completed"]
    message: str
    data: Optional[Dict[str, Any]] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class QAReport(BaseModel):
    session_id: str
    target_url: str
    test_scope: str
    quality_score: str
    health_percentage: int
    summary: str
    total_pages_visited: int
    total_requests_analyzed: int
    bugs: List[DiscoveredBug]
    session_recording_url: Optional[str] = None
    sandbox_verified_count: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
