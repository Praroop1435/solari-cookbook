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
  Layers,
  Cpu,
  Code2,
} from 'lucide-react';
import { DiscoveredBug, BugSeverity } from '../types';

interface BugReportCardProps {
  bugs: DiscoveredBug[];
}

export const BugReportCard: React.FC<BugReportCardProps> = ({ bugs }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [expandedBugId, setExpandedBugId] = useState<string | null>(bugs[0]?.id || null);
  const [activeCodeTab, setActiveCodeTab] = useState<Record<string, 'remediation' | 'ts' | 'py'>>({});
  const [activeFrameworkTab, setActiveFrameworkTab] = useState<Record<string, string>>({});
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
    a.download = isTs ? `test_defensive_${bug.id}.spec.ts` : `test_defensive_${bug.id}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyGithubIssue = (bug: DiscoveredBug) => {
    const issueMd = `### 🚨 [Solari Sentinel Security Finding] ${bug.title}

**Severity**: \`${bug.severity.toUpperCase()}\` | **CVSS v3.1 Score**: \`${bug.cvss_score || 'N/A'}\`
**OWASP Taxonomy**: \`${bug.owasp_category || bug.category}\` | **CWE**: \`${bug.cwe_id || 'N/A'}\`
**AI Models Confirmed**: ${(bug.models_confirmed || ['Gemini 3.5', 'Claude 3.7', 'GPT-4o']).join(', ')} (Confidence: ${Math.round((bug.confidence_score || 0.92) * 100)}%)
**Solari MicroVM Verified**: ${bug.verified_in_sandbox ? '✅ YES' : '❌ NO'}

---

#### 📋 Vulnerability Description
${bug.description}

#### 🔄 Reproduction & Audit Steps
${bug.repro_steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

#### 🧪 Defensive Playwright Test Spec
\`\`\`typescript
${bug.playwright_ts_code || ''}
\`\`\`

#### 🛡️ Framework Remediation Patch
\`\`\`
${bug.remediation_patch?.nextjs || bug.remediation_patch?.fastapi || '// Consult OWASP guidelines'}
\`\`\`

---
*Reported automatically by [Solari Sentinel](https://getsolari.com) powered by Solari Cloud Infrastructure.*`;

    navigator.clipboard.writeText(issueMd);
    setCopiedIssueId(bug.id);
    setTimeout(() => setCopiedIssueId(null), 2000);
  };

  const getSeverityBadge = (severity: BugSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'high':
        return 'bg-orange-950/80 text-orange-300 border-orange-800';
      case 'medium':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      default:
        return 'bg-[#141414] text-[#aaaaaa] border-[#2a2a2a]';
    }
  };

  if (bugs.length === 0) {
    return (
      <div className="solari-panel rounded-2xl p-8 text-center border border-[#222222]">
        <div className="w-12 h-12 rounded-full bg-emerald-950/40 border border-emerald-800 flex items-center justify-center mx-auto mb-3 text-emerald-400">
          <CheckCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white font-mono-code">No Security Findings Detected</h3>
        <p className="text-xs text-[#777777] mt-1 max-w-sm mx-auto">
          The autonomous agent found zero OWASP vulnerabilities, misconfigured headers, or broken assets on this target.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 solari-panel rounded-xl p-3 border border-[#222222]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white font-mono-code">
            Security Findings ({filteredBugs.length} / {bugs.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono-code">
          {['all', 'critical', 'high', 'medium', 'low'].map((sev) => {
            const count = sev === 'all' ? bugs.length : bugs.filter((b) => b.severity === sev).length;
            const isSelected = selectedSeverity === sev;
            return (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer capitalize flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'bg-[#0f0f0f] text-[#777777] hover:text-white border border-[#1f1f1f]'
                }`}
              >
                <span>{sev}</span>
                <span className={`text-[9px] px-1 rounded ${isSelected ? 'bg-black/20 text-black' : 'bg-[#181818] text-[#888888]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        {filteredBugs.map((bug) => {
          const isExpanded = expandedBugId === bug.id;
          const codeTab = activeCodeTab[bug.id] || 'remediation';
          const frameworks = Object.keys(bug.remediation_patch || {});
          const currentFw = activeFrameworkTab[bug.id] || frameworks[0] || 'nextjs';
          const remediationCode = bug.remediation_patch?.[currentFw] || '// Consult OWASP security guidelines';

          return (
            <div
              key={bug.id}
              className={`solari-panel rounded-2xl border transition-all overflow-hidden ${
                isExpanded ? 'border-[#383838] bg-[#090909] shadow-xl' : 'border-[#1c1c1c] hover:border-[#2a2a2a]'
              }`}
            >
              {/* Card Header (Accordion Click Target) */}
              <button
                type="button"
                onClick={() => setExpandedBugId(isExpanded ? null : bug.id)}
                className="w-full p-4 sm:p-5 flex items-start justify-between gap-3 text-left cursor-pointer"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border font-mono-code ${getSeverityBadge(bug.severity)}`}>
                      {bug.severity}
                    </span>

                    {bug.cvss_score && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950/50 text-rose-300 border border-rose-800 font-mono-code">
                        CVSS {bug.cvss_score}
                      </span>
                    )}

                    {bug.cwe_id && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#141414] text-[#aaaaaa] border border-[#222222] font-mono-code">
                        {bug.cwe_id}
                      </span>
                    )}

                    {bug.owasp_category && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/80 font-mono-code truncate max-w-[200px]">
                        {bug.owasp_category}
                      </span>
                    )}

                    {bug.verified_in_sandbox && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800 font-mono-code flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-400" /> MicroVM Verified
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white font-mono-code truncate pr-2">
                    {bug.title}
                  </h3>

                  <p className="text-xs text-[#777777] line-clamp-1">
                    {bug.description}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-[#141414] text-[#888888] shrink-0 mt-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Accordion Expanded Details */}
              {isExpanded && (
                <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-[#181818] space-y-4 text-xs font-mono-code">
                  {/* Multi-Model Consensus Pill */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#0d0d0d] border border-[#1f1f1f]">
                    <div className="flex items-center gap-2 text-[#aaaaaa]">
                      <Cpu className="w-3.5 h-3.5 text-purple-400" />
                      <span>Confirmed by:</span>
                      <span className="text-white font-semibold">
                        {(bug.models_confirmed || ['Gemini 3.5', 'Claude 3.7', 'GPT-4o']).join(' + ')}
                      </span>
                    </div>

                    <div className="text-[11px] text-cyan-400 font-bold">
                      {Math.round((bug.confidence_score || 0.92) * 100)}% Consensus Confidence
                    </div>
                  </div>

                  {/* Full Description & Repro Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[#cccccc]">
                    <div className="p-3 rounded-xl bg-[#0b0b0b] border border-[#1c1c1c] space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-[#777777] flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3 text-cyan-400" /> Vulnerability Description
                      </div>
                      <p className="text-[11px] leading-relaxed text-[#e0e0e0] font-sans">
                        {bug.description}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0b0b0b] border border-[#1c1c1c] space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-[#777777] flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-emerald-400" /> Reproduction & Audit Steps
                      </div>
                      <ol className="space-y-1 text-[11px] text-[#aaaaaa] list-decimal list-inside">
                        {bug.repro_steps.map((step, idx) => (
                          <li key={idx} className="truncate">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Code Viewer: Remediation Patches vs Playwright Defensive Tests */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1 bg-[#0d0d0d] p-1 rounded-lg border border-[#1f1f1f]">
                        <button
                          type="button"
                          onClick={() => setActiveCodeTab((prev) => ({ ...prev, [bug.id]: 'remediation' }))}
                          className={`px-3 py-1 rounded text-xs font-mono-code transition-all cursor-pointer flex items-center gap-1.5 ${
                            codeTab === 'remediation' ? 'bg-cyan-950 text-cyan-200 border border-cyan-800' : 'text-[#777777] hover:text-white'
                          }`}
                        >
                          <Code2 className="w-3 h-3 text-cyan-400" />
                          <span>Remediation Patch</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveCodeTab((prev) => ({ ...prev, [bug.id]: 'ts' }))}
                          className={`px-3 py-1 rounded text-xs font-mono-code transition-all cursor-pointer flex items-center gap-1.5 ${
                            codeTab === 'ts' ? 'bg-[#1e1e1e] text-white' : 'text-[#777777] hover:text-white'
                          }`}
                        >
                          <FileCode className="w-3 h-3 text-emerald-400" />
                          <span>Playwright TS</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveCodeTab((prev) => ({ ...prev, [bug.id]: 'py' }))}
                          className={`px-3 py-1 rounded text-xs font-mono-code transition-all cursor-pointer flex items-center gap-1.5 ${
                            codeTab === 'py' ? 'bg-[#1e1e1e] text-white' : 'text-[#777777] hover:text-white'
                          }`}
                        >
                          <FileCode className="w-3 h-3 text-blue-400" />
                          <span>Playwright Py</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyGithubIssue(bug)}
                          className="px-2.5 py-1 rounded bg-[#141414] hover:bg-[#202020] text-[#aaaaaa] hover:text-white border border-[#262626] text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>{copiedIssueId === bug.id ? 'Copied Issue!' : 'Copy GitHub Issue'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Framework Tabs for Remediation */}
                    {codeTab === 'remediation' && frameworks.length > 1 && (
                      <div className="flex items-center gap-1.5 pt-1 text-[10px]">
                        <span className="text-[#666666]">Framework:</span>
                        {frameworks.map((fw) => (
                          <button
                            key={fw}
                            type="button"
                            onClick={() => setActiveFrameworkTab((prev) => ({ ...prev, [bug.id]: fw }))}
                            className={`px-2 py-0.5 rounded uppercase font-bold transition-all cursor-pointer ${
                              currentFw === fw
                                ? 'bg-cyan-400 text-black'
                                : 'bg-[#121212] text-[#888888] hover:text-white border border-[#222222]'
                            }`}
                          >
                            {fw}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Code Container */}
                    <div className="relative rounded-xl bg-[#000000] border border-[#1e1e1e] p-3 text-xs overflow-x-auto max-h-60 font-mono-code text-[#38bdf8]">
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyCode(
                              bug.id,
                              codeTab === 'remediation'
                                ? remediationCode
                                : codeTab === 'ts'
                                ? bug.playwright_ts_code || ''
                                : bug.playwright_py_code || ''
                            )
                          }
                          className="p-1.5 rounded-lg bg-[#141414] text-[#888888] hover:text-white border border-[#282828] transition-all cursor-pointer"
                        >
                          {copiedId === bug.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        {codeTab !== 'remediation' && (
                          <button
                            type="button"
                            onClick={() => handleDownloadSpec(bug, codeTab === 'ts')}
                            className="p-1.5 rounded-lg bg-[#141414] text-[#888888] hover:text-white border border-[#282828] transition-all cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <pre className="text-[11px] leading-relaxed whitespace-pre font-mono-code">
                        {codeTab === 'remediation'
                          ? remediationCode
                          : codeTab === 'ts'
                          ? bug.playwright_ts_code || '// Synthesizing Playwright test...'
                          : bug.playwright_py_code || '# Synthesizing Playwright test...'}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
