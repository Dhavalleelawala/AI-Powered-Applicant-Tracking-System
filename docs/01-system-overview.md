# 01 — System Overview

## 1.1 Product Summary

The **AI-Powered Applicant Tracking System (ATS)** is a web application that manages the recruitment lifecycle:

1. Recruiters create and manage job openings.
2. Candidates discover jobs on a public board and apply with resume uploads.
3. The platform stores resumes securely, extracts text, and uses an LLM to score semantic fit against the job description.
4. Recruiters manage a Kanban pipeline (Applied → Interview → Offered), filter by AI score/skills, and send automated emails.

## 1.2 Problem Statement

Manual screening of hundreds of resumes is slow, inconsistent, and biased toward keyword matching. Recruiters need:

- Centralized job and application management
- Secure resume storage
- Objective, skill-based first-pass ranking
- Clear pipeline stages and candidate communication

## 1.3 Success Criteria

| Metric | Target |
|--------|--------|
| Recruiter can create/edit/archive jobs | Working end-to-end |
| Candidate can apply with PDF/DOCX resume | File stored in S3, linked to application |
| AI returns match score + skills + summary | Persisted on application within minutes |
| Recruiter can filter/rank candidates | By score, skills, experience |
| Pipeline stages updateable | Applied / Interview / Offered (+ optional Rejected) |
| Status change emails | Interview invite / status update via Nodemailer |
| Role isolation | Recruiters cannot access other companies’ data; applicants see only their apps |

## 1.4 User Personas

### Recruiter (Company HR)

- Registers/logs in as recruiter
- Posts jobs for their company
- Reviews applications and AI rankings
- Moves candidates through pipeline
- Triggers interview emails

### Applicant (Candidate)

- Registers/logs in as applicant
- Browses public job board
- Applies to jobs with resume
- Views own application history and statuses

### System / Background Jobs

- Processes resume text extraction
- Calls LLM for analysis
- Sends emails on status transitions

## 1.5 In Scope (MVP — 4 Weeks)

- Dual auth (recruiter + applicant)
- Job CRUD + archive + public job board
- Application submit + history
- AWS S3 resume storage (PDF/DOCX)
- Kanban pipeline UI
- pdf-parse + LLM match scoring
- Ranking dashboard with filters
- Nodemailer email triggers
- Basic security (JWT, S3 private access, upload validation)
- Deployable build (staging/production)

## 1.6 Out of Scope (Post-MVP)

- Video interviews / calendar scheduling
- Multi-tenant billing / SaaS plans
- Mobile native apps
- Advanced bias auditing dashboards
- LinkedIn OAuth import
- Real-time collaborative notes (beyond basic comments if time allows)
- DOCX deep parsing via OCR for scanned PDFs (optional stretch)

## 1.7 Core Domain Concepts

| Concept | Meaning |
|---------|---------|
| **Job** | Opening posted by a recruiter/company |
| **Application** | One applicant applying to one job |
| **Resume** | Uploaded file + extracted text + S3 key |
| **AI Analysis** | Match score, skills, summary, gaps |
| **Pipeline Stage** | Applied, Interview, Offered, Rejected |
| **Company** | Owning org for recruiters and jobs |

## 1.8 High-Level User Journeys

### Journey A — Recruiter posts a job

1. Login → Recruiter Dashboard  
2. Create Job (title, description, required skills, experience, location, type)  
3. Job appears on Job Board (if status = open)  
4. Recruiter can edit or archive later  

### Journey B — Candidate applies

1. Browse Job Board → open job detail  
2. Login/register as applicant  
3. Fill application form + upload resume  
4. System stores file in S3 + creates Application  
5. Background/async AI pipeline runs  
6. Candidate sees application in history (status: Applied)  

### Journey C — Recruiter screens with AI

1. Open job → Applications / Ranking view  
2. See candidates sorted by AI match score  
3. Filter by min score, skills, years of experience  
4. Move candidate to Interview  
5. Email invite sent automatically  
6. Later move to Offered or Rejected  

## 1.9 Non-Functional Requirements

| Area | Requirement |
|------|-------------|
| **Performance** | Job list & dashboard APIs < 500ms typical; AI analysis may be async (seconds–minutes) |
| **Scalability** | S3 for files; MongoDB indexes on jobId, applicantId, score |
| **Security** | JWT auth; private S3; no public resume URLs without signed URLs |
| **Reliability** | Failed AI jobs retryable; application still created if AI pending |
| **Usability** | MUI consistent UI; clear empty/loading/error states |
| **Maintainability** | Modular Express routes/services; typed contracts documented here |

## 1.10 Assumptions

- One recruiter belongs to one company (MVP).
- One application per applicant per job (unique constraint).
- English resumes preferred for MVP LLM prompts.
- OpenAI **or** Gemini — pick one primary provider; abstract behind a service interface.
- Python microservice is **optional**; Node can own pdf-parse + LLM for MVP if team is smaller.

## 1.11 Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| LLM cost / rate limits | Cache analysis per resume hash + job version; async queue |
| Bad PDF extraction | Validate file type/size; show “AI pending/failed” status |
| S3 misconfiguration | Private bucket + signed URLs only; IAM least privilege |
| Prompt injection via resume text | Strip control instructions; structured JSON output schema |
| Scope creep in Week 4 | Freeze features Day 5; test & deploy Days 6–7 |
