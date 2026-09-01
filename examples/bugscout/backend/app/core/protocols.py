from typing import Protocol, AsyncGenerator, Dict, Any, Tuple, Optional
from ..models.schemas import DiscoveredBug, AuditRequest, AgentEvent, QAReport


class BrowserDriverProtocol(Protocol):
    """Abstraction for Cloud Headless Browser exploration and CDP trapping."""

    async def explore_and_trap_anomalies(
        self,
        request: AuditRequest,
        session_id: str,
    ) -> AsyncGenerator[AgentEvent, None]:
        ...


class SandboxRunnerProtocol(Protocol):
    """Abstraction for Solari MicroVM isolated execution environments."""

    async def verify_test_in_sandbox(
        self,
        bug: DiscoveredBug,
        py_test_code: str,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        ...


class TestSynthesizerProtocol(Protocol):
    """Abstraction for generating multi-language Playwright test suites."""

    async def synthesize(self, bug: DiscoveredBug) -> Tuple[str, str]:
        ...


class BugClassifierProtocol(Protocol):
    """Abstraction for categorizing and scoring discovered anomalies."""

    def classify_severity(self, category: str, error_message: str, status_code: Optional[int]) -> str:
        ...
