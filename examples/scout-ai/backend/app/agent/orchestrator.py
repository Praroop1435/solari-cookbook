import asyncio
import time
import logging
from typing import Dict, List, Optional, AsyncGenerator, Callable
from datetime import datetime, timezone

from ..models.task import ResearchTask, TaskStatus, TaskCreateRequest
from ..models.result import ResearchReport, AgentTraceStep
from ..models.events import AgentEvent, EventType
from ..models.evidence import EvidenceStore
from ..tools.browser import BrowserTool
from ..tools.sandbox import SandboxTool
from ..tools.desktop import DesktopTool
from ..llm.client import LLMClient
from ..config import settings
from .planner import PlannerAgent
from .researcher import ResearcherAgent
from .extractor import ExtractorAgent
from .ranker import RankerAgent
from .verifier import VerifierAgent
from .reporter import ReporterAgent
from ..demo.sample_data import get_demo_pipeline_data

logger = logging.getLogger(__name__)


class AgentOrchestrator:
    """
    Central state-machine orchestrator coordinating the ScoutAI pipeline,
    subagents, tools, event broadcasting, and error recovery.
    """

    def __init__(self):
        self.tasks: Dict[str, ResearchTask] = {}
        self.reports: Dict[str, ResearchReport] = {}
        self.event_queues: Dict[str, List[AgentEvent]] = {}
        self.event_subscribers: Dict[str, List[asyncio.Queue]] = {}

    def create_task(self, req: TaskCreateRequest) -> ResearchTask:
        task = ResearchTask(
            objective=req.objective,
            profile=req.profile,
            is_demo=req.is_demo,
            enable_sandbox=req.enable_sandbox,
            enable_recording=req.enable_recording,
        )
        self.tasks[task.id] = task
        self.event_queues[task.id] = []
        self.event_subscribers[task.id] = []
        return task

    def emit_event(
        self,
        task_id: str,
        event_type: EventType,
        title: str,
        detail: str,
        data: Optional[Dict] = None,
        stage: str = "GENERAL",
    ) -> AgentEvent:
        evt = AgentEvent(
            task_id=task_id,
            event_type=event_type,
            stage=stage,
            title=title,
            detail=detail,
            data=data or {},
        )
        if task_id in self.event_queues:
            self.event_queues[task_id].append(evt)

        # Notify any active SSE subscribers
        if task_id in self.event_subscribers:
            for queue in self.event_subscribers[task_id]:
                try:
                    queue.put_nowait(evt)
                except Exception:
                    pass

        return evt

    async def subscribe_events(self, task_id: str) -> AsyncGenerator[AgentEvent, None]:
        """Yields historical events and listens for new events over SSE."""
        queue: asyncio.Queue = asyncio.Queue()

        # Send past events first
        past_events = list(self.event_queues.get(task_id, []))
        for evt in past_events:
            yield evt

        # Register queue for real-time streaming
        if task_id not in self.event_subscribers:
            self.event_subscribers[task_id] = []
        self.event_subscribers[task_id].append(queue)

        try:
            while True:
                task = self.tasks.get(task_id)
                # If task already completed and queue is empty, exit
                if task and task.status in [TaskStatus.COMPLETED, TaskStatus.FAILED] and queue.empty():
                    break

                try:
                    evt = await asyncio.wait_for(queue.get(), timeout=1.0)
                    yield evt
                except asyncio.TimeoutError:
                    # Heartbeat
                    continue
        finally:
            if task_id in self.event_subscribers and queue in self.event_subscribers[task_id]:
                self.event_subscribers[task_id].remove(queue)

    async def execute_task(
        self,
        task_id: str,
        custom_solari_key: Optional[str] = None,
        custom_gemini_key: Optional[str] = None,
    ) -> ResearchReport:
        """Executes the full multi-stage state machine for a research task."""
        task = self.tasks.get(task_id)
        if not task:
            raise ValueError(f"Task {task_id} not found")

        # Initialize tools & LLM with optional request-specific credentials
        solari_key = custom_solari_key or settings.solari_api_key
        gemini_key = custom_gemini_key or settings.gemini_api_key

        browser_tool = BrowserTool(api_key=solari_key)
        sandbox_tool = SandboxTool(api_key=solari_key)
        desktop_tool = DesktopTool(api_key=solari_key)
        llm_client = LLMClient(api_key=gemini_key)

        planner = PlannerAgent(llm_client)
        researcher = ResearcherAgent(browser_tool)
        extractor = ExtractorAgent(llm_client)
        ranker = RankerAgent(sandbox_tool, llm_client)
        verifier = VerifierAgent(llm_client)
        reporter = ReporterAgent(llm_client)

        agent_trace: List[AgentTraceStep] = []
        sandbox_computations: List[Dict] = []
        step_idx = 1

        def record_step(stage: str, action: str, tool: Optional[str], details: str, duration: int):
            nonlocal step_idx
            step = AgentTraceStep(
                step_number=step_idx,
                stage=stage,
                action=action,
                tool_used=tool,
                details=details,
                duration_ms=duration,
            )
            agent_trace.append(step)
            step_idx += 1

        def emit(event_type: EventType, title: str, detail: str, data: Optional[Dict] = None):
            st = data.get("stage", task.status.value) if data else task.status.value
            return self.emit_event(task_id, event_type, title, detail, data, stage=st)

        # Check if Demo mode or missing credentials
        has_solari = await browser_tool.is_available()
        if task.is_demo or not has_solari:
            if not has_solari and not task.is_demo:
                emit(
                    EventType.AGENT_STATUS,
                    "Live Solari Key Required",
                    "SOLARI_API_KEY is not set. Launching high-fidelity deterministic research simulation so you can evaluate the agent pipeline.",
                    {"stage": "DEMO"},
                )
            return await self._run_demo_pipeline(task, emit)

        try:
            # 1. PLANNING STAGE
            task.status = TaskStatus.PLANNING
            t0 = time.time()
            plan = await planner.plan(task.id, task.objective, task.profile, emit)
            task.plan = plan
            record_step("PLANNING", "Formulate Research Plan", "Gemini Flash Lite", f"Created plan with {len(plan.search_queries)} search targets", int((time.time() - t0) * 1000))

            # 2. SEARCHING STAGE
            task.status = TaskStatus.SEARCHING
            t0 = time.time()
            sources = await researcher.search_and_gather(task.id, plan.search_queries, emit_event=emit)
            record_step("SEARCHING", "Web Discovery", "SolariBrowserTool", f"Discovered {len(sources)} candidate web sources", int((time.time() - t0) * 1000))

            # 3. BROWSING STAGE
            task.status = TaskStatus.BROWSING
            t0 = time.time()
            extractions = await researcher.browse_and_extract(
                task.id,
                sources,
                record=task.enable_recording,
                emit_event=emit,
            )
            record_step("BROWSING", "Cloud Browser Navigation", "SolariBrowserTool", f"Retrieved DOM & text for {len(extractions)} target sites", int((time.time() - t0) * 1000))

            # 4. EXTRACTING STAGE
            task.status = TaskStatus.EXTRACTING
            t0 = time.time()
            evidence_store = await extractor.extract_evidence(
                task.id,
                extractions,
                task.objective,
                plan.entities,
                emit_event=emit,
            )
            record_step("EXTRACTING", "Evidence Extraction", "Gemini Flash Lite", f"Extracted {len(evidence_store.items)} verifiable claims", int((time.time() - t0) * 1000))

            # 5. ANALYZING & RANKING IN SANDBOX
            task.status = TaskStatus.RANKING_SANDBOX
            t0 = time.time()
            ranked_data = await ranker.rank_and_analyze(
                task.id,
                task.objective,
                evidence_store,
                plan.ranking_criteria,
                profile=task.profile,
                enable_sandbox=task.enable_sandbox,
                emit_event=emit,
            )
            if ranked_data.get("sandbox_executed"):
                sandbox_computations.append({
                    "code": ranked_data.get("sandbox_code"),
                    "status": "success",
                })
            record_step(
                "RANKING_SANDBOX",
                "MicroVM Data Computation",
                "SolariSandboxTool" if ranked_data.get("sandbox_executed") else "Local Python Kernel",
                f"Ranked {len(ranked_data.get('ranked_entities', []))} opportunities",
                int((time.time() - t0) * 1000),
            )

            # 6. VERIFYING STAGE
            task.status = TaskStatus.VERIFYING
            t0 = time.time()
            verifications = await verifier.verify_evidence_grounding(
                task.id,
                ranked_data.get("ranked_entities", []),
                evidence_store,
                emit_event=emit,
            )
            record_step("VERIFYING", "Claim Verification", "Gemini Flash Lite", f"Audited {len(verifications)} claims against evidence store", int((time.time() - t0) * 1000))

            # 7. REPORTING STAGE
            task.status = TaskStatus.REPORTING
            t0 = time.time()
            report = await reporter.generate_report(
                task.id,
                task.objective,
                task.profile,
                evidence_store,
                ranked_data,
                sandbox_computations,
                agent_trace,
                emit_event=emit,
            )
            record_step("REPORTING", "Executive Report Synthesis", "Gemini Flash Lite", "Synthesized report and citation graph", int((time.time() - t0) * 1000))

            # 8. COMPLETED
            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.now(timezone.utc)
            self.reports[task.id] = report
            emit(EventType.AGENT_STATUS, "Research Completed Successfully", "All research stages finished. Report is ready for review.", {"stage": "COMPLETED"})
            return report

        except Exception as e:
            logger.error(f"Task {task_id} failed: {e}", exc_info=True)
            task.status = TaskStatus.FAILED
            task.error = str(e)
            emit(EventType.ERROR_OCCURRED, "Pipeline Error", str(e), {"stage": "FAILED"})
            raise

    async def _run_demo_pipeline(
        self,
        task: ResearchTask,
        emit: Callable[[EventType, str, str, Optional[Dict]], AgentEvent],
    ) -> ResearchReport:
        """Executes a deterministic demonstration pipeline with realistic timings and events."""
        demo_data = get_demo_pipeline_data(task.id, task.objective, task.profile)

        # 1. Planning
        task.status = TaskStatus.PLANNING
        emit(EventType.AGENT_STATUS, "Decomposing Objective", "Analyzing research goal and crafting structured exploration plan...", {"stage": "PLANNING"})
        await asyncio.sleep(1.2)
        task.plan = demo_data["plan"]
        emit(EventType.PLAN_CREATED, "Research Plan Formulated", f"Generated plan with {len(task.plan.search_queries)} queries targeting {len(task.plan.entities)} entities.", {"plan": task.plan.model_dump(), "stage": "PLANNING"})

        # 2. Searching
        task.status = TaskStatus.SEARCHING
        for q in task.plan.search_queries:
            emit(EventType.BROWSER_SEARCH, f"Searching: '{q}'", "Executing query via Solari cloud browser", {"query": q, "stage": "SEARCHING"})
            await asyncio.sleep(0.8)
        for src in demo_data["sources"]:
            emit(EventType.SOURCE_FOUND, f"Discovered Source: {src['title']}", f"Found on {src['domain']}", {"source": src, "stage": "SEARCHING"})
            await asyncio.sleep(0.4)

        # 3. Browsing
        task.status = TaskStatus.BROWSING
        for src in demo_data["sources"][:3]:
            emit(EventType.BROWSER_NAVIGATION, f"Navigating to {src['domain']}", f"Opening {src['url']} in Solari stealth browser session", {"url": src["url"], "stage": "BROWSING"})
            await asyncio.sleep(0.9)
            emit(EventType.BROWSER_EXTRACTION, f"Page Content Captured: {src['title']}", f"Extracted DOM and structured links from {src['domain']}", {"url": src["url"], "stage": "BROWSING"})

        # 4. Extracting
        task.status = TaskStatus.EXTRACTING
        emit(EventType.AGENT_STATUS, "Extracting Grounded Evidence", "Extracting factual claims backed by quotes from captured content...", {"stage": "EXTRACTING"})
        await asyncio.sleep(1.0)
        for ev in demo_data["evidence"]:
            emit(EventType.EVIDENCE_EXTRACTED, f"Evidence Extracted: {ev.entity}", f"Claim: '{ev.claim[:80]}...'", {"evidence": ev.model_dump(), "stage": "EXTRACTING"})
            await asyncio.sleep(0.3)

        # 5. Sandbox Ranking
        task.status = TaskStatus.RANKING_SANDBOX
        emit(EventType.SANDBOX_STARTED, "Booting Solari MicroVM Sandbox", "Starting isolated Python kernel for compensation normalization and composite scoring...", {"stage": "RANKING_SANDBOX"})
        await asyncio.sleep(1.5)
        emit(EventType.SANDBOX_EXECUTION, "Solari Sandbox Execution Complete", "Ranked 5 candidate companies with deterministic scoring matrix.", {"stage": "RANKING_SANDBOX"})

        # 6. Verifying
        task.status = TaskStatus.VERIFYING
        emit(EventType.AGENT_STATUS, "Auditing Fact Grounding", "Cross-checking claims against collected evidence quotes to eliminate hallucinations...", {"stage": "VERIFYING"})
        await asyncio.sleep(1.0)
        emit(EventType.VERIFICATION_COMPLETED, "Fact Audit Complete", f"Audited 12 claims (100% grounded in source text).", {"stage": "VERIFYING"})

        # 7. Reporting
        task.status = TaskStatus.REPORTING
        emit(EventType.AGENT_STATUS, "Compiling Executive Report", "Synthesizing executive summary, opportunity scorecards, and sortable comparison matrix...", {"stage": "REPORTING"})
        await asyncio.sleep(1.2)

        report = demo_data["report"]
        task.status = TaskStatus.COMPLETED
        task.completed_at = datetime.now(timezone.utc)
        self.reports[task.id] = report

        emit(EventType.REPORT_FINALIZED, "Research Report Published", f"Published report with {len(report.top_results)} opportunity cards and {len(report.evidence_vault)} citations.", {"report": report.model_dump(), "stage": "REPORTING"})
        emit(EventType.AGENT_STATUS, "Research Completed Successfully", "All research stages finished. Report is ready for review.", {"stage": "COMPLETED"})

        return report
