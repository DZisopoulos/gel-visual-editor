# 012 — Add Escape-to-deselect and a top-level error boundary

- **Status**: TODO
- **Commit**: a5eb0ea
- **Severity**: MEDIUM
- **Category**: Accessibility (Escape-to-deselect) + Bugs & correctness (error boundary)
- **Rule**: no-noninteractive-element-interactions (Canvas.tsx:106) + Beyond the scan (error boundary)
- **Estimated scope**: 2 files (App.tsx, new ErrorBoundary component)

## Problem

**Escape-to-deselect** — `src/renderer/src/components/Canvas.tsx:106`:

    <main className="gve-canvas" aria-label="Flow canvas" onClick={() => select(null)}>

`<main>` isn't focusable/interactive, and there is no keyboard equivalent anywhere in the app — `App.tsx`'s global keydown handler (`App.tsx:164-201`) handles Ctrl+K, Ctrl+Z/Y, Delete/Backspace, but has no `Escape` case. Once a block is selected, a keyboard-only user can never deselect it except by selecting a different block.

**Error boundary** — `src/renderer/src/components/XmlPreview.tsx:58-60`:

    <Suspense fallback={<PlainPreview xml={xml} />}>
      <MonacoEditor xml={xml} theme={resolvedTheme} />
    </Suspense>

`Suspense` only covers the *pending* state of `lazy(() => import('./MonacoXmlEditor'))`. If the dynamic import throws (missing/corrupt chunk, worker init failure — plausible in a packaged Electron app), the exception propagates through render with nothing to catch it — no `ErrorBoundary`/`componentDidCatch`/`getDerivedStateFromError` exists anywhere under `src/renderer/src` (confirmed by grep). This crashes the entire `AppContent` tree to a white screen instead of degrading just the XML tab.

## Target

**Escape-to-deselect**: add a case to `App.tsx`'s existing global keydown handler.

    // App.tsx:164-201, inside onKeyDown, alongside the existing modifier-key cases
    if (event.key === 'Escape' && !isTyping && !commandOpen) {
      event.preventDefault()
      select(null)
    }

`select` is already destructured from the store at `App.tsx:63` (wait — check: currently only `remove` is destructured for the Delete case; `select` needs to be added: `const select = useGve((s) => s.select)`). Place the `Escape` case sensibly relative to the existing early-return `if (isTyping || commandOpen) return` (currently at `App.tsx:178`) — `Escape` should still work while typing in most apps (to blur/cancel), but this codebase's existing early return skips all shortcuts while typing; keep `Escape`-to-deselect consistent with that existing convention (only fires when not typing) unless testing shows a native input's own Escape behavior (e.g. clearing a `type="search"` field) should take priority — verify in the running app and adjust if `Escape` inside the palette search field currently does something else (it does — `CommandPalette.tsx:96` already uses `Escape` to close the palette; this plan's `Escape` case explicitly excludes `commandOpen` to avoid a conflict).

**Error boundary**: add a small class-based `ErrorBoundary` component (this is one of the few valid uses of a class component — React has no hook equivalent for `getDerivedStateFromError`/`componentDidCatch`) and wrap it around the view-switcher area in `App.tsx`.

    // src/renderer/src/components/ErrorBoundary.tsx — new file
    import { Component, type ReactNode } from 'react'

    interface Props {
      children: ReactNode
      fallback: (retry: () => void) => ReactNode
    }
    interface State {
      error: Error | null
    }

    export class ErrorBoundary extends Component<Props, State> {
      state: State = { error: null }
      static getDerivedStateFromError(error: Error): State {
        return { error }
      }
      componentDidCatch(error: Error, info: React.ErrorInfo): void {
        console.error('GVE render error:', error, info.componentStack)
      }
      render(): ReactNode {
        if (this.state.error) return this.props.fallback(() => this.setState({ error: null }))
        return this.props.children
      }
    }

    // App.tsx — wrap the view-switcher content
    <ErrorBoundary
      fallback={(retry) => (
        <div className="gve-empty-state">
          <div className="gve-empty-icon" aria-hidden="true">!</div>
          <h2>Something went wrong</h2>
          <p>This view hit an unexpected error. Your flow data is safe — try again.</p>
          <button type="button" onClick={retry}>Retry</button>
        </div>
      )}
    >
      {activeView === 'flow' ? (
        <Canvas />
      ) : activeView === 'xml' ? (
        <XmlPreview theme={themePreferences.xml} />
      ) : (
        <ValidationView onOpenFlow={() => setActiveView('flow')} />
      )}
    </ErrorBoundary>

Reusing `.gve-empty-state` styling keeps the fallback visually consistent with the existing empty-canvas state rather than introducing new CSS.

## Repo conventions to follow

- Match this codebase's existing component-per-file convention (`ErrorBoundary.tsx` alongside the other files in `src/renderer/src/components/`).
- Reuse `.gve-empty-state`/`.gve-empty-icon` classes already defined in `theme.css` rather than adding new ones.
- Match `App.tsx`'s existing `useGve((s) => s.X)` selector style when adding the `select` hook.

## Steps

1. Create `src/renderer/src/components/ErrorBoundary.tsx` as shown in Target.
2. In `App.tsx`, add `const select = useGve((s) => s.select)` alongside the other store hooks (near line 63-69).
3. Add the `Escape` case to the `onKeyDown` handler inside the existing `useEffect` (`App.tsx:164-201`), placed after the `isTyping || commandOpen` early return so it only fires when not typing and the command palette is closed.
4. Import `ErrorBoundary` in `App.tsx` and wrap the three-way view-switcher JSX (`App.tsx:250-256`) as shown in Target.
5. Re-read the diff for unrelated churn; confirm the `Escape` case doesn't shadow `CommandPalette`'s own Escape-to-close (verify `commandOpen` guard is correct — the command palette should close on its own Escape handler, and this new global case should not also fire and call `select(null)` on the same keypress).

## Boundaries

- Do NOT change `Canvas.tsx`'s `onClick={() => select(null)}` — the mouse behavior stays; this plan adds a keyboard equivalent, not a replacement.
- Do NOT add error boundaries around every component — scope is the view-switcher (`Canvas`/`XmlPreview`/`ValidationView`), the highest-risk subtree per the audit (contains the lazy-loaded Monaco editor).
- Do NOT change `XmlPreview.tsx`'s `Suspense`/`lazy` logic — the error boundary wraps around it from `App.tsx`, not inside `XmlPreview.tsx` itself (a boundary inside `XmlPreview` would only protect that one view; wrapping from `App.tsx` protects the pattern for `Canvas`/`ValidationView` too, which is arguably lower-risk today but cheap insurance).
- STOP if `App.tsx`'s keydown handler or view-switcher JSX has drifted from the commit stamp; report drift instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint`, `npm test`.
- **Behavior check (Escape)**: Select a block, press Escape, confirm it deselects (Inspector reverts to "Flow settings"). Confirm Escape while typing in an input does nothing new (existing behavior preserved). Confirm Escape while the command palette is open closes the palette only, not both the palette and deselect anything.
- **Behavior check (error boundary)**: Temporarily force `MonacoEditor`'s dynamic import to reject (e.g. rename `MonacoXmlEditor.tsx` briefly, or throw inside it) and confirm switching to the XML tab shows the fallback UI instead of a blank white screen, and that Retry / switching to another tab and back recovers normally once the forced failure is reverted.
- **Done when**: the targeted diagnostic is clear for `Canvas.tsx:106`, required checks pass, and both behavior checks above pass.
