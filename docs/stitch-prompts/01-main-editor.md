# Stitch Prompt — Screen 1: Main Editor (Design view)

Paste the block below into Google Stitch as one prompt.

---

Design a desktop application UI (1440x900, Windows desktop app feel, dark theme) called "GVE — GEL Visual Editor", a professional developer tool for building Clarity PPM GEL scripts visually as stacked blocks, in the style of Power Automate meets VS Code.

OVERALL VISUAL LANGUAGE
Dark, focused, premium developer-tool aesthetic. Background: deep slate (#0F1218). Panels: slightly lighter charcoal (#171C26) with 1px borders (#2A3140) and 8px rounded corners. Accent color: electric teal (#2DD4BF) used sparingly for selection, primary buttons, and active states. Secondary accent: soft amber (#F5B84D) for warnings. Typography: Inter for UI, JetBrains Mono for all code/SQL/XML. Subtle depth: soft shadows on floating elements, no glassmorphism, no gradients except a faint teal glow on the selected block. Density: compact but breathable, like JetBrains IDEs. Crisp 16px line-height iconography, thin-stroke icons.

LAYOUT — four regions plus header:

1) HEADER BAR (full width, 52px, #12161F):
Left: small hexagonal teal logo mark with "GVE" wordmark, then breadcrumb "My Flows / Timesheet Reminder Notifications". Center: pill-shaped segmented control with "Design | XML | Validate" (Design active). Right: status chip "● Valid — 0 errors" in green, then buttons: ghost icon buttons (undo, redo), secondary button "Save Flow", primary teal button "Export GEL ▸".

2) LEFT PANEL — NODE PALETTE (260px wide):
Top: search input "Search nodes…" with magnifier icon. Below, collapsible categories, each with a caret, colored category dot, and small count badge:
- CORE (violet dot): blocks listed as rows with icon + name: "Set Variable", "For Each Loop", "Choose / When", "Switch", "Comment"
- DATA (blue dot): "SQL Query", "Process Parameter"
- INTEGRATION (orange dot): "SOAP Invoke", "HTTP Call", "File Read", "File Write", "FTP Transfer"
- CLARITY (teal dot): "Log Message", "Send Email", "XOG Read", "XOG Write"
- ADVANCED (rose dot): "Try / Catch", "Include Script", "Raw GEL"
Each row has a subtle grab-handle affordance on hover. One row ("Send Email") shown mid-drag as a floating ghost card with drop shadow.

3) CENTER — CANVAS (flexible width, subtle dot-grid background):
A vertical stack of connected block cards, 640px wide, centered, linked by short vertical connector lines with small chevron arrows. Blocks from top to bottom:
- A slim "START — Process Step" cap block with a play icon and chips showing declared parameters: "projectId (string)", "daysLate (number)".
- Block card "SQL Query" (blue left edge stripe, database icon): title "Get overdue timesheets", subtitle row of chips: "Datasource: Niku" and "→ overdueRows". Collapsed preview line in mono font: "SELECT r.full_name, r.email, t.prtimesheet_id FROM…"
- Container block "For Each Loop" (violet left stripe, loop icon): title "For each row in ${overdueRows.rows}", chip "var: row". Its body is an inset nested area (darker background #131822, dashed left guide-line) containing two child blocks:
   - Child block "Choose / When" (violet stripe, branch icon), title "When ${row.days_late} > 5", containing one nested child:
       - "Send Email" block (teal stripe, envelope icon): title "Escalation notice", chips "To: ${row.email}", "CC: pmo@acme.com" — THIS BLOCK IS SELECTED: teal 2px border, faint teal outer glow.
   - Child block "Log Message" (teal stripe): title "Log processed user", mono preview "Processed ${row.full_name}".
- Block card "Set Variable" (violet stripe): title "totalProcessed", chip "= ${overdueRows.rowCount}".
- A slim "END" cap block.
Between blocks, on hover, a small circular teal "+" insert button on the connector line (show one visible). Each block card: 10px radius, icon in a tinted rounded square, kebab menu top-right, collapse caret. One block ("SQL Query") shows a tiny amber warning triangle badge.

4) RIGHT PANEL — INSPECTOR (340px wide):
Header: envelope icon + "Send Email" + muted "gel:email" tag name in mono, kebab menu. Below, a clean form with section labels in small caps:
- GENERAL: text field "Step name: Escalation notice"; toggle "Enabled" (on).
- RECIPIENTS: field "To" containing value "${row.email}" rendered as mono text with the ${…} token highlighted in teal; field "CC: pmo@acme.com".
- CONTENT: field "Subject: Timesheet overdue — action required"; multiline mono editor "Body" with 4 lines of message text containing highlighted ${row.full_name} and ${row.days_late} tokens.
- A subtle info panel at bottom: "Variables in scope" with mono chips: row, overdueRows, projectId, daysLate.

5) BOTTOM PANEL — XML PREVIEW (full width under canvas+inspector, 180px tall, collapsible with grab bar):
Tab header "Generated GEL" + copy icon + "auto-updating" pulse dot. Monaco-style code area, dark, mono font, XML syntax highlighting (tags in teal, attributes in violet, strings in amber), showing a fragment of <gel:email from=… to="${row.email}"> markup; the lines corresponding to the selected block have a faint teal background highlight.

Overall it must feel like a polished, real professional tool — cohesive, calm, precise — not a generic template. No stock photos, no marketing fluff.
