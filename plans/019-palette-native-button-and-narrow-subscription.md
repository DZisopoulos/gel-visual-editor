# 019 — Palette: native button semantics + narrower store subscription

- **Status**: TODO
- **Commit**: a5eb0ea
- **Severity**: LOW
- **Category**: Accessibility + Performance
- **Rule**: prefer-tag-over-role + beyond scan (unmemoized filter)
- **Estimated scope**: 1 file, small change

## Problem

**`prefer-tag-over-role`** — `src/renderer/src/components/Palette.tsx:144-149`:

    <div
      className="gve-palette-row"
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(event) => { /* ... */ }}
      onDoubleClick={() => addBlock(def.type, { parentId: null, index: flow.blocks.length })}
      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { /* addBlock */ } }}
    >

Each palette entry is a `<div role="button" tabIndex={0}>` (keyboard-operable via its own keydown handler) instead of a native `<button>`, losing built-in press/disabled semantics for no functional reason — `<button>` supports `draggable` and custom `onDragStart`/`onDoubleClick` just as well as a `<div>`.

**Unmemoized broad subscription** — `Palette.tsx:30,34`:

    const flow = useGve((s) => s.flow)   // only flow.blocks.length is actually read (line 156)
    const definitions = allNodeDefs()    // rebuilt every render, no memoization
    // ...per-category .filter() at lines 119-123, also unmemoized, reruns on every render

`Palette` subscribes to the whole `flow` object for a single `.length` read, and rebuilds `allNodeDefs()` plus 5 category filters on every render — including renders triggered by unrelated keystrokes elsewhere in the app (before plan 008/010 land; even after, `Palette` itself still redundantly recomputes on its own re-renders from `query`/`categoryCollapsed` state changes).

## Target

    // native <button>, drag preserved
    <button
      type="button"
      className="gve-palette-row"
      draggable
      onDragStart={(event) => { /* unchanged */ }}
      onDoubleClick={() => addBlock(def.type, { parentId: null, index: flow.blocks.length })}
    >
      {/* unchanged children */}
    </button>

Removing the manual `onKeyDown`/`tabIndex`/`role` — native `<button>` already fires `onClick`/gets Enter+Space activation for free; since this component currently activates on `onDoubleClick` + manual Enter/Space (not `onClick`), keep the explicit `onKeyDown` OR convert to `onClick` — check which the codebase intends: double-click to add is the primary documented interaction (see `Canvas.tsx`'s empty-state hint: "double-click one in the palette to add it"), so the native `<button>`'s default Enter/Space→`click` behavior should map to the *same* add-block action for consistency, meaning `onClick` (not `onDoubleClick`) is actually the more correct native-button pattern — verify with the user's documented empty-state hint text and either keep `onDoubleClick` alongside the button's native Enter/Space→onClick (both trigger add-block, which is fine and simpler) or explicitly decide; simplest correct fix: keep both `onDoubleClick` (mouse) and let native button semantics handle Enter/Space via `onClick` calling the same `addBlock`, removing the manual `onKeyDown`.

    const flow = useGve((s) => s.flow.blocks.length)  // narrow selector — only the length, not the whole object
    // ...
    const definitions = useMemo(() => allNodeDefs(), [])  // static per app lifetime unless the registry is dynamic — verify allNodeDefs() is pure/static before memoizing with an empty dep array
    // ...category filtering wrapped in useMemo keyed on [definitions, normalizedQuery]

## Repo conventions to follow

- Match the existing Zustand narrow-selector pattern already used correctly elsewhere (e.g. `BlockCard.tsx:17`, `const selected = useGve((s) => s.selectedId === block.id)` — a derived boolean, not the raw object).
- Keep `.gve-palette-row`'s existing CSS class and visual styling — only the element tag and redundant keyboard-handling code change.

## Steps

1. In `Palette.tsx`, change the store selector from `const flow = useGve((s) => s.flow)` to reading only what's needed — since `flow.blocks.length` is used at 3 call sites (`addBlock`'s `index` argument) and `flow.blocks` itself isn't otherwise read in this file, narrow to `const blocksLength = useGve((s) => s.flow.blocks.length)` and update the 3 `addBlock(..., { parentId: null, index: flow.blocks.length })` call sites to use `blocksLength`.
2. Verify `allNodeDefs()` (in `src/shared/registry`) is a pure function with no per-call side effects or freshly-allocated-but-identical output before wrapping in `useMemo(() => allNodeDefs(), [])` — if it reads anything that could change at runtime (unlikely for a static block registry, but verify), adjust the dependency array accordingly instead of assuming `[]` is safe.
3. Wrap the per-category filtering (currently inline in the `categories.map()` JSX at lines 118-124) in a `useMemo` keyed on `[definitions, normalizedQuery]` that precomputes `{ [category]: NodeDefinition[] }` once, then have the render just look up the precomputed entries instead of calling `.filter()` per category per render.
4. Change `.gve-palette-row`'s wrapping element from `<div>` to `<button type="button">`, remove `role="button"`, `tabIndex={0}`, and the manual `onKeyDown` handler (relying on native button Enter/Space→`onClick` semantics instead — add an `onClick` handler calling the same `addBlock(...)` the `onKeyDown` used to, or confirm `onDoubleClick` alone plus native click-activation is the intended behavior per the empty-state hint text; make a clear choice and note it, don't leave both paths half-wired).
5. Re-read the diff for unrelated churn.

## Boundaries

- Do NOT change drag-and-drop behavior (`onDragStart`, `draggable`) — must keep working identically.
- Do NOT change the double-click-to-add behavior — it's documented in the app's own UI copy (`Canvas.tsx`'s empty state).
- Do NOT change `allNodeDefs()`'s implementation in `src/shared/registry` — only how `Palette.tsx` calls/caches it.
- STOP if `Palette.tsx` has drifted from the commit stamp; report drift instead of improvising.

## Verification

- **Mechanical**:
  - `npx react-doctor@latest --scope changed` clears `prefer-tag-over-role` for `Palette.tsx`, score does not regress.
  - `npm run typecheck`, `npm run lint`, `npm test`.
- **Behavior check**: Confirm palette rows are still draggable onto the canvas, double-click still adds a block, keyboard Tab+Enter/Space on a palette row still adds a block (native button semantics), and the palette still displays/filters correctly when searching. In React DevTools Profiler, confirm `Palette` no longer recomputes its category filters on a re-render triggered by unrelated state (e.g. after plan 008/010 land, typing in the Inspector shouldn't re-run Palette's filtering).
- **Done when**: the targeted diagnostic clears, required checks pass, and every behavior check above passes.
