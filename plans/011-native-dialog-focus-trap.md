# 011 — Give the confirm/alert/prompt modal and command palette a real focus trap

- **Status**: TODO
- **Commit**: a5eb0ea
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Rule**: prefer-html-dialog
- **Estimated scope**: 2 files, moderate change
- **Depends on**: plans 001, 010 (DialogProvider's queue/memoization changes should land first so this plan's diff is against stable code)

## Problem

`src/renderer/src/components/DialogProvider.tsx:87` (`DialogView`) and `src/renderer/src/components/CommandPalette.tsx:78` — both are `role="dialog"` `<div>`/`<section>` elements with no native focus trap. Tab can move focus out of either modal into the app behind it while it's supposedly modal. `DialogView`'s `alert`/`confirm` variants also have no `Escape` handling — only the `prompt` variant's `<input>` handles it (`DialogProvider.tsx:118-121`), because the key handler is attached to that one input rather than the dialog as a whole.

## Target

The canonical fix per `react-doctor rules explain prefer-html-dialog` is: replace the wrapper with `<dialog>` and open it via `dialogRef.current?.showModal()`, which gives a native focus trap, top-layer stacking, and built-in `Escape`-to-close for free (no manual keydown handler needed for closing — `<dialog>` fires a `cancel` event on Escape that can be intercepted if custom confirm-before-close behavior is needed, but for `DialogView`/`CommandPalette` neither needs to block Escape).

    // DialogProvider.tsx — DialogView, restructured around <dialog>
    function DialogView({ request, onFinish }: { ... }): React.JSX.Element {
      const dialogRef = useRef<HTMLDialogElement>(null)
      const [input, setInput] = useState(request.defaultValue ?? '')
      const isPrompt = request.kind === 'prompt'
      const isAlert = request.kind === 'alert'

      useEffect(() => {
        dialogRef.current?.showModal()
      }, [])

      const close = (value: boolean | string | null): void => {
        dialogRef.current?.close()
        onFinish(value)
      }

      return (
        <dialog
          ref={dialogRef}
          className="gve-about-dialog gve-confirm-dialog"
          aria-labelledby="gve-dialog-title"
          aria-describedby="gve-dialog-message"
          onCancel={(event) => {
            // native Escape → treat like the existing backdrop-click/close-button behavior
            event.preventDefault()
            close(isAlert ? true : isPrompt ? null : false)
          }}
          onClick={(event) => {
            // click on the ::backdrop (native <dialog> gives the backdrop a pseudo-element,
            // but a click that lands on the <dialog> element itself, outside its content box,
            // is how backdrop clicks are detected without JS-managed overlay divs)
            if (event.target === dialogRef.current) close(isAlert ? true : isPrompt ? null : false)
          }}
        >
          {/* existing .gve-about-hero / .gve-about-body / .gve-about-actions content unchanged,
              but every onFinish(...) call site inside becomes close(...) */}
        </dialog>
      )
    }

Remove the now-redundant `.gve-modal-backdrop` wrapper `<div>` and its `onMouseDown` handler — `<dialog>` with `showModal()` renders its own backdrop (styleable via `::backdrop` in CSS) and handles the outside-click-to-dismiss case via the `onClick`/`event.target === dialogRef.current` check shown above (this works because clicking outside the dialog's content box but still on the `<dialog>` element itself only happens when the click is on the backdrop area).

`theme.css` needs a `.gve-about-dialog::backdrop` rule replacing the current `.gve-modal-backdrop` styling (background/blur), and `<dialog>` needs `margin: auto` (or similar) since browsers center it differently than the current `display: grid; place-items: center` wrapper — check the rendered result and adjust.

Apply the same `<dialog>`/`showModal()` pattern to `CommandPalette.tsx`'s `<section role="dialog">` (`CommandPalette.tsx:76-81`), removing its `.gve-modal-backdrop` wrapper the same way; it already has `Escape` handling on its input (`CommandPalette.tsx:96`) which becomes redundant with `<dialog>`'s native `cancel` event but can stay as a fallback or be removed — prefer removing it to avoid double-handling, calling the native `onCancel` path instead.

## Repo conventions to follow

- Keep `DialogContextValue`'s public API and `CommandPaletteProps` unchanged — this is an internal markup change.
- Match this codebase's existing `useRef`/`useEffect` patterns (e.g. `CommandPalette.tsx:26,34-36`'s `inputRef`/focus-on-mount effect) for the new `dialogRef`/`showModal()` effect.
- Preserve every existing visual class name (`gve-about-dialog`, `gve-confirm-dialog`, `gve-command-palette`) so `theme.css`'s existing box/animation styling still applies to the `<dialog>` element — only the backdrop mechanism changes.

