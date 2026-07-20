import Canvas from './components/Canvas'
import Header from './components/Header'
import Inspector from './components/Inspector'
import Palette from './components/Palette'
import XmlPreview from './components/XmlPreview'

function App(): React.JSX.Element {
  return (
    <div className="gve-app">
      <Header />
      <Palette />
      <Canvas />
      <Inspector />
      <XmlPreview />
    </div>
  )
}

export default App
