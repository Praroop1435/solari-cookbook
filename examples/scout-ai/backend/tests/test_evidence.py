import pytest
from app.models.evidence import EvidenceItem, EvidenceStore, ClaimVerification


def test_evidence_store_indexing():
    """Verify that EvidenceStore correctly adds, filters, and retrieves items by entity and ID."""
    store = EvidenceStore()

    item1 = EvidenceItem(
        id="ev_001",
        source_url="https://example.com/careers",
        source_title="Company A Careers",
        entity="Company A",
        claim="Company A pays $180k-$220k for senior backend roles.",
        evidence_snippet="Base salary: $180k - $220k depending on experience.",
        confidence=0.95,
        category="compensation",
    )

    item2 = EvidenceItem(
        id="ev_002",
        source_url="https://example.com/blog",
        source_title="Company A Tech Blog",
        entity="Company A",
        claim="Company A uses Python and Rust for high-throughput browser execution.",
        evidence_snippet="Our execution engine is written in Rust and wrapped in a Python SDK.",
        confidence=0.92,
        category="tech_stack",
    )

    item3 = EvidenceItem(
        id="ev_003",
        source_url="https://example.org/jobs",
        source_title="Company B Careers",
        entity="Company B",
        claim="Company B is hiring in NYC.",
        evidence_snippet="Located in Flatiron, New York.",
        confidence=0.90,
    )

    store.add(item1)
    store.add(item2)
    store.add(item3)

    assert len(store.items) == 3
    assert len(store.get_by_entity("Company A")) == 2
    assert len(store.get_by_entity("company b")) == 1
    assert store.get_by_id("ev_001") == item1
    assert store.get_by_id("ev_999") is None

    sources = store.all_sources()
    assert len(sources) == 3  # 3 unique URLs


def test_claim_verification_model():
    """Verify ClaimVerification model validation."""
    v = ClaimVerification(
        claim="Solari offers cloud browsers",
        entity="Solari",
        is_grounded=True,
        confidence_score=0.99,
        supporting_evidence_ids=["ev_001"],
    )
    assert v.is_grounded is True
    assert len(v.supporting_evidence_ids) == 1
