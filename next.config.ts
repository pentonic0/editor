import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow loading fonts from Google Fonts and any external image sources
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
