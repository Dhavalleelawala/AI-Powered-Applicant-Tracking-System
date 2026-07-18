# Technical Design Document (TDD)

**Product:** AI-Powered ATS (Company Product)  
**Level:** Senior engineering design  
**Related:** PRD `02-prd.md`, ADRs `03-adrs.md`

---

## 1. Design Goals

1. **Tenant-safe by construction** — every sensitive query includes `companyId` from the auth context, never from the client blindly.
2. **Fail-soft AI** — intake path never depends on LLM availability.
3. **Replaceable AI provider** — adapter interface; no provider lock-in in controllers.
4. **Operationally boring** — modular monolith first; extract Python worker only if needed.
5. **Observable** — every application has correlatable IDs in logs.

---

## 2. Recommended Architecture (MVP)

**Pattern:** Modular monolith (Node/Express) + React SPA + MongoDB + S3 + LLM API

```text
                    ┌──────────────┐
                    │  React SPA   │
                    │  MUI + RQ    │
                    └──────┬───────┘
                           │ HTTPS / JSON
                    ┌──────▼───────┐
                    │ API Gateway  │  (Express app)
                    │ AuthZ edge   │
                    └──────┬───────┘
           ┌───────────────┼────────────────┐
           ▼               ▼                ▼
     ┌──────────┐   ┌────────────┐   ┌────────────┐
     │ MongoDB  │   │  AWS S3    │   │ LLM Vendor │
     └──────────┘   └────────────┘   └────────────┘
                           ▲
                    ┌──────┴──────┐
                    │ Email SMTP  │
                    └─────────────┘
```

### Why not microservices on day 1?

With a 4-week MVP and a small team, distributed systems tax (network failures, auth propagation, local dev complexity) usually destroys schedule. A **modular monolith** with clean service boundaries gives speed now and extraction options later (`ai-service`, `notification-service`).

---

## 3. Bounded Contexts (logical modules)

| Module | Responsibility | Owns data |
|--------|----------------|-----------|
| Identity | Auth, roles, company membership | users, companies |
| Jobs | Job lifecycle + public listing | jobs |
| Applications | Apply, pipeline, history | applications |
| Documents | Upload, signed URLs | S3 keys on applications |
| Ranking AI | Parse + LLM + persistence | ai fields on applications |
| Notifications | Email dispatch + logs | email_logs |

**Rule:** Controllers stay thin; business rules live in services; models stay persistence-focused.

---

## 4. Tenancy Model

```text
Company
  ├── Users (recruiters)
  ├── Jobs
  └── Applications (denormalized companyId)
```

### Hard rules

1. `req.user.companyId` is the authorization source for recruiter actions.
2. Applicant access is by `applicantId === req.user.id`.
3. Cross-tenant access attempts return **404** (not 403) for existence hiding where appropriate, or 403 consistently — pick one policy and stick to it. **Recommendation:** 403 for authenticated wrong-tenant; 404 for unknown IDs.
4. Unique application constraint: `(jobId, applicantId)`.
5. S3 keys must include `companyId` prefix for operational isolation and lifecycle policies.

---

## 5. Critical Sequence Designs

### 5.1 Apply (sync path)

1. Authenticate applicant  
2. Validate job is `open`  
3. Reject duplicate application  
4. Validate file type/size  
5. Upload to S3  
6. Create application (`stage=applied`, `aiStatus=pending`)  
7. Enqueue AI job  
8. Return 201 quickly  

### 5.2 AI analysis (async path)

1. Mark `processing`  
2. Extract text  
3. Call LLM with structured output contract  
4. Validate schema; clamp score  
5. Persist analysis; mark `completed`  
6. On failure: `failed` + error code; retry ≤ 3  

### 5.3 Stage change + email

1. Authorize company ownership  
2. Update stage + append history  
3. Commit DB  
4. Send email best-effort  
5. Log email result  

---

## 6. Data Design Highlights

See also consumer docs in `/docs/04-database-schema.md`.

### Senior additions for company product

| Topic | Decision |
|-------|----------|
| Soft deletes | Jobs archived, not hard-deleted if applications exist |
| PII minimization | Don’t return `extractedText` in list APIs |
| Auditability | `stageHistory[]` mandatory on transitions |
| AI provenance | Store `model`, `analyzedAt` |
| Idempotency | Unique index prevents double apply |

### Index strategy (must-have)

- `applications(jobId, applicantId)` unique  
- `applications(jobId, aiAnalysis.matchScore desc)`  
- `jobs(companyId, status)`  
- `users(email)` unique  

---

## 7. API Design Principles

1. Version prefix readiness: `/api/...` now; `/api/v1/...` when external consumers appear  
2. Stable error envelope (`code`, `message`, `details`)  
3. Pagination on all list endpoints  
4. Never accept `companyId` from body for authorization  
5. Multipart only for upload endpoints  

---

## 8. Frontend Architecture

- Route guards by role  
- React Query as server-state source of truth  
- Poll AI status only while pending/processing  
- Optimistic UI optional for stage moves; reconcile on error  
- Recruiter desktop-first; applicant mobile-friendly  

---

## 9. AI Design Constraints (production thinking)

| Risk | Control |
|------|---------|
| Cost blowups | Cap resume chars; cheap model; reanalyze rate limit |
| Hallucination | Prompt: no invented employers; show evidence fields |
| Prompt injection | Delimit resume; JSON schema validation |
| Latency | Async only |
| Vendor outage | `aiStatus=failed` + retry |

**Score trust UX:** always show summary + skills beside score. A naked number creates false confidence.

---

## 10. Security Architecture (MVP baseline)

- bcrypt passwords  
- JWT with strong secret  
- helmet, CORS allowlist, rate limits on auth/upload  
- private S3 + signed GET URLs (3–10 min)  
- server-side MIME/extension/size checks  
- no resume text in logs  
- secrets only in env/secret manager  

---

## 11. Scalability Path (post-MVP)

| When you see… | Do this |
|---------------|---------|
| AI CPU blocking Node | Extract Python/worker service + queue |
| Email volume growth | Move to SES + queue |
| Large tenants | Compound indexes + pagination hardening |
| Many recruiters/company | memberships collection + RBAC roles |
| Need search | OpenSearch/Atlas Search on skills/summary |

Do **not** pre-build these in week 1–4 unless forced.

---

## 12. Environments

| Env | Purpose |
|-----|---------|
| local | Developer machines |
| staging | Demo + QA; production-like config |
| production | Real pilot data |

Separate S3 buckets and Mongo databases per env — non-negotiable.

---

## 13. Definition of Engineering Done

A feature is done when:

1. Meets PRD acceptance  
2. Has authorization tests for happy + cross-tenant denial  
3. Has empty/loading/error UI  
4. Emits useful logs with entity IDs  
5. Does not store secrets in repo  
6. Documented in API spec if endpoint changed  

---

## 14. Build Order (dependency-respecting)

```text
Identity → Jobs → Documents/S3 → Applications/Pipeline → AI → Ranking UI → Email → Hardening/Deploy
```

Any other order creates rework.