## Steps

1. Read `react-doctor rules explain prefer-html-dialog` output (already fetched — see plan header) and the MDN `<dialog>`/`showModal()` docs mentally before starting; this is a real behavior change (native modal semantics), not a class rename.
2. In `DialogProvider.tsx`, restructure `DialogView` around a `<dialog>` element as shown in Target: add `dialogRef`, call `showModal()` in a mount effect, replace every `onFinish(...)` call site in the JSX with a `close(...)` wrapper that also calls `dialogRef.current?.close()`, add `onCancel` for native Escape, add the backdrop-click `onClick` check, and remove the outer `.gve-modal-backdrop` div.
3. In `CommandPalette.tsx`, apply the equivalent restructuring to `CommandPaletteBody`'s returned JSX.
4. In `theme.css`, add `.gve-about-dialog::backdrop, .gve-command-palette::backdrop { background: rgba(4, 7, 12, 0.68); backdrop-filter: blur(5px); }` (matching the current `.gve-modal-backdrop` values at `theme.css:1150-1152`), and adjust `.gve-about-dialog`/`.gve-command-palette` positioning rules if the native `<dialog>` centering doesn't match the previous `grid; place-items: center` layout (native `<dialog>` centers via UA stylesheet `margin: auto` on a fixed-position element — verify visually and adjust `margin`/`inset` as needed rather than assuming).
5. Remove `.gve-modal-backdrop`, `.gve-command-backdrop` CSS rules if nothing else references them after this change — check `AboutDialog.tsx`/`TemplatePicker.tsx`/`SnippetDialog.tsx` first, since they still use `.gve-modal-backdrop` and are NOT touched by this plan (that's plan 019) — do not remove the class while those three still depend on it.
6. Re-read both component diffs and the CSS diff for correctness and unrelated churn.

## Boundaries

- Do NOT touch `AboutDialog.tsx`, `TemplatePicker.tsx`, `SnippetDialog.tsx` in this plan — they're covered by plan 019's shared-modal-shell extraction, which should reuse whatever pattern this plan establishes.
- Do NOT change `DialogContextValue`'s or `CommandPaletteProps`'s public signatures.
- Preserve exact visual appearance (colors, spacing, animation) — only the backdrop/focus-trap mechanism changes, not the look.
- STOP if `<dialog>`/`showModal()` behaves unexpectedly in the Electron/Chromium version this app ships (verify in the running app, not just by reading MDN) — report what's observed instead of forcing the pattern if it doesn't work.

## Verification

- **Mechanical**:
  - `npx react-doctor@latest --scope changed` clears `prefer-html-dialog` for `DialogProvider.tsx` and `CommandPalette.tsx`, score does not regress.
  - `npm run typecheck`, `npm run lint`, `npm test`.
- **Behavior check**: Open a confirm dialog (e.g. File → New flow with unsaved changes) and Tab repeatedly — confirm focus stays trapped within the dialog (cycles between Cancel/Confirm, doesn't escape to the app behind it). Press Escape — confirm it closes with the expected cancel-like behavior. Click outside the dialog content (on the backdrop) — confirm it closes. Repeat for the command palette (Ctrl+K): Tab-trap, Escape-close, backdrop-click-close, and confirm arrow-key navigation through results still works exactly as before.
- **Done when**: the targeted diagnostic is clear for both files, score is not lower, required checks pass, and every behavior check above passes.
