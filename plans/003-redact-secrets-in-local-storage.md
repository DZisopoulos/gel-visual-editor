# 003 — Redact secret-kind fields before persisting to localStorage

- **Status**: TODO
- **Commit**: a5eb0ea
- **Severity**: HIGH
- **Category**: Security
- **Rule**: client-localstorage-no-version (content-risk aspect; see plan 021 for the versioning aspect)
- **Estimated scope**: 2 files, small change each
- **Depends on**: plan 002 (introduces the `'secret'` field kind this plan reuses)

## Problem

`src/renderer/src/App.tsx:136`:

    const timer = window.setTimeout(
      () => localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(flow)),
      800
    )

`src/renderer/src/snippets.ts:24-30`:

    export function saveSnippet(block: Block, name: string): SavedSnippet {
      const snippet: SavedSnippet = {
        id: `snippet-${Date.now()}`,
        name: name.trim() || block.props.stepName || block.type,
        block: structuredClone(block)
      }
      localStorage.setItem(SNIPPETS_KEY, JSON.stringify([snippet, ...readSnippets()].slice(0, 30)))
      return snippet
    }

Both persist full flow/block objects — including plaintext `password` props (same fields plan 002 marks as `kind: 'secret'`) — to `localStorage` unencrypted. Autosave writes on every dirty edit (survives until the next successful save); snippets persist indefinitely (up to 30 entries). A user who types a real Clarity credential into an XOG/FTP block has it sitting in plaintext browser storage.

## Target

Reuse plan 002's `redactSecrets(flow)` helper (from `src/shared/roundtrip.ts`) for the autosave path, and add an equivalent single-block redaction for snippets.

    // src/shared/roundtrip.ts — export the helper (was module-private in plan 002) and add a
    // single-block variant, since snippets persist one block, not a whole flow
    export function redactSecrets(flow: Flow): Flow { /* ...as added in plan 002... */ }
    export function redactBlockSecrets(block: Block): Block {
      const def = getNodeDef(block.type)
      const props = { ...block.props }
      for (const field of def.fields) {
        if (field.kind === 'secret' && props[field.key]) props[field.key] = ''
      }
      return {
        ...block,
        props,
        ...(block.children ? { children: block.children.map(redactBlockSecrets) } : {})
      }
    }

    // src/renderer/src/App.tsx:136
    import { redactSecrets } from '../../shared/roundtrip'
    // ...
    const timer = window.setTimeout(
      () => localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(redactSecrets(flow))),
      800
    )

    // src/renderer/src/snippets.ts:24-30
    import { redactBlockSecrets } from '../../shared/roundtrip'
    export function saveSnippet(block: Block, name: string): SavedSnippet {
      const snippet: SavedSnippet = {
        id: `snippet-${Date.now()}`,
        name: name.trim() || block.props.stepName || block.type,
        block: redactBlockSecrets(structuredClone(block))
      }
      localStorage.setItem(SNIPPETS_KEY, JSON.stringify([snippet, ...readSnippets()].slice(0, 30)))
      return snippet
    }

Note: this means a recovered autosave draft or an inserted snippet will have empty password fields — same tradeoff as export (plan 002); the user re-enters them. This is the correct tradeoff for a local-first desktop app with no encrypted-storage layer.

## Repo conventions to follow

- Keep `redactSecrets`/`redactBlockSecrets` in `src/shared/roundtrip.ts` alongside the related `exportXml` logic from plan 002, not duplicated in `App.tsx`/`snippets.ts`.
- Match existing relative-import style (`../../shared/roundtrip` from `src/renderer/src/*`).

## Steps

1. Implement plan 002 first (or verify it's already applied) — this plan depends on the `'secret'` field kind and the `redactSecrets` helper it introduces.
2. In `src/shared/roundtrip.ts`, export `redactSecrets` (drop the module-private restriction if plan 002 left it unexported) and add `redactBlockSecrets` as shown in Target.
3. In `App.tsx:136`, import `redactSecrets` and wrap the `flow` argument passed to `JSON.stringify` in the autosave `setTimeout`.
4. In `snippets.ts:24-30`, import `redactBlockSecrets` and apply it to the cloned block before building the `snippet` object.
5. Re-read both diffs for unrelated churn.

## Boundaries

- Do NOT change the in-memory Zustand `flow`/block state — only the serialized copies written to `localStorage`.
- Do NOT change `readSnippets`'s parsing/validation logic.
- Keep the 800ms autosave debounce and the 30-item snippet cap unchanged.
- STOP if `App.tsx`'s autosave effect or `snippets.ts` has drifted from the commit stamp; report drift instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint`, `npm test`.
- **Behavior check**: Add an XOG Read block with a password, wait for autosave (or trigger a dirty edit), then inspect `localStorage.getItem('gve-autosave-draft')` in DevTools — confirm the password field is empty in the stored JSON while other props are intact. Repeat for "Save as snippet" on that block and inspect `localStorage.getItem('gve-snippets')`.
- **Done when**: typecheck/lint/tests pass, and neither `localStorage` key contains a real password value after the behavior check above.
