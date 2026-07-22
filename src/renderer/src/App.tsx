import { useEffect, useState } from 'react'
import Canvas from './components/Canvas'
import CommandPalette from './components/CommandPalette'
import AboutDialog from './components/AboutDialog'
import DialogProvider, { useDialog } from './components/DialogProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
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
import { writeJson } from './localStorage'
import { useAutosave } from './hooks/useAutosave'
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts'
import { useResponsiveLayout } from './hooks/useResponsiveLayout'
import {
  DEFAULT_LAYOUT,
  LAYOUT_KEY,
  LAYOUT_VERSION,
  loadLayoutPreferences,
  usePanelResize,
  type LayoutPreferences
} from './hooks/usePanelResize'

function AppContent(): React.JSX.Element {
  const [activeView, setActiveView] = useState<'flow' | 'xml' | 'validate'>('flow')
  const [themePreferences, setThemePreferences] = useState<ThemePreferences>(loadThemePreferences)
  const [layout, setLayout] = useState<LayoutPreferences>(loadLayoutPreferences)
  const [commandOpen, setCommandOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [paletteExpanded, setPaletteExpanded] = useState(false)
  const [inspectorExpanded, setInspectorExpanded] = useState(false)
  const dialog = useDialog()
  const selectedId = useGve((s) => s.selectedId)
  const flow = useGve((s) => s.flow)
  const dirty = useGve((s) => s.dirty)
  const loadFlow = useGve((s) => s.loadFlow)
  const undo = useGve((s) => s.undo)
  const redo = useGve((s) => s.redo)
  const remove = useGve((s) => s.remove)
  const select = useGve((s) => s.select)
  const compactPanels = useResponsiveLayout()
  const { startResize } = usePanelResize(layout, setLayout)

  useEffect(() => {
    saveThemePreferences(themePreferences)
  }, [themePreferences])
  useEffect(() => {
    writeJson(LAYOUT_KEY, LAYOUT_VERSION, layout)
  }, [layout])
  useEffect(() => {
    window.gve?.setDirty?.(dirty)
  }, [dirty])
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

  useAutosave({ dirty, flow, loadFlow, dialog })
  useGlobalShortcuts({
    commandOpen,
    setCommandOpen,
    setFocusMode,
    selectedId,
    select,
    remove,
    undo,
    redo
  })

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
          compact={compactPanels}
          collapsed={paletteRail}
          onToggleCollapsed={() => setPaletteExpanded((value) => !value)}
        />
        <div className="gve-center">
          <div className="gve-center-content">
            <ErrorBoundary
              fallback={(retry) => (
                <div className="gve-empty-state">
                  <div className="gve-empty-icon" aria-hidden="true">
                    !
                  </div>
                  <h2>Something went wrong</h2>
                  <p>This view hit an unexpected error. Your flow data is safe — try again.</p>
                  <button type="button" onClick={retry}>
                    Retry
                  </button>
                </div>
              )}
            >
              {activeView === 'flow' ? (
                <Canvas />
              ) : activeView === 'xml' ? (
                <XmlPreview theme={themePreferences.xml} />
              ) : (
                <ValidationView onOpenFlow={() => setActiveView('flow')} />
              )}
            </ErrorBoundary>
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
