import type { NextConfig } from "next";

const loadModule = (specifier: string) =>
	// biome-ignore lint: dynamic import workaround for ESM config packages
	new Function("s", "return import(s)")(specifier) as Promise<any>;

const createConfig = async (): Promise<NextConfig> => {
	const { config: baseConfig, withAnalyzer } = await loadModule(
		"@lnittman/next-config",
	);
	const { printEnvBanner } = await loadModule(
		"@lnittman/next-config/diagnostics",
	);

	const baseTranspilePackages = baseConfig.transpilePackages ?? [];
	const baseRemotePatterns = baseConfig.images?.remotePatterns ?? [];
	const baseServerActions =
		typeof baseConfig.experimental?.serverActions === "object"
			? baseConfig.experimental.serverActions
			: {};

	let nextConfig: NextConfig = {
		...baseConfig,
		reactStrictMode: true,
		poweredByHeader: false,
		devIndicators: false,
		transpilePackages: [...new Set([...baseTranspilePackages, "@repo/design"])],
		images: {
			...(baseConfig.images ?? {}),
			remotePatterns: [
				...baseRemotePatterns,
				{
					protocol: "https",
					hostname: "**",
				},
			],
		},
		experimental: {
			...(baseConfig.experimental ?? {}),
			serverActions: {
				...baseServerActions,
				bodySizeLimit: "2mb",
			},
		},
	};

	if (process.env.ANALYZE === "true") {
		nextConfig = withAnalyzer(nextConfig);
	}

	printEnvBanner("turbokit-app");

	return nextConfig;
};

export default createConfig;
