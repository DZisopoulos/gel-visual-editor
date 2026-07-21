import { useEffect, useState } from 'react'
import Canvas from './components/Canvas'
import Footer from './components/Footer'
import Header from './components/Header'
import Inspector from './components/Inspector'
import Palette from './components/Palette'
import XmlPreview from './components/XmlPreview'
import WindowTitleBar from './components/WindowTitleBar'
import { getTheme, loadThemePreferences, saveThemePreferences, type ThemeId, type ThemePreferences } from './theme'

function App(): React.JSX.Element {
  const [activeView, setActiveView] = useState<'flow' | 'xml'>('flow')
  const [themePreferences, setThemePreferences] = useState<ThemePreferences>(loadThemePreferences)

  useEffect(() => { saveThemePreferences(themePreferences) }, [themePreferences])

  const updateTheme = (kind: keyof ThemePreferences, value: ThemeId): void => {
    setThemePreferences(preferences => ({ ...preferences, [kind]: value }))
  }

  return (
    <div className="gve-shell" data-app-theme={themePreferences.app} style={getTheme(themePreferences.app).appVars as React.CSSProperties}>
      <WindowTitleBar />
      <div className="gve-app" data-app-theme={themePreferences.app}>
      <Header />
      <Palette />
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
      <Inspector />
      </div>
      <Footer
        appTheme={themePreferences.app}
        xmlTheme={themePreferences.xml}
        onAppThemeChange={value => updateTheme('app', value)}
        onXmlThemeChange={value => updateTheme('xml', value)}
      />
    </div>
  )
}

export default App
