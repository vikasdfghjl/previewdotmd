import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Cloudflare Workers/Pages deployment
  output: "export",
};

export default nextConfig;
