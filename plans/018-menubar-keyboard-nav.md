# 018 — Add Escape-to-close and arrow-key navigation to the application menu

- **Status**: TODO
- **Commit**: a5eb0ea
- **Severity**: LOW
- **Category**: Accessibility
- **Rule**: Beyond the scan

## Problem

`src/renderer/src/components/MenuBar.tsx:37-43` — current:

    useEffect(() => {
      const onPointerDown = (event: PointerEvent): void => {
        if (!menuRef.current?.contains(event.target as Node)) setOpenMenu(null)
      }
      document.addEventListener('pointerdown', onPointerDown)
      return () => document.removeEventListener('pointerdown', onPointerDown)
    }, [])

The File/Edit/View/Help dropdowns close only via this outside-`pointerdown` listener — confirmed no `Escape`/keydown handling and no arrow-key navigation between items anywhere in the file. Once a menu is open, a keyboard user can Tab through its items (native tab order) but cannot close it with Escape or navigate with arrow keys the way native/most web menus support.

## Target

    // MenuBar.tsx — extend the existing outside-click effect to also handle Escape
    useEffect(() => {
      const onPointerDown = (event: PointerEvent): void => {
        if (!menuRef.current?.contains(event.target as Node)) setOpenMenu(null)
      }
      const onKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape' && openMenu) {
          setOpenMenu(null)
          triggerRefs.current[openMenu]?.focus()
        }
      }
      document.addEventListener('pointerdown', onPointerDown)
      document.addEventListener('keydown', onKeyDown)
      return () => {
        document.removeEventListener('pointerdown', onPointerDown)
        document.removeEventListener('keydown', onKeyDown)
      }
    }, [openMenu])

    // arrow-key navigation within an open popover — add onKeyDown to .gve-menu-popover
    <div
      className="gve-menu-popover"
      onKeyDown={(event) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
        event.preventDefault()
        const items = Array.from(
          event.currentTarget.querySelectorAll<HTMLButtonElement>('.gve-menu-item:not(:disabled)')
        )
        const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement)
        const nextIndex =
          event.key === 'ArrowDown'
            ? (currentIndex + 1) % items.length
            : (currentIndex - 1 + items.length) % items.length
        items[nextIndex]?.focus()
      }}
    >

Add a `triggerRefs` map (`useRef<Partial<Record<MenuId, HTMLButtonElement>>>({})`) so Escape can return focus to the trigger button that opened the menu, matching standard menu-button behavior — attach via `ref={(el) => { if (el) triggerRefs.current[menu] = el }}` on each trigger `<button>`.

## Repo conventions to follow

- Match the existing `useRef`/`useEffect` cleanup pattern already used for the outside-pointerdown listener in this same file.
- Keep `item()`'s existing button-rendering helper unchanged — the arrow-key handler queries rendered `.gve-menu-item` buttons via DOM query rather than requiring `item()` to accept refs, keeping the change localized to the popover container.

## Steps

1. In `MenuBar.tsx`, add a `triggerRefs` ref map and attach it to each of the four trigger buttons (`gve-menu-trigger`).
2. Extend the existing outside-pointerdown `useEffect` to also register a `keydown` listener handling `Escape` as shown in Target, updating the effect's dependency array to `[openMenu]` since the handler now reads `openMenu`.
3. Add the arrow-key `onKeyDown` handler to `.gve-menu-popover`'s `<div>` as shown in Target.
4. Re-read the diff — confirm the arrow-key handler's `document.activeElement` check correctly identifies which item is focused within THIS specific popover (not some other stray focused element) since `querySelectorAll` is scoped to `event.currentTarget`.

## Boundaries

- Do NOT change menu item actions/labels/disabled logic — only add keyboard navigation on top.
- Do NOT change the outside-click-closes behavior — Escape and arrow-keys are additive.
- STOP if `MenuBar.tsx` has drifted from the commit stamp; report drift instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint`, `npm test`.
- **Behavior check**: Open the File menu via keyboard (Tab to it, Enter/Space), confirm ArrowDown/ArrowUp moves focus between its items wrapping at the ends, press Escape and confirm the menu closes and focus returns to the File trigger button. Repeat for Edit/View/Help.
- **Done when**: required checks pass and keyboard navigation works as described for all four menus.
