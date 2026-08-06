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

### E7 — Cloud deploy kit
- **Status:** done
- **Shipped:** 2026-08-06
- **Notes:** Atlas+Render checklist, `npm run preflight`, richer `/api/health`, Blueprint `render.yaml` service name. Live URL still needs your Atlas URI + Render login.
- **Paths:** `docs/16-deploy-checklist.md`, `server/src/scripts/preflight.js`, `render.yaml`, `server/src/controllers/healthController.js`

### E10 — Applicant resume builder
- **Status:** done
- **Shipped:** 2026-08-06
- **Notes:** Structured resume draft on User; PDF via pdfkit; builder UI; apply “Use Rolefit resume”.
- **Paths:** `server/src/services/resumePdfService.js`, `client/src/pages/applicant/ResumeBuilderPage.jsx`, auth resume routes

---

## Planned (next)

### E7b — Live production cutover
- **Status:** planned
- **Goal:** Public Render URL with Atlas, health green, demo logins, smoke pass.
- **Accept:** Shareable `https://….onrender.com` works for recruiter + applicant demos.
- **Blocked on:** User Atlas connection string + Render Blueprint deploy (paste URL when ready).

---

## How to use

1. Pick the next `planned` epic → set `in_progress`.
2. Implement only that epic’s scope.
3. On completion → update this file + `CHANGELOG.md` → **commit once**.
4. Mark epic `done` and move to the next.
