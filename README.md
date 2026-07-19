# AI-Powered Applicant Tracking System

**Company product:** AI-assisted ATS for posting jobs, collecting applications, securing resumes, and ranking candidates by semantic job fit.

This repository is planned as a **production-minded company MVP** (4 weeks × 5 working days), not a toy prototype.

---

## Start Here

### Leadership / Product

1. [Product Strategy](./docs/pro/01-product-strategy.md)
2. [PRD](./docs/pro/02-prd.md)
3. [Professional Delivery Plan](./docs/pro/09-delivery-plan-pro.md)

### Engineering

1. [Pro Docs Index](./docs/pro/README.md)
2. [Technical Design](./docs/pro/03-technical-design.md)
3. [ADRs](./docs/pro/03-adrs.md)
4. [API Spec](./docs/06-api-specification.md)
5. [Day-by-day Timeline](./docs/15-development-timeline-4weeks-5days.md)

### Non-technical

1. [System Design Simple](./docs/13-system-design-simple.md)
2. [Database Model Simple](./docs/14-database-model-simple.md)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, React Query, Material-UI |
| Backend | Node.js, Express.js |
| Optional AI worker | Python microservice |
| Database | MongoDB |
| Files | Multer, AWS S3 |
| Parsing / AI | pdf-parse, OpenAI or Gemini |
| Email | Nodemailer |

---

## Product Principles (short)

1. Tenant safety over features  
2. Async AI, sync apply UX  
3. Evidence beside every AI score  
4. Boring reliable architecture for MVP  
5. Pre-approved scope cuts beat missed launch  

---

## Status

Professional planning docs are in [`docs/pro/`](./docs/pro/README.md).  
Implementation references are in [`docs/`](./docs/README.md).  
Application code (`client/`, `server/`) is built according to the delivery plan.

---

## Local development (server)

```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```

Health check: `GET http://localhost:5000/api/health`

### Demo seed accounts (dev only)

| Role | Email | Password |
|------|--------|----------|
| Recruiter | `recruiter@demo.com` | `Password123` |
| Applicant | `applicant@demo.com` | `Password123` |

Seed also creates **Demo Corp**, **2 open jobs**, and **1 sample application**.  
Re-running `npm run seed` replaces previous demo data for a reproducible local DB.

---

## License

Zaalima Development — Confidential (per project brief).
