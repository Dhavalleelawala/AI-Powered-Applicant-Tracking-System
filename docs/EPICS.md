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

### E11 — Applicant pages required-details hub
- **Status:** done
- **Goal:** All applicant pages collect/show required career details with completeness guidance.
- **Accept:** Profile + resume validate required fields; dashboard shows gaps; apply/saved surfaces next steps.
- **Shipped:** 2026-08-06
- **Notes:** Applicant home readiness hub; expanded profile (links, availability, prefs); resume required validation; apply gated until complete.
- **Paths:** `client/src/pages/applicant/*`, `client/src/utils/applicantCompleteness.js`, User profile fields

### E12 — Public brand & jobs IA
- **Status:** done
- **Goal:** Landing + jobs board + job detail feel unmistakably Rolefit with clearer next actions.
- **Accept:** Brand-first landing; editorial jobs list with sticky filters; job detail sticky apply rail.
- **Shipped:** 2026-08-06
- **Notes:** Hero wordmark Rolefit; ledger visual plane; title-led job rows; sticky filter/apply rail.
- **Paths:** `client/src/pages/PublicPages.jsx`, `client/src/styles.css`

### E13 — Applicant journey polish
- **Status:** done
- **Goal:** Home → profile/resume → apply feels one continuous flow.
- **Accept:** Shared journey chrome, step progress, apply confirms readiness, smoother CTAs between surfaces.
- **Shipped:** 2026-08-06
- **Notes:** Shared ApplicantJourney stepper; apply Ready→Resume→Submit wizard; journey footers; post-submit celebration.
- **Paths:** `client/src/components/applicant/ApplicantJourney.jsx`, applicant pages, `styles.css`

### E14 — Recruiter decision cockpit
- **Status:** done
- **Goal:** Dashboard “needs attention” queue + candidate drawer for faster hiring decisions.
- **Accept:** Attention queue on dashboard; open candidate detail without leaving context; quick stage actions.
- **Shipped:** 2026-08-06
- **Notes:** `GET /recruiter/attention`; CandidateDrawer with AI brief/advance/reject/notes; wired from dashboard, directory, pipeline.
- **Paths:** `hiringService.js`, `CandidateDrawer.jsx`, `RecruiterPages.jsx`

---

## Planned (next)

### E15 — System feedback kit
- **Status:** planned
- **Goal:** Unified empty/loading/error/success patterns across surfaces.

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
