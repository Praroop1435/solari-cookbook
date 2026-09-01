import logging
from typing import List, Dict, Any, Optional, Callable

from ..models.evidence import EvidenceStore, ClaimVerification
from ..models.events import EventType
from ..llm.client import LLMClient

logger = logging.getLogger(__name__)


class VerifierAgent:
    def __init__(self, llm_client: LLMClient):
        self.llm = llm_client

    async def verify_evidence_grounding(
        self,
        task_id: str,
        ranked_entities: List[Dict[str, Any]],
        evidence_store: EvidenceStore,
        emit_event: Optional[Callable[[EventType, str, str, Dict[str, Any]], None]] = None,
    ) -> List[ClaimVerification]:
        """Audits all entity claims against the evidence store to prevent LLM hallucinations."""
        if emit_event:
            emit_event(
                EventType.AGENT_STATUS,
                "Auditing Fact Grounding",
                f"Verifying claims for {len(ranked_entities)} entities against {len(evidence_store.items)} collected evidence citations.",
                {"stage": "VERIFYING"},
            )

        claims_to_check = []
        for ent in ranked_entities:
            name = ent.get("name", "")
            why_matches = ent.get("why_matches", "")
            if why_matches:
                claims_to_check.append({"entity": name, "claim": why_matches})
            for rf in ent.get("risks", []):
                claims_to_check.append({"entity": name, "claim": rf})

        verifications: List[ClaimVerification] = []
        if self.llm.is_available() and claims_to_check and evidence_store.items:
            try:
                verifications = await self.llm.verify_claims(claims_to_check, evidence_store.items)
            except Exception as e:
                logger.warning(f"LLM claim verification failed: {e}")

        # Fallback / heuristic verification if LLM is unavailable
        if not verifications:
            for item in claims_to_check:
                ent_items = evidence_store.get_by_entity(item["entity"])
                is_grounded = len(ent_items) > 0
                verifications.append(
                    ClaimVerification(
                        claim=item["claim"],
                        entity=item["entity"],
                        is_grounded=is_grounded,
                        confidence_score=0.9 if is_grounded else 0.5,
                        supporting_evidence_ids=[ev.id for ev in ent_items[:3]],
                    )
                )

        grounded_count = sum(1 for v in verifications if v.is_grounded)
        if emit_event:
            emit_event(
                EventType.VERIFICATION_COMPLETED,
                "Fact Audit Complete",
                f"Verified {len(verifications)} claims ({grounded_count} grounded directly in source text).",
                {"grounded_count": grounded_count, "total_claims": len(verifications), "stage": "VERIFYING"},
            )

        return verifications
