import { useEffect, useRef, useState } from 'react'
import Canvas from './components/Canvas'
import CommandPalette from './components/CommandPalette'
import AboutDialog from './components/AboutDialog'
import Footer from './components/Footer'
import Header from './components/Header'
import Inspector from './components/Inspector'
import Palette from './components/Palette'
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

const LAYOUT_KEY = 'gve-layout-preferences'
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

function App(): React.JSX.Element {
  const [activeView, setActiveView] = useState<'flow' | 'xml'>('flow')
  const [themePreferences, setThemePreferences] = useState<ThemePreferences>(loadThemePreferences)
  const [layout, setLayout] = useState<LayoutPreferences>(loadLayoutPreferences)
  const [commandOpen, setCommandOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const selectedId = useGve(s => s.selectedId)
  const undo = useGve(s => s.undo)
  const redo = useGve(s => s.redo)
  const remove = useGve(s => s.remove)
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
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT' || target?.isContentEditable
      const modifier = event.ctrlKey || event.metaKey
      if (modifier && event.key.toLowerCase() === 'k') { event.preventDefault(); setCommandOpen(true); return }
      if (isTyping || commandOpen) return
      if (modifier && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); return }
      if (modifier && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); return }
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) { event.preventDefault(); remove(selectedId) }
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

  const updateTheme = (kind: keyof ThemePreferences, value: ThemeId): void => {
    setThemePreferences((preferences) => ({ ...preferences, [kind]: value }))
  }

  return (
    <div
      className="gve-shell"
      data-app-theme={themePreferences.app}
      style={getTheme(themePreferences.app).appVars as React.CSSProperties}
    >
      <WindowTitleBar />
      <div
        className="gve-app"
        data-app-theme={themePreferences.app}
        style={{
          gridTemplateColumns: `${layout.paletteWidth}px minmax(0, 1fr) ${layout.inspectorWidth}px`
        }}
      >
        <Header />
        <Palette onResizeStart={(event) => startResize('palette', event)} />
        <div className="gve-center">
          <div className="gve-center-content">
            {activeView === 'flow' ? <Canvas /> : <XmlPreview theme={themePreferences.xml} />}
          </div>
          <div className="gve-view-tabs" role="tablist" aria-label="Workspace view">
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'flow'}
              className={`gve-view-tab${activeView === 'flow' ? ' gve-view-tab-active' : ''}`}
              onClick={() => setActiveView('flow')}
            >
              Flow
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'xml'}
              className={`gve-view-tab${activeView === 'xml' ? ' gve-view-tab-active' : ''}`}
              onClick={() => setActiveView('xml')}
            >
              XML Preview
            </button>
          </div>
        </div>
        <Inspector onResizeStart={(event) => startResize('inspector', event)} />
      </div>
      <Footer
        appTheme={themePreferences.app}
        xmlTheme={themePreferences.xml}
        onAppThemeChange={(value) => updateTheme('app', value)}
        onXmlThemeChange={(value) => updateTheme('xml', value)}
        onAbout={() => setAboutOpen(true)}
      />
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  )
}

export default App
