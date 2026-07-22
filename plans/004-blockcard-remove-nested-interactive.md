# 004 — Remove illegal nested-interactive structure from BlockCard

- **Status**: TODO
- **Commit**: a5eb0ea
- **Severity**: HIGH
- **Category**: Accessibility
- **Rule**: no-noninteractive-element-to-interactive-role, html-no-nested-interactive
- **Estimated scope**: 1 file (+ theme.css touch-up), ~30 line change

## Problem

`src/renderer/src/components/BlockCard.tsx:34-58` — current:

    return (
      <article
        className={`gve-block${selected ? ' gve-block-selected' : ''}${block.enabled ? '' : ' gve-block-disabled'}`}
        role="button"
        tabIndex={0}
        draggable
        onClick={(event) => {
          event.stopPropagation()
          select(block.id)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            event.stopPropagation()
            select(block.id)
          }
        }}
        onDragStart={(event) => { /* ... */ }}
        style={{ '--block-color': def.color } as React.CSSProperties}
      >
        <div className="gve-block-head">
          {/* ... */}
          <div className="gve-block-actions">
            <button /* Duplicate */>＋</button>
            <button /* Save as snippet */>⌑</button>
            <button /* Enable/Disable */>⏻</button>
            <button /* Delete */>×</button>
          </div>
        </div>
        {summary && <div className="gve-block-summary">{summary}</div>}
        {children}
      </article>
    )

The `<article role="button" tabIndex={0}>` wraps four real `<button>` elements. This is both an invalid ARIA pattern (`no-noninteractive-element-to-interactive-role` — `<article>` is not naturally interactive, giving it `role="button"` fakes it) and an illegal nesting (`html-no-nested-interactive` — a focusable button can never be a descendant of another interactive element; screen readers announce it ambiguously and Tab stops twice for what looks like one control).

## Target

`react-doctor rules explain prefer-tag-over-role`/`html-no-nested-interactive` canonical guidance is: move the inner controls beside their interactive ancestor, or make the ancestor non-interactive and put selection on a real control. Since the card as a whole needs to be draggable AND selectable, and the header row already contains 4 real buttons, the correct fix is: keep `<article>` non-interactive (no `role`, no `tabIndex`, no `onClick`/`onKeyDown` on the card itself), and make the block's *title area* (icon + name, not the whole card) the focusable, selectable, draggable control — the part of the header that isn't already a button.

    <article
      className={`gve-block${selected ? ' gve-block-selected' : ''}${block.enabled ? '' : ' gve-block-disabled'}`}
      style={{ '--block-color': def.color } as React.CSSProperties}
    >
      <div className="gve-block-head">
        <button
          type="button"
          className="gve-block-select"
          aria-pressed={selected}
          aria-label={`Select ${def.name}${block.props.stepName ? `: ${block.props.stepName}` : ''}`}
          draggable
          onClick={(event) => {
            event.stopPropagation()
            select(block.id)
          }}
          onDragStart={(event) => {
            event.stopPropagation()
            event.dataTransfer.setData('application/x-gve-move-block', block.id)
            event.dataTransfer.effectAllowed = 'move'
            setBlockDragPreview(event, def.name, def.color)
          }}
        >
          <span className="gve-block-icon" aria-hidden="true">
            <BlockIcon type={block.type} definition={def} />
          </span>
          <span className="gve-block-title">
            <span className="gve-block-type">{def.name}</span>
            <span className={`gve-block-name${block.props.stepName ? '' : ' gve-block-name-muted'}`}>
              {block.props.stepName || 'Unnamed step'}
            </span>
          </span>
        </button>
        <span className="gve-block-grip" aria-hidden="true">⠿</span>
        <div className="gve-block-actions">
          {/* four existing buttons, unchanged */}
        </div>
      </div>
      {summary && <div className="gve-block-summary">{summary}</div>}
      {children}
    </article>

`.gve-block-select` needs `display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; border: 0; background: transparent; text-align: left; padding: 0;` added to `theme.css` so the button doesn't visually change the existing header layout (it replaces the flex-item role the old `<span className="gve-block-icon">` + `<div className="gve-block-title">` pair played directly inside `.gve-block-head`).

## Repo conventions to follow

- Match the existing `aria-label` phrasing style used elsewhere in this file (e.g. `` `Duplicate ${def.name}` ``).
- Keep `event.stopPropagation()` on click/dragstart, matching the existing pattern (prevents the click from bubbling to `Canvas`'s `onClick={() => select(null)}`).
- Follow `theme.css`'s existing flex-based header layout conventions (see `.gve-block-head` immediately above in the same file).

## Steps

1. In `src/renderer/src/components/BlockCard.tsx`, remove `role="button"`, `tabIndex={0}`, `onClick`, `onKeyDown`, and `draggable`/`onDragStart` from the `<article>` element.
2. Wrap the icon + title block in a new `<button className="gve-block-select" aria-pressed={selected} aria-label="...">`, moving `onClick`, `onDragStart`, and `draggable` onto it as shown in Target.
3. In `src/renderer/src/theme.css`, add a `.gve-block-select` rule near `.gve-block-head` (see current `theme.css:730-736` area) giving it the layout properties noted in Target so the header's visual appearance is unchanged.
4. Re-read the diff: confirm `.gve-block-title`'s existing CSS rule (`gap: 2px; flex-direction: column`) still applies since the class name is unchanged, just now inside a `<button>` instead of directly inside `.gve-block-head`.

## Boundaries

- Do NOT change the four action buttons (Duplicate/Save/Toggle/Delete) — they already have correct `aria-label`s and independent click handlers.
- Do NOT change `select`/drag-and-drop store logic — this is a markup/semantics fix only.
- Preserve the exact visual appearance (spacing, alignment) of the block header — verify with a screenshot before/after.
- STOP if `BlockCard.tsx` has drifted from the commit stamp; report drift instead of improvising.

## Verification

- **Mechanical**:
  - `npx react-doctor@latest --scope changed` clears `no-noninteractive-element-to-interactive-role` and `html-no-nested-interactive` for this file, score does not regress.
  - `npm run typecheck`, `npm run lint`, `npm test`.
- **Behavior check**: Add a block to a flow, click its title area to select it (confirm `gve-block-selected` styling still applies), Tab through the card and confirm focus visits the title button once, then each of the four action buttons independently (not twice for the card + once per button as before). Confirm drag-to-reorder still works by dragging from the title area. Take a before/after screenshot of a block card and confirm no visual layout shift.
- **Done when**: the two targeted diagnostics are clear, score is not lower, required checks pass, and the behavior/screenshot checks above match.
