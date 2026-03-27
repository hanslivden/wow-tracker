import { NextRequest, NextResponse } from "next/server";
import { fetchCharacterProfile } from "@/lib/raiderio";
import { getCharacters } from "@/lib/storage";
import type { WowRegion } from "@/types";

// GET /api/raiderio?name=&realm=&region=  — fetch single character
// GET /api/raiderio?all=true              — fetch all tracked characters
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  if (searchParams.get("all") === "true") {
    const tracked = await getCharacters();
    const results = await Promise.allSettled(
      tracked.map((c) =>
        fetchCharacterProfile(c.name, c.realm, c.region, c.id)
      )
    );

    const profiles = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<Awaited<ReturnType<typeof fetchCharacterProfile>>>).value);

    const errors = results
      .filter((r) => r.status === "rejected")
      .map((r, i) => ({
        character: tracked[i]?.name,
        error: (r as PromiseRejectedResult).reason?.message,
      }));

    return NextResponse.json({ profiles, errors });
  }

  const name = searchParams.get("name");
  const realm = searchParams.get("realm");
  const region = searchParams.get("region") as WowRegion;

  if (!name || !realm || !region) {
    return NextResponse.json(
      { error: "name, realm, and region are required" },
      { status: 400 }
    );
  }

  try {
    const profile = await fetchCharacterProfile(name, realm, region, "preview");
    return NextResponse.json(profile);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 404 }
    );
  }
}
