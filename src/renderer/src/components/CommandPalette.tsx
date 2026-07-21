import { useEffect, useMemo, useRef, useState } from 'react'
import { allNodeDefs } from '../../../shared/registry'
import { useGve } from '../store'

interface CommandPaletteProps { open: boolean; onClose: () => void }
interface CommandItem { id: string; label: string; detail: string; run: () => void }

function CommandPalette({ open, onClose }: CommandPaletteProps): React.JSX.Element | null {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const flow = useGve(s => s.flow)
  const addBlock = useGve(s => s.addBlock)
  const undo = useGve(s => s.undo)
  const redo = useGve(s => s.redo)
  const pastLength = useGve(s => s.past.length)
  const futureLength = useGve(s => s.future.length)

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActiveIndex(0)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [open])

  const items = useMemo<CommandItem[]>(() => {
    const actions: CommandItem[] = []
    if (pastLength > 0) actions.push({ id: 'undo', label: 'Undo last change', detail: 'Ctrl/Cmd + Z', run: undo })
    if (futureLength > 0) actions.push({ id: 'redo', label: 'Redo last change', detail: 'Ctrl/Cmd + Shift + Z', run: redo })
    const blocks = allNodeDefs().map(definition => ({
      id: `add-${definition.type}`,
      label: `Add ${definition.name}`,
      detail: `${definition.category} block`,
      run: () => addBlock(definition.type, { parentId: null, index: flow.blocks.length })
    }))
    const normalized = query.trim().toLowerCase()
    return [...actions, ...blocks].filter(item => !normalized || `${item.label} ${item.detail}`.toLowerCase().includes(normalized))
  }, [addBlock, flow.blocks.length, futureLength, pastLength, query, redo, undo])

  if (!open) return null
  const choose = (item: CommandItem | undefined): void => { if (item) { item.run(); onClose() } }

  return (
    <div className="gve-modal-backdrop gve-command-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <section className="gve-command-palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="gve-command-search">
          <span className="gve-command-search-icon" aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            aria-label="Search commands"
            placeholder="Search commands or blocks..."
            value={query}
            onChange={event => { setQuery(event.target.value); setActiveIndex(0) }}
            onKeyDown={event => {
              if (event.key === 'Escape') onClose()
              if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex(index => Math.min(index + 1, Math.max(0, items.length - 1))) }
              if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex(index => Math.max(0, index - 1)) }
              if (event.key === 'Enter') { event.preventDefault(); choose(items[activeIndex]) }
            }}
          />
          <kbd>ESC</kbd>
        </div>
        <div className="gve-command-list" role="listbox" aria-label="Commands">
          {items.length === 0 ? <div className="gve-command-empty">No matching commands</div> : items.map((item, index) => (
            <button type="button" role="option" aria-selected={index === activeIndex} className={`gve-command-item${index === activeIndex ? ' gve-command-item-active' : ''}`} key={item.id} onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(item)}>
              <span>{item.label}</span><small>{item.detail}</small>
            </button>
          ))}
        </div>
        <div className="gve-command-footer"><span>↑↓ Navigate</span><span>Enter Run</span><span>Esc Close</span></div>
      </section>
    </div>
  )
}

export default CommandPalette
