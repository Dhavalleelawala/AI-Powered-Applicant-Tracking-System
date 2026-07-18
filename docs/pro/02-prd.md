# Product Requirements Document (PRD)

**Product:** AI-Powered ATS  
**Version:** MVP 1.0  
**Status:** Approved for build planning  
**Owner:** Product + Engineering Lead

---

## 1. Overview

Build a web application where companies manage hiring end-to-end: post jobs, collect applications, store resumes securely, rank candidates with AI, progress pipeline stages, and notify candidates by email.

---

## 2. Personas

| Persona | Description | Primary screens |
|---------|-------------|-----------------|
| **Org Admin / Recruiter** | Creates jobs, reviews ranked applicants, changes stages | Dashboard, Jobs, Pipeline, Ranking |
| **Applicant** | Discovers jobs, applies, tracks status | Job Board, Apply, My Applications |
| **System** | Parses resumes, calls LLM, sends email | Background workers |

---

## 3. Functional Requirements

### FR-1 Authentication & Tenancy

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1.1 | Applicant can register/login | P0 |
| FR-1.2 | Recruiter can register with company profile | P0 |
| FR-1.3 | JWT-authenticated API access | P0 |
| FR-1.4 | Role-based route and API authorization | P0 |
| FR-1.5 | All recruiter data access scoped by `companyId` | P0 |

### FR-2 Job Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-2.1 | Create job with title, description, skills, experience, location, type | P0 |
| FR-2.2 | Edit job | P0 |
| FR-2.3 | Archive job (soft close) | P0 |
| FR-2.4 | Public job board lists open jobs only | P0 |
| FR-2.5 | Recruiter can list all company jobs | P0 |
| FR-2.6 | Draft jobs | P1 |

### FR-3 Applications & Documents

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-3.1 | Applicant applies with resume upload (PDF required; DOCX preferred) | P0 |
| FR-3.2 | Optional cover letter | P1 |
| FR-3.3 | One application per applicant per job | P0 |
| FR-3.4 | Resume stored in private object storage | P0 |
| FR-3.5 | Recruiter downloads via short-lived signed URL | P0 |
| FR-3.6 | Applicant views own application history | P0 |

### FR-4 Pipeline

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-4.1 | Stages: Applied, Interview, Offered, Rejected | P0 |
| FR-4.2 | Recruiter can change stage | P0 |
| FR-4.3 | Stage history with actor + timestamp | P0 |
| FR-4.4 | Kanban or equivalent board UI | P0 |

### FR-5 AI Analysis

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.1 | Extract text from resume | P0 |
| FR-5.2 | Compare resume to job description semantically via LLM | P0 |
| FR-5.3 | Persist matchScore (0–100), skillsMatched, skillsMissing, summary, strengths, gaps | P0 |
| FR-5.4 | AI runs asynchronously; apply succeeds even if AI pending | P0 |
| FR-5.5 | Visible AI statuses: pending/processing/completed/failed | P0 |
| FR-5.6 | Recruiter can re-run analysis | P1 |

### FR-6 Ranking & Filtering

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-6.1 | Rank applications by score desc | P0 |
| FR-6.2 | Filter by min score | P0 |
| FR-6.3 | Filter by skill | P0 |
| FR-6.4 | Filter by estimated/min experience | P1 |

### FR-7 Communications

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-7.1 | Email on move to Interview | P0 |
| FR-7.2 | Email on Offered | P1 |
| FR-7.3 | Email on Rejected (configurable) | P2 |
| FR-7.4 | Email failure must not roll back stage change | P0 |

---

## 4. Non-Functional Requirements (summary)

Full detail in `04-nfr-slos.md`.

| Area | MVP bar |
|------|---------|
| Security | Private S3, tenancy checks, hashed passwords, no secret leakage |
| Performance | Job list p95 < 500ms; AI async |
| Reliability | Application create success even if AI/email fails |
| Usability | Loading/empty/error states on all major screens |
| Maintainability | Layered backend; documented APIs; env-based config |
| Observability | Structured logs + health endpoint |

---

## 5. User Stories (MVP)

1. As a recruiter, I register my company so I can post jobs.  
2. As an applicant, I browse open jobs without login.  
3. As an applicant, I apply with my resume in under 2 minutes.  
4. As a recruiter, I see candidates ranked by AI fit for a job.  
5. As a recruiter, I move a candidate to Interview and they get an email.  
6. As a recruiter, I open a resume securely without a public link.  

---

## 6. Acceptance Criteria (Product-level)

MVP is accepted when a pilot company can:

1. Create 3 jobs  
2. Receive ≥10 applications (test data OK)  
3. See AI scores for ≥95% of parseable PDFs  
4. Shortlist top 5 by filter  
5. Move 2 candidates to Interview with email delivered to a test inbox  
6. Confirm another company’s recruiter cannot access their data  

---

## 7. UX Requirements (product constraints)

- Distinct recruiter vs applicant navigation
- Score always accompanied by summary (anti-black-box)
- Never show raw extracted resume text on public pages
- Mobile-usable job board; desktop-first recruiter tools

---

## 8. Dependencies

| Dependency | Risk if missing |
|------------|-----------------|
| MongoDB Atlas / managed Mongo | Blocker |
| AWS S3 | Blocker |
| LLM API key | AI features blocked (apply can still work) |
| SMTP provider | Emails blocked (pipeline still works) |

**Graceful degradation policy:** core hiring flow works without AI/email; AI/email are progressive enhancement with clear UI states.

---

## 9. Open Questions (decide in Week 1)

| # | Question | Default if undecided |
|---|----------|----------------------|
| 1 | OpenAI or Gemini primary? | OpenAI mini-class model |
| 2 | Cookie auth vs localStorage JWT? | Bearer token MVP; httpOnly later |
| 3 | Multi-recruiter invites? | Single recruiter per company in MVP |
| 4 | Applicant sees AI score? | No (recruiter-only) |

---

## 10. Sign-off Checklist

- [ ] Scope locked for 4-week MVP  
- [ ] P0 requirements agreed  
- [ ] Non-goals agreed  
- [ ] Security tenancy rule agreed  
- [ ] Friday demo ritual agreed  
