import { useEffect, useRef, useState } from 'react'
import Canvas from './components/Canvas'
import CommandPalette from './components/CommandPalette'
import AboutDialog from './components/AboutDialog'
import DialogProvider, { useDialog } from './components/DialogProvider'
import MenuBar from './components/MenuBar'
import ValidationView from './components/ValidationView'
import Footer from './components/Footer'
import Inspector from './components/Inspector'
import Palette from './components/Palette'
import ToastProvider from './components/Toast'
import XmlPreview from './components/XmlPreview'
import WindowTitleBar from './components/WindowTitleBar'
import {
  getTheme,
  loadThemePreferences,
  saveThemePreferences,
  type ThemeId,
  type ThemePreferences
} from './theme'
import { useGve } from './store'
import { parseFlowDocument } from '../../shared/schema'

const LAYOUT_KEY = 'gve-layout-preferences'
const AUTOSAVE_KEY = 'gve-autosave-draft'
interface LayoutPreferences {
  paletteWidth: number
  inspectorWidth: number
}
const DEFAULT_LAYOUT: LayoutPreferences = { paletteWidth: 260, inspectorWidth: 340 }

function loadLayoutPreferences(): LayoutPreferences {
  try {
    const value = JSON.parse(localStorage.getItem(LAYOUT_KEY) ?? '') as Partial<LayoutPreferences>
    return {
      paletteWidth: Number.isFinite(value.paletteWidth)
        ? Math.min(420, Math.max(180, value.paletteWidth!))
        : DEFAULT_LAYOUT.paletteWidth,
      inspectorWidth: Number.isFinite(value.inspectorWidth)
        ? Math.min(520, Math.max(260, value.inspectorWidth!))
        : DEFAULT_LAYOUT.inspectorWidth
    }
  } catch {
    return DEFAULT_LAYOUT
  }
}

