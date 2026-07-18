# Organization, Roles & RACI

How a company should staff and run this product build.

---

## 1. Recommended Team Shapes

### Shape A — Lean company squad (recommended)

| Role | Count | Responsibility |
|------|-------|----------------|
| Tech Lead / Full-stack | 1 | Architecture, reviews, hardest paths (tenancy, AI, S3) |
| Backend engineer | 1 | APIs, DB, integrations |
| Frontend engineer | 1 | React/MUI flows, UX states |
| Product owner (part-time) | 0.25–0.5 | Scope lock, Friday demos, acceptance |
| QA (part-time) | 0.25 | Test scripts from Week 2 onward |

### Shape B — Solo / very small

One strong full-stack + product advisor. Must follow the day plan strictly and cut P1/P2 early.

### Shape C — Agency delivery

Add Engineering Manager overlay for risk reporting; keep same technical ADRs.

---

## 2. RACI (MVP)

R = Responsible, A = Accountable, C = Consulted, I = Informed

| Workstream | Tech Lead | Backend | Frontend | Product | QA |
|------------|-----------|---------|----------|---------|-----|
| Scope lock | C | I | I | **A/R** | I |
| Architecture / ADRs | **A/R** | C | C | I | I |
| Auth & tenancy | A | **R** | C | I | C |
| Job APIs | C | **R** | C | I | C |
| Job Board UI | C | C | **R** | C | C |
| S3 uploads | A | **R** | C | I | C |
| Apply + pipeline UI | C | C | **R** | C | C |
| AI pipeline | **A/R** | R | C | I | C |
| Ranking UI | C | C | **R** | C | C |
| Email | C | **R** | I | C | C |
| Security review | **A/R** | R | C | I | C |
| Deploy | **A/R** | R | R | I | C |
| UAT / Friday demo | C | C | C | **A/R** | R |

---

## 3. Cadence (professional delivery rhythm)

| Event | When | Purpose |
|-------|------|---------|
| Daily standup | 10–15 min | Done / today / blockers |
| Mid-week checkpoint | Wed 30 min | Scope risk, cut decisions |
| Friday demo | Fri afternoon | Accept week exit criteria |
| Retro | Fri 20 min | One improvement next week |
| ADR update | As needed | Record decisions, avoid thrash |

---

## 4. Communication Rules

1. **No silent scope adds.** Every new ask needs a cut.  
2. **Blockers > 4 hours** escalate to Tech Lead same day.  
3. **Security issues** escalate immediately (P0).  
4. Demo environment must stay green after Week 2.

---

## 5. Ownership by Module

| Module | Primary owner |
|--------|---------------|
| Identity/Auth | Backend |
| Jobs | Backend + Frontend |
| Documents/S3 | Backend |
| Applications/Pipeline | Backend + Frontend |
| AI Ranking | Tech Lead + Backend |
| Notifications | Backend |
| Design system / MUI theme | Frontend |
| Release train | Tech Lead |

---

## 6. Hiring / Skill Bar (if staffing)

| Role | Must demonstrate |
|------|------------------|
| Backend | Express, Mongo indexes, authz bugs awareness, S3 |
| Frontend | React Query cache discipline, accessible forms, role guards |
| Tech Lead | Threat modeling basics, cut-scope judgment, integration design |

---

## 7. Vendor / External Owners

| Vendor | Internal owner |
|--------|----------------|
| AWS | Backend / Tech Lead |
| MongoDB Atlas | Backend / Tech Lead |
| OpenAI/Gemini | Tech Lead |
| SMTP (SES/Mailgun/etc.) | Backend |
| Hosting (Render/Vercel/etc.) | Tech Lead |
