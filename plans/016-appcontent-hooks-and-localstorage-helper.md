# 016 — Split AppContent's effects into focused hooks, backed by a shared versioned localStorage helper

- **Status**: TODO
- **Commit**: a5eb0ea
- **Severity**: MEDIUM
- **Category**: Maintainability & architecture
- **Rule**: client-localstorage-no-version (x4, root cause) + beyond scan (giant component)
- **Estimated scope**: 4-5 files, moderate-large change
- **Depends on**: plan 003 (autosave redaction — apply the localStorage helper on top of the already-redacted write, not instead of it)

## Problem

**No shared localStorage helper**: `src/renderer/src/theme.ts`, `src/renderer/src/snippets.ts`, and `App.tsx` each reimplement their own try/catch `JSON.parse`/`JSON.stringify` around raw key strings with no version field — confirmed 4 separate `client-localstorage-no-version` diagnostics (`App.tsx:80`, `App.tsx:136`, `snippets.ts:30`, `snippets.ts:36`) trace back to this structural duplication rather than 4 independent oversights.

**`AppContent` giant component**: `App.tsx:48-289` (`AppContent`) owns 9 separate `useEffect`s covering unrelated concerns — confirmed via direct read: theme persistence (76-78), layout persistence (79-81), dirty-sync to main process (82-84), responsive breakpoint detection (85-92), system-theme polling (93-99), autosave-draft recovery (100-119), IPC close-confirmation (120-129), autosave-draft save (130-140), pointer-based panel resizing (141-163), and global keyboard-shortcut routing (164-201) — all in one function body.

## Target

**Shared helper** (`src/shared/localStorage.ts` — new file, in `shared/` since it's a pure utility, not renderer-specific React code, though it does call the `localStorage` global which only exists in the renderer; keep it in `renderer/src` instead since `shared/` is consumed by both renderer and potentially main/preload where `localStorage` doesn't exist — place at `src/renderer/src/localStorage.ts`):

    // src/renderer/src/localStorage.ts
    export function readJson<T>(key: string, version: number, fallback: T): T {
      try {
        const raw = localStorage.getItem(key)
        if (!raw) return fallback
        const parsed = JSON.parse(raw) as { v: number; data: T }
        if (parsed.v !== version) return fallback
        return parsed.data
      } catch {
        return fallback
      }
    }

    export function writeJson<T>(key: string, version: number, data: T): void {
      localStorage.setItem(key, JSON.stringify({ v: version, data }))
    }

    export function removeJson(key: string): void {
      localStorage.removeItem(key)
    }

Every call site (`theme.ts`'s `loadThemePreferences`/`saveThemePreferences`, `snippets.ts`'s `readSnippets`/`saveSnippet`/`removeSnippet`, `App.tsx`'s layout and autosave persistence) migrates to this helper with an explicit version number (start at `1` for all of them — this is a new versioning scheme, not matching any prior implicit version).

**Hook extraction** — pull cohesive effect groups out of `AppContent` into named hooks in a new `src/renderer/src/hooks/` directory:

    // src/renderer/src/hooks/usePanelResize.ts — owns the pointer-drag resize effect + startResize/nudgeLayout
    // src/renderer/src/hooks/useAutosave.ts — owns the autosave recovery + save effects (uses plan 003's redactSecrets + the new writeJson/readJson helpers)
    // src/renderer/src/hooks/useGlobalShortcuts.ts — owns the keydown routing effect (Ctrl+K, Ctrl+Z/Y, Delete, Escape from plan 012)
    // src/renderer/src/hooks/useResponsiveLayout.ts — owns the breakpoint + system-theme-tick effects

Each hook takes exactly the state/setters it needs as arguments and returns exactly what `AppContent`'s JSX needs (e.g. `usePanelResize` returns `{ startResize, nudgeLayout }` for plan 014's use). `AppContent` shrinks to composing these hooks plus its own JSX — verify the final line count and effect count by reading the result, don't just assume it improved.

## Repo conventions to follow

- Match this codebase's existing hook style (there are no custom hooks yet outside `useGve`/`useDialog`/`useToast` — establish a `hooks/` directory following the `components/` directory's flat-file-per-concern convention).
- Keep every persisted key name (`gve-layout-preferences`, `gve-autosave-draft`, `gve-snippets`, theme preference key in `theme.ts`) unchanged — only the storage *format* (wrapped with a version) changes, and old-format reads should fall back to the default (per `readJson`'s `parsed.v !== version` check) rather than crash.
- Follow `store.ts`'s existing TSDoc-comment-above-nonobvious-constant style (see `COALESCE_WINDOW_MS`) if adding a similar constant for version numbers.

## Steps

1. Create `src/renderer/src/localStorage.ts` with `readJson`/`writeJson`/`removeJson` as shown in Target.
2. Migrate `theme.ts`'s `loadThemePreferences`/`saveThemePreferences` to use the helper (read the current implementation first — do not assume its exact shape).
3. Migrate `snippets.ts`'s `readSnippets`/`saveSnippet`/`removeSnippet` to use the helper, preserving the existing runtime validation in `readSnippets` (the `Array.isArray`/shape check) as a secondary check after `readJson` returns.
4. Create the `src/renderer/src/hooks/` directory and extract `usePanelResize`, `useAutosave` (applying plan 003's `redactSecrets` if that plan has landed, or the raw `flow` if not — coordinate), `useGlobalShortcuts` (including plan 012's `Escape` case if that plan has landed), and `useResponsiveLayout` from `AppContent`'s current effects.
5. Rewrite `AppContent` to call these hooks and pass their return values into the JSX where the old inline handlers were used (`startResize`, `nudgeLayout` for plan 014, etc.).
6. Migrate `App.tsx`'s remaining direct `localStorage` calls (layout persistence) to the shared helper too.
7. Run the full test suite — any test that mocks `localStorage` directly (rather than through these functions) may need updating to expect the new `{ v, data }` wrapper shape.

## Boundaries

- Do NOT change any persisted key's *name* — only wrap the stored value format with a version.
- Do NOT change `AppContent`'s rendered JSX/behavior — this is a structural refactor; the app must behave identically before and after.
- Do NOT extract hooks so granularly that a hook needs 10+ parameters — if a group of effects doesn't cleanly separate, leave it in `AppContent` and note why rather than forcing an awkward split.
- STOP if `App.tsx`/`theme.ts`/`snippets.ts` have drifted significantly from the commit stamp, or if this plan's dependencies (003, 012, 014) haven't landed and their effects aren't present to extract; report and coordinate rather than improvising a different shape.

## Verification

- **Mechanical**:
  - `npx react-doctor@latest --scope changed` clears `client-localstorage-no-version` for all 4 original locations (now consolidated into however many `writeJson` call sites exist), score does not regress.
  - `npm run typecheck`, `npm run lint`, `npm test`.
- **Behavior check**: Exercise every migrated feature — theme persists across reload, panel layout persists and resizes correctly (both pointer-drag and, if plan 014 landed, keyboard), autosave recovers a draft after a simulated crash (close without saving, reopen), snippets save/list/insert/remove correctly, all keyboard shortcuts (Ctrl+K, Ctrl+Z/Y, Delete, and Escape if plan 012 landed) still fire. Confirm a pre-existing (pre-this-change) `localStorage` value for any of these keys is gracefully ignored (falls back to default) rather than crashing the app on load — test by manually setting an old-format value in DevTools before reloading.
- **Done when**: the targeted diagnostic clears at every original location, required checks pass, every migrated feature behaves identically to before, and old-format stored values don't crash the app.
