export type WowRegion = "eu" | "us" | "kr" | "tw";

export interface TrackedCharacter {
  id: string;
  name: string;
  realm: string;
  region: WowRegion;
  addedAt: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  realm: string;
  region: WowRegion;
  class: string;
  spec: string;
  ilvl: number;
  mplusScore: number;
  mplusScoreColor: string;
  thumbnailUrl: string;
  profileUrl: string;
  lastUpdated: string;
}

export type TierLabel = "S" | "A" | "B" | "C" | "D";

export interface TierEntry {
  character: CharacterProfile;
  compositeScore: number;
  tier: TierLabel;
}

export interface TierList {
  S: TierEntry[];
  A: TierEntry[];
  B: TierEntry[];
  C: TierEntry[];
  D: TierEntry[];
}

// Raider.io API response shape (partial)
export interface RaiderIOResponse {
  name: string;
  race: string;
  class: string;
  active_spec_name: string;
  realm: string;
  region: string;
  thumbnail_url: string;
  profile_url: string;
  gear: {
    item_level_equipped: number;
    item_level_total: number;
  };
  mythic_plus_scores_by_season: Array<{
    season: string;
    scores: {
      all: number;
      dps: number;
      healer: number;
      tank: number;
    };
    segments: {
      all: { score: number; color: string };
    };
  }>;
}
