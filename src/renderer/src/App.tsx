import Header from './components/Header'
import Palette from './components/Palette'

function App(): React.JSX.Element {
  return (
    <div className="gve-app">
      <Header />
      <Palette />
      <main className="gve-canvas" aria-label="Flow canvas" />
      <aside className="gve-inspector" aria-label="Inspector" />
      <section className="gve-xmlpane" aria-label="XML preview" />
    </div>
  )
}

export default App
