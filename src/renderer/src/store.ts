import { create } from 'zustand'
import type { Flow, FlowMeta } from '../../shared/flow'
import { createEmptyFlow } from '../../shared/flow'
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
  move(id: string, target: DropTarget): void
  remove(id: string): void
  toggleEnabled(id: string): void
  markSaved(filePath: string): void
  undo(): void; redo(): void
}

const snap = (s: { flow: Flow; past: Flow[] }) =>
  ({ past: [...s.past.slice(-99), structuredClone(s.flow)], future: [] as Flow[], dirty: true })

export const useGve = create<GveState>((set, get) => ({
  flow: createEmptyFlow(), selectedId: null, dirty: false, filePath: null, past: [], future: [],
  select: id => set({ selectedId: id }),
  loadFlow: (flow, filePath) => set({ flow, filePath, selectedId: null, dirty: false, past: [], future: [] }),
  addBlock: (type, target) => set(s => {
    const blk = createBlock(type)
    return { ...snap(s), flow: { ...s.flow, blocks: insertBlock(s.flow.blocks, blk, target) }, selectedId: blk.id }
  }),
  updateProps: (id, patch) => set(s => {
    const walk = (bs: typeof s.flow.blocks): typeof s.flow.blocks => bs.map(b =>
      b.id === id ? { ...b, props: { ...b.props, ...patch } }
        : b.children ? { ...b, children: walk(b.children) } : b)
    return { ...snap(s), flow: { ...s.flow, blocks: walk(s.flow.blocks) } }
  }),
  updateMeta: patch => set(s => ({ ...snap(s), flow: { ...s.flow, meta: { ...s.flow.meta, ...patch } } })),
  move: (id, target) => set(s => ({ ...snap(s), flow: { ...s.flow, blocks: moveBlock(s.flow.blocks, id, target) } })),
  remove: id => set(s => ({
    ...snap(s), flow: { ...s.flow, blocks: removeBlock(s.flow.blocks, id).blocks },
    selectedId: s.selectedId === id || (s.selectedId && !findBlock(removeBlock(s.flow.blocks, id).blocks, s.selectedId)) ? null : s.selectedId
  })),
  toggleEnabled: id => set(s => {
    const walk = (bs: typeof s.flow.blocks): typeof s.flow.blocks => bs.map(b =>
      b.id === id ? { ...b, enabled: !b.enabled } : b.children ? { ...b, children: walk(b.children) } : b)
    return { ...snap(s), flow: { ...s.flow, blocks: walk(s.flow.blocks) } }
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
