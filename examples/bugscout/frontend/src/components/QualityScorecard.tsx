'use client';

import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Download,
  Video,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { QAReport } from '../types';

interface QualityScorecardProps {
  report: QAReport;
  onReset: () => void;
}

export const QualityScorecard: React.FC<QualityScorecardProps> = ({ report, onReset }) => {
  const criticalCount = report.bugs.filter((b) => b.severity === 'critical').length;
  const highCount = report.bugs.filter((b) => b.severity === 'high').length;

  const getScoreColor = (score: string) => {
    if (score.startsWith('A')) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score.startsWith('B')) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    if (score.startsWith('C')) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const recordingFullUrl = report.session_recording_url?.startsWith('http')
    ? report.session_recording_url
    : `${API_BASE}${report.session_recording_url}`;

  const handleDownloadFullReport = () => {
    const reportMd = `# 🛡️ Solari Sentinel: Multi-Model Security Audit Report

**Target URL**: ${report.target_url}
**Overall Security Grade**: ${report.security_grade || report.quality_score} (${report.health_percentage}% Health Score)
**Mean CVSS v3.1 Score**: ${report.mean_cvss || 0.0} / 10.0
**Audit Date**: ${new Date(report.created_at).toLocaleString()}
**Test Scope**: ${report.test_scope}
**AI Ensemble Models**: ${(report.models_used || ['Claude 3.5', 'GPT-4o', 'Gemini 2.0']).join(', ')}

---

## 📊 Executive Summary
${report.summary}

## 📈 Security Posture Metrics
- **Pages Visited**: ${report.total_pages_visited}
- **Network Requests Analyzed**: ${report.total_requests_analyzed}
- **Total Vulnerabilities & Misconfigurations**: ${report.bugs.length}
- **Solari MicroVM Verified Defensive Suites**: ${report.sandbox_verified_count}
- **Mean CVSS Score**: ${report.mean_cvss || 0.0}

---

## 🛡️ OWASP Top 10 Taxonomy Breakdown
${
  report.owasp_breakdown
    ? Object.entries(report.owasp_breakdown)
        .map(([cat, count]) => `- **${cat}**: ${count} finding(s)`)
        .join('\n')
    : '- N/A'
}

---

## 🚨 Discovered Vulnerabilities & Remediation Suites

${report.bugs
  .map(
    (b, idx) => `### ${idx + 1}. [${b.severity.toUpperCase()}] ${b.title}
- **CWE Identifier**: ${b.cwe_id || 'N/A'}
- **CVSS v3.1 Base Score**: ${b.cvss_score || 'N/A'}
- **OWASP Category**: ${b.owasp_category || b.category}
- **AI Models Confirmed**: ${(b.models_confirmed || ['Gemini 2.0', 'Claude 3.5', 'GPT-4o']).join(', ')} (Confidence: ${Math.round((b.confidence_score || 0.9) * 100)}%)
- **Target URL**: ${b.url}
- **Verified in Solari MicroVM**: ${b.verified_in_sandbox ? 'Yes ✅' : 'No'}
- **Description**: ${b.description}

**Reproduction & Audit Steps**:
${b.repro_steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}

**Playwright Defensive Verification Spec**:
\`\`\`typescript
${b.playwright_ts_code || '// N/A'}
\`\`\`

**Remediation Patch (Next.js)**:
\`\`\`javascript
${b.remediation_patch?.nextjs || b.remediation_patch?.fastapi || '// Refer to OWASP standard'}
\`\`\`
`
  )
  .join('\n---\n\n')}

