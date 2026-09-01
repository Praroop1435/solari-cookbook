'use client';

import React, { useState } from 'react';
import {
  Search,
  Shield,
  Video,
  ArrowRight,
  Globe,
  AlertTriangle,
  Check,
  Lock,
  User,
  Key,
  Cpu,
  ShieldAlert,
  Fingerprint,
} from 'lucide-react';
import { AuditRequest } from '../types';

interface AuditConfigProps {
  onStartAudit: (config: AuditRequest) => void;
  isLoading: boolean;
}

const PRESET_TARGETS = [
  {
    name: 'Hacker News',
    url: 'https://news.ycombinator.com',
    tag: 'Live Web App',
    badge: 'Popular',
    desc: 'Audits production live headers, cookie security, and DOM structure.',
    icon: Globe,
  },
  {
    name: 'Solari Cloud',
    url: 'https://getsolari.com',
    tag: 'Stealth Pentest',
    badge: 'Protected',
    desc: 'Deep security posture crawl with anti-bot residential proxy.',
    icon: Shield,
  },
  {
    name: 'OWASP Juice Shop Demo',
    url: 'https://juice-shop.herokuapp.com',
    tag: 'OWASP Lab',
    badge: 'Pentest Demo',
    desc: 'Benchmark against known vulnerable e-commerce architecture.',
    icon: ShieldAlert,
  },
  {
    name: '500 Server Crash Test',
    url: 'https://httpbin.org/status/500',
    tag: 'Error Trapping',
    badge: 'Fault Test',
    desc: 'See how AI traps server crashes and synthesizes defensive assertions.',
    icon: AlertTriangle,
  },
];

