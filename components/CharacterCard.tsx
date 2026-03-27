"use client";

import Image from "next/image";
import type { CharacterProfile } from "@/types";

const CLASS_COLORS: Record<string, string> = {
  "Death Knight": "#C41E3A",
  "Demon Hunter": "#A330C9",
  Druid:          "#FF7C0A",
  Evoker:         "#33937F",
  Hunter:         "#AAD372",
  Mage:           "#3FC7EB",
  Monk:           "#00FF98",
  Paladin:        "#F48CBA",
  Priest:         "#FFFFFF",
  Rogue:          "#FFF468",
  Shaman:         "#0070DD",
  Warlock:        "#8788EE",
  Warrior:        "#C69B3A",
};

const ILVL_COLOR = (ilvl: number) => {
  if (ilvl >= 680) return "#ff8000";
  if (ilvl >= 660) return "#a335ee";
  if (ilvl >= 640) return "#0070dd";
  if (ilvl >= 620) return "#1eff00";
  return "#9d9d9d";
};

interface Props {
  character: CharacterProfile;
  onRemove?: (id: string) => void;
  rank?: number;
  percentile?: number; // EU M+ percentile (0–100)
}

export default function CharacterCard({ character, onRemove, rank, percentile }: Props) {
  const classColor  = CLASS_COLORS[character.class] ?? "#c8a848";
  const scoreColor  = character.mplusScoreColor ?? "#ffffff";
  const ilvlColor   = ILVL_COLOR(character.ilvl);

  // "top X%" — how far above average in EU. Clamp so we never show "top 0%" or "top 100%".
  const topPercent  = percentile !== undefined
    ? Math.min(99, Math.max(1, 100 - percentile))
    : null;

  return (
    <div
      className="relative group rounded-lg overflow-hidden cursor-default
        transition-all duration-200 hover:scale-[1.02]"
      style={{
        background: "#0f172a",
        border: `1px solid ${classColor}44`,
        boxShadow: `0 0 14px ${classColor}18`,
      }}
    >
      {/* Rank badge */}
      {rank !== undefined && (
        <div
          className="absolute top-2 left-2 z-10 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.75)", border: "1px solid #c8a848" }}
        >
          <span className="text-[9px] font-bold text-[#c8a848]">{rank}</span>
        </div>
      )}

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={() => onRemove(character.id)}
          className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full
            flex items-center justify-center opacity-0 group-hover:opacity-100
            transition-opacity duration-150 cursor-pointer"
          style={{ background: "rgba(0,0,0,0.75)", border: "1px solid #7f1d1d" }}
          aria-label={`Remove ${character.name}`}
        >
          <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-red-400" fill="none" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Avatar — fixed 56×56, no upscaling */}
      <div className="relative h-14 w-full overflow-hidden bg-[#1e293b]">
        {character.thumbnailUrl ? (
          <Image
            src={character.thumbnailUrl}
            alt={`${character.name} avatar`}
            fill
            className="object-cover object-top"
            style={{ imageRendering: "auto" }}
            unoptimized
            sizes="160px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#334155]" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent" />
      </div>

      {/* Info */}
      <div className="px-3 pb-3 pt-1.5">
        {/* Name */}
        <a
          href={character.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block font-semibold text-sm leading-tight hover:underline cursor-pointer truncate"
          style={{ color: classColor, fontFamily: "var(--font-display)" }}
        >
          {character.name}
        </a>

        {/* Spec · Class · Realm */}
        <p className="text-[11px] text-[#64748b] mt-0.5 leading-snug truncate">
          {character.spec} {character.class}
        </p>
        <p className="text-[10px] text-[#475569] truncate">{character.realm}</p>

        {/* Stats row */}
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <div
            className="rounded px-1.5 py-1 text-center"
            style={{ background: "rgba(0,0,0,0.4)", border: "1px solid #1e293b" }}
          >
            <p className="text-[8px] text-[#475569] uppercase tracking-widest font-medium">ilvl</p>
            <p className="text-sm font-bold leading-none mt-0.5 tabular-nums" style={{ color: ilvlColor }}>
              {character.ilvl}
            </p>
          </div>
          <div
            className="rounded px-1.5 py-1 text-center"
            style={{ background: "rgba(0,0,0,0.4)", border: "1px solid #1e293b" }}
          >
            <p className="text-[8px] text-[#475569] uppercase tracking-widest font-medium">M+</p>
            <p className="text-sm font-bold leading-none mt-0.5 tabular-nums" style={{ color: scoreColor }}>
              {character.mplusScore}
            </p>
          </div>
        </div>

        {/* EU percentile */}
        {topPercent !== null && (
          <p className="mt-1.5 text-center text-[9px] text-[#475569]">
            top{" "}
            <span style={{ color: "#c8a848" }} className="font-semibold">
              {topPercent}%
            </span>{" "}
            EU
          </p>
        )}
      </div>
    </div>
  );
}
