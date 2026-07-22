# 015 — Extract a shared modal shell used by all five dialog-like components

- **Status**: TODO
- **Commit**: a5eb0ea
- **Severity**: MEDIUM
- **Category**: Maintainability & architecture
- **Rule**: prefer-html-dialog (x3 remaining instances) + beyond scan (duplication)
- **Estimated scope**: 4 files, moderate change
- **Depends on**: plan 011 (establishes the `<dialog>`/`showModal()` pattern this plan generalizes into a shared component)

## Problem

`AboutDialog.tsx:9`, `TemplatePicker.tsx:16`, `SnippetDialog.tsx:23` (plus `DialogProvider.tsx`'s `DialogView` and `CommandPalette.tsx`, both already fixed by plan 011) each hand-roll the same modal shell: a `.gve-modal-backdrop` div with `onMouseDown` close-on-outside-click, a `role="dialog"` section, and a `×` close button. Confirmed divergent behavior from direct reads: `AboutDialog.tsx`, `TemplatePicker.tsx`, and `SnippetDialog.tsx` have **no** `onKeyDown`/`Escape` handling anywhere in their files, unlike `DialogProvider`/`CommandPalette` (pre-plan-011) which did handle it partially.

## Target

Extract the `<dialog>`-based shell plan 011 already built for `DialogView`/`CommandPalette` into a reusable component, then migrate the three remaining hand-rolled dialogs onto it.

    // src/renderer/src/components/ModalShell.tsx — new file
    import { useEffect, useRef, type ReactNode } from 'react'

    interface ModalShellProps {
      open: boolean
      onClose: () => void
      className: string
      ariaLabel?: string
      ariaLabelledBy?: string
      children: ReactNode
    }

    export function ModalShell({
      open,
      onClose,
      className,
      ariaLabel,
      ariaLabelledBy,
      children
    }: ModalShellProps): React.JSX.Element | null {
      const dialogRef = useRef<HTMLDialogElement>(null)

      useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        if (open && !dialog.open) dialog.showModal()
        if (!open && dialog.open) dialog.close()
      }, [open])

      if (!open) return null
      return (
        <dialog
          ref={dialogRef}
          className={className}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          onCancel={(event) => {
            event.preventDefault()
            onClose()
          }}
          onClick={(event) => {
            if (event.target === dialogRef.current) onClose()
          }}
        >
          {children}
        </dialog>
      )
    }

    // AboutDialog.tsx — migrated
    function AboutDialog({ open, onClose }: AboutDialogProps): React.JSX.Element | null {
      return (
        <ModalShell open={open} onClose={onClose} className="gve-about-dialog" ariaLabelledBy="gve-about-title">
          <div className="gve-about-hero">{/* unchanged */}</div>
          <div className="gve-about-body">{/* unchanged */}</div>
          <div className="gve-about-actions">{/* unchanged */}</div>
        </ModalShell>
      )
    }

Apply the equivalent migration to `TemplatePicker.tsx` and `SnippetDialog.tsx` — each drops its own `.gve-modal-backdrop` wrapper and `onMouseDown` handler in favor of `<ModalShell>`, keeping their existing inner content/classNames unchanged.

## Repo conventions to follow

- Match plan 011's exact `<dialog>`/`showModal()`/backdrop-click-via-`event.target === dialogRef.current` pattern — this plan generalizes that same mechanism, not a new one.
- Keep each dialog's existing content structure/class names (`gve-about-dialog`, `gve-template-dialog`, `gve-snippet-dialog` if it has its own class — check) untouched; only the outer shell changes.
- Follow this codebase's existing named-export vs default-export convention per file (check whether other shared components in this directory default-export or named-export, and match).

## Steps

1. Confirm plan 011 has landed first (or apply this plan's `ModalShell` design independently if 011 hasn't — but the `<dialog>` pattern must match to avoid two different modal mechanisms coexisting).
2. Create `src/renderer/src/components/ModalShell.tsx` as shown in Target.
3. Migrate `AboutDialog.tsx` to use `ModalShell`, removing its own backdrop/dialog markup.
4. Migrate `TemplatePicker.tsx` the same way.
5. Migrate `SnippetDialog.tsx` the same way.
6. In `theme.css`, add `::backdrop` rules for `.gve-template-dialog`/`.gve-about-dialog` (if not already added by plan 011) matching the existing `.gve-modal-backdrop` visual values, and remove `.gve-modal-backdrop` entirely once nothing references it (verify via grep across all `.tsx` files first).
7. Re-read all four diffs for unrelated churn and consistent behavior across the three migrated dialogs.

## Boundaries

- Do NOT change any dialog's visible content, copy, or layout — only the outer shell mechanism.
- Do NOT touch `DialogProvider.tsx`/`CommandPalette.tsx` in this plan if plan 011 already migrated them — avoid re-touching those files; if 011 hasn't landed, coordinate rather than duplicating that work here.
- STOP if any of the three target files has drifted from the commit stamp; report drift instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint`, `npm test`.
- **Behavior check**: Open each of the three dialogs (About via Help menu, Starter templates via Palette, Snippet library via Palette) and for each: confirm Tab-focus stays trapped inside, Escape closes it, clicking the backdrop closes it, and the visible content/styling is unchanged from before.
- **Done when**: the `prefer-html-dialog` diagnostic clears for all three files, required checks pass, and every behavior check above passes for all three dialogs.
