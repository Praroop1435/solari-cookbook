"use client";

import React from "react";
import {
  Sparkles,
  Search,
  Globe,
  FileText,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Shield,
  Loader2,
} from "lucide-react";
import { TaskStatus, AgentEvent } from "../types";

interface ActiveExecutionProps {
  objective: string;
  status: TaskStatus;
  currentStage: string;
  events: AgentEvent[];
  sandboxOutputs: string[];
}

const STAGES = [
  { key: "PLANNING", label: "Plan", icon: Sparkles },
  { key: "SEARCHING", label: "Search", icon: Search },
  { key: "BROWSING", label: "Browse", icon: Globe },
  { key: "EXTRACTING", label: "Extract", icon: FileText },
  { key: "RANKING_SANDBOX", label: "Sandbox", icon: Cpu },
  { key: "VERIFYING", label: "Verify", icon: ShieldCheck },
  { key: "REPORTING", label: "Report", icon: CheckCircle2 },
];

export const ActiveExecution: React.FC<ActiveExecutionProps> = ({
  objective,
  status,
  currentStage,
  events,
  sandboxOutputs,
}) => {
  const currentStageIndex = STAGES.findIndex((s) => s.key === currentStage);
  const latestEvent = events.length > 0 ? events[events.length - 1] : null;

  // Filter latest browser and sandbox events
  const latestBrowserEvent = events
    .slice()
    .reverse()
    .find((e) => e.event_type.startsWith("browser."));
  const latestSandboxEvent = events
    .slice()
    .reverse()
    .find((e) => e.event_type.startsWith("sandbox."));

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pr-1">
      {/* Objective Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
          <span>Active Research Objective</span>
        </div>
        <p className="text-sm font-medium text-slate-100 leading-relaxed">
          {objective}
        </p>
      </div>

      {/* Stepper Pipeline */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
          {STAGES.map((st, idx) => {
            const Icon = st.icon;
            const isCurrent = st.key === currentStage;
            const isCompleted = currentStageIndex > idx || status === "COMPLETED";

            return (
              <div key={st.key} className="flex flex-col items-center min-w-[65px] flex-1">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                    isCurrent
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20 animate-pulse"
                      : isCompleted
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : "border-slate-800 bg-slate-900 text-slate-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={`mt-1.5 text-[10px] font-semibold tracking-tight ${
                    isCurrent
                      ? "text-cyan-300 font-bold"
                      : isCompleted
                      ? "text-slate-300"
                      : "text-slate-600"
                  }`}
                >
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Phase Banner */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-purple-950/40 p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Phase: {currentStage}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-100 mt-0.5">
              {latestEvent?.title || "Agent initializing research state machine..."}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {latestEvent?.detail || "Setting up browser drivers and data pipelines."}
            </p>
          </div>
        </div>
      </div>

      {/* Solari Cloud Browser Status Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-indigo-400" />
            <h4 className="text-xs font-bold text-slate-200">Solari Cloud Browser Session</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
              <Shield className="h-3 w-3 text-emerald-400" /> Stealth Active
            </span>
            <span className="rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-[10px]">
              US Residential Proxy
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-800/70 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Last Browser Action:</span>
            <span className="font-mono text-cyan-300">{latestBrowserEvent?.title || "Session Ready"}</span>
          </div>
          {latestBrowserEvent?.data?.url && (
            <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
              <span>Active URL:</span>
              <span className="text-sky-300 truncate max-w-[280px]">{latestBrowserEvent.data.url}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-slate-400">
            <span>Isolation:</span>
            <span className="text-emerald-400">Ephemeral Cloud Container (auto-closed)</span>
          </div>
        </div>
      </div>

      {/* Solari MicroVM Sandbox Terminal */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 flex-1 flex flex-col min-h-[220px]">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-purple-400" />
            <h4 className="text-xs font-bold text-slate-200">Solari MicroVM Python Kernel</h4>
          </div>
          <span className="rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 text-[10px] font-mono">
            Linux MicroVM
          </span>
        </div>

        <div className="flex-1 rounded-xl bg-black border border-slate-800/90 p-3 font-mono text-[11px] text-slate-300 overflow-y-auto space-y-1">
          <div className="text-slate-500">
            # Solari Code Interpreter Kernel initialized (base template)
          </div>
          <div className="text-slate-500">
            # Isolated context ready for data normalization and score calculations
          </div>
          {sandboxOutputs.length > 0 ? (
            sandboxOutputs.map((out, idx) => (
              <div key={idx} className="text-emerald-400 whitespace-pre-wrap mt-2">
                {out}
              </div>
            ))
          ) : (
            <div className="text-slate-600 italic mt-2">
              Waiting for evidence collection before dispatching ranking code to sandbox...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
