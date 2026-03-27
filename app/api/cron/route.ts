import { NextRequest, NextResponse } from "next/server";
import { getCharacters } from "@/lib/storage";
import { fetchCharacterProfile } from "@/lib/raiderio";
import { buildTierList } from "@/lib/tierlist";
import { postTierListToDiscord } from "@/lib/discord";

// This endpoint is called by a cron job (e.g., Vercel Cron or external scheduler).
// Protect it with a shared secret in the Authorization header.
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tracked = await getCharacters();

    if (tracked.length === 0) {
      return NextResponse.json({ message: "No characters to post" });
    }

    const results = await Promise.allSettled(
      tracked.map((c) => fetchCharacterProfile(c.name, c.realm, c.region, c.id))
    );

    const profiles = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<Awaited<ReturnType<typeof fetchCharacterProfile>>>).value);

    const tierList = buildTierList(profiles);
    await postTierListToDiscord(tierList);

    return NextResponse.json({
      success: true,
      posted: profiles.length,
      skipped: tracked.length - profiles.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
