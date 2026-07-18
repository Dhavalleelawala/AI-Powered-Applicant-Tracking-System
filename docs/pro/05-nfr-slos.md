# Non-Functional Requirements & SLOs

Company-product quality bars. If we miss these, the MVP is not “done.”

---

## 1. SLOs (Service Level Objectives)

| Service aspect | SLO (MVP) | Notes |
|----------------|-----------|-------|
| API availability | 99.5% monthly | Staging tracked; prod from launch |
| Job list latency | p95 < 500ms | Excludes cold start |
| Apply API latency | p95 < 2s | Excludes AI |
| AI completion time | p95 < 120s | Async; UI must show pending |
| Signed URL misuse window | ≤ 10 minutes expiry | Prefer 3–5 min |
| Auth login | p95 < 400ms | |

---

## 2. Reliability

| Requirement | Implementation expectation |
|-------------|----------------------------|
| Apply is durable without AI | DB write succeeds; AI queued |
| Stage update durable without email | Email best-effort |
| Retries for AI | Max 3 with backoff |
| No silent data loss | Failed AI retains application |

---

## 3. Security & Privacy NFRs

| ID | Requirement |
|----|-------------|
| NFR-S1 | Passwords hashed (bcrypt) |
| NFR-S2 | TLS in staging/prod |
| NFR-S3 | Private object storage for resumes |
| NFR-S4 | Cross-tenant access impossible via API |
| NFR-S5 | Secrets not in git |
| NFR-S6 | Rate limits on auth and uploads |
| NFR-S7 | PII not written to application logs |
| NFR-S8 | Least-privilege cloud IAM |

---

## 4. Performance & Scale Assumptions (MVP)

Design for pilot scale first:

| Dimension | Assumption |
|-----------|------------|
| Companies | 1–20 pilot tenants |
| Open jobs / company | ≤ 50 |
| Applications / job | ≤ 1,000 |
| Concurrent recruiters | low tens |
| Resume size | ≤ 5 MB |

Above this, revisit indexes, queueing, and search.

---

## 5. Usability NFRs

- Every primary view: loading, empty, error  
- Destructive actions confirmed (archive, reject)  
- Score never shown without supporting summary for recruiters  
- Forms validate before submit  

---

## 6. Maintainability NFRs

- Layered server structure (`routes → controllers → services → models`)  
- `.env.example` complete  
- API errors use stable codes  
- README runbooks for local + deploy  

---

## 7. Observability MVP

Minimum:

1. `GET /api/health`  
2. Request logging with request id  
3. Log fields: `companyId`, `userId`, `jobId`, `applicationId`, `aiStatus` where relevant  
4. Alert manually via log scan in MVP; automated alerts post-MVP  

---

## 8. Compliance Posture (honest)

MVP is **not** claiming full SOC2/GDPR certification.

We will implement **good-faith controls**:

- Access control  
- Encryption in transit  
- Limited retention thinking (document policy)  
- Ability to delete/archive candidate data (manual process OK in MVP)

Formal compliance can be a Phase-2 program.
