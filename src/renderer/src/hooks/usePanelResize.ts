import { useEffect, useRef } from 'react'
import { readJson } from '../localStorage'

export const LAYOUT_KEY = 'gve-layout-preferences'
export const LAYOUT_VERSION = 1

export interface LayoutPreferences {
  paletteWidth: number
  inspectorWidth: number
}
export const DEFAULT_LAYOUT: LayoutPreferences = { paletteWidth: 260, inspectorWidth: 340 }

export function loadLayoutPreferences(): LayoutPreferences {
  const value = readJson<Partial<LayoutPreferences>>(LAYOUT_KEY, LAYOUT_VERSION, DEFAULT_LAYOUT)
  return {
    paletteWidth: Number.isFinite(value.paletteWidth)
      ? Math.min(420, Math.max(180, value.paletteWidth!))
      : DEFAULT_LAYOUT.paletteWidth,
    inspectorWidth: Number.isFinite(value.inspectorWidth)
      ? Math.min(520, Math.max(260, value.inspectorWidth!))
      : DEFAULT_LAYOUT.inspectorWidth
  }
}

interface UsePanelResizeResult {
  startResize: (kind: 'palette' | 'inspector', event: React.PointerEvent) => void
  nudgeLayout: (kind: 'palette' | 'inspector', delta: number) => void
}

// Owns the pointer-drag panel-resize effect (listens on window so dragging
// past the panel edge still tracks), the startResize handler that primes it,
// and nudgeLayout for the keyboard-driven resize path (plan 014).
export function usePanelResize(
  layout: LayoutPreferences,
  setLayout: React.Dispatch<React.SetStateAction<LayoutPreferences>>
): UsePanelResizeResult {
  const resizeRef = useRef<{
    kind: 'palette' | 'inspector'
    startX: number
    startWidth: number
  } | null>(null)

  useEffect(() => {
    const onMove = (event: PointerEvent): void => {
      const resize = resizeRef.current
      if (!resize) return
      const delta = event.clientX - resize.startX
      setLayout((current) =>
        resize.kind === 'palette'
          ? { ...current, paletteWidth: Math.min(420, Math.max(180, resize.startWidth + delta)) }
          : { ...current, inspectorWidth: Math.min(520, Math.max(260, resize.startWidth - delta)) }
      )
    }
    const onUp = (): void => {
      resizeRef.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [setLayout])

  const startResize = (kind: 'palette' | 'inspector', event: React.PointerEvent): void => {
    event.preventDefault()
    resizeRef.current = {
      kind,
      startX: event.clientX,
      startWidth: kind === 'palette' ? layout.paletteWidth : layout.inspectorWidth
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const nudgeLayout = (kind: 'palette' | 'inspector', delta: number): void => {
    setLayout((current) =>
      kind === 'palette'
        ? { ...current, paletteWidth: Math.min(420, Math.max(180, current.paletteWidth + delta)) }
        : {
            ...current,
            inspectorWidth: Math.min(520, Math.max(260, current.inspectorWidth - delta))
          }
    )
  }

  return { startResize, nudgeLayout }
}
