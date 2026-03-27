import { NextResponse } from "next/server";
import { getCharacters } from "@/lib/storage";
import { fetchCharacterProfile } from "@/lib/raiderio";
import { buildTierList } from "@/lib/tierlist";
import { postTierListToDiscord } from "@/lib/discord";

export async function POST() {
  try {
    const tracked = await getCharacters();

    if (tracked.length === 0) {
      return NextResponse.json(
        { error: "No characters tracked yet" },
        { status: 400 }
      );
    }

    const results = await Promise.allSettled(
      tracked.map((c) => fetchCharacterProfile(c.name, c.realm, c.region, c.id))
    );

    const profiles = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<Awaited<ReturnType<typeof fetchCharacterProfile>>>).value);

    if (profiles.length === 0) {
      return NextResponse.json(
        { error: "Could not fetch any character profiles" },
        { status: 502 }
      );
    }

    const tierList = buildTierList(profiles);
    await postTierListToDiscord(tierList);

    return NextResponse.json({
      success: true,
      posted: profiles.length,
      skipped: tracked.length - profiles.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
