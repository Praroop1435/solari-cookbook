from app.services.bug_classifier import bug_classifier
from app.models.schemas import DiscoveredBug


def test_classify_500_error_as_critical():
    sev = bug_classifier.classify_severity("network_error", "Server Error", status_code=500)
    assert sev == "critical"


def test_classify_typeerror_as_critical():
    sev = bug_classifier.classify_severity("console_error", "Uncaught TypeError: cannot read foo")
    assert sev == "critical"


def test_classify_404_as_medium():
    sev = bug_classifier.classify_severity("network_error", "Not Found", status_code=404)
    assert sev == "medium"


def test_format_github_issue():
    bug = DiscoveredBug(
        id="bug-999",
        title="Sample Crash",
        severity="critical",
        category="console_error",
        url="https://app.example.com",
        description="App crashed on button click",
        repro_steps=["Click button #submit"],
        playwright_ts_code="await page.click('#submit');",
    )
    issue_md = bug_classifier.format_github_issue(bug)
    assert "[BugScout QA] Sample Crash" in issue_md
    assert "```typescript" in issue_md
    assert "https://app.example.com" in issue_md
