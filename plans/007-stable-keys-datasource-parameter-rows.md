# 007 — Use stable ids as keys for datasource and parameter rows

- **Status**: TODO
- **Commit**: a5eb0ea
- **Severity**: HIGH
- **Category**: Bugs & correctness
- **Rule**: no-array-index-as-key
- **Estimated scope**: 3 files (types + store + Inspector), moderate change

## Problem

`src/renderer/src/components/Inspector.tsx:109-132` (datasources) and `:147-180` (parameters) — current:

    {flow.datasources.map((datasource, index) => (
      <div className="gve-datasource-row" key={index}>
        <input
          value={datasource}
          onChange={(event) => updateDatasources(
            flow.datasources.map((entry, i) => (i === index ? event.target.value : entry)),
            `datasource:${index}`
          )}
        />
        <button onClick={() => updateDatasources(flow.datasources.filter((_, i) => i !== index))}>×</button>
      </div>
    ))}
    {/* ...identical index-keyed pattern for flow.parameters at line 147-180 */}

Both lists are keyed by array index. Deleting a row shifts every index below it, so React reuses the DOM node — and any live focus/cursor — at position N for what used to be row N+1's data. Editing a value or focus mid-list, then deleting a row above it, silently continues the edit into a different row's field.

Datasources are stored as `string[]` with no per-entry id (`Flow['datasources']` in `src/shared/flow.ts`), and `FlowParameter` also has no id field — both need one added to fix this properly, rather than working around it with a synthetic key derived from mutable content (e.g. keying by value would break identity on every keystroke, which is worse).

## Target

Give `FlowParameter` a stable `id` (reusing the existing `newId()` helper, already used for blocks). For datasources (a plain `string[]`), the cleanest fix without changing the persisted `Flow` schema is to key by a `WeakMap`-free stable index-companion computed once per array identity change — but since datasources are edited via the same "replace whole array" pattern as parameters, the simplest correct fix is to change `datasources: string[]` to `datasources: { id: string; value: string }[]` so it gets the same id-based fix. Check `src/shared/flow.ts`, `src/shared/schema.ts` (parse/serialize), `src/shared/generate.ts` (GEL generation), and `src/shared/roundtrip.ts` for every place `flow.datasources`/`FlowParameter` is read — this is a schema change and must stay consistent everywhere, including the JSON-schema validator/migration if `schema.ts` has one for older saved files.

    // src/shared/flow.ts — FlowParameter gets an id; datasources becomes id+value pairs
    export interface FlowParameter {
      id: string
      name: string
      type: 'string' | 'number' | 'date'
      default: string
    }
    export interface FlowDatasource {
      id: string
      value: string
    }
    export interface Flow {
      // ...
      datasources: FlowDatasource[]
      parameters: FlowParameter[]
    }

    // Inspector.tsx — key by id, update in place by id not index
    {flow.datasources.map((datasource) => (
      <div className="gve-datasource-row" key={datasource.id}>
        <input
          value={datasource.value}
          onChange={(event) => updateDatasources(
            flow.datasources.map((entry) =>
              entry.id === datasource.id ? { ...entry, value: event.target.value } : entry
            ),
            `datasource:${datasource.id}`
          )}
        />
        <button onClick={() => updateDatasources(flow.datasources.filter((entry) => entry.id !== datasource.id))}>×</button>
      </div>
    ))}

    // "Add datasource"/"Add parameter" now stamp a fresh id
    onClick={() => updateDatasources([...flow.datasources, { id: newId(), value: '' }])}
    onClick={() => updateParameters([...flow.parameters, { id: newId(), name: '', type: 'string', default: '' }])}

This is a genuine schema migration — treat it with the care the codebase already shows for schema changes (check `src/shared/schema.ts` for how `Flow` documents are validated/parsed on import, and whether older exported `.gve`/`.xml` files without datasource/parameter ids need a migration shim when re-imported).

## Repo conventions to follow

- Reuse `newId()` from `src/shared/flow.ts` — already used for block ids (`createEmptyFlow`, `cloneWithNewIds` in `store.ts`).
- Match the existing `updateParameter(index, patch)` helper pattern in `Inspector.tsx:35-40`, but change it to look up by `id` instead of `index`.
- If `schema.ts` has a Zod-like or hand-rolled validator for `Flow`, follow its existing style for adding/migrating a field (check whether it already has any "upgrade old document" logic to imitate).

## Steps

1. Read `src/shared/flow.ts`, `src/shared/schema.ts`, `src/shared/generate.ts`, `src/shared/roundtrip.ts`, and `src/shared/tree.ts` in full first — this touches the `Flow` schema and this plan's Target is a starting hypothesis, not a guaranteed-correct migration; confirm every read/write site before editing.
2. Add `id: string` to `FlowParameter` and convert `datasources` to `FlowDatasource[]` in `src/shared/flow.ts`.
3. Update `createEmptyFlow()` and any fixture/template data (`src/shared/templates.ts` if it hardcodes parameters/datasources) to include ids.
4. Update `src/shared/schema.ts`'s parse/validation logic to accept old documents missing `datasource`/`parameter` ids and backfill them with `newId()` at parse time (so re-importing a `.gve` file exported before this change doesn't break) — this is the migration shim; do not skip it.
5. Update `src/shared/generate.ts` and any other GEL-generation code that reads `flow.datasources`/`flow.parameters` to use `.value`/`.name` instead of the raw string.
6. Update `Inspector.tsx`'s datasource/parameter rendering and `updateParameter` helper as shown in Target.
7. Update `Canvas.tsx:161-165`'s parameter-chip rendering (`key={parameter.name}`) to `key={parameter.id}` while you're in that area — same underlying data, same fix.
8. Run the full test suite and fix any test fixtures that construct `Flow`/`FlowParameter`/datasource objects directly.

## Boundaries

- Do NOT change how parameters/datasources are referenced by *name* in GEL generation or variable-scope validation (`validate.ts`) — `name`/`value` stay the string identity used by Clarity; only the React `key` and internal update-by-id logic change.
- Do NOT break backward-compatible import of `.gve`/`.xml` files saved before this change — the migration shim in step 4 is required, not optional.
- STOP if the actual shape of `schema.ts`'s validation differs significantly from what's assumed here (e.g. it's generated from a JSON schema file rather than hand-written) — report what you find instead of forcing the assumed pattern.

## Verification

- **Mechanical**:
  - `npx react-doctor@latest --scope changed` clears `no-array-index-as-key` for `Inspector.tsx`, score does not regress.
  - `npm run typecheck`, `npm run lint`, `npm test` — pay special attention to any test that snapshots or round-trips a `Flow` object.
- **Behavior check**: Add 3 parameters, focus the 2nd one's name input and start typing, then delete the 1st parameter — confirm the input you were typing into (now the 1st row) still shows your in-progress edit for the *same* parameter, not the one that used to be above it. Export a flow with parameters/datasources, re-import it, and confirm they round-trip correctly. Also import a `.gve` file that predates this change (if one exists in `examples/` or `tests/`) and confirm it still loads.
- **Done when**: the targeted diagnostic is clear, score is not lower, required checks pass, old-format files still import correctly, and the focus-drift behavior above no longer reproduces.
