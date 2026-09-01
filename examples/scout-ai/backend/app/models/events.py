from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid


class EventType(str, Enum):
    AGENT_STATUS = "agent.status"
    PLAN_CREATED = "plan.created"
    BROWSER_SESSION_STARTED = "browser.session_started"
    BROWSER_SEARCH = "browser.search"
    BROWSER_NAVIGATION = "browser.navigation"
    BROWSER_EXTRACTION = "browser.extraction"
    BROWSER_SESSION_CLOSED = "browser.session_closed"
    SOURCE_FOUND = "source.found"
    EVIDENCE_EXTRACTED = "evidence.extracted"
    SANDBOX_STARTED = "sandbox.started"
    SANDBOX_EXECUTION = "sandbox.execution"
    SANDBOX_CLOSED = "sandbox.closed"
    DESKTOP_ACTION = "desktop.action"
    AGENT_REASONING = "agent.reasoning"
    VERIFICATION_COMPLETED = "verification.completed"
    REPORT_FINALIZED = "report.finalized"
    ERROR_OCCURRED = "error.occurred"


class AgentEvent(BaseModel):
    id: str = Field(default_factory=lambda: f"evt_{uuid.uuid4().hex[:8]}")
    task_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    event_type: EventType
    stage: str
    title: str
    detail: str
    data: Dict[str, Any] = Field(default_factory=dict)
