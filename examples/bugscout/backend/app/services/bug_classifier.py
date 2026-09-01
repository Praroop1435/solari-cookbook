import re
from typing import Optional, Literal
from ..models.schemas import DiscoveredBug


class BugClassifier:
    """Classifies detected anomalies by category and severity level."""

    def classify_severity(
        self,
        category: Literal["console_error", "network_error", "broken_asset", "dom_anomaly", "accessibility"],
        error_message: str,
        status_code: Optional[int] = None,
    ) -> Literal["critical", "high", "medium", "low", "visual"]:
        msg = error_message.lower()

        if status_code and status_code >= 500:
            return "critical"

        if category == "console_error":
            if any(term in msg for term in ["typeerror", "referenceerror", "syntaxerror", "uncaught", "fatal"]):
                return "critical"
            if any(term in msg for term in ["warning", "deprecated"]):
                return "low"
            return "high"

        if category == "network_error":
            if status_code == 401 or status_code == 403:
                return "high"
            if status_code == 404:
                return "medium"
            return "high"

        if category == "broken_asset":
            if any(ext in msg for ext in [".woff", ".woff2", ".ttf"]):
                return "medium"
            return "low"

        if category == "dom_anomaly":
            if "csrf" in msg or "security" in msg:
                return "medium"
            return "low"

        if category == "accessibility":
            return "low"

        return "medium"

    def format_github_issue(self, bug: DiscoveredBug) -> str:
        """Generates a pre-formatted GitHub Issue / Jira ticket markdown."""
        repro_list = "\n".join(f"{i+1}. {step}" for i, step in enumerate(bug.repro_steps))
        stack = f"```\n{bug.stack_trace}\n```" if bug.stack_trace else "_No stack trace captured._"
        code_block = (
            f"```typescript\n{bug.playwright_ts_code}\n```"
            if bug.playwright_ts_code
            else "_No Playwright test generated._"
        )

        return f"""### 🚨 [BugScout QA] {bug.title}

**Severity**: `{bug.severity.upper()}` | **Category**: `{bug.category}` | **Target URL**: {bug.url}
**Sandbox Verified**: `{'✅ YES' if bug.verified_in_sandbox else '❌ NO'}`

---

#### 📋 Description
{bug.description}

#### 🔄 Reproduction Steps
{repro_list}

#### 💥 Stack Trace / Network Response
{stack}

#### 🧪 Synthesized Playwright Test Spec
{code_block}

---
*Reported automatically by [BugScout AI](https://getsolari.com) powered by Solari Cloud Infrastructure.*
"""


bug_classifier = BugClassifier()
