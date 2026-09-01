from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid


class Source(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    url: str
    title: str = ""
    snippet: str = ""
    domain: str = ""
    source_type: str = "web_page"  # search_result, career_page, press_release, company_site, docs
    relevance_score: float = 1.0
    discovered_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: Dict[str, Any] = Field(default_factory=dict)


class PageExtraction(BaseModel):
    url: str
    title: str
    markdown_content: str
    raw_text: str
    links: List[Dict[str, str]] = Field(default_factory=list)
    screenshot_url: Optional[str] = None
    extracted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    byte_size: int = 0
    http_status: int = 200
    error: Optional[str] = None
