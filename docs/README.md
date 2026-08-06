# AI-Powered ATS — Documentation Hub

## Active delivery

| Doc | Purpose |
|-----|---------|
| **[EPICS.md](./EPICS.md)** | Living epic tracker — complete epic → update docs → one commit |
| [../CHANGELOG.md](../CHANGELOG.md) | Shipped milestones |

## Choose Your Path

| Audience | Go to |
|----------|--------|
| **Company product (recommended)** | [`pro/README.md`](./pro/README.md) — strategy, PRD, TDD, RACI, SLOs, risks, security, delivery |
| **Non-technical** | [13](./13-system-design-simple.md) → [14](./14-database-model-simple.md) → [15](./15-development-timeline-4weeks-5days.md) |
| **Implementation reference** | Docs 01–12 below (schema, API, UI, AI, env) |

> If `/docs/pro` and casual docs disagree, **follow `/docs/pro`**.

---

## Professional Suite (`docs/pro`)

| Doc | Purpose |
|-----|---------|
| [01 Product Strategy](./pro/01-product-strategy.md) | Vision, OKRs, positioning |
| [02 PRD](./pro/02-prd.md) | Requirements & acceptance |
| [03 Technical Design](./pro/03-technical-design.md) | Senior architecture |
| [03 ADRs](./pro/03-adrs.md) | Architecture decisions |
| [04 Org & RACI](./pro/04-org-raci.md) | Team & ownership |
| [05 NFR & SLOs](./pro/05-nfr-slos.md) | Quality bars |
| [06 Quality & Tests](./pro/06-quality-test-plan.md) | Test strategy |
| [07 Risk Register](./pro/07-risk-register.md) | Risks & cut list |
| [08 Security](./pro/08-security-compliance.md) | PII & release gates |
| [09 Delivery Plan Pro](./pro/09-delivery-plan-pro.md) | 4×5 execution plan |
| [10 Ops Runbooks](./pro/10-ops-runbooks.md) | Pilot operations |
| [11 Engineering Standards](./pro/11-engineering-standards.md) | Coding standards |

---

## Implementation Reference Index

| # | Document | Purpose |
|---|----------|---------|
| 01 | [System Overview](./01-system-overview.md) | Scope & journeys |
| 02 | [Architecture](./02-architecture.md) | Component diagram |
| 03 | [Folder Structure](./03-folder-structure.md) | Repo layout |
| 04 | [Database Schema](./04-database-schema.md) | Mongo models |
| 05 | [Auth & Roles](./05-auth-and-roles.md) | JWT & permissions |
| 06 | [API Specification](./06-api-specification.md) | REST contracts |
| 07 | [Frontend Design](./07-frontend-design.md) | Screens & RQ |
| 08 | [AI Resume Pipeline](./08-ai-resume-pipeline.md) | Parse + LLM |
| 09 | [Integrations](./09-integrations.md) | S3, Multer, email |
| 10 | [Security](./10-security.md) | Baseline security |
| 11 | [Environment & Config](./11-environment-and-config.md) | Env vars |
| 12 | [Implementation Roadmap](./12-implementation-roadmap.md) | Feature checklist |
| 13 | [System Design Simple](./13-system-design-simple.md) | Non-technical system |
| 14 | [Database Model Simple](./14-database-model-simple.md) | Non-technical data |
| 15 | [Timeline 4×5](./15-development-timeline-4weeks-5days.md) | Mon–Fri calendar |

---

## Tech Stack (Locked)

- **Frontend:** React.js, React Query, Material-UI (MUI)
- **Backend:** Node.js, Express.js
- **Optional:** Python microservice for heavy text processing
- **Database:** MongoDB
- **AI:** OpenAI API or Gemini API
- **Files:** Multer + pdf-parse + AWS S3
- **Email:** Nodemailer

## Project Goal (One Line)

Build a company-ready HR platform where tenants post jobs, candidates apply with private resumes, and AI ranks applicants by semantic match — safely and demonstrably within 4 weeks.
