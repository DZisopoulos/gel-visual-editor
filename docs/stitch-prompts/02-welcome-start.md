# Stitch Prompt — Screen 2: Welcome / Start Screen

Paste the block below into Google Stitch as one prompt.

---

Design a desktop application welcome screen (1440x900, Windows desktop app feel, dark theme) for "GVE — GEL Visual Editor", a professional developer tool for building Clarity PPM GEL scripts visually. This is the screen shown at launch, before any flow is open.

OVERALL VISUAL LANGUAGE
Dark, focused, premium developer-tool aesthetic. Background: deep slate (#0F1218). Panels: slightly lighter charcoal (#171C26) with 1px borders (#2A3140) and 8px rounded corners. Accent color: electric teal (#2DD4BF) used sparingly for primary buttons and highlights. Typography: Inter for UI, JetBrains Mono for code snippets and file names. Subtle depth: soft shadows on cards, no glassmorphism, no gradients except a very faint radial teal glow behind the hero area. Density: calm and spacious — this screen is the one breathing-room moment in an otherwise dense tool. Thin-stroke icons.

LAYOUT:

1) TOP BAR (full width, 52px, #12161F):
Left: small hexagonal teal logo mark with "GVE" wordmark and muted subtitle "GEL Visual Editor". Right: ghost icon buttons for settings (gear) and help (question mark), and a muted version label "v1.0.0".

2) HERO STRIP (centered, upper third):
Large friendly headline "Build GEL scripts visually." with a one-line muted subheadline "Drag blocks, nest logic, export clean Clarity PPM GEL — no hand-written XML." Below it, two side-by-side large action cards (280px wide each, generous padding, hover-lift shadow):
- Primary card (teal border glow): plus icon in a tinted rounded square, title "New Flow", caption "Start from a blank canvas".
- Secondary card: folder icon, title "Open…", caption "Open a .gve flow or GVE-exported XML".

3) RECENT FLOWS (left column, below hero, ~62% width):
Section label "RECENT" in small caps with a subtle divider. A list of 5 recent-flow rows, each a slim card with: a small colored flow glyph (stacked-blocks icon), flow name in medium weight, muted mono file path, right-aligned muted "last opened" time, and a tiny chip showing block count. Rows:
- "Timesheet Reminder Notifications" — C:\Consulting\Acme\flows\timesheet-reminder.gve — 2 hours ago — chip "14 blocks"
- "Project Status Escalation" — C:\Consulting\Acme\flows\status-escalation.gve — yesterday — chip "22 blocks"
- "Resource Allocation Sync" — C:\Consulting\Globex\flows\resource-sync.gve — 3 days ago — chip "31 blocks"
- "Idea Auto-Approval" — C:\Consulting\Globex\flows\idea-approval.gve — last week — chip "9 blocks"
- "Cost Plan Snapshot" — C:\Consulting\Initech\flows\costplan-snapshot.gve — 2 weeks ago — chip "17 blocks"
First row shows a hover state (slightly lighter background, teal left edge). A muted "Show all…" link under the list.

4) START FROM A TEMPLATE (right column, ~38% width):
Section label "TEMPLATES" in small caps. A vertical stack of 4 compact template cards, each with a small icon, bold title, one-line muted description, and a tiny teal "Use" ghost button appearing on the first card (hover state):
- "Query → Loop → Email" — Notify users based on a SQL result set.
- "XOG Update Pattern" — Read, modify and write Clarity objects.
- "Scheduled Data Sync" — Pull external data via SOAP and update Clarity.
- "Try / Catch Wrapper" — Safe execution shell with error logging and alert email.

5) FOOTER STRIP (bottom, full width, subtle):
Left: muted text "Flows are saved locally. GVE never connects to your Clarity environment." with a small shield icon. Right: muted links "Documentation · Release notes".

Overall it must feel like the calm front door of a polished professional tool — confident, uncluttered, developer-grade. No stock photos, no marketing fluff, no illustrations of people.
