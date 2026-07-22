# GVE improve-react plans

Generated from a full `improve-react` audit at commit `a5eb0ea` (React Doctor score 64/100 → target: clear all 28 confirmed findings). Every finding was verified against the actual source before a plan was written; one raw scanner hit (`XmlPreview.tsx:42`, `no-unknown-property` on `data-xml-theme`) was rejected as a likely false positive — `data-*` attributes are always valid in JSX — and has no plan.

## Status legend
TODO → IN PROGRESS → DONE (or BLOCKED, with a note)

## Execution clusters (safe to run in parallel — no file overlap between clusters)

| Cluster | Plans | Files touched | Notes |
|---|---|---|---|
| A — Dialogs | 001, 006, 010, 011, 015 | `DialogProvider.tsx`, `CommandPalette.tsx`, `AboutDialog.tsx`, `TemplatePicker.tsx`, `SnippetDialog.tsx`, `theme.css` | **Sequential within cluster**: 001 → 010 → 011 → 015. 006 (focus style) is independent, do anytime. |
| B — Block editing | 004, 005, 007, 008, 017(via007) | `store.ts`, `Inspector.tsx`, `Canvas.tsx`, `BlockCard.tsx` | **Sequential**: 007 → 004 → 005 → 008 (007 changes data shapes 004/005/008 build on top of; 004 changes BlockCard markup 005 adds buttons into). |
| C — Header | 009 | `Header.tsx` | Independent. |
| D — Electron boundary | 013 | `main/index.ts`, `preload/index.ts` | Independent. Requires a full `npm run build` + packaged run to verify (renderer test suite doesn't cover main/preload). |
| E — Shell & security-data | 003, 012, 016 | `App.tsx`, `roundtrip.ts`, `xmlutil.ts`, `snippets.ts`, `theme.ts`, registry blocks, new `hooks/`, new `localStorage.ts`, new `ErrorBoundary.tsx` | **Sequential**: 002 (cluster F, dependency) → 003 → 012 → 016 (016 extracts hooks from effects 003/012 add to `App.tsx` first). |
| F — Security data model | 002 | `roundtrip.ts`, `xmlutil.ts`, `registry/types.ts`, `registry/blocks/*.ts`, `registry/presets.ts` | Independent; must land **before** 003 (cluster E depends on the `'secret'` field kind and `redactSecrets`/`redactBlockSecrets` helpers this introduces). |
| G — Menu & views | 017, 018 | `MenuBar.tsx`, `App.tsx` (view list only) | Independent of cluster E's other `App.tsx` changes but touches the same file — coordinate ordering, don't run concurrently with E. |
| H — Palette | 019 | `Palette.tsx` | Independent. |
| I — Panels | 014, 021 | `Palette.tsx` (resize handle only), `Inspector.tsx` | **Sequential**: 014 → 021 (021 dedupes the markup 014 touches; doing 021 first would make 014 apply its fix twice, doing 014 first then 021 means the keyboard handler is written once during dedup). Coordinate with cluster B on `Inspector.tsx`/`Palette.tsx` — apply after B/H land. |
| J — Misc | 020 | `WindowTitleBar.tsx` | Fully independent, trivial. |

## Plan index

| # | File | Severity | Category | Status |
|---|---|---|---|---|
| 001 | `001-dialog-request-queue.md` | HIGH | Bugs | TODO |
| 002 | `002-redact-secrets-in-exported-xml.md` | HIGH | Security | TODO |
| 003 | `003-redact-secrets-in-local-storage.md` | HIGH | Security | TODO |
| 004 | `004-blockcard-remove-nested-interactive.md` | HIGH | Accessibility | TODO |
| 005 | `005-keyboard-reachable-block-reorder.md` | HIGH | Accessibility | TODO |
| 006 | `006-command-palette-focus-style.md` | HIGH | Accessibility | TODO |
| 007 | `007-stable-keys-datasource-parameter-rows.md` | HIGH | Bugs | TODO |
| 008 | `008-memoize-blockcard.md` | HIGH | Performance | TODO |
| 009 | `009-memoize-header-validation-and-hoist-statics.md` | MEDIUM-HIGH | Performance | TODO |
| 010 | `010-memoize-dialog-context-value.md` | MEDIUM | Performance | TODO |
| 011 | `011-native-dialog-focus-trap.md` | MEDIUM | Accessibility | TODO |
| 012 | `012-escape-to-deselect-and-error-boundary.md` | MEDIUM | Accessibility + Bugs | TODO |
| 013 | `013-electron-security-hardening.md` | MEDIUM | Security | TODO |
| 014 | `014-keyboard-resizable-panels.md` | MEDIUM | Accessibility | TODO |
| 015 | `015-shared-modal-shell.md` | MEDIUM | Maintainability | TODO |
| 016 | `016-appcontent-hooks-and-localstorage-helper.md` | MEDIUM | Maintainability | TODO |
| 017 | `017-dedupe-view-list.md` | MEDIUM | Maintainability | TODO |
| 018 | `018-menubar-keyboard-nav.md` | LOW | Accessibility | TODO |
| 019 | `019-palette-native-button-and-narrow-subscription.md` | LOW | Accessibility + Performance | TODO |
| 020 | `020-hoist-windowtitlebar-handlers.md` | LOW | Performance + Maintainability | TODO |
| 021 | `021-dedupe-inspector-panel-chrome.md` | LOW | Maintainability | TODO |

## Findings folded into another plan (not separate files)
- Old finding "duplicate parameter key" → resolved by plan 007 (keys by `parameter.id` instead of `.name`).
- Old finding "`validate.ts` `js-flatmap-filter`/`js-set-map-lookups`" → resolved as a side effect of plan 009 (memoizing the hot caller makes the cost moot).
- Old finding "`Header.tsx` `prefer-module-scope-static-value`" → folded into plan 009 (same file, same pass).
- Old finding "`saveFlow` IPC path not allowlisted" → folded into plan 013 (Electron boundary cluster).

## Rejected (no plan)
- `XmlPreview.tsx:42` — `no-unknown-property` on `data-xml-theme={theme}`. `data-*` attributes are always valid DOM/JSX properties; this reads as a scanner limitation, not a real defect. Re-check against a newer React Doctor release if it recurs.
