import type { Block } from '../../../shared/flow'
import { getNodeDef } from '../../../shared/registry'
import { useGve } from '../store'

interface OutlinePanelProps {
  onClose: () => void
}

function OutlineRows({
  blocks,
  depth = 0,
  onClose
}: {
  blocks: Block[]
  depth?: number
  onClose: () => void
}): React.JSX.Element {
  const selectedId = useGve((s) => s.selectedId)
  const select = useGve((s) => s.select)
  return (
    <>
      {blocks.map((block) => {
        const definition = getNodeDef(block.type)
        return (
          <div key={block.id}>
            <button
              type="button"
              className={`gve-outline-row${selectedId === block.id ? ' gve-outline-row-selected' : ''}`}
              style={{ paddingLeft: `${12 + depth * 14}px` }}
              onClick={() => {
                select(block.id)
                onClose()
              }}
            >
              <span className="gve-outline-dot" style={{ backgroundColor: definition.color }} />
              <span>{block.props.stepName || definition.name}</span>
            </button>
            {block.children && (
              <OutlineRows blocks={block.children} depth={depth + 1} onClose={onClose} />
            )}
          </div>
        )
      })}
    </>
  )
}

function OutlinePanel({ onClose }: OutlinePanelProps): React.JSX.Element {
  const flow = useGve((s) => s.flow)
  return (
    <aside className="gve-outline-panel" aria-label="Flow outline">
      <div className="gve-outline-header">
        <div>
          <span className="gve-validation-eyebrow">NAVIGATOR</span>
          <strong>Flow outline</strong>
        </div>
        <button type="button" aria-label="Close flow outline" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="gve-outline-list">
        <div className="gve-outline-cap">START</div>
        <OutlineRows blocks={flow.blocks} onClose={onClose} />
        <div className="gve-outline-cap">END</div>
      </div>
    </aside>
  )
}

export default OutlinePanel
