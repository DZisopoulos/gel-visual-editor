import { useMemo, useState } from 'react'
import { allNodeDefs } from '../../../shared/registry'
import type { NodeDefinition } from '../../../shared/registry/types'
import { useGve } from '../store'
import TemplatePicker from './TemplatePicker'
import SnippetDialog from './SnippetDialog'
import type { SavedSnippet } from '../snippets'
import { BlockIcon } from './BlockIcon'
import { setBlockDragPreview } from '../dragPreview'

const categories: NodeDefinition['category'][] = [
  'core',
  'data',
  'integration',
  'clarity',
  'advanced'
]

function Palette({
  onResizeStart,
  onResizeKey,
  compact = false,
  collapsed = false,
  onToggleCollapsed
}: {
  onResizeStart?: (event: React.PointerEvent) => void
  onResizeKey?: (delta: number) => void
  compact?: boolean
  collapsed?: boolean
  onToggleCollapsed?: () => void
}): React.JSX.Element {
  const blocksLength = useGve((s) => s.flow.blocks.length)
  const addBlock = useGve((s) => s.addBlock)
  const loadFlow = useGve((s) => s.loadFlow)
  const insertExisting = useGve((s) => s.insertExisting)
  const definitions = useMemo(() => allNodeDefs(), [])
  const [query, setQuery] = useState('')
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [snippetsOpen, setSnippetsOpen] = useState(false)
  const [categoryCollapsed, setCategoryCollapsed] = useState<
    Partial<Record<NodeDefinition['category'], boolean>>
  >({})
  const normalizedQuery = query.trim().toLowerCase()

  const setAllCollapsed = (value: boolean): void => {
    setCategoryCollapsed(Object.fromEntries(categories.map((category) => [category, value])))
  }

  const entriesByCategory = useMemo(() => {
    const result: Partial<Record<NodeDefinition['category'], NodeDefinition[]>> = {}
    for (const category of categories) {
      result[category] = definitions.filter((def) => {
        if (def.category !== category) return false
        if (!normalizedQuery) return true
        return `${def.name} ${def.type}`.toLowerCase().includes(normalizedQuery)
      })
    }
    return result
  }, [definitions, normalizedQuery])

  return (
    <aside
      className={`gve-palette${collapsed ? ' gve-panel-rail' : ''}`}
      aria-label="Block palette"
    >
      {compact && (
        <button
          type="button"
          className="gve-panel-rail-toggle"
          aria-label={collapsed ? 'Expand block palette' : 'Collapse block palette'}
          title={collapsed ? 'Expand block palette' : 'Collapse block palette'}
          onClick={onToggleCollapsed}
        >
          {collapsed ? '›' : '‹'}
        </button>
      )}
      <div
        className="gve-panel-resize gve-panel-resize-right"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize block palette"
        tabIndex={0}
        onPointerDown={(event) => onResizeStart?.(event)}
        onKeyDown={(event) => {
          const STEP = 16
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            onResizeKey?.(-STEP)
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            onResizeKey?.(STEP)
          }
        }}
      />
      <div className="gve-panel-title">Blocks</div>
      <div className="gve-palette-search">
        <button
          type="button"
          className="gve-template-launcher"
          onClick={() => setTemplatesOpen(true)}
        >
          <span aria-hidden="true">✦</span> Starter templates
        </button>
        <button
          type="button"
          className="gve-snippet-launcher"
          onClick={() => setSnippetsOpen(true)}
        >
          <span aria-hidden="true">⌑</span> Snippet library
        </button>
        <input
          type="search"
          aria-label="Search blocks"
          placeholder="Search blocks..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="gve-palette-search-actions">
          <button type="button" onClick={() => setAllCollapsed(true)}>
            Collapse all
          </button>
          <button type="button" onClick={() => setAllCollapsed(false)}>
            Expand all
          </button>
        </div>
      </div>
      <TemplatePicker
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onChoose={(template) => {
          loadFlow(template.create(), null)
          setTemplatesOpen(false)
        }}
      />
      <SnippetDialog
        open={snippetsOpen}
        onClose={() => setSnippetsOpen(false)}
        onInsert={(snippet: SavedSnippet) =>
          insertExisting(snippet.block, { parentId: null, index: blocksLength })
        }
      />
      <div className="gve-palette-groups">
        {categories.map((category) => {
          const entries = entriesByCategory[category] ?? []
          if (entries.length === 0) return null
          const isCollapsed = Boolean(categoryCollapsed[category]) && !normalizedQuery
          return (
            <section className="gve-palette-group" key={category}>
              <button
                type="button"
                className="gve-palette-label"
                aria-expanded={!isCollapsed}
                onClick={() =>
                  setCategoryCollapsed((value) => ({ ...value, [category]: !value[category] }))
                }
              >
                <span>{category}</span>
                <span
                  className={`gve-palette-chevron${isCollapsed ? ' gve-palette-chevron-collapsed' : ''}`}
                  aria-hidden="true"
                />
              </button>
              {!isCollapsed &&
                entries.map((def) => (
                  <button
                    type="button"
                    className="gve-palette-row"
                    key={def.type}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData('application/x-gve-new-block', def.type)
                      event.dataTransfer.effectAllowed = 'copy'
                      setBlockDragPreview(event, def.name, def.color)
                    }}
                    onDoubleClick={() =>
                      addBlock(def.type, { parentId: null, index: blocksLength })
                    }
                    onClick={(event) => {
                      // Documented interaction is mouse double-click (see Canvas.tsx's
                      // empty-state hint), so a plain mouse click must stay a no-op.
                      // A native <button> fires `click` for a real mouse click AND for
                      // keyboard Enter/Space activation, and it fires `click` twice plus
                      // `dblclick` once for a real double-click — wiring both onClick and
                      // onDoubleClick unconditionally would triple-add a block per
                      // double-click. Keyboard-synthesized clicks are reported with
                      // `detail === 0` (mouse clicks report the click count, starting at
                      // 1), so use that to let only Enter/Space reach addBlock here while
                      // real mouse clicks/double-clicks fall through to onDoubleClick above.
                      if (event.detail !== 0) return
                      addBlock(def.type, { parentId: null, index: blocksLength })
                    }}
                  >
                    <span className="gve-palette-dot" style={{ backgroundColor: def.color }} />
                    <BlockIcon type={def.type} definition={def} className="gve-palette-icon" />
                    <span>{def.name}</span>
                  </button>
                ))}
            </section>
          )
        })}
      </div>
    </aside>
  )
}

export default Palette
