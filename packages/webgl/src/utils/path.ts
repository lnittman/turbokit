'use client'

export interface JsonPathOptions {
  /** Base path under the app public directory. Defaults to '/webgl'. */
  base?: string
  /** Ensure the returned path ends with .json. Defaults to true. */
  ensureExt?: boolean
}

/**
 * Build a normalized absolute path to a Unicorn JSON asset under the app's public directory.
 * Accepts names like 'scene', 'scene.json', or absolute '/webgl/scene.json'.
 */
export function jsonPath(nameOrPath: string, opts: JsonPathOptions = {}): string {
  const base = (opts.base ?? '/webgl').replace(/\/+$/g, '') || ''
  const ensureExt = opts.ensureExt ?? true

  let clean = nameOrPath.trim()
  // If absolute path under public, keep it; otherwise join with base
  if (!clean.startsWith('/')) {
    clean = `${base}/${clean}`
  }
  // Collapse multiple slashes
  clean = clean.replace(/\/+?/g, '/').replace(/\/+$/, '')
  if (ensureExt && !clean.toLowerCase().endsWith('.json')) clean += '.json'
  return clean
}

/** Append or update a cache-busting version query parameter. */
export function withVersion(url: string, version?: string | number): string {
  if (version === undefined || version === null || version === '') return url
  const [u, q = ''] = url.split('?')
  const params = new URLSearchParams(q)
  params.set('v', String(version))
  const query = params.toString()
  return query ? `${u}?${query}` : u
}

/** Append or update ?update= for Unicorn CDN projectId cache-busting. */
export function withCdnUpdate(projectId: string, update?: string | number): string {
  if (update === undefined || update === null || update === '') return projectId
  const [id, q = ''] = projectId.split('?')
  const params = new URLSearchParams(q)
  params.set('update', String(update))
  const query = params.toString()
  return query ? `${id}?${query}` : id
}

/** Safe path join that avoids duplicate slashes. */
export function joinPath(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .map((p, i) => (i === 0 ? p.replace(/\/+$/g, '') : p.replace(/^\/+|\/+$/g, '')))
    .join('/')
}
