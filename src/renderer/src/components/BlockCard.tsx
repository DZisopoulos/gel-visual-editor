import type { ReactNode } from 'react'
import type { Block } from '../../../shared/flow'
import { getNodeDef } from '../../../shared/registry'
import { useGve } from '../store'
import { saveSnippet } from '../snippets'
import { useDialog } from './DialogProvider'
import { BlockIcon } from './BlockIcon'
import { setBlockDragPreview } from '../dragPreview'

interface BlockCardProps {
  block: Block
  children?: ReactNode
}

function BlockCard({ block, children }: BlockCardProps): React.JSX.Element {
  const def = getNodeDef(block.type)
  const selected = useGve((s) => s.selectedId === block.id)
  const select = useGve((s) => s.select)
  const remove = useGve((s) => s.remove)
  const toggleEnabled = useGve((s) => s.toggleEnabled)
  const duplicate = useGve((s) => s.duplicate)
  const summaryField = def.fields.find((field) => block.props[field.key])
  const summary = summaryField ? block.props[summaryField.key] : ''
  const { prompt } = useDialog()
  const saveAsSnippet = async (): Promise<void> => {
    const name = await prompt('Save snippet', 'Choose a name for this reusable block.', block.props.stepName || def.name)
    if (name) saveSnippet(block, name)
  }

  return (
    <article
      className={`gve-block${selected ? ' gve-block-selected' : ''}${block.enabled ? '' : ' gve-block-disabled'}`}
      role="button"
      tabIndex={0}
      draggable
      onClick={(event) => {
        event.stopPropagation()
        select(block.id)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          event.stopPropagation()
          select(block.id)
        }
      }}
      onDragStart={(event) => {
        event.stopPropagation()
        event.dataTransfer.setData('application/x-gve-move-block', block.id)
        event.dataTransfer.effectAllowed = 'move'
        setBlockDragPreview(event, def.name, def.color)
      }}
      style={{ '--block-color': def.color } as React.CSSProperties}
    >
      <div className="gve-block-head">
        <span className="gve-block-icon" aria-hidden="true">
          <BlockIcon type={block.type} definition={def} />
        </span>
        <div className="gve-block-title">
          <span className="gve-block-type">{def.name}</span>
          <span className={`gve-block-name${block.props.stepName ? '' : ' gve-block-name-muted'}`}>
            {block.props.stepName || 'Unnamed step'}
          </span>
        </div>
        <span className="gve-block-grip" aria-hidden="true">
          ⠿
        </span>
        <div className="gve-block-actions">
          <button type="button" aria-label={`Duplicate ${def.name}`} title="Duplicate block" onClick={(event) => { event.stopPropagation(); duplicate(block.id) }}>＋</button>
          <button type="button" aria-label={`Save ${def.name} as snippet`} title="Save as snippet" onClick={(event) => { event.stopPropagation(); void saveAsSnippet() }}>⌑</button>
          <button
            type="button"
            aria-label={block.enabled ? `Disable ${def.name}` : `Enable ${def.name}`}
            title={block.enabled ? 'Disable block' : 'Enable block'}
            onClick={(event) => {
              event.stopPropagation()
              toggleEnabled(block.id)
            }}
          >
            ⏻
          </button>
          <button
            type="button"
            aria-label={`Delete ${def.name}`}
            title="Delete block"
            onClick={(event) => {
              event.stopPropagation()
              remove(block.id)
            }}
          >
            ×
          </button>
        </div>
      </div>
      {summary && <div className="gve-block-summary">{summary}</div>}
      {children}
    </article>
  )
}

export default BlockCard
