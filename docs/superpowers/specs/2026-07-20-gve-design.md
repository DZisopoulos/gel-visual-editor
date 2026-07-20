# GVE — GEL Visual Editor: Design Spec

**Date:** 2026-07-20
**Status:** Approved design, pre-implementation
**Author:** Dimitris Zisopoulos (with Claude)

## 1. Concept

GVE (GEL Visual Editor) is an offline Windows desktop application for building Clarity PPM GEL scripts visually. Instead of hand-writing Jelly/GEL XML, the user assembles a script as a top-down stack of blocks (Power Automate / Scratch style), where sequence is implicit and container blocks (loops, conditions, try/catch) visually nest their children. Every arrangement on screen is, by construction, a valid GEL structure.

**Key product decisions (settled during brainstorming):**

- **Paradigm:** structured vertical block flow — NOT a free-form node graph. GEL is strictly nested sequential XML; the canvas mirrors that 1:1.
- **Round-trip model:** generate-only for foreign scripts; GVE's own exports embed the full flow definition (JSON) in an XML comment header, so GVE-made scripts round-trip perfectly forever. An import assistant for hand-written GEL is parked for the future.
- **Audience/path:** personal consultant tool first, architected cleanly enough to leave the community-release and commercial doors open ("start A, architect for B/C").
- **Platform:** Electron + React + TypeScript desktop app. Fully offline — no Clarity connectivity in scope. User exports XML and pastes it into Clarity.
- **Coverage goal:** near-complete GEL tag coverage over time, plus a "Raw GEL" escape-hatch block from day one so a missing node type never blocks work.
- **Name:** GVE (GEL Visual Editor). Avoid "Clarity" in branding (Broadcom trademark).

## 2. UI Layout

Main window, four regions plus a header:

1. **Header bar:** logo/wordmark, flow breadcrumb, view switcher (Design | XML | Validate), live status chip ("Valid — 0 errors"), undo/redo, Save Flow, Export GEL. Script metadata (name, description, script type: process step vs. standalone) and declared process parameters live here (parameters generate the `gel:parameter` header block).
2. **Palette (left):** searchable, categorized node library.
   - **Core:** Set Variable, For Each Loop, Choose/When, Switch, Comment
   - **Data:** SQL Query, Process Parameter
   - **Integration:** SOAP Invoke, HTTP Call, File Read, File Write, FTP Transfer
   - **Clarity:** Log Message, Send Email, XOG Read, XOG Write
   - **Advanced:** Try/Catch, Include Script, Raw GEL
3. **Canvas (center):** the script as a vertical stack of block cards linked by connectors; containers render as inset nestable frames with their own drop zones. Blocks can be dragged from palette into any slot, reordered, collapsed/expanded, cut/copied/duplicated, and disabled (exported wrapped in an XML comment). Hover on a connector shows a "+" insert affordance.
4. **Inspector (right):** the selected block's properties as a form, driven by the node registry schema. Expression fields (`${...}` / JEXL) get a mini-editor with autocomplete drawn from variables in scope above that block. SQL/XML fields use embedded Monaco editors. A "Variables in scope" panel lists what's available at the selected block.
5. **XML Preview (bottom, collapsible):** live read-only Monaco pane with the generated GEL; the selected block's lines are highlighted. Copy XML / Export .xml actions.

Visual direction: dark, premium developer-tool aesthetic (deep slate background, teal accent, Inter + JetBrains Mono). To be refined via Google Stitch mockups; Stitch output is visual direction only — component structure comes from this spec.

## 3. Data Model, XML Generation & Round-Trip

### 3.1 Flow document (source of truth)

A GVE script is one JSON document saved as a `.gve` file:

```json
{
  "gveVersion": "1.0",
  "meta": { "name": "...", "description": "...", "scriptType": "process-step" },
  "parameters": [ { "name": "projectId", "type": "string", "default": "" } ],
  "datasources": [ "Niku" ],
  "blocks": [
    { "id": "b1", "type": "sql-query", "props": { "...": "..." }, "enabled": true },
    { "id": "b2", "type": "for-each", "props": { "...": "..." }, "children": [] }
  ]
}
```

- Blocks form a **tree, not a graph**: containers have `children` arrays, mirroring GEL nesting exactly.
- Every block has a stable `id` (selection, undo, XML highlighting).
- `enabled: false` → block exported wrapped in an XML comment.
- Props follow per-block-type schemas defined in the node registry.

### 3.2 Node registry

The heart of the app: one declarative definition per block type containing —

- Display info: name, icon, category, color.
- Props schema: fields, types, which fields are JEXL expressions, validation rules.
- Scope contribution: which variables the block introduces (e.g., sql-query introduces its `resultVar`; for-each introduces its loop `var`).
- `toGel()`: the XML generator for the block.
- (Future slot) optional `onlineValidate()` for a later Clarity-connected phase.

