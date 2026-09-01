import json
import uuid
import asyncio
import logging
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse, HTMLResponse
from typing import Dict

from ..models.schemas import AuditRequest, QAReport, AgentEvent
from ..services.browser_agent import browser_agent
from ..config import settings

logger = logging.getLogger(__name__)
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
            logger.error(f"Audit stream exception: {e}")
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


@router.get("/audit/recording/{session_id}")
async def get_session_recording(session_id: str):
    """Authenticated proxy for Solari Browser session replay."""
    if not settings.solari_api_key or settings.solari_api_key.startswith("slr_live_your_"):
        raise HTTPException(status_code=400, detail="Solari API Key not configured")

    try:
        from solari_browser import Solari
        solari = Solari(api_key=settings.solari_api_key)
        
        # Download replay from Solari Cloud API with credentials
        blob = await solari.sessions.download_replay(session_id)
        
        # Return as NDJSON download
        return Response(
            content=blob,
            media_type="application/x-ndjson",
            headers={
                "Content-Disposition": f"attachment; filename=solari_replay_{session_id}.ndjson",
                "Cache-Control": "public, max-age=3600",
            },
        )
    except Exception as e:
        logger.info(f"Replay retrieval note for {session_id}: {e}")
        # Return helpful status page if replay is still encoding in Solari Cloud
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Solari Session Recording: {session_id}</title>
            <style>
                body {{ background: #000; color: #fff; font-family: monospace; padding: 40px; text-align: center; }}
                .card {{ max-width: 600px; margin: 40px auto; background: #0a0a0a; border: 1px solid #222; border-radius: 12px; padding: 30px; }}
                h1 {{ font-size: 18px; color: #10b981; }}
                p {{ font-size: 13px; color: #888; line-height: 1.6; }}
                .btn {{ display: inline-block; margin-top: 20px; padding: 10px 20px; background: #fff; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="card">
                <h1>⚡ Solari Cloud Session Recording</h1>
                <p><strong>Session ID:</strong> {session_id}</p>
                <p>Solari recordings are captured as rrweb DOM-level NDJSON streams. The recording has been processed on Solari Cloud.</p>
                <p>To view your recordings in the Solari Web Console:</p>
                <a href="https://console.getsolari.com" target="_blank" class="btn">Open Solari Console</a>
            </div>
        </body>
        </html>
        """
        return HTMLResponse(content=html_content, status_code=200)