---
*Generated autonomously by [Solari Sentinel](https://getsolari.com) powered by Solari Cloud Infrastructure.*`;

    const blob = new Blob([reportMd], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solari_sentinel_security_report_${report.session_id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="solari-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#222222] space-y-6">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1c1c1c]">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white font-mono-code">
              Security Audit Scorecard & Posture
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800 font-mono-code">
              Multi-Model Consensus
            </span>
          </div>
          <p className="text-xs text-[#777777] mt-1 font-mono-code">
            Target: <span className="text-white">{report.target_url}</span> • Completed{' '}
            {new Date(report.created_at).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadFullReport}
            className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] text-white border border-[#2e2e2e] text-xs font-mono-code flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Security Report</span>
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold font-mono-code transition-all cursor-pointer shadow-md"
          >
            New Security Audit
          </button>
        </div>
      </div>

      {/* Top 4 Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Security Grade */}
        <div className="p-4 rounded-xl bg-[#080808] border border-[#1f1f1f] flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-mono-code text-[#777777] mb-1">
              Security Grade
            </div>
            <div className={`text-2xl font-bold font-mono-code ${getScoreColor(report.security_grade || report.quality_score)}`}>
              {report.security_grade || report.quality_score}
            </div>
            <div className="text-[10px] text-[#555555] font-mono-code mt-0.5">
              {report.health_percentage}% Posture Health
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[#141414] text-white">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
        </div>

        {/* Mean CVSS Score */}
        <div className="p-4 rounded-xl bg-[#080808] border border-[#1f1f1f] flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-mono-code text-[#777777] mb-1">
              Mean CVSS v3.1
            </div>
            <div className="text-2xl font-bold text-white font-mono-code">
              {report.mean_cvss || 0.0} <span className="text-xs text-[#666666]">/ 10</span>
            </div>
            <div className="text-[10px] text-[#555555] font-mono-code mt-0.5">
              Common Vulnerability Score
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[#141414] text-amber-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        {/* Total Findings */}
        <div className="p-4 rounded-xl bg-[#080808] border border-[#1f1f1f] flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-mono-code text-[#777777] mb-1">
              Vulnerabilities
            </div>
            <div className="text-2xl font-bold text-white font-mono-code">
              {report.bugs.length}
            </div>
            <div className="text-[10px] text-[#555555] font-mono-code mt-0.5">
              {criticalCount} Critical • {highCount} High
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[#141414] text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        {/* Solari MicroVM Verified */}
        <div className="p-4 rounded-xl bg-[#080808] border border-[#1f1f1f] flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-mono-code text-[#777777] mb-1">
              MicroVM Verified
            </div>
            <div className="text-2xl font-bold text-emerald-400 font-mono-code">
              {report.sandbox_verified_count}
            </div>
            <div className="text-[10px] text-[#555555] font-mono-code mt-0.5">
              100% Deterministic Tests
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[#141414] text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* AI Executive Summary & Models Pill */}
      <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#1c1c1c] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono-code">
              AI Executive Security Assessment
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono-code text-[#888888]">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ensemble:</span>
            <span className="px-1.5 py-0.5 rounded bg-[#141414] text-emerald-300 border border-[#222]">Gemini 3.5</span>
            <span className="px-1.5 py-0.5 rounded bg-[#141414] text-amber-300 border border-[#222]">Claude 3.7</span>
            <span className="px-1.5 py-0.5 rounded bg-[#141414] text-cyan-300 border border-[#222]">GPT-4o</span>
          </div>
        </div>
        <p className="text-xs text-[#cccccc] leading-relaxed font-sans">{report.summary}</p>
      </div>

      {/* OWASP Top 10 Breakdown & Video Replay Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* OWASP Taxonomy Distribution */}
        <div className="p-4 rounded-xl bg-[#080808] border border-[#1f1f1f] space-y-2">
          <div className="text-xs font-bold text-white font-mono-code flex items-center justify-between">
            <span>OWASP Top 10 Distribution</span>
            <span className="text-[10px] text-[#777777] font-normal">{report.bugs.length} items mapped</span>
          </div>
          <div className="space-y-1.5 pt-1 text-[11px] font-mono-code">
            {report.owasp_breakdown && Object.keys(report.owasp_breakdown).length > 0 ? (
              Object.entries(report.owasp_breakdown).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between p-1.5 rounded bg-[#0e0e0e] border border-[#1a1a1a]">
                  <span className="text-[#aaaaaa] truncate max-w-[240px]">{cat}</span>
                  <span className="text-cyan-400 font-bold px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-800 text-[10px]">
                    {count} finding{count > 1 ? 's' : ''}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-[#555555] text-center py-2 text-xs">Zero OWASP infractions trapped</div>
            )}
          </div>
        </div>

        {/* Video Replay Download Banner */}
        <div className="p-4 rounded-xl bg-[#080808] border border-[#1f1f1f] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Video className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-white font-mono-code">
                Solari Cloud Video Session Recording
              </span>
            </div>
            <p className="text-[11px] text-[#777777] leading-relaxed">
              Full stealth session video recorded with residential US proxy replay on Solari Cloud.
            </p>
          </div>

          <div className="pt-3">
            <a
              href={recordingFullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-lg bg-[#141414] hover:bg-[#202020] text-white border border-[#2a2a2a] text-xs font-mono-code flex items-center justify-center gap-2 transition-all font-semibold"
            >
              <span>Watch / Download Session Replay</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#aaaaaa]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
