# Stitch Prompt — Screen 3: XML View

Paste the block below into Google Stitch as one prompt.

---

Design a desktop application UI (1440x900, Windows desktop app feel, dark theme) for "GVE — GEL Visual Editor", showing the full-screen XML VIEW — the read-only generated-code view of a visual flow, in the style of VS Code with a side outline.

OVERALL VISUAL LANGUAGE
Dark, focused, premium developer-tool aesthetic. Background: deep slate (#0F1218). Panels: charcoal (#171C26) with 1px borders (#2A3140) and 8px rounded corners. Accent: electric teal (#2DD4BF) for active states and highlights; soft amber (#F5B84D) for warnings. Typography: Inter for UI, JetBrains Mono for all code. Thin-stroke icons, compact JetBrains-IDE density.

LAYOUT:

1) HEADER BAR (full width, 52px, #12161F):
Left: hexagonal teal logo mark "GVE", breadcrumb "My Flows / Timesheet Reminder Notifications". Center: pill segmented control "Design | XML | Validate" with XML active (teal pill). Right: green status chip "● Valid — 0 errors", ghost icon buttons (undo, redo), secondary button "Save Flow", primary teal button "Export GEL ▸".

2) LEFT PANEL — SCRIPT OUTLINE (280px wide):
Header "OUTLINE" in small caps with a collapse-all icon. An indented tree mirroring the flow structure, each row with a small colored dot matching its category and a name:
- Script header (grey) 
- Parameters (grey) with two children: "projectId", "daysLate"
- "Get overdue timesheets" (blue dot, database icon)
- "For each row" (violet dot, loop icon), expanded, containing:
  - "When days_late > 5" (violet dot), containing:
    - "Escalation notice" (teal dot, envelope icon) — THIS ROW SELECTED: teal left bar and lighter background
  - "Log processed user" (teal dot)
- "totalProcessed" (violet dot)
Clicking behavior implied: selection is synced with the code pane.

3) MAIN AREA — CODE PANE (remaining width):
A full-height Monaco-style read-only code editor with line numbers, dark background (#0D1117 tone within our palette), rendering ~40 lines of GEL XML with rich syntax highlighting: tags in teal, attribute names in violet, attribute values/strings in amber, comments in muted grey-green, ${…} expressions inside strings subtly brighter. Content shown, in order:
- A folded comment region on line 1 reading "<!-- GVE-FLOW v1.0 … -->" with a fold chevron (collapsed, muted, with a small teal chip "flow definition" at the line end).
- <gel:script> root with several xmlns declarations wrapping.
- Two <gel:parameter> lines.
- A <sql:query> block with an indented SELECT statement over 4 lines.
- A <core:forEach> block containing <core:choose>/<core:when test="${row.days_late > 5}"> containing a <gel:email> element with from/to/subject attributes and 3 lines of body text — THIS EMAIL REGION IS HIGHLIGHTED with a faint teal full-width background band and a thin teal left ruler mark (it corresponds to the selected outline row).
- A <gel:log> line and closing tags.
Right side of the code pane: a thin minimap strip. One line near the <sql:query> shows a small amber squiggle-dot in the gutter (warning marker).

4) TOP-RIGHT OF CODE PANE (floating toolbar, small, semi-transparent charcoal):
Ghost icon buttons: copy-all, download (.xml), wrap-lines toggle, and a muted label "read-only — edit in Design view" with a tiny lock icon.

Overall it must feel like a real IDE code view inside a polished tool — precise, quiet, professional. No stock photos, no marketing fluff.
