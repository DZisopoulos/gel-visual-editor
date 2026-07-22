# 013 — Harden the Electron process boundary (sandbox, external URLs, preload surface, save-path validation)

- **Status**: TODO
- **Commit**: a5eb0ea
- **Severity**: MEDIUM
- **Category**: Security
- **Rule**: Beyond the scan (Electron process boundary — extended scope per audit instructions)
- **Estimated scope**: 2 files (`src/main/index.ts`, `src/preload/index.ts`), 4 independent small fixes

## Problem

Four separate findings in the Electron main/preload trust boundary, all in these two files:

1. `src/main/index.ts:20-23` — `sandbox: false` explicitly overrides Electron's secure-by-default sandbox (on by default since Electron 20; this app ships Electron 39).
2. `src/main/index.ts:55-58` — `setWindowOpenHandler` forwards every popup URL straight to `shell.openExternal` with no scheme/origin check:

       mainWindow.webContents.setWindowOpenHandler((details) => {
         shell.openExternal(details.url)
         return { action: 'deny' }
       })

3. `src/preload/index.ts:39` — the generic `@electron-toolkit/preload` `electronAPI` (unrestricted `ipcRenderer.invoke/send/on` for any channel, plus `process.env`) is exposed into the renderer's main world alongside the curated `gve` bridge:

       contextBridge.exposeInMainWorld('electron', electronAPI)
       contextBridge.exposeInMainWorld('gve', gve)

4. `src/main/index.ts:98-115` — `gve:saveFlow`'s `existingPath` argument (renderer-supplied) is written to via `atomicWrite` with no check that it matches a path the main process itself issued via a prior `dialog.showSaveDialog`/`showOpenDialog` result.

## Target

**Fix 1 — re-enable the sandbox:**

    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true
    }

Verify the preload script (`src/preload/index.ts`) still works under the sandbox — its only Node usage is `contextBridge`/`ipcRenderer` from the `electron` module, both sandbox-compatible, so this should be a no-op change functionally.

**Fix 2 — validate the URL scheme before opening externally:**

    const ALLOWED_EXTERNAL_SCHEMES = new Set(['https:', 'http:'])
    mainWindow.webContents.setWindowOpenHandler((details) => {
      try {
        const url = new URL(details.url)
        if (ALLOWED_EXTERNAL_SCHEMES.has(url.protocol)) shell.openExternal(details.url)
      } catch {
        // malformed URL — do not open
      }
      return { action: 'deny' }
    })

**Fix 3 — drop the generic `electronAPI` exposure:**

    if (process.contextIsolated) {
      try {
        contextBridge.exposeInMainWorld('gve', gve)
      } catch (error) {
        console.error(error)
      }
    } else {
      // @ts-ignore (define in dts)
      window.gve = gve
    }

Remove the `import { electronAPI } from '@electron-toolkit/preload'` line and the `window.electron = electronAPI` fallback branch. Check `src/renderer/src/env.d.ts` (or wherever `window.electron`/`window.gve` are typed) for a `Window.electron: ElectronAPI` declaration that needs removing, and grep the renderer for any `window.electron` usage before removing — if something depends on it, keep the minimal piece actually used rather than removing blindly.

**Fix 4 — validate `existingPath` against a set of paths this session has actually opened/saved:**

    const knownPaths = new Set<string>()
    // ...inside gve:openFlow handler, after reading filePath:
    knownPaths.add(filePath)
    // ...inside gve:saveFlow handler:
    async (_event, suggestedName, content, existingPath) => {
      let filePath = existingPath
      if (filePath && !knownPaths.has(filePath)) filePath = null  // reject unrecognized paths
      if (!filePath) {
        const result = await dialog.showSaveDialog({ /* ...unchanged... */ })
        if (result.canceled || !result.filePath) return null
        filePath = result.filePath
      }
      knownPaths.add(filePath)
      await atomicWrite(filePath, content)
      // ...unchanged
    }

This is defense-in-depth (not currently reachable without a prior renderer compromise, since the renderer only ever passes back a `filePath` it received from `gve:openFlow`/a prior `gve:saveFlow` — but costs little to enforce server-side too).

## Repo conventions to follow

- Match `main/index.ts`'s existing top-of-file constant style (e.g. `unsavedContents` at line 8) for the new `ALLOWED_EXTERNAL_SCHEMES`/`knownPaths` module-scope `Set`s.
- Keep the existing `ipcMain.handle`/`ipcMain.on` registration structure; only change handler bodies.
- Preserve `preload/index.ts`'s existing `if (process.contextIsolated) { try {...} catch {...} } else {...}` structure — only remove what's specific to `electronAPI`.

## Steps

1. In `src/main/index.ts`, change `sandbox: false` to `sandbox: true` (fix 1).
2. Add `ALLOWED_EXTERNAL_SCHEMES` and rewrite `setWindowOpenHandler` as shown (fix 2).
3. In `src/preload/index.ts`, remove the `electronAPI` import and its exposure in both the `contextIsolated` and fallback branches (fix 3). Grep `src/renderer/src` for `window.electron` usage first — if any exists, either keep exposing the minimal piece needed or flag it for the user rather than silently breaking a feature.
4. In `src/main/index.ts`, add the `knownPaths` set, populate it in `gve:openFlow`'s handler and at the end of `gve:saveFlow`'s handler, and add the rejection check at the top of `gve:saveFlow` (fix 4). Apply the same `knownPaths` check to `gve:exportXml` if it has an analogous existing-path reuse path — check first; from the code read during the audit it always shows a save dialog (no `existingPath` param), so it may not need this fix — verify before changing.
5. Re-read both file diffs for unrelated churn.

## Boundaries

- Do NOT change the IPC channel names or renderer-facing `gve` API shape (`src/preload/index.ts`'s `gve` object) — only its exposure alongside `electronAPI`.
- Do NOT change `dialog.showOpenDialog`/`showSaveDialog` filter configuration.
- If removing `electronAPI` breaks something (verify by running the app and exercising open/save/export/minimize/maximize/close), stop and report rather than adding it back silently without noting why.
- STOP if `main/index.ts`/`preload/index.ts` have drifted from the commit stamp; report drift instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` (this touches Electron main/preload code, which the renderer-focused test suite may not cover — a full build is the more meaningful check here).
- **Behavior check**: Run the built app (`npm start` or the packaged build). Confirm: window opens and renders normally (sandbox didn't break preload); open/save/export flow dialogs still work; minimize/maximize/close window controls still work; clicking a link that would open an external URL (if any exist in the UI, e.g. the About dialog or LICENSE reference — check) still opens correctly for `https:` links; a crafted `javascript:`-scheme popup attempt (if testable) is blocked.
- **Done when**: build succeeds, required checks pass, and every behavior check above passes with no regression in open/save/export/window-control functionality.
