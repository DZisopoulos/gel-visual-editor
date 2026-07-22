import { useState } from 'react'
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
  compact = false,
  collapsed = false,
  onToggleCollapsed
}: {
  onResizeStart?: (event: React.PointerEvent) => void
  compact?: boolean
  collapsed?: boolean
  onToggleCollapsed?: () => void
}): React.JSX.Element {
  const flow = useGve((s) => s.flow)
  const addBlock = useGve((s) => s.addBlock)
  const loadFlow = useGve((s) => s.loadFlow)
  const insertExisting = useGve((s) => s.insertExisting)
  const definitions = allNodeDefs()
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
        onPointerDown={(event) => onResizeStart?.(event)}
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
          insertExisting(snippet.block, { parentId: null, index: flow.blocks.length })
        }
      />
      <div className="gve-palette-groups">
        {categories.map((category) => {
          const entries = definitions.filter((def) => {
            if (def.category !== category) return false
            if (!normalizedQuery) return true
            return `${def.name} ${def.type}`.toLowerCase().includes(normalizedQuery)
          })
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
                  <div
                    className="gve-palette-row"
                    key={def.type}
                    role="button"
                    tabIndex={0}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData('application/x-gve-new-block', def.type)
                      event.dataTransfer.effectAllowed = 'copy'
                      setBlockDragPreview(event, def.name, def.color)
                    }}
                    onDoubleClick={() =>
                      addBlock(def.type, { parentId: null, index: flow.blocks.length })
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        addBlock(def.type, { parentId: null, index: flow.blocks.length })
                      }
                    }}
                  >
                    <span className="gve-palette-dot" style={{ backgroundColor: def.color }} />
                    <BlockIcon type={def.type} definition={def} className="gve-palette-icon" />
                    <span>{def.name}</span>
                  </div>
                ))}
            </section>
          )
        })}
      </div>
    </aside>
  )
}

export default Palette
