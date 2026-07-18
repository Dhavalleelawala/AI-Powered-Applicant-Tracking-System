# 07 — Frontend Design (React + MUI + React Query)

## 7.1 Goals

Build a clean SPA with:

- Public job board
- Applicant apply + history
- Recruiter dashboard, job forms, Kanban pipeline, ranking filters

Stack: **React**, **React Query**, **MUI**, **React Router**.

## 7.2 Routing Map

| Path | Page | Access |
|------|------|--------|
| `/` | Landing / redirect | Public |
| `/jobs` | Job Board | Public |
| `/jobs/:jobId` | Job Detail | Public |
| `/login` | Login | Guest |
| `/register/applicant` | Applicant signup | Guest |
| `/register/recruiter` | Recruiter signup | Guest |
| `/applicant/applications` | My Applications | Applicant |
| `/applicant/jobs/:jobId/apply` | Apply Form | Applicant |
| `/recruiter` | Dashboard | Recruiter |
| `/recruiter/jobs/new` | Create Job | Recruiter |
| `/recruiter/jobs/:jobId/edit` | Edit Job | Recruiter |
| `/recruiter/jobs/:jobId/applications` | Pipeline (Kanban) | Recruiter |
| `/recruiter/jobs/:jobId/ranking` | Ranking Dashboard | Recruiter |

## 7.3 Layouts

### Public layout

- Top AppBar: logo, Jobs, Login/Register

### Applicant layout

- AppBar: Jobs, My Applications, Logout

### Recruiter layout

- AppBar + side nav: Dashboard, My Jobs, Logout

## 7.4 Key Screens (Build Spec)

### Job Board

- MUI `Grid`/`Stack` of job cards (or list rows)
- Search field + filters (location, type)
- Card shows: title, company, location, employment type, skills chips
- CTA: View / Apply

### Job Detail

- Full description
- Required skills as chips
- Apply button → login gate if needed

### Apply Form

- Cover letter textarea
- File input (PDF/DOCX) with client-side size/type checks
- Submit → React Query mutation → success toast → redirect history

### My Applications

- Table/list: job title, date, stage chip, AI status chip

### Recruiter Dashboard

- Counts: open jobs, total applications, interviews
- Recent jobs table with actions: Edit, Archive, View Apps, Ranking

### Job Form

- Controlled MUI form
- Fields match API job body
- Skills as MUI Autocomplete multiple / Chip input

### Kanban Pipeline

Columns: **Applied | Interview | Offered | Rejected** (Rejected optional column)

Each card: candidate name, score badge, skills preview

Actions:

- Drag-and-drop **or** Move menu (MVP can use menu buttons if DnD is slow)
- On stage change → `PATCH status`

Suggested libs: `@hello-pangea/dnd` or MUI-only buttons for Week 2.

### Ranking Dashboard

- Sort by score descending
- Filters: min score slider, skill filter, min experience
- Table columns: Name, Email, Score, Matched skills, Missing skills, Stage, Actions
- Row expand: AI summary, strengths, gaps
- Button: View resume (opens signed URL)

## 7.5 React Query Patterns

### Query keys

```js
['jobs', { q, page }]
['job', jobId]
['recruiter-jobs']
['applicant-applications']
['job-applications', jobId, filters]
['me']
```

### Mutations invalidate

- Create job → invalidate `recruiter-jobs`, `jobs`
- Apply → invalidate `applicant-applications`
- Status change → invalidate `job-applications`

### Polling for AI

While any visible application has `aiStatus` in `pending|processing`, refetch every 5–10s:

```js
refetchInterval: (query) => hasPending(query.state.data) ? 5000 : false
```

## 7.6 Auth Client Design

- `AuthContext` or Zustand store: `{ user, token, login, logout }`
- Axios interceptor attaches Bearer token
- On 401 → logout

## 7.7 MUI Theming (Guidance)

- Define palette in `theme/index.js`
- Consistent spacing, Button variants, Chip colors for stages:

| Stage | Chip color suggestion |
|-------|------------------------|
| applied | default / info |
| interview | warning |
| offered | success |
| rejected | error |

AI status:

| Status | Color |
|--------|-------|
| pending | default |
| processing | info |
| completed | success |
| failed | error |

Follow existing product visual rules if a design system appears later; for MVP keep UI simple and readable.

## 7.8 UX States (Required)

Every data view must handle:

1. Loading (Skeleton / CircularProgress)
2. Empty (No jobs / No applicants)
3. Error (Alert + retry)
4. Success feedback (Snackbar)

## 7.9 Component Breakdown (Suggested)

```
components/
  layout/AppShell.jsx
  layout/ProtectedRoute.jsx
  jobs/JobCard.jsx
  jobs/JobFilters.jsx
  applications/ApplicationKanban.jsx
  applications/ApplicationCard.jsx
  ranking/RankingTable.jsx
  ranking/RankingFilters.jsx
  common/ScoreBadge.jsx
  common/FileUploadField.jsx
  common/ConfirmDialog.jsx
```

## 7.10 Accessibility & Responsive

- Forms with labels
- Buttons have clear text
- Tables scroll horizontally on mobile
- Kanban becomes stacked columns / tabs on small screens

## 7.11 Frontend Acceptance Checklist

- [ ] Public can browse jobs without login
- [ ] Role-based routes block wrong users
- [ ] Apply upload works with progress/disabled submit
- [ ] Kanban/status updates reflect immediately (optimistic UI optional)
- [ ] Ranking filters update query string or React Query keys