Palette, inspector forms, validation, scope-aware autocomplete, and XML generation are ALL driven from the registry. Adding a node type = adding one registry entry. This is what makes near-complete tag coverage tractable.

### 3.3 XML generation

Single deterministic pass: walk the tree, call each block's `toGel()`, assemble with proper namespaces (`gel`, `core`, `sql`, `soap`, `xog`, `file`, `ftp`, …) declared only when used, pretty-printed with stable formatting so diffs stay clean.

### 3.4 Round-trip format

Exports embed the full flow JSON in a comment block at the top:

```xml
<!-- GVE-FLOW v1.0
  { ...entire flow JSON... }
-->
<gel:script xmlns:gel="jelly:com.niku.union.gel.GELTagLibrary" ...>
```

- "Open XML" restores the flow from the marker comment.
- A hash of the generated body is stored alongside the JSON; on re-import, drift (manual edits below the marker) is detected and the user is warned those edits will be lost.
- XML without the marker → "not a GVE script" message (import assistant is a parked future phase).

### 3.5 Escape hatch

The **Raw GEL** block's single prop is a Monaco XML editor. Content is validated for well-formedness only and spliced verbatim into the output. Raw GEL blocks are opaque to scope tracking.

## 4. Validation, Error Handling & Scope Tracking

Live validation (debounced on every edit), three layers:

1. **Block-level:** registry-declared field rules — required props, format checks (valid JEXL identifiers for variable names), well-formedness of Raw GEL content. Shown as red badge on the block + inline on the inspector field.
2. **Structure-level:** cross-block rules — `When` only inside `Choose`, `Catch` requires `Try`, duplicate result-variable shadowing, empty containers (warning).
3. **Scope-level:** top-down walk maintaining a symbol table (seeded by process parameters; each block adds what it introduces). Every `${...}` expression is parsed for referenced identifiers; references to variables not yet in scope produce **warnings** (never errors — JEXL can be dynamic and Raw GEL is opaque, so this is heuristic).

**Severity model:** Errors block export. Warnings allow export behind a confirm dialog listing them. The Validate view is a flat clickable list of all issues; clicking jumps to the offending block.

**App-level resilience:** autosave to a local recovery file every few seconds; clear failure messages on file operations; malformed `.gve` on open → "file damaged" report, not a blank canvas. Undo/redo = bounded history of flow-JSON snapshots (structural sharing).

**Out of scope:** semantic validation of SQL against a Clarity schema or XOG payloads against object definitions (requires live connectivity, excluded).

## 5. Build Phases

**Phase 1 — Walking skeleton.** Electron shell; canvas drag-drop stacking + nesting; registry with 5 blocks (Set Variable, SQL Query, For Each, Log, Raw GEL); inspector forms; live XML preview; save/open `.gve`; export with embedded round-trip JSON. *Exit test: a real query-loop-log process step built in GVE runs in a Clarity dev environment.*

**Phase 2 — Daily-driver.** Full bread-and-butter palette (Choose/When, Switch, Email, XOG Read/Write, Process Parameters, Comment, Try/Catch); three-layer validation incl. scope tracking; undo/redo; autosave/recovery; disabled blocks; copy/duplicate. *Exit test: GVE chosen over a text editor for a real client deliverable.*

**Phase 3 — Full coverage & polish.** Remaining palette (SOAP, HTTP, File, FTP, Include); expression mini-editor with scope-aware autocomplete; Validate view; snippet library (save a block subtree as a reusable snippet); UI polish pass; keyboard-first ergonomics.

**Phase 4 — Community door (optional).** Docs + sample flows; installer/auto-update; template gallery of common process patterns; public release.

**Parked:** import assistant for foreign GEL; live Clarity connectivity (metadata autocomplete, test execution, online validation); team features.

## 6. Future Features

**Auto-generated documentation.** Walk the flow tree and produce a polished, client-ready technical design document (Word/PDF/HTML): the script's purpose, parameters, step-by-step logic narrative, SQL listings, email templates, and a flow diagram. Because it is generated from the flow itself, the documentation is always current — a standing pain point for consultancies, where hand-written technical docs rot the moment the script changes. Cheap to build once the app exists: the structured block tree already holds everything needed; this is a rendering pass over it.

## 7. Testing Strategy

- **Registry/generator unit tests:** for each block type, props → expected GEL fragment; namespace assembly; enabled/disabled output; pretty-print stability.
- **Round-trip tests:** flow → export → re-open → deep-equal original flow; drift detection triggers on tampered body.
- **Validation tests:** fixtures per rule (each block rule, each structure rule, scope-tracking scenarios incl. shadowing and out-of-scope references).
- **Canvas interaction tests:** component-level tests for drag/drop/nest/reorder invariants (tree stays valid).
- **Manual acceptance per phase:** the phase exit tests above, executed against a real Clarity dev environment.
