'use client'

export type ValidFPS = 15 | 24 | 30 | 60 | 120

export interface UseUnicornJsonOptions {
  /** Path under the app's public dir, e.g. "/webgl/scene.json" */
  jsonPath: string
  /** Optional: override auto-tuned scale */
  scale?: number
  /** Optional: override auto-tuned dpi */
  dpi?: number
  /** Optional: override auto-tuned fps */
  fps?: ValidFPS
  /** Optional cache-busting param */
  version?: string | number
  /** Default true */
  lazyLoad?: boolean
  /** Optional key prefix for multiple scenes on a page */
  keyPrefix?: string
  /** Respect prefers-reduced-motion and clamp FPS (default true) */
  respectReducedMotion?: boolean
}

export interface UnicornSceneProps {
  key: string
  jsonFilePath: string
  scale: number
  dpi: number
  fps: ValidFPS
  lazyLoad: boolean
}

/**
 * Single, minimal hook for JSON-based Unicorn scenes with sensible defaults.
 *
 * - Place exported JSON under apps/<app>/public/webgl/ or similar
 * - Pass absolute path like "/webgl/scene.json"
 */
export function useUnicornJson(opts: UseUnicornJsonOptions): UnicornSceneProps {
  const defaults = autoPerf()

  const scale = opts.scale ?? defaults.scale
  const dpi = opts.dpi ?? defaults.dpi
  // Reduced motion: clamp fps when requested
  const reduce =
    (opts.respectReducedMotion ?? true) &&
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const fps = (reduce ? Math.min((opts.fps ?? defaults.fps) as number, 30) : (opts.fps ?? defaults.fps)) as ValidFPS
  const lazyLoad = opts.lazyLoad ?? true

  const jsonFilePath = opts.version
    ? `${opts.jsonPath}?v=${encodeURIComponent(String(opts.version))}`
    : opts.jsonPath

  const key = `${opts.keyPrefix ?? 'unicorn'}:${jsonFilePath}`

  return { key, jsonFilePath, scale, dpi, fps, lazyLoad }
}

function autoPerf(): { scale: number; dpi: number; fps: ValidFPS } {
  // Safe defaults for SSR; replaced on client
  let perf = { scale: 1, dpi: 1.5, fps: 24 as ValidFPS }

  if (typeof window !== 'undefined') {
    const mem = (navigator as any).deviceMemory || 4
    const coarse = window.matchMedia('(pointer: coarse)').matches

    if (mem <= 1) perf = { scale: 0.5, dpi: 1.0, fps: 15 }
    else if (mem <= 2) perf = { scale: 0.6, dpi: 1.25, fps: 24 }
    else if (coarse) perf = { scale: 0.9, dpi: 1.8, fps: 24 }
    else perf = { scale: 1.0, dpi: 2.0, fps: 24 }
  }

  return perf
}
