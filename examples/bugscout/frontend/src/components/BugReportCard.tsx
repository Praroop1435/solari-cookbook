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
  AlertCircle,
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
    const issueMd = `### 🚨 [Solari Sentinel QA] ${bug.title}\n\n**Severity**: \`${bug.severity.toUpperCase()}\` | **Category**: \`${bug.category}\` | **Target URL**: ${bug.url}\n**Sandbox Verified**: ${bug.verified_in_sandbox ? '✅ YES' : '❌ NO'}\n\n---\n\n#### 📋 Description\n${bug.description}\n\n#### 🔄 Reproduction Steps\n${bug.repro_steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n#### 💥 Stack Trace / Network Response\n\`\`\`\n${bug.stack_trace || 'N/A'}\n\`\`\`\n\n#### 🧪 Synthesized Playwright Test Spec\n\`\`\`typescript\n${bug.playwright_ts_code || ''}\n\`\`\`\n\n---\n*Reported automatically by [Solari Sentinel](https://getsolari.com) powered by Solari Cloud Infrastructure.*`;
    navigator.clipboard.writeText(issueMd);
    setCopiedIssueId(bug.id);
    setTimeout(() => setCopiedIssueId(null), 2000);
  };

  const getSeverityBadge = (severity: BugSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          label: 'CRITICAL',
          desc: 'Stops users or crashes page',
          cls: 'bg-rose-950/60 text-rose-300 border-rose-800',
        };
      case 'high':
        return {
          label: 'HIGH',
          desc: 'Major feature broken',
          cls: 'bg-orange-950/60 text-orange-300 border-orange-800',
        };
      case 'medium':
        return {
          label: 'MEDIUM',
          desc: 'External asset / network notice',
          cls: 'bg-amber-950/60 text-amber-300 border-amber-800',
        };
      case 'low':
        return {
          label: 'LOW (NOTICE)',
          desc: 'Accessibility / policy notice',
          cls: 'bg-blue-950/60 text-blue-300 border-blue-800',
        };
      case 'visual':
        return {
          label: 'VISUAL',
          desc: 'Styling inconsistency',
          cls: 'bg-purple-950/60 text-purple-300 border-purple-800',
        };
    }
  };

  return (
    <div className="solari-panel rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 border border-[#222222]">
      {/* Header & Explanation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1c1c1c]">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-white font-mono-code uppercase tracking-wider">
              Discovered Findings & Automated Test Specs
            </h2>
          </div>
          <p className="text-xs text-[#888888] mt-1">
            Every finding below has been verified in an isolated Solari MicroVM with an automated Playwright reproduction test.
          </p>
        </div>

        {/* Severity Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0a0a0a] p-1 rounded-xl border border-[#1f1f1f]">
          {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider font-mono-code transition-all cursor-pointer ${
                selectedSeverity === sev
                  ? 'bg-white text-black shadow-md'
                  : 'text-[#777777] hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Bugs Accordion List */}
      {filteredBugs.length === 0 ? (
        <div className="py-12 text-center text-[#666666] bg-[#0a0a0a] rounded-xl border border-[#1c1c1c]">
          <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
          <p className="text-sm font-semibold text-white">No issues found in this category</p>
          <p className="text-xs text-[#777777] mt-1">Your website passed all checks smoothly.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredBugs.map((bug) => {
            const isExpanded = expandedBugId === bug.id;
            const badge = getSeverityBadge(bug.severity);
            const codeLang = activeCodeTab[bug.id] || 'ts';
            const currentCode =
              codeLang === 'ts' ? bug.playwright_ts_code : bug.playwright_py_code;

            const isCdnError = bug.title.includes('simpleicons') || bug.title.includes('cdn');
            const isCorsError = bug.title.includes('NotSameOrigin') || bug.title.includes('ERR_BLOCKED');

            return (
              <div
                key={bug.id}
                className="solari-card rounded-xl border border-[#222222] transition-all overflow-hidden"
              >
                {/* Accordion Bar */}
                <div
                  onClick={() => setExpandedBugId(isExpanded ? null : bug.id)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#121212] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono-code border shrink-0 ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate font-mono-code">
                        {bug.title}
                      </h3>
                      <p className="text-[11px] text-[#777777] truncate mt-0.5">{bug.url}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {bug.verified_in_sandbox && (
                      <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono-code text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        <Zap className="w-3 h-3" />
                        <span>Verified in MicroVM</span>
                      </span>
                    )}
                    <div className="text-xs font-mono-code text-[#777777] flex items-center gap-1">
                      <span>{isExpanded ? 'Hide Details' : 'View Fix'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-white" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-[#1a1a1a] bg-[#050505] space-y-5">
                    {/* What Happened (Plain English) */}
                    <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#1c1c1c]">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1 flex items-center gap-1.5 font-mono-code">
                        <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
                        What Happened & Why
                      </h4>
                      <p className="text-xs text-[#cccccc] leading-relaxed">{bug.description}</p>
                      
                      {isCdnError && (
                        <div className="mt-2.5 p-2.5 rounded-lg bg-[#141414] border border-[#282828] text-[11px] text-[#aaaaaa]">
                          💡 <strong className="text-white">Quick Fix:</strong> An external CDN icon failed to load. We recommend downloading the SVG icons and hosting them locally in your <code className="text-cyan-300">/public</code> folder.
                        </div>
                      )}
                      
                      {isCorsError && (
                        <div className="mt-2.5 p-2.5 rounded-lg bg-[#141414] border border-[#282828] text-[11px] text-[#aaaaaa]">
                          💡 <strong className="text-white">Quick Fix:</strong> Cross-Origin Resource Policy (CORP) check. This is standard browser security when embedding assets from external domains.
                        </div>
                      )}
                    </div>

                    {/* How to Reproduce */}
                    {bug.repro_steps.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#aaaaaa] mb-2 font-mono-code">
                          How to Reproduce (Step by Step)
                        </h4>
                        <div className="space-y-1.5">
                          {bug.repro_steps.map((step, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2.5 text-xs text-[#cccccc] bg-[#0a0a0a] p-2.5 rounded-lg border border-[#1a1a1a]"
                            >
                              <span className="w-5 h-5 rounded-full bg-[#181818] text-white flex items-center justify-center text-[10px] font-mono-code font-bold shrink-0">
                                {idx + 1}
                              </span>
                              <span className="mt-0.5">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Error Trace if available */}
                    {bug.stack_trace && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#888888] mb-1 font-mono-code">
                          Captured Console / Network Output
                        </h4>
                        <pre className="p-3 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] font-mono-code text-[11px] text-rose-300 overflow-x-auto leading-relaxed">
                          {bug.stack_trace}
                        </pre>
                      </div>
                    )}

                    {/* Synthesized Playwright Test Spec */}
                    {currentCode && (
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono-code flex items-center gap-1.5">
                              <FileCode className="w-4 h-4 text-indigo-400" />
                              Automated Playwright Test (Share with Devs)
                            </h4>
                            <p className="text-[11px] text-[#777777]">
                              Engineers can run this test locally or in CI/CD to prevent regressions.
                            </p>
                          </div>

                          {/* Language Switcher */}
                          <div className="flex items-center gap-1 bg-[#0a0a0a] p-1 rounded-lg border border-[#1f1f1f] self-start sm:self-auto">
                            <button
                              onClick={() =>
                                setActiveCodeTab({ ...activeCodeTab, [bug.id]: 'ts' })
                              }
                              className={`px-2.5 py-1 text-[10px] font-mono-code font-bold rounded-md cursor-pointer transition-all ${
                                codeLang === 'ts'
                                  ? 'bg-white text-black'
                                  : 'text-[#777777] hover:text-white'
                              }`}
                            >
                              TypeScript (.spec.ts)
                            </button>
                            <button
                              onClick={() =>
                                setActiveCodeTab({ ...activeCodeTab, [bug.id]: 'py' })
                              }
                              className={`px-2.5 py-1 text-[10px] font-mono-code font-bold rounded-md cursor-pointer transition-all ${
                                codeLang === 'py'
                                  ? 'bg-white text-black'
                                  : 'text-[#777777] hover:text-white'
                              }`}
                            >
                              Python (pytest)
                            </button>
                          </div>
                        </div>

                        {/* Code Display */}
                        <div className="relative rounded-xl overflow-hidden border border-[#222222] bg-[#000000]">
                          <pre className="p-4 font-mono-code text-[11px] text-[#ededed] overflow-x-auto leading-relaxed">
                            {currentCode}
                          </pre>
                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopyCode(bug.id, currentCode)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#141414] hover:bg-[#222222] text-white text-xs font-mono-code flex items-center gap-1.5 border border-[#2a2a2a] transition-all cursor-pointer shadow-lg"
                              title="Copy code"
                            >
                              {copiedId === bug.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>{copiedId === bug.id ? 'Copied!' : 'Copy Code'}</span>
                            </button>
                            <button
                              onClick={() => handleDownloadSpec(bug, codeLang === 'ts')}
                              className="px-2.5 py-1.5 rounded-lg bg-[#141414] hover:bg-[#222222] text-white text-xs font-mono-code flex items-center gap-1.5 border border-[#2a2a2a] transition-all cursor-pointer shadow-lg"
                              title="Download spec file"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download File</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick Sharing Options */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1a1a1a]">
                      <button
                        onClick={() => handleCopyGithubIssue(bug)}
                        className="px-4 py-2 rounded-xl bg-[#111111] hover:bg-[#1c1c1c] text-white text-xs font-semibold font-mono-code flex items-center gap-2 border border-[#262626] transition-all cursor-pointer shadow-md"
                      >
                        {copiedIssueId === bug.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                        <span>
                          {copiedIssueId === bug.id
                            ? 'Copied Ticket to Clipboard!'
                            : 'Copy Ready-to-Paste GitHub / Jira Ticket'}
                        </span>
                      </button>

                      <div className="text-xs text-[#666666] font-mono-code">
                        Issue ID: <span className="text-white">{bug.id}</span>
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
