import type { NextConfig } from 'next';

import { config, withAnalyzer } from '@repo/next-config';
import { printEnvBanner } from '@repo/next-config/diagnostics';

import { env } from './env';

let nextConfig: NextConfig = config;

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig);
}

nextConfig.devIndicators = false;

// Print clear env guidance during dev and build
printEnvBanner('app');

export default nextConfig;
