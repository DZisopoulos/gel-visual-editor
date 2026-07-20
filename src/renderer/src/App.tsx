import Canvas from './components/Canvas'
import Header from './components/Header'
import Inspector from './components/Inspector'
import Palette from './components/Palette'

function App(): React.JSX.Element {
  return (
    <div className="gve-app">
      <Header />
      <Palette />
      <Canvas />
      <Inspector />
      <section className="gve-xmlpane" aria-label="XML preview" />
    </div>
  )
}

export default App
