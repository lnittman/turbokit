import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Enable React strict mode for better development experience
	reactStrictMode: true,

	// Disable powered-by header for security
	poweredByHeader: false,

	// Disable dev indicators
	devIndicators: false,

	// Ensure design package is transpiled and CSS exports resolve
	transpilePackages: ["@repo/design"],

	// Configure image domains if needed
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
		],
	},

	// Experimental features
	experimental: {
		// Enable server actions
		serverActions: {
			bodySizeLimit: "2mb",
		},
	},
};

export default nextConfig;
