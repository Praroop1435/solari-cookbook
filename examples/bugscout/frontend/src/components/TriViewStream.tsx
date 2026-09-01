'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useRef, useEffect, useState } from 'react';
import { Activity, ShieldAlert, Bug, Globe, Play, Cpu, Maximize2 } from 'lucide-react';
import { AgentEvent, DiscoveredBug } from '../types';

interface TriViewStreamProps {
  events: AgentEvent[];
  latestScreenshot?: string | null;
  currentUrl: string;
  terminalLogs: { message: string; level: string }[];
  discoveredBugs: DiscoveredBug[];
}

export const TriViewStream: React.FC<TriViewStreamProps> = ({
  events,
  latestScreenshot,
  currentUrl,
  terminalLogs,
  discoveredBugs,
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const eventsEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'reasoning' | 'browser' | 'sandbox'>('all');
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const hasStarted = events.length > 0;

  return (
    <div className="space-y-4">
      {/* Live Progress Bar when Running */}
      {hasStarted && (
        <div className="solari-panel rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#222222]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="text-xs font-bold text-white font-mono-code flex items-center gap-2">
                <span>Autonomous Audit In Progress</span>
                <span className="text-[#888888]">({events.length} actions executed)</span>
              </div>
              <p className="text-[11px] text-[#777777]">
                Navigating {currentUrl} • Trapping crashes • Verifying tests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono-code">
            <span className="px-2.5 py-1 rounded bg-[#111111] text-rose-400 border border-rose-900/40 font-bold">
              {discoveredBugs.length} Issues Found
            </span>
            <span className="px-2.5 py-1 rounded bg-[#111111] text-emerald-400 border border-emerald-900/40">
              MicroVM Active
            </span>
          </div>
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="flex xl:hidden items-center justify-between p-1 bg-[#0a0a0a] rounded-lg border border-[#1f1f1f]">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 text-xs font-mono-code rounded transition-all ${
            activeTab === 'all' ? 'bg-[#1c1c1c] text-white' : 'text-[#666666]'
          }`}
        >
          All Panels
        </button>
        <button
          onClick={() => setActiveTab('reasoning')}
          className={`flex-1 py-1.5 text-xs font-mono-code rounded transition-all ${
            activeTab === 'reasoning' ? 'bg-[#1c1c1c] text-white' : 'text-[#666666]'
          }`}
        >
          1. AI Thoughts ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('browser')}
          className={`flex-1 py-1.5 text-xs font-mono-code rounded transition-all ${
            activeTab === 'browser' ? 'bg-[#1c1c1c] text-white' : 'text-[#666666]'
          }`}
        >
          2. Live Browser
        </button>
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`flex-1 py-1.5 text-xs font-mono-code rounded transition-all ${
            activeTab === 'sandbox' ? 'bg-[#1c1c1c] text-white' : 'text-[#666666]'
          }`}
        >
          3. Test Runner
        </button>
      </div>

      {/* Tri-View Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Panel 1: Agent Thoughts & Actions (4 cols) */}
        <div
          className={`xl:col-span-4 solari-panel rounded-2xl p-4 flex flex-col h-[520px] shadow-xl border border-[#222222] ${
            activeTab !== 'all' && activeTab !== 'reasoning' ? 'hidden xl:flex' : 'flex'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-white" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono-code">
                  1. Live Agent Reasoning
                </h3>
                <p className="text-[10px] text-[#666666]">Step-by-step decision trail</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#141414] text-[#888888] font-mono-code border border-[#222222]">
              {events.length} steps
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pt-3 pr-1 text-xs font-mono-code">
            {!hasStarted ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#555555]">
                <div className="w-10 h-10 rounded-full bg-[#111111] flex items-center justify-center mb-3 text-white">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-semibold text-white mb-1">Agent Standing By</h4>
                <p className="text-[11px] text-[#666666] max-w-xs">
                  Click &ldquo;Run AI Audit&rdquo; or select a demo above to watch the agent analyze your site in real time.
                </p>
              </div>
            ) : (
              events.map((ev, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all ${
                    ev.type === 'bug_detected'
                      ? 'bg-[#18080a] border-rose-800/60 text-rose-200 shadow-md'
                      : ev.type === 'action'
                      ? 'bg-[#0a0f1c] border-indigo-800/50 text-indigo-200'
                      : 'bg-[#0c0c0c] border-[#1f1f1f] text-[#cccccc]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 text-[10px]">
                      {ev.type === 'bug_detected' ? (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold text-[9px] flex items-center gap-1">
                          <Bug className="w-2.5 h-2.5" /> BUG TRAPPED
                        </span>
                      ) : ev.type === 'action' ? (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 font-semibold text-[9px] flex items-center gap-1">
                          <Play className="w-2.5 h-2.5" /> ACTION
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-[#1a1a1a] text-[#888888] text-[9px]">
                          THOUGHT
                        </span>
                      )}
                      <span className="uppercase text-[#666666] text-[9px]">
                        {ev.stage.replace('_', ' ')}
                      </span>
                    </span>
                    <span className="text-[9px] text-[#555555]">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-[#e0e0e0]">{ev.message}</p>
                </div>
              ))
            )}
            <div ref={eventsEndRef} />
          </div>
        </div>

        {/* Panel 2: Live Browser Viewport Preview (4 cols) */}
        <div
          className={`xl:col-span-4 solari-panel rounded-2xl p-4 flex flex-col h-[520px] shadow-xl border border-[#222222] ${
            activeTab !== 'all' && activeTab !== 'browser' ? 'hidden xl:flex' : 'flex'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono-code">
                  2. Live Cloud Browser
                </h3>
                <p className="text-[10px] text-[#666666]">Real screen view as AI navigates</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono-code text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Feed</span>
            </div>
          </div>

          {/* Browser Window Canvas */}
          <div className="mt-3 flex-1 flex flex-col rounded-xl overflow-hidden border border-[#222222] bg-[#050505]">
            {/* Address Bar */}
            <div className="px-3 py-2 bg-[#0e0e0e] border-b border-[#1c1c1c] flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
              </div>
              <div className="flex-1 bg-[#000000] px-2.5 py-1 rounded text-[10px] font-mono-code text-[#aaaaaa] truncate border border-[#1f1f1f]">
                {currentUrl || 'https://your-website.com'}
              </div>
            </div>

            {/* Viewport Content */}
            <div className="flex-1 relative flex items-center justify-center bg-[#000000] p-2 overflow-hidden">
              {latestScreenshot ? (
                <div className="relative w-full h-full flex items-center justify-center group">
                  <img
                    src={latestScreenshot}
                    alt="Live Browser Screen"
                    className="w-full h-full object-contain rounded border border-[#1f1f1f]"
                  />
                  <button
                    onClick={() => setIsFullscreenImage(true)}
                    className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/80 hover:bg-black text-white text-xs border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Expand View</span>
                  </button>
                </div>
              ) : (
                <div className="text-center p-6 text-[#555555] flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-[#111111] flex items-center justify-center mb-3 text-[#666666]">
                    <Globe className="w-6 h-6 animate-pulse" />
                  </div>
                  <h4 className="text-xs font-semibold text-white mb-1">Browser Standing By</h4>
                  <p className="text-[11px] text-[#666666] max-w-xs">
                    When you run an audit, this window displays screenshots of what the AI browser sees.
                  </p>
                </div>
              )}

              {/* Bug overlay badge */}
              {discoveredBugs.length > 0 && (
                <div className="absolute top-3 right-3 bg-rose-600 text-white text-[11px] font-bold font-mono-code px-2.5 py-1 rounded-lg shadow-xl flex items-center gap-1.5 animate-bounce">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{discoveredBugs.length} Issues Found</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel 3: Solari MicroVM Sandbox Terminal (4 cols) */}
        <div
          className={`xl:col-span-4 solari-panel rounded-2xl p-4 flex flex-col h-[520px] shadow-xl border border-[#222222] ${
            activeTab !== 'all' && activeTab !== 'sandbox' ? 'hidden xl:flex' : 'flex'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono-code">
                  3. Automated Test Runner
                </h3>
                <p className="text-[10px] text-[#666666]">Solari Linux MicroVM verification</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-900/50 font-mono-code">
              Playwright Kernel
            </span>
          </div>

          <div className="mt-3 flex-1 bg-[#050505] rounded-xl p-3.5 font-mono-code text-[11px] text-[#cccccc] overflow-y-auto border border-[#1f1f1f] flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="text-[#555555] text-[10px] pb-1.5 border-b border-[#1c1c1c] flex items-center justify-between">
                <span>[solari-microvm-linux-base]</span>
                <span className="text-emerald-400 font-bold">● ACTIVE</span>
              </div>
              {terminalLogs.length === 0 ? (
                <div className="text-center py-16 text-[#555555] flex flex-col items-center">
                  <Cpu className="w-8 h-8 mb-2 text-[#333333]" />
                  <p className="text-xs font-semibold text-white mb-1">Test Runner Idle</p>
                  <p className="text-[11px] text-[#666666] max-w-xs">
                    Whenever a bug is caught, AI writes an automated Playwright test and runs it here in an isolated sandbox.
                  </p>
                </div>
              ) : (
                terminalLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`leading-relaxed ${
                      log.level === 'error'
                        ? 'text-rose-400 font-semibold'
                        : log.level === 'success'
                        ? 'text-emerald-400 font-semibold'
                        : log.level === 'warning'
                        ? 'text-amber-400'
                        : log.level === 'stdout'
                        ? 'text-cyan-300'
                        : 'text-[#888888]'
                    }`}
                  >
                    {log.message}
                  </div>
                ))
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Screenshot Modal */}
      {isFullscreenImage && latestScreenshot && (
        <div
          onClick={() => setIsFullscreenImage(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <img
              src={latestScreenshot}
              alt="Fullscreen Browser Viewport"
              className="max-h-[85vh] object-contain rounded-xl border border-white/20 shadow-2xl"
            />
            <p className="text-xs text-[#888888] font-mono-code mt-3">Click anywhere to close full preview</p>
          </div>
        </div>
      )}
    </div>
  );
};
