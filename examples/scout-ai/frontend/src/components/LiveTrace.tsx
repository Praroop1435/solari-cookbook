"use client";

import React, { useEffect, useRef } from "react";
import { AgentEvent, EventType } from "../types";
import {
  Sparkles,
  Search,
  Globe,
  FileText,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Activity,
  Terminal,
} from "lucide-react";

interface LiveTraceProps {
  events: AgentEvent[];
  currentStage: string;
}

function getEventIcon(type: EventType) {
  switch (type) {
    case "plan.created":
      return <Sparkles className="h-4 w-4 text-cyan-400" />;
    case "browser.search":
      return <Search className="h-4 w-4 text-sky-400" />;
    case "browser.navigation":
    case "browser.extraction":
      return <Globe className="h-4 w-4 text-indigo-400" />;
    case "evidence.extracted":
      return <FileText className="h-4 w-4 text-emerald-400" />;
    case "sandbox.started":
    case "sandbox.execution":
      return <Cpu className="h-4 w-4 text-purple-400" />;
    case "verification.completed":
      return <ShieldCheck className="h-4 w-4 text-emerald-400" />;
    case "report.finalized":
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    case "error.occurred":
      return <AlertCircle className="h-4 w-4 text-rose-400" />;
    default:
      return <Activity className="h-4 w-4 text-slate-400" />;
  }
}

export const LiveTrace: React.FC<LiveTraceProps> = ({ events, currentStage }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Live Agent Trace
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">
            {currentStage}
          </span>
        </div>
      </div>

      {/* Events Stream List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {events.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center text-slate-500 text-xs">
            <Activity className="h-6 w-6 mb-2 text-slate-600 animate-pulse" />
            <span>Waiting for agent orchestrator to initialize...</span>
          </div>
        ) : (
          events.map((evt, idx) => (
            <div
              key={evt.id || idx}
              className="group relative flex items-start gap-3 rounded-xl border border-slate-800/70 bg-slate-900/40 p-3 transition-all hover:bg-slate-900/80 hover:border-slate-700"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-950 border border-slate-800">
                {getEventIcon(evt.event_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {evt.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                </div>
                <p className="text-xs text-slate-400 break-words leading-relaxed">
                  {evt.detail}
                </p>
                {evt.data?.query && (
                  <div className="mt-1.5 rounded bg-slate-950 px-2 py-1 text-[11px] font-mono text-cyan-300 border border-slate-800 truncate">
                    query: {evt.data.query}
                  </div>
                )}
                {evt.data?.url && (
                  <div className="mt-1.5 rounded bg-slate-950 px-2 py-1 text-[11px] font-mono text-sky-300 border border-slate-800 truncate">
                    {evt.data.url}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
