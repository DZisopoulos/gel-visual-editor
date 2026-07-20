import { describe, it, expect, beforeEach } from 'vitest'
import { useGve } from '../src/renderer/src/store'
import { createEmptyFlow } from '../src/shared/flow'

describe('store', () => {
  beforeEach(() => { useGve.getState().loadFlow(createEmptyFlow('T'), null) })

  it('addBlock inserts, selects and marks dirty', () => {
    useGve.getState().addBlock('log-message', { parentId: null, index: 0 })
    const s = useGve.getState()
    expect(s.flow.blocks).toHaveLength(1)
    expect(s.selectedId).toBe(s.flow.blocks[0].id)
    expect(s.dirty).toBe(true)
  })
  it('updateProps patches a block', () => {
    useGve.getState().addBlock('log-message', { parentId: null, index: 0 })
    const id = useGve.getState().flow.blocks[0].id
    useGve.getState().updateProps(id, { message: 'hello' })
    expect(useGve.getState().flow.blocks[0].props.message).toBe('hello')
  })
  it('undo/redo restores snapshots', () => {
    useGve.getState().addBlock('log-message', { parentId: null, index: 0 })
    useGve.getState().undo()
    expect(useGve.getState().flow.blocks).toHaveLength(0)
    useGve.getState().redo()
    expect(useGve.getState().flow.blocks).toHaveLength(1)
  })
  it('remove deletes and clears selection of the removed block', () => {
    useGve.getState().addBlock('log-message', { parentId: null, index: 0 })
    const id = useGve.getState().flow.blocks[0].id
    useGve.getState().remove(id)
    expect(useGve.getState().flow.blocks).toHaveLength(0)
    expect(useGve.getState().selectedId).toBeNull()
  })
  it('loadFlow resets history and dirty', () => {
    useGve.getState().addBlock('log-message', { parentId: null, index: 0 })
    useGve.getState().loadFlow(createEmptyFlow('New'), 'C:/x.gve')
    const s = useGve.getState()
    expect(s.past).toHaveLength(0); expect(s.dirty).toBe(false); expect(s.filePath).toBe('C:/x.gve')
  })
})
