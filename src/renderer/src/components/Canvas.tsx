import { useState } from 'react'
import type { Block } from '../../../shared/flow'
import { getNodeDef } from '../../../shared/registry'
import type { DropTarget } from '../../../shared/tree'
import { useGve } from '../store'
import BlockCard from './BlockCard'

function DropZone({ target }: { target: DropTarget }): React.JSX.Element {
  const [active, setActive] = useState(false)
  const addBlock = useGve(s => s.addBlock)
  const move = useGve(s => s.move)

  return (
    <div
      className={`gve-dropzone${active ? ' gve-dropzone-active' : ''}`}
      onDragEnter={() => setActive(true)}
      onDragLeave={() => setActive(false)}
      onDragOver={event => {
        event.preventDefault()
        event.dataTransfer.dropEffect = event.dataTransfer.types.includes('application/x-gve-new-block') ? 'copy' : 'move'
        setActive(true)
      }}
      onDrop={event => {
        event.preventDefault()
        event.stopPropagation()
        setActive(false)
        const newType = event.dataTransfer.getData('application/x-gve-new-block')
        if (newType) {
          addBlock(newType, target)
          return
        }
        const blockId = event.dataTransfer.getData('application/x-gve-move-block')
        if (blockId) move(blockId, target)
      }}
    />
  )
}

function BlockList({ blocks, parentId }: { blocks: Block[]; parentId: string | null }): React.JSX.Element {
  return (
    <div className="gve-block-list">
      <DropZone target={{ parentId, index: 0 }} />
      {blocks.map((block, index) => {
        const def = getNodeDef(block.type)
        return (
          <div className="gve-block-slot" key={block.id}>
            <BlockCard block={block}>
              {def.isContainer && (
                <div className="gve-nest">
                  <BlockList blocks={block.children ?? []} parentId={block.id} />
                </div>
              )}
            </BlockCard>
            <DropZone target={{ parentId, index: index + 1 }} />
          </div>
        )
      })}
    </div>
  )
}

function Canvas(): React.JSX.Element {
  const flow = useGve(s => s.flow)

  return (
    <main className="gve-canvas" aria-label="Flow canvas">
      <div className="gve-canvas-scroll">
        <div className="gve-flow-cap gve-flow-start">
          <span>START</span>
          <div className="gve-parameter-chips">
            {flow.parameters.map(parameter => (
              <span className="gve-parameter-chip" key={parameter.name}>{parameter.name}</span>
            ))}
          </div>
        </div>
        <BlockList blocks={flow.blocks} parentId={null} />
        <div className="gve-flow-cap gve-flow-end">END</div>
      </div>
    </main>
  )
}

export default Canvas