export const AuditConfig: React.FC<AuditConfigProps> = ({ onStartAudit, isLoading }) => {
  const [targetUrl, setTargetUrl] = useState('https://news.ycombinator.com');
  const [testScope, setTestScope] = useState('Full Security & OWASP Top 10 Pentest Audit');
  const [stealthMode, setStealthMode] = useState(true);
  const [recordSession, setRecordSession] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Multi-Model Selection
  const [enableGemini, setEnableGemini] = useState(true);
  const [enableClaude, setEnableClaude] = useState(true);
  const [enableGPT, setEnableGPT] = useState(true);

  // Authenticated Testing State
  const [enableAuth, setEnableAuth] = useState(false);
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [profileId, setProfileId] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetUrl.trim() || isLoading) return;

    const enabled_models: string[] = [];
    if (enableGemini) enabled_models.push('gemini');
    if (enableClaude) enabled_models.push('claude');
    if (enableGPT) enabled_models.push('gpt');

    onStartAudit({
      target_url: targetUrl.trim(),
      test_scope: testScope,
      stealth_mode: stealthMode,
      record_session: recordSession,
      max_depth: 3,
      enabled_models: enabled_models.length > 0 ? enabled_models : ['gemini'],
      auth_username: enableAuth && authUsername.trim() ? authUsername.trim() : undefined,
      auth_password: enableAuth && authPassword.trim() ? authPassword.trim() : undefined,
      profile_id: enableAuth && profileId.trim() ? profileId.trim() : undefined,
    });
  };

  const handleSelectPreset = (url: string) => {
    setTargetUrl(url);
  };

  return (
    <div className="solari-panel rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-[#222222]">
      {/* 3-Step Simple Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-[#1c1c1c] text-xs">
        <div className="flex items-start gap-3 bg-[#0a0a0a] p-3 rounded-xl border border-[#1a1a1a]">
          <div className="w-6 h-6 rounded-full bg-white text-black font-bold flex items-center justify-center text-xs shrink-0 font-mono-code">
            1
          </div>
          <div>
            <h2 className="font-semibold text-white">Target Web URL</h2>
            <p className="text-[#888888] text-[11px] mt-0.5">Enter any live URL, internal staging app, or demo target.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-[#0a0a0a] p-3 rounded-xl border border-[#1a1a1a]">
          <div className="w-6 h-6 rounded-full bg-cyan-400 text-black font-bold flex items-center justify-center text-xs shrink-0 font-mono-code">
            2
          </div>
          <div>
            <h2 className="font-semibold text-white">Multi-Model AI Consensus</h2>
            <p className="text-[#888888] text-[11px] mt-0.5">Claude, GPT & Gemini audit headers, cookies, CORS & secrets.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-[#0a0a0a] p-3 rounded-xl border border-[#1a1a1a]">
          <div className="w-6 h-6 rounded-full bg-emerald-400 text-black font-bold flex items-center justify-center text-xs shrink-0 font-mono-code">
            3
          </div>
          <div>
            <h2 className="font-semibold text-white">Solari MicroVM Verified</h2>
            <p className="text-[#888888] text-[11px] mt-0.5">Executes defensive assertion suites & provides multi-framework fixes.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Main URL Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#aaaaaa] font-mono-code mb-2 flex items-center justify-between">
            <span>Target Web Application URL</span>
            <span className="text-[11px] text-[#666666] normal-case font-normal">
              e.g. your SaaS, API portal, or web store
            </span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[#666666]" />
              </div>
              <input
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-3.5 bg-[#0a0a0a] border border-[#2e2e2e] rounded-xl text-white placeholder-[#555555] focus:outline-none focus:border-cyan-500 text-sm font-mono-code transition-all shadow-inner"
              />
            </div>

            <select
              value={testScope}
              onChange={(e) => setTestScope(e.target.value)}
              disabled={isLoading}
              className="px-3 py-3.5 bg-[#0a0a0a] border border-[#2e2e2e] rounded-xl text-white text-xs font-mono-code focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="Full Security & OWASP Top 10 Pentest Audit">Scope: OWASP Top 10 Audit</option>
              <option value="Security Headers & TLS Posture Audit">Scope: Headers & TLS</option>
              <option value="Authentication & Session Cookie Hygiene">Scope: Auth & Cookies</option>
              <option value="Full Deep Pentest & Attack Surface Crawl">Scope: Full Pentest Crawl</option>
            </select>

            <button
              type="submit"
              disabled={isLoading || !targetUrl.trim()}
              className="px-7 py-3.5 rounded-xl bg-[#ffffff] hover:bg-[#eaeaea] text-[#000000] font-bold text-sm font-mono-code flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-lg shadow-white/10"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Auditing Security Posture...</span>
                </>
              ) : (
                <>
                  <span>Run AI Security Audit</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 1-Click Interactive Presets */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-[#888888] uppercase tracking-wider font-mono-code">
              1-Click Security Audit Targets:
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESET_TARGETS.map((preset) => {
              const isSelected = targetUrl === preset.url;
              const Icon = preset.icon;
              return (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => handleSelectPreset(preset.url)}
                  disabled={isLoading}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#141414] border-cyan-400 text-white shadow-lg'
                      : 'bg-[#0a0a0a] border-[#1f1f1f] hover:border-[#3a3a3a] hover:bg-[#111111] text-[#999999]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-400 text-black' : 'bg-[#181818] text-white'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold font-mono-code text-white">
                          {preset.name}
                        </span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1c1c1c] text-[#aaaaaa] font-mono-code border border-[#2a2a2a]">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#777777] leading-snug">
                      {preset.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#1a1a1a] flex items-center justify-between text-[10px] font-mono-code text-[#666666]">
                    <span>{preset.tag}</span>
                    {isSelected && <span className="text-cyan-400 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Selected</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Multi-Model AI Engine Selector */}
        <div className="p-4 rounded-xl bg-[#090909] border border-[#1f1f1f] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold font-mono-code text-white">
                Multi-Model AI Consensus Engine
              </span>
            </div>
            <span className="text-[10px] font-mono-code text-[#777777]">
              Multi-perspective consensus scoring enabled
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#000000] border border-[#222222] cursor-pointer hover:border-[#333333] transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-white font-mono-code">Google Gemini 2.0</div>
                  <div className="text-[10px] text-[#666666]">Telemetry & DOM Analysis</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableGemini}
                onChange={(e) => setEnableGemini(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 rounded bg-[#141414] border-[#333333] text-emerald-400 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#000000] border border-[#222222] cursor-pointer hover:border-[#333333] transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <div>
                  <div className="text-xs font-bold text-white font-mono-code">Anthropic Claude 3.5</div>
                  <div className="text-[10px] text-[#666666]">Threat Modeling & Fixes</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableClaude}
                onChange={(e) => setEnableClaude(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 rounded bg-[#141414] border-[#333333] text-amber-400 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#000000] border border-[#222222] cursor-pointer hover:border-[#333333] transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <div>
                  <div className="text-xs font-bold text-white font-mono-code">OpenAI GPT-4o</div>
                  <div className="text-[10px] text-[#666666]">CVSS v3.1 & Defense Tests</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableGPT}
                onChange={(e) => setEnableGPT(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 rounded bg-[#141414] border-[#333333] text-cyan-400 focus:ring-0 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Advanced Options & Authenticated Pentesting */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-mono-code text-[#777777] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{showAdvanced ? '− Hide Advanced Settings' : '+ Show Advanced Settings (Stealth, Replay & Behind-Login Auth)'}</span>
          </button>

          {showAdvanced && (
            <div className="space-y-4 pt-4 mt-2 border-t border-[#1c1c1c]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f]">
                  <div className="flex items-center gap-2.5">
                    <Shield className={`w-4 h-4 ${stealthMode ? 'text-emerald-400' : 'text-[#555555]'}`} />
                    <div>
                      <div className="text-xs font-semibold text-white font-mono-code">Stealth Anti-Bot Browser</div>
                      <div className="text-[11px] text-[#777777]">US Residential egress + humanized mouse curves to bypass firewalls.</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={stealthMode}
                    onChange={(e) => setStealthMode(e.target.checked)}
                    disabled={isLoading}
                    className="w-4 h-4 rounded bg-[#141414] border-[#333333] text-white focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f]">
                  <div className="flex items-center gap-2.5">
                    <Video className={`w-4 h-4 ${recordSession ? 'text-rose-400' : 'text-[#555555]'}`} />
                    <div>
                      <div className="text-xs font-semibold text-white font-mono-code">Full Video Session Replay</div>
                      <div className="text-[11px] text-[#777777]">Captures authenticated video replay of the security crawl.</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={recordSession}
                    onChange={(e) => setRecordSession(e.target.checked)}
                    disabled={isLoading}
                    className="w-4 h-4 rounded bg-[#141414] border-[#333333] text-white focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* 🔐 Authenticated Behind-Login Security Audit */}
              <div className="p-4 rounded-xl bg-[#080808] border border-[#222222] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className={`w-4 h-4 ${enableAuth ? 'text-cyan-400' : 'text-[#666666]'}`} />
                    <div>
                      <div className="text-xs font-bold text-white font-mono-code flex items-center gap-2">
                        <span>Behind-Login Pentest & Protected App Testing</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800 font-mono-code">
                          Solari Persistent Profiles
                        </span>
                      </div>
                      <p className="text-[11px] text-[#777777] mt-0.5">
                        Audit member dashboards, admin consoles, and authenticated API routes.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableAuth}
                    onChange={(e) => setEnableAuth(e.target.checked)}
                    disabled={isLoading}
                    className="w-4 h-4 rounded bg-[#141414] border-[#333333] text-cyan-400 focus:ring-0 cursor-pointer"
                  />
                </div>

                {enableAuth && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#1a1a1a]">
                    <div>
                      <label className="block text-[10px] font-mono-code text-[#888888] mb-1 flex items-center gap-1">
                        <User className="w-3 h-3 text-[#666666]" /> Username / Email
                      </label>
                      <input
                        type="text"
                        value={authUsername}
                        onChange={(e) => setAuthUsername(e.target.value)}
                        placeholder="pentest_user@example.com"
                        disabled={isLoading}
                        className="w-full px-3 py-2 bg-[#000000] border border-[#262626] rounded-lg text-xs font-mono-code text-white placeholder-[#444444] focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono-code text-[#888888] mb-1 flex items-center gap-1">
                        <Key className="w-3 h-3 text-[#666666]" /> Password
                      </label>
                      <input
                        type="password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="w-full px-3 py-2 bg-[#000000] border border-[#262626] rounded-lg text-xs font-mono-code text-white placeholder-[#444444] focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono-code text-[#888888] mb-1 flex items-center gap-1">
                        <Fingerprint className="w-3 h-3 text-[#666666]" /> Solari Profile ID (2FA Bypass)
                      </label>
                      <input
                        type="text"
                        value={profileId}
                        onChange={(e) => setProfileId(e.target.value)}
                        placeholder="profile_id (already logged in)"
                        disabled={isLoading}
                        className="w-full px-3 py-2 bg-[#000000] border border-[#262626] rounded-lg text-xs font-mono-code text-white placeholder-[#444444] focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
