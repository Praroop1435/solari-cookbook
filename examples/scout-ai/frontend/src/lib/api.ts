import {
  ResearchTask,
  TaskCreateRequest,
  ResearchReport,
  SystemStatus,
} from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchSystemStatus(): Promise<SystemStatus> {
  const res = await fetch(`${API_BASE}/api/status`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch system status");
  return res.json();
}

export async function createResearchTask(req: TaskCreateRequest): Promise<ResearchTask> {
  const res = await fetch(`${API_BASE}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to create task" }));
    throw new Error(err.detail || "Failed to create research task");
  }
  return res.json();
}

export async function fetchTask(taskId: string): Promise<ResearchTask> {
  const res = await fetch(`${API_BASE}/api/tasks/${taskId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Task not found");
  return res.json();
}

export async function fetchTaskReport(taskId: string): Promise<ResearchReport> {
  const res = await fetch(`${API_BASE}/api/tasks/${taskId}/report`, { cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Report not ready" }));
    throw new Error(err.detail || "Report not available");
  }
  return res.json();
}

export async function fetchTaskHistory(): Promise<ResearchTask[]> {
  const res = await fetch(`${API_BASE}/api/tasks`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function updateRuntimeKeys(solariKey?: string, geminiKey?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/config/keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      solari_api_key: solariKey || null,
      gemini_api_key: geminiKey || null,
    }),
  });
  if (!res.ok) throw new Error("Failed to update runtime keys");
  return res.json();
}

export function getTaskEventsUrl(taskId: string): string {
  return `${API_BASE}/api/tasks/${taskId}/events`;
}
