import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "render.worldofwarcraft.com",
      },
      {
        protocol: "https",
        hostname: "*.worldofwarcraft.com",
      },
      {
        protocol: "https",
        hostname: "raider.io",
      },
    ],
  },
};

export default nextConfig;
