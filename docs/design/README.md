# GVE Visual Direction — how to use the Stitch export

The `stitch/` folder holds the Google Stitch design export: five screen mockups (PNG + generated HTML), a logo, and design tokens (`gel_visual_editor/DESIGN.md`).

## Adopt

- **Design tokens:** colors and typography from `gel_visual_editor/DESIGN.md` are the app theme (teal primary `#2DD4BF`/`#57f1db`, amber secondary, dark slate surfaces, Inter + JetBrains Mono).
- **Layout:** header bar with Design | XML | Validate segmented control, left palette, center block canvas, right inspector, collapsible bottom XML preview.
- **Block styling:** colored left edge stripes per category, icon in tinted rounded square, chips for key props, inset nested containers with guide lines, slim START/END cap blocks, teal glow on selection.
- **Validate view:** summary stat tiles, grouped issue list, right-hand detail panel with "How to fix" and "Open in Design view".
- **Export dialog:** pre-flight validation strip with warning acknowledgment checkboxes, destination cards, embed-flow/step-comments/minify toggles, GEL preview.
- **Welcome screen:** New Flow / Open cards, recent flows list, template cards.

## Reject (Stitch hallucinations that contradict the spec)

- **"Deploy" button and user avatar** — GVE is offline, no accounts, no deploy. Header actions are Save Flow and Export GEL only.
- **"Logs" and "Debugger" bottom tabs, "Run" menu** — no execution in v1 (dry-run is a parked future feature).
- **"Assign" / "Parallel" palette entries** — palette categories and blocks come from the spec, not the mockup. Parallel is not a GEL concept.
- **"Query missing index" SQL warning** — impossible offline; not a feature.
- **Web-style nav ("Home / Documentation / Examples") on the welcome screen** — drop; keep the header minimal.

The mockups are visual direction only. Component structure, behavior, and scope come from
`../superpowers/specs/2026-07-20-gve-design.md`.
