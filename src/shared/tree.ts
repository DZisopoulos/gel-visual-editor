import type { Block } from './flow'

export interface DropTarget { parentId: string | null; index: number }

export function findBlock(blocks: Block[], id: string): Block | null {
  for (const blk of blocks) {
    if (blk.id === id) return blk
    if (blk.children) { const hit = findBlock(blk.children, id); if (hit) return hit }
  }
  return null
}

export function isDescendant(blocks: Block[], ancestorId: string, id: string): boolean {
  const anc = findBlock(blocks, ancestorId)
  return !!anc?.children && findBlock(anc.children, id) !== null
}

export function removeBlock(blocks: Block[], id: string): { blocks: Block[]; removed: Block | null } {
  let removed: Block | null = null
  const walk = (list: Block[]): Block[] => {
    const out: Block[] = []
    for (const blk of list) {
      if (blk.id === id) { removed = blk; continue }
      out.push(blk.children ? { ...blk, children: walk(blk.children) } : blk)
    }
    return out
  }
  return { blocks: walk(blocks), removed }
}

export function insertBlock(blocks: Block[], block: Block, target: DropTarget): Block[] {
  if (target.parentId === null) {
    const out = [...blocks]; out.splice(target.index, 0, block); return out
  }
  let found = false
  const walk = (list: Block[]): Block[] => list.map(blk => {
    if (blk.id === target.parentId) {
      found = true
      if (!blk.children) throw new Error(`Block ${blk.id} (${blk.type}) is not a container`)
      const kids = [...blk.children]; kids.splice(target.index, 0, block)
      return { ...blk, children: kids }
    }
    return blk.children ? { ...blk, children: walk(blk.children) } : blk
  })
  const out = walk(blocks)
  if (!found) throw new Error(`Parent ${target.parentId} not found`)
  return out
}

export function moveBlock(blocks: Block[], id: string, target: DropTarget): Block[] {
  if (target.parentId === id || (target.parentId && isDescendant(blocks, id, target.parentId))) return blocks
  const { blocks: without, removed } = removeBlock(blocks, id)
  if (!removed) return blocks
  return insertBlock(without, removed, target)
}
