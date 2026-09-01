'use client';

import React, { useState } from 'react';
import { Search, Shield, Video, Layers, ArrowRight, Terminal } from 'lucide-react';
import { AuditRequest } from '../types';

interface AuditConfigProps {
  onStartAudit: (config: AuditRequest) => void;
  isLoading: boolean;
}

const PRESET_TARGETS = [
  { name: 'Hacker News', url: 'https://news.ycombinator.com', tag: 'Fast' },
  { name: 'Solari Cloud', url: 'https://getsolari.com', tag: 'Stealth' },
  { name: 'Broken API Demo', url: 'https://httpbin.org/status/500', tag: 'HTTP 500' },
  { name: 'Baseline App', url: 'https://example.com', tag: 'Simple' },
];

export const AuditConfig: React.FC<AuditConfigProps> = ({ onStartAudit, isLoading }) => {
  const [targetUrl, setTargetUrl] = useState('https://news.ycombinator.com');
  const [testScope, setTestScope] = useState('Full Smoke Test & Anomaly Discovery');
  const [stealthMode, setStealthMode] = useState(true);
  const [recordSession, setRecordSession] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim() || isLoading) return;
    onStartAudit({
      target_url: targetUrl.trim(),
      test_scope: testScope,
      stealth_mode: stealthMode,
      record_session: recordSession,
      max_depth: 3,
    });
  };

  return (
    <div className="solari-panel rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1c1c1c]">
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Autonomous Self-Healing QA & Anomaly Discovery
            </h1>
            <p className="text-xs text-[#888888] mt-0.5">
              Traps console exceptions, network 4xx/5xx failures, synthesizes Playwright test specs, and verifies in Solari MicroVMs.
            </p>
          </div>
          <div className="text-[11px] font-mono-code text-[#666666] self-start sm:self-auto">
            [SOLARI-BROWSER-CDP]
          </div>
        </div>

        {/* Main URL Command Bar */}
        <div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#555555]" />
              </div>
              <input
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://your-app.com"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0a] border border-[#222222] rounded-lg text-white placeholder-[#555555] focus:outline-none focus:border-[#555555] text-xs font-mono-code transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !targetUrl.trim()}
              className="px-5 py-2.5 rounded-lg bg-[#ffffff] hover:bg-[#eaeaea] text-[#000000] font-semibold text-xs font-mono-code flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <span>Run Audit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Presets Row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] font-mono-code text-[#666666] mr-1">Presets:</span>
          {PRESET_TARGETS.map((preset) => (
            <button
              key={preset.url}
              type="button"
              onClick={() => setTargetUrl(preset.url)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded bg-[#0f0f0f] hover:bg-[#181818] border border-[#1f1f1f] text-[11px] font-mono-code text-[#aaaaaa] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{preset.name}</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-[#1c1c1c] text-[#777777]">
                {preset.tag}
              </span>
            </button>
          ))}
        </div>

        {/* Configuration Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#1a1a1a]">
          {/* Test Scope */}
          <div>
            <label className="block text-[11px] font-mono-code text-[#777777] mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#777777]" />
              Scope
            </label>
            <select
              value={testScope}
              onChange={(e) => setTestScope(e.target.value)}
              disabled={isLoading}
              className="w-full px-2.5 py-1.5 bg-[#0a0a0a] border border-[#222222] rounded-md text-[11px] font-mono-code text-white focus:outline-none focus:border-[#444444]"
            >
              <option>Full Smoke Test & Anomaly Discovery</option>
              <option>Form Validation & Security Headers</option>
              <option>Broken Asset & 404 Route Audit</option>
              <option>Deep Link Crawl & Accessibility</option>
            </select>
          </div>

          {/* Stealth Mode */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-[#0a0a0a] border border-[#1c1c1c]">
            <div className="flex items-center gap-2">
              <Shield className={`w-3.5 h-3.5 ${stealthMode ? 'text-emerald-400' : 'text-[#555555]'}`} />
              <div>
                <div className="text-[11px] font-mono-code text-white">Stealth Egress</div>
                <div className="text-[9px] text-[#666666]">Residential Proxy</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={stealthMode}
              onChange={(e) => setStealthMode(e.target.checked)}
              disabled={isLoading}
              className="w-3.5 h-3.5 rounded bg-[#141414] border-[#2e2e2e] text-white focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Session Recording */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-[#0a0a0a] border border-[#1c1c1c]">
            <div className="flex items-center gap-2">
              <Video className={`w-3.5 h-3.5 ${recordSession ? 'text-rose-400' : 'text-[#555555]'}`} />
              <div>
                <div className="text-[11px] font-mono-code text-white">Session Replay</div>
                <div className="text-[9px] text-[#666666]">Solari Video API</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={recordSession}
              onChange={(e) => setRecordSession(e.target.checked)}
              disabled={isLoading}
              className="w-3.5 h-3.5 rounded bg-[#141414] border-[#2e2e2e] text-white focus:ring-0 cursor-pointer"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
