# Stitch Prompt — Screen 4: Validate View

Paste the block below into Google Stitch as one prompt.

---

Design a desktop application UI (1440x900, Windows desktop app feel, dark theme) for "GVE — GEL Visual Editor", showing the VALIDATE VIEW — a full-screen issues list for a visual GEL script, in the style of a modern IDE "Problems" panel elevated to a first-class screen.

OVERALL VISUAL LANGUAGE
Dark, focused, premium developer-tool aesthetic. Background: deep slate (#0F1218). Panels: charcoal (#171C26) with 1px borders (#2A3140) and 8px rounded corners. Accent: electric teal (#2DD4BF) for active states; soft amber (#F5B84D) for warnings; muted red (#F26D6D) for errors; green (#4ADE80) for passed checks. Typography: Inter for UI, JetBrains Mono for code fragments and variable names. Thin-stroke icons, compact JetBrains-IDE density.

LAYOUT:

1) HEADER BAR (full width, 52px, #12161F):
Left: hexagonal teal logo mark "GVE", breadcrumb "My Flows / Timesheet Reminder Notifications". Center: pill segmented control "Design | XML | Validate" with Validate active (teal pill). Right: amber status chip "▲ 1 error · 3 warnings", ghost icon buttons (undo, redo), secondary button "Save Flow", primary teal button "Export GEL ▸" shown in a disabled state (dimmed, small lock icon) with a tiny tooltip bubble "Fix errors to export".

2) SUMMARY STRIP (below header, full width, 88px):
Four stat tiles in a row, each a slim card with a big number, label, and colored icon:
- "1" — "Errors" — red circle-x icon, card has a subtle red left stripe.
- "3" — "Warnings" — amber triangle icon.
- "2" — "Info" — blue info icon.
- "38 / 42" — "Checks passed" — green check icon with a thin green progress ring.
Right end of the strip: filter chips "All | Errors | Warnings | Info" (All active) and a "Re-run validation" ghost button with refresh icon.

3) MAIN AREA — ISSUES LIST (center, ~64% width):
Grouped, clickable issue rows. Group headers in small caps with counts. Each issue row: severity icon, bold short title, muted one-line explanation, a mono chip naming the offending block, and a right-aligned "Go to block →" ghost link. Rows:

Group "ERRORS (1)":
- Red icon — "Required field is empty" — "SQL Query 'Get overdue timesheets' has no datasource selected." — mono chip "sql-query · Get overdue timesheets" — THIS ROW SELECTED: red left bar, slightly lighter background.

Group "WARNINGS (3)":
- Amber icon — "Variable used before it is defined" — "${totalRows} is referenced here but only introduced later in the flow." — mono chip "gel:log · Log summary".
- Amber icon — "Empty container" — "The 'Otherwise' branch of 'Choose / When' contains no blocks." — mono chip "core:choose · When days_late > 5".
- Amber icon — "Raw GEL block is opaque to validation" — "Variables defined inside 'Custom header snippet' cannot be tracked." — mono chip "raw-gel · Custom header snippet".

Group "INFO (2)":
- Blue icon — "Disabled block will be exported as a comment" — mono chip "gel:email · Old notification".
- Blue icon — "Namespace 'soap' declared but unused" — mono chip "script header".

4) RIGHT PANEL — ISSUE DETAIL (~36% width):
A detail card for the selected error: red header strip with circle-x icon and title "Required field is empty". Body: paragraph explaining the rule in plain language ("Every SQL Query block must target a datasource. Without it, Clarity cannot execute the query and the process step will fail at runtime."), a small framed miniature of the offending block card (blue-striped "SQL Query — Get overdue timesheets" with the datasource chip highlighted red and empty), and below it a "How to fix" section with one bullet ("Select a datasource — usually 'Niku' — in the block inspector."). Footer: primary teal button "Open in Design view" and ghost button "Ignore once".

Overall it must feel like a serious quality gate inside a polished professional tool — clear hierarchy, calm color discipline, zero clutter. No stock photos, no marketing fluff.
