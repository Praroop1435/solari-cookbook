from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
import uuid
from datetime import datetime, timezone


class TaskStatus(str, Enum):
    QUEUED = "QUEUED"
    PLANNING = "PLANNING"
    SEARCHING = "SEARCHING"
    BROWSING = "BROWSING"
    EXTRACTING = "EXTRACTING"
    ANALYZING = "ANALYZING"
    RANKING_SANDBOX = "RANKING_SANDBOX"
    VERIFYING = "VERIFYING"
    REPORTING = "REPORTING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class ResearchProfile(BaseModel):
    name: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    experience_years: Optional[float] = None
    location: Optional[str] = None
    target_roles: List[str] = Field(default_factory=list)
    resume_text: Optional[str] = None
    preferences: Dict[str, Any] = Field(default_factory=dict)


class PlanSchema(BaseModel):
    objective: str
    entities: List[str] = Field(default_factory=list, description="Target companies, domains, or subjects to investigate")
    sources: List[str] = Field(default_factory=list, description="Recommended discovery platforms and search targets")
    search_queries: List[str] = Field(default_factory=list, description="Targeted web search queries to execute")
    information_to_collect: List[str] = Field(default_factory=list, description="Data points and attributes to gather")
    ranking_criteria: List[str] = Field(default_factory=list, description="Criteria for scoring and ranking candidates")
    final_output_format: str = Field(default="Executive Report with Opportunity Cards & Comparison Matrix")


class TaskCreateRequest(BaseModel):
    objective: str = Field(..., min_length=5, description="Natural-language research objective")
    profile: Optional[ResearchProfile] = None
    is_demo: bool = Field(default=False, description="Deterministic demo run flag")
    enable_sandbox: bool = Field(default=True, description="Enable Solari sandbox for numerical/ranking analysis")
    enable_recording: bool = Field(default=False, description="Enable Solari browser session recording")
    custom_solari_key: Optional[str] = None
    custom_gemini_key: Optional[str] = None


class ResearchTask(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    objective: str
    profile: Optional[ResearchProfile] = None
    status: TaskStatus = TaskStatus.QUEUED
    plan: Optional[PlanSchema] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    is_demo: bool = False
    enable_sandbox: bool = True
    enable_recording: bool = False
    error: Optional[str] = None
