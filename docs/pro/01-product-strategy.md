# Product Strategy & Vision

**Product:** AI-Powered Applicant Tracking System (ATS)  
**Audience:** Company leadership, product, engineering  
**Author stance:** Senior engineering / product architecture (10+ years delivery experience)  
**Classification:** Internal — Company Product

---

## 1. Executive Summary

We are building a **B2B multi-tenant hiring platform** that reduces time-to-shortlist by automating resume intake, secure document storage, and AI-assisted semantic ranking against job descriptions.

This is not a student demo. It is a **company product** with:

- Clear tenant isolation (Company A never sees Company B data)
- Measurable business outcomes
- Production-grade security for candidate PII
- A delivery plan that protects quality under a 4-week MVP constraint
- An explicit roadmap after MVP (what we will *not* fake in v1)

**North-star outcome:**  
Recruiters spend time interviewing the right people — not manually opening hundreds of PDFs.

---

## 2. Problem Statement

| Pain | Business cost |
|------|----------------|
| Manual resume screening | High recruiter hours; slow hiring |
| Keyword-only filtering | Misses good candidates; false negatives |
| Scattered email + Drive folders | Lost resumes; weak audit trail |
| Inconsistent evaluation | Bias + uneven hiring quality |
| No pipeline visibility | Leadership cannot forecast hiring |

---

## 3. Product Positioning

| Dimension | Decision |
|-----------|----------|
| **Category** | AI-assisted ATS (SMB → mid-market first) |
| **Primary buyer** | HR / Talent Acquisition lead |
| **Primary user** | Recruiter |
| **Secondary user** | Job applicant |
| **Differentiator** | Semantic AI ranking tied to each JD + clean pipeline UX |
| **Not competing with (yet)** | Greenhouse/Lever full enterprise suite |

**Positioning statement:**  
For growing companies that hire continuously, our ATS is the hiring workspace that stores applications securely and ranks candidates by true job fit — so recruiters shortlist in minutes, not days.

---

## 4. Goals & Non-Goals

### Goals (MVP — 4 weeks)

1. Multi-role product: Recruiter + Applicant
2. Job lifecycle: create, edit, archive, public board
3. Application intake with private resume storage (S3)
4. Pipeline stages with audit history
5. AI match score + skills + summary per application
6. Ranking filters for shortlisting
7. Transactional emails on key stage changes
8. Deployed staging/production with basic observability

### Non-Goals (explicitly deferred)

- Full enterprise SSO / SCIM
- Calendar scheduling / video interviews
- Complex workflow builders
- LinkedIn import
- Bias certification dashboards
- Marketplace / agency multi-brand portals
- Mobile native apps

Senior rule: **Deferred does not mean denied** — it means protected scope.

---

## 5. Success Metrics (OKRs style)

### Product KPIs (post-launch measurement)

| KPI | Target (first 90 days after launch) |
|-----|--------------------------------------|
| Time from apply → AI score available | < 2 minutes p95 |
| Recruiter time to build interview shortlist | < 15 minutes per job (qualitative + survey) |
| % applications with completed AI analysis | ≥ 95% |
| Critical security incidents | 0 (PII exposure) |
| Uptime (API) | ≥ 99.5% monthly |

### Delivery KPIs (during build)

| KPI | Target |
|-----|--------|
| Friday demo pass rate | 4/4 weeks |
| P0 bugs open at week-end | 0 |
| Scope change without trade-off | Not allowed |

---

## 6. Users & Jobs-To-Be-Done

### Recruiter JTBD

“When I have too many applicants, help me **trustably rank** who to interview first.”

### Applicant JTBD

“When I apply, make it **simple and transparent** — upload resume, track status.”

### Hiring Manager (future)

“Show me a shortlist with evidence, not a spreadsheet dump.”

---

## 7. Product Principles (decision filters)

1. **Tenant safety over features** — isolation bugs beat feature delays.
2. **Async AI, sync UX** — never block apply on LLM latency.
3. **Evidence over magic** — always show summary/skills, not only a score.
4. **Boring technology where it matters** — reliability > novelty.
5. **One happy path first** — PDF + one LLM provider before edge-case perfection.

---

## 8. Monetization Direction (company product)

MVP can ship without billing, but architecture must not block:

| Plan idea | Entitlements (future) |
|-----------|------------------------|
| Starter | 1 company, limited open jobs, AI quota |
| Growth | More seats, higher AI quota, email templates |
| Business | Audit exports, SSO later, priority support |

**Engineering implication now:** every query is company-scoped (`companyId`).

---

## 9. Competitive Reality Check

| Capability | Must have in MVP | Nice later |
|------------|------------------|------------|
| Job + apply + pipeline | Yes | |
| Secure resume storage | Yes | |
| AI ranking | Yes | Explainability upgrades |
| Email notifications | Yes | Sequence campaigns |
| Analytics dashboards | Basic counts | Full funnel BI |
| Extensions / ATS sync | No | Yes |

---

## 10. Leadership Summary

We will ship a **credible MVP in 4 weeks (20 working days)** that a real company can pilot with real candidate data — with strict tenancy, private documents, and AI shortlisting.

Anything that threatens security, tenancy, or demo reliability is cut first.  
Anything that is only “impressive in a slide” is deferred.
