# GVE Phase 1 — Implementation Agent Kickoff Prompt

Copy everything below the line into a fresh Claude Code session started in `C:\Users\dimit\Desktop\GVE`.

---

Implement Phase 1 of GVE (GEL Visual Editor) by executing the approved implementation plan. Do not re-design, re-brainstorm, or re-scope — design decisions are settled and documented.

**Read these first, in order:**
1. `docs/superpowers/plans/2026-07-20-gve-phase1.md` — THE PLAN. It is authoritative for what to build and in what order. Its header names the required sub-skill: use superpowers:subagent-driven-development (preferred) or superpowers:executing-plans, and track the plan's `- [ ]` checkboxes as you go.
2. `docs/superpowers/specs/2026-07-20-gve-design.md` — the product spec, for context when a plan detail needs interpretation. The plan wins on conflicts within Phase 1 scope; the spec wins on intent.
3. `docs/design/README.md` — visual direction: which parts of the Stitch mockups (`docs/design/stitch/`) to adopt and, critically, the "Reject" list of mockup hallucinations you must NOT implement (no Deploy button, no user accounts, no Logs/Debugger tabs, no Run menu, no execution features).

**Ground rules:**
- Work task-by-task in plan order (Tasks 1–14). Strict TDD as the plan's steps dictate: write the failing test, run it and see it fail, implement, see it pass, commit. Never skip the failing-test run.
- The expected-output fixtures in the plan's tests (especially the `generateGel` XML fixture in Task 5) are contracts — adjust the implementation to match them, never the fixture.
- Commit at every task boundary at minimum, conventional-commit style. Check off plan checkboxes by editing the plan file as steps complete.
- Everything in `src/shared/` stays free of Electron and React imports.
- The app is fully offline: no network calls, no telemetry. Do not add dependencies beyond those the plan names without a strong reason stated in a commit message.
- Platform is Windows; verify `npm run dev` launches after Task 1 and again after Tasks 8, 10, 12, 13.
- If you hit a genuine blocker or contradiction in the plan, stop and surface it rather than improvising a redesign; small mechanical gaps (missing import, path typo) you fix in place and note in the commit.

**Definition of done:** all 14 tasks checked off, `npm test` fully green, and the Task 14 manual acceptance pass performed, ending with the `phase-1` git tag. Then report: what shipped, test count, any deviations from the plan, and remind the user that the final spec exit-test — running an exported script in a real Clarity dev environment — is theirs to perform.
