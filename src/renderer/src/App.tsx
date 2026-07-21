import { useState } from 'react'
import Canvas from './components/Canvas'
import Header from './components/Header'
import Inspector from './components/Inspector'
import Palette from './components/Palette'
import XmlPreview from './components/XmlPreview'

function App(): React.JSX.Element {
  const [activeView, setActiveView] = useState<'flow' | 'xml'>('flow')

  return (
    <div className="gve-app">
      <Header />
      <Palette />
      <div className="gve-center">
        <div className="gve-center-content">
          {activeView === 'flow' ? <Canvas /> : <XmlPreview />}
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
  )
}

export default App
