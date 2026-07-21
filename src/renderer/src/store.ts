import { create } from 'zustand'
import type { Block, Flow, FlowMeta, FlowParameter } from '../../shared/flow'
import { createEmptyFlow, newId } from '../../shared/flow'
import { insertBlock, moveBlock, removeBlock, findBlock, type DropTarget } from '../../shared/tree'
import { createBlock } from '../../shared/registry'

export interface GveState {
  flow: Flow; selectedId: string | null; dirty: boolean; filePath: string | null
  past: Flow[]; future: Flow[]
  select(id: string | null): void
  loadFlow(flow: Flow, filePath: string | null): void
  addBlock(type: string, target: DropTarget): void
  updateProps(id: string, patch: Record<string, string>): void
  updateMeta(patch: Partial<FlowMeta>): void
  updateParameters(params: FlowParameter[]): void
  move(id: string, target: DropTarget): void
  remove(id: string): void
  toggleEnabled(id: string): void
  duplicate(id: string): void
  insertExisting(block: Block, target: DropTarget): void
  markSaved(filePath: string): void
  undo(): void; redo(): void
}

const snap = (s: { flow: Flow; past: Flow[] }) =>
  ({ past: [...s.past.slice(-99), structuredClone(s.flow)], future: [] as Flow[], dirty: true })

function cloneWithNewIds(block: import('../../shared/flow').Block): import('../../shared/flow').Block {
  return { ...structuredClone(block), id: newId(), ...(block.children ? { children: block.children.map(cloneWithNewIds) } : {}) }
}

function duplicateInList(blocks: import('../../shared/flow').Block[], id: string): { blocks: import('../../shared/flow').Block[]; copy: import('../../shared/flow').Block | null } {
  const directIndex = blocks.findIndex(block => block.id === id)
  if (directIndex >= 0) {
    const copy = cloneWithNewIds(blocks[directIndex])
    const next = [...blocks]; next.splice(directIndex + 1, 0, copy)
    return { blocks: next, copy }
  }
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index]
    if (!block.children) continue
    const result = duplicateInList(block.children, id)
    if (result.copy) { const next = [...blocks]; next[index] = { ...block, children: result.blocks }; return { blocks: next, copy: result.copy } }
  }
  return { blocks, copy: null }
}

function rekey(block: Block): Block { return { ...structuredClone(block), id: newId(), ...(block.children ? { children: block.children.map(rekey) } : {}) } }

export const useGve = create<GveState>((set) => ({
  flow: createEmptyFlow(), selectedId: null, dirty: false, filePath: null, past: [], future: [],
  select: id => set({ selectedId: id }),
  loadFlow: (flow, filePath) => set({ flow, filePath, selectedId: null, dirty: false, past: [], future: [] }),
  addBlock: (type, target) => set(s => {
    const blk = createBlock(type)
    return { ...snap(s), flow: { ...s.flow, blocks: insertBlock(s.flow.blocks, blk, target) }, selectedId: blk.id }
  }),
  updateProps: (id, patch) => set(s => {
    let found = false
    const walk = (bs: typeof s.flow.blocks): typeof s.flow.blocks => bs.map(b => {
      if (b.id === id) {
        found = true
        return { ...b, props: { ...b.props, ...patch } }
      }
      return b.children ? { ...b, children: walk(b.children) } : b
    })
    const blocks = walk(s.flow.blocks)
    return found ? { ...snap(s), flow: { ...s.flow, blocks } } : s
  }),
  updateMeta: patch => set(s => ({ ...snap(s), flow: { ...s.flow, meta: { ...s.flow.meta, ...patch } } })),
  updateParameters: parameters => set(s => ({ ...snap(s), flow: { ...s.flow, parameters } })),
  move: (id, target) => set(s => {
    const blocks = moveBlock(s.flow.blocks, id, target)
    return blocks === s.flow.blocks ? s : { ...snap(s), flow: { ...s.flow, blocks } }
  }),
  remove: id => set(s => {
    const { blocks, removed } = removeBlock(s.flow.blocks, id)
    if (!removed) return s
    return {
      ...snap(s), flow: { ...s.flow, blocks },
      selectedId: s.selectedId === id || (s.selectedId && !findBlock(blocks, s.selectedId)) ? null : s.selectedId
    }
  }),
  toggleEnabled: id => set(s => {
    let found = false
    const walk = (bs: typeof s.flow.blocks): typeof s.flow.blocks => bs.map(b => {
      if (b.id === id) {
        found = true
        return { ...b, enabled: !b.enabled }
      }
      return b.children ? { ...b, children: walk(b.children) } : b
    })
    const blocks = walk(s.flow.blocks)
    return found ? { ...snap(s), flow: { ...s.flow, blocks } } : s
  }),
  duplicate: id => set(s => {
    const result = duplicateInList(s.flow.blocks, id)
    return result.copy ? { ...snap(s), flow: { ...s.flow, blocks: result.blocks }, selectedId: result.copy.id } : s
  }),
  insertExisting: (block, target) => set(s => {
    const copy = rekey(block)
    return { ...snap(s), flow: { ...s.flow, blocks: insertBlock(s.flow.blocks, copy, target) }, selectedId: copy.id }
  }),
  markSaved: filePath => set({ dirty: false, filePath }),
  undo: () => set(s => s.past.length === 0 ? s : {
    flow: s.past[s.past.length - 1], past: s.past.slice(0, -1),
    future: [structuredClone(s.flow), ...s.future], dirty: true, selectedId: null
  }),
  redo: () => set(s => s.future.length === 0 ? s : {
    flow: s.future[0], future: s.future.slice(1),
    past: [...s.past, structuredClone(s.flow)], dirty: true, selectedId: null
  })
}))
