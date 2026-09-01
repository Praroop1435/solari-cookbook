"use client";

import React, { useState } from "react";
import { ResearchReport, OpportunityResult, AgentTraceStep } from "../types";
import { ComparisonTable } from "./ComparisonTable";
import { EvidenceVault } from "./EvidenceVault";
import {
  Sparkles,
  Download,
  Share2,
  FileText,
  Table as TableIcon,
  ShieldCheck,
  Activity,
  ExternalLink,
  ChevronRight,
  Send,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { getScoreColor, getRecommendationBadge, formatDuration, formatDate } from "../lib/utils";

interface ReportViewProps {
  report: ResearchReport;
  onNewResearch: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ report, onNewResearch }) => {
  const [activeTab, setActiveTab] = useState<"cards" | "matrix" | "evidence" | "trace">("cards");
  const [selectedEntityForEvidence, setSelectedEntityForEvidence] = useState<string | null>(null);

  const handleExportMarkdown = () => {
    let md = `# Research Report: ${report.objective}\n\n`;
    md += `Generated on: ${formatDate(report.generated_at)}\n\n`;
    md += `## Executive Summary\n\n${report.executive_summary}\n\n`;
    md += `## Top Recommended Opportunities\n\n`;

    report.top_results.forEach((res, i) => {
      md += `### ${i + 1}. ${res.name} (Score: ${res.score}% - ${res.recommendation})\n\n`;
      md += `**Match Rationale:** ${res.match_reason}\n\n`;
      if (res.attributes && Object.keys(res.attributes).length > 0) {
        md += `**Attributes:**\n`;
        Object.entries(res.attributes).forEach(([k, v]) => {
          md += `- **${k}**: ${v}\n`;
        });
        md += `\n`;
      }
      md += `**Key Verified Facts:**\n`;
      res.key_facts.forEach((f) => {
        md += `- ${f}\n`;
      });
      md += `\n**Risks & Concerns:**\n`;
      res.risks_and_concerns.forEach((r) => {
        md += `- ${r}\n`;
      });
      if (res.outreach_strategy) {
        md += `\n**Outreach Strategy:** ${res.outreach_strategy}\n`;
      }
      md += `\n**Sources:**\n`;
      res.source_urls.forEach((u) => {
        md += `- ${u}\n`;
      });
      md += `\n---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scout-report-${report.task_id || "research"}.md`;
    a.click();
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scout-report-${report.task_id || "research"}.json`;
    a.click();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Report Header */}
      <div className="rounded-3xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-0.5 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Research Finalized
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {formatDate(report.generated_at)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {report.objective}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>Export Markdown</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-purple-400" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Top Candidates</div>
            <div className="mt-1 text-2xl font-black text-white">{report.top_results.length}</div>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Verified Facts</div>
            <div className="mt-1 text-2xl font-black text-emerald-400">{report.evidence_vault.length}</div>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sources Consulted</div>
            <div className="mt-1 text-2xl font-black text-cyan-400">{report.stats?.total_sources_consulted || 4}</div>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">MicroVM Computations</div>
            <div className="mt-1 text-2xl font-black text-purple-400">{report.sandbox_computations?.length || 1}</div>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/10 p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Sparkles className="h-4 w-4" />
            <span>Executive Summary</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            {report.executive_summary}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("cards")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "cards"
              ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
              : "bg-slate-900/60 text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Opportunity Cards ({report.top_results.length})</span>
        </button>

        {report.comparison_matrix && (
          <button
            onClick={() => setActiveTab("matrix")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "matrix"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-slate-900/60 text-slate-400 hover:text-white"
            }`}
          >
            <TableIcon className="h-4 w-4" />
            <span>Comparison Matrix</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("evidence")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "evidence"
              ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
              : "bg-slate-900/60 text-slate-400 hover:text-white"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Evidence Vault ({report.evidence_vault.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("trace")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "trace"
              ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
              : "bg-slate-900/60 text-slate-400 hover:text-white"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Agent Audit Trace ({report.agent_trace.length})</span>
        </button>
      </div>

      {/* Tab Content 1: Opportunity Cards */}
      {activeTab === "cards" && (
        <div className="space-y-5">
          {report.top_results.map((result, idx) => {
            const badge = getRecommendationBadge(result.recommendation);
            const scoreClass = getScoreColor(result.score);

            return (
              <div
                key={result.id || idx}
                className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md space-y-5 transition-all hover:border-slate-700"
              >
                {/* Card Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-white tracking-tight">
                        {idx + 1}. {result.name}
                      </h2>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      {result.match_reason}
                    </p>
                  </div>

                  <div className={`flex items-center gap-1.5 rounded-2xl border px-3.5 py-1.5 font-mono text-sm font-bold ${scoreClass}`}>
                    <span>Match Score:</span>
                    <span className="text-base">{result.score}%</span>
                  </div>
                </div>

                {/* Attributes Pills */}
                {result.attributes && Object.keys(result.attributes).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(result.attributes).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-1 text-xs text-slate-300"
                      >
                        <span className="text-slate-500 uppercase text-[10px] font-semibold">{k.replace("_", " ")}:</span>
                        <span className="font-semibold text-slate-200">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Key Facts & Risks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Facts */}
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Key Verified Facts</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {result.key_facts.map((fact, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                          <span className="leading-relaxed">{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Risks & Concerns */}
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Risks & Uncertainty</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {result.risks_and_concerns.map((risk, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                          <span className="leading-relaxed">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Outreach Hook */}
                {result.outreach_strategy && (
                  <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/10 p-4 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      <Send className="h-3.5 w-3.5" />
                      <span>Tailored Outreach Strategy</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {result.outreach_strategy}
                    </p>
                  </div>
                )}

                {/* Sources Row */}
                {result.source_urls?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-500 text-[11px] font-semibold">Evidence Citations:</span>
                    {result.source_urls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] text-cyan-400 hover:text-cyan-300 hover:border-slate-700 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span className="truncate max-w-[200px]">{new URL(url).hostname}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Content 2: Comparison Matrix */}
      {activeTab === "matrix" && report.comparison_matrix && (
        <ComparisonTable matrix={report.comparison_matrix} />
      )}

      {/* Tab Content 3: Evidence Vault */}
      {activeTab === "evidence" && (
        <EvidenceVault evidenceList={report.evidence_vault} />
      )}

      {/* Tab Content 4: Agent Audit Trace */}
      {activeTab === "trace" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Full Agent Execution Audit Log</h3>
            <span className="text-xs text-slate-400 font-mono">
              Total Steps: {report.agent_trace.length}
            </span>
          </div>

          <div className="space-y-3">
            {report.agent_trace.map((step) => (
              <div
                key={step.step_number}
                className="flex items-start justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px] text-cyan-400 font-bold">
                    {step.step_number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
                        {step.stage}
                      </span>
                      <strong className="text-slate-100">{step.action}</strong>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{step.details}</p>
                    {step.tool_used && (
                      <span className="mt-1 inline-block text-[11px] font-mono text-purple-400">
                        Tool: {step.tool_used}
                      </span>
                    )}
                  </div>
                </div>

                <div className="font-mono text-[11px] text-slate-500 shrink-0">
                  {formatDuration(step.duration_ms)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
