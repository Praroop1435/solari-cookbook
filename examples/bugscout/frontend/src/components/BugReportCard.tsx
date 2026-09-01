'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  Copy,
  Download,
  ChevronDown,
  ChevronUp,
  FileCode,
  Check,
  Zap,
  Share2,
} from 'lucide-react';
import { DiscoveredBug, BugSeverity } from '../types';

interface BugReportCardProps {
  bugs: DiscoveredBug[];
}

export const BugReportCard: React.FC<BugReportCardProps> = ({ bugs }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [expandedBugId, setExpandedBugId] = useState<string | null>(bugs[0]?.id || null);
  const [activeCodeTab, setActiveCodeTab] = useState<Record<string, 'ts' | 'py'>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedIssueId, setCopiedIssueId] = useState<string | null>(null);

  const filteredBugs =
    selectedSeverity === 'all'
      ? bugs
      : bugs.filter((b) => b.severity.toLowerCase() === selectedSeverity.toLowerCase());

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSpec = (bug: DiscoveredBug, isTs: boolean) => {
    const code = isTs ? bug.playwright_ts_code : bug.playwright_py_code;
    if (!code) return;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isTs ? `test_repro_${bug.id}.spec.ts` : `test_repro_${bug.id}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyGithubIssue = (bug: DiscoveredBug) => {
    const issueMd = `### 🚨 [BugScout QA] ${bug.title}\n\n**Severity**: \`${bug.severity.toUpperCase()}\` | **Category**: \`${bug.category}\` | **Target URL**: ${bug.url}\n**Sandbox Verified**: ${bug.verified_in_sandbox ? '✅ YES' : '❌ NO'}\n\n---\n\n#### 📋 Description\n${bug.description}\n\n#### 🔄 Reproduction Steps\n${bug.repro_steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n#### 💥 Stack Trace / Network Response\n\`\`\`\n${bug.stack_trace || 'N/A'}\n\`\`\`\n\n#### 🧪 Synthesized Playwright Test Spec\n\`\`\`typescript\n${bug.playwright_ts_code || ''}\n\`\`\`\n\n---\n*Reported automatically by [BugScout AI](https://getsolari.com) powered by Solari Cloud Infrastructure.*`;
    navigator.clipboard.writeText(issueMd);
    setCopiedIssueId(bug.id);
    setTimeout(() => setCopiedIssueId(null), 2000);
  };

  const getSeverityBadgeClass = (severity: BugSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-950/40 text-rose-400 border-rose-900/50';
      case 'high':
        return 'bg-orange-950/40 text-orange-400 border-orange-900/50';
      case 'medium':
        return 'bg-amber-950/40 text-amber-400 border-amber-900/50';
      case 'low':
        return 'bg-blue-950/40 text-blue-400 border-blue-900/50';
      case 'visual':
        return 'bg-purple-950/40 text-purple-400 border-purple-900/50';
    }
  };

  return (
    <div className="solari-panel rounded-xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[#1c1c1c]">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-semibold text-white font-mono-code uppercase tracking-wider">
              Discovered Anomalies & Playwright Suites
            </h2>
          </div>
          <p className="text-xs text-[#777777] mt-0.5">
            Auto-trapped exceptions, reproduction sequences, and synthesized Playwright test suites
          </p>
        </div>

        {/* Severity Filter Chips */}
        <div className="flex flex-wrap items-center gap-1 bg-[#0a0a0a] p-1 rounded-md border border-[#1f1f1f]">
          {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider font-mono-code transition-all cursor-pointer ${
                selectedSeverity === sev
                  ? 'bg-[#ffffff] text-[#000000]'
                  : 'text-[#666666] hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Bugs Accordion List */}
      {filteredBugs.length === 0 ? (
        <div className="py-10 text-center text-[#555555]">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500/40" />
          <p className="text-xs font-mono-code">No bugs matching the selected filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBugs.map((bug) => {
            const isExpanded = expandedBugId === bug.id;
            const codeLang = activeCodeTab[bug.id] || 'ts';
            const currentCode =
              codeLang === 'ts' ? bug.playwright_ts_code : bug.playwright_py_code;

            return (
              <div
                key={bug.id}
                className="solari-card rounded-lg border transition-all overflow-hidden"
              >
                {/* Accordion Bar */}
                <div
                  onClick={() => setExpandedBugId(isExpanded ? null : bug.id)}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#121212] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono-code border shrink-0 ${getSeverityBadgeClass(
                        bug.severity
                      )}`}
                    >
                      {bug.severity}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-xs font-semibold text-white truncate font-mono-code">
                        {bug.title}
                      </h3>
                      <p className="text-[11px] text-[#666666] truncate mt-0.5">{bug.url}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {bug.verified_in_sandbox && (
                      <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono-code text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <Zap className="w-3 h-3" />
                        <span>MicroVM Verified</span>
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-[#777777]" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-[#777777]" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-[#1a1a1a] bg-[#050505] space-y-4">
                    {/* Description */}
                    <div>
                      <h4 className="text-[10px] font-mono-code uppercase tracking-wider text-[#666666] mb-1">
                        Bug Description
                      </h4>
                      <p className="text-xs text-[#cccccc] leading-relaxed">{bug.description}</p>
                    </div>

                    {/* Reproduction Steps */}
                    {bug.repro_steps.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-mono-code uppercase tracking-wider text-[#666666] mb-1.5">
                          Automated Reproduction Steps
                        </h4>
                        <div className="space-y-1">
                          {bug.repro_steps.map((step, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 text-xs text-[#aaaaaa] bg-[#0a0a0a] p-2 rounded border border-[#1a1a1a] font-mono-code text-[11px]"
                            >
                              <span className="text-emerald-400 font-bold">{idx + 1}.</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stack Trace */}
                    {bug.stack_trace && (
                      <div>
                        <h4 className="text-[10px] font-mono-code uppercase tracking-wider text-[#666666] mb-1">
                          Captured Stack / Network Trace
                        </h4>
                        <pre className="p-2.5 rounded bg-[#0a0a0a] border border-[#1a1a1a] font-mono-code text-[10px] text-rose-300 overflow-x-auto">
                          {bug.stack_trace}
                        </pre>
                      </div>
                    )}

                    {/* Playwright Test Spec */}
                    {currentCode && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                            <h4 className="text-[10px] font-mono-code uppercase tracking-wider text-white">
                              Synthesized Playwright Test Spec
                            </h4>
                          </div>

                          {/* Language Tab */}
                          <div className="flex items-center gap-1 bg-[#0a0a0a] p-0.5 rounded border border-[#1f1f1f]">
                            <button
                              onClick={() =>
                                setActiveCodeTab({ ...activeCodeTab, [bug.id]: 'ts' })
                              }
                              className={`px-2 py-0.5 text-[9px] font-mono-code font-semibold rounded cursor-pointer ${
                                codeLang === 'ts'
                                  ? 'bg-[#ffffff] text-[#000000]'
                                  : 'text-[#666666] hover:text-white'
                              }`}
                            >
                              TypeScript
                            </button>
                            <button
                              onClick={() =>
                                setActiveCodeTab({ ...activeCodeTab, [bug.id]: 'py' })
                              }
                              className={`px-2 py-0.5 text-[9px] font-mono-code font-semibold rounded cursor-pointer ${
                                codeLang === 'py'
                                  ? 'bg-[#ffffff] text-[#000000]'
                                  : 'text-[#666666] hover:text-white'
                              }`}
                            >
                              Python
                            </button>
                          </div>
                        </div>

                        {/* Code Container */}
                        <div className="relative rounded-lg overflow-hidden border border-[#1f1f1f] bg-[#000000]">
                          <pre className="p-3 font-mono-code text-[10px] text-[#e0e0e0] overflow-x-auto leading-relaxed">
                            {currentCode}
                          </pre>
                          <div className="absolute top-2 right-2 flex items-center gap-1">
                            <button
                              onClick={() => handleCopyCode(bug.id, currentCode)}
                              className="p-1 rounded bg-[#141414] hover:bg-[#202020] text-[#cccccc] text-[10px] font-mono-code flex items-center gap-1 border border-[#2a2a2a] transition-all cursor-pointer"
                              title="Copy code"
                            >
                              {copiedId === bug.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>{copiedId === bug.id ? 'Copied' : 'Copy'}</span>
                            </button>
                            <button
                              onClick={() => handleDownloadSpec(bug, codeLang === 'ts')}
                              className="p-1 rounded bg-[#141414] hover:bg-[#202020] text-[#cccccc] text-[10px] font-mono-code flex items-center gap-1 border border-[#2a2a2a] transition-all cursor-pointer"
                              title="Download spec file"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1a1a1a]">
                      <button
                        onClick={() => handleCopyGithubIssue(bug)}
                        className="px-2.5 py-1 rounded bg-[#0f0f0f] hover:bg-[#181818] text-[#cccccc] text-[10px] font-mono-code flex items-center gap-1.5 border border-[#222222] transition-all cursor-pointer"
                      >
                        {copiedIssueId === bug.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Share2 className="w-3 h-3 text-indigo-400" />
                        )}
                        <span>
                          {copiedIssueId === bug.id ? 'Copied Issue Markdown' : 'Copy GitHub/Jira Issue Ticket'}
                        </span>
                      </button>

                      <div className="text-[10px] text-[#555555] font-mono-code">
                        ID: {bug.id} | Solari CDP Trapped
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
