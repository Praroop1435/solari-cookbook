export type TaskStatus =
  | "QUEUED"
  | "PLANNING"
  | "SEARCHING"
  | "BROWSING"
  | "EXTRACTING"
  | "ANALYZING"
  | "RANKING_SANDBOX"
  | "VERIFYING"
  | "REPORTING"
  | "COMPLETED"
  | "FAILED";

export interface ResearchProfile {
  name?: string;
  skills: string[];
  experience_years?: number;
  location?: string;
  target_roles: string[];
  resume_text?: string;
  preferences?: Record<string, any>;
}

export interface PlanSchema {
  objective: string;
  entities: string[];
  sources: string[];
  search_queries: string[];
  information_to_collect: string[];
  ranking_criteria: string[];
  final_output_format: string;
}

export interface TaskCreateRequest {
  objective: string;
  profile?: ResearchProfile;
  is_demo?: boolean;
  enable_sandbox?: boolean;
  enable_recording?: boolean;
  custom_solari_key?: string;
  custom_gemini_key?: string;
}

export interface ResearchTask {
  id: string;
  objective: string;
  profile?: ResearchProfile;
  status: TaskStatus;
  plan?: PlanSchema;
  created_at: string;
  completed_at?: string;
  is_demo: boolean;
  enable_sandbox: boolean;
  enable_recording: boolean;
  error?: string;
}

export interface Source {
  id: string;
  url: string;
  title: string;
  snippet: string;
  domain: string;
  source_type: string;
  relevance_score?: number;
}

export interface EvidenceItem {
  id: string;
  source_url: string;
  source_title: string;
  entity: string;
  claim: string;
  evidence_snippet: string;
  confidence: number;
  category: string;
  timestamp: string;
}

export interface OpportunityResult {
  id: string;
  name: string;
  score: number;
  recommendation: string;
  match_reason: string;
  key_facts: string[];
  risks_and_concerns: string[];
  outreach_strategy?: string;
  attributes: Record<string, any>;
  evidence_ids: string[];
  source_urls: string[];
}

export interface ComparisonMatrix {
  columns: string[];
  rows: Record<string, any>[];
  summary: string;
}

export interface AgentTraceStep {
  step_number: number;
  stage: string;
  action: string;
  tool_used?: string;
  details: string;
  duration_ms: number;
  timestamp: string;
}

export interface ResearchReport {
  task_id: string;
  objective: string;
  executive_summary: string;
  methodology: string;
  top_results: OpportunityResult[];
  comparison_matrix?: ComparisonMatrix;
  evidence_vault: EvidenceItem[];
  agent_trace: AgentTraceStep[];
  sandbox_computations: Record<string, any>[];
  stats: Record<string, any>;
  generated_at: string;
}

export type EventType =
  | "agent.status"
  | "plan.created"
  | "browser.session_started"
  | "browser.search"
  | "browser.navigation"
  | "browser.extraction"
  | "browser.session_closed"
  | "source.found"
  | "evidence.extracted"
  | "sandbox.started"
  | "sandbox.execution"
  | "sandbox.closed"
  | "desktop.action"
  | "agent.reasoning"
  | "verification.completed"
  | "report.finalized"
  | "error.occurred";

export interface AgentEvent {
  id: string;
  task_id: string;
  timestamp: string;
  event_type: EventType;
  stage: string;
  title: string;
  detail: string;
  data: Record<string, any>;
}

export interface SystemStatus {
  app_name: string;
  app_version: string;
  solari_configured: boolean;
  gemini_configured: boolean;
  default_llm_model: string;
  solari_stealth: boolean;
  solari_proxy: string;
  has_browser_sdk: boolean;
  has_sandbox_sdk: boolean;
  has_desktop_sdk: boolean;
}
