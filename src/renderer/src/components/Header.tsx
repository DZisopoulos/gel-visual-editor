import { useGve } from '../store'
import { parseFlowFile, serializeFlow } from '../../../shared/fileio'
import { exportXml } from '../../../shared/roundtrip'

function Header(): React.JSX.Element {
  const name = useGve(s => s.flow.meta.name)
  const past = useGve(s => s.past)
  const future = useGve(s => s.future)
  const flow = useGve(s => s.flow)
  const dirty = useGve(s => s.dirty)
  const filePath = useGve(s => s.filePath)
  const updateMeta = useGve(s => s.updateMeta)
  const loadFlow = useGve(s => s.loadFlow)
  const markSaved = useGve(s => s.markSaved)
  const undo = useGve(s => s.undo)
  const redo = useGve(s => s.redo)

  const suggestedName = (): string => flow.meta.name.replace(/[<>:"/\\|?*]/g, '-').trim() || 'Untitled Flow'

  const handleSave = async (): Promise<void> => {
    try {
      const existingGvePath = filePath?.toLowerCase().endsWith('.gve') ? filePath : null
      const savedPath = await window.gve.saveFlow(suggestedName(), serializeFlow(flow), existingGvePath)
      if (savedPath) markSaved(savedPath)
    } catch (error) {
      window.alert(`Could not save this flow. ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleOpen = async (): Promise<void> => {
    if (dirty && !window.confirm('Discard your unsaved changes and open another flow?')) return

    try {
      const opened = await window.gve.openFlow()
      if (!opened) return

      const result = parseFlowFile(opened.content, opened.filePath)
      const editablePath = opened.filePath.toLowerCase().endsWith('.gve') ? opened.filePath : null
      loadFlow(result.flow, editablePath)
      if (result.drift) {
        window.alert('This XML was changed after export. GVE restored the embedded flow definition.')
      }
    } catch (error) {
      window.alert(`Could not open this flow. ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleExport = async (): Promise<void> => {
    try {
      await window.gve.exportXml(suggestedName(), exportXml(flow))
    } catch (error) {
      window.alert(`Could not export this flow. ${error instanceof Error ? error.message : String(error)}`)
    }
  }

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
        <button type="button" onClick={handleSave}>Save Flow</button>
        <button type="button" onClick={handleOpen}>Open</button>
        <button type="button" onClick={handleExport}>Export GEL ▸</button>
      </div>
    </header>
  )
}

export default Header
