"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, UserCircle, Play, Cpu, CheckCircle2, Info, Compass } from "lucide-react";
import { ResearchProfile, SystemStatus } from "../types";

interface TaskInputProps {
  onSubmit: (objective: string, isDemo: boolean, enableSandbox: boolean) => void;
  onOpenProfile: () => void;
  profile: ResearchProfile;
  systemStatus: SystemStatus | null;
  isExecuting: boolean;
}

const PRESETS = [
  {
    title: "AI Startups Hiring Backend/Infra",
    query: "Find 10 early-stage AI startups hiring Senior Backend/Infrastructure Engineers in the US. Research each company, compare compensation and tech stacks, and prepare personalized outreach.",
    tag: "Jobs & Careers",
  },
  {
    title: "Cloud Browser API Teardown",
    query: "Compare pricing, stealth capabilities, and microVM isolation across Solari, Browserbase, and Playwright cloud providers. Rank them by latency and developer ergonomics.",
    tag: "Competitor Analysis",
  },
  {
    title: "Fast-Growing AI Agent Tooling",
    query: "Research top fast-growing AI agent infrastructure companies in 2026. Identify which ones are hiring, their recent funding rounds, and their core architecture.",
    tag: "Market Intel",
  },
  {
    title: "Match My Engineering Profile",
    query: "Find high-impact engineering opportunities at venture-backed startups that directly match my background in Python, distributed systems, and agent automation.",
    tag: "Profile Match",
  },
];

export const TaskInput: React.FC<TaskInputProps> = ({
  onSubmit,
  onOpenProfile,
  profile,
  systemStatus,
  isExecuting,
}) => {
  const [objective, setObjective] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [enableSandbox, setEnableSandbox] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective.trim() || isExecuting) return;
    onSubmit(objective.trim(), isDemo, enableSandbox);
  };

  const handleSelectPreset = (query: string) => {
    setObjective(query);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-14">
      {/* Hero Headline */}
      <div className="text-center mb-8 sm:mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-medium text-cyan-300 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Real Solari Cloud Browser & MicroVM Sandbox Integration</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Autonomous Web Research <br />
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Backed by Grounded Evidence
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-400">
          Give ScoutAI a natural-language goal. It plans multi-source discovery, navigates live sites in stealth Solari cloud browsers, verifies facts, and computes rankings inside a stateful Linux microVM sandbox.
        </p>
      </div>

      {/* Main Input Form */}
      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl border border-slate-800/90 bg-slate-900/90 p-4 sm:p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl transition-all focus-within:border-cyan-500/50"
      >
        <div className="relative">
          <textarea
            rows={4}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="e.g. Find 10 AI engineering roles at early-stage startups that match my background. Research each company, compare the roles, and prepare personalized outreach..."
            className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500/80 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 sm:text-base font-normal leading-relaxed"
          />
        </div>

        {/* Options & Controls Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-3">
            {/* Profile Drawer Toggle */}
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-all"
            >
              <UserCircle className="h-4 w-4 text-indigo-400" />
              <span>
                Candidate: <strong className="text-slate-100">{profile.name || "Alex Rivers"}</strong>
              </span>
              <span className="rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 text-[10px]">
                {profile.skills?.length || 0} skills
              </span>
            </button>

            {/* Sandbox Compute Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={enableSandbox}
                onChange={(e) => setEnableSandbox(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 h-4 w-4"
              />
              <span className="flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5 text-purple-400" /> Solari Sandbox
              </span>
            </label>

            {/* Demo Mode Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={isDemo}
                onChange={(e) => setIsDemo(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 h-4 w-4"
              />
              <span className="flex items-center gap-1">
                <Play className="h-3.5 w-3.5 text-emerald-400" /> Deterministic Demo Run
              </span>
            </label>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={!objective.trim() || isExecuting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-indigo-500 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExecuting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                <span>Executing Pipeline...</span>
              </>
            ) : (
              <>
                <span>Start Research</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preset Tasks Grid */}
      <div className="mt-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Compass className="h-3.5 w-3.5 text-cyan-400" />
          <span>Example Research Objectives</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset.query)}
              className="flex flex-col text-left rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 transition-all hover:border-cyan-500/40 hover:bg-slate-900 hover:shadow-lg hover:shadow-cyan-950/20 group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                  {preset.title}
                </span>
                <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] text-slate-400">
                  {preset.tag}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {preset.query}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
