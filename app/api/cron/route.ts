import { NextRequest, NextResponse } from "next/server";
import { getCharacters } from "@/lib/storage";
import { fetchAllProfiles } from "@/lib/raiderio";
import { buildTierList } from "@/lib/tierlist";
import { postTierListToDiscord } from "@/lib/discord";

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

    const profiles = await fetchAllProfiles(tracked);
    const tierList = buildTierList(profiles);
    await postTierListToDiscord(tierList);

    return NextResponse.json({
      success: true,
      posted: profiles.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
