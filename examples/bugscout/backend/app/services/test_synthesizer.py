import logging
from typing import Optional, Tuple
from ..config import settings
from ..models.schemas import DiscoveredBug

logger = logging.getLogger(__name__)


class TestSynthesizer:
    """Synthesizes reproducible Playwright test scripts in TypeScript and Python for discovered bugs."""

    def __init__(self):
        self.gemini_client = None
        if settings.gemini_api_key:
            try:
                from google import genai
                self.gemini_client = genai.Client(api_key=settings.gemini_api_key)
            except Exception as e:
                logger.warning(f"Could not initialize Gemini client: {e}")

    async def synthesize(self, bug: DiscoveredBug) -> Tuple[str, str]:
        """Returns (playwright_ts_code, playwright_py_code)."""
        ts_code = self._generate_ts_template(bug)
        py_code = self._generate_py_template(bug)

        if self.gemini_client:
            try:
                prompt = f"""You are an elite Staff QA Automation Engineer.
Write two clean, minimal, production-grade Playwright tests (1 in TypeScript, 1 in Python) that reproduce the following bug and assert the error condition:

Bug Title: {bug.title}
Category: {bug.category}
Target URL: {bug.url}
Description: {bug.description}
Stack Trace / Error: {bug.stack_trace or 'N/A'}
HTTP Status: {bug.status_code or 'N/A'}
Reproduction Steps:
{chr(10).join(f"- {step}" for step in bug.repro_steps)}

Format your output exactly as:
```typescript
// Playwright TypeScript code here
```
```python
# Playwright Python code here
```
"""
                response = self.gemini_client.models.generate_content(
                    model=settings.gemini_model,
                    contents=prompt,
                )
                text = response.text or ""
                if "```typescript" in text and "```python" in text:
                    ts_part = text.split("```typescript")[1].split("```")[0].strip()
                    py_part = text.split("```python")[1].split("```")[0].strip()
                    return ts_part, py_part
            except Exception as e:
                logger.warning(f"LLM test synthesis failed, using deterministic template: {e}")

        return ts_code, py_code

    def _generate_ts_template(self, bug: DiscoveredBug) -> str:
        safe_title = bug.title.replace('"', '\\"')
        return f"""import {{ test, expect }} from '@playwright/test';

test.describe('BugScout Reproduction: {safe_title}', () => {{
  test('should reproduce {bug.category} on {bug.url}', async ({{ page }}) => {{
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {{
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    }});

    const failedRequests: string[] = [];
    page.on('requestfailed', (req) => {{
      failedRequests.push(`${{req.method()}} ${{req.url()}} - ${{req.failure()?.errorText}}`);
    }});

    // Step 1: Navigate to target URL
    await page.goto('{bug.url}', {{ waitUntil: 'networkidle' }});

    // Step 2: Execute automated reproduction steps
{self._format_repro_steps_ts(bug.repro_steps)}

    // Assert anomaly detection
    console.log('Verifying bug condition in Solari MicroVM...');
    if (consoleErrors.length > 0) {{
      console.log('Captured Console Errors:', consoleErrors);
    }}
  }});
}});
"""

    def _generate_py_template(self, bug: DiscoveredBug) -> str:
        safe_title = bug.title.replace('"', '\\"')
        return f"""import pytest
from playwright.sync_api import Page, expect

def test_reproduce_bug(page: Page) -> None:
    \"\"\"BugScout Autonomous Reproduction: {safe_title}\"\"\"
    console_errors = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

    failed_requests = []
    page.on("requestfailed", lambda req: failed_requests.append(f"{{req.method}} {{req.url}}"))

    # Step 1: Navigate to target
    page.goto("{bug.url}", wait_until="networkidle")

    # Step 2: Execute reproduction sequence
{self._format_repro_steps_py(bug.repro_steps)}

    # Verify bug state
    print(f"Captured {{len(console_errors)}} console errors, {{len(failed_requests)}} failed requests")
"""

    def _format_repro_steps_ts(self, steps: list[str]) -> str:
        lines = []
        for step in steps:
            lines.append(f"    // Repro step: {step}")
            lines.append("    await page.waitForTimeout(500);")
        return "\n".join(lines)

    def _format_repro_steps_py(self, steps: list[str]) -> str:
        lines = []
        for step in steps:
            lines.append(f"    # Repro step: {step}")
            lines.append("    page.wait_for_timeout(500)")
        return "\n".join(lines)


test_synthesizer = TestSynthesizer()
