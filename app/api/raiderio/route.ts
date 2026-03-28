import { NextRequest, NextResponse } from "next/server";
import { fetchCharacterProfile, fetchAllProfiles } from "@/lib/raiderio";
import { getCharacters } from "@/lib/storage";
import type { WowRegion } from "@/types";

// GET /api/raiderio?name=&realm=&region=  — fetch single character
// GET /api/raiderio?all=true              — fetch all tracked characters
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  if (searchParams.get("all") === "true") {
    const tracked = await getCharacters();
    const profiles = await fetchAllProfiles(tracked);
    return NextResponse.json({ profiles });
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
