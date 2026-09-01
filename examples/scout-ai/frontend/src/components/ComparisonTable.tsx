"use client";

import React, { useState } from "react";
import { ComparisonMatrix } from "../types";
import { ArrowUpDown, Search, Table as TableIcon } from "lucide-react";
import { getRecommendationBadge } from "../lib/utils";

interface ComparisonTableProps {
  matrix: ComparisonMatrix;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ matrix }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(false);

  const columns = matrix.columns || [];
  let rows = [...(matrix.rows || [])];

  if (searchTerm) {
    rows = rows.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }

  if (sortColumn) {
    rows.sort((a, b) => {
      const valA = a[sortColumn] ?? "";
      const valB = b[sortColumn] ?? "";
      if (typeof valA === "number" && typeof valB === "number") {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortColumn(col);
      setSortAsc(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md overflow-hidden shadow-xl">
      {/* Header & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-4 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <TableIcon className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Comparative Matrix (Calculated in Sandbox)</h3>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filter matrix..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/90 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-4 py-3 cursor-pointer hover:text-cyan-300 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col}</span>
                    <ArrowUpDown className="h-3 w-3 opacity-60" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-slate-500">
                  No matching entries found.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={idx}
                  className="transition-colors hover:bg-slate-800/40 font-normal"
                >
                  {columns.map((col) => {
                    const value = row[col];
                    const isRecommendation = col.toLowerCase().includes("recommendation");

                    return (
                      <td key={col} className="px-4 py-3 whitespace-nowrap">
                        {isRecommendation ? (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                              getRecommendationBadge(String(value)).className
                            }`}
                          >
                            {String(value)}
                          </span>
                        ) : (
                          <span className="font-medium text-slate-200">{String(value ?? "-")}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {matrix.summary && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400">
          <strong className="text-slate-300">Summary:</strong> {matrix.summary}
        </div>
      )}
    </div>
  );
};
