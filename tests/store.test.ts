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
  it('updateParameters replaces parameters and snapshots the flow', () => {
    const parameters = [{ name: 'projectId', type: 'string' as const, default: '' }]
    useGve.getState().updateParameters(parameters)
    const s = useGve.getState()
    expect(s.flow.parameters).toEqual(parameters)
    expect(s.past).toHaveLength(1)
    expect(s.dirty).toBe(true)
  })
  it('rejected self moves do not dirty the flow or add history', () => {
    useGve.getState().addBlock('for-each', { parentId: null, index: 0 })
    const before = useGve.getState()
    const id = before.flow.blocks[0].id
    useGve.getState().markSaved('C:/x.gve')
    const saved = useGve.getState()

    useGve.getState().move(id, { parentId: id, index: 0 })

    const after = useGve.getState()
    expect(after.flow).toBe(saved.flow)
    expect(after.past).toBe(saved.past)
    expect(after.future).toBe(saved.future)
    expect(after.dirty).toBe(false)
  })
  it('actions targeting missing blocks are no-ops', () => {
    const before = useGve.getState()
    before.updateProps('missing', { message: 'nope' })
    useGve.getState().remove('missing')
    useGve.getState().toggleEnabled('missing')
    useGve.getState().move('missing', { parentId: null, index: 0 })
    expect(useGve.getState()).toBe(before)
  })
})
