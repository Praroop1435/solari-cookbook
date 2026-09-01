import logging
from typing import Optional, Callable, Dict, Any

from ..models.task import ResearchProfile, PlanSchema
from ..models.events import EventType
from ..llm.client import LLMClient

logger = logging.getLogger(__name__)


class PlannerAgent:
    def __init__(self, llm_client: LLMClient):
        self.llm = llm_client

    async def plan(
        self,
        task_id: str,
        objective: str,
        profile: Optional[ResearchProfile] = None,
        emit_event: Optional[Callable[[EventType, str, str, Dict[str, Any]], None]] = None,
    ) -> PlanSchema:
        logger.info(f"[{task_id}] Planning research for: {objective}")
        if emit_event:
            emit_event(
                EventType.AGENT_STATUS,
                "Decomposing Objective",
                f"Analyzing research goal and crafting structured exploration plan for: '{objective[:80]}...'",
                {"stage": "PLANNING"},
            )

        if not self.llm.is_available():
            # Fallback heuristic plan if LLM key is absent
            plan = PlanSchema(
                objective=objective,
                entities=["Leading Startups & Roles in AI Systems", "Top Venture Backed Companies"],
                sources=["Hacker News Who is Hiring", "Y Combinator Startups", "Company Career Portals"],
                search_queries=[
                    f"{objective} site:news.ycombinator.com/item",
                    f"{objective} tech stack salary",
                    f"{objective} careers 2026",
                ],
                information_to_collect=[
                    "Role Responsibilities & Tech Stack",
                    "Compensation & Equity Bands",
                    "Company Growth & Stage",
                    "Location & Remote Policy",
                ],
                ranking_criteria=[
                    "Direct Alignment with Skills",
                    "Compensation & Benefits",
                    "Engineering Culture & Scale",
                ],
                final_output_format="Executive Summary, Opportunity Cards, Sortable Matrix, and Evidence Vault",
            )
        else:
            plan = await self.llm.generate_plan(objective, profile)

        if emit_event:
            emit_event(
                EventType.PLAN_CREATED,
                "Research Plan Formulated",
                f"Generated plan with {len(plan.search_queries)} search queries targeting {len(plan.entities)} potential entities.",
                {"plan": plan.model_dump(), "stage": "PLANNING"},
            )

        return plan
