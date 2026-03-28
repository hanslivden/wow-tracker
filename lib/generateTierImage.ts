import fs from "fs";
import path from "path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { TierList, TierEntry, TierLabel } from "@/types";

// ── Constants ─────────────────────────────────────────────────────────────
const IMAGE_WIDTH   = 1200;
const PADDING       = 24;
const HEADER_H      = 72;
const TIER_LABEL_W  = 64;
const CARD_W        = 160;
const CARD_H        = 96;
const CARD_GAP      = 10;
const ROW_V_PAD     = 14;
const FOOTER_H      = 40;
const CARDS_PER_ROW = Math.floor((IMAGE_WIDTH - PADDING * 2 - TIER_LABEL_W - 12) / (CARD_W + CARD_GAP));

const TIER_STYLE: Record<TierLabel, { color: string; bg: string }> = {
  S: { color: "#ffd700", bg: "rgba(255,215,0,0.08)"   },
  A: { color: "#a335ee", bg: "rgba(163,53,238,0.08)"  },
  B: { color: "#0070dd", bg: "rgba(0,112,221,0.08)"   },
  C: { color: "#1eff00", bg: "rgba(30,255,0,0.06)"    },
  D: { color: "#9d9d9d", bg: "rgba(157,157,157,0.06)" },
  F: { color: "#c41e3a", bg: "rgba(196,30,58,0.06)"   },
};

const CLASS_COLORS: Record<string, string> = {
  "Death Knight": "#C41E3A", "Demon Hunter": "#A330C9", Druid: "#FF7C0A",
  Evoker: "#33937F", Hunter: "#AAD372", Mage: "#3FC7EB", Monk: "#00FF98",
  Paladin: "#F48CBA", Priest: "#FFFFFF", Rogue: "#FFF468",
  Shaman: "#0070DD", Warlock: "#8788EE", Warrior: "#C69B3A",
};

// ── Helpers ───────────────────────────────────────────────────────────────
async function fetchBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const mime = res.headers.get("content-type") ?? "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

function loadFont(filename: string): ArrayBuffer {
  const filePath = path.join(process.cwd(), "public", "fonts", filename);
  return fs.readFileSync(filePath).buffer as ArrayBuffer;
}

function rowHeight(entries: TierEntry[]): number {
  const rows = Math.max(1, Math.ceil(entries.length / CARDS_PER_ROW));
  return ROW_V_PAD * 2 + rows * CARD_H + (rows - 1) * CARD_GAP + 32; // 32 for tier label header
}

