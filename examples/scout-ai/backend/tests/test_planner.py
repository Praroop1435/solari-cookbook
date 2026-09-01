import pytest
from app.models.task import ResearchProfile, PlanSchema
from app.llm.client import LLMClient
from app.agent.planner import PlannerAgent


@pytest.mark.asyncio
async def test_planner_fallback_structure():
    """Verify planner generates a valid PlanSchema with search queries and ranking criteria."""
    llm = LLMClient(api_key=None)  # fallback mode
    planner = PlannerAgent(llm)

    profile = ResearchProfile(
        name="Alex Rivers",
        skills=["Python", "FastAPI", "Playwright", "Distributed Systems"],
        experience_years=4.5,
        location="San Francisco / Remote",
        target_roles=["Senior AI Infrastructure Engineer"],
    )

    events_emitted = []
    def record_event(evt_type, title, detail, data):
        events_emitted.append((evt_type, title))

    plan = await planner.plan(
        task_id="test_t1",
        objective="Find 5 fast-growing AI startups hiring backend engineers in the US.",
        profile=profile,
        emit_event=record_event,
    )

    assert isinstance(plan, PlanSchema)
    assert len(plan.search_queries) > 0
    assert len(plan.entities) > 0
    assert len(plan.ranking_criteria) > 0
    assert len(events_emitted) >= 2
