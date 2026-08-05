# Rolefit

**AI-assisted Applicant Tracking System** — post jobs, collect applications, store resumes securely, rank candidates by job fit, and move them through a hiring pipeline.

Built with the **MERN** stack (MongoDB, Express, React, Node) as a company-style MVP product.

---

## Product

| Role | What they do |
|------|----------------|
| Recruiter | Create jobs, review ranked applicants, run Kanban pipeline |
| Applicant | Browse jobs, apply with resume, track status |

**Differentiator:** semantic AI ranking tied to each job description (with a local heuristic fallback when no LLM key is set).

---

## Quick start

### 1. Backend

```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```

API: `http://localhost:5000`  
Health: `GET /api/health`  
Smoke checks: `npm run smoke` (from `server/`)

### 2. Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173`

### 3. Or both from root

```bash
npm install
npm run seed
npm run dev
```

---

## Demo accounts (after seed)

| Role | Email | Password |
|------|--------|----------|
| Recruiter | `recruiter@demo.com` | `Password123` |
| Applicant | `applicant@demo.com` | `Password123` |

Seed also creates **Demo Corp**, **2 open jobs**, and **1 sample application**.

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React (Vite), React Query, MUI (Rolefit theme), React Router |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Files | Local uploads by default; AWS S3 when configured |
| AI | OpenAI / Gemini adapter, or heuristic scorer |
| Email | Nodemailer (or console fallback) |

---

## Docker (optional)

Requires Docker Desktop. From the repo root:

```bash
docker compose up --build
```

- Web UI: http://localhost:8080  
- API: http://localhost:5000  
- MongoDB: localhost:27017  

Set `JWT_SECRET`, `FILE_TOKEN_SECRET`, and optional `OPENAI_API_KEY` in your environment before starting.

---

## Docs

- Product / delivery: [`docs/pro/`](./docs/pro/README.md)
- Implementation: [`docs/`](./docs/README.md)
- Day-by-day plan: [`docs/15-development-timeline-4weeks-5days.md`](./docs/15-development-timeline-4weeks-5days.md)

---

## License

Zaalima Development — Confidential (per project brief).
