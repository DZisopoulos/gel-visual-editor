// Shared, versioned wrapper around the localStorage API used by every
// renderer-side persistence call site (theme, snippets, layout, autosave).
// Wrapping each stored value with a `{ v, data }` envelope lets a future
// shape change bump `version` and safely fall back to `fallback` for any
// value written by an older version, instead of crashing on `JSON.parse`
// or silently misinterpreting stale data.
export function readJson<T>(key: string, version: number, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as { v: number; data: T }
    if (parsed.v !== version) return fallback
    return parsed.data
  } catch {
    return fallback
  }
}

export function writeJson<T>(key: string, version: number, data: T): void {
  localStorage.setItem(key, JSON.stringify({ v: version, data }))
}

export function removeJson(key: string): void {
  localStorage.removeItem(key)
}
