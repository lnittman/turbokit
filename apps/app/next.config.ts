import { config, withAnalyzer } from "@spots/next-config";
import { printEnvBanner } from "@spots/next-config/diagnostics";
import type { NextConfig } from "next";

import { env } from "./env";

let nextConfig: NextConfig = config;

// Use process.env directly for build-time analysis
if (process.env.ANALYZE === "true") {
  nextConfig = withAnalyzer(nextConfig);
}

nextConfig.devIndicators = false;
// Ensure design package is transpiled and CSS exports resolve
nextConfig.transpilePackages = [
  ...(Array.isArray((nextConfig as any).transpilePackages)
    ? (nextConfig as any).transpilePackages
    : []),
  "@spots/design",
];

// Print clear env guidance during dev and build
printEnvBanner("app");

export default nextConfig;
