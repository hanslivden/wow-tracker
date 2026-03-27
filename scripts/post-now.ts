/**
 * One-shot manual Discord post — runs immediately and exits.
 * Usage: npm run post-now
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { getCharacters } from "../lib/storage";
import { fetchCharacterProfile } from "../lib/raiderio";
import { buildTierList } from "../lib/tierlist";
import { postTierListToDiscord } from "../lib/discord";

async function main() {
  console.log("Fetching characters...");
  const tracked = await getCharacters();

  if (tracked.length === 0) {
    console.log("No characters tracked. Add some via the web UI first.");
    process.exit(0);
  }

  console.log(`Fetching profiles for ${tracked.length} character(s)...`);
  const results = await Promise.allSettled(
    tracked.map((c) => fetchCharacterProfile(c.name, c.realm, c.region, c.id))
  );

  const profiles = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<ReturnType<typeof fetchCharacterProfile> extends Promise<infer T> ? T : never>).value);

  results
    .filter((r) => r.status === "rejected")
    .forEach((r, i) => {
      console.warn(`  Failed: ${tracked[i]?.name} — ${(r as PromiseRejectedResult).reason?.message}`);
    });

  console.log(`Building tier list from ${profiles.length} profile(s)...`);
  const tierList = buildTierList(profiles);

  console.log("Posting to Discord...");
  await postTierListToDiscord(tierList);

  console.log("Done.");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
