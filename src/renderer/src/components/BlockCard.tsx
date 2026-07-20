import type { ReactNode } from 'react'
import type { Block } from '../../../shared/flow'
import { getNodeDef } from '../../../shared/registry'
import { useGve } from '../store'

interface BlockCardProps {
  block: Block
  children?: ReactNode
}

function BlockCard({ block, children }: BlockCardProps): React.JSX.Element {
  const def = getNodeDef(block.type)
  const selected = useGve(s => s.selectedId === block.id)
  const select = useGve(s => s.select)
  const remove = useGve(s => s.remove)
  const toggleEnabled = useGve(s => s.toggleEnabled)
  const summaryField = def.fields.find(field => block.props[field.key])
  const summary = summaryField ? block.props[summaryField.key] : ''

  return (
    <article
      className={`gve-block${selected ? ' gve-block-selected' : ''}${block.enabled ? '' : ' gve-block-disabled'}`}
      draggable
      onClick={() => select(block.id)}
      onDragStart={event => {
        event.dataTransfer.setData('application/x-gve-move-block', block.id)
        event.dataTransfer.effectAllowed = 'move'
      }}
      style={{ '--block-color': def.color } as React.CSSProperties}
    >
      <div className="gve-block-head">
        <div className="gve-block-title">
          <span className="gve-block-type">{def.name}</span>
          {block.props.stepName && <span className="gve-block-name">{block.props.stepName}</span>}
        </div>
        <div className="gve-block-actions">
          <button
            type="button"
            aria-label={block.enabled ? `Disable ${def.name}` : `Enable ${def.name}`}
            title={block.enabled ? 'Disable block' : 'Enable block'}
            onClick={event => { event.stopPropagation(); toggleEnabled(block.id) }}
          >⏻</button>
          <button
            type="button"
            aria-label={`Delete ${def.name}`}
            title="Delete block"
            onClick={event => { event.stopPropagation(); remove(block.id) }}
          >×</button>
        </div>
      </div>
      {summary && <div className="gve-block-summary">{summary}</div>}
      {children}
    </article>
  )
}

export default BlockCard
