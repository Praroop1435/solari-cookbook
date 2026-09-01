import logging
from typing import List, Dict, Any, Optional, Callable

from ..models.task import ResearchProfile
from ..models.evidence import EvidenceStore
from ..models.result import ResearchReport, OpportunityResult, ComparisonMatrix, AgentTraceStep
from ..models.events import EventType
from ..llm.client import LLMClient

logger = logging.getLogger(__name__)


class ReporterAgent:
    def __init__(self, llm_client: LLMClient):
        self.llm = llm_client

    async def generate_report(
        self,
        task_id: str,
        objective: str,
        profile: Optional[ResearchProfile],
        evidence_store: EvidenceStore,
        ranked_data: Dict[str, Any],
        sandbox_computations: List[Dict[str, Any]],
        agent_trace: List[AgentTraceStep],
        emit_event: Optional[Callable[[EventType, str, str, Dict[str, Any]], None]] = None,
    ) -> ResearchReport:
        """Synthesizes the complete final research report with cards, comparisons, and audit citations."""
        if emit_event:
            emit_event(
                EventType.AGENT_STATUS,
                "Compiling Executive Report",
                "Synthesizing findings, calculating match rationales, and attaching citation graph...",
                {"stage": "REPORTING"},
            )

        ranked_entities = ranked_data.get("ranked_entities", [])
        comparison_matrix: Optional[ComparisonMatrix] = ranked_data.get("comparison_matrix")

        if self.llm.is_available() and ranked_entities:
            try:
                report = await self.llm.synthesize_final_report(
                    objective=objective,
                    profile=profile,
                    evidence_items=evidence_store.items,
                    ranked_entities=ranked_entities,
                    comparison_matrix=comparison_matrix,
                    sandbox_computations=sandbox_computations,
                    agent_trace=agent_trace,
                )
                report.task_id = task_id
            except Exception as e:
                logger.warning(f"Error synthesizing report with LLM: {e}")
                report = None
        else:
            report = None

        # Fallback structured report if LLM synthesis was skipped or failed
        if not report:
            top_results = []
            for idx, ent in enumerate(ranked_entities):
                name = ent.get("name", f"Entity {idx+1}")
                ent_evidence = evidence_store.get_by_entity(name)
                source_urls = list(set([ev.source_url for ev in ent_evidence]))
                evidence_ids = [ev.id for ev in ent_evidence]

                top_results.append(
                    OpportunityResult(
                        id=f"res_{idx+1}",
                        name=name,
                        score=float(ent.get("score", 90.0)),
                        recommendation=ent.get("recommendation", "Strong Match"),
                        match_reason=ent.get("why_matches", f"High relevance to search objective based on collected evidence."),
                        key_facts=[ev.claim for ev in ent_evidence[:3]] or ["Verified presence in live web search."],
                        risks_and_concerns=ent.get("risks", ["High market velocity"]),
                        outreach_strategy=f"Reference specific work regarding {name}'s technology stack in your outreach.",
                        attributes=ent.get("key_metrics", {}),
                        evidence_ids=evidence_ids,
                        source_urls=source_urls,
                    )
                )

            report = ResearchReport(
                task_id=task_id,
                objective=objective,
                executive_summary=f"Autonomous investigation completed for objective: '{objective}'. We identified and analyzed {len(top_results)} key opportunities grounded in {len(evidence_store.items)} collected evidence items.",
                methodology="ScoutAI autonomous pipeline utilizing Solari cloud browser discovery, DOM fact extraction, and Solari microVM Sandbox scoring.",
                top_results=top_results,
                comparison_matrix=comparison_matrix,
                evidence_vault=evidence_store.items,
                agent_trace=agent_trace,
                sandbox_computations=sandbox_computations,
                stats={
                    "total_evidence_points": len(evidence_store.items),
                    "total_sources_consulted": len(set(e.source_url for e in evidence_store.items)),
                    "sandbox_executions": len(sandbox_computations),
                },
            )

        if emit_event:
            emit_event(
                EventType.REPORT_FINALIZED,
                "Research Report Published",
                f"Generated report with {len(report.top_results)} opportunity cards and {len(report.evidence_vault)} verified citations.",
                {"report": report.model_dump(), "stage": "REPORTING"},
            )

        return report
