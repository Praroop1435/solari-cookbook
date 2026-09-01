import pytest
import asyncio
from app.models.task import TaskCreateRequest, TaskStatus
from app.agent.orchestrator import AgentOrchestrator
from app.models.events import EventType


@pytest.mark.asyncio
async def test_orchestrator_state_transitions_and_demo():
    """Verify that orchestrator progresses through states to COMPLETED and records report."""
    orchestrator = AgentOrchestrator()

    req = TaskCreateRequest(
        objective="Find 5 early stage AI startups hiring backend engineers in the US.",
        is_demo=True,
        enable_sandbox=True,
    )

    task = orchestrator.create_task(req)
    assert task.status == TaskStatus.QUEUED

    # Subscribe to SSE events
    collected_events = []
    async def listen_events():
        async for evt in orchestrator.subscribe_events(task.id):
            collected_events.append(evt)

    listener_task = asyncio.create_task(listen_events())

    # Execute demo pipeline
    report = await orchestrator.execute_task(task.id)

    # Wait for listener
    await asyncio.sleep(0.5)
    listener_task.cancel()
    try:
        await listener_task
    except asyncio.CancelledError:
        pass

    assert task.status == TaskStatus.COMPLETED
    assert task.completed_at is not None
    assert report is not None
    assert len(report.top_results) > 0
    assert len(report.evidence_vault) > 0
    assert len(collected_events) >= 6

    # Verify event types were emitted
    event_types = [e.event_type for e in collected_events]
    assert EventType.PLAN_CREATED in event_types
    assert EventType.REPORT_FINALIZED in event_types
