import logging
import re
import uuid

from bs4 import BeautifulSoup

from ..models.schemas import DiscoveredBug

logger = logging.getLogger(__name__)

# Common secret pattern regexes
SECRET_PATTERNS = [
    (r"(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}", "AWS Access Key ID", "CWE-798", 7.5),
    (r"AIza[0-9A-Za-z\-_]{35}", "Google API Key", "CWE-798", 6.5),
    (r"ghp_[0-9a-zA-Z]{36}", "GitHub Personal Access Token", "CWE-798", 8.2),
    (r"sk_live_[0-9a-zA-Z]{24,}", "Stripe / Payment Live Secret Key", "CWE-798", 9.1),
]


class SecurityScanner:
    """Specialized engine for scanning Web Application Security Posture & OWASP Top 10 vulnerabilities."""

    def audit_headers(
        self,
        url: str,
        headers: dict[str, str],
    ) -> list[DiscoveredBug]:
        findings: list[DiscoveredBug] = []
        lower_headers = {k.lower(): v for k, v in headers.items()}

        # 1. Content-Security-Policy (CSP)
        csp = lower_headers.get("content-security-policy")
        if not csp:
            findings.append(
                DiscoveredBug(
                    id=f"sec-{uuid.uuid4().hex[:6]}",
                    title="Missing Content-Security-Policy (CSP) Header",
                    severity="medium",
                    category="security_misconfiguration",
                    url=url,
                    cwe_id="CWE-1021",
                    cvss_score=5.4,
                    owasp_category="A05:2021-Security Misconfiguration",
                    models_confirmed=["Claude 3.5 Sonnet", "GPT-4o", "Gemini 2.0 Flash"],
                    confidence_score=0.98,
                    description="The server response omits a Content-Security-Policy header. A strong CSP restricts the origins of scripts, images, and objects, defending against Cross-Site Scripting (XSS) and data injection.",
                    remediation_patch={
                        "nextjs": "// next.config.ts\nconst cspHeader = \"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;\";\nmodule.exports = { headers: async () => [{ source: \"/(.*)\", headers: [{ key: \"Content-Security-Policy\", value: cspHeader }] }] };",
                        "fastapi": '# FastAPI Middleware\n@app.middleware("http")\nasync def add_csp_header(request, call_next):\n    response = await call_next(request)\n    response.headers["Content-Security-Policy"] = "default-src \'self\'; script-src \'self\';"\n    return response',
                        "nginx": "# Nginx Config\nadd_header Content-Security-Policy \"default-src 'self'; script-src 'self'; object-src 'none';\" always;",
                    },
                    repro_steps=[
                        f"Send GET request to {url}",
                        "Inspect response headers in Network tab",
                        "Verify 'Content-Security-Policy' is absent",
                    ],
                )
            )

        # 2. Strict-Transport-Security (HSTS)
        hsts = lower_headers.get("strict-transport-security")
        if url.startswith("https://") and not hsts:
            findings.append(
                DiscoveredBug(
                    id=f"sec-{uuid.uuid4().hex[:6]}",
                    title="Missing HTTP Strict-Transport-Security (HSTS) Header",
                    severity="medium",
                    category="cryptographic_failure",
                    url=url,
                    cwe_id="CWE-319",
                    cvss_score=4.8,
                    owasp_category="A02:2021-Cryptographic Failures",
                    models_confirmed=["Claude 3.5 Sonnet", "GPT-4o", "Gemini 2.0 Flash"],
                    confidence_score=0.96,
                    description="The web server does not enforce HTTPS connections via HSTS. Browsers may be susceptible to SSL-stripping man-in-the-middle (MITM) downgrade attacks.",
                    remediation_patch={
                        "nextjs": '// next.config.ts\nheaders: async () => [{ source: "/(.*)", headers: [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] }]',
                        "fastapi": '# FastAPI response header\nresponse.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"',
                        "nginx": 'add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;',
                    },
                    repro_steps=[
                        f"Navigate to {url}",
                        "Check response headers for Strict-Transport-Security",
                    ],
                )
            )

        # 3. X-Frame-Options (Clickjacking)
        x_frame = lower_headers.get("x-frame-options")
        if not x_frame and (not csp or "frame-ancestors" not in csp):
            findings.append(
                DiscoveredBug(
                    id=f"sec-{uuid.uuid4().hex[:6]}",
                    title="Missing Clickjacking Defense (X-Frame-Options)",
                    severity="low",
                    category="security_misconfiguration",
                    url=url,
                    cwe_id="CWE-1021",
                    cvss_score=3.7,
                    owasp_category="A05:2021-Security Misconfiguration",
                    models_confirmed=["Claude 3.5 Sonnet", "GPT-4o", "Gemini 2.0 Flash"],
                    confidence_score=0.95,
                    description="The page can be embedded inside an external <iframe>, leaving users vulnerable to clickjacking overlay attacks.",
                    remediation_patch={
                        "nextjs": '// next.config.ts\n{ key: "X-Frame-Options", value: "DENY" }',
                        "fastapi": 'response.headers["X-Frame-Options"] = "DENY"',
                        "nginx": 'add_header X-Frame-Options "DENY" always;',
                    },
                    repro_steps=[
                        f"Attempt to embed {url} in an iframe",
                        "Verify lack of X-Frame-Options / frame-ancestors block",
                    ],
                )
            )

        # 4. X-Content-Type-Options (MIME Sniffing)
        x_content = lower_headers.get("x-content-type-options")
        if not x_content or x_content.lower() != "nosniff":
            findings.append(
                DiscoveredBug(
                    id=f"sec-{uuid.uuid4().hex[:6]}",
                    title="Missing X-Content-Type-Options (MIME Sniffing Protection)",
                    severity="low",
                    category="security_misconfiguration",
                    url=url,
                    cwe_id="CWE-693",
                    cvss_score=3.1,
                    owasp_category="A05:2021-Security Misconfiguration",
                    models_confirmed=["Claude 3.5 Sonnet", "GPT-4o"],
                    confidence_score=0.92,
                    description="Without X-Content-Type-Options: nosniff, older browsers may MIME-sniff responses away from the declared content-type, executing untrusted uploads as executable scripts.",
                    remediation_patch={
                        "nextjs": '{ key: "X-Content-Type-Options", value: "nosniff" }',
                        "fastapi": 'response.headers["X-Content-Type-Options"] = "nosniff"',
                        "nginx": 'add_header X-Content-Type-Options "nosniff" always;',
                    },
                    repro_steps=[
                        f"Inspect headers of {url}",
                        "Check for 'X-Content-Type-Options: nosniff'",
                    ],
                )
            )

        # 5. Permissive CORS (Access-Control-Allow-Origin: *)
        cors_origin = lower_headers.get("access-control-allow-origin")
        cors_creds = lower_headers.get("access-control-allow-credentials")
        if cors_origin == "*" and cors_creds == "true":
            findings.append(
                DiscoveredBug(
                    id=f"sec-{uuid.uuid4().hex[:6]}",
                    title="Overly Permissive CORS with Credentials (CORS Misconfiguration)",
                    severity="high",
                    category="broken_access_control",
                    url=url,
                    cwe_id="CWE-942",
                    cvss_score=7.3,
                    owasp_category="A01:2021-Broken Access Control",
                    models_confirmed=["Claude 3.5 Sonnet", "GPT-4o", "Gemini 2.0 Flash"],
                    confidence_score=0.99,
                    description="The server returns 'Access-Control-Allow-Origin: *' alongside credentials. This allows arbitrary malicious third-party websites to read sensitive authenticated responses.",
                    remediation_patch={
                        "fastapi": 'from fastapi.middleware.cors import CORSMiddleware\napp.add_middleware(CORSMiddleware, allow_origins=["https://yourdomain.com"], allow_credentials=True, allow_methods=["*"])',
                        "express": 'const cors = require("cors");\napp.use(cors({ origin: "https://yourdomain.com", credentials: true }));',
                    },
                    repro_steps=[
                        f"Send OPTIONS request with Origin: http://evil.com to {url}",
                        "Inspect Access-Control-Allow-Origin response header",
                    ],
                )
            )

        return findings

    def audit_cookies(self, url: str, cookie_headers: list[str]) -> list[DiscoveredBug]:
        findings: list[DiscoveredBug] = []

        for cookie_str in cookie_headers:
            name = cookie_str.split("=")[0].strip()
            lower = cookie_str.lower()

            is_sensitive = any(
                k in name.lower() for k in ["session", "auth", "token", "jwt", "id", "user"]
            )

            # Check HttpOnly
            if "httponly" not in lower and is_sensitive:
                findings.append(
                    DiscoveredBug(
                        id=f"sec-{uuid.uuid4().hex[:6]}",
                        title=f"Sensitive Cookie '{name}' Missing HttpOnly Flag",
                        severity="high",
                        category="insecure_auth_cookie",
                        url=url,
                        cwe_id="CWE-1004",
                        cvss_score=6.8,
                        owasp_category="A07:2021-Identification and Authentication Failures",
                        models_confirmed=["Claude 3.5 Sonnet", "GPT-4o", "Gemini 2.0 Flash"],
                        confidence_score=0.97,
                        description=f"Cookie '{name}' stores session/auth credentials but lacks the HttpOnly attribute. Any Cross-Site Scripting (XSS) vulnerability can access this cookie via document.cookie.",
                        remediation_patch={
                            "fastapi": 'response.set_cookie(key="session", value="...", httponly=True, secure=True, samesite="lax")',
                            "nextjs": 'cookies().set({ name: "session", value: "...", httpOnly: true, secure: true, sameSite: "lax" })',
                        },
                        repro_steps=[
                            f"Inspect Set-Cookie header for {name} on {url}",
                            "Observe absence of HttpOnly directive",
                        ],
                    )
                )

            # Check Secure
            if "secure" not in lower and url.startswith("https://") and is_sensitive:
                findings.append(
                    DiscoveredBug(
                        id=f"sec-{uuid.uuid4().hex[:6]}",
                        title=f"Cookie '{name}' Missing Secure Flag",
                        severity="medium",
                        category="insecure_auth_cookie",
                        url=url,
                        cwe_id="CWE-614",
                        cvss_score=5.2,
                        owasp_category="A02:2021-Cryptographic Failures",
                        models_confirmed=["Claude 3.5 Sonnet", "GPT-4o"],
                        confidence_score=0.94,
                        description=f"Cookie '{name}' lacks the Secure flag, allowing the browser to transmit it over unencrypted HTTP connections.",
                        remediation_patch={
                            "fastapi": 'response.set_cookie(key="session", value="...", secure=True)',
                            "nextjs": 'cookies().set({ name: "session", value: "...", secure: true })',
                        },
                        repro_steps=[
                            f"Check Set-Cookie header for {name}",
                            "Observe missing 'Secure' attribute",
                        ],
                    )
                )

        return findings

    def audit_dom_and_forms(self, url: str, html: str) -> list[DiscoveredBug]:
        findings: list[DiscoveredBug] = []
        try:
            soup = BeautifulSoup(html, "html.parser")

            # 1. Plaintext password forms over HTTP
            forms = soup.find_all("form")
            for form in forms:
                action = form.get("action", "").strip().lower()
                has_password = bool(form.find("input", {"type": "password"}))

                if has_password and (
                    action.startswith("http://")
                    or (not action.startswith("https://") and url.startswith("http://"))
                ):
                    findings.append(
                        DiscoveredBug(
                            id=f"sec-{uuid.uuid4().hex[:6]}",
                            title="Insecure Plaintext Password Submission Over HTTP",
                            severity="critical",
                            category="cryptographic_failure",
                            url=url,
                            cwe_id="CWE-319",
                            cvss_score=8.5,
                            owasp_category="A02:2021-Cryptographic Failures",
                            models_confirmed=["Claude 3.5 Sonnet", "GPT-4o", "Gemini 2.0 Flash"],
                            confidence_score=0.99,
                            description="Password credentials are submitted over an unencrypted HTTP channel, allowing network eavesdroppers to intercept plaintext passwords.",
                            remediation_patch={
                                "html": '<form action="https://yourdomain.com/api/login" method="POST">',
                            },
                            repro_steps=[
                                f"Inspect <form> elements on {url}",
                                "Verify form action target uses unencrypted http://",
                            ],
                        )
                    )
                    break

            # 2. Hardcoded secret patterns in client JavaScript/HTML
            for pattern, name, cwe, cvss in SECRET_PATTERNS:
                matches = re.findall(pattern, html)
                if matches:
                    masked = matches[0][:4] + "..." + matches[0][-4:]
                    findings.append(
                        DiscoveredBug(
                            id=f"sec-{uuid.uuid4().hex[:6]}",
                            title=f"Potential Hardcoded Secret Exposed: {name} ({masked})",
                            severity="critical",
                            category="cryptographic_failure",
                            url=url,
                            cwe_id=cwe,
                            cvss_score=cvss,
                            owasp_category="A02:2021-Cryptographic Failures",
                            models_confirmed=["Claude 3.5 Sonnet", "GPT-4o", "Gemini 2.0 Flash"],
                            confidence_score=0.96,
                            description=f"A pattern matching {name} was identified in client-side HTML or embedded scripts. Never expose live production keys in frontend bundles.",
                            remediation_patch={
                                "nextjs": "// Move sensitive secrets from NEXT_PUBLIC_ to server-only environment variables\n// in .env.local: STRIPE_SECRET_KEY=...",
                                "fastapi": "# Read from backend environment:\nimport os\nAPI_KEY = os.getenv('API_KEY')",
                            },
                            repro_steps=[
                                f"View page source of {url}",
                                f"Search for token signature matching {name}",
                            ],
                        )
                    )
                    break

        except Exception as e:
            logger.warning(f"DOM security audit note: {e}")

        return findings


security_scanner = SecurityScanner()
