# Changelog

All notable Rolefit changes are listed here. Newest first.

## 2026-08-06

### Deploy & resilience
- `SEED_ON_EMPTY=true` seeds demo users/jobs on first boot when the database has no users (safe for Render/Atlas)
- Client `ErrorBoundary` recovers from unexpected UI crashes with a home path back

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
