import type { TierList } from "@/types";
import { generateTierListImage } from "@/lib/generateTierImage";

export async function postTierListToDiscord(tierList: TierList): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) throw new Error("DISCORD_WEBHOOK_URL is not set");

  const totalChars = Object.values(tierList).flat().length;
  if (totalChars === 0) throw new Error("No characters in tier list");

  // Render tier list to PNG
  const imageBuffer = await generateTierListImage(tierList);

  // Send as a file attachment so Discord displays it inline
  const form = new FormData();
  form.append(
    "payload_json",
    JSON.stringify({
      username: "WoW Tracker",
      content: `**⚔️ Weekly Tier List** — ${totalChars} characters ranked`,
    })
  );
  form.append(
    "files[0]",
    new Blob([imageBuffer], { type: "image/png" }),
    "tierlist.png"
  );

  const res = await fetch(webhookUrl, { method: "POST", body: form });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord webhook failed (${res.status}): ${text}`);
  }
}
