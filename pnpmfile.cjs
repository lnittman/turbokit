"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const useLocal =
	process.env.LN_USE_LOCAL_PACKAGES === "1" ||
	process.env.LN_USE_LOCAL_PACKAGES === "true";

const packagesRoot =
	process.env.LN_PACKAGES_PATH ??
	path.join(os.homedir(), "Developer", "packages");

function safeReadJson(filePath) {
	try {
		return JSON.parse(fs.readFileSync(filePath, "utf8"));
	} catch {
		return null;
	}
}

function buildLocalPackageMap(rootDir) {
	/** @type {Record<string, string>} */
	const map = {};

	/** @param {string} dir @param {number} depth */
	function walk(dir, depth) {
		if (depth > 5) {
			return;
		}

		let entries;
		try {
			entries = fs.readdirSync(dir, { withFileTypes: true });
		} catch {
			return;
		}

		for (const entry of entries) {
			if (!entry.isDirectory()) {
				continue;
			}

			if (
				entry.name === "node_modules" ||
				entry.name === ".git" ||
				entry.name === "dist"
			) {
				continue;
			}

			const full = path.join(dir, entry.name);
			const pkgJsonPath = path.join(full, "package.json");

			if (fs.existsSync(pkgJsonPath)) {
				const pkgJson = safeReadJson(pkgJsonPath);
				if (pkgJson?.name && typeof pkgJson.name === "string") {
					map[pkgJson.name] = full;
				}
			}

			walk(full, depth + 1);
		}
	}

	walk(rootDir, 0);
	return map;
}

const localMap =
	useLocal && fs.existsSync(packagesRoot)
		? buildLocalPackageMap(packagesRoot)
		: null;

function rewriteDeps(deps) {
	if (!(deps && localMap)) {
		return;
	}

	for (const name of Object.keys(deps)) {
		if (!name.startsWith("@lnittman/")) {
			continue;
		}

		const localPath = localMap[name];
		if (!localPath) {
			continue;
		}

		deps[name] = `file:${localPath}`;
	}
}

module.exports = {
	hooks: {
		readPackage(packageJson) {
			if (!localMap) {
				return packageJson;
			}

			rewriteDeps(packageJson.dependencies);
			rewriteDeps(packageJson.devDependencies);
			rewriteDeps(packageJson.optionalDependencies);
			return packageJson;
		},
	},
};
