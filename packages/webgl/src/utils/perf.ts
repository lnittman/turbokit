"use client";

type ValidFPS = 15 | 24 | 30 | 60 | 120;

export interface PerfDefaults {
	scale: number;
	dpi: number;
	fps: ValidFPS;
}

/**
 * Returns default performance settings based on device heuristics.
 * Mirrors the logic used in useUnicornJson.
 */
export function getPerfDefaults(): PerfDefaults {
	let perf: PerfDefaults = { scale: 1, dpi: 1.5, fps: 24 };
	if (typeof window === "undefined") return perf;

	const mem = (navigator as any).deviceMemory || 4;
	const coarse = window.matchMedia("(pointer: coarse)").matches;

	if (mem <= 1) perf = { scale: 0.5, dpi: 1.0, fps: 15 };
	else if (mem <= 2) perf = { scale: 0.6, dpi: 1.25, fps: 24 };
	else if (coarse) perf = { scale: 0.9, dpi: 1.8, fps: 24 };
	else perf = { scale: 1.0, dpi: 2.0, fps: 24 };

	return perf;
}
