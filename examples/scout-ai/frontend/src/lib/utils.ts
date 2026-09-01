import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
  return `${score.toFixed(1)}%`;
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  if (score >= 80) return "text-cyan-400 border-cyan-500/30 bg-cyan-500/10";
  if (score >= 70) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
  return "text-rose-400 border-rose-500/30 bg-rose-500/10";
}

export function getRecommendationBadge(recommendation: string): { label: string; className: string } {
  switch (recommendation.toLowerCase()) {
    case "strong match":
      return { label: "Strong Match", className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
    case "high potential":
      return { label: "High Potential", className: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" };
    case "moderate match":
      return { label: "Moderate Match", className: "bg-amber-500/20 text-amber-300 border-amber-500/40" };
    default:
      return { label: recommendation, className: "bg-slate-500/20 text-slate-300 border-slate-500/40" };
  }
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}
