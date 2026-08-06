# Changelog

All notable Rolefit changes are listed here. Newest first.
Epics are tracked in [`docs/EPICS.md`](./docs/EPICS.md) — **one completed epic → one commit**.

## 2026-08-06 (E25 — Demo narrative polish)

- Ranking empty states clear filters or send recruiters to the public role; publish lands on Ranking
- Dashboard / vacancy / directory empties point at Ranking or Create a job — Ranking before Pipeline in role actions
- Apply, saved roles, and resume review CTAs never dead-end; seed applicant is Ready→Apply with clean demo copy

## 2026-08-06 (E24 — Applicant apply trust)

- Apply Ready step shows the live profile + resume required checklist with per-item Fix links
- Rolefit attach confirms `{Applicant Name}.pdf` and marks confidence before Review
- Review step and My applications success banner spell out the post-submit AI scoring next step

## 2026-08-06 (E23 — Recruiter mobile pipeline)

- Pipeline on phones uses stage tabs instead of horizontal kanban scroll
- Selected-stage candidate list is full-width with thumb-sized advance/reject
- Sticky bulk “Move to Interview” bar when cards are selected; ranking actions sized for one-thumb use

## 2026-08-06 (E22 — Light theme + resume craftsmanship)

- Landing, auth, and workspace chrome use a readable light theme (mist/paper + ink text)
- Resume builder is a four-step craft flow with required month dates, degree/employment dropdowns, and live preview
- PDF layout cleaned up with human-readable dates; download/attach filename is `{Applicant Name}.pdf`
- Phase 3 UX plan added (E22–E25) in `docs/UX-PLAN.md`

## 2026-08-06 (E21 — Mobile applicant polish)

- Journey stepper uses a 2×2 grid on phones; apply step labels tighten for narrow widths
- Apply wizard and profile save use a sticky thumb-friendly primary CTA (safe-area aware)
- Profile Basics / Links / Preferences collapse into accordions on mobile (Basics open by default)
- Role workspace text contrast and weight improved for readability

## 2026-08-06 (E20 — Accessibility & keyboard hiring)

- Pipeline and ranking: focus a card, then A advance / R reject / Enter open / Esc close / ? tip
- Skip-to-content focuses `#main-content`; candidate drawer is a labeled dialog with initial focus
- Ember focus rings on hiring cards; secondary text darkened for contrast on mist/paper

## 2026-08-06 (E19 — Recruiter job authoring flow)

- Job create/edit is a four-step flow: Basics → Skills → Hiring → Review
- Sticky board preview mirrors the public editorial jobs list while you write
- Draft vs open publish choice on the final step

## 2026-08-06 (E18 — Ranking explainability)

- Ranking cards show score + AI brief without an accordion
- Matched / gap skill chips explain the score (“why they fit”)
- Advance, reject, and open candidate drawer directly from ranking

## 2026-08-06 (E17 — Dual workspace shell)

- Phase 2 UX plan published (`docs/UX-PLAN.md`)
- Recruiter gets ink hiring bar + denser nav (Decisions / Directory / Board)
- Applicant gets mist career bar + journey nav (Ready / Roles / Pipeline…)
- Header primary CTA + workspace chip + role-specific footer copy

## 2026-08-06 (E16 — Motion & density)

- Role-based density (`applicant` spacious vs `recruiter` tighter page padding)
- Recruiter dashboard Compact / Comfortable toggle (persisted)
- Staggered list enters on jobs, applications, attention, directory
- Pipeline stage-flash after move; button press scale; reduced-motion respected

## 2026-08-06 (E15 — System feedback kit)

- Shared `ErrorState`, `QueryState`, `SuccessBanner`, `InfoBanner`, `WarningBanner`, `PageSkeleton`
- Jobs, applications, saved roles, recruiter surfaces use consistent retry/empty/loading patterns
- Toasts keep errors longer; offline banner + ErrorBoundary aligned to the same feedback language

## 2026-08-06 (E14 — Recruiter decision cockpit)

- Dashboard “Needs attention” queue: ready-to-advance, aging, interview follow-up, AI scoring
- Candidate drawer with AI brief, advance/reject, notes, resume, re-score
- Drawer opens from dashboard, candidate directory, and pipeline cards

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
