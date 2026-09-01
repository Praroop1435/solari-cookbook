"use client";

import React, { useState } from "react";
import { EvidenceItem } from "../types";
import { ShieldCheck, Search, ExternalLink, Quote, Sparkles } from "lucide-react";

interface EvidenceVaultProps {
  evidenceList: EvidenceItem[];
}

export const EvidenceVault: React.FC<EvidenceVaultProps> = ({ evidenceList }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<string>("all");

  const entities = ["all", ...Array.from(new Set(evidenceList.map((e) => e.entity)))];

  const filtered = evidenceList.filter((item) => {
    const matchesSearch =
      item.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.claim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.evidence_snippet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = selectedEntity === "all" || item.entity === selectedEntity;
    return matchesSearch && matchesEntity;
  });

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-5 shadow-xl space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Grounded Evidence Vault</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Every conclusion is auditable with direct webpage quotations, timestamps, and confidence scores.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search evidence claims..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Entity Pills Filter */}
      {entities.length > 2 && (
        <div className="flex flex-wrap gap-1.5">
          {entities.map((ent) => (
            <button
              key={ent}
              type="button"
              onClick={() => setSelectedEntity(ent)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                selectedEntity === ent
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                  : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              {ent}
            </button>
          ))}
        </div>
      )}

      {/* Grid of Evidence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-500 text-xs">
            No evidence matches your search.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 transition-all hover:bg-slate-950 hover:border-slate-700 space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-xs font-bold">
                    {item.entity}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {(item.confidence * 100).toFixed(0)}% verified
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-slate-100 leading-snug">
                  {item.claim}
                </h4>

                <div className="relative rounded-lg bg-slate-900/80 border-l-2 border-cyan-400 p-2.5 text-xs text-slate-300 italic leading-relaxed">
                  <Quote className="absolute right-2 top-2 h-3.5 w-3.5 text-slate-700 pointer-events-none" />
                  &ldquo;{item.evidence_snippet}&rdquo;
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                <span className="truncate max-w-[220px]" title={item.source_title}>
                  {item.source_title}
                </span>
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-cyan-400 hover:underline shrink-0 font-medium"
                >
                  View Source <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
