# Solari Cookbook

[![Solari](https://img.shields.io/badge/Solari-Cloud%20Infra-000000?style=for-the-badge&logo=cloudflare&logoColor=white)](https://getsolari.com)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

Short, runnable examples for **[Solari](https://getsolari.com)** — cloud browsers, sandboxes, and desktops behind one API key.

Every example in this repo is a complete program you can run in under a minute. They are deliberately small: one idea each, no framework, no scaffolding to read past. Copy one into your project and change the parts you care about.

---

## 🌟 Flagship Full-Stack Agent: Solari Sentinel

| Application | Stack | What it does |
| :--- | :--- | :--- |
| [**Solari Sentinel**](examples/bugscout) | Python 3.13 (FastAPI) + Next.js 16 + Solari Cloud | **Multi-Model Autonomous Security & Vulnerability Auditing Agent**: Anti-bot stealth browser exploration (US residential proxies), OWASP Top 10 header & cookie security scanning, multi-model AI consensus (**Gemini 3.5 Flash Lite + Claude 3.7 Sonnet + GPT-4o**), CVSS v3.1 scoring, automated Playwright defensive test synthesis, and live verification in **Solari Linux MicroVM Sandboxes**. |

---

## 📚 Standalone Recipes

### Cloud Browser

| Recipe | Language | What it shows |
| :--- | :--- | :--- |
| [browser-quickstart-ts](examples/browser-quickstart-ts) | TypeScript | Launch a browser, open a page, read it |
| [browser-quickstart-py](examples/browser-quickstart-py) | Python | Launch a browser, open a page, read it |
| [browser-stealth-proxy-ts](examples/browser-stealth-proxy-ts) | TypeScript | Stealth mode + residential proxy egress |
| [browser-profiles-ts](examples/browser-profiles-ts) | TypeScript | Log in once, reuse the session forever |
| [browser-session-recording-py](examples/browser-session-recording-py) | Python | Record a session, download the replay |

### Sandbox

| Recipe | Language | What it shows |
| :--- | :--- | :--- |
| [sandbox-quickstart-ts](examples/sandbox-quickstart-ts) | TypeScript | Run a command, write and read files |
| [sandbox-code-interpreter-py](examples/sandbox-code-interpreter-py) | Python | Stateful Python kernel for agent loops |
| [sandbox-port-preview-ts](examples/sandbox-port-preview-ts) | TypeScript | Expose a server in the VM on a public URL |

### Desktop (Computer Use)

| Recipe | Language | What it shows |
| :--- | :--- | :--- |
| [desktop-computer-use-py](examples/desktop-computer-use-py) | Python | Screenshot, click, and type on a Linux GUI |

---

## 🚀 Running an Example

Each directory is completely self-contained.

```bash
git clone https://github.com/Praroop1435/solari-cookbook.git
cd solari-cookbook/examples/browser-quickstart-ts

npm install                          # or: pip install -r requirements.txt
export SOLARI_API_KEY=slr_live_...   # grab one at console.getsolari.com
npm start                            # or: python main.py
```

One `slr_live_` key works across browsers, sandboxes, and desktops, and every product bills to the same balance.

---

## 🛠️ Which Product Do I Want?

- **Cloud Browser** — you need a *web page*: scraping, testing, filling forms, anything Playwright or Puppeteer would do locally. Adds stealth, managed proxies, captcha solving, profiles, and session recording.
- **Sandbox** — you need to *run code*: an LLM's Python, an untrusted build, a data job. A headless microVM that boots from a snapshot in about a second.
- **Desktop** — you need a *screen*: computer-use agents, GUI apps, anything that has to be clicked. A sandbox plus X11 and a live VNC stream.

---

## 💡 Gotchas the Examples Encode

Things that cost you an afternoon if you meet them cold:

- **TypeScript: call `await solari.close()`.** The browser client keeps a loopback proxy open for connection retries. Skip the close and your script prints its output and then hangs forever instead of exiting.
- **Recording is per session, not per account.** Pass `recording: true` when you create the session; without it the replay endpoint 404s forever. The upload is async after release, so poll for ~30s before giving up.
- **Sandbox commands are not shell-interpreted.** `run("ls -la")` looks for a binary named `ls -la`. Put argv in `args`, or run `sh -c` explicitly.
- **`kill()`, not `close()`, ends a VM.** `close()` drops your local control channel; the VM keeps running until its idle timeout.
- **`timeoutMs` is a rolling idle window**, not a hard deadline — it resets on every use.

---

## 🔗 Links & Resources

- **Docs**: [docs.getsolari.com](https://docs.getsolari.com)
- **Console**: [console.getsolari.com](https://console.getsolari.com)
- **Changelog**: [changelog.getsolari.com](https://changelog.getsolari.com)
- **Support**: [hello@getsolari.com](mailto:hello@getsolari.com)

---

## 📄 License

MIT © 2026 Solari Cookbook Contributors.
