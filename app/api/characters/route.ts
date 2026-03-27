import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { addCharacter, getCharacters } from "@/lib/storage";
import type { TrackedCharacter, WowRegion } from "@/types";

export async function GET() {
  try {
    const characters = await getCharacters();
    return NextResponse.json(characters);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, realm, region } = body as Partial<TrackedCharacter>;

    if (!name || !realm || !region) {
      return NextResponse.json(
        { error: "name, realm, and region are required" },
        { status: 400 }
      );
    }

    const character: TrackedCharacter = {
      id: uuidv4(),
      name: name.trim(),
      realm: realm.trim().toLowerCase().replace(/\s+/g, "-"),
      region: region as WowRegion,
      addedAt: new Date().toISOString(),
    };

    const updated = await addCharacter(character);
    return NextResponse.json(updated, { status: 201 });
  } catch (err) {
    const message = (err as Error).message;
    const status = message === "Character already tracked" ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
