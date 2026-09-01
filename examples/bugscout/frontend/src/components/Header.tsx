'use client';

import React from 'react';
import { ShieldAlert, ExternalLink, Cpu, Globe } from 'lucide-react';

interface HeaderProps {
  solariConfigured?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ solariConfigured = true }) => {
  return (
    <header className="border-b border-[#1c1c1c] bg-[#000000]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#111111] border border-[#2a2a2a] flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white font-mono-code">
                BugScout
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#141414] text-[#888888] border border-[#222222]">
                Solari Infra
              </span>
            </div>
          </div>
        </div>

        {/* Infrastructure Status Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0a0a0a] border border-[#1f1f1f] text-[11px] font-mono-code">
            <div className={`w-1.5 h-1.5 rounded-full ${solariConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-[#888888]">Solari Cloud:</span>
            <span className="text-white font-medium">{solariConfigured ? 'Ready' : 'Local'}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0a0a0a] border border-[#1f1f1f] text-[11px] font-mono-code">
            <Cpu className="w-3 h-3 text-[#666666]" />
            <span className="text-[#888888]">MicroVM:</span>
            <span className="text-white font-medium">Linux-6.6</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0a0a0a] border border-[#1f1f1f] text-[11px] font-mono-code">
            <Globe className="w-3 h-3 text-[#666666]" />
            <span className="text-[#888888]">Stealth:</span>
            <span className="text-white font-medium">US-Proxy</span>
          </div>

          <a
            href="https://console.getsolari.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#ffffff] hover:bg-[#eaeaea] text-[#000000] text-xs font-semibold font-mono-code transition-all"
          >
            <span>Console</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </header>
  );
};
