import type { CharacterProfile, RaiderIOResponse, WowRegion } from "@/types";

const RAIDERIO_BASE = "https://raider.io/api/v1";

const FIELDS = [
  "gear",
  "mythic_plus_scores_by_season:current",
  "class",
  "active_spec_name",
  "profile_url",
  "thumbnail_url",
].join(",");

export async function fetchCharacterProfile(
  name: string,
  realm: string,
  region: WowRegion,
  id: string
): Promise<CharacterProfile> {
  const url = new URL(`${RAIDERIO_BASE}/characters/profile`);
  url.searchParams.set("region", region);
  url.searchParams.set("realm", realm);
  url.searchParams.set("name", name);
  url.searchParams.set("fields", FIELDS);

  const res = await fetch(url.toString(), {
    next: { revalidate: 300 }, // cache 5 min
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ||
        `Raider.io returned ${res.status} for ${name}-${realm}`
    );
  }

  const data: RaiderIOResponse = await res.json();

  const currentSeason = data.mythic_plus_scores_by_season?.[0];
  const mplusScore = currentSeason?.scores?.all ?? 0;
  const mplusScoreColor = currentSeason?.segments?.all?.color ?? "#ffffff";

  return {
    id,
    name: data.name,
    realm: data.realm,
    region: data.region as WowRegion,
    class: data.class,
    spec: data.active_spec_name,
    ilvl: data.gear?.item_level_equipped ?? 0,
    mplusScore,
    mplusScoreColor,
    thumbnailUrl: data.thumbnail_url,
    profileUrl: data.profile_url,
    lastUpdated: new Date().toISOString(),
  };
}
