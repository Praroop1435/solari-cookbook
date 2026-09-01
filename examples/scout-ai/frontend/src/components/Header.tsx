"use client";

import React from "react";
import { SystemStatus } from "../types";
import { Globe, Cpu, Key, History, PlusCircle, Sparkles, ShieldCheck } from "lucide-react";

interface HeaderProps {
  systemStatus: SystemStatus | null;
  onOpenKeys: () => void;
  onOpenHistory: () => void;
  onNewResearch: () => void;
  isExecuting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  systemStatus,
  onOpenKeys,
  onOpenHistory,
  onNewResearch,
  isExecuting,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNewResearch}>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 shadow-lg shadow-cyan-500/20">
            <Sparkles className="h-5 w-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">Scout<span className="text-cyan-400">AI</span></span>
              <span className="rounded-full bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-medium text-cyan-300">
                Pinetree Challenge
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Web Research Agent on Solari Infrastructure</p>
          </div>
        </div>

        {/* Center: Infrastructure Status Badges */}
        <div className="hidden md:flex items-center gap-2">
          {/* Solari Status */}
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-slate-800 px-3 py-1 text-xs">
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-slate-300 font-medium">Solari Cloud:</span>
            {systemStatus?.solari_configured ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Live Connected
              </span>
            ) : (
              <span className="text-amber-400 font-medium">Key Needed</span>
            )}
          </div>

          {/* MicroVM Sandbox Status */}
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-slate-800 px-3 py-1 text-xs">
            <Cpu className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-slate-300 font-medium">MicroVM Sandbox:</span>
            <span className="text-purple-300 font-mono text-[11px]">Linux Kernel</span>
          </div>

          {/* LLM Status */}
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-slate-800 px-3 py-1 text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-300 font-medium">LLM:</span>
            <span className="text-slate-200 font-mono text-[11px]">Gemini Flash Lite</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenKeys}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            title="Configure API Keys"
          >
            <Key className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">API Keys</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            title="Research Run History"
          >
            <History className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">History</span>
          </button>

          <button
            onClick={onNewResearch}
            disabled={isExecuting}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 transition-all hover:bg-cyan-400 disabled:opacity-50"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
