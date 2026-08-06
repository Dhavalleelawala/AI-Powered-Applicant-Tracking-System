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

### E5 — Pipeline Kanban UX depth
- **Status:** done
- **Shipped:** 2026-08-06
- **Notes:** Native drag-and-drop between columns; one-click advance; denser cards with collapsible notes; snap-scroll mobile board; column skeletons.
- **Paths:** `client/src/pages/recruiter/RecruiterPages.jsx`, `client/src/styles.css`

### E6 — Applicant applications polish
- **Status:** done
- **Shipped:** 2026-08-06
- **Notes:** Fit score + next-step copy visible without accordion; stage timeline; matched/gap skills; summary chips; clearer history.
- **Paths:** `client/src/pages/applicant/ApplicantPages.jsx`, `client/src/styles.css`

### E8 — Ember Ledger theme & type system
- **Status:** done
- **Shipped:** 2026-08-06
- **Notes:** New palette (ink + ember), Outfit headings + Manrope body, clamped type scale, CSS variables across surfaces.
- **Paths:** `client/src/theme/`, `client/index.html`, `client/src/styles.css`, shell/landing/auth/primitives

---

## Planned (next)

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
