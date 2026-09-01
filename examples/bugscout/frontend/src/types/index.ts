export type BugSeverity = 'critical' | 'high' | 'medium' | 'low' | 'visual';

export type BugCategory =
  | 'security_misconfiguration'
  | 'broken_access_control'
  | 'cryptographic_failure'
  | 'insecure_auth_cookie'
  | 'console_error'
  | 'network_error'
  | 'broken_asset'
  | 'dom_anomaly'
  | 'accessibility';

export interface DiscoveredBug {
  id: string;
  title: string;
  severity: BugSeverity;
  category: BugCategory;
  url: string;
  description: string;
  cwe_id?: string | null;
  cvss_score?: number | null;
  owasp_category?: string | null;
  models_confirmed?: string[];
  confidence_score?: number;
  remediation_patch?: Record<string, string> | null;
  stack_trace?: string | null;
  status_code?: number | null;
  repro_steps: string[];
  playwright_ts_code?: string | null;
  playwright_py_code?: string | null;
  verified_in_sandbox: boolean;
  sandbox_logs?: string | null;
  screenshot_b64?: string | null;
  timestamp: string;
}

export type EventType =
  | 'thought'
  | 'action'
  | 'browser_screenshot'
  | 'bug_detected'
  | 'model_consensus'
  | 'sandbox_exec'
  | 'sandbox_output'
  | 'report_ready'
  | 'error';

export type EventStage =
  | 'initialization'
  | 'browser_crawling'
  | 'anomaly_detection'
  | 'multi_model_consensus'
  | 'test_synthesis'
  | 'sandbox_verification'
  | 'completed';

export interface AgentEvent {
  session_id: string;
  type: EventType;
  stage: EventStage;
  message: string;
  data?: Record<string, unknown> | null;
  timestamp: string;
}

export interface QAReport {
  session_id: string;
  target_url: string;
  test_scope: string;
  quality_score: string;
  security_grade?: string;
  mean_cvss?: number;
  owasp_breakdown?: Record<string, number>;
  models_used?: string[];
  health_percentage: number;
  summary: string;
  total_pages_visited: number;
  total_requests_analyzed: number;
  bugs: DiscoveredBug[];
  session_recording_url?: string | null;
  sandbox_verified_count: number;
  created_at: string;
}

export interface AuditRequest {
  target_url: string;
  test_scope: string;
  stealth_mode: boolean;
  record_session: boolean;
  max_depth: number;
  audit_profile?: 'owasp_top_10' | 'headers_and_cookies' | 'full_security_audit';
  enabled_models?: string[];
  auth_username?: string;
  auth_password?: string;
  profile_id?: string;
  storage_state?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: 'google' | 'anthropic' | 'openai';
  role: string;
  active: boolean;
}
