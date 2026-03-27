"use client";

import type { TierList as TierListType, TierLabel } from "@/types";
import CharacterCard from "./CharacterCard";

const TIER_CONFIG: Record<TierLabel, { label: string; color: string; bg: string }> = {
  S: { label: "S", color: "#ffd700", bg: "rgba(255,215,0,0.08)" },
  A: { label: "A", color: "#a335ee", bg: "rgba(163,53,238,0.08)" },
  B: { label: "B", color: "#0070dd", bg: "rgba(0,112,221,0.08)" },
  C: { label: "C", color: "#1eff00", bg: "rgba(30,255,0,0.06)" },
  D: { label: "D", color: "#9d9d9d", bg: "rgba(157,157,157,0.06)" },
};

interface Props {
  tierList: TierListType;
  onRemove?: (id: string) => void;
}

export default function TierList({ tierList, onRemove }: Props) {
  const tiers: TierLabel[] = ["S", "A", "B", "C", "D"];

  const hasAny = tiers.some((t) => tierList[t].length > 0);
  if (!hasAny) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#94a3b8]">
        <svg viewBox="0 0 24 24" className="w-12 h-12 mb-3 opacity-30" fill="currentColor">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z" />
        </svg>
        <p className="font-mono text-sm">No characters tracked yet.</p>
        <p className="text-xs mt-1 opacity-60">Add characters using the button above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tiers.map((tier) => {
        const entries = tierList[tier];
        const config = TIER_CONFIG[tier];
        return (
          <div
            key={tier}
            className="rounded-lg border border-[#1e293b] overflow-hidden"
            style={{ background: config.bg }}
          >
            {/* Tier label row */}
            <div
              className="flex items-center gap-3 px-4 py-2 border-b border-[#1e293b]"
            >
              <span
                className="text-2xl font-bold font-mono w-8 text-center leading-none"
                style={{
                  color: config.color,
                  textShadow: `0 0 10px ${config.color}88`,
                }}
              >
                {config.label}
              </span>
              <div className="h-px flex-1 opacity-20" style={{ background: config.color }} />
              <span className="text-xs font-mono text-[#94a3b8]">
                {entries.length} {entries.length === 1 ? "character" : "characters"}
              </span>
            </div>

            {/* Characters grid */}
            {entries.length > 0 ? (
              <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {entries.map((entry, i) => (
                  <CharacterCard
                    key={entry.character.id}
                    character={entry.character}
                    onRemove={onRemove}
                    rank={i + 1}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-[#475569] py-3 font-mono">— empty —</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
