---
name: WoW Tracker Design System
type: project
---

# WoW Tracker — Master Design System

## Style
**Retro-Futurism / Dark Fantasy**
Inspired by World of Warcraft's dark UI aesthetic combined with retro-futurism.

## Colors
| Role | Hex | Usage |
|------|-----|-------|
| Background Base | `#020617` | Page background |
| Background Surface | `#0f172a` | Cards, panels |
| Background Elevated | `#1e293b` | Inputs, hover states |
| Border | `#334155` | Default borders |
| Text Primary | `#f8fafc` | Headings, labels |
| Text Muted | `#94a3b8` | Secondary text |
| WoW Gold | `#c8a848` | Primary accent, CTAs |
| WoW Gold Bright | `#ffd700` | S-tier, hover glow |
| Epic Purple | `#a335ee` | A-tier, epic items |
| Rare Blue | `#0070dd` | B-tier, rare items |
| Uncommon Green | `#1eff00` | C-tier, uncommon items |
| Common Grey | `#9d9d9d` | D-tier, common items |
| Legendary Orange | `#ff8000` | Legendary items |

## Typography
- **Headings/Data:** Fira Code (monospace)
- **Body:** Fira Sans
- Google Fonts import in `globals.css`

## Effects
- CRT scanline overlay (`body::before`)
- Neon gold glow (`text-shadow` on headings)
- `box-shadow` glow on cards matching class color

## WoW Class Colors
| Class | Color |
|-------|-------|
| Death Knight | `#C41E3A` |
| Demon Hunter | `#A330C9` |
| Druid | `#FF7C0A` |
| Evoker | `#33937F` |
| Hunter | `#AAD372` |
| Mage | `#3FC7EB` |
| Monk | `#00FF98` |
| Paladin | `#F48CBA` |
| Priest | `#FFFFFF` |
| Rogue | `#FFF468` |
| Shaman | `#0070DD` |
| Warlock | `#8788EE` |
| Warrior | `#C69B3A` |

## Item Quality Border Colors
- Legendary: `#ff8000`
- Epic: `#a335ee`
- Rare: `#0070dd`
- Uncommon: `#1eff00`
- Common: `#9d9d9d`

## Tier Scoring
- Composite = ilvl × 0.4 + M+Score × 0.6 (normalized 0–100)
- S ≥ 80, A 60–79, B 40–59, C 20–39, D < 20
