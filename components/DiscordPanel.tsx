"use client";

import { useState } from "react";

interface Props {
  characterCount: number;
}

export default function DiscordPanel({ characterCount }: Props) {
  const [posting, setPosting] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handlePost() {
    setPosting(true);
    setLastResult(null);

    try {
      const res = await fetch("/api/discord", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to post");

      setLastResult({
        success: true,
        message: `Posted ${data.posted} characters to Discord${data.skipped ? ` (${data.skipped} skipped)` : ""}.`,
      });
    } catch (err) {
      setLastResult({ success: false, message: (err as Error).message });
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#334155] bg-[#0f172a] p-4">
      <div className="flex items-center gap-2 mb-3">
        {/* Discord icon */}
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#5865F2">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
        </svg>
        <h3 className="font-bold font-mono text-sm text-[#f8fafc]">Discord Integration</h3>
      </div>

      <p className="text-xs text-[#94a3b8] font-mono mb-3 leading-relaxed">
        Post the current tier list to your Discord channel via webhook.
        Also runs every <span className="text-[#c8a848]">Wednesday at 08:00 CET</span> via cron.
      </p>

      {/* Cron info */}
      <div className="mb-3 px-3 py-2 rounded-lg bg-[#1e293b] border border-[#334155]">
        <p className="text-[10px] font-mono text-[#94a3b8] uppercase tracking-widest mb-1">Cron Schedule</p>
        <p className="text-xs font-mono text-[#c8a848]">0 7 * * 3 — Wednesdays at 08:00 CET</p>
        <p className="text-[10px] text-[#475569] font-mono mt-1">
          Set <code className="text-[#94a3b8]">CRON_SECRET</code> + <code className="text-[#94a3b8]">DISCORD_WEBHOOK_URL</code> in env
        </p>
      </div>

      {lastResult && (
        <div
          className={`mb-3 px-3 py-2 rounded-lg text-xs font-mono border ${
            lastResult.success
              ? "bg-green-950/40 border-green-800 text-green-400"
              : "bg-red-950/40 border-red-900 text-red-400"
          }`}
        >
          {lastResult.message}
        </div>
      )}

      <button
        onClick={handlePost}
        disabled={posting || characterCount === 0}
        className="w-full py-2 rounded-lg font-bold font-mono text-sm transition-all duration-150 cursor-pointer
          bg-[#5865F2] text-white hover:bg-[#4752C4]
          disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {posting ? "Posting..." : "Post Tier List Now"}
      </button>

      {characterCount === 0 && (
        <p className="text-[10px] text-[#475569] font-mono text-center mt-1">Add characters first</p>
      )}
    </div>
  );
}
