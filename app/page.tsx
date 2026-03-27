"use client";

import { useCallback, useEffect, useState } from "react";
import type { CharacterProfile, TierList as TierListType } from "@/types";
import { buildTierList } from "@/lib/tierlist";
import TierList from "@/components/TierList";
import AddCharacterModal from "@/components/AddCharacterModal";
import DiscordPanel from "@/components/DiscordPanel";

export default function HomePage() {
  const [profiles, setProfiles] = useState<CharacterProfile[]>([]);
  const [tierList, setTierList] = useState<TierListType>({ S: [], A: [], B: [], C: [], D: [], F: [] });
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/raiderio?all=true");
      const data = await res.json();
      const fetched: CharacterProfile[] = data.profiles ?? [];
      setProfiles(fetched);
      setTierList(buildTierList(fetched));
    } catch {
      setError("Failed to load character data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleRemove(id: string) {
    // Optimistic update
    const next = profiles.filter((p) => p.id !== id);
    setProfiles(next);
    setTierList(buildTierList(next));

    await fetch(`/api/characters/${id}`, { method: "DELETE" });
  }

  const totalChars = profiles.length;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Header */}
      <header
        className="border-b border-[#1e293b] px-4 py-4"
        style={{
          background: "linear-gradient(180deg, #0f172a 0%, rgba(2,6,23,0) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3">
            {/* WoW-style crossed swords icon */}
            <div className="relative">
              <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
                <path d="M8 8L32 32M32 8L8 32" stroke="#c8a848" strokeWidth="3" strokeLinecap="round" />
                <circle cx="20" cy="20" r="4" fill="#c8a848" opacity="0.3" />
                <circle cx="20" cy="20" r="2" fill="#c8a848" />
              </svg>
              <div
                className="absolute inset-0 rounded-full blur-md opacity-40"
                style={{ background: "#c8a848" }}
              />
            </div>
            <div>
              <h1
                className="text-xl font-bold leading-none"
                style={{ color: "#c8a848", textShadow: "0 0 12px rgba(200,168,72,0.6)", fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}
              >
                WoW Tracker
              </h1>
              <p className="text-xs font-mono text-[#94a3b8] mt-0.5">
                {totalChars > 0
                  ? `Tracking ${totalChars} character${totalChars !== 1 ? "s" : ""}`
                  : "No characters tracked"}
              </p>
            </div>
          </div>

          <div className="sm:ml-auto flex items-center gap-2">
            {/* Refresh */}
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#334155] bg-[#0f172a]
                text-xs font-mono text-[#94a3b8] hover:border-[#c8a848] hover:text-[#c8a848]
                transition-all duration-150 disabled:opacity-40 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? "Loading..." : "Refresh"}
            </button>

            {/* Add character */}
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#c8a848] text-[#020617]
                text-xs font-bold font-mono hover:bg-[#ffd700] transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Character
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg border border-red-900 bg-red-950/40 text-red-400 text-sm font-mono">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Tier list */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-bold font-mono text-[#94a3b8] uppercase tracking-widest">
                Tier List
              </h2>
              <div className="flex-1 h-px bg-[#1e293b]" />
              <span className="text-[10px] font-mono text-[#475569]">ilvl 40% · M+ 60%</span>
            </div>
            <TierList tierList={tierList} onRemove={handleRemove} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <DiscordPanel characterCount={totalChars} />

            {/* Legend */}
            <div className="rounded-xl border border-[#334155] bg-[#0f172a] p-4">
              <h3 className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-display)" }}>
                Scoring
              </h3>
              <p className="text-[9px] text-[#475569] mb-2 leading-relaxed">
                Ranked relative to your group.<br />
                ilvl × 0.4 + M+ × 0.6
              </p>
              <div className="space-y-1.5 text-xs">
                {[
                  { tier: "S", label: "Top of group",    sub: "z ≥ +1.5", color: "#ffd700" },
                  { tier: "A", label: "Above average",   sub: "z ≥ +0.5", color: "#a335ee" },
                  { tier: "B", label: "Around average",  sub: "z ≥ −0.5", color: "#0070dd" },
                  { tier: "C", label: "Below average",   sub: "z ≥ −1.5", color: "#1eff00" },
                  { tier: "D", label: "Well below",      sub: "z ≥ −2.5", color: "#9d9d9d" },
                  { tier: "F", label: "Bottom of group", sub: "z < −2.5", color: "#c41e3a" },
                ].map((row) => (
                  <div key={row.tier} className="flex items-center gap-2">
                    <span className="w-5 font-bold" style={{ color: row.color, fontFamily: "var(--font-display)" }}>{row.tier}</span>
                    <span className="text-[#94a3b8] text-[11px]">{row.label}</span>
                    <span className="text-[#334155] text-[10px] ml-auto">{row.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add character modal */}
      {showAdd && (
        <AddCharacterModal
          onClose={() => setShowAdd(false)}
          onAdded={refresh}
        />
      )}
    </div>
  );
}
