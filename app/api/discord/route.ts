import { NextResponse } from "next/server";
import { getCharacters } from "@/lib/storage";
import { fetchAllProfiles } from "@/lib/raiderio";
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

    const profiles = await fetchAllProfiles(tracked);
    const tierList = buildTierList(profiles);
    await postTierListToDiscord(tierList);

    return NextResponse.json({ success: true, posted: profiles.length });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
