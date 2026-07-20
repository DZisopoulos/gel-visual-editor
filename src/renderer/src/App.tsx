import Canvas from './components/Canvas'
import Header from './components/Header'
import Palette from './components/Palette'

function App(): React.JSX.Element {
  return (
    <div className="gve-app">
      <Header />
      <Palette />
      <Canvas />
      <aside className="gve-inspector" aria-label="Inspector" />
      <section className="gve-xmlpane" aria-label="XML preview" />
    </div>
  )
}

export default App
