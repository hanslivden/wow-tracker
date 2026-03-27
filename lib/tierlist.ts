import type { CharacterProfile, TierEntry, TierLabel, TierList } from "@/types";

/**
 * Scoring model — two separate concerns:
 *
 * 1. TIER ASSIGNMENT: group-relative z-scores.
 *    Characters are ranked against each other, not an external baseline.
 *    This means a 5 ilvl or 341 M+ point gap is always meaningful regardless
 *    of what expansion/season the characters are from.
 *
 * 2. EU PERCENTILE (display only): where the character's M+ score sits vs
 *    the EU active-player population. Uses M+ score only since ilvl ranges
 *    shift drastically between seasons; M+ score is the stable cross-season
 *    signal on Raider.io.
 *
 *    Reference (TWW Season 2, Icy Veins data):
 *      avg +2  player  → IO  305  (~bottom third)
 *      avg +7  player  → IO 1942  (~75th percentile)
 *      avg +10 player  → IO 2420  (~85–90th percentile)
 *    Estimated: mean 1000, σ 750
 */

// ── Weights ──────────────────────────────────────────────────────────────────
const ILVL_WEIGHT  = 0.4;
const MPLUS_WEIGHT = 0.6;

// ── EU M+ population estimate (for percentile badge only) ─────────────────
const EU_MPLUS = { mean: 1000, stdDev: 750 };

// ── Tier thresholds (composite z-score, group-relative) ──────────────────
//   S  ≥ +1.5   top performers in the group
//   A  ≥ +0.5
//   B  ≥ -0.5   around group average
//   C  ≥ -1.5
//   D  ≥ -2.5
//   F  < -2.5   far below group average
const THRESHOLDS: [number, TierLabel][] = [
  [1.5,  "S"],
  [0.5,  "A"],
  [-0.5, "B"],
  [-1.5, "C"],
  [-2.5, "D"],
];

// ── Helpers ───────────────────────────────────────────────────────────────
function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values: number[], mu: number): number {
  const variance = values.reduce((acc, v) => acc + (v - mu) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function zScore(value: number, mu: number, sigma: number): number {
  // If everyone has the same value sigma=0 — treat as z=0 (all equal)
  if (sigma === 0) return 0;
  return (value - mu) / sigma;
}

/** Approximate normal CDF → percentile (0–100). */
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

function assignTier(compositeZ: number): TierLabel {
  for (const [threshold, tier] of THRESHOLDS) {
    if (compositeZ >= threshold) return tier;
  }
  return "F";
}

// ── Public API ────────────────────────────────────────────────────────────
export function buildTierList(characters: CharacterProfile[]): TierList {
  const empty: TierList = { S: [], A: [], B: [], C: [], D: [], F: [] };
  if (characters.length === 0) return empty;

  // Compute group statistics
  const ilvls      = characters.map((c) => c.ilvl);
  const mplusScores = characters.map((c) => c.mplusScore);

  const ilvlMean  = mean(ilvls);
  const ilvlSigma = stdDev(ilvls, ilvlMean);

  const mplusMean  = mean(mplusScores);
  const mplusSigma = stdDev(mplusScores, mplusMean);

  const entries: TierEntry[] = characters
    .map((character) => {
      // Group-relative z-scores
      const ilvlZ  = zScore(character.ilvl,        ilvlMean,  ilvlSigma);
      const mplusZ = zScore(character.mplusScore,   mplusMean, mplusSigma);
      const compositeZ = ilvlZ * ILVL_WEIGHT + mplusZ * MPLUS_WEIGHT;

      // EU percentile based on M+ score only (cross-season stable)
      const euMplusZ   = zScore(character.mplusScore, EU_MPLUS.mean, EU_MPLUS.stdDev);
      const percentile = zToPercentile(euMplusZ);

      return {
        character,
        compositeScore: Math.round(compositeZ * 100) / 100,
        percentile,
        tier: assignTier(compositeZ),
      };
    })
    .sort((a, b) => b.compositeScore - a.compositeScore);

  const tierList: TierList = { ...empty };
  for (const entry of entries) {
    tierList[entry.tier].push(entry);
  }
  return tierList;
}
