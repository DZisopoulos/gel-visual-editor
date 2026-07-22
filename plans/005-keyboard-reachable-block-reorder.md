# 005 — Make block reordering reachable from the keyboard

- **Status**: TODO
- **Commit**: a5eb0ea
- **Severity**: HIGH
- **Category**: Accessibility
- **Rule**: Beyond the scan
- **Estimated scope**: 2 files, moderate change
- **Depends on**: plan 004 (changes BlockCard's action-button row this plan adds two buttons to)

## Problem

`src/renderer/src/components/Canvas.tsx` (`DropZone`/`BlockList`, lines 9-75) and `src/renderer/src/store.ts:157-160` (`move`):

    // Canvas.tsx — DropZone only wires drag events
    <div
      className={`gve-dropzone${active ? ' gve-dropzone-active' : ''}`}
      onDragEnter={() => setActive(true)}
      onDragLeave={() => setActive(false)}
      onDragOver={(event) => { /* ... */ }}
      onDrop={(event) => { /* ...; move(blockId, target) */ }}
    >

    // store.ts:157-160
    move: (id, target) =>
      set((s) => {
        const blocks = moveBlock(s.flow.blocks, id, target)
        return blocks === s.flow.blocks ? s : { ...snap(s), flow: { ...s.flow, blocks } }
      }),

`move()` is only ever invoked from `DropZone`'s `onDrop`. There is no keyboard path anywhere in the app that calls it — a keyboard-only user can add, duplicate, enable/disable, and delete blocks (all via real `<button>`s) but can never reorder or re-parent one.

## Target

Add "Move up" / "Move down" buttons to `BlockCard`'s existing action row (same row plan 004 preserves), calling a new store action that swaps a block with its previous/next sibling within the same parent list. This covers linear reordering — the most common case — without requiring a full re-parenting UI (re-parenting between containers stays drag-only for now; note this as a residual gap in the PR description, not silently).

    // src/renderer/src/store.ts — add alongside `move`
    moveBy(id: string, direction: -1 | 1): void

    moveBy: (id, direction) =>
      set((s) => {
        const swapInList = (blocks: Block[]): Block[] | null => {
          const index = blocks.findIndex((b) => b.id === id)
          if (index === -1) {
            for (let i = 0; i < blocks.length; i += 1) {
              const child = blocks[i]
              if (!child.children) continue
              const nested = swapInList(child.children)
              if (nested) {
                const next = [...blocks]
                next[i] = { ...child, children: nested }
                return next
              }
            }
            return null
          }
          const target = index + direction
          if (target < 0 || target >= blocks.length) return blocks
          const next = [...blocks]
          ;[next[index], next[target]] = [next[target], next[index]]
          return next
        }
        const blocks = swapInList(s.flow.blocks)
        return blocks && blocks !== s.flow.blocks
          ? { ...snap(s), flow: { ...s.flow, blocks } }
          : s
      }),

    // BlockCard.tsx — two new buttons in .gve-block-actions, before the existing four
    <button
      type="button"
      aria-label={`Move ${def.name} up`}
      title="Move up"
      onClick={(event) => {
        event.stopPropagation()
        moveBy(block.id, -1)
      }}
    >
      ↑
    </button>
    <button
      type="button"
      aria-label={`Move ${def.name} down`}
      title="Move down"
      onClick={(event) => {
        event.stopPropagation()
        moveBy(block.id, 1)
      }}
    >
      ↓
    </button>

Add `moveBy` to the `GveState` interface (`store.ts:15-39`) alongside `move`, and `const moveBy = useGve((s) => s.moveBy)` in `BlockCard.tsx` alongside the other store hooks.

## Repo conventions to follow

- Match the recursive block-list-walk pattern already used by `duplicateInList`/`removeBlock` in `store.ts` (search within a list, recurse into `children` if not found).
- Match `BlockCard.tsx`'s existing action-button style (`type="button"`, `aria-label`, `title`, `onClick` with `event.stopPropagation()`).
- Keep `moveBy` going through `snap(s)` for undo/redo history, exactly like every other mutating action in `store.ts`.

## Steps

1. In `src/renderer/src/store.ts`, add `moveBy(id: string, direction: -1 | 1): void` to the `GveState` interface and implement it as shown in Target, placed near `move`.
2. In `src/renderer/src/components/BlockCard.tsx`, add `const moveBy = useGve((s) => s.moveBy)` alongside the existing store hooks, and insert the two new buttons into `.gve-block-actions` before the Duplicate button.
3. Disable/omit the Move-up button when the block is already first in its list, and Move-down when already last — check via a prop or by having `BlockList` (Canvas.tsx) pass `isFirst`/`isLast` down, OR simplest: let `moveBy` be a no-op at the boundary (already handled — `target < 0 || target >= blocks.length` returns `blocks` unchanged) and skip the disabled-state polish unless it's cheap; a no-op button press is harmless.
4. Re-read the diff for unrelated churn; confirm `theme.css`'s existing `.gve-block-actions button { width: 28px; height: 28px; ... }` sizing applies to the two new buttons without extra CSS.

## Boundaries

- Do NOT implement full drag-free re-parenting (moving a block into/out of a container via keyboard) — out of scope for this plan; linear same-parent reordering only.
- Do NOT remove or change the existing drag-and-drop reordering path — it must keep working alongside the new buttons.
- Do NOT change `moveBlock`/`insertBlock`/`removeBlock` in `src/shared/tree.ts`.
- STOP if `store.ts` or `BlockCard.tsx` has drifted from the commit stamp; report drift instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint`, `npm test`.
- **Behavior check**: Add 3 blocks to a flow. Using only the keyboard (Tab to a block's Move-down button, Enter/Space to activate), move the middle block down, then the last block up, and confirm the canvas order updates to match, undo (Ctrl+Z) reverts each move as one history entry, and the block that was moved keeps its selection/focus sensibly (verify it doesn't jump focus somewhere confusing).
- **Done when**: required checks pass and the keyboard reorder behavior above is confirmed.
