import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Cloudflare Workers/Pages deployment
  output: "export",
  // Auto-memoizes components/hooks (stable as of Next.js 16 / React Compiler 1.0),
  // cutting re-renders across the app without hand-written useMemo/useCallback everywhere.
  reactCompiler: true,
  // Pins the workspace root explicitly — without this, Turbopack's root
  // inference gets confused by the unrelated lockfile at C:\Users\vikas\
  // package-lock.json and picks that as the root, which breaks dev-mode HMR.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
