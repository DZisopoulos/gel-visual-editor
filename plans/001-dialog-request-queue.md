# 001 — Queue dialog requests instead of overwriting the pending one

- **Status**: TODO
- **Commit**: a5eb0ea
- **Severity**: HIGH
- **Category**: Bugs & correctness
- **Rule**: Beyond the scan
- **Estimated scope**: 1 file, ~15 line change

## Problem

`src/renderer/src/components/DialogProvider.tsx:38,46-47` — current:

    export function DialogProvider({ children }: { children: ReactNode }): React.JSX.Element {
      const [request, setRequest] = useState<DialogRequest | null>(null)

      const finish = (value: boolean | string | null): void => {
        if (!request) return
        request.resolve(value)
        setRequest(null)
      }

      const enqueue = (next: Omit<DialogRequest, 'resolve'>): Promise<boolean | string | null> =>
        new Promise((resolve) => setRequest({ ...next, resolve }))

`enqueue()` unconditionally calls `setRequest`, replacing any dialog already awaiting a response. If a second `confirm`/`alert`/`prompt` call fires while one is pending, the first request's `resolve` is silently dropped — the caller's promise never settles and hangs forever.

This is reachable today: `App.tsx:100-119`'s "Recover unsaved draft?" confirm on mount and `App.tsx:120-129`'s "Unsaved changes" close-request confirm can collide if the user triggers a window close before answering the recovery prompt. It is also trivially reproducible in dev: the recovery effect (`App.tsx:100-119`) has no cleanup function, so React 18 StrictMode's mount-effect double-invoke calls it twice back-to-back, firing two `confirm()` calls whose promise executors both run synchronously — the first's `resolve` is orphaned immediately.

## Target

Replace the single nullable `request` with a queue (array). `finish` resolves and dequeues the front item; `enqueue` pushes and shows the new item only if nothing is currently displayed.

    export function DialogProvider({ children }: { children: ReactNode }): React.JSX.Element {
      const [queue, setQueue] = useState<DialogRequest[]>([])
      const request = queue[0] ?? null

      const finish = (value: boolean | string | null): void => {
        setQueue((current) => {
          current[0]?.resolve(value)
          return current.slice(1)
        })
      }

      const enqueue = (next: Omit<DialogRequest, 'resolve'>): Promise<boolean | string | null> =>
        new Promise((resolve) => setQueue((current) => [...current, { ...next, resolve }]))

The rest of `DialogProvider` (the `value` object, `DialogView` rendering) stays the same — it already renders `{request && <DialogView request={request} onFinish={finish} />}`, which now reads the head of the queue instead of the single slot.

## Repo conventions to follow

- Keep the `DialogContextValue` public API (`confirm`/`alert`/`prompt` signatures) unchanged — this is an internal implementation swap.
- Match the existing immutable-update style used throughout `store.ts` (e.g. `s.past.slice(-99)`), i.e. `current.slice(1)` / `[...current, x]`, not mutation.

## Steps

1. In `src/renderer/src/components/DialogProvider.tsx`, replace `useState<DialogRequest | null>(null)` with `useState<DialogRequest[]>([])` and derive `request = queue[0] ?? null`.
2. Rewrite `finish` to resolve `queue[0]` and drop it via `setQueue(current => ...)`.
3. Rewrite `enqueue` to append to the queue via functional `setQueue`, keeping the same `Promise` executor shape so `confirm`/`alert`/`prompt` callers are unaffected.
4. Re-read the diff — `DialogView`'s own JSX and the `value` object should need no changes.

## Boundaries

- Do NOT change `DialogContextValue`'s public method signatures.
- Do NOT change `DialogView`'s JSX/markup in this plan (that's covered by plan 011).
- Keep behavior-preserving for the single-dialog-at-a-time case — only the multi-request case changes (queued instead of dropped).
- STOP if `DialogProvider.tsx` has drifted from the commit stamp above; report the drift instead of improvising.

## Verification

- **Mechanical**: Run the repository's typecheck (`npm run typecheck`), lint (`npm run lint`), and test suite (`npm test`).
- **Behavior check**: In the running app, trigger two dialogs back-to-back before answering the first (e.g. reproduce the StrictMode double-invoke case, or manually call `dialog.confirm()` twice via a temporary debug button) and confirm both promises eventually resolve — the second dialog appears automatically after the first is dismissed, instead of the first being silently replaced.
- **Done when**: typecheck/lint/tests pass, and the queued-dialog behavior above is observed.
