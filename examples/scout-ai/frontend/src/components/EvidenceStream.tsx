"use client";

import React, { useState } from "react";
import { EvidenceItem } from "../types";
import { FileText, ExternalLink, Quote, ShieldCheck, Filter, Search } from "lucide-react";

interface EvidenceStreamProps {
  evidenceItems: EvidenceItem[];
}

export const EvidenceStream: React.FC<EvidenceStreamProps> = ({ evidenceItems }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredItems = evidenceItems.filter((item) => {
    const matchesSearch =
      item.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.claim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.evidence_snippet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...Array.from(new Set(evidenceItems.map((e) => e.category)))];

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Grounded Evidence
          </h2>
        </div>
        <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-bold">
          {evidenceItems.length} Captured
        </span>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/40 space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search verified facts & quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/80 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
        {categories.length > 2 && (
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Evidence Cards Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center text-slate-500 text-xs">
            <Quote className="h-6 w-6 mb-2 text-slate-600 animate-pulse" />
            <span>Extracted facts and source quotes will appear here in real-time...</span>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5 transition-all hover:bg-slate-900/80 hover:border-slate-700 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-[11px] font-bold">
                  {item.entity}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                  <ShieldCheck className="h-3 w-3" />
                  {(item.confidence * 100).toFixed(0)}% confidence
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-100 leading-snug">
                {item.claim}
              </p>

              {/* Exact Quote */}
              <div className="relative rounded-lg bg-slate-950/90 border-l-2 border-cyan-400 p-2.5 text-[11px] text-slate-300 italic">
                <Quote className="absolute right-2 top-2 h-3.5 w-3.5 text-slate-700 pointer-events-none" />
                &ldquo;{item.evidence_snippet}&rdquo;
              </div>

              {/* Source Link */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span className="truncate max-w-[200px]" title={item.source_title}>
                  {item.source_title}
                </span>
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-cyan-400 hover:underline shrink-0"
                >
                  Source <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
