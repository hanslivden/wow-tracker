"use client";

import Image from "next/image";
import type { CharacterProfile } from "@/types";

const CLASS_COLORS: Record<string, string> = {
  "Death Knight": "#C41E3A",
  "Demon Hunter": "#A330C9",
  Druid: "#FF7C0A",
  Evoker: "#33937F",
  Hunter: "#AAD372",
  Mage: "#3FC7EB",
  Monk: "#00FF98",
  Paladin: "#F48CBA",
  Priest: "#FFFFFF",
  Rogue: "#FFF468",
  Shaman: "#0070DD",
  Warlock: "#8788EE",
  Warrior: "#C69B3A",
};

interface Props {
  character: CharacterProfile;
  onRemove?: (id: string) => void;
  rank?: number;
}

export default function CharacterCard({ character, onRemove, rank }: Props) {
  const classColor = CLASS_COLORS[character.class] ?? "#c8a848";
  const scoreColor = character.mplusScoreColor ?? "#ffffff";

  const ilvlQuality =
    character.ilvl >= 680
      ? "legendary"
      : character.ilvl >= 660
      ? "epic"
      : character.ilvl >= 640
      ? "rare"
      : character.ilvl >= 620
      ? "uncommon"
      : "common";

  return (
    <div
      className={`relative group rounded-lg border border-${ilvlQuality} bg-[#0f172a] overflow-hidden cursor-default
        transition-all duration-200 hover:scale-[1.02] hover:shadow-lg`}
      style={{
        boxShadow: `0 0 12px ${classColor}22`,
      }}
    >
      {/* Rank badge */}
      {rank !== undefined && (
        <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-black/70 border border-[#c8a848] flex items-center justify-center">
          <span className="text-[10px] font-bold text-[#c8a848] font-mono">{rank}</span>
        </div>
      )}

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={() => onRemove(character.id)}
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/70 border border-red-800
            flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150
            hover:border-red-500 cursor-pointer"
          aria-label={`Remove ${character.name}`}
        >
          <svg viewBox="0 0 24 24" className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Avatar */}
      <div className="relative h-20 w-full overflow-hidden">
        {character.thumbnailUrl ? (
          <Image
            src={character.thumbnailUrl}
            alt={character.name}
            fill
            className="object-cover object-top scale-150 translate-y-2"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-[#1e293b] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#334155]" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
      </div>

      {/* Info */}
      <div className="px-3 pb-3 pt-1">
        <a
          href={character.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block font-bold text-sm leading-tight hover:underline cursor-pointer"
          style={{ color: classColor }}
        >
          {character.name}
        </a>
        <p className="text-[11px] text-[#94a3b8] mt-0.5">
          {character.spec} {character.class} · {character.realm}
        </p>

        {/* Stats */}
        <div className="mt-2 flex gap-2">
          <div className="flex-1 bg-black/40 rounded px-2 py-1 text-center border border-[#334155]">
            <p className="text-[9px] text-[#94a3b8] uppercase tracking-widest font-mono">ilvl</p>
            <p className={`text-sm font-bold font-mono text-${ilvlQuality === "legendary" ? "[#ff8000]" : ilvlQuality === "epic" ? "[#a335ee]" : ilvlQuality === "rare" ? "[#0070dd]" : ilvlQuality === "uncommon" ? "[#1eff00]" : "[#9d9d9d]"}`}>
              {character.ilvl}
            </p>
          </div>
          <div className="flex-1 bg-black/40 rounded px-2 py-1 text-center border border-[#334155]">
            <p className="text-[9px] text-[#94a3b8] uppercase tracking-widest font-mono">M+</p>
            <p className="text-sm font-bold font-mono" style={{ color: scoreColor }}>
              {character.mplusScore}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
