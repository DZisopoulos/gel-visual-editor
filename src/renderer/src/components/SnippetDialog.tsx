import { useEffect, useState } from 'react'
import { readSnippets, removeSnippet, type SavedSnippet } from '../snippets'

interface SnippetDialogProps { open: boolean; onClose: () => void; onInsert: (snippet: SavedSnippet) => void }

function SnippetDialog({ open, onClose, onInsert }: SnippetDialogProps): React.JSX.Element | null {
  const [snippets, setSnippets] = useState<SavedSnippet[]>([])
  useEffect(() => { if (open) setSnippets(readSnippets()) }, [open])
  if (!open) return null
  return <div className="gve-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="gve-template-dialog" role="dialog" aria-modal="true" aria-label="Snippet library">
      <div className="gve-template-header"><div><span className="gve-validation-eyebrow">SNIPPET LIBRARY</span><h2>Reusable blocks</h2><p>Save and reuse patterns across your flows.</p></div><button type="button" aria-label="Close snippets" onClick={onClose}>×</button></div>
      <div className="gve-snippet-list">{snippets.length === 0 ? <div className="gve-command-empty">No saved snippets yet. Use the bookmark action on a block.</div> : snippets.map(snippet => <div className="gve-snippet-row" key={snippet.id}><div><strong>{snippet.name}</strong><small>{snippet.block.type}</small></div><button type="button" onClick={() => { onInsert(snippet); onClose() }}>Insert</button><button type="button" aria-label={`Delete ${snippet.name}`} onClick={() => { removeSnippet(snippet.id); setSnippets(readSnippets()) }}>×</button></div>)}</div>
    </section>
  </div>
}

export default SnippetDialog
