from collections.abc import AsyncGenerator
from typing import Any, Protocol

from ..models.schemas import AgentEvent, AuditRequest, DiscoveredBug


class BrowserDriverProtocol(Protocol):
    """Abstraction for Cloud Headless Browser exploration and CDP trapping."""

    async def explore_and_trap_anomalies(
        self,
        request: AuditRequest,
        session_id: str,
    ) -> AsyncGenerator[AgentEvent]: ...


class SandboxRunnerProtocol(Protocol):
    """Abstraction for Solari MicroVM isolated execution environments."""

    async def verify_test_in_sandbox(
        self,
        bug: DiscoveredBug,
        py_test_code: str,
    ) -> AsyncGenerator[dict[str, Any]]: ...


class TestSynthesizerProtocol(Protocol):
    """Abstraction for generating multi-language Playwright test suites."""

    async def synthesize(self, bug: DiscoveredBug) -> tuple[str, str]: ...


class BugClassifierProtocol(Protocol):
    """Abstraction for categorizing and scoring discovered anomalies."""

    def classify_severity(
        self, category: str, error_message: str, status_code: int | None
    ) -> str: ...
