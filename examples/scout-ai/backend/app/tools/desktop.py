import asyncio
import time
import logging
from typing import Optional, Dict, Any, Callable

from .base import BaseTool, ToolResult
from ..config import settings

logger = logging.getLogger(__name__)

try:
    from solari_desktop import DesktopClient
    HAS_SOLARI_DESKTOP = True
except ImportError:
    HAS_SOLARI_DESKTOP = False
    DesktopClient = None


class DesktopTool(BaseTool):
    name = "SolariDesktopTool"
    description = "Full Linux GUI desktop environment with VNC live-stream, mouse/keyboard computer-use automation powered by Solari"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.solari_api_key
        self.base_url = settings.solari_base_url

    async def is_available(self) -> bool:
        return bool(self.api_key and HAS_SOLARI_DESKTOP)

    async def perform_gui_interaction(
        self,
        app_name: str = "mousepad",
        text_to_type: str = "",
        event_callback: Optional[Callable[[str, Dict[str, Any]], None]] = None,
    ) -> ToolResult:
        """
        Launches a Solari Desktop session, launches a GUI application,
        performs mouse/keyboard actions, takes a screenshot, and terminates the session.
        """
        start_time = time.time()
        if not await self.is_available():
            return ToolResult(
                success=False,
                error="SOLARI_API_KEY is not configured or solari-desktop SDK is missing. Set SOLARI_API_KEY to run desktop sessions.",
                execution_time_ms=int((time.time() - start_time) * 1000),
            )

        session_id = None
        try:
            if event_callback:
                event_callback("desktop.creating", {"template": "default", "resolution": "1280x720"})

            async with DesktopClient(
                api_key=self.api_key,
                base_url=self.base_url,
            ) as client:
                desktop = await client.create(
                    template="default",
                    resolution="1280x720",
                    timeout_ms=5 * 60_000,
                )
                session_id = desktop.sessionId
                stream_url = desktop.streamUrl
                logger.info(f"Created Solari Desktop session {session_id} stream: {stream_url}")

                try:
                    await desktop.connect()

                    if event_callback:
                        event_callback("desktop.connected", {"session_id": session_id, "stream_url": stream_url})

                    # Wait for X11 ready
                    for _ in range(15):
                        health = await desktop.health()
                        if getattr(health, "ready", False):
                            break
                        await asyncio.sleep(1)

                    pid = await desktop.open(app_name)
                    await asyncio.sleep(3)

                    if text_to_type:
                        # Click into editor area
                        await desktop.mouse.click(320, 300, humanize=True)
                        await desktop.keyboard.type(text_to_type)
                        await asyncio.sleep(1)

                    # Capture screenshot
                    shot_bytes = await desktop.screenshot(format="png")
                    execution_time = int((time.time() - start_time) * 1000)

                    return ToolResult(
                        success=True,
                        data={
                            "session_id": session_id,
                            "stream_url": stream_url,
                            "app_pid": pid,
                            "screenshot_size_bytes": len(shot_bytes),
                        },
                        execution_time_ms=execution_time,
                        metadata={"stream_url": stream_url},
                    )
                finally:
                    await desktop.close()
                    await client.destroy(session_id)
                    logger.info(f"Destroyed Solari Desktop session {session_id}")

        except Exception as e:
            logger.error(f"Solari desktop error: {e}", exc_info=True)
            return ToolResult(
                success=False,
                error=f"Desktop interaction failed: {str(e)}",
                execution_time_ms=int((time.time() - start_time) * 1000),
                metadata={"session_id": session_id} if session_id else {},
            )
