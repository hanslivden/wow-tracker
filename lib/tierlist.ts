import type { CharacterProfile, TierEntry, TierLabel, TierList } from "@/types";

// Scoring weights
const ILVL_WEIGHT = 0.4;
const MPLUS_WEIGHT = 0.6;

// Approximate current-season ranges for normalization
const ILVL_MIN = 580;
const ILVL_MAX = 700;
const MPLUS_MIN = 0;
const MPLUS_MAX = 4000;

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

export function computeCompositeScore(
  ilvl: number,
  mplusScore: number
): number {
  const ilvlNorm = normalize(ilvl, ILVL_MIN, ILVL_MAX);
  const mplusNorm = normalize(mplusScore, MPLUS_MIN, MPLUS_MAX);
  return Math.round((ilvlNorm * ILVL_WEIGHT + mplusNorm * MPLUS_WEIGHT) * 1000) / 10;
}

export function assignTier(compositeScore: number): TierLabel {
  if (compositeScore >= 80) return "S";
  if (compositeScore >= 60) return "A";
  if (compositeScore >= 40) return "B";
  if (compositeScore >= 20) return "C";
  return "D";
}

export function buildTierList(characters: CharacterProfile[]): TierList {
  const entries: TierEntry[] = characters
    .map((character) => {
      const compositeScore = computeCompositeScore(
        character.ilvl,
        character.mplusScore
      );
      return {
        character,
        compositeScore,
        tier: assignTier(compositeScore),
      };
    })
    .sort((a, b) => b.compositeScore - a.compositeScore);

  const tierList: TierList = { S: [], A: [], B: [], C: [], D: [] };
  for (const entry of entries) {
    tierList[entry.tier].push(entry);
  }
  return tierList;
}
