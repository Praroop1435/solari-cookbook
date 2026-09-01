import logging

from ..config import settings

logger = logging.getLogger(__name__)


class RecordingManager:
    """Manages Solari Session Replay videos for visual bug verification."""

    def get_recording_url(self, session_id: str) -> str | None:
        if settings.solari_api_key and not settings.solari_api_key.startswith("slr_live_your_"):
            return f"https://api.getsolari.com/v1/browser/sessions/{session_id}/recording"
        return f"https://api.getsolari.com/v1/browser/sessions/demo-{session_id}/recording"


recording_manager = RecordingManager()
