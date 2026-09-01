import pytest
import json
from app.models.evidence import EvidenceItem, EvidenceStore
from app.agent.ranker import RankerAgent
from app.tools.sandbox import SandboxTool
from app.llm.client import LLMClient


@pytest.mark.asyncio
async def test_ranker_ranking_computation():
    """Verify RankerAgent correctly formats entities and parses ranking/matrix outputs."""
    llm = LLMClient(api_key=None)
    sandbox = SandboxTool(api_key=None)
    ranker = RankerAgent(sandbox, llm)

    store = EvidenceStore()
    store.add(EvidenceItem(
        id="ev_1",
        source_url="https://news.ycombinator.com",
        source_title="HN",
        entity="Solari",
        claim="Solari offers cloud browser APIs",
        evidence_snippet="Cloud browsers for AI agents",
    ))
    store.add(EvidenceItem(
        id="ev_2",
        source_url="https://news.ycombinator.com",
        source_title="HN",
        entity="Modal",
        claim="Modal provides serverless compute",
        evidence_snippet="Serverless Python compute",
    ))

    result = await ranker.rank_and_analyze(
        task_id="test_task",
        objective="Rank cloud infrastructure providers",
        evidence_store=store,
        ranking_criteria=["Speed", "Developer Experience"],
        enable_sandbox=False,  # Test deterministic fallback parser
    )

    assert "ranked_entities" in result
    assert "comparison_matrix" in result
    assert len(result["ranked_entities"]) == 2
    assert result["comparison_matrix"].columns is not None
    assert len(result["comparison_matrix"].rows) == 2
    assert result["ranked_entities"][0]["score"] > 0
