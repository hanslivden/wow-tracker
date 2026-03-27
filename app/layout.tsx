import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WoW Tracker — Character Tier List",
  description: "Track World of Warcraft characters by ilvl and M+ score. Post tier lists to Discord.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
