"use client";

import React, { useEffect, useState } from "react";
import { ResearchTask } from "../types";
import { fetchTaskHistory } from "../lib/api";
import { History, X, ArrowRight, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { formatDate } from "../lib/utils";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (taskId: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTask,
}) => {
  const [tasks, setTasks] = useState<ResearchTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchTaskHistory()
        .then((t) => setTasks(t))
        .catch(() => setTasks([]))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="h-full w-full max-w-md border-l border-slate-800 bg-slate-900 p-6 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Research History</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-xs text-slate-500">
              Loading past research runs...
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center text-xs text-slate-500">
              <Clock className="h-6 w-6 text-slate-600 mb-2" />
              <span>No research tasks found yet. Start a new research task to see history.</span>
            </div>
          ) : (
            tasks.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  onSelectTask(t.id);
                  onClose();
                }}
                className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition-all hover:bg-slate-950 hover:border-cyan-500/50 hover:shadow-lg space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                      t.status === "COMPLETED"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : t.status === "FAILED"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    }`}
                  >
                    {t.status}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {formatDate(t.created_at)}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {t.objective}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                  <span>{t.is_demo ? "Demo Replay" : "Live Exploration"}</span>
                  <span className="flex items-center gap-1 text-cyan-400 group-hover:translate-x-0.5 transition-transform font-medium">
                    Open <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
