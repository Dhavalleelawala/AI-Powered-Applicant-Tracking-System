# Changelog

All notable Rolefit changes are listed here. Newest first.
Epics are tracked in [`docs/EPICS.md`](./docs/EPICS.md) — **one completed epic → one commit**.

## 2026-08-06 (E13 — Applicant journey polish)

- Shared Ready → Profile → Resume → Apply journey stepper across applicant surfaces
- Apply form is a 3-step wizard: confirm readiness, attach resume, note + submit
- Profile/resume footers guide the next step; applications celebrate a fresh submit

## 2026-08-06 (E12 — Public brand & jobs IA)

- Landing hero leads with the Rolefit wordmark, one line, dual CTAs, and a ledger visual plane
- Jobs board is an editorial title-led list with a sticky filter bar (no card grid)
- Job detail adds a sticky “Next step” apply rail on desktop; mobile keeps inline actions

## 2026-08-06 (E11 — Applicant pages required-details hub)

- Applicant home (`/applicant`) shows overall readiness % with profile/resume checklists
- Profile collects required career details: phone, headline, location, skills, availability, plus optional links and prefs
- Resume builder validates required summary, experience, education, and skills with a live completeness meter
- Apply and saved roles warn/gate until required profile + resume details are complete

## 2026-08-06 (E10 — Applicant resume builder)

- Applicants can create/edit a structured resume (summary, experience, education, skills)
- Download PDF (`GET /api/auth/resume.pdf`) and attach via **Use Rolefit resume** on apply
- Nav link: Resume · syncs skills to profile on save

## 2026-08-06 (E7 — Cloud deploy kit)

- Added Atlas + Render checklist (`docs/16-deploy-checklist.md`)
- `npm run preflight` validates secrets + Mongo reachability
- Health payload includes env, serveClient, version; Blueprint service named `rolefit`

## 2026-08-06 (E8 — Ember Ledger theme)

- New palette: cool ink `#12151C` + ember accent `#FF5C35` on mist paper
- Headings: Outfit; body: Manrope; fluid type scale via clamp()
- CSS variables + updated landing, auth, shell, and interaction surfaces

## 2026-08-06 (E6 — Applicant applications polish)

- Fit score, next-step copy, and stage timeline visible without opening accordions
- Matched / gap skill chips + AI summary on each application card
- Pipeline summary chips and clearer stage history

## 2026-08-06 (E5 — Pipeline Kanban UX)

- Drag candidates between pipeline columns (drop highlight)
- One-click advance to next stage + reject confirm
- Denser cards; notes collapse; column skeletons; mobile snap-scroll board

## 2026-08-06 (E0 — epic workflow & auto docs)

- Added epic tracker and Cursor rule: complete epic → update docs → single commit
- Comment policy: sparse, why-focused; docs auto-managed via EPICS + CHANGELOG

## 2026-08-06 (UI refresh)

### Visual & UX
- Stronger Rolefit theme: focus rings, table hover, funnel bars, brand mark
- Cleaner shell CTAs; landing hero + how-it-works section
- Auth split panel; clickable job cards; frosted filter bar
- Stat tiles with accent rails; calmer empty states

### Fixes
- Recruiters no longer get sent to login when viewing Apply on a public job
- Candidate directory search now filters before pagination; page meta + prev/next wired
- Auth pages redirect if already signed in; recruiter register links to applicant join

### UX
- Applications list links back to the public role
- Candidates show skills/headline, resume + ranking shortcuts
- Apply accepts files by extension when MIME is empty; leave warning while drafting
- Pipeline empty state + horizontal scroll on small screens
- Landing + desktop nav: Join as applicant

### Interaction UX
- Already-applied CTAs on job detail; apply flow redirects if a prior application exists
- Job-title breadcrumbs on pipeline, ranking, and apply
- Profile unsaved discard confirm + beforeunload warning
- Empty Kanban column copy; offline network banner

### Earlier UX / product
- Confirm dialogs for archive/reject; URL-synced filters; skip-to-content; document titles
- Drag-and-drop resume apply; unsaved job-form leave warning
- Rolefit visual theme across public, applicant, and recruiter surfaces

### Platform
- Single-container Docker (`SERVE_CLIENT`), `render.yaml`, CI (lint, client build, smoke, unit tests)
- Tenancy smoke checks and AI scoring unit tests
- Helmet, rate limits, CORS, production secret checks

## MVP baseline

Auth (applicant/recruiter) · jobs CRUD/duplicate · public board · apply + resume storage · AI ranking (LLM or heuristic) · Kanban pipeline · emails · analytics · saved jobs · profile
