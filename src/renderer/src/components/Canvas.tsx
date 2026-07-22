import { useEffect, useState } from 'react'
import type { Block } from '../../../shared/flow'
import { getNodeDef } from '../../../shared/registry'
import type { DropTarget } from '../../../shared/tree'
import { useGve } from '../store'
import BlockCard from './BlockCard'
import OutlinePanel from './OutlinePanel'

function DropZone({ target }: { target: DropTarget }): React.JSX.Element {
  const [active, setActive] = useState(false)
  const addBlock = useGve((s) => s.addBlock)
  const move = useGve((s) => s.move)

  return (
    <div
      className={`gve-dropzone${active ? ' gve-dropzone-active' : ''}`}
      onDragEnter={() => setActive(true)}
      onDragLeave={() => setActive(false)}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = event.dataTransfer.types.includes(
          'application/x-gve-new-block'
        )
          ? 'copy'
          : 'move'
        setActive(true)
      }}
      onDrop={(event) => {
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
    >
      <svg className="gve-connector-svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2v17M7 14l5 5 5-5" />
      </svg>
    </div>
  )
}

function BlockList({
  blocks,
  parentId
}: {
  blocks: Block[]
  parentId: string | null
}): React.JSX.Element {
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
  const flow = useGve((s) => s.flow)
  const select = useGve((s) => s.select)
  const addBlock = useGve((s) => s.addBlock)
  const isLoading = useGve((s) => s.isLoading)
  const [zoom, setZoom] = useState(1)
  const [outlineOpen, setOutlineOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!(event.ctrlKey || event.metaKey)) return
      if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        setZoom((value) => Math.min(1.4, Number((value + 0.1).toFixed(1))))
      }
      if (event.key === '-') {
        event.preventDefault()
        setZoom((value) => Math.max(0.7, Number((value - 0.1).toFixed(1))))
      }
      if (event.key === '0') {
        event.preventDefault()
        setZoom(1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <main className="gve-canvas" aria-label="Flow canvas" onClick={() => select(null)}>
      <div
        className="gve-canvas-toolbar"
        aria-label="Canvas zoom controls"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Toggle flow outline"
          title="Toggle flow outline"
          className={outlineOpen ? 'gve-canvas-tool-active' : ''}
          onClick={() => setOutlineOpen((value) => !value)}
        >
          ☷
        </button>
        <span className="gve-canvas-toolbar-divider" />
        <button
          type="button"
          aria-label="Zoom out"
          title="Zoom out (Ctrl/Cmd -)"
          onClick={() => setZoom((value) => Math.max(0.7, Number((value - 0.1).toFixed(1))))}
        >
          −
        </button>
        <button
          type="button"
          className="gve-zoom-value"
          aria-label="Reset zoom"
          title="Reset zoom (Ctrl/Cmd 0)"
          onClick={() => setZoom(1)}
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          aria-label="Zoom in"
          title="Zoom in (Ctrl/Cmd +)"
          onClick={() => setZoom((value) => Math.min(1.4, Number((value + 0.1).toFixed(1))))}
        >
          +
        </button>
      </div>
      {outlineOpen && <OutlinePanel onClose={() => setOutlineOpen(false)} />}
      <div className="gve-canvas-scroll">
        <div className="gve-flow-stack" style={{ zoom }}>
          {isLoading && (
            <div className="gve-flow-loading-skeleton" aria-label="Loading flow" aria-busy="true">
              <span />
              <span />
              <span />
            </div>
          )}
          <div className="gve-flow-cap gve-flow-start">
            <span>START</span>
            <div className="gve-parameter-chips">
              {flow.parameters.map((parameter) => (
                <span className="gve-parameter-chip" key={parameter.id}>
                  {parameter.name}
                </span>
              ))}
            </div>
          </div>
          {flow.blocks.length === 0 ? (
            <div className="gve-empty-state">
              <div className="gve-empty-icon" aria-hidden="true">
                ✦
              </div>
              <h2>Start building your flow</h2>
              <p>Drag a block here, or double-click one in the palette to add it.</p>
              <div className="gve-empty-quick-actions">
                {(['sql-query', 'for-each', 'log-message'] as const).map((type) => {
                  const label =
                    type === 'sql-query'
                      ? 'Add SQL Query'
                      : type === 'for-each'
                        ? 'Add For Each'
                        : 'Add Log Message'
                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={(event) => {
                        event.stopPropagation()
                        addBlock(type, { parentId: null, index: flow.blocks.length })
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              <DropZone target={{ parentId: null, index: 0 }} />
            </div>
          ) : (
            <BlockList blocks={flow.blocks} parentId={null} />
          )}
          <div className="gve-flow-cap gve-flow-end">END</div>
        </div>
      </div>
    </main>
  )
}

export default Canvas
