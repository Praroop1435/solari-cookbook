from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from .evidence import EvidenceItem


class OpportunityResult(BaseModel):
    id: str
    name: str
    score: float = Field(default=0.0, ge=0.0, le=100.0)
    recommendation: str = "Strong Match"  # Strong Match, High Potential, Moderate Match, Consider with Caution
    match_reason: str
    key_facts: List[str] = Field(default_factory=list)
    risks_and_concerns: List[str] = Field(default_factory=list)
    outreach_strategy: Optional[str] = None
    attributes: Dict[str, Any] = Field(default_factory=dict)  # e.g., role_title, salary, location, tech_stack, funding
    evidence_ids: List[str] = Field(default_factory=list)
    source_urls: List[str] = Field(default_factory=list)


class ComparisonMatrix(BaseModel):
    columns: List[str] = Field(default_factory=list)
    rows: List[Dict[str, Any]] = Field(default_factory=list)
    summary: str = ""


class AgentTraceStep(BaseModel):
    step_number: int
    stage: str
    action: str
    tool_used: Optional[str] = None
    details: str
    duration_ms: int = 0
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ResearchReport(BaseModel):
    task_id: str
    objective: str
    executive_summary: str
    methodology: str
    top_results: List[OpportunityResult] = Field(default_factory=list)
    comparison_matrix: Optional[ComparisonMatrix] = None
    evidence_vault: List[EvidenceItem] = Field(default_factory=list)
    agent_trace: List[AgentTraceStep] = Field(default_factory=list)
    sandbox_computations: List[Dict[str, Any]] = Field(default_factory=list)
    stats: Dict[str, Any] = Field(default_factory=dict)
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
