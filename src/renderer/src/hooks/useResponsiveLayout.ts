import { useEffect, useState } from 'react'

// Owns the compact-panel breakpoint detection and the system-color-scheme
// change listener. Both are self-contained: compactPanels is only ever set
// from the breakpoint media-query listener, and the system-theme "tick" only
// exists to force a re-render so `getTheme('auto')` picks up an OS theme
// change — nothing outside this hook reads the tick itself, so it stays
// local rather than being returned.
export function useResponsiveLayout(): boolean {
  const [compactPanels, setCompactPanels] = useState(
    () =>
      typeof window !== 'undefined' && Boolean(window.matchMedia?.('(max-width: 1100px)').matches)
  )
  const [, setSystemThemeTick] = useState(0)

  useEffect(() => {
    const media = window.matchMedia?.('(max-width: 1100px)')
    if (!media) return
    const update = (): void => setCompactPanels(media.matches)
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!media) return
    const update = (): void => setSystemThemeTick((value) => value + 1)
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  return compactPanels
}