function AppContent(): React.JSX.Element {
  const [activeView, setActiveView] = useState<'flow' | 'xml' | 'validate'>('flow')
  const [themePreferences, setThemePreferences] = useState<ThemePreferences>(loadThemePreferences)
  const [layout, setLayout] = useState<LayoutPreferences>(loadLayoutPreferences)
  const [commandOpen, setCommandOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [compactPanels, setCompactPanels] = useState(
    () =>
      typeof window !== 'undefined' && Boolean(window.matchMedia?.('(max-width: 1100px)').matches)
  )
  const [paletteExpanded, setPaletteExpanded] = useState(false)
  const [inspectorExpanded, setInspectorExpanded] = useState(false)
  const [, setSystemThemeTick] = useState(0)
  const dialog = useDialog()
  const selectedId = useGve((s) => s.selectedId)
  const flow = useGve((s) => s.flow)
  const dirty = useGve((s) => s.dirty)
  const loadFlow = useGve((s) => s.loadFlow)
  const undo = useGve((s) => s.undo)
  const redo = useGve((s) => s.redo)
  const remove = useGve((s) => s.remove)
  const resizeRef = useRef<{
    kind: 'palette' | 'inspector'
    startX: number
    startWidth: number
  } | null>(null)

  useEffect(() => {
    saveThemePreferences(themePreferences)
  }, [themePreferences])
  useEffect(() => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout))
  }, [layout])
  useEffect(() => {
    window.gve?.setDirty?.(dirty)
  }, [dirty])
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
  useEffect(() => {
    const saved = localStorage.getItem(AUTOSAVE_KEY)
    if (!saved) return
    try {
      const recovered = parseFlowDocument(JSON.parse(saved))
      void dialog
        .confirm('Recover unsaved draft?', `Recover the unsaved draft “${recovered.meta.name}”?`, {
          confirmLabel: 'Recover',
          cancelLabel: 'Discard'
        })
        .then((accepted) => {
          if (accepted) loadFlow(recovered, null)
          else localStorage.removeItem(AUTOSAVE_KEY)
        })
    } catch {
      localStorage.removeItem(AUTOSAVE_KEY)
    }
    // Recovery is intentionally offered once when the shell mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    const unsubscribe = window.gve?.onCloseRequest?.(() => {
      void dialog
        .confirm('Unsaved changes', 'Closing now discards the current flow. Continue?', {
          confirmLabel: 'Discard changes'
        })
        .then((discard) => window.gve?.respondToClose?.(discard))
    })
    return unsubscribe
  }, [dialog])
  useEffect(() => {
    if (!dirty) {
      localStorage.removeItem(AUTOSAVE_KEY)
      return
    }
    const timer = window.setTimeout(
      () => localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(flow)),
      800
    )
    return () => window.clearTimeout(timer)
  }, [dirty, flow])
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
  }, [])
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable
      const modifier = event.ctrlKey || event.metaKey
      if (modifier && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen(true)
        return
      }
      if (isTyping || commandOpen) return
      if (modifier && event.shiftKey && event.key.toLowerCase() === 'f') {
        event.preventDefault()
        setFocusMode((value) => !value)
        return
      }
      if (modifier && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        event.shiftKey ? redo() : undo()
        return
      }
      if (modifier && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        redo()
        return
      }
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) {
        event.preventDefault()
        remove(selectedId)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [commandOpen, redo, remove, selectedId, undo])

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
  const updateTheme = (kind: keyof ThemePreferences, value: ThemeId): void =>
    setThemePreferences((preferences) => ({ ...preferences, [kind]: value }))
  const paletteRail = compactPanels && !paletteExpanded
  const inspectorRail = compactPanels && !inspectorExpanded
  const columns = focusMode
    ? '0 minmax(0, 1fr) 0'
    : `${paletteRail ? 56 : layout.paletteWidth}px minmax(0, 1fr) ${inspectorRail ? 56 : layout.inspectorWidth}px`

  return (
    <div
      className={`gve-shell${focusMode ? ' gve-shell-focus' : ''}`}
      data-app-theme={themePreferences.app}
      style={getTheme(themePreferences.app).appVars as React.CSSProperties}
    >
      <WindowTitleBar />
      <MenuBar
        activeView={activeView}
        onViewChange={setActiveView}
        onOpenCommandPalette={() => setCommandOpen(true)}
        onAbout={() => setAboutOpen(true)}
        onResetLayout={() => setLayout(DEFAULT_LAYOUT)}
        focusMode={focusMode}
        onToggleFocusMode={() => setFocusMode((value) => !value)}
      />
      <div
        className={`gve-app${compactPanels ? ' gve-app-compact' : ''}${paletteRail ? ' gve-app-palette-rail' : ''}${inspectorRail ? ' gve-app-inspector-rail' : ''}`}
        data-app-theme={themePreferences.app}
        style={{ gridTemplateColumns: columns }}
      >
        <Palette
          onResizeStart={(event) => startResize('palette', event)}
          onResizeKey={(delta) => nudgeLayout('palette', delta)}
          compact={compactPanels}
          collapsed={paletteRail}
          onToggleCollapsed={() => setPaletteExpanded((value) => !value)}
        />
        <div className="gve-center">
          <div className="gve-center-content">
            {activeView === 'flow' ? (
              <Canvas />
            ) : activeView === 'xml' ? (
              <XmlPreview theme={themePreferences.xml} />
            ) : (
              <ValidationView onOpenFlow={() => setActiveView('flow')} />
            )}
          </div>
          <div className="gve-view-tabs" role="tablist" aria-label="Workspace view">
            {(['flow', 'xml', 'validate'] as const).map((view) => (
              <button
                type="button"
                role="tab"
                key={view}
                aria-selected={activeView === view}
                className={`gve-view-tab${activeView === view ? ' gve-view-tab-active' : ''}`}
                onClick={() => setActiveView(view)}
              >
                {view === 'flow' ? 'Flow' : view === 'xml' ? 'XML Preview' : 'Validate'}
              </button>
            ))}
          </div>
        </div>
        <Inspector
          onResizeStart={(event) => startResize('inspector', event)}
          onResizeKey={(delta) => nudgeLayout('inspector', delta)}
          compact={compactPanels}
          collapsed={inspectorRail}
          onToggleCollapsed={() => setInspectorExpanded((value) => !value)}
        />
      </div>
      <Footer
        appTheme={themePreferences.app}
        xmlTheme={themePreferences.xml}
        onAppThemeChange={(value) => updateTheme('app', value)}
        onXmlThemeChange={(value) => updateTheme('xml', value)}
      />
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  )
}

function App(): React.JSX.Element {
  return (
    <DialogProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </DialogProvider>
  )
}

export default App
