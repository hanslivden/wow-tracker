/**
 * One-shot manual Discord post — runs immediately and exits.
 * Usage: npm run post-now
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { getCharacters } from "../lib/storage";
import { fetchAllProfiles } from "../lib/raiderio";
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
  const profiles = await fetchAllProfiles(tracked);

  console.log(`Building tier list...`);
  const tierList = buildTierList(profiles);

  console.log("Posting to Discord...");
  await postTierListToDiscord(tierList);

  console.log(`Done. Posted ${profiles.length} character(s).`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
