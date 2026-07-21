import { useState } from 'react'
import { allNodeDefs } from '../../../shared/registry'
import type { NodeDefinition } from '../../../shared/registry/types'
import { useGve } from '../store'

const categories: NodeDefinition['category'][] = [
  'core', 'data', 'integration', 'clarity', 'advanced'
]

function Palette(): React.JSX.Element {
  const flow = useGve(s => s.flow)
  const addBlock = useGve(s => s.addBlock)
  const definitions = allNodeDefs()
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState<Partial<Record<NodeDefinition['category'], boolean>>>({})
  const normalizedQuery = query.trim().toLowerCase()

  const setAllCollapsed = (value: boolean): void => {
    setCollapsed(Object.fromEntries(categories.map(category => [category, value])))
  }

  return (
    <aside className="gve-palette" aria-label="Block palette">
      <div className="gve-panel-title">Blocks</div>
      <div className="gve-palette-search">
        <input
          type="search"
          aria-label="Search blocks"
          placeholder="Search blocks..."
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <div className="gve-palette-search-actions">
          <button type="button" onClick={() => setAllCollapsed(true)}>Collapse all</button>
          <button type="button" onClick={() => setAllCollapsed(false)}>Expand all</button>
        </div>
      </div>
      <div className="gve-palette-groups">
        {categories.map(category => {
          const entries = definitions.filter(def => {
            if (def.category !== category) return false
            if (!normalizedQuery) return true
            return `${def.name} ${def.type}`.toLowerCase().includes(normalizedQuery)
          })
          if (entries.length === 0) return null
          const isCollapsed = Boolean(collapsed[category]) && !normalizedQuery
          return (
            <section className="gve-palette-group" key={category}>
              <button
                type="button"
                className="gve-palette-label"
                aria-expanded={!isCollapsed}
                onClick={() => setCollapsed(value => ({ ...value, [category]: !value[category] }))}
              >
                <span>{category}</span>
                <span className="gve-palette-chevron" aria-hidden="true">{isCollapsed ? '▸' : '▾'}</span>
              </button>
              {!isCollapsed && entries.map(def => (
                <div
                  className="gve-palette-row"
                  key={def.type}
                  role="button"
                  tabIndex={0}
                  draggable
                  onDragStart={event => {
                    event.dataTransfer.setData('application/x-gve-new-block', def.type)
                    event.dataTransfer.effectAllowed = 'copy'
                  }}
                  onDoubleClick={() => addBlock(def.type, { parentId: null, index: flow.blocks.length })}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      addBlock(def.type, { parentId: null, index: flow.blocks.length })
                    }
                  }}
                >
                  <span className="gve-palette-dot" style={{ backgroundColor: def.color }} />
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
