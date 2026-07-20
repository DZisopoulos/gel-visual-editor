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

  return (
    <aside className="gve-palette" aria-label="Block palette">
      <div className="gve-panel-title">Blocks</div>
      <div className="gve-palette-groups">
        {categories.map(category => {
          const entries = definitions.filter(def => def.category === category)
          if (entries.length === 0) return null
          return (
            <section className="gve-palette-group" key={category}>
              <div className="gve-palette-label">{category}</div>
              {entries.map(def => (
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
