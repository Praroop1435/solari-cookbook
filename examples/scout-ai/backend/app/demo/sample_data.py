from typing import Dict, Any, Optional
from datetime import datetime
from ..models.task import PlanSchema, ResearchProfile
from ..models.evidence import EvidenceItem
from ..models.result import OpportunityResult, ComparisonMatrix, ResearchReport, AgentTraceStep


def get_demo_pipeline_data(task_id: str, objective: str, profile: Optional[ResearchProfile] = None) -> Dict[str, Any]:
    plan = PlanSchema(
        objective=objective,
        entities=["Solari", "Modal Labs", "Braintrust Data", "Anyscale", "Langfuse"],
        sources=[
            "Hacker News Who is Hiring (March 2026)",
            "Y Combinator Directory & Work at a Startup",
            "Company Careers & Engineering Portals",
            "TechCrunch Seed/Series A Funding Rounds",
        ],
        search_queries=[
            "AI infrastructure startups hiring senior backend engineer 2026",
            "Python distributed systems cloud sandbox startups careers",
            "early stage AI developer tooling companies funding salary",
            "fast growing AI agents backend engineering roles",
        ],
        information_to_collect=[
            "Role Focus & Distributed Systems Requirements",
            "Salary Range, Equity Pool & Location Options",
            "Tech Stack (Python, Rust, Playwright, Cloud VMs)",
            "Recent Funding Milestones & Team Size",
        ],
        ranking_criteria=[
            "Technical Match with Python / Agent Tooling",
            "Company Growth Momentum & Backing",
            "Compensation Transparency & Equity Upside",
            "Engineering Autonomy & Culture",
        ],
        final_output_format="Executive Summary, Top Opportunity Cards, Sortable Matrix, and Grounded Citations",
    )

    sources = [
        {
            "id": "src_1",
            "url": "https://news.ycombinator.com/item?id=39581023",
            "title": "Ask HN: Who is hiring? (March 2026)",
            "snippet": "Solari (YC W24) — Cloud browsers, MicroVM sandboxes, and desktops for AI agents. Hiring Senior Backend Engineers ($180k-$250k + 1.0%-2.0% equity).",
            "domain": "news.ycombinator.com",
            "source_type": "search_result",
        },
        {
            "id": "src_2",
            "url": "https://modal.com/careers/backend-infra-engineer",
            "title": "Modal Labs — Senior Infrastructure Engineer",
            "snippet": "Modal is building serverless cloud compute for AI and data teams. Looking for engineers experienced in Linux containers, Rust, and Python runtime design.",
            "domain": "modal.com",
            "source_type": "career_page",
        },
        {
            "id": "src_3",
            "url": "https://www.braintrust.dev/careers",
            "title": "Braintrust — AI Evaluation & Observability Platform",
            "snippet": "Braintrust powers enterprise AI evals and proxies. Raised $36M Series A led by a16z. Hiring Full-Stack & Systems Engineers ($170k-$230k).",
            "domain": "braintrust.dev",
            "source_type": "career_page",
        },
        {
            "id": "src_4",
            "url": "https://langfuse.com/careers",
            "title": "Langfuse (YC W23) — Open Source LLM Engineering Platform",
            "snippet": "Langfuse is the open source LLM observability and analytics platform. Hiring remote backend engineers working with high-throughput event processing.",
            "domain": "langfuse.com",
            "source_type": "career_page",
        },
    ]

    evidence = [
        EvidenceItem(
            id="ev_slr_01",
            source_url="https://news.ycombinator.com/item?id=39581023",
            source_title="Ask HN: Who is hiring? (March 2026)",
            entity="Solari",
            claim="Solari provides unified cloud browsers, microVM sandboxes, and desktops via single API and is hiring Backend Engineers with $180k-$250k salary.",
            evidence_snippet="Solari (YC W24) — Cloud browsers, MicroVM sandboxes, and desktops for AI agents. Hiring Senior Backend Engineers ($180k-$250k + 1.0%-2.0% equity). Remote (US/Canada). Stack: Python, Rust, Linux, Playwright.",
            confidence=0.98,
            category="compensation",
        ),
        EvidenceItem(
            id="ev_mdl_01",
            source_url="https://modal.com/careers/backend-infra-engineer",
            source_title="Modal Labs — Senior Infrastructure Engineer",
            entity="Modal Labs",
            claim="Modal is building high-speed container execution and serverless cloud computing for AI workloads.",
            evidence_snippet="We build custom container virtualization that boots in hundreds of milliseconds. Tech stack: Python client, Rust runtime, Linux gVisor.",
            confidence=0.95,
            category="tech_stack",
        ),
        EvidenceItem(
            id="ev_btn_01",
            source_url="https://www.braintrust.dev/careers",
            source_title="Braintrust — AI Evaluation Platform",
            entity="Braintrust Data",
            claim="Braintrust raised $36M Series A led by a16z and is expanding high-throughput AI proxy infrastructure.",
            evidence_snippet="Braintrust raised $36M Series A led by Andreessen Horowitz. Managing billions of AI evaluation events monthly. Compensation: $170k-$230k + equity.",
            confidence=0.96,
            category="funding",
        ),
        EvidenceItem(
            id="ev_lgf_01",
            source_url="https://langfuse.com/careers",
            source_title="Langfuse — Open Source LLM Engineering",
            entity="Langfuse",
            claim="Langfuse is a fast-growing YC-backed open source observability platform for AI applications.",
            evidence_snippet="YC W23. 100% remote team across US/Europe. Tech stack: TypeScript, Next.js, Python, ClickHouse, PostgreSQL.",
            confidence=0.94,
            category="growth",
        ),
    ]

    top_results = [
        OpportunityResult(
            id="res_1",
            name="Solari",
            score=96.4,
            recommendation="Strong Match",
            match_reason="Direct alignment with agent infrastructure, cloud browser automation, and microVM execution in Python and Rust.",
            key_facts=[
                "Hiring Senior Backend Engineers ($180k-$250k base + 1.0%-2.0% equity)",
                "Building unified cloud browser and sandbox APIs for the next generation of autonomous AI agents",
                "Remote-first team with strong engineering velocity and low meeting overhead",
            ],
            risks_and_concerns=[
                "High ambiguity early-stage environment requiring deep systems ownership",
            ],
            outreach_strategy="Highlight experience building autonomous browser agents and stateful microVM execution loops like ScoutAI.",
            attributes={
                "role": "Senior Backend / Infra Engineer",
                "salary": "$180k - $250k + 1-2% Equity",
                "location": "Remote (US/Canada)",
                "stage": "Seed / YC W24",
                "tech_stack": "Python, Rust, Playwright, Linux Kernels",
            },
            evidence_ids=["ev_slr_01"],
            source_urls=["https://news.ycombinator.com/item?id=39581023"],
        ),
        OpportunityResult(
            id="res_2",
            name="Modal Labs",
            score=92.1,
            recommendation="Strong Match",
            match_reason="Pioneering serverless infrastructure for AI with deep Python and Linux runtime optimizations.",
            key_facts=[
                "Sub-second container boot times for GPU and CPU AI workloads",
                "World-class engineering team based in NYC and remote",
                "Competitive salary ($190k-$240k) and significant tier-1 equity",
            ],
            risks_and_concerns=[
                "Requires deep low-level Linux systems and kernel-level debugging expertise",
            ],
            outreach_strategy="Discuss distributed execution benchmarks and async orchestration workflows.",
            attributes={
                "role": "Infrastructure Engineer",
                "salary": "$190k - $240k + Equity",
                "location": "New York, NY / Remote",
                "stage": "Series A",
                "tech_stack": "Rust, Python, gVisor, Kubernetes",
            },
            evidence_ids=["ev_mdl_01"],
            source_urls=["https://modal.com/careers/backend-infra-engineer"],
        ),
        OpportunityResult(
            id="res_3",
            name="Braintrust Data",
            score=88.5,
            recommendation="High Potential",
            match_reason="Leader in enterprise AI observability and proxy architecture with high customer traction.",
            key_facts=[
                "Backed by a16z with $36M Series A funding",
                "Building high-throughput proxy and evaluation pipeline for Fortune 500 AI deployments",
                "Salary: $170k - $230k with generous equity pool",
            ],
            risks_and_concerns=[
                "Growing enterprise sales motion requires enterprise-grade security and SOC2 compliance focus",
            ],
            outreach_strategy="Emphasize automated eval harness design and LLM latency optimization experience.",
            attributes={
                "role": "Systems / Backend Engineer",
                "salary": "$170k - $230k + Equity",
                "location": "San Francisco / Remote",
                "stage": "Series A ($36M)",
                "tech_stack": "TypeScript, Python, Postgres, ClickHouse",
            },
            evidence_ids=["ev_btn_01"],
            source_urls=["https://www.braintrust.dev/careers"],
        ),
        OpportunityResult(
            id="res_4",
            name="Langfuse",
            score=85.0,
            recommendation="High Potential",
            match_reason="Open-source standard for AI observability with vibrant developer community.",
            key_facts=[
                "YC W23 graduate with thousands of active GitHub stars and production users",
                "High-throughput telemetry ingestion and ClickHouse analytics backend",
                "Competitive European/US remote compensation packages",
            ],
            risks_and_concerns=[
                "Smaller core team balancing open-source community support and cloud enterprise tier",
            ],
            outreach_strategy="Reference open-source contributions and high-volume event ingestion architecture.",
            attributes={
                "role": "Backend / Data Engineer",
                "salary": "$160k - $210k + Equity",
                "location": "Remote (Global)",
                "stage": "Seed / YC",
                "tech_stack": "ClickHouse, Python, TypeScript, Docker",
            },
            evidence_ids=["ev_lgf_01"],
            source_urls=["https://langfuse.com/careers"],
        ),
    ]

    matrix = ComparisonMatrix(
        columns=["Company", "Match Score", "Core Stack", "Target Role", "Stage / Funding", "Recommendation"],
        rows=[
            {
                "Company": "Solari",
                "Match Score": "96.4%",
                "Core Stack": "Python, Rust, Playwright, Linux",
                "Target Role": "Senior Backend / Infra Engineer",
                "Stage / Funding": "YC W24 / High Growth",
                "Recommendation": "Strong Match",
            },
            {
                "Company": "Modal Labs",
                "Match Score": "92.1%",
                "Core Stack": "Rust, Python, gVisor, Containers",
                "Target Role": "Infrastructure Engineer",
                "Stage / Funding": "Series A / $16M+",
                "Recommendation": "Strong Match",
            },
            {
                "Company": "Braintrust Data",
                "Match Score": "88.5%",
                "Core Stack": "TypeScript, Python, ClickHouse",
                "Target Role": "Systems / Backend Engineer",
                "Stage / Funding": "Series A / $36M",
                "Recommendation": "High Potential",
            },
            {
                "Company": "Langfuse",
                "Match Score": "85.0%",
                "Core Stack": "ClickHouse, Python, TypeScript",
                "Target Role": "Backend / Data Engineer",
                "Stage / Funding": "YC W23 / Seed",
                "Recommendation": "High Potential",
            },
        ],
        summary="Ranked 4 high-momentum AI infrastructure and developer tooling companies against skill alignment, compensation, and systems engineering criteria.",
    )

    agent_trace = [
        AgentTraceStep(step_number=1, stage="PLANNING", action="Formulate Research Plan", tool_used="Gemini Flash Lite", details="Generated 4 queries targeting AI systems roles and early stage startups", duration_ms=420),
        AgentTraceStep(step_number=2, stage="SEARCHING", action="Execute Cloud Search", tool_used="SolariBrowserTool", details="Executed search queries via Solari stealth browser session", duration_ms=1850),
        AgentTraceStep(step_number=3, stage="BROWSING", action="Extract DOM & Links", tool_used="SolariBrowserTool", details="Captured full page text from 4 hiring announcements & career pages", duration_ms=2940),
        AgentTraceStep(step_number=4, stage="EXTRACTING", action="Structured Fact Extraction", tool_used="Gemini Flash Lite", details="Extracted 4 grounded evidence items with direct quotes", duration_ms=810),
        AgentTraceStep(step_number=5, stage="RANKING_SANDBOX", action="MicroVM Data Computation", tool_used="SolariSandboxTool", details="Calculated composite scores and matrix normalization inside Linux microVM", duration_ms=1620),
        AgentTraceStep(step_number=6, stage="VERIFYING", action="Fact Audit & Grounding Guard", tool_used="Gemini Flash Lite", details="Audited 100% of claims against collected evidence quotes", duration_ms=490),
        AgentTraceStep(step_number=7, stage="REPORTING", action="Executive Synthesis", tool_used="Gemini Flash Lite", details="Synthesized final report, scorecards, comparison matrix, and citations", duration_ms=750),
    ]

    report = ResearchReport(
        task_id=task_id,
        objective=objective,
        executive_summary=(
            "Based on autonomous exploration across primary developer hiring boards and company career portals, "
            "we identified 4 standout early-stage AI infrastructure startups hiring backend and distributed systems engineers. "
            "Solari and Modal Labs emerge as top tier opportunities with direct overlap in cloud browser automation, "
            "microVM sandbox virtualization, and high-performance Python runtimes. Both offer strong equity ownership (1.0%-2.0%) "
            "and transparent compensation packages."
        ),
        methodology="ScoutAI autonomous pipeline utilizing Solari cloud browser discovery, DOM fact extraction, and Solari microVM Sandbox scoring.",
        top_results=top_results,
        comparison_matrix=matrix,
        evidence_vault=evidence,
        agent_trace=agent_trace,
        sandbox_computations=[
            {
                "language": "python",
                "kernel": "Solari MicroVM Python 3.11",
                "stdout": "Calculated composite match scores: Solari=96.4, Modal=92.1, Braintrust=88.5, Langfuse=85.0\nMatrix normalization completed.",
                "status": "success",
            }
        ],
        stats={
            "total_evidence_points": len(evidence),
            "total_sources_consulted": len(sources),
            "sandbox_executions": 1,
            "verification_rate": "100% grounded",
        },
    )

    return {
        "plan": plan,
        "sources": sources,
        "evidence": evidence,
        "report": report,
    }
