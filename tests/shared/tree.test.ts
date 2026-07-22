import { describe, it, expect } from 'vitest'
import { createEmptyFlow, newId, type Block } from '../../src/shared/flow'
import { findBlock, isDescendant, removeBlock, insertBlock, moveBlock } from '../../src/shared/tree'

const b = (id: string, type = 'log-message', children?: Block[]): Block => ({
  id,
  type,
  props: {},
  enabled: true,
  ...(children ? { children } : {})
})

const tree = (): Block[] => [b('a'), b('loop', 'for-each', [b('x'), b('y')]), b('c')]

describe('tree ops', () => {
  it('findBlock finds nested blocks', () => {
    expect(findBlock(tree(), 'y')?.id).toBe('y')
    expect(findBlock(tree(), 'nope')).toBeNull()
  })
  it('isDescendant detects nesting', () => {
    expect(isDescendant(tree(), 'loop', 'x')).toBe(true)
    expect(isDescendant(tree(), 'loop', 'a')).toBe(false)
  })
  it('removeBlock removes and returns the block, immutably', () => {
    const input = tree()
    const { blocks, removed } = removeBlock(input, 'x')
    expect(removed?.id).toBe('x')
    expect(findBlock(blocks, 'x')).toBeNull()
    expect(findBlock(input, 'x')?.id).toBe('x') // input untouched
  })
  it('insertBlock inserts at root index', () => {
    const out = insertBlock(tree(), b('n'), { parentId: null, index: 1 })
    expect(out.map((x) => x.id)).toEqual(['a', 'n', 'loop', 'c'])
  })
  it('insertBlock inserts into a container', () => {
    const out = insertBlock(tree(), b('n'), { parentId: 'loop', index: 2 })
    expect(findBlock(out, 'loop')!.children!.map((x) => x.id)).toEqual(['x', 'y', 'n'])
  })
  it('insertBlock throws for a non-container parent', () => {
    expect(() => insertBlock(tree(), b('n'), { parentId: 'a', index: 0 })).toThrow()
  })
  it('moveBlock moves between levels', () => {
    const out = moveBlock(tree(), 'a', { parentId: 'loop', index: 0 })
    expect(out.map((x) => x.id)).toEqual(['loop', 'c'])
    expect(findBlock(out, 'loop')!.children!.map((x) => x.id)).toEqual(['a', 'x', 'y'])
  })
  it('moveBlock adjusts downward indices within the same sibling list', () => {
    const root = [b('a'), b('b'), b('c')]
    expect(moveBlock(root, 'a', { parentId: null, index: 2 }).map((x) => x.id)).toEqual([
      'b',
      'a',
      'c'
    ])

    const nested = [b('loop', 'for-each', [b('x'), b('y'), b('z')])]
    const moved = moveBlock(nested, 'x', { parentId: 'loop', index: 2 })
    expect(findBlock(moved, 'loop')!.children!.map((x) => x.id)).toEqual(['y', 'x', 'z'])
  })
  it('moveBlock refuses to move a block into itself', () => {
    const input = tree()
    expect(moveBlock(input, 'loop', { parentId: 'loop', index: 0 })).toBe(input)
  })
  it('createEmptyFlow gives a valid empty flow', () => {
    const f = createEmptyFlow('Test')
    expect(f.gveVersion).toBe('1.0')
    expect(f.meta.name).toBe('Test')
    expect(f.blocks).toEqual([])
    expect(newId()).not.toBe(newId())
  })
})
