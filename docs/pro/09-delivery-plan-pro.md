# Professional Delivery Plan — 4 Weeks × 5 Days

**Perspective:** Staff/senior engineer planning a company MVP  
**Calendar:** Mon–Fri only (20 working days)  
**Constraint:** Quality gates beat feature vanity  

This supersedes casual timelines when conflicts arise. Companion day grid: [`../15-development-timeline-4weeks-5days.md`](../15-development-timeline-4weeks-5days.md)

---

## 1. Delivery Philosophy

1. **Vertical slices weekly** — each Friday demos working user value.  
2. **Risk-first scheduling** — tenancy, S3, AI uncertainty early enough to recover.  
3. **Integration daily** — no week-long branch isolation.  
4. **Pre-approved cuts** — see risk register.  
5. **Production shape early** — staging from Week 2, not “deploy magic on last day.”

---

## 2. Milestone Map

| Milestone | When | Exit criteria |
|-----------|------|---------------|
| M1 Foundations | Week 1 Fri | Auth + jobs E2E on local |
| M2 Intake Pipeline | Week 2 Fri | Apply + S3 + stage transitions |
| M3 AI Ranking | Week 3 Fri | Scores persisted + visible |
| M4 Pilot Ready | Week 4 Fri | Filters + email + secured deploy |

---

## 3. Estimation Reality (senior view)

Nominal plan assumes **1 strong full-stack or 2 engineers (FE+BE)**.

| Week | Planned focus | Contingency buffer |
|------|---------------|--------------------|
| 1 | Identity + Jobs | Fri afternoon polish only |
| 2 | S3 + Apply + Pipeline | DOCX can slip |
| 3 | AI | Highest uncertainty — protect Wed–Thu |
| 4 | Ranking + Email + Hardening | Protect Thu–Fri; freeze features Wed EOD |

**Important:** If AI slips, ship apply+pipeline+manual shortlist UI first; AI is valuable but must not block pilot intake.

---

## 4. Week Plans (execution)

### Week 1 — Trustworthy foundations

| Day | Engineering focus | Quality gate |
|-----|-------------------|--------------|
| Mon | Repo, CI lint skeleton, Mongo, health | Health green |
| Tue | Schemas/indexes/seed | Seed reproducible |
| Wed | Auth + roles | Tenancy fields on token |
| Thu | Job APIs + ownership | Cross-company edit denied |
| Fri | Board + dashboard UI | Demo M1 |

**Staffing tip:** Backend leads Mon–Thu; Frontend starts shell Wed, hard UI Thu–Fri.

### Week 2 — Company-grade intake

| Day | Engineering focus | Quality gate |
|-----|-------------------|--------------|
| Mon | S3 private bucket + IAM | Public access blocked |
| Tue | Multer + signed URL | Invalid file rejected |
| Wed | Apply API + unique constraint | 409 on duplicate |
| Thu | Applicant UI/history | UAT apply path |
| Fri | Pipeline board + history | Demo M2 |

**Start staging deploy this week** (even if partial).

### Week 3 — AI as a product feature (not a science project)

| Day | Engineering focus | Quality gate |
|-----|-------------------|--------------|
| Mon | PDF extract + status model | Empty PDF → failed cleanly |
| Tue | Prompt contract + provider adapter | Golden resume fixture |
| Wed | Async worker + persistence | Apply returns before AI done |
| Thu | Failure/retry + recruiter visibility | Failed doesn’t delete app |
| Fri | Polish + reanalyze optional | Demo M3 |

**Tech Lead owns prompt + schema validation.**

### Week 4 — Pilot readiness

| Day | Engineering focus | Quality gate |
|-----|-------------------|--------------|
| Mon | Ranking dashboard | Sort correct |
| Tue | Filters | Combined filters correct |
| Wed | Email templates + triggers | Mailtrap proof |
| Thu | Security gate + E2E + bug burn-down | Release gate pass |
| Fri | Prod deploy + pilot script + docs | Demo M4 |

**Feature freeze:** Wednesday end of day.

---

## 5. Definition of Pilot-Ready

A company can pilot when:

1. Separate staging and production configs exist  
2. Seeded demo tenant + empty pilot tenant supported  
3. Security gate checklist passed  
4. Support runbook exists (reset user, re-run AI, resend email)  
5. Known limitations documented (PDF-only, AI assistive, etc.)

---

## 6. Post-MVP Roadmap (do not build now, plan now)

### Phase 1.1 (2–4 weeks after MVP)

- Multi-recruiter invites + roles (Admin/Recruiter)  
- Stronger audit export  
- SES production email  
- AI cost dashboard / quotas  

### Phase 1.2

- Applicant experience upgrades  
- Saved filters / shortlist folders  
- Better parsing for DOCX/OCR  

### Phase 2

- SSO  
- Workflow automation  
- Analytics funnel  
- Worker queue (Redis/BullMQ) standard  

---

## 7. Governance Artifacts (must remain updated)

| Artifact | Location |
|----------|----------|
| Product strategy | `01-product-strategy.md` |
| PRD | `02-prd.md` |
| TDD | `03-technical-design.md` |
| ADRs | `03-adrs.md` |
| RACI | `04-org-raci.md` |
| NFR/SLO | `05-nfr-slos.md` |
| Test plan | `06-quality-test-plan.md` |
| Risks | `07-risk-register.md` |
| Security | `08-security-compliance.md` |
| This plan | `09-delivery-plan-pro.md` |
| Runbooks | `10-ops-runbooks.md` |

---

## 8. Final Senior Recommendation

Ship a **narrow, trustworthy hiring MVP** in 4 weeks:

- Excellent tenancy + document security  
- Solid job/apply/pipeline  
- Good-enough AI ranking with honest UI  
- Deployed and demoable  

Refuse shiny work that increases leak risk or destroys the Friday milestone train.
