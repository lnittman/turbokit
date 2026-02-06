"use client";
import { useEffect, useId, useRef } from "react";
import type { ValidFPS } from "../hooks/useUnicornJson";
import { useUnicornJson } from "../hooks/useUnicornJson";
import type {
	UnicornAddSceneOptions,
	UnicornSceneInstance,
	UnicornSDK,
} from "../types/sdk";

type Interactivity = {
	mouse?: { disableMobile?: boolean; disabled?: boolean };
};

export interface UnicornViewportProps {
	// One of these two sources
	jsonPath?: string;
	projectId?: string;

	width?: number | string;
	height?: number | string;
	className?: string;
	altText?: string;
	ariaLabel?: string;

	// Perf
	scale?: number;
	dpi?: number;
	fps?: ValidFPS | number;
	lazyLoad?: boolean;

	// SDK / behavior
	production?: boolean;
	fixed?: boolean;
	interactivity?: Interactivity;
	sdkVersion?: string; // default v1.4.30
	sdkSrc?: string; // override full CDN URL
	cspNonce?: string;
	respectReducedMotion?: boolean;
	onReady?: (scene: any) => void;

	// Extras for JSON cache busting and multiple scenes
	version?: string | number;
	keyPrefix?: string;
}

export function UnicornViewport({
	jsonPath,
	projectId,
	width = "100%",
	height = "100%",
	className,
	altText = "WebGL Scene",
	ariaLabel = altText,
	scale,
	dpi,
	fps,
	lazyLoad,
	production = false,
	fixed,
	interactivity,
	sdkVersion = "1.4.30",
	sdkSrc,
	cspNonce,
	respectReducedMotion = true,
	onReady,
	version,
	keyPrefix,
}: UnicornViewportProps) {
	const id = useId().replace(/:/g, "-");
	const divRef = useRef<HTMLDivElement | null>(null);
	const sceneRef = useRef<UnicornSceneInstance | null>(null);
	const roRef = useRef<ResizeObserver | null>(null);

	// If using jsonPath, leverage the hook for defaults + cache busting
	const scene = useUnicornJson({
		jsonPath: jsonPath ?? "",
		version,
		scale,
		dpi,
		fps: fps as ValidFPS,
		lazyLoad,
		keyPrefix,
		respectReducedMotion,
	});

	useEffect(() => {
		if (!divRef.current) return;
		let cancelled = false;

		const ensureScript = () =>
			new Promise<void>((resolve, reject) => {
				if (typeof window === "undefined") return resolve();
				const src =
					sdkSrc ??
					`https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v${sdkVersion}/dist/unicornStudio.umd.js`;
				const existing = document.querySelector(
					`script[src="${src}"]`,
				) as HTMLScriptElement | null;
				if (existing) {
					if ((window as any).UnicornStudio) return resolve();
					existing.addEventListener("load", () => resolve());
					existing.addEventListener("error", () =>
						reject(new Error("UnicornStudio script failed to load")),
					);
					return;
				}
				const s = document.createElement("script");
				s.src = src;
				s.async = true;
				if (cspNonce) s.nonce = cspNonce;
				s.onload = () => resolve();
				s.onerror = () =>
					reject(new Error("UnicornStudio script failed to load"));
				document.body.appendChild(s);
			});

		const init = async () => {
			await ensureScript();
			if (cancelled || !divRef.current) return;

			const US = (window as any).UnicornStudio as UnicornSDK | undefined;
			if (!US) return;

			// reduced motion
			const reduce =
				respectReducedMotion &&
				typeof window !== "undefined" &&
				window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
			const effFps = reduce
				? Math.min(30, (fps as number) ?? scene.fps)
				: ((fps as number) ?? scene.fps);

			// Choose one of projectId or jsonPath
			const options: UnicornAddSceneOptions = {
				elementId: id,
				fps: effFps,
				scale: scale ?? scene.scale,
				dpi: dpi ?? scene.dpi,
				lazyLoad: lazyLoad ?? scene.lazyLoad,
				altText,
				ariaLabel,
			};
			if (projectId) {
				options.projectId = projectId;
				options.production = production;
			} else if (scene.jsonFilePath) {
				options.filePath = scene.jsonFilePath;
			}
			if (fixed !== undefined) options.fixed = fixed;
			if (interactivity) options.interactivity = interactivity;

			const instance = await US.addScene(options);
			if (cancelled) {
				instance?.destroy?.();
				return;
			}
			sceneRef.current = instance;
			onReady?.(instance);

			// Resize observer to keep canvas in sync with container
			roRef.current = new ResizeObserver(() => sceneRef.current?.resize?.());
			roRef.current.observe(divRef.current);

			const onVis = () => {
				if (sceneRef.current) sceneRef.current.paused = document.hidden;
			};
			document.addEventListener("visibilitychange", onVis);

			return () => {
				document.removeEventListener("visibilitychange", onVis);
			};
		};

		let removeListeners: (() => void) | undefined;
		init().then((fn) => {
			removeListeners = fn;
		});

		return () => {
			cancelled = true;
			try {
				removeListeners?.();
			} catch {}
			try {
				roRef.current?.disconnect();
				roRef.current = null;
			} catch {}
			try {
				sceneRef.current?.destroy?.();
				sceneRef.current = null;
			} catch {}
		};
	}, [
		altText,
		ariaLabel,
		cspNonce,
		dpi,
		fixed,
		fps,
		id,
		interactivity,
		lazyLoad,
		production,
		projectId,
		respectReducedMotion,
		scale,
		scene.dpi,
		scene.fps,
		scene.jsonFilePath,
		scene.lazyLoad,
		scene.scale,
		sdkSrc,
		sdkVersion,
		onReady,
	]);

	return (
		<div
			id={id}
			ref={divRef}
			className={className}
			style={{ width, height }}
			role="img"
			aria-label={ariaLabel}
		/>
	);
}
