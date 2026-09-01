"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { TaskInput } from "../components/TaskInput";
import { KeyConfigModal } from "../components/KeyConfigModal";
import { ProfileDrawer } from "../components/ProfileDrawer";
import { HistoryDrawer } from "../components/HistoryDrawer";
import { LiveTrace } from "../components/LiveTrace";
import { ActiveExecution } from "../components/ActiveExecution";
import { EvidenceStream } from "../components/EvidenceStream";
import { ReportView } from "../components/ReportView";
import { useAgentStream } from "../hooks/useAgentStream";
import { fetchSystemStatus, createResearchTask, fetchTaskReport } from "../lib/api";
import { ResearchProfile, SystemStatus } from "../types";
import { AlertCircle, RefreshCw, Sparkles } from "lucide-react";

export default function Home() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [activeObjective, setActiveObjective] = useState<string>("");
  const [profile, setProfile] = useState<ResearchProfile>({
    name: "Alex Rivers",
    skills: ["Python", "Distributed Systems", "FastAPI", "Playwright", "MicroVMs"],
    experience_years: 4.5,
    location: "San Francisco, CA / Remote",
    target_roles: ["Senior AI Infrastructure Engineer", "Backend Systems Engineer", "Agent Runtime Engineer"],
    resume_text: "Systems engineer specializing in high-throughput cloud automation, Python/Rust runtimes, and agent workflows.",
    preferences: { min_base_salary: "$180k", preferred_stage: ["Seed", "Series A"], remote_friendly: true },
  });

  const [isKeysOpen, setIsKeysOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const {
    events,
    currentStage,
    status,
    evidenceItems,
    report,
    error,
    sandboxOutputs,
  } = useAgentStream(currentTaskId);

  // Load system status on mount
  useEffect(() => {
    fetchSystemStatus()
      .then((s) => setSystemStatus(s))
      .catch((err) => console.error("Error fetching system status:", err));
  }, []);

  const handleStartResearch = async (
    objective: string,
    isDemo: boolean,
    enableSandbox: boolean
  ) => {
    setIsStarting(true);
    setActiveObjective(objective);
    try {
      const task = await createResearchTask({
        objective,
        profile,
        is_demo: isDemo,
        enable_sandbox: enableSandbox,
        enable_recording: false,
      });
      setCurrentTaskId(task.id);
    } catch (err: any) {
      alert(`Failed to start research task: ${err.message}`);
    } finally {
      setIsStarting(false);
    }
  };

  const handleSelectHistoryTask = async (taskId: string) => {
    setCurrentTaskId(taskId);
  };

  const handleNewResearch = () => {
    setCurrentTaskId(null);
    setActiveObjective("");
  };

  const isExecuting =
    Boolean(currentTaskId) && status !== "COMPLETED" && status !== "FAILED";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <Header
        systemStatus={systemStatus}
        onOpenKeys={() => setIsKeysOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewResearch={handleNewResearch}
        isExecuting={isExecuting}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW 1: Landing / Task Form */}
        {!currentTaskId && !report && (
          <TaskInput
            onSubmit={handleStartResearch}
            onOpenProfile={() => setIsProfileOpen(true)}
            profile={profile}
            systemStatus={systemStatus}
            isExecuting={isStarting}
          />
        )}

        {/* VIEW 2: Live Agent Run (Tri-Pane Layout) */}
        {currentTaskId && !report && status !== "FAILED" && (
          <div className="mx-auto max-w-[1700px] p-4 sm:p-6 h-[calc(100vh-70px)]">
            <div className="grid h-full grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Pane: Real-Time Event Stream (3 cols) */}
              <div className="lg:col-span-3 h-full overflow-hidden">
                <LiveTrace events={events} currentStage={currentStage} />
              </div>

              {/* Center Pane: Active Stage & Sandbox Terminal (5 cols) */}
              <div className="lg:col-span-5 h-full overflow-hidden">
                <ActiveExecution
                  objective={activeObjective}
                  status={status}
                  currentStage={currentStage}
                  events={events}
                  sandboxOutputs={sandboxOutputs}
                />
              </div>

              {/* Right Pane: Live Grounded Evidence Vault (4 cols) */}
              <div className="lg:col-span-4 h-full overflow-hidden">
                <EvidenceStream evidenceItems={evidenceItems} />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Final Report */}
        {report && (
          <ReportView report={report} onNewResearch={handleNewResearch} />
        )}

        {/* Error State */}
        {status === "FAILED" && (
          <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Research Run Interrupted</h2>
            <p className="text-sm text-slate-400">
              {error || "An unexpected error occurred during pipeline execution."}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={handleNewResearch}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Start New Task
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      <KeyConfigModal
        isOpen={isKeysOpen}
        onClose={() => setIsKeysOpen(false)}
        onSuccess={() => {
          fetchSystemStatus().then((s) => setSystemStatus(s));
        }}
        initialSolariConfigured={systemStatus?.solari_configured}
        initialGeminiConfigured={systemStatus?.gemini_configured}
      />

      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={(p) => setProfile(p)}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectTask={handleSelectHistoryTask}
      />
    </div>
  );
}
