import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // 👈 Enables static export
  trailingSlash: true, // 👈 Optional: ensures proper routing in static environments
  images: {
    unoptimized: true, // 👈 Required if you use next/image
  },
};

export default nextConfig;
