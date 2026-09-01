'use client';

import React from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

interface HeaderProps {
  solariConfigured?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ solariConfigured = true }) => {
  return (
    <header className="border-b border-[#1c1c1c] bg-[#000000]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Value Prop */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#080808] border border-[#262626] p-0.5 flex items-center justify-center shadow-lg overflow-hidden">
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
              <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded bg-[#141414] text-[#aaaaaa] border border-[#262626]">
                Autonomous QA
              </span>
            </div>
            <p className="text-[11px] text-[#777777] hidden sm:block">
              Give it any URL → Traps bugs with Stealth Browsers → Verifies in MicroVM Sandboxes
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0c0c0c] border border-[#222222] text-xs font-mono-code">
            <div className={`w-2 h-2 rounded-full ${solariConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-[#888888] hidden sm:inline">Cloud Engine:</span>
            <span className="text-white font-medium">{solariConfigured ? 'Active' : 'Local'}</span>
          </div>

          <a
            href="https://getsolari.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ffffff] hover:bg-[#eaeaea] text-[#000000] text-xs font-bold font-mono-code transition-all"
          >
            <span>Powered by Solari</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </header>
  );
};
