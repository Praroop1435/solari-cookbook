import logging
from typing import List, Optional, Callable, Dict, Any

from ..models.source import PageExtraction
from ..models.evidence import EvidenceItem, EvidenceStore
from ..models.events import EventType
from ..llm.client import LLMClient

logger = logging.getLogger(__name__)


class ExtractorAgent:
    def __init__(self, llm_client: LLMClient):
        self.llm = llm_client

    async def extract_evidence(
        self,
        task_id: str,
        extractions: List[PageExtraction],
        objective: str,
        entities: List[str],
        emit_event: Optional[Callable[[EventType, str, str, Dict[str, Any]], None]] = None,
    ) -> EvidenceStore:
        """Transforms raw page extractions into structured, grounded evidence items."""
        store = EvidenceStore()

        if emit_event:
            emit_event(
                EventType.AGENT_STATUS,
                "Extracting Grounded Evidence",
                f"Analyzing {len(extractions)} captured webpages for verifiable claims and quotes.",
                {"stage": "EXTRACTING"},
            )

        for page in extractions:
            if not page.raw_text or len(page.raw_text.strip()) < 50:
                continue

            try:
                if self.llm.is_available():
                    items = await self.llm.extract_evidence_from_page(
                        url=page.url,
                        title=page.title,
                        page_content=page.raw_text,
                        objective=objective,
                        entities=entities,
                    )
                else:
                    # Fallback extraction from raw page title & snippet
                    items = [
                        EvidenceItem(
                            source_url=page.url,
                            source_title=page.title,
                            entity=page.title.split("-")[0].strip() if "-" in page.title else page.title[:30],
                            claim=f"Information gathered from {page.title}: {page.raw_text[:150].strip()}",
                            evidence_snippet=page.raw_text[:200].strip(),
                            confidence=0.85,
                            category="general",
                        )
                    ]

                for item in items:
                    store.add(item)
                    if emit_event:
                        emit_event(
                            EventType.EVIDENCE_EXTRACTED,
                            f"Evidence Extracted: {item.entity}",
                            f"Claim: '{item.claim[:80]}...' (Source: {item.source_title})",
                            {"evidence": item.model_dump(), "stage": "EXTRACTING"},
                        )
            except Exception as e:
                logger.warning(f"Error extracting evidence from {page.url}: {e}")

        return store
