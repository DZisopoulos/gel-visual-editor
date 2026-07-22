# 009 — Memoize Header's validation call and hoist its static values

- **Status**: TODO
- **Commit**: a5eb0ea
- **Severity**: MEDIUM-HIGH
- **Category**: Performance
- **Rule**: Beyond the scan (memoization) + prefer-module-scope-static-value (icon paths, see plan 023 which also touches this file — apply both in the same pass to avoid re-touching Header.tsx twice)
- **Estimated scope**: 1 file (Header.tsx), small change
- **Note**: This plan's memoization fix also resolves the `js-flatmap-filter`/`js-set-map-lookups` findings in `src/shared/validate.ts:14,55,63` — those patterns are real but their cost is negligible on their own; they only matter because `validateFlow` currently runs on every keystroke. Once memoized, `validate.ts` becomes cold-path-adjacent and doesn't need its own separate fix.

## Problem

`src/renderer/src/components/Header.tsx:70` — current:

    const validation = validateFlow(flow)

`Header` subscribes to the whole `flow` object (`Header.tsx:54`) and re-renders on every keystroke anywhere in the app that touches `flow` (which, per plan 008's analysis, is most edits). `validateFlow` does a full recursive tree walk with regex scanning of every expression field (`src/shared/validate.ts:60-147`) — unmemoized, this reruns on every such render. `ValidationView.tsx:15` does the identical call correctly wrapped in `useMemo(() => validateFlow(flow), [flow])`, confirming this is an inconsistency, not an intentional choice.

## Target

    // Header.tsx — add useMemo import, wrap the call
    import { useMemo } from 'react'
    // ...
    const validation = useMemo(() => validateFlow(flow), [flow])

This alone is the main fix. Additionally (same file, same pass — see plan 023 for the full detail on this part, included here so both fixes land in one Header.tsx edit rather than two separate passes touching the same file):

    // Icon's paths map hoisted to module scope
    const ICON_PATHS: Record<IconName, React.JSX.Element> = {
      undo: (<><path d="M9 7 4 12l5 5" /><path d="M4 12h10a5 5 0 0 1 5 5" /></>),
      // ...same 5 entries, moved out of the Icon function body
    }
    function Icon({ name }: { name: IconName }): React.JSX.Element {
      return <svg className="gve-icon" viewBox="0 0 24 24" aria-hidden="true">{ICON_PATHS[name]}</svg>
    }

    // countBlocks hoisted to a pure module function taking blocks as its only input
    function countBlocks(blocks: Block[]): number {
      return blocks.reduce((count, block) => count + 1 + (block.children ? countBlocks(block.children) : 0), 0)
    }
    // usage inside Header: countBlocks(flow.blocks) — unchanged call site, now a stable module function
    // requires importing `Block` type: import type { Block } from '../../../shared/flow'

## Repo conventions to follow

- Match `ValidationView.tsx:15`'s exact `useMemo(() => validateFlow(flow), [flow])` pattern — this file should end up consistent with it.
- Match `BlockIcon.tsx`'s existing module-scope `paths`-map pattern (already correct there) when hoisting `ICON_PATHS`.

## Steps

1. In `src/renderer/src/components/Header.tsx`, add `useMemo` to the `react` import and wrap `validateFlow(flow)` (currently line 70) in `useMemo(() => validateFlow(flow), [flow])`.
2. Also wrap the second `validateFlow` call in `handleExport` (`Header.tsx:129`, `const issues = validateFlow(flow)`) — check whether this can reuse the memoized `validation` from step 1 (it's the same `flow` value at call time if `handleExport` is invoked synchronously from the current render's closure) — if so, just reference `validation` directly instead of calling `validateFlow` again; if there's a reason they must be independent (e.g. `handleExport` is async and `flow` could have changed), keep it separate but note why in a code comment only if genuinely non-obvious.
3. Move the `paths` object out of `Icon`'s function body to a module-scope `const ICON_PATHS = {...}` above the component, and update `Icon` to reference it.
4. Move `countBlocks` out of `Header`'s function body to a module-scope function taking `blocks: Block[]` as a parameter (add the `Block` type import from `../../../shared/flow`), and update its call site (`countBlocks(flow.blocks)`) — unchanged since it already receives `flow.blocks` explicitly.
5. Re-read the diff for unrelated churn.

## Boundaries

- Do NOT change `validateFlow`'s implementation in `src/shared/validate.ts` — the fix is memoizing the caller, not optimizing the callee (which is now moot once memoized).
- Do NOT change `ValidationView.tsx` — it's already correct.
- Keep `Icon`'s public interface (`{ name: IconName }` prop) unchanged.
- STOP if `Header.tsx` has drifted from the commit stamp; report drift instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint`, `npm test`.
- **Behavior check**: Open React DevTools Profiler, type several characters into the flow-name input or an Inspector field, and confirm (via the Profiler's flame graph / "why did this render" data, or by adding a temporary `console.count` inside `validateFlow`) that `validateFlow` is no longer called once per keystroke — only when `flow` actually changes identity. Confirm the header's error/warning counts still update correctly when validation issues appear/resolve.
- **Done when**: required checks pass, and the per-keystroke `validateFlow` call is confirmed eliminated via the Profiler check.
