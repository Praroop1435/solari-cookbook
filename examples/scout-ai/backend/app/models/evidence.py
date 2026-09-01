from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid


class EvidenceItem(BaseModel):
    id: str = Field(default_factory=lambda: f"ev_{uuid.uuid4().hex[:8]}")
    source_url: str
    source_title: str
    entity: str
    claim: str
    evidence_snippet: str
    confidence: float = Field(default=0.9, ge=0.0, le=1.0)
    category: str = "general"  # role_details, compensation, funding, tech_stack, growth, pricing
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ClaimVerification(BaseModel):
    claim: str
    entity: str
    is_grounded: bool
    confidence_score: float = 1.0
    supporting_evidence_ids: List[str] = Field(default_factory=list)
    contradiction_notes: Optional[str] = None


class EvidenceStore(BaseModel):
    items: List[EvidenceItem] = Field(default_factory=list)

    def add(self, item: EvidenceItem) -> None:
        self.items.append(item)

    def get_by_entity(self, entity: str) -> List[EvidenceItem]:
        entity_lower = entity.lower()
        return [i for i in self.items if entity_lower in i.entity.lower()]

    def get_by_url(self, url: str) -> List[EvidenceItem]:
        return [i for i in self.items if i.source_url == url]

    def get_by_id(self, item_id: str) -> Optional[EvidenceItem]:
        for item in self.items:
            if item.id == item_id:
                return item
        return None

    def all_sources(self) -> List[Dict[str, str]]:
        seen = {}
        for item in self.items:
            if item.source_url not in seen:
                seen[item.source_url] = item.source_title
        return [{"url": url, "title": title} for url, title in seen.items()]
