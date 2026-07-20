# Stitch Prompt — Screen 5: Export Dialog

Paste the block below into Google Stitch as one prompt.

---

Design a desktop application UI (1440x900, Windows desktop app feel, dark theme) for "GVE — GEL Visual Editor", showing the EXPORT GEL modal dialog open over a dimmed main editor.

OVERALL VISUAL LANGUAGE
Dark, focused, premium developer-tool aesthetic. Background app (dimmed 60% behind the modal): deep slate (#0F1218) with a blurred hint of a block-canvas editor. Modal: charcoal (#171C26), 1px border (#2A3140), 12px rounded corners, soft deep shadow. Accent: electric teal (#2DD4BF) for the primary action; soft amber (#F5B84D) for warnings. Typography: Inter for UI, JetBrains Mono for code and file paths. Thin-stroke icons.

THE MODAL (centered, 640px wide):

1) HEADER:
Teal download/export icon in a tinted rounded square, title "Export GEL", muted subtitle "Timesheet Reminder Notifications", close X top-right.

2) PRE-FLIGHT CHECK STRIP:
A slim status band: green check icon, "Validation passed — 0 errors, 2 warnings", and a small amber expandable link "View warnings". Below it, an expanded compact list of the two warnings, each with an amber triangle and one line of text ("Empty 'Otherwise' branch in Choose / When", "Raw GEL block is opaque to validation"), each with a small checkbox "acknowledge" — both checked.

3) EXPORT OPTIONS (form section, small-caps labels):
- "DESTINATION": radio cards side by side (two 280px cards): card 1 selected (teal border) — clipboard icon, "Copy to clipboard", caption "Paste directly into a Clarity process step"; card 2 — file icon, "Save as .xml file", caption with a muted mono path preview "C:\Consulting\Acme\export\timesheet-reminder.xml" and a small "Browse…" ghost button.
- "OPTIONS": three toggle rows with small captions:
  - Toggle ON — "Embed flow definition" — "Adds the GVE-FLOW comment so this script can be reopened and edited visually. Recommended."
  - Toggle ON — "Include step-name comments" — "Adds a readable XML comment above each block."
  - Toggle OFF — "Minify output" — "Strips comments and indentation. Not reopenable in GVE." — this row slightly dimmed with a tiny amber dot.

4) PREVIEW (collapsible section, expanded, 160px tall):
Label "PREVIEW" with a copy icon. A read-only mono code area with XML syntax highlighting (tags teal, attributes violet, strings amber) showing the first ~8 lines: the folded "<!-- GVE-FLOW v1.0 … -->" marker line with a small teal chip "flow definition", then <gel:script> with xmlns declarations, then a comment "<!-- Step: Get overdue timesheets -->" and the opening <sql:query> line. A subtle fade-out gradient at the bottom edge of the preview.

5) FOOTER:
Left: muted text with a shield icon "Exported locally — nothing leaves this machine." Right: ghost button "Cancel", primary teal button "Export ▸" with a subtle glow.

Overall it must feel like the confident final step of a polished professional tool — trustworthy, precise, calm. No stock photos, no marketing fluff.
