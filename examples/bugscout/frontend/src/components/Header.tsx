'use client';

import React from 'react';
import Image from 'next/image';
import { ExternalLink, Cpu, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  solariConfigured?: boolean;
  models?: { name: string; active: boolean; provider: string }[];
}

export const Header: React.FC<HeaderProps> = ({ solariConfigured = true }) => {
  return (
    <header className="border-b border-[#1c1c1c] bg-[#000000]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Value Prop */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#080808] border border-[#262626] p-0.5 flex items-center justify-center shadow-lg overflow-hidden shrink-0">
            <Image
              src="/logo.png"
              alt="Solari Sentinel"
              width={32}
              height={32}
              className="w-full h-full object-cover rounded-full"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base tracking-tight text-white font-mono-code">
                Solari Sentinel
              </span>
              <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800">
                AI Pentest & Vulnerability Auditor
              </span>
            </div>
            <p className="text-[11px] text-[#777777] hidden sm:block">
              Multi-Model Consensus (Claude + GPT + Gemini) • OWASP Top 10 • Solari MicroVM Verification
            </p>
          </div>
        </div>

        {/* Multi-Model & Solari Status Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Models Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a0a0a] border border-[#222222] text-[11px] font-mono-code text-[#aaaaaa]">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ensemble:</span>
            <span className="text-emerald-400 font-semibold">Gemini 3.5</span>
            <span className="text-[#444444]">|</span>
            <span className="text-amber-400 font-semibold">Claude 3.7</span>
            <span className="text-[#444444]">|</span>
            <span className="text-cyan-400 font-semibold">GPT-4o</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0c0c0c] border border-[#222222] text-xs font-mono-code">
            <ShieldCheck className={`w-3.5 h-3.5 ${solariConfigured ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-[#888888] hidden sm:inline">Solari Cloud:</span>
            <span className="text-white font-medium">{solariConfigured ? 'Ready' : 'Local'}</span>
          </div>

          <a
            href="https://getsolari.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ffffff] hover:bg-[#eaeaea] text-[#000000] text-xs font-bold font-mono-code transition-all"
          >
            <span>Solari</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </header>
  );
};
