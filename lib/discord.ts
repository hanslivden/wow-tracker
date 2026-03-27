import type { TierList } from "@/types";

const TIER_COLORS: Record<string, number> = {
  S: 0xffd700, // Gold
  A: 0xa335ee, // Epic purple
  B: 0x0070dd, // Rare blue
  C: 0x1eff00, // Uncommon green
  D: 0x9d9d9d, // Common grey
  F: 0xc41e3a, // Death Knight red
};

const TIER_EMOJI: Record<string, string> = {
  S: "👑",
  A: "⚔️",
  B: "🛡️",
  C: "🗡️",
  D: "💀",
  F: "🪦",
};

function formatTierField(
  tier: string,
  entries: TierList[keyof TierList]
): object | null {
  if (entries.length === 0) return null;

  const lines = entries.map((e, i) => {
    const rank = i + 1;
    const score = e.compositeScore.toFixed(1);
    return `\`${rank}.\` **${e.character.name}** — ${e.character.realm} | ilvl ${e.character.ilvl} | M+ ${e.character.mplusScore} *(${score}pts)*`;
  });

  return {
    name: `${TIER_EMOJI[tier]} **${tier} Tier**`,
    value: lines.join("\n"),
    inline: false,
  };
}

export async function postTierListToDiscord(tierList: TierList): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) throw new Error("DISCORD_WEBHOOK_URL is not set");

  const fields = (["S", "A", "B", "C", "D", "F"] as const)
    .map((tier) => formatTierField(tier, tierList[tier as keyof TierList]))
    .filter(Boolean);

  const totalChars = Object.values(tierList).flat().length;

  const payload = {
    username: "WoW Tracker",
    avatar_url:
      "https://raider.io/images/raiderio-logo-transparent.png",
    embeds: [
      {
        title: "⚔️ WoW Character Tier List",
        description: `Ranked by **ilvl (40%) + M+ Score (60%)** composite. Tracking **${totalChars}** characters.`,
        color: TIER_COLORS["S"],
        fields,
        footer: {
          text: `Updated • ${new Date().toUTCString()}`,
        },
        thumbnail: {
          url: "https://render.worldofwarcraft.com/us/icons/56/inv_sword_2h_artifactazshara_d_03.jpg",
        },
      },
    ],
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord webhook failed (${res.status}): ${text}`);
  }
}
