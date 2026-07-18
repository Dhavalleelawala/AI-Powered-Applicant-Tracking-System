# 12 — Implementation Roadmap (4 Weeks)

Use this as the build checklist. Each day block lists **deliverables** and **acceptance checks**.

---

## Week 1 — Portals & Job Management

### Day 1–2: Database schema

**Build**

- [ ] Init `server` (Express + Mongoose)
- [ ] Models: `Company`, `User`, `Job`, `Application` (Application can be stub)
- [ ] Indexes from [04-database-schema.md](./04-database-schema.md)
- [ ] Seed script with demo users/jobs
- [ ] `GET /api/health`

**Accept**

- Mongo connects; seed creates documents; health returns ok

### Day 3–5: Auth + Job APIs

**Build**

- [ ] Register applicant / recruiter
- [ ] Login + JWT middleware + `GET /me`
- [ ] Job create / update / archive
- [ ] `GET /api/jobs` (public open jobs)
- [ ] `GET /api/recruiter/jobs`
- [ ] Ownership checks on write

**Accept**

- Wrong role gets 403
- Recruiter A cannot edit Recruiter B job
- Duplicate email rejected

### Day 6–7: Recruiter Dashboard + Job Board UI

**Build**

- [ ] Init `client` (React + Router + MUI + React Query)
- [ ] Auth pages + token storage
- [ ] Public Job Board + Job Detail
- [ ] Recruiter Dashboard + Job Form (create/edit)
- [ ] Archive action

**Accept**

- End-to-end: register recruiter → create job → appears on board

**Week 1 Exit Criteria**

Auth works for both roles; jobs CRUD complete; public board live.

---

## Week 2 — Application Pipeline & File Storage

### Day 1–3: S3 + Multer

**Build**

- [ ] AWS bucket + IAM
- [ ] `storageService` upload/signed URL
- [ ] Multer middleware (PDF/DOCX, size limit)
- [ ] Wire env vars

**Accept**

- Test upload puts object in S3; signed URL downloads file

### Day 4–5: Applicant submission + history

**Build**

- [ ] `POST /api/jobs/:jobId/applications` multipart
- [ ] Unique application constraint
- [ ] Applicant My Applications API + UI
- [ ] Apply form UI on job detail flow

**Accept**

- Candidate applies once; second apply → 409
- History lists stage + date

### Day 6–7: Kanban pipeline

**Build**

- [ ] `PATCH /api/applications/:id/status`
- [ ] stageHistory entries
- [ ] Recruiter Applications page with columns/actions
- [ ] Resume signed URL button

**Accept**

- Move Applied → Interview persists after refresh

**Week 2 Exit Criteria**

Full apply flow + S3 storage + pipeline updates without AI.

---

## Week 3 — AI Integration & Resume Parsing

### Day 1–3: Text extraction

**Build**

- [ ] `resumeParseService` with pdf-parse (+ docx)
- [ ] Save `extractedText`
- [ ] Handle empty/failed extraction

**Accept**

- Known sample PDF extracts readable text

### Day 4–6: LLM match scoring

**Build**

- [ ] `aiService` adapter (OpenAI or Gemini)
- [ ] Prompt + JSON validation
- [ ] Async analyze after apply
- [ ] Store `aiAnalysis`, set `aiStatus`

**Accept**

- New application reaches `completed` with score 0–100
- Invalid LLM JSON handled as `failed` (no crash)

### Day 7: Persist + map to UI

**Build**

- [ ] Ensure ranking fields queryable
- [ ] Recruiter UI shows score + summary
- [ ] Polling while pending
- [ ] `POST .../reanalyze`

**Accept**

- Score visible on application card/table

**Week 3 Exit Criteria**

AI ranking stored and shown per application.

---

## Week 4 — Advanced Filtering & Communication

### Day 1–3: Ranking dashboard + filters

**Build**

- [ ] Ranking page
- [ ] Filters: minScore, skill, experience
- [ ] Sort by score
- [ ] Expand row for strengths/gaps

**Accept**

- Filter minScore=70 hides lower scores

### Day 4–5: Email triggers

**Build**

- [ ] Nodemailer transport
- [ ] Templates for interview / offered / rejected
- [ ] Hook into status PATCH
- [ ] Optional email_logs

**Accept**

- Moving to Interview sends email (check Mailtrap/Ethereal)

### Day 6–7: Testing, S3 security, deploy

**Build**

- [ ] End-to-end test script / checklist
- [ ] Confirm S3 public access blocked
- [ ] helmet/CORS/rate-limit
- [ ] Deploy API + client + Atlas
- [ ] Production env vars set
- [ ] Smoke test on deployed URL

**Accept**

- Full path works on staging/production:
  register → job → apply → AI score → filter → interview email

**Week 4 Exit Criteria**

MVP feature-complete and deployed.

---

## Cross-Week Engineering Standards

1. Every endpoint documented in [06-api-specification.md](./06-api-specification.md)
2. No secrets committed
3. Consistent error JSON shape
4. Loading/empty/error UI states
5. Prefer small PRs / commits per day block

---

## Definition of Done (Whole Project)

- [ ] Dual auth
- [ ] Job board + recruiter job management
- [ ] Resume upload to private S3
- [ ] Kanban stages
- [ ] AI score + skills + summary
- [ ] Ranking filters
- [ ] Status emails
- [ ] Basic security hardening
- [ ] Deployed environment with README run instructions

---

## Suggested First Commands (When Coding Starts)

```bash
mkdir server client
cd server && npm init -y
# install express mongoose cors dotenv bcrypt jsonwebtoken multer aws-sdk pdf-parse nodemailer zod helmet morgan
cd ../client
npm create vite@latest . -- --template react
# install @mui/material @emotion/react @emotion/styled @tanstack/react-query react-router-dom axios
```

Then implement Week 1 Day 1–2 exactly.
