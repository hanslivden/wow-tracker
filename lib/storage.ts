import fs from "fs/promises";
import path from "path";
import type { TrackedCharacter } from "@/types";

const DATA_FILE = path.join(process.cwd(), "data", "characters.json");

async function ensureFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([]));
  }
}

export async function getCharacters(): Promise<TrackedCharacter[]> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw) as TrackedCharacter[];
}

export async function addCharacter(
  character: TrackedCharacter
): Promise<TrackedCharacter[]> {
  const list = await getCharacters();

  const exists = list.some(
    (c) =>
      c.name.toLowerCase() === character.name.toLowerCase() &&
      c.realm.toLowerCase() === character.realm.toLowerCase() &&
      c.region === character.region
  );
  if (exists) throw new Error("Character already tracked");

  list.push(character);
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2));
  return list;
}

export async function removeCharacter(id: string): Promise<TrackedCharacter[]> {
  const list = await getCharacters();
  const next = list.filter((c) => c.id !== id);
  await fs.writeFile(DATA_FILE, JSON.stringify(next, null, 2));
  return next;
}
