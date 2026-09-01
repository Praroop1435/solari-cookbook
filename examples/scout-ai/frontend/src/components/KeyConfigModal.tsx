"use client";

import React, { useState } from "react";
import { Key, X, Check, ExternalLink, Shield } from "lucide-react";
import { updateRuntimeKeys } from "../lib/api";

interface KeyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialSolariConfigured?: boolean;
  initialGeminiConfigured?: boolean;
}

export const KeyConfigModal: React.FC<KeyConfigModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialSolariConfigured,
  initialGeminiConfigured,
}) => {
  const [solariKey, setSolariKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");
    try {
      await updateRuntimeKeys(
        solariKey.trim() || undefined,
        geminiKey.trim() || undefined
      );
      setSaveSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSaveSuccess(false);
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save keys");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-cyan-950/40">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Runtime Infrastructure Keys</h3>
              <p className="text-xs text-slate-400">Keys are kept in memory for your local session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* Solari API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                <span>Solari API Key</span>
                {initialSolariConfigured && (
                  <span className="rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 text-[10px]">
                    Active
                  </span>
                )}
              </label>
              <a
                href="https://console.getsolari.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                Get Solari key <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="slr_live_..."
              value={solariKey}
              onChange={(e) => setSolariKey(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Powers Solari Cloud Browser with stealth/residential proxy & MicroVM Sandboxes.
            </p>
          </div>

          {/* Google Gemini API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                <span>Google Gemini API Key (Flash Lite)</span>
                {initialGeminiConfigured && (
                  <span className="rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 text-[10px]">
                    Active
                  </span>
                )}
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                Get Gemini key <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Runs ultra-fast structured planning, fact extraction, and report synthesis on Gemini 2.0 Flash Lite.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3 flex items-start gap-2 text-xs text-slate-400">
            <Shield className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>Keys can also be configured via <code className="text-cyan-300 font-mono">backend/.env</code> using <code className="text-cyan-300 font-mono">SOLARI_API_KEY</code> and <code className="text-cyan-300 font-mono">GEMINI_API_KEY</code>.</span>
          </div>

          {errorMsg && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-400">
              {errorMsg}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors disabled:opacity-50 shadow-md shadow-cyan-500/20"
            >
              {saveSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5 text-slate-950" />
                  <span>Saved!</span>
                </>
              ) : isSaving ? (
                <span>Updating...</span>
              ) : (
                <span>Update Keys</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