// ── JSX builders (plain objects, compatible with Satori) ──────────────────
function CharacterCard(entry: TierEntry, portrait: string | null) {
  const classColor = CLASS_COLORS[entry.character.class] ?? "#c8a848";
  const scoreColor = entry.character.mplusScoreColor ?? "#e2e8f0";

  return {
    type: "div",
    props: {
      style: {
        width: CARD_W, height: CARD_H,
        display: "flex", flexDirection: "column",
        borderRadius: 8,
        overflow: "hidden",
        border: `1px solid ${classColor}55`,
        background: "#0f172a",
        boxShadow: `0 0 10px ${classColor}22`,
        flexShrink: 0,
      },
      children: [
        // Portrait strip
        {
          type: "div",
          props: {
            style: {
              width: "100%", height: 46,
              position: "relative",
              display: "flex",
              background: "#1e293b",
              overflow: "hidden",
            },
            children: portrait
              ? [{
                  type: "img",
                  props: {
                    src: portrait,
                    style: {
                      width: "100%", height: "100%",
                      objectFit: "cover", objectPosition: "top center",
                    },
                  },
                }]
              : [{
                  type: "div",
                  props: {
                    style: {
                      width: "100%", height: "100%",
                      background: `linear-gradient(135deg, ${classColor}33, #1e293b)`,
                    },
                  },
                }],
          },
        },
        // Info strip
        {
          type: "div",
          props: {
            style: {
              flex: 1, padding: "3px 6px 4px",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
            },
            children: [
              {
                type: "div",
                props: {
                  style: { fontSize: 11, fontWeight: 700, color: classColor, overflow: "hidden", maxWidth: CARD_W - 12 },
                  children: entry.character.name,
                },
              },
              {
                type: "div",
                props: {
                  style: { display: "flex", gap: 6 },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: { display: "flex", gap: 3, alignItems: "center" },
                        children: [
                          { type: "div", props: { style: { fontSize: 9, color: "#64748b" }, children: "ilvl" } },
                          { type: "div", props: { style: { fontSize: 12, fontWeight: 700, color: "#e2e8f0" }, children: String(entry.character.ilvl) } },
                        ],
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: { display: "flex", gap: 3, alignItems: "center" },
                        children: [
                          { type: "div", props: { style: { fontSize: 9, color: "#64748b" }, children: "M+" } },
                          { type: "div", props: { style: { fontSize: 12, fontWeight: 700, color: scoreColor }, children: String(entry.character.mplusScore) } },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

function TierRow(tier: TierLabel, entries: TierEntry[], portraits: Map<string, string | null>) {
  const style = TIER_STYLE[tier];

  // Chunk entries into rows of CARDS_PER_ROW
  const chunks: TierEntry[][] = [];
  for (let i = 0; i < Math.max(entries.length, 1); i += CARDS_PER_ROW) {
    chunks.push(entries.slice(i, i + CARDS_PER_ROW));
  }

  return {
    type: "div",
    props: {
      style: {
        display: "flex", flexDirection: "column",
        background: style.bg,
        borderRadius: 10,
        border: `1px solid ${style.color}33`,
        marginBottom: 10,
        padding: `${ROW_V_PAD}px ${PADDING}px`,
      },
      children: chunks.map((chunk, ci) => ({
        type: "div",
        props: {
          style: {
            display: "flex", flexDirection: "row",
            alignItems: "center",
            gap: 0,
            marginTop: ci === 0 ? 0 : CARD_GAP,
          },
          children: [
            // Tier label (only on first chunk row)
            {
              type: "div",
              props: {
                style: {
                  width: TIER_LABEL_W,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  opacity: ci === 0 ? 1 : 0,
                },
                children: [{
                  type: "div",
                  props: {
                    style: {
                      fontSize: 40, fontWeight: 900,
                      color: style.color,
                      textShadow: `0 0 16px ${style.color}99`,
                    },
                    children: tier,
                  },
                }],
              },
            },
            // Cards
            {
              type: "div",
              props: {
                style: {
                  display: "flex", flexDirection: "row",
                  flexWrap: "nowrap",
                  gap: CARD_GAP,
                },
                children: chunk.length > 0
                  ? chunk.map((e) => CharacterCard(e, portraits.get(e.character.id) ?? null))
                  : [{
                      type: "div",
                      props: {
                        style: { fontSize: 13, color: "#334155", fontStyle: "italic" },
                        children: "— empty —",
                      },
                    }],
              },
            },
          ],
        },
      })),
    },
  };
}

// ── Main export ───────────────────────────────────────────────────────────
export async function generateTierListImage(tierList: TierList): Promise<Buffer> {
  const tiers: TierLabel[] = ["S", "A", "B", "C", "D", "F"];
  const allEntries = tiers.flatMap((t) => tierList[t]);

  // Load fonts from disk (sync) + portraits in parallel
  const interBold    = loadFont("Inter-Bold.ttf");
  const interRegular = loadFont("Inter-Regular.ttf");
  const portraitResults = await Promise.all(
    allEntries.map((e) => fetchBase64(e.character.thumbnailUrl))
  );

  const portraits = new Map<string, string | null>();
  allEntries.forEach((e, i) => portraits.set(e.character.id, portraitResults[i] ?? null));

  // Calculate total image height
  const totalHeight =
    PADDING + HEADER_H + 8 +
    tiers.reduce((acc, t) => acc + rowHeight(tierList[t]), 0) +
    FOOTER_H + PADDING;

  const tree = {
    type: "div",
    props: {
      style: {
        width: IMAGE_WIDTH,
        height: totalHeight,
        background: "#020617",
        display: "flex",
        flexDirection: "column",
        padding: PADDING,
        fontFamily: "Inter",
      },
      children: [
        // Header
        {
          type: "div",
          props: {
            style: {
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 16,
              borderBottom: "1px solid #c8a84855",
              paddingBottom: 12,
            },
            children: [
              {
                type: "div",
                props: {
                  style: { display: "flex", alignItems: "center", gap: 12 },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: { fontSize: 28, fontWeight: 900, color: "#c8a848", letterSpacing: 2 },
                        children: "WoW Tracker",
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: { fontSize: 14, color: "#94a3b8", marginTop: 4 },
                        children: "Character Tier List",
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: { fontSize: 12, color: "#475569" },
                  children: new Date().toUTCString(),
                },
              },
            ],
          },
        },
        // Tier rows
        ...tiers.map((t) => TierRow(t, tierList[t], portraits)),
        // Footer
        {
          type: "div",
          props: {
            style: {
              marginTop: "auto",
              fontSize: 11, color: "#334155", textAlign: "center",
            },
            children: `ilvl × 0.4 + M+ × 0.6 · group-relative ranking · ${allEntries.length} characters tracked`,
          },
        },
      ],
    },
  };

  const svg = await satori(tree as Parameters<typeof satori>[0], {
    width: IMAGE_WIDTH,
    height: totalHeight,
    fonts: [
      { name: "Inter", data: interBold,    weight: 700, style: "normal" },
      { name: "Inter", data: interRegular, weight: 400, style: "normal" },
    ],
  });

  return Buffer.from(new Resvg(svg, { fitTo: { mode: "width", value: IMAGE_WIDTH } }).render().asPng());
}
