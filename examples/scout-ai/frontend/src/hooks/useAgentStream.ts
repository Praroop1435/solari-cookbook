import { useState, useEffect, useRef } from "react";
import { AgentEvent, TaskStatus, ResearchReport, EvidenceItem, Source } from "../types";
import { getTaskEventsUrl, fetchTaskReport, fetchTask } from "../lib/api";

interface UseAgentStreamResult {
  events: AgentEvent[];
  currentStage: string;
  status: TaskStatus;
  evidenceItems: EvidenceItem[];
  sources: Source[];
  report: ResearchReport | null;
  error: string | null;
  isConnected: boolean;
  sandboxOutputs: string[];
}

export function useAgentStream(taskId: string | null): UseAgentStreamResult {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [currentStage, setCurrentStage] = useState<string>("QUEUED");
  const [status, setStatus] = useState<TaskStatus>("QUEUED");
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [sandboxOutputs, setSandboxOutputs] = useState<string[]>([]);

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!taskId) {
      setEvents([]);
      setEvidenceItems([]);
      setSources([]);
      setReport(null);
      setError(null);
      setIsConnected(false);
      return;
    }

    // Reset state for new task
    setEvents([]);
    setEvidenceItems([]);
    setSources([]);
    setReport(null);
    setError(null);
    setSandboxOutputs([]);

    const url = getTaskEventsUrl(taskId);
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
    };

    es.onmessage = async (e) => {
      try {
        const event: AgentEvent = JSON.parse(e.data);
        setEvents((prev) => [...prev, event]);

        if (event.stage) {
          setCurrentStage(event.stage);
          if (event.stage in {
            PLANNING: 1, SEARCHING: 1, BROWSING: 1, EXTRACTING: 1,
            ANALYZING: 1, RANKING_SANDBOX: 1, VERIFYING: 1, REPORTING: 1,
            COMPLETED: 1, FAILED: 1
          }) {
            setStatus(event.stage as TaskStatus);
          }
        }

        // Handle specific event payloads
        if (event.event_type === "evidence.extracted" && event.data?.evidence) {
          setEvidenceItems((prev) => {
            const exists = prev.some((item) => item.id === event.data.evidence.id);
            return exists ? prev : [event.data.evidence, ...prev];
          });
        }

        if (event.event_type === "source.found" && event.data?.source) {
          setSources((prev) => {
            const exists = prev.some((s) => s.url === event.data.source.url);
            return exists ? prev : [...prev, event.data.source];
          });
        }

        if (event.event_type === "sandbox.execution" && event.data?.stdout) {
          setSandboxOutputs((prev) => [...prev, event.data.stdout]);
        }

        if (event.event_type === "report.finalized" || event.stage === "COMPLETED") {
          setStatus("COMPLETED");
          try {
            const finalizedReport = await fetchTaskReport(taskId);
            setReport(finalizedReport);
          } catch {
            if (event.data?.report) {
              setReport(event.data.report);
            }
          }
          es.close();
        }

        if (event.event_type === "error.occurred" || event.stage === "FAILED") {
          setStatus("FAILED");
          setError(event.detail || "Task execution failed");
          es.close();
        }
      } catch (err) {
        console.error("Error parsing SSE event:", err);
      }
    };

    es.onerror = async () => {
      setIsConnected(false);
      // Attempt to poll task status once if SSE drops
      try {
        const task = await fetchTask(taskId);
        setStatus(task.status);
        if (task.status === "COMPLETED") {
          const r = await fetchTaskReport(taskId);
          setReport(r);
        }
      } catch {
        // ignore
      }
      es.close();
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [taskId]);

  return {
    events,
    currentStage,
    status,
    evidenceItems,
    sources,
    report,
    error,
    isConnected,
    sandboxOutputs,
  };
}
