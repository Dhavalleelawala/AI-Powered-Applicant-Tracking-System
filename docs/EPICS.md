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

### E15 — System feedback kit
- **Status:** done
- **Goal:** Unified empty/loading/error/success patterns across surfaces.
- **Accept:** Shared feedback primitives used on public, applicant, and recruiter pages; consistent retry/empty CTAs.
- **Shipped:** 2026-08-06
- **Notes:** ErrorState, QueryState, SuccessBanner, PageSkeleton; adopted across jobs/apps/saved/recruiter; toast + offline + boundary aligned.
- **Paths:** `client/src/components/ui/Primitives.jsx`, pages, `ToastContext`, `ErrorBoundary`

### E16 — Motion & density
- **Status:** done
- **Goal:** Intentional motion for presence/hierarchy; denser recruiter workspace vs spacious applicant.
- **Accept:** Staggered list enters; role-based density; reduced-motion respected; pipeline/drawer feel snappier.
- **Shipped:** 2026-08-06
- **Notes:** Role density via `data-density`; recruiter Compact toggle; stagger-in lists; stage-flash on move; page padding tokens.
- **Paths:** `AppShell.jsx`, `styles.css`, `Primitives.jsx`, recruiter/applicant/public pages

### E17 — Dual workspace shell
- **Status:** done
- **Goal:** Recruiter and applicant chrome feel like different products that share Rolefit.
- **Accept:** Distinct nav density, header treatment, and home CTA language per role; public shell stays light.
- **Shipped:** 2026-08-06
- **Notes:** Hiring ink bar vs Career mist bar; workspace chips; role nav labels; primary CTA in header; footer copy per role. UX plan in `docs/UX-PLAN.md`.
- **Paths:** `AppShell.jsx`, `styles.css`, `docs/UX-PLAN.md`

### E18 — Ranking explainability
- **Status:** done
- **Goal:** Score always pairs with “why” and one-click pipeline move from ranking.
- **Accept:** Ranking cards show matched/gap skills + AI summary; advance/reject from ranking without leaving the page.
- **Shipped:** 2026-08-06
- **Notes:** Visible AI brief; why-fit / gaps chips; Advance / Review / Reject; CandidateDrawer from ranking.
- **Paths:** `client/src/pages/recruiter/RecruiterPages.jsx` RankingPage

### E19 — Recruiter job authoring flow
- **Status:** done
- **Goal:** Guided job form with sectioned steps and public-card preview.
- **Accept:** Basics → skills → prefs → review; live preview of how the role appears on the board.
- **Shipped:** 2026-08-06
- **Notes:** Four-step authoring wizard; sticky board preview matching editorial jobs list; draft vs publish.
- **Paths:** `RecruiterPages.jsx` JobFormPage

### E20 — Accessibility & keyboard hiring
- **Status:** done
- **Goal:** Pipeline/drawer keyboard operable; consistent focus; contrast check.
- **Accept:** Keyboard stage advance shortcuts documented; skip links; drawer focus trap; contrast check on ember/ink.
- **Shipped:** 2026-08-06
- **Notes:** A/R/Enter/Esc/? hotkeys on pipeline + ranking; skip-to-content focuses main; drawer dialog focus; ember focus rings; secondary text contrast bump.
- **Paths:** `useHiringHotkeys.js`, `CandidateDrawer.jsx`, `AppShell.jsx`, `RecruiterPages.jsx`, `theme/index.js`, `styles.css`

### E21 — Mobile applicant polish
- **Status:** done
- **Goal:** Apply + readiness one-thumb friendly on small screens.
- **Accept:** Journey stepper wraps cleanly; apply wizard sticky primary CTA; profile sections collapse on mobile.
- **Shipped:** 2026-08-06
- **Notes:** 2×2 journey grid on xs; sticky apply/profile CTAs with safe-area; profile Basics/Links/Preferences accordions (Links & Preferences collapsed on phone).
- **Paths:** `ApplicantPages.jsx`, `ApplicantJourney.jsx`, `AppBreadcrumbs.jsx`, `styles.css`

