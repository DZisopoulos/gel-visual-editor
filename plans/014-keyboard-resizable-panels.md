# 014 — Make the palette/inspector resize handles keyboard operable

- **Status**: TODO
- **Commit**: a5eb0ea
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Rule**: Beyond the scan
- **Estimated scope**: 3 files (Palette.tsx, Inspector.tsx, App.tsx), small change each

## Problem

`src/renderer/src/components/Palette.tsx:63-69` and `src/renderer/src/components/Inspector.tsx:59-65,203-208` — both resize handles:

    <div
      className="gve-panel-resize gve-panel-resize-right"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize block palette"
      onPointerDown={(event) => onResizeStart?.(event)}
    />

`role="separator"` on a focusable/resizable widget should, per the ARIA APG, support arrow-key resizing — but these have no `tabIndex` and no `onKeyDown`, so panel widths are unreachable by keyboard entirely (only `onPointerDown` is wired).

## Target

Add `tabIndex={0}` and an `onKeyDown` handler that adjusts the layout width by a fixed step per arrow-key press, calling into the same `setLayout` logic `App.tsx`'s pointer-drag resize already uses. Since `onResizeStart` currently only handles pointer-down (to begin a drag), add a parallel `onResizeKey` callback prop that directly nudges the width.

    // App.tsx — new handler alongside startResize
    const nudgeLayout = (kind: 'palette' | 'inspector', delta: number): void => {
      setLayout((current) =>
        kind === 'palette'
          ? { ...current, paletteWidth: Math.min(420, Math.max(180, current.paletteWidth + delta)) }
          : { ...current, inspectorWidth: Math.min(520, Math.max(260, current.inspectorWidth - delta)) }
      )
    }
    // passed down: onResizeKey={(delta) => nudgeLayout('palette', delta)} to <Palette>,
    //              onResizeKey={(delta) => nudgeLayout('inspector', delta)} to <Inspector>
    // (note the inverted sign for inspector, matching startResize's existing pointer-drag logic
    //  at App.tsx:146-150, where inspector width shrinks as delta grows since it's anchored right)

    // Palette.tsx / Inspector.tsx — resize handle gets tabIndex + onKeyDown
    <div
      className="gve-panel-resize gve-panel-resize-right"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize block palette"
      aria-valuenow={/* current width, if easily threaded through as a prop — else omit */}
      tabIndex={0}
      onPointerDown={(event) => onResizeStart?.(event)}
      onKeyDown={(event) => {
        const STEP = 16
        if (event.key === 'ArrowLeft') { event.preventDefault(); onResizeKey?.(-STEP) }
        if (event.key === 'ArrowRight') { event.preventDefault(); onResizeKey?.(STEP) }
      }}
    />

Adjust the arrow-key-to-sign mapping per panel (palette grows with `ArrowRight`, inspector grows with `ArrowLeft`, matching their visual position on screen) — verify against the existing pointer-drag sign convention in `App.tsx:141-163` rather than guessing.

## Repo conventions to follow

- Match the existing `onResizeStart?: (event: React.PointerEvent) => void` optional-callback-prop pattern already used by both `Palette` and `Inspector` — add `onResizeKey` the same way.
- Reuse `App.tsx`'s existing `Math.min(420, Math.max(180, ...))` / `Math.min(520, Math.max(260, ...))` clamp bounds exactly — don't introduce different limits.

## Steps

1. In `src/renderer/src/App.tsx`, add the `nudgeLayout` function shown in Target, and pass `onResizeKey` props to `<Palette>` and `<Inspector>`.
2. In `Palette.tsx` and `Inspector.tsx`, add `onResizeKey?: (delta: number) => void` to each component's props type, add `tabIndex={0}` and the `onKeyDown` handler to their resize-handle `<div>`s (two locations in `Inspector.tsx` — the "no selection" branch and the "field editor" branch — see plan 021, which deduplicates this exact chrome; if plan 021 lands first, only one location needs the change).
3. Re-read the diff — confirm the arrow-key direction feels correct for each panel by reasoning through `App.tsx`'s existing pointer-drag sign convention (palette: `startWidth + delta`; inspector: `startWidth - delta`) rather than assuming.

## Boundaries

- Do NOT change the pointer-drag resize behavior (`onResizeStart`/`startResize`) — this plan adds a keyboard-only parallel path.
- Do NOT change the min/max width clamps (180-420 palette, 260-520 inspector).
- STOP if `Palette.tsx`/`Inspector.tsx`/`App.tsx` have drifted from the commit stamp; report drift instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint`, `npm test`.
- **Behavior check**: Tab to the palette's resize handle (confirm it's now reachable), press ArrowRight/ArrowLeft repeatedly, confirm the palette visibly widens/narrows within its existing bounds. Repeat for the inspector's resize handle, confirming the direction matches user expectation (arrow pointing toward the center of the app widens that panel).
- **Done when**: required checks pass and both resize handles are keyboard-operable with correctly-directioned arrow keys.
