import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import cron from "node-cron";
import { getCharacters } from "../lib/storage";
import { fetchCharacterProfile } from "../lib/raiderio";
import { buildTierList } from "../lib/tierlist";
import { postTierListToDiscord } from "../lib/discord";

async function runPost() {
  const ts = new Date().toISOString();
  console.log(`[${ts}] Running scheduled Discord tier list post...`);

  try {
    const tracked = await getCharacters();

    if (tracked.length === 0) {
      console.log(`[${ts}] No characters tracked — skipping.`);
      return;
    }

    const results = await Promise.allSettled(
      tracked.map((c) => fetchCharacterProfile(c.name, c.realm, c.region, c.id))
    );

    const profiles = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<ReturnType<typeof fetchCharacterProfile> extends Promise<infer T> ? T : never>).value);

    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      console.warn(`[${ts}] ${failed.length} character(s) failed to fetch.`);
    }

    const tierList = buildTierList(profiles);
    await postTierListToDiscord(tierList);

    console.log(`[${ts}] Posted ${profiles.length} character(s) to Discord.`);
  } catch (err) {
    console.error(`[${ts}] Cron job failed:`, (err as Error).message);
  }
}

// Every Wednesday at 08:00 CET (Europe/Berlin handles CET/CEST automatically)
cron.schedule("0 8 * * 3", runPost, {
  timezone: "Europe/Berlin",
});

console.log("WoW Tracker cron running. Next post: Wednesday 08:00 CET");
console.log('Run "npm run post-now" to trigger a manual post.');
