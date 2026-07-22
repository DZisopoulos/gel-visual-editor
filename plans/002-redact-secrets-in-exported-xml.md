# 002 — Redact secret-kind fields from the embedded flow comment on export

- **Status**: TODO
- **Commit**: a5eb0ea
- **Severity**: HIGH
- **Category**: Security
- **Rule**: Beyond the scan
- **Estimated scope**: 3 files, small change each

## Problem

`src/shared/roundtrip.ts:22-24` — current:

    export function exportXml(flow: Flow): string {
      const body = generateGel(flow)
      return `${MARKER_START}${encodeCommentJson(flow)}\nBODY-HASH:${fnv1a(body)}\n-->\n${body}`
    }

`encodeCommentJson` (`src/shared/xmlutil.ts:21-22`) is a plain `JSON.stringify(value, null, 1)` with no field redaction. Every exported `.gve`/`.xml` file embeds the **entire flow object** — including plaintext `password` props from XOG read/write, FTP transfer, and set-custom-field blocks — inside a hidden XML comment, in addition to the same credentials already appearing as visible XML attributes in the GEL body (`presets.ts:36,67`, `blocks/ftp-transfer.ts:25`, `blocks/set-custom-field.ts:40`, `blocks/xog-read.ts:26`, `blocks/xog-write.ts:19`). Someone who redacts the visible `password="..."` attributes before sharing a file still leaks the credential via the comment blob.

Currently every `password` field across the registry is declared as plain `kind: 'text'`:

    // src/shared/registry/blocks/xog-read.ts:13 (same pattern in xog-write.ts, ftp-transfer.ts, set-custom-field.ts, presets.ts)
    { key: 'password', label: 'Password', kind: 'text' },

## Target

Add a `'secret'` field kind, mark every `password` field with it, and redact `secret`-kind field values before embedding the flow in the comment (the GEL body itself must still carry the real password — Clarity needs it — only the informational round-trip comment is redacted, since it exists purely so a hand-edited XML can be re-imported, not to carry credentials twice).

    // src/shared/registry/types.ts — add 'secret' to the FieldDef kind union
    export interface FieldDef {
      key: string
      label: string
      kind: 'text' | 'textarea' | 'select' | 'sql' | 'xml' | 'expression' | 'datasource' | 'secret'
      // ...unchanged
    }

    // src/shared/registry/blocks/xog-read.ts:13 and the 4 other password fields — change kind only
    { key: 'password', label: 'Password', kind: 'secret' },

    // src/shared/roundtrip.ts — redact secret fields before embedding
    import { getNodeDef } from './registry'

    function redactSecrets(flow: Flow): Flow {
      const strip = (block: Block): Block => {
        const def = getNodeDef(block.type)
        const props = { ...block.props }
        for (const field of def.fields) {
          if (field.kind === 'secret' && props[field.key]) props[field.key] = ''
        }
        return { ...block, props, ...(block.children ? { children: block.children.map(strip) } : {}) }
      }
      return { ...flow, blocks: flow.blocks.map(strip) }
    }

    export function exportXml(flow: Flow): string {
      const body = generateGel(flow)
      return `${MARKER_START}${encodeCommentJson(redactSecrets(flow))}\nBODY-HASH:${fnv1a(body)}\n-->\n${body}`
    }

Note the `BODY-HASH` is computed from `body` (the real GEL, unredacted) — unchanged, so re-import drift detection still works correctly since the hash never depended on the comment payload.

## Repo conventions to follow

- Follow the existing `FieldDef.kind` discriminated-union style in `src/shared/registry/types.ts`.
- Match the existing recursive block-walk pattern already used in `store.ts`'s `cloneWithNewIds`/`duplicateInList` for `strip`'s children recursion.
- Imitate the existing import style at the top of `roundtrip.ts:1-4`.

## Steps

1. In `src/shared/registry/types.ts`, add `'secret'` to `FieldDef['kind']`.
2. In each of `src/shared/registry/blocks/xog-read.ts:13`, `xog-write.ts:13`, `ftp-transfer.ts:19`, `set-custom-field.ts:13`, and both `password` fields in `presets.ts:24,55` (verify at time of edit whether `presets.ts`'s two password fields are the same ones re-exported by `xog-read.ts`/`xog-write.ts` or independent — if independent, change both), change `kind: 'text'` to `kind: 'secret'`.
3. In `src/shared/roundtrip.ts`, add the `redactSecrets` helper and call it in `exportXml` as shown in Target. Do not change what's embedded in `body` (the actual GEL) — only the comment payload.
4. Check `Inspector.tsx`'s `fieldClass` (`src/renderer/src/components/Inspector.tsx:8-14`) — if a `'secret'` kind isn't handled by the existing `field.kind === 'sql' || field.kind === 'xml' || field.kind === 'expression'` check, it will fall through to the default `<input>` branch, which is fine functionally (still renders as plain text, not masked) — masking the input visually is a separate enhancement not required by this plan; note it as a follow-up rather than scope-creeping this fix.
5. Re-read the diff for unrelated churn.

## Boundaries

- Do NOT change the GEL body generation (`generateGel`) — passwords must still be written there; Clarity needs them at runtime.
- Do NOT mask/encrypt the Inspector's password input field in this plan — that's a separate UI enhancement, not required to close this leak.
- Do NOT change `importXml`'s parsing logic.
- STOP if `roundtrip.ts`/`xmlutil.ts`/the registry block files have drifted from the commit stamp; report drift instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint`, `npm test`.
- **Behavior check**: Create a flow with an XOG Read block, set a password, export it (File → Export GEL), and open the resulting `.xml` file in a text editor. Confirm the visible `password="..."` attribute in the GEL body is still present (Clarity needs it) but the JSON blob inside the `<!-- GVE-FLOW ... -->` comment no longer contains that password value (should be an empty string for that field). Then re-import the same file and confirm the flow loads correctly with the password field now empty in the Inspector (expected — it was redacted) while everything else round-trips.
- **Done when**: typecheck/lint/tests pass, the comment payload no longer contains password values, and re-import still works for the non-secret fields.
