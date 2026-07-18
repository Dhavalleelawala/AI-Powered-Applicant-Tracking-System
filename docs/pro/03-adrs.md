# Architecture Decision Records (ADRs)

Lightweight ADRs so the team does not re-argue settled decisions.

Status key: **Accepted** | Proposed | Superseded

---

## ADR-001: Modular monolith over microservices

- **Status:** Accepted  
- **Context:** 4-week MVP, small team, need reliability.  
- **Decision:** Ship one Express API with internal modules. Optional Python AI worker later.  
- **Consequences:** Faster delivery; must keep module boundaries clean to avoid a future “ball of mud.”

---

## ADR-002: Multi-tenant via `companyId` on documents

- **Status:** Accepted  
- **Context:** Company product requires isolation.  
- **Decision:** Every job/application carries `companyId`; recruiter auth token includes `companyId`; services enforce match.  
- **Consequences:** Simple and effective for MVP; later may add memberships/roles table.

---

## ADR-003: JWT bearer auth for MVP

- **Status:** Accepted  
- **Context:** SPA + API separation.  
- **Decision:** Access tokens via `Authorization: Bearer`. Refresh/httpOnly cookies can follow.  
- **Consequences:** XSS risk if token in localStorage — mitigate with careful rendering and later cookie migration.

---

## ADR-004: Private S3 + signed URLs (no public resumes)

- **Status:** Accepted  
- **Context:** Resumes are sensitive PII.  
- **Decision:** Block public access; recruiters receive time-limited signed URLs only.  
- **Consequences:** Slightly more code; mandatory for company trust.

---

## ADR-005: Asynchronous AI analysis

- **Status:** Accepted  
- **Context:** LLM calls are slow/flaky/costly.  
- **Decision:** Application create returns immediately with `aiStatus=pending`; worker updates later.  
- **Consequences:** UI must poll or refresh; better UX and resilience.

---

## ADR-006: Single LLM provider adapter in MVP

- **Status:** Accepted  
- **Context:** Supporting two providers doubles test matrix.  
- **Decision:** Implement provider adapter interface; enable one provider via env (`AI_PROVIDER`).  
- **Consequences:** Easy switch later without controller rewrites.

---

## ADR-007: Embed AI result on Application document

- **Status:** Accepted  
- **Context:** 1:1 relationship; read path is ranking per job.  
- **Decision:** Embed `aiAnalysis` on `applications` for MVP.  
- **Consequences:** Simple queries; if analysis versions grow, extract collection later.

---

## ADR-008: Soft-archive jobs instead of hard delete

- **Status:** Accepted  
- **Context:** Historical applications must remain meaningful.  
- **Decision:** `status=archived`; retain records.  
- **Consequences:** Board queries must filter `open`.

---

## ADR-009: Email is best-effort side effect

- **Status:** Accepted  
- **Context:** SMTP failures are common in early environments.  
- **Decision:** Stage update commits first; email failures are logged, not transactional with stage.  
- **Consequences:** Possible stage without email — operable and honest.

---

## ADR-010: PDF is P0; DOCX is P1

- **Status:** Accepted  
- **Context:** Timeboxed MVP.  
- **Decision:** Guarantee PDF parsing; DOCX best-effort if schedule allows by Week 3 Tue.  
- **Consequences:** Clear support messaging in UI.

---

## ADR-011: Recruiter-only AI scores in MVP

- **Status:** Accepted  
- **Context:** Showing scores to candidates creates support/dispute load.  
- **Decision:** Applicants see stage, not AI score.  
- **Consequences:** Can revisit with careful UX later.

---

## ADR-012: MongoDB as system of record

- **Status:** Accepted  
- **Context:** Flexible documents fit jobs/applications/AI payloads.  
- **Decision:** MongoDB + Mongoose.  
- **Consequences:** Require discipline on indexes and validation schemas.
