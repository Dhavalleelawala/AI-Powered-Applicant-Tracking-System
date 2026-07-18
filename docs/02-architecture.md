# 02 — System Architecture

## 2.1 Architecture Style

**Modular monolith (Node/Express) + React SPA + MongoDB + AWS S3 + LLM API**, with an **optional Python microservice** for heavy NLP.

```
┌─────────────────┐     HTTPS/JSON      ┌──────────────────────────────┐
│  React + MUI    │ ◄─────────────────► │  Node.js / Express API       │
│  React Query    │                     │  Auth │ Jobs │ Apps │ AI     │
└─────────────────┘                     └──────────────┬───────────────┘
                                                       │
                    ┌──────────────────────────────────┼──────────────────┐
                    │                                  │                  │
                    ▼                                  ▼                  ▼
             ┌────────────┐                    ┌─────────────┐    ┌──────────────┐
             │  MongoDB   │                    │   AWS S3    │    │ OpenAI/Gemini│
             └────────────┘                    └─────────────┘    └──────────────┘
                                                       ▲
                                                       │ (optional)
                                              ┌────────┴────────┐
                                              │ Python service  │
                                              │ text / ranking  │
                                              └─────────────────┘
```

## 2.2 Components

### A. Frontend (React)

- SPA served separately (Vite/CRA) or via static hosting.
- Talks only to Express REST API.
- React Query for server state (jobs, applications, rankings).
- MUI for layout, forms, tables, Kanban-like boards.

### B. Backend API (Express)

Responsibilities:

- Authentication & authorization
- Job and application CRUD
- Multipart upload handling (Multer → S3)
- Triggering AI analysis
- Email dispatch
- Serving signed URLs for resume download (recruiters only)

Suggested internal layers:

```
routes → controllers → services → models / external clients
```

### C. Database (MongoDB)

Stores users, companies, jobs, applications, AI results, email logs (optional).

### D. Object Storage (S3)

Stores resume binaries. DB stores only metadata + S3 key.

### E. AI Provider

Stateless HTTP calls. Never store API keys in frontend.

### F. Optional Python Microservice

Use if:

- Parsing/DOCX/NLP is CPU-heavy
- Team wants isolated AI experiments

Contract example:

`POST /analyze` `{ resumeText, jobDescription, requiredSkills }` → `{ score, skills, summary, gaps }`

Express remains the **orchestrator**; Python is a worker.

## 2.3 Request Flows

### Flow 1 — Create Job (Recruiter)

```
UI → POST /api/jobs → Auth middleware (recruiter)
  → JobService.create → MongoDB Jobs
  → 201 Job JSON
```

### Flow 2 — Apply with Resume

```
UI → POST /api/jobs/:jobId/applications (multipart)
  → Auth (applicant)
  → Validate job is open + unique application
  → Multer temp → S3 upload
  → Create Application (status=applied, aiStatus=pending)
  → Enqueue AI job (async)
  → 201 Application JSON (AI may still be pending)
```

### Flow 3 — AI Analysis (Async)

```
Worker/Service:
  Download/read text (from stored extractedText or re-parse)
  → pdf-parse (if PDF) / docx parser
  → LLM prompt with job description
  → Validate JSON response
  → Update Application.aiAnalysis + aiStatus=completed
  → On failure: aiStatus=failed + error message
```

### Flow 4 — Ranking Dashboard

```
UI → GET /api/jobs/:jobId/applications?sort=score&minScore=70&skill=React
  → Auth (recruiter owns job)
  → Query Applications with filters/indexes
  → Return list with AI fields
```

### Flow 5 — Pipeline Status Change + Email

```
UI → PATCH /api/applications/:id/status { stage: "interview" }
  → Auth (recruiter)
  → Update stage + timestamp
  → EmailService.sendInterviewInvite
  → Log email status
```

## 2.4 Sync vs Async

| Operation | Mode | Why |
|-----------|------|-----|
| Auth, job CRUD, list apps | Sync | Fast, user-blocking |
| Resume upload to S3 | Sync (request) | User needs confirmation |
| PDF text extract + LLM | **Async preferred** | Can take 5–60s |
| Emails | Async preferred | Avoid slowing API |

**MVP async options (pick one):**

1. **Inline fire-and-forget** after response (simplest; use carefully)
2. **Mongo-based job queue** (`AnalysisJobs` collection + polling worker)
3. **BullMQ + Redis** (best if Redis available)

Recommendation for Week 3: start with (1) or (2); upgrade later.

## 2.5 Deployment Topology (Suggested)

| Service | Hosting examples |
|---------|------------------|
| Frontend | Vercel / Netlify / S3+CloudFront |
| API | Render / Railway / AWS ECS / EC2 |
| MongoDB | MongoDB Atlas |
| S3 | AWS |
| Python (optional) | Same VPC / separate Render service |

Environment separation: `development`, `staging`, `production`.

## 2.6 Error Handling Strategy

- API returns consistent JSON:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Resume must be PDF or DOCX",
    "details": []
  }
}
```

- HTTP codes: `400` validation, `401` unauthenticated, `403` forbidden, `404` not found, `409` conflict (duplicate apply), `429` rate limit, `500` server.

- AI failures must **not** delete the application.

## 2.7 Logging & Observability (MVP)

- Request logger (morgan or pino)
- Log: userId, jobId, applicationId, aiStatus transitions
- Never log full resume text or API keys
- Health endpoint: `GET /api/health`

## 2.8 Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| API style | REST | Simple for SPA + clear docs |
| Auth | JWT (access + optional refresh) | Stateless API |
| File storage | S3 private | Scalable, secure |
| AI | OpenAI or Gemini via adapter | Swap provider without rewriting controllers |
| UI kit | MUI | Fast dashboard/Kanban delivery |
| Data fetching | React Query | Caching, retries, mutations |

## 2.9 Sequence Diagram — Apply + AI

```
Applicant          API             S3           Worker/LLM         MongoDB
   |                |              |               |                  |
   |-- multipart -->|              |               |                  |
   |                |-- put object>|               |                  |
   |                |-- create app ---------------------------------->|
   |<-- 201 --------|              |               |                  |
   |                |-- enqueue -->|-------------->|                  |
   |                |              |  extract+LLM  |                  |
   |                |              |               |-- update AI ---->|
```
