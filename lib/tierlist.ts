import type { CharacterProfile, TierEntry, TierLabel, TierList } from "@/types";

/**
 * Scoring model: z-score normalization against EU active M+ population.
 *
 * Reference points (TWW Season 2, Icy Veins / Raider.io data):
 *   avg +2  player  → ilvl 636  /  IO  305   (below-average active player)
 *   avg +7  player  → ilvl 652  /  IO 1942   (~75th percentile)
 *   avg +10 player  → ilvl 662  /  IO 2420   (~85–90th percentile)
 *
 * From those three anchors we estimate the EU active player distribution:
 *   ilvl  : mean 645, σ 13   (5 ilvl ≈ 0.38σ — genuinely meaningful)
 *   M+    : mean 1000, σ 750  (341 pts ≈ 0.45σ — genuinely meaningful)
 *
 * Composite z = ilvlZ × 0.4 + mplusZ × 0.6
 *
 * Tier thresholds (z-score):
 *   S  ≥  2.0   top ~2.5 %  — elite
 *   A  ≥  1.0   top ~16 %   — very strong
 *   B  ≥  0.0   top ~50 %   — above average
 *   C  ≥ -1.0   bottom 50–84 % — below average
 *   D  ≥ -2.0   bottom 2.5–16 % — well below
 *   F  < -2.0   bottom ~2.5 % — far below
 */

const EU = {
  ilvl:  { mean: 645, stdDev: 13 },
  mplus: { mean: 1000, stdDev: 750 },
};

const ILVL_WEIGHT  = 0.4;
const MPLUS_WEIGHT = 0.6;

function zScore(value: number, mean: number, stdDev: number): number {
  return (value - mean) / stdDev;
}

/**
 * Approximation of the normal CDF used to convert z → percentile.
 * Accurate to ~0.5% across the full range.
 */
function zToPercentile(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly =
    t * (0.319381530 +
    t * (-0.356563782 +
    t * (1.781477937 +
    t * (-1.821255978 +
    t * 1.330274429))));
  const p = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z) * poly;
  return Math.round((z >= 0 ? p : 1 - p) * 100);
}

export function computeCompositeScore(ilvl: number, mplusScore: number): {
  composite: number;   // weighted composite z-score (rounded to 2 dp)
  ilvlZ: number;
  mplusZ: number;
  percentile: number;  // estimated EU population percentile
} {
  const ilvlZ  = zScore(ilvl,       EU.ilvl.mean,  EU.ilvl.stdDev);
  const mplusZ = zScore(mplusScore, EU.mplus.mean, EU.mplus.stdDev);
  const composite = Math.round((ilvlZ * ILVL_WEIGHT + mplusZ * MPLUS_WEIGHT) * 100) / 100;
  const percentile = zToPercentile(composite);
  return { composite, ilvlZ, mplusZ, percentile };
}

export function assignTier(compositeZ: number): TierLabel {
  if (compositeZ >=  2.0) return "S";
  if (compositeZ >=  1.0) return "A";
  if (compositeZ >=  0.0) return "B";
  if (compositeZ >= -1.0) return "C";
  if (compositeZ >= -2.0) return "D";
  return "F";
}

export function buildTierList(characters: CharacterProfile[]): TierList {
  const entries: TierEntry[] = characters
    .map((character) => {
      const { composite, percentile } = computeCompositeScore(
        character.ilvl,
        character.mplusScore
      );
      return {
        character,
        compositeScore: composite,
        percentile,
        tier: assignTier(composite),
      };
    })
    .sort((a, b) => b.compositeScore - a.compositeScore);

  const tierList: TierList = { S: [], A: [], B: [], C: [], D: [], F: [] };
  for (const entry of entries) {
    tierList[entry.tier].push(entry);
  }
  return tierList;
}
