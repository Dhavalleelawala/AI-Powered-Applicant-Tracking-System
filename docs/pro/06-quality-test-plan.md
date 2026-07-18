# Quality Strategy & Test Plan

Senior delivery rule: **features without tests for tenancy and intake will fail in production.**

---

## 1. Quality Goals

1. Zero cross-tenant data leaks  
2. Apply path never corrupts on AI failure  
3. Critical user journeys pass on staging before Friday demos  
4. Security regressions caught before deploy  

---

## 2. Test Pyramid (MVP-practical)

```text
        /\
       /E2E\         few: full hiring journey
      /------\
     / API    \      many: authz, jobs, apply, stage
    /----------\
   / Unit       \    services: scoring clamp, validators
  /--------------\
```

Do **not** over-invest in brittle UI screenshot tests in week 1–4.

---

## 3. Mandatory Test Cases

### Auth & tenancy (P0)

| Case | Expected |
|------|----------|
| Applicant cannot create job | 403 |
| Recruiter A cannot read Recruiter B applications | 403/empty |
| Applicant cannot read another applicant’s applications | 403 |
| Invalid token | 401 |
| Duplicate email register | 409/400 |

### Jobs (P0)

| Case | Expected |
|------|----------|
| Public list shows only open | archived hidden |
| Archive removes from public board | pass |
| Non-owner edit | 403 |

### Apply + files (P0)

| Case | Expected |
|------|----------|
| PDF upload success | 201 + S3 object |
| EXE/upload invalid MIME | 400 |
| Oversize file | 413 |
| Double apply | 409 |
| Apply to archived job | 400 |

### Pipeline (P0)

| Case | Expected |
|------|----------|
| Stage transition persists | history appended |
| Email failure still keeps stage | pass |

### AI (P0)

| Case | Expected |
|------|----------|
| Valid PDF reaches completed with 0–100 score | pass |
| LLM invalid JSON → failed status, app remains | pass |
| Ranking sort by score | desc order |
| minScore filter | correct subset |

---

## 4. Manual UAT Scripts (Friday demos)

### Script W1

Register recruiter → create job → appear on board → applicant register → view job

### Script W2

Apply with PDF → see history → recruiter moves to Interview → signed resume open

### Script W3

New apply → wait for AI → score/summary visible → force fail path shows failed badge

### Script W4

Filter score ≥ 70 → trigger interview email → staging deploy smoke

---

## 5. Definition of Ready / Done

### Ready (before coding a ticket)

- User story clear  
- API contract known  
- Auth rules known  
- Edge cases listed  

### Done

- Code merged  
- P0 tests pass  
- Demo path works on staging (from Week 2)  
- No secrets committed  

---

## 6. Bug Severity

| Sev | Meaning | SLA to fix during MVP |
|-----|---------|------------------------|
| P0 | Data leak, apply broken, deploy down | Same day |
| P1 | AI broken for all, pipeline blocked | ≤ 1 day |
| P2 | UI polish, non-blocking email issues | Backlog / Week 4 buffer |
| P3 | Cosmetic | After MVP |

---

## 7. Tooling Suggestion

| Layer | Tool |
|-------|------|
| API tests | Jest/Vitest + Supertest |
| Unit | Jest/Vitest |
| E2E (optional Week 4) | Playwright subset |
| Static | ESLint |

If time-constrained: prioritize **Supertest tenancy suite** over everything else.
