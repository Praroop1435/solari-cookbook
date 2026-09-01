# 🛡️ Solari Sentinel — Multi-Model AI Pentesting & Security Auditing Agent

[![Solari Cloud](https://img.shields.io/badge/Solari-Cloud%20Infra-000000?style=for-the-badge&logo=cloudflare&logoColor=white)](https://getsolari.com)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Python 3.13](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![AI Ensemble](https://img.shields.io/badge/AI%20Ensemble-Gemini%203.5%20%7C%20Claude%203.7%20%7C%20GPT--4o-8A2BE2?style=for-the-badge)](https://getsolari.com)
[![Pytest](https://img.shields.io/badge/Pytest-16%20Passed-0A9EDC?style=for-the-badge&logo=pytest&logoColor=white)](https://pytest.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> **Solari Sentinel** is an enterprise-grade autonomous Web Application Security, OWASP Top 10 Auditing, and Defensive Test Generation agent built natively on **[Solari](https://getsolari.com)** (Stealth Cloud Browsers, Linux MicroVM Sandboxes, and Session Recordings) and powered by a **Multi-Model AI Consensus Engine (Google Gemini 3.5 Flash Lite, Anthropic Claude 3.7 Sonnet, and OpenAI GPT-4o)**.
>
> Give Solari Sentinel any live URL. It explores endpoints using **anti-bot stealth cloud browsers**, audits HTTP security headers (CSP, HSTS, X-Frame-Options), cookie security (`HttpOnly`, `Secure`, `SameSite`), CORS misconfigurations, and client-side secret exposures. It scores findings with **CVSS v3.1**, synthesizes **defensive Playwright assertion suites**, and executes them inside isolated **Solari MicroVM Sandboxes** for 100% deterministic verification.

---

## ⚡ Why Solari Sentinel?

Traditional automated security and QA scanners run on local mock headless browsers that get instantly blocked by Cloudflare, Akamai, or DataDome firewalls, and generate hallucinated test scripts that fail in production.

Solari Sentinel leverages **all 3 pillars of Solari Cloud Infrastructure**:

| Solari Primitive | How Solari Sentinel Uses It |
| :--- | :--- |
| **🌐 Stealth Cloud Browsers** | Bypasses anti-bot firewalls with US residential proxies and humanized cursor trajectories. Traps CDP console errors, unhandled promise rejections, and analyzes all HTTP request/response headers. |
| **⚡ MicroVM Sandboxes** | Boots isolated ephemeral Linux microVMs (`template="base"`) in `<500ms` to execute synthesized Playwright test suites live and verify deterministic security assertions before alerting developers. |
| **🎥 Session Recording API** | Captures authenticated video replays of the security crawl for visual vulnerability review and audit compliance. |

---

## 🧠 Multi-Model AI Consensus Architecture

Solari Sentinel runs a **tri-model consensus matrix** to eliminate false positives:

```
                  ┌────────────────────────────────────────────────────────┐
                  │              Target Web Application URL                │
                  └──────────────────────────┬─────────────────────────────┘
                                             │
                                             ▼
                  ┌────────────────────────────────────────────────────────┐
                  │        Solari Stealth Cloud Browser (US Proxy)         │
                  │   - Security Headers (CSP, HSTS, XFO, CORS)            │
                  │   - Cookie Hygiene (HttpOnly, Secure, SameSite)        │
                  │   - DOM Form Transmission & Client Secret Scanning     │
                  │   - Chrome DevTools Protocol (CDP) Error Trapping      │
                  └──────────────────────────┬─────────────────────────────┘
                                             │
                                             ▼
                  ┌────────────────────────────────────────────────────────┐
                  │             Multi-Model AI Consensus Engine            │
                  │                                                        │
                  │  🟢 Gemini 3.5 Flash Lite: Telemetry & DOM Analysis    │
                  │  🟡 Claude 3.7 Sonnet: Threat Modeling & Fix Patches   │
                  │  🔵 GPT-4o: CVSS v3.1 Scoring & Defensive Tests        │
                  │                                                        │
                  │      ➔ 2/3 Majority Agreement Required for Alerts       │
                  └──────────────────────────┬─────────────────────────────┘
                                             │
                                             ▼
                  ┌────────────────────────────────────────────────────────┐
                  │             Solari MicroVM Linux Sandbox               │
                  │   - Writes test_security_spec.py                       │
                  │   - Executes live Playwright assertion suite           │
                  │   - Emits streaming stdout/stderr terminal proof       │
                  └──────────────────────────┬─────────────────────────────┘
                                             │
                                             ▼
                  ┌────────────────────────────────────────────────────────┐
                  │          Real-Time Tri-View Security Dashboard         │
                  │   - Security Health Grade (A+ to F) & Mean CVSS        │
                  │   - OWASP Top 10 Distribution Breakdown                │
                  │   - Tabbed Framework Remediation (Next.js/FastAPI/Nginx│
                  │   - 1-Click Export: GitHub Issue & Full Markdown Report│
                  └────────────────────────────────────────────────────────┘
```

---

## ✨ Core Capabilities

- **🛡️ Comprehensive Security Auditing**:
  - **Security Headers**: Content-Security-Policy (CSP), HTTP Strict Transport Security (HSTS), X-Frame-Options, X-Content-Type-Options, Referrer-Policy.
  - **CORS & Access Control**: Flags overly permissive `Access-Control-Allow-Origin: *` with credentials.
  - **Cookie Hygiene**: Traps sensitive authentication cookies lacking `HttpOnly` or `Secure` flags.
  - **DOM & Form Auditing**: Flags plaintext password submission over unencrypted HTTP and scans client bundles for leaked API keys (AWS, Stripe, GitHub tokens).
- **🤖 Multi-Model Consensus (Gemini 3.5 + Claude 3.7 + GPT-4o)**:
  - Dynamically runs parallel consensus reasoning across active models.
  - Gracefully functions with whatever API key is provided (single-key fallback with multi-perspective analysis).
- **⚡ Solari MicroVM Defensive Verification**:
  - Synthesizes Playwright test specs in TypeScript (`@playwright/test`) and Python (`pytest-playwright`).
  - Executes them in ephemeral Linux MicroVMs to guarantee 100% deterministic test reproducibility.
- **🔐 Behind-Login & Authenticated Pentesting**:
  - Built-in form-based credential login and **Solari Persistent Profile IDs** (to audit 2FA/SSO-protected dashboards).
- **📋 1-Click Developer Exporter**:
  - Ready-to-paste **GitHub Issue / Jira Tickets** with CVSS scores, repro steps, and test specs.
  - Framework remediation snippets for **Next.js**, **FastAPI / Python**, **Nginx**, and **Express**.
  - Downloadable **Executive Markdown Security Audit Report**.

---

## 🚀 Quickstart

### Prerequisites
- **Python 3.13+** (using `uv` package manager)
- **Node.js 20+** & `npm`
- **Solari API Key**: Get one at [console.getsolari.com](https://console.getsolari.com)
- **Google Gemini / Claude / OpenAI API Key** (Gemini 3.5 Flash Lite configured by default)

---

### 1. Backend Setup

```bash
cd examples/bugscout/backend

# 1. Install dependencies using uv
uv sync

# 2. Configure environment variables
cp .env.example .env
# Edit .env with your SOLARI_API_KEY and GEMINI_API_KEY / ANTHROPIC_API_KEY / OPENAI_API_KEY

# 3. Run full test suite (16 tests)
PYTHONPATH=. uv run pytest tests -v

# 4. Start FastAPI backend server
uv run uvicorn app.main:app --port 8000 --host 0.0.0.0
```

The backend API will be live at `http://localhost:8000`.

---

### 2. Frontend Setup

```bash
cd examples/bugscout/frontend

# 1. Install dependencies
npm install

# 2. Start Next.js development server
npm run dev -- -p 3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
bugscout/
├── README.md                           # Documentation & security architecture guide
├── backend/
│   ├── pyproject.toml                  # Python 3.13 dependencies & configuration (uv)
│   ├── .env.example                    # Environment variable template
│   ├── app/
│   │   ├── config.py                   # Pydantic BaseSettings & model configurations
│   │   ├── main.py                     # FastAPI application factory & CORS setup
│   │   ├── models/
│   │   │   └── schemas.py              # Pydantic schemas (CVSS, OWASP, DiscoveredBug, QAReport)
│   │   ├── services/
│   │   │   ├── browser_agent.py        # Autonomous security crawler & CDP anomaly trapper
│   │   │   ├── security_scanner.py     # OWASP Top 10, Header, Cookie & DOM security auditor
│   │   │   ├── llm_ensemble.py         # Multi-model consensus (Gemini 3.5, Claude 3.7, GPT-4o)
│   │   │   ├── sandbox_runner.py       # Solari Linux MicroVM defensive assertion runner
│   │   │   ├── test_synthesizer.py     # Playwright TS & Python script synthesizer
│   │   │   ├── bug_classifier.py       # CVSS scoring & GitHub issue generator
│   │   │   └── recording_manager.py    # Solari session video replay manager
│   │   └── api/
│   │       └── routes.py               # SSE streaming & security audit endpoints
│   └── tests/
│       ├── test_security.py            # SecurityScanner & LLMEnsemble unit tests
│       ├── test_schemas.py             # Pydantic validation unit tests
│       ├── test_classifier.py          # Severity scoring & ticket format tests
│       ├── test_agent.py               # Synthesizer & agent unit tests
│       └── test_api.py                 # FastAPI TestClient endpoint tests
└── frontend/
    ├── package.json                    # Next.js 16, React 19, Tailwind CSS
    ├── tsconfig.json                   # TypeScript strict mode configuration
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx                # Main security audit dashboard
    │   │   ├── layout.tsx              # Root HTML layout & metadata
    │   │   └── globals.css             # Dark minimalist theme & custom styling
    │   ├── components/
    │   │   ├── Header.tsx              # Brand navbar & model ensemble badges
    │   │   ├── AuditConfig.tsx         # Target URL input, scope presets & model switches
    │   │   ├── TriViewStream.tsx       # 3-panel live telemetry, browser viewport & terminal
    │   │   ├── BugReportCard.tsx       # CVSS badges, OWASP tags, multi-model consensus & fixes
    │   │   └── QualityScorecard.tsx    # Security grade, mean CVSS, OWASP matrix & export
    │   └── types/
    │       └── index.ts                # TypeScript interfaces
```

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns backend health, Solari Cloud status, and active AI models |
| `POST` | `/api/audit/start` | Initiates an autonomous audit job and returns `session_id` |
| `GET` | `/api/audit/stream/{session_id}` | Real-time Server-Sent Events (SSE) stream of reasoning, screenshots, and terminal output |
| `GET` | `/api/audit/report/{session_id}` | Returns completed `QAReport` with CVSS metrics and OWASP breakdown |
| `GET` | `/api/audit/recording/{session_id}` | Proxies or redirects to full video replay of the crawl session |

---

## 📄 License

MIT © 2026 Solari Cookbook Contributors. Built for the [Solari Platform](https://getsolari.com).
