from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
from abc import ABC, abstractmethod
from datetime import datetime, timezone


class ToolResult(BaseModel):
    success: bool
    data: Any = None
    error: Optional[str] = None
    execution_time_ms: int = 0
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BaseTool(ABC):
    name: str
    description: str

    @abstractmethod
    async def is_available(self) -> bool:
        """Check if environment/API keys for this tool are available."""
        pass
