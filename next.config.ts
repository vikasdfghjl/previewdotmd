import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Cloudflare Workers/Pages deployment
  output: "export",
  // Auto-memoizes components/hooks (stable as of Next.js 16 / React Compiler 1.0),
  // cutting re-renders across the app without hand-written useMemo/useCallback everywhere.
  reactCompiler: true,
};

export default nextConfig;
