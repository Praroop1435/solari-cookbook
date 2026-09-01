import asyncio
import json
import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from ..models.task import TaskCreateRequest, ResearchTask, TaskStatus
from ..models.result import ResearchReport
from ..agent.orchestrator import AgentOrchestrator
from ..config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")
orchestrator = AgentOrchestrator()


class KeyConfigRequest(BaseModel):
    solari_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None


@router.get("/status")
async def get_system_status() -> Dict[str, Any]:
    """Returns infrastructure health and API key readiness without exposing secret values."""
    has_solari = bool(settings.solari_api_key)
    has_gemini = bool(settings.gemini_api_key)
    
    return {
        "app_name": settings.app_name,
        "app_version": settings.app_version,
        "solari_configured": has_solari,
        "gemini_configured": has_gemini,
        "default_llm_model": settings.gemini_model,
        "solari_stealth": settings.solari_browser_stealth,
        "solari_proxy": settings.solari_browser_proxy,
        "has_browser_sdk": True,
        "has_sandbox_sdk": True,
        "has_desktop_sdk": True,
    }


@router.post("/config/keys")
async def update_runtime_keys(req: KeyConfigRequest) -> Dict[str, Any]:
    """Updates runtime credentials for the session."""
    if req.solari_api_key is not None:
        settings.solari_api_key = req.solari_api_key.strip()
    if req.gemini_api_key is not None:
        settings.gemini_api_key = req.gemini_api_key.strip()
    
    return {
        "solari_configured": bool(settings.solari_api_key),
        "gemini_configured": bool(settings.gemini_api_key),
        "message": "Runtime configuration updated successfully.",
    }


@router.post("/tasks", response_model=ResearchTask)
async def create_and_start_task(
    req: TaskCreateRequest,
    background_tasks: BackgroundTasks,
) -> ResearchTask:
    """Creates a new research task and initiates background autonomous execution."""
    task = orchestrator.create_task(req)

    # Launch agent orchestrator in background
    background_tasks.add_task(
        orchestrator.execute_task,
        task_id=task.id,
        custom_solari_key=req.custom_solari_key,
        custom_gemini_key=req.custom_gemini_key,
    )

    return task


@router.get("/tasks/{task_id}", response_model=ResearchTask)
async def get_task(task_id: str) -> ResearchTask:
    """Retrieves current task state, plan, and progress."""
    task = orchestrator.tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("/tasks/{task_id}/events")
async def stream_task_events(task_id: str):
    """
    Server-Sent Events (SSE) endpoint providing real-time telemetry of agent actions,
    browser navigation, DOM extraction, and sandbox calculations.
    """
    if task_id not in orchestrator.tasks:
        raise HTTPException(status_code=404, detail="Task not found")

    async def event_generator():
        try:
            async for event in orchestrator.subscribe_events(task_id):
                payload = json.dumps(event.model_dump(), default=str)
                yield f"data: {payload}\n\n"
        except asyncio.CancelledError:
            pass

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/tasks/{task_id}/report", response_model=ResearchReport)
async def get_task_report(task_id: str) -> ResearchReport:
    """Retrieves the finalized ResearchReport with opportunity cards, comparison matrix, and citations."""
    report = orchestrator.reports.get(task_id)
    if not report:
        task = orchestrator.tasks.get(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        if task.status != TaskStatus.COMPLETED:
            raise HTTPException(status_code=400, detail=f"Task is in state '{task.status}', report not ready")
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.get("/tasks", response_model=List[ResearchTask])
async def list_tasks() -> List[ResearchTask]:
    """Lists past research runs in reverse chronological order."""
    tasks = list(orchestrator.tasks.values())
    tasks.sort(key=lambda t: t.created_at, reverse=True)
    return tasks
