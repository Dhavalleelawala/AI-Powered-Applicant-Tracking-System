# Rolefit epics

Living tracker. The agent updates this file when an epic starts or completes.
**One completed epic → one git commit** (see `.cursor/rules/epic-workflow.mdc`).

Status: `planned` · `in_progress` · `done`

---

## Done

### E0 — Epic workflow & auto docs
- **Status:** done
- **Shipped:** 2026-08-06
- **Notes:** Cursor rule for epic commits; this tracker; CHANGELOG discipline; sparse code-comment policy.
- **Paths:** `.cursor/rules/epic-workflow.mdc`, `docs/EPICS.md`, `CHANGELOG.md`

### E1 — MVP product baseline
- **Status:** done
- **Shipped:** earlier
- **Notes:** Auth, jobs, apply/resume, AI ranking, Kanban, emails, analytics, saved jobs, profile, Docker/CI.
- **Paths:** `server/`, `client/`, `Dockerfile`, `render.yaml`

### E2 — Interaction & demo UX
- **Status:** done
- **Shipped:** 2026-08-06
- **Notes:** Confirms, URL filters, already-applied CTAs, breadcrumbs, offline banner, candidate search fix, auth redirects.
- **Paths:** `client/src/pages/`, `client/src/hooks/`, `server/src/services/hiringService.js`

### E3 — Visual UI refresh
- **Status:** done
- **Shipped:** 2026-08-06
- **Notes:** Theme, landing/auth atmosphere, job cards, funnel bars, brand mark, shell CTAs.
- **Paths:** `client/src/theme/`, `client/src/styles.css`, `client/src/components/`

### E4 — Deploy readiness
- **Status:** done
- **Shipped:** 2026-08-06
- **Notes:** `SEED_ON_EMPTY`, ErrorBoundary, Render/Docker seed defaults, CHANGELOG.
- **Paths:** `server/src/scripts/seed.js`, `server/src/server.js`, `render.yaml`

---

## Planned (next)

### E5 — Pipeline Kanban UX depth
- **Status:** planned
- **Goal:** Drag-and-drop stages (or clearer stage controls), denser cards, better mobile horizontal board, loading skeletons per column.
- **Accept:** Recruiter can move a candidate stage in under two clicks on desktop and phone without losing context.

### E6 — Applicant applications polish
- **Status:** planned
- **Goal:** Clearer match evidence, stage timeline visual, empty/loading polish, deep links to job + status.
- **Accept:** Applicant understands score + next step without opening every accordion.

### E7 — Live cloud deploy
- **Status:** planned
- **Goal:** Atlas + Render (or equivalent) live URL with seeded demos.
- **Accept:** `/api/health` green; demo logins work; public jobs load.
- **Blocked on:** User Atlas URI + Render account.

---

## How to use

1. Pick the next `planned` epic → set `in_progress`.
2. Implement only that epic’s scope.
3. On completion → update this file + `CHANGELOG.md` → **commit once**.
4. Mark epic `done` and move to the next.
