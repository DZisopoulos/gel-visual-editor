# 017 — Single source of truth for the Flow/XML/Validate view list

- **Status**: TODO
- **Commit**: a5eb0ea
- **Severity**: MEDIUM
- **Category**: Maintainability & architecture
- **Rule**: Beyond the scan
- **Estimated scope**: 2 files, small change

## Problem

`MenuBar.tsx:116-122` and `App.tsx:259-269` both implement the Flow/XML/Validate view switch independently, with no shared source of truth. Confirmed drift by direct read: `MenuBar.tsx` labels them "Flow canvas" / "XML preview" / "Validate flow"; `App.tsx` labels them "Flow" / "XML Preview" / "Validate".

## Target

    // src/renderer/src/views.ts — new file
    export type ViewId = 'flow' | 'xml' | 'validate'
    export const VIEWS: { id: ViewId; label: string; menuLabel: string }[] = [
      { id: 'flow', label: 'Flow', menuLabel: 'Flow canvas' },
      { id: 'xml', label: 'XML Preview', menuLabel: 'XML preview' },
      { id: 'validate', label: 'Validate', menuLabel: 'Validate flow' }
    ]

    // App.tsx:258-271 — tab bar consumes VIEWS
    <div className="gve-view-tabs" role="tablist" aria-label="Workspace view">
      {VIEWS.map(({ id, label }) => (
        <button
          type="button"
          role="tab"
          key={id}
          aria-selected={activeView === id}
          className={`gve-view-tab${activeView === id ? ' gve-view-tab-active' : ''}`}
          onClick={() => setActiveView(id)}
        >
          {label}
        </button>
      ))}
    </div>

    // MenuBar.tsx — View menu consumes VIEWS
    {menu === 'view' && (
      <>
        {VIEWS.map(({ id, menuLabel }) => item(menuLabel, () => onViewChange(id), activeView === id))}
        <div className="gve-menu-separator" />
        {/* ...focus mode / reset layout items, unchanged */}
      </>
    )}

Keeping distinct `label` (tab bar, terse) and `menuLabel` (menu item, more descriptive) preserves the existing intentional difference in phrasing rather than forcing one wording to "win" — the actual bug being fixed is that they were *supposed* to be independently worded but drifted without anyone deciding that; a single source of truth for each still lets them differ deliberately, it just makes future edits touch one file instead of two divergent copies.

## Repo conventions to follow

- Match this codebase's existing small-shared-constant-file convention (e.g. `snippets.ts` exporting `SNIPPETS_KEY` alongside its functions) for the new `views.ts` file's location (`src/renderer/src/`, sibling to `store.ts`/`theme.ts`/`snippets.ts`).
- Reuse the `'flow' | 'xml' | 'validate'` union type already duplicated as inline types in both `App.tsx` and `MenuBar.tsx`'s prop signatures — replace both with `ViewId` imported from the new file.

## Steps

1. Create `src/renderer/src/views.ts` as shown in Target.
2. In `App.tsx`, import `VIEWS`/`ViewId`, replace the inline `'flow' | 'xml' | 'validate'` type used for `activeView`'s `useState` with `ViewId`, and rewrite the tab-bar `.map()` to iterate `VIEWS`.
3. In `MenuBar.tsx`, import `VIEWS`/`ViewId`, replace `MenuBarProps`'s inline union types (`activeView: 'flow' | 'xml' | 'validate'`, `onViewChange: (view: 'flow' | 'xml' | 'validate') => void`) with `ViewId`, and rewrite the `menu === 'view'` block's three `item(...)` calls to `.map()` over `VIEWS`.
4. Re-read both diffs — confirm no other inline `'flow' | 'xml' | 'validate'` literal type remains duplicated elsewhere (check `Canvas`/`XmlPreview`/`ValidationView` don't also inline this type unnecessarily, though they don't need `ViewId` themselves since they don't switch on it).

## Boundaries

- Do NOT change the actual label wording — preserve `MenuBar`'s existing "Flow canvas"/"XML preview"/"Validate flow" and `App.tsx`'s existing "Flow"/"XML Preview"/"Validate" exactly, just move them into `VIEWS`.
- Do NOT touch the Focus Mode / Reset Panel Layout menu items in `MenuBar.tsx` — only the three view-switch items.
- STOP if `MenuBar.tsx`/`App.tsx` have drifted from the commit stamp; report drift instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint`, `npm test`.
- **Behavior check**: Confirm the tab bar and the View menu both still list all three views with their existing (unchanged) labels, switching views works identically from both entry points, and the active-view indicator (checkmark/disabled-state in the menu, active-tab styling in the bar) still reflects the current view correctly from both.
- **Done when**: required checks pass and both view-switch UIs behave identically to before, now sourced from one file.
