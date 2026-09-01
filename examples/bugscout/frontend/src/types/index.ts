export type BugSeverity = 'critical' | 'high' | 'medium' | 'low' | 'visual';
export type BugCategory = 'console_error' | 'network_error' | 'broken_asset' | 'dom_anomaly' | 'accessibility';

export interface DiscoveredBug {
  id: string;
  title: string;
  severity: BugSeverity;
  category: BugCategory;
  url: string;
  description: string;
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
  | 'sandbox_exec'
  | 'sandbox_output'
  | 'report_ready'
  | 'error';

export type EventStage =
  | 'initialization'
  | 'browser_crawling'
  | 'anomaly_detection'
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
  auth_username?: string;
  auth_password?: string;
  profile_id?: string;
  storage_state?: string;
}
