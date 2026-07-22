# 006 — Restore a visible focus indicator on the command palette search input

- **Status**: TODO
- **Commit**: a5eb0ea
- **Severity**: HIGH
- **Category**: Accessibility
- **Rule**: Beyond the scan (no-outline-none extension)
- **Estimated scope**: 1 file, 1 rule addition

## Problem

`src/renderer/src/theme.css:1298-1306` — current:

    .gve-command-search input {
      min-width: 0;
      flex: 1;
      border: 0;
      outline: 0;
      background: transparent;
      color: var(--text);
      font-size: 14px;
    }

This is the Ctrl+K command palette's search input — the primary power-user entry point (`CommandPalette.tsx`, opened via `Ctrl/Cmd+K` from anywhere in the app). `outline: 0` removes the browser's default focus ring with **no** compensating `:focus`/`:focus-within` style anywhere for `.gve-command-search`. Every other `outline: none`/`outline: 0` instance in this file (flow-name input at `theme.css:192-205`, palette search at `:381-397`, inspector fields at `:880-907`, dialog prompt input at `:1338-1349`) swaps to a `border-color: var(--accent)` on `:focus` instead — this one doesn't.

## Target

Add the same compensating focus style used by the other inputs in this file, scoped to the search bar container (`.gve-command-search`) since the actual `<input>` itself is borderless by design (the visual "input box" is the whole search row, not just the `<input>` element).

    .gve-command-search:focus-within {
      border-color: var(--accent);
    }

This requires `.gve-command-search` to already have a `border` declared to override — check its current rule (`theme.css:1264-1270`, `.gve-command-search { display: flex; align-items: center; gap: 9px; padding: 12px 14px; border-bottom: 1px solid var(--border); }`) and add `border-color: var(--accent)` targeting the existing `border-bottom` (since that's the only border side set, `border-color` on `:focus-within` correctly re-colors just that bottom rule).

## Repo conventions to follow

- Match the exact focus-style pattern already used for `.gve-palette-search input:focus` (`theme.css:395-397`: `border-color: var(--accent);`) — same token, same mechanism, just scoped to the container via `:focus-within` since this input has no border of its own.
- Keep the new rule adjacent to `.gve-command-search`'s existing declaration in the file, not scattered elsewhere.

## Steps

1. In `src/renderer/src/theme.css`, locate `.gve-command-search { ... border-bottom: 1px solid var(--border); ... }` (around line 1264-1270).
2. Add a new rule immediately after it: `.gve-command-search:focus-within { border-color: var(--accent); }`.
3. Re-read the diff — confirm no other `:focus`/`:focus-within` rule already exists for this selector (would indicate drift from the commit stamp).

## Boundaries

- Do NOT change `.gve-command-search input`'s own `outline: 0`/`border: 0` — the fix is a compensating focus indicator on the container, not restoring the native outline (which would look inconsistent with the rest of the app's borderless-input styling).
- Do NOT touch any other `outline: none` instance in this file — they already have compensating focus styles.
- STOP if `theme.css`'s `.gve-command-search` rules have drifted from the commit stamp; report drift instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint` (CSS isn't typechecked/linted by these, but run them to confirm no unrelated breakage), `npm test`.
- **Behavior check**: Open the command palette (Ctrl/Cmd+K), and without clicking, Tab-focus (or note it autofocuses on open per `CommandPalette.tsx:34-36`) into the search input — confirm a visible accent-colored border now appears along the search row, matching the visual weight of the palette/inspector search fields' focus state.
- **Done when**: required checks pass and the focus indicator is visibly present on the command search row when focused.
