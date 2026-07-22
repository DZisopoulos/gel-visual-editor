# 021 — Deduplicate Inspector's panel-chrome markup between its two branches

- **Status**: TODO
- **Commit**: a5eb0ea
- **Severity**: LOW
- **Category**: Maintainability & architecture
- **Rule**: Beyond the scan
- **Estimated scope**: 1 file, moderate change
- **Note**: apply after plan 014 (keyboard-resizable panels) so the resize handle's new `onKeyDown`/`tabIndex` only needs adding once, in the deduplicated markup, not twice.

## Problem

`src/renderer/src/components/Inspector.tsx:44-65` (the "no selection" early-return branch) and `:190-208` (the "field editor" branch) duplicate the same panel-chrome markup near-verbatim:

    {compact && (
      <button
        type="button"
        className="gve-panel-rail-toggle"
        aria-label={collapsed ? 'Expand inspector' : 'Collapse inspector'}
        title={collapsed ? 'Expand inspector' : 'Collapse inspector'}
        onClick={onToggleCollapsed}
      >
        {collapsed ? '‹' : '›'}
      </button>
    )}
    <div
      className="gve-panel-resize gve-panel-resize-left"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize inspector"
      onPointerDown={(event) => onResizeStart?.(event)}
    />

This exact block appears twice, character-for-character, once per branch.

## Target

Restructure `Inspector` so the two branches only differ in their *content* (the `gve-panel-title` + `gve-inspector-body` portion), with the chrome (rail-toggle button + resize handle + `<aside>` wrapper) rendered once around a variable body:

    function Inspector({ onResizeStart, compact = false, collapsed = false, onToggleCollapsed }: InspectorProps): React.JSX.Element {
      const flow = useGve((s) => s.flow)
      const selectedId = useGve((s) => s.selectedId)
      // ...other hooks unchanged
      const selected = selectedId ? findBlock(flow.blocks, selectedId) : null

      return (
        <aside className={`gve-inspector${collapsed ? ' gve-panel-rail' : ''}`} aria-label="Inspector">
          {compact && (
            <button
              type="button"
              className="gve-panel-rail-toggle"
              aria-label={collapsed ? 'Expand inspector' : 'Collapse inspector'}
              title={collapsed ? 'Expand inspector' : 'Collapse inspector'}
              onClick={onToggleCollapsed}
            >
              {collapsed ? '‹' : '›'}
            </button>
          )}
          <div
            className="gve-panel-resize gve-panel-resize-left"
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize inspector"
            onPointerDown={(event) => onResizeStart?.(event)}
          />
          {selected ? <SelectedBlockFields selected={selected} flow={flow} /* ...other needed props/handlers */ /> : <FlowSettingsFields flow={flow} /* ... */ />}
        </aside>
      )
    }

Extract the two branches' distinct bodies (currently the `gve-panel-title` + `gve-inspector-body` content) into two small internal components/functions (`FlowSettingsFields`, `SelectedBlockFields`) defined in the same file, each taking exactly the props/handlers they use — read the current full content of both branches carefully before splitting, since `updateParameter`, `fieldClass`, `variablesInScope`, etc. are currently closures/module functions shared across both; keep them accessible to whichever branch needs them (module-scope functions like `fieldClass` already are; `updateParameter` is defined inside `Inspector` and only used by the "no selection" branch — keep it local to `FlowSettingsFields` once extracted).

## Repo conventions to follow

- Match this codebase's existing pattern of small internal (non-exported) helper components defined in the same file as their parent (e.g. `Canvas.tsx`'s `DropZone`/`BlockList` defined alongside `Canvas`).
- Preserve every existing `aria-label`, class name, and field structure exactly — this is a pure structural refactor, not a redesign.

## Steps

1. Read the full current `Inspector.tsx` carefully (both branches in their entirety) before making any change.
2. Extract the shared chrome (rail-toggle button + resize handle) into the single `<aside>` wrapper as shown in Target.
3. Extract the "no selection" branch's content (`gve-panel-title` + the Name/Description/Script type/Datasources/Parameters fields, plus the local `updateParameter` helper) into an internal `FlowSettingsFields` component.
4. Extract the "field editor" branch's content (`gve-panel-title` + Step name/Variables in scope/dynamic field list) into an internal `SelectedBlockFields` component.
5. Wire both into the single `<aside>` via a ternary on `selected`, as shown in Target.
6. Re-read the full diff carefully — this is the highest-risk-of-subtle-breakage plan in the set (a lot of JSX is moving); verify every prop/handler each extracted component needs is actually passed, and that nothing is silently dropped.

## Boundaries

- Do NOT change any field's behavior, validation, or labeling — output must be pixel-identical and behaviorally identical to before.
- Do NOT combine this with any other plan's changes to `Inspector.tsx` in the same pass without re-reading the file fresh first — this refactor touches nearly the whole file and stacking it with, say, plan 007's `Inspector.tsx` changes needs care about ordering (apply plan 007 first, then this plan, re-reading between).
- STOP if the two branches turn out to share less than they appeared to during the audit (e.g. subtle differences in the resize-handle or rail-toggle markup you find while re-reading) — report the actual difference rather than forcing identical extraction.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint`, `npm test`.
- **Behavior check**: With no block selected, confirm the "Flow settings" panel (name/description/script type/datasources/parameters) renders and functions identically to before. Select a block, confirm the field-editor panel renders and functions identically. Toggle compact/collapsed mode (narrow the window or however `compact` is triggered) and confirm the rail-toggle button still works in both branches. Confirm the resize handle still works in both branches.
- **Done when**: required checks pass and both Inspector states are visually and behaviorally identical to before the refactor.