### E22 — Light theme + resume craftsmanship
- **Status:** done
- **Goal:** App reads clearly in light mode; resume build → PDF → apply feels one craft.
- **Accept:** Landing/auth/shell light and readable; resume 4-step wizard with required dates/dropdowns; PDF uses readable dates + file named `{Applicant Name}.pdf`.
- **Shipped:** 2026-08-06
- **Notes:** Full light chrome; auth/landing mist panels; resume Summary→Experience→Education→Review wizard with live preview; PDF date formatting; download/attach as `{Name}.pdf`.
- **Paths:** `AppShell.jsx`, `AuthPages.jsx`, `PublicPages.jsx`, `ResumeBuilderPage.jsx`, `resumePdfService.js`, `client.js`

### E23 — Recruiter mobile pipeline
- **Status:** done
- **Goal:** Pipeline/ranking usable on phone (stacked columns or stage tabs; sticky stage actions).
- **Accept:** No horizontal-only kanban trap under 600px; advance/reject reachable one-thumb.
- **Shipped:** 2026-08-06
- **Notes:** Mobile stage tabs (2×2) replace horizontal kanban; full-width stage list; sticky bulk Interview CTA; ranking actions thumb-sized on xs.
- **Paths:** `RecruiterPages.jsx` PipelinePage/RankingPage, `styles.css`

### E24 — Applicant apply trust
- **Status:** done
- **Goal:** Apply wizard shows readiness + resume preview confidence before submit.
- **Accept:** Ready step mirrors live checklist; attached Rolefit resume shows name filename; clear post-submit next step.
- **Shipped:** 2026-08-06
- **Notes:** Ready step shows live profile/resume required checklist with Fix links; Rolefit attach confirms `{Name}.pdf`; Review step explains post-submit; My applications success banner states AI scoring next step.
- **Paths:** `ApplicantPages.jsx` ApplyJobPage/MyApplicationsPage, `styles.css`

### E25 — Demo narrative polish
- **Status:** done
- **Goal:** Recruiter Decisions → Ranking → Pipeline and Applicant Ready → Apply tell one story without dead ends.
- **Accept:** Empty states + CTAs point to the next demo beat; seed/demo copy still works.
- **Shipped:** 2026-08-06
- **Notes:** Ranking/directory/vacancy empties + publish redirect land on Ranking; apply/saved/resume CTAs never dead-end; seed applicant is Ready→Apply complete with clean demo copy.
- **Paths:** `RecruiterPages.jsx`, `ApplicantPages.jsx`, `ResumeBuilderPage.jsx`, `PublicPages.jsx`, `seed.js`

---

## Planned (next)

### E26 — Decision velocity
- **Status:** done
- **Goal:** Recruiter clears volume without leaving Pipeline / Decisions.
- **Accept:** Select 3+ candidates → bulk reject with preset; tag “Referral”; dashboard row advances without opening drawer.
- **Shipped:** 2026-08-06
- **Notes:** Bulk Interview/Offer/Reject with rejection presets; tags on drawer/cards + pipeline/directory filters; attention queue one-click advance/reject.
- **Paths:** `RecruiterPages.jsx`, `CandidateDrawer.jsx`, `ConfirmDialog.jsx`, `applicationService.js`, `hiring.js`

### E27 — Structured scorecard
- **Status:** in_progress
- **Goal:** Consistent evaluation next to AI score.
- **Accept:** Recruiter saves scorecard; Ranking shows recommendation chip beside match %.

### E28 — Interview lite
- **Status:** planned
- **Goal:** Interview stage carries a real next step.
- **Accept:** Moving to Interview prompts or allows schedule; candidate card shows when.

### E29 — Hiring analytics depth
- **Status:** planned
- **Goal:** Leadership sees velocity, not only counts.
- **Accept:** Dashboard shows time-in-stage metrics for open roles / company summary.

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
