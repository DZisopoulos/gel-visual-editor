import { useGve } from '../store'
import { parseFlowFile, serializeFlow } from '../../../shared/fileio'
import { exportXml } from '../../../shared/roundtrip'

type IconName = 'undo' | 'redo' | 'open' | 'save' | 'export'

function Icon({ name }: { name: IconName }): React.JSX.Element {
  const paths: Record<IconName, React.JSX.Element> = {
    undo: <><path d="M9 7 4 12l5 5" /><path d="M4 12h10a5 5 0 0 1 5 5" /></>,
    redo: <><path d="m15 7 5 5-5 5" /><path d="M20 12H10a5 5 0 0 0-5 5" /></>,
    open: <><path d="M3 7.5h6l2 2h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M3 7.5V5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v2.5" /></>,
    save: <><path d="M5 3h12l3 3v15H4V3z" /><path d="M8 3v6h8V3M8 21v-7h8v7" /></>,
    export: <><path d="M12 16V4m0 0 4 4m-4-4-4 4" /><path d="M5 13v7h14v-7" /></>
  }
  return <svg className="gve-icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
}

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
      <input
        className="gve-flow-name"
        aria-label="Flow name"
        value={name}
        onChange={event => updateMeta({ name: event.target.value })}
      />
      <div className="gve-header-actions">
        <button type="button" className="gve-icon-button gve-icon-undo" aria-label="Undo" title="Undo" onClick={undo} disabled={past.length === 0}><Icon name="undo" /></button>
        <button type="button" className="gve-icon-button gve-icon-redo" aria-label="Redo" title="Redo" onClick={redo} disabled={future.length === 0}><Icon name="redo" /></button>
        <span className="gve-header-divider" />
        <button type="button" className="gve-icon-button gve-icon-open" aria-label="Open flow" title="Open flow" onClick={handleOpen}><Icon name="open" /></button>
        <button type="button" className="gve-icon-button gve-icon-save" aria-label="Save flow" title="Save flow" onClick={handleSave}><Icon name="save" /></button>
        <button type="button" className="gve-icon-button gve-icon-export" aria-label="Export GEL" title="Export GEL" onClick={handleExport}><Icon name="export" /></button>
      </div>
    </header>
  )
}

export default Header
