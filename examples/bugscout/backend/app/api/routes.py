import json
import uuid
import asyncio
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import Dict

from ..models.schemas import AuditRequest, QAReport, AgentEvent
from ..services.browser_agent import browser_agent
from ..config import settings

router = APIRouter(prefix="/api")

# In-memory storage for active audit jobs
audit_jobs: Dict[str, AuditRequest] = {}


@router.get("/health")
async def health_check():
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "status": "healthy",
        "solari_configured": bool(settings.solari_api_key and not settings.solari_api_key.startswith("slr_live_your_")),
        "gemini_configured": bool(settings.gemini_api_key and not settings.gemini_api_key.startswith("AIzaSy_your_")),
    }


@router.post("/audit/start")
async def start_audit(request: AuditRequest):
    session_id = f"aud_{uuid.uuid4().hex[:10]}"
    audit_jobs[session_id] = request
    return {
        "session_id": session_id,
        "target_url": request.target_url,
        "status": "initialized",
    }


@router.get("/audit/stream/{session_id}")
async def stream_audit(session_id: str):
    if session_id not in audit_jobs:
        # Provide default audit request if stream initiated directly
        audit_jobs[session_id] = AuditRequest(
            target_url="https://news.ycombinator.com",
            test_scope="Full Smoke Test & Anomaly Discovery",
        )

    request = audit_jobs[session_id]

    async def event_generator():
        try:
            async for event in browser_agent.run_audit(request, session_id):
                payload = f"data: {json.dumps(event.model_dump())}\n\n"
                yield payload
                await asyncio.sleep(0.05)
        except Exception as e:
            err_event = AgentEvent(
                session_id=session_id,
                type="error",
                stage="completed",
                message=f"Audit execution interrupted: {str(e)}",
            )
            yield f"data: {json.dumps(err_event.model_dump())}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/audit/report/{session_id}")
async def get_report(session_id: str):
    if session_id in browser_agent.active_reports:
        return browser_agent.active_reports[session_id]
    raise HTTPException(status_code=404, detail="Audit report not found or still processing")
