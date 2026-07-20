import { useGve } from '../store'

function Header(): React.JSX.Element {
  const name = useGve(s => s.flow.meta.name)
  const past = useGve(s => s.past)
  const future = useGve(s => s.future)
  const updateMeta = useGve(s => s.updateMeta)
  const undo = useGve(s => s.undo)
  const redo = useGve(s => s.redo)

  return (
    <header className="gve-header">
      <div className="gve-brand" aria-label="GVE — GEL Visual Editor">
        <span className="gve-mark">GVE</span>
        <span className="gve-brand-name">GEL Visual Editor</span>
      </div>
      <input
        className="gve-flow-name"
        aria-label="Flow name"
        value={name}
        onChange={event => updateMeta({ name: event.target.value })}
      />
      <div className="gve-header-actions">
        <button type="button" onClick={undo} disabled={past.length === 0}>Undo</button>
        <button type="button" onClick={redo} disabled={future.length === 0}>Redo</button>
        <span className="gve-header-divider" />
        <button type="button" disabled title="coming in Task 13">Save Flow</button>
        <button type="button" disabled title="coming in Task 13">Open</button>
        <button type="button" disabled title="coming in Task 13">Export GEL</button>
      </div>
    </header>
  )
}

export default Header
