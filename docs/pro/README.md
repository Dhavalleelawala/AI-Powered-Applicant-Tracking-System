# Company Product Documentation (Professional Suite)

These documents are written for **building and running a real company product**, not a classroom sketch.  
Perspective: senior/staff engineering + product delivery discipline.

If a casual doc in `/docs` conflicts with `/docs/pro`, **prefer `/docs/pro`.**

---

## Who Should Read What

| Role | Start here |
|------|------------|
| Founder / leadership | [01 Product Strategy](./01-product-strategy.md) → [09 Delivery Plan](./09-delivery-plan-pro.md) |
| Product owner | [02 PRD](./02-prd.md) → [07 Risks](./07-risk-register.md) |
| Tech lead | [03 Technical Design](./03-technical-design.md) → [03 ADRs](./03-adrs.md) → [09 Delivery](./09-delivery-plan-pro.md) |
| Engineers | [11 Engineering Standards](./11-engineering-standards.md) → TDD → [../06-api-specification.md](../06-api-specification.md) |
| QA | [06 Quality & Test Plan](./06-quality-test-plan.md) |
| Security / ops | [08 Security](./08-security-compliance.md) → [10 Runbooks](./10-ops-runbooks.md) |
| Non-technical stakeholders | [../13-system-design-simple.md](../13-system-design-simple.md) |

---

## Document Index

| # | Document | Purpose |
|---|----------|---------|
| 01 | [Product Strategy](./01-product-strategy.md) | Vision, positioning, OKRs, principles |
| 02 | [PRD](./02-prd.md) | Functional requirements & acceptance |
| 03a | [Technical Design](./03-technical-design.md) | Senior architecture & tenancy model |
| 03b | [ADRs](./03-adrs.md) | Locked architecture decisions |
| 04 | [Org & RACI](./04-org-raci.md) | Team shape, ownership, cadence |
| 05 | [NFR & SLOs](./05-nfr-slos.md) | Performance, reliability, security bars |
| 06 | [Quality & Test Plan](./06-quality-test-plan.md) | Mandatory tests & UAT scripts |
| 07 | [Risk Register](./07-risk-register.md) | Risks, mitigations, pre-approved cuts |
| 08 | [Security & Compliance](./08-security-compliance.md) | PII controls & release gates |
| 09 | [Delivery Plan Pro](./09-delivery-plan-pro.md) | 4×5 week professional execution plan |
| 10 | [Ops Runbooks](./10-ops-runbooks.md) | Pilot operations procedures |
| 11 | [Engineering Standards](./11-engineering-standards.md) | Coding/API/git/AI standards |

---

## Company MVP Truths (Read First)

1. **Tenant isolation is a feature.** Without it, nothing else matters.  
2. **AI is assistive.** Humans hire; the product ranks and organizes.  
3. **Apply must work even when AI/email fail.**  
4. **Private resumes only.** No public buckets.  
5. **Freeze scope to protect launch.** Cuts are planned, not improvised panic.

---

## Related Implementation Docs

Detailed schemas/APIs/UI remain in parent `/docs` (01–15). Use them as implementation references after reading this professional suite.
