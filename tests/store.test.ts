import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useGve } from '../src/renderer/src/store'
import { createEmptyFlow } from '../src/shared/flow'

describe('store', () => {
  beforeEach(() => {
    useGve.getState().loadFlow(createEmptyFlow('T'), null)
  })
  afterEach(() => {
    vi.useRealTimers()
  })

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
  it('updateProps preserves object identity for untouched sibling blocks', () => {
    useGve.getState().addBlock('log-message', { parentId: null, index: 0 })
    useGve.getState().addBlock('sql-query', { parentId: null, index: 1 })
    const before = useGve.getState().flow.blocks
    const [editedId] = before.map((block) => block.id)
    const untouchedBefore = before[1]

    useGve.getState().updateProps(editedId, { message: 'hello' })

    const after = useGve.getState().flow.blocks
    expect(after[0]).not.toBe(before[0])
    expect(after[1]).toBe(untouchedBefore)
  })
  it('updateProps preserves identity for untouched blocks in a nested container', () => {
    useGve.getState().addBlock('for-each', { parentId: null, index: 0 })
    const loopId = useGve.getState().flow.blocks[0].id
    useGve.getState().addBlock('log-message', { parentId: loopId, index: 0 })
    useGve.getState().addBlock('sql-query', { parentId: loopId, index: 1 })
    const beforeChildren = useGve.getState().flow.blocks[0].children!
    const [editedChildId] = beforeChildren.map((block) => block.id)
    const untouchedChildBefore = beforeChildren[1]

    useGve.getState().updateProps(editedChildId, { message: 'hi' })

    const afterChildren = useGve.getState().flow.blocks[0].children!
    expect(afterChildren[1]).toBe(untouchedChildBefore)
  })
  it('toggleEnabled preserves object identity for untouched sibling blocks', () => {
    useGve.getState().addBlock('log-message', { parentId: null, index: 0 })
    useGve.getState().addBlock('sql-query', { parentId: null, index: 1 })
    const before = useGve.getState().flow.blocks
    const untouchedBefore = before[1]

    useGve.getState().toggleEnabled(before[0].id)

    const after = useGve.getState().flow.blocks
    expect(after[0]).not.toBe(before[0])
    expect(after[0].enabled).toBe(false)
    expect(after[1]).toBe(untouchedBefore)
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
    expect(s.past).toHaveLength(0)
    expect(s.dirty).toBe(false)
    expect(s.filePath).toBe('C:/x.gve')
  })
  it('updateParameters replaces parameters and snapshots the flow', () => {
    const parameters = [{ id: 'p1', name: 'projectId', type: 'string' as const, default: '' }]
    useGve.getState().updateParameters(parameters)
    const s = useGve.getState()
    expect(s.flow.parameters).toEqual(parameters)
    expect(s.past).toHaveLength(1)
    expect(s.dirty).toBe(true)
  })
  it('moveBy swaps a block with its previous/next sibling and snapshots history', () => {
    useGve.getState().addBlock('log-message', { parentId: null, index: 0 })
    useGve.getState().addBlock('sql-query', { parentId: null, index: 1 })
    useGve.getState().addBlock('for-each', { parentId: null, index: 2 })
    const [a, b, c] = useGve.getState().flow.blocks.map((block) => block.id)
    const afterAdds = useGve.getState().past.length

    useGve.getState().moveBy(b, 1)
    expect(useGve.getState().flow.blocks.map((block) => block.id)).toEqual([a, c, b])
    expect(useGve.getState().past).toHaveLength(afterAdds + 1)

    useGve.getState().moveBy(b, -1)
    expect(useGve.getState().flow.blocks.map((block) => block.id)).toEqual([a, b, c])

    useGve.getState().undo()
    expect(useGve.getState().flow.blocks.map((block) => block.id)).toEqual([a, c, b])
  })
  it('moveBy is a no-op at the start/end of the list', () => {
    useGve.getState().addBlock('log-message', { parentId: null, index: 0 })
    useGve.getState().addBlock('sql-query', { parentId: null, index: 1 })
    const [a, b] = useGve.getState().flow.blocks.map((block) => block.id)
    useGve.getState().markSaved('C:/x.gve')
    const saved = useGve.getState()

    useGve.getState().moveBy(a, -1)
    const after = useGve.getState()
    expect(after.flow).toBe(saved.flow)
    expect(after.dirty).toBe(false)

    useGve.getState().moveBy(b, 1)
    expect(useGve.getState().flow).toBe(saved.flow)
    expect(useGve.getState().flow.blocks.map((block) => block.id)).toEqual([a, b])
  })
  it('moveBy reorders within a nested container', () => {
    useGve.getState().addBlock('for-each', { parentId: null, index: 0 })
    const loopId = useGve.getState().flow.blocks[0].id
    useGve.getState().addBlock('log-message', { parentId: loopId, index: 0 })
    useGve.getState().addBlock('sql-query', { parentId: loopId, index: 1 })
    const [child0, child1] = useGve.getState().flow.blocks[0].children!.map((block) => block.id)

    useGve.getState().moveBy(child0, 1)
    expect(useGve.getState().flow.blocks[0].children!.map((block) => block.id)).toEqual([
      child1,
      child0
    ])
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
  it('coalesces an unbroken run of edits to one field into one undo entry', () => {
    vi.useFakeTimers()
    useGve.getState().addBlock('log-message', { parentId: null, index: 0 })
    const id = useGve.getState().flow.blocks[0].id
    const afterAdd = useGve.getState().past.length

    for (const message of ['h', 'he', 'hel', 'hell', 'hello']) {
      useGve.getState().updateProps(id, { message })
      vi.advanceTimersByTime(50)
    }

    expect(useGve.getState().past).toHaveLength(afterAdd + 1)
    useGve.getState().undo()
    expect(useGve.getState().flow.blocks[0].props.message).toBe('')
  })

  it('starts a new undo entry when the edited field changes', () => {
    vi.useFakeTimers()
    useGve.getState().addBlock('log-message', { parentId: null, index: 0 })
    const id = useGve.getState().flow.blocks[0].id
    const afterAdd = useGve.getState().past.length

    useGve.getState().updateProps(id, { message: 'hello' })
    useGve.getState().updateProps(id, { stepName: 'Greet' })

    expect(useGve.getState().past).toHaveLength(afterAdd + 2)
  })

  it('starts a new undo entry once the coalesce window lapses', () => {
    vi.useFakeTimers()
    useGve.getState().addBlock('log-message', { parentId: null, index: 0 })
    const id = useGve.getState().flow.blocks[0].id
    const afterAdd = useGve.getState().past.length

    useGve.getState().updateProps(id, { message: 'hello' })
    vi.advanceTimersByTime(2000)
    useGve.getState().updateProps(id, { message: 'hello there' })

    expect(useGve.getState().past).toHaveLength(afterAdd + 2)
  })

  it('a structural edit breaks the run so typing after it is not folded in', () => {
    vi.useFakeTimers()
    useGve.getState().addBlock('log-message', { parentId: null, index: 0 })
    const id = useGve.getState().flow.blocks[0].id

    useGve.getState().updateProps(id, { message: 'hello' })
    useGve.getState().toggleEnabled(id)
    const afterToggle = useGve.getState().past.length
    useGve.getState().updateProps(id, { message: 'hello again' })

    expect(useGve.getState().past).toHaveLength(afterToggle + 1)
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
