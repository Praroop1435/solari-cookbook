'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, ShieldAlert, Bug, Globe, Play, Cpu } from 'lucide-react';
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

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  return (
    <div className="space-y-4">
      {/* Mobile Tab Switcher */}
      <div className="flex xl:hidden items-center justify-between p-1 bg-[#0a0a0a] rounded-lg border border-[#1f1f1f]">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 text-xs font-mono-code rounded transition-all ${
            activeTab === 'all' ? 'bg-[#1c1c1c] text-white' : 'text-[#666666]'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('reasoning')}
          className={`flex-1 py-1.5 text-xs font-mono-code rounded transition-all ${
            activeTab === 'reasoning' ? 'bg-[#1c1c1c] text-white' : 'text-[#666666]'
          }`}
        >
          Agent Thoughts ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('browser')}
          className={`flex-1 py-1.5 text-xs font-mono-code rounded transition-all ${
            activeTab === 'browser' ? 'bg-[#1c1c1c] text-white' : 'text-[#666666]'
          }`}
        >
          Browser View
        </button>
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`flex-1 py-1.5 text-xs font-mono-code rounded transition-all ${
            activeTab === 'sandbox' ? 'bg-[#1c1c1c] text-white' : 'text-[#666666]'
          }`}
        >
          MicroVM
        </button>
      </div>

      {/* Tri-View Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Panel 1: Agent Reasoning & Action Stream (4 cols) */}
        <div
          className={`xl:col-span-4 solari-panel rounded-xl p-4 flex flex-col h-[500px] shadow-xl ${
            activeTab !== 'all' && activeTab !== 'reasoning' ? 'hidden xl:flex' : 'flex'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono-code">
                Agent Thought Stream
              </h3>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#141414] text-[#888888] font-mono-code border border-[#222222]">
              {events.length} steps
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pt-3 pr-1 text-xs font-mono-code">
            {events.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#555555]">
                <Sparkles className="w-6 h-6 mb-2 text-[#444444]" />
                <p className="text-xs">Awaiting audit trigger...</p>
              </div>
            ) : (
              events.map((ev, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border transition-all ${
                    ev.type === 'bug_detected'
                      ? 'bg-[#160b0d] border-rose-900/40 text-rose-200'
                      : ev.type === 'action'
                      ? 'bg-[#0a0f18] border-indigo-900/40 text-indigo-200'
                      : 'bg-[#0a0a0a] border-[#1c1c1c] text-[#cccccc]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 text-[10px]">
                      {ev.type === 'bug_detected' ? (
                        <Bug className="w-3 h-3 text-rose-400" />
                      ) : ev.type === 'action' ? (
                        <Play className="w-3 h-3 text-indigo-400" />
                      ) : (
                        <Sparkles className="w-3 h-3 text-[#aaaaaa]" />
                      )}
                      <span className="uppercase tracking-wide text-[#777777]">
                        {ev.stage.replace('_', ' ')}
                      </span>
                    </span>
                    <span className="text-[9px] text-[#555555]">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-[#dddddd]">{ev.message}</p>
                </div>
              ))
            )}
            <div ref={eventsEndRef} />
          </div>
        </div>

        {/* Panel 2: Live Browser Viewport Preview (4 cols) */}
        <div
          className={`xl:col-span-4 solari-panel rounded-xl p-4 flex flex-col h-[500px] shadow-xl ${
            activeTab !== 'all' && activeTab !== 'browser' ? 'hidden xl:flex' : 'flex'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono-code">
                Solari Stealth Browser
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono-code text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Live CDP Stream</span>
            </div>
          </div>

          {/* Browser Chrome Window */}
          <div className="mt-3 flex-1 flex flex-col rounded-lg overflow-hidden border border-[#1f1f1f] bg-[#050505]">
            {/* Address Bar */}
            <div className="px-3 py-1.5 bg-[#0e0e0e] border-b border-[#1c1c1c] flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[#333333]" />
                <div className="w-2 h-2 rounded-full bg-[#333333]" />
                <div className="w-2 h-2 rounded-full bg-[#333333]" />
              </div>
              <div className="flex-1 bg-[#050505] px-2 py-0.5 rounded text-[10px] font-mono-code text-[#aaaaaa] truncate border border-[#1f1f1f]">
                {currentUrl || 'about:blank'}
              </div>
            </div>

            {/* Viewport Content */}
            <div className="flex-1 relative flex items-center justify-center bg-[#000000] p-2 overflow-hidden">
              {latestScreenshot ? (
                <img
                  src={latestScreenshot}
                  alt="Solari Browser Live Viewport"
                  className="w-full h-full object-contain rounded border border-[#1f1f1f]"
                />
              ) : (
                <div className="text-center p-6 text-[#555555] flex flex-col items-center">
                  <Globe className="w-8 h-8 mb-2 text-[#333333] animate-pulse" />
                  <p className="text-xs font-mono-code text-[#888888]">Solari Cloud Browser rendering...</p>
                  <p className="text-[10px] font-mono-code text-[#555555] mt-0.5">Stealth CDP pipeline attached</p>
                </div>
              )}

              {/* Bug overlay badge */}
              {discoveredBugs.length > 0 && (
                <div className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-bold font-mono-code px-2 py-0.5 rounded shadow-lg flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>{discoveredBugs.length} Trapped</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel 3: Solari MicroVM Sandbox Terminal (4 cols) */}
        <div
          className={`xl:col-span-4 solari-panel rounded-xl p-4 flex flex-col h-[500px] shadow-xl ${
            activeTab !== 'all' && activeTab !== 'sandbox' ? 'hidden xl:flex' : 'flex'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono-code">
                Solari MicroVM Sandbox
              </h3>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#141414] text-indigo-300 border border-[#222222] font-mono-code">
              pytest-playwright
            </span>
          </div>

          <div className="mt-3 flex-1 bg-[#050505] rounded-lg p-3 font-mono-code text-[11px] text-[#cccccc] overflow-y-auto border border-[#1f1f1f] flex flex-col justify-between">
            <div className="space-y-1">
              <div className="text-[#555555] text-[10px] pb-1 border-b border-[#1c1c1c] flex items-center justify-between">
                <span>[solari-microvm-linux-6.6-base]</span>
                <span className="text-emerald-400 font-bold">● ACTIVE</span>
              </div>
              {terminalLogs.length === 0 ? (
                <div className="text-[#444444] italic py-8 text-center text-xs">
                  Awaiting synthesized Playwright test script to execute inside isolated Linux sandbox...
                </div>
              ) : (
                terminalLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`leading-relaxed ${
                      log.level === 'error'
                        ? 'text-rose-400'
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
    </div>
  );
};
