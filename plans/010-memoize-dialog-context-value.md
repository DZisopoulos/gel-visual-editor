# 010 — Memoize DialogContext's provider value

- **Status**: TODO
- **Commit**: a5eb0ea
- **Severity**: MEDIUM
- **Category**: Performance
- **Rule**: context-provider-value-from-unmemoized-local-literal
- **Estimated scope**: 1 file, small change
- **Depends on**: plan 001 (changes `DialogProvider`'s internal state shape from `request` to `queue`; apply after 001 so this plan's diff is against the post-001 code)

## Problem

`src/renderer/src/components/DialogProvider.tsx:49-57` — current (post-plan-001 shape):

    const value: DialogContextValue = {
      confirm: async (title, message, options) =>
        Boolean(await enqueue({ kind: 'confirm', title, message, ...options })),
      alert: async (title, message) => {
        await enqueue({ kind: 'alert', title, message })
      },
      prompt: (title, message, defaultValue = '') =>
        enqueue({ kind: 'prompt', title, message, defaultValue }) as Promise<string | null>
    }

This object is rebuilt every render of `DialogProvider`, which re-renders on every dialog open/close (every `confirm`/`alert`/`prompt` call anywhere in the app). Confirmed consumers: `App.tsx:62` (`useDialog()` inside `AppContent`, the sole child wrapped by `<DialogProvider><ToastProvider><AppContent /></ToastProvider></DialogProvider>`), `BlockCard.tsx:24` (`const { prompt } = useDialog()`, called from **every rendered block card**, not just the one whose snippet-save is in progress), and `Header.tsx:62` (`const { confirm, alert } = useDialog()`). Because context consumers re-render whenever the provider's `value` reference changes, opening or closing *any* dialog anywhere in the app currently re-renders the entire `AppContent` tree — including every `BlockCard` — not just the dialog itself.

## Target

    import { useCallback, useMemo } from 'react'
    // ...
    const confirm = useCallback(
      async (title: string, message: string, options?: Pick<DialogRequest, 'confirmLabel' | 'cancelLabel'>) =>
        Boolean(await enqueue({ kind: 'confirm', title, message, ...options })),
      [enqueue]
    )
    const alert = useCallback(
      async (title: string, message: string) => {
        await enqueue({ kind: 'alert', title, message })
      },
      [enqueue]
    )
    const prompt = useCallback(
      (title: string, message: string, defaultValue = '') =>
        enqueue({ kind: 'prompt', title, message, defaultValue }) as Promise<string | null>,
      [enqueue]
    )
    const value = useMemo<DialogContextValue>(() => ({ confirm, alert, prompt }), [confirm, alert, prompt])

`enqueue` itself must be stable too (wrap it in `useCallback` if it isn't already after plan 001's changes) or the `useCallback` deps above won't actually help — verify `enqueue`'s definition doesn't close over anything that changes identity every render (it uses `setQueue`, which is stable by React's guarantee, so `enqueue` itself can be wrapped in `useCallback(enqueue, [])` with an empty dependency array).

## Repo conventions to follow

- Match the plain-function style already used in the file (arrow functions assigned to `const`), just adding the `useCallback`/`useMemo` wrapper — don't restructure into a class or a different pattern.
- Keep `DialogContextValue`'s public shape and behavior identical — this is a pure memoization change.

## Steps

1. In `src/renderer/src/components/DialogProvider.tsx`, wrap `enqueue` in `useCallback(..., [])` (stable — only closes over `setQueue`, which React guarantees is stable).
2. Wrap `confirm`, `alert`, `prompt` each in `useCallback` with `[enqueue]` as the dependency array.
3. Replace the inline `value` object literal with `useMemo(() => ({ confirm, alert, prompt }), [confirm, alert, prompt])`.
4. Re-read the diff — confirm `finish` (used only internally by `DialogView`, not exposed via context) doesn't need memoization; only what's placed in `DialogContext.Provider value={...}` matters for this fix.

## Boundaries

- Do NOT change `DialogContextValue`'s public method signatures.
- Do NOT change `finish`/`DialogView`'s rendering — this plan is scoped to the context value's memoization only.
- STOP if `DialogProvider.tsx` has drifted from the commit stamp (especially if plan 001 hasn't landed yet — apply that first); report drift instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint`, `npm test`.
- **Behavior check**: Open React DevTools Profiler, start recording, trigger a dialog (e.g. File → New flow with unsaved changes, to get the confirm dialog), dismiss it, stop recording. Confirm `BlockCard` instances that aren't related to the dialog do NOT re-render during this interaction (use "Highlight updates" and confirm block cards don't flash when a dialog opens/closes). Confirm dialogs still function correctly (confirm/cancel/prompt all still resolve their promises as before).
- **Done when**: required checks pass, and the Profiler/Highlight-updates check confirms `BlockCard`s no longer re-render on dialog open/close.
