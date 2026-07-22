# 008 — Memoize BlockCard to stop the whole-canvas re-render cascade

- **Status**: TODO
- **Commit**: a5eb0ea
- **Severity**: HIGH
- **Category**: Performance
- **Rule**: Beyond the scan
- **Estimated scope**: 1 file, small change

## Problem

`src/renderer/src/components/Canvas.tsx:78` and `src/renderer/src/components/BlockCard.tsx:15` (component definition, no memo) and `src/renderer/src/components/Inspector.tsx:213-286` (per-keystroke commits):

    // Canvas.tsx:78
    const flow = useGve((s) => s.flow)   // whole-object subscription

    // Inspector.tsx:215 — every keystroke calls updateProps, which replaces `flow` in the store
    onChange={(event) => updateProps(selected.id, { stepName: event.target.value })}

    // BlockCard.tsx:15 — no React.memo
    function BlockCard({ block, children }: BlockCardProps): React.JSX.Element { /* ... */ }
    export default BlockCard

Every keystroke in the Inspector replaces `flow` in the Zustand store (confirmed: `store.ts`'s `updateProps` does an immutable tree walk producing a new `flow` object on every call). `Canvas` subscribes to the whole `flow` object, so it re-renders on every keystroke and re-maps every block via `BlockList`. Since `BlockCard` has no `memo`, every block card's render function re-executes too — not just the one being edited — on a flow with many blocks.

## Target

Wrap `BlockCard` in `React.memo`. Its props are `{ block: Block; children?: ReactNode }` — `block` is a plain object recreated by the store on every edit to *any* block (not just this one, since `updateProps`'s `walk` rebuilds every level of the tree from the edited node up to the root), so default reference-equality memoization alone won't help unless paired with confirming `block` identity is actually stable for untouched blocks. Re-read `store.ts`'s `updateProps` `walk` function before implementing — it currently does:

    const walk = (bs) => bs.map((b) => {
      if (b.id === id) { found = true; return { ...b, props: { ...b.props, ...patch } } }
      return b.children ? { ...b, children: walk(b.children) } : b
    })

This rebuilds **every** block object at every level (via `bs.map`), even ones untouched by the edit, because `.map()` always returns new object references for every element, not just the changed one. `React.memo` alone will NOT stop the re-render cascade until this is also fixed — memo compares `block` by reference, and every sibling block gets a new reference on every edit due to `.map()`'s behavior. Fix `walk` to only create new objects on the path from the edited node to the root, returning the *same* reference for untouched blocks:

    const walk = (bs) => {
      let changed = false
      const next = bs.map((b) => {
        if (b.id === id) { found = true; changed = true; return { ...b, props: { ...b.props, ...patch } } }
        if (!b.children) return b
        const children = walk(b.children)
        if (children === b.children) return b
        changed = true
        return { ...b, children }
      })
      return changed ? next : bs
    }

Then add `React.memo` to `BlockCard`:

    export default React.memo(BlockCard)

With both fixes, editing one block's props leaves every sibling `Block` object reference untouched, so their memoized `BlockCard`s skip re-rendering.

## Repo conventions to follow

- Match the existing "return same reference if unchanged" pattern already used elsewhere in `store.ts`'s `move` action (`return blocks === s.flow.blocks ? s : ...`).
- Use `React.memo` the same way, if precedent exists elsewhere in the codebase — otherwise this is the first usage; keep the import as `import { memo } from 'react'` matching the rest of the file's React import style (check `BlockCard.tsx:1`, currently `import type { ReactNode } from 'react'` — will need `memo` added to that import).

## Steps

1. In `src/renderer/src/store.ts`, rewrite `updateProps`'s inner `walk` function to preserve object identity for untouched blocks, as shown in Target. Apply the same identity-preserving fix to `toggleEnabled`'s `walk` (`store.ts:175-188`) — it has the identical `.map()`-always-creates-new-objects issue.
2. In `src/renderer/src/components/BlockCard.tsx`, import `memo` from `'react'` and change `export default BlockCard` to `export default memo(BlockCard)`.
3. Re-read `Canvas.tsx`'s `BlockList` to confirm nothing else defeats memoization — check the `children` prop passed to `BlockCard` (`{def.isContainer && (<div className="gve-nest"><BlockList .../></div>)}`) isn't itself creating a new `ReactNode` reference every render in a way that matters (JSX children are always "new" on every parent render regardless — this is expected and fine; memo still helps because `BlockCard`'s own re-render is skipped when its parent (`BlockList`) re-renders due to an unrelated sibling change, since `block` and `children` props stay referentially stable for that specific card).

## Boundaries

- Do NOT add `React.memo` anywhere else in this plan — scope is `BlockCard` only.
- Do NOT change `updateProps`'s/`toggleEnabled`'s external behavior — only their internal object-identity behavior. The resulting `flow.blocks` array must be deep-equal to before for the edited path, and reference-equal for every untouched block.
- Do NOT touch `duplicate`/`remove`/`move`/`insertExisting` in this plan — verify they don't need the same fix, but only change them if you confirm (don't assume) they have the identical bug; if they do, note it as a follow-up rather than expanding this plan's scope.
- STOP if `store.ts`'s `updateProps`/`toggleEnabled` or `BlockCard.tsx` have drifted from the commit stamp; report drift instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint`, `npm test`.
- **Behavior check**: Add 5+ blocks to a flow. Open React DevTools Profiler, start recording, select one block and type in its Step Name field in the Inspector, stop recording. Confirm only the edited block's `BlockCard` (and its ancestors) re-rendered — use "Highlight updates" while typing and confirm only the edited card flashes, not the whole block list.
- **Done when**: required checks pass, and the Profiler/Highlight-updates check confirms only the edited `BlockCard` re-renders on a per-keystroke edit.
