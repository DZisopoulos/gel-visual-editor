# 020 — Hoist WindowTitleBar's pure handlers to module scope

- **Status**: TODO
- **Commit**: a5eb0ea
- **Severity**: LOW
- **Category**: Performance & Maintainability
- **Rule**: prefer-module-scope-pure-function
- **Estimated scope**: 1 file, trivial change

## Problem

`src/renderer/src/components/WindowTitleBar.tsx:12,20`:

    const minimize = (): void => {
      void window.gve?.window.minimize()
    }
    // ...
    const close = (): void => {
      void window.gve?.window.close()
    }

Both are pure closures over the global `window.gve` API with no dependency on component state or props, but are recreated on every render of a component that re-renders whenever its local `maximized` state toggles (window minimize/maximize interactions).

## Target

    // module scope, above the component
    const minimize = (): void => {
      void window.gve?.window.minimize()
    }
    const close = (): void => {
      void window.gve?.window.close()
    }

    function WindowTitleBar(): React.JSX.Element {
      const [maximized, setMaximized] = useState(false)
      // toggleMaximize stays inside the component — it depends on setMaximized
      const toggleMaximize = (): void => {
        const controls = window.gve?.window
        if (!controls) return
        void controls.toggleMaximize().then(setMaximized)
      }
      // ...rest unchanged, minimize/close now reference the module-scope functions
    }

## Repo conventions to follow

- Match `BlockIcon.tsx`'s existing correct pattern of module-scope constants/functions placed above the component definition in the same file.

## Steps

1. In `src/renderer/src/components/WindowTitleBar.tsx`, move `minimize` and `close` above the `WindowTitleBar` function declaration, unchanged otherwise.
2. Leave `toggleMaximize` inside the component (it genuinely depends on `setMaximized`, a per-instance value).
3. Re-read the diff — confirm the component's returned JSX still references `minimize`/`close`/`toggleMaximize` correctly (no import/scope errors).

## Boundaries

- Do NOT move `toggleMaximize` — it's not a pure function (depends on component state).
- Do NOT change any other part of this file.
- STOP if `WindowTitleBar.tsx` has drifted from the commit stamp; report drift instead of improvising.

## Verification

- **Mechanical**:
  - `npx react-doctor@latest --scope changed` clears `prefer-module-scope-pure-function` for this file, score does not regress.
  - `npm run typecheck`, `npm run lint`, `npm test`.
- **Behavior check**: Confirm the window's minimize, maximize/restore, and close buttons all still work correctly in the running app.
- **Done when**: the targeted diagnostic clears, required checks pass, and window controls behave identically to before.
