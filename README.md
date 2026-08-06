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
# set strong secrets first
export JWT_SECRET="$(openssl rand -hex 32)"
export FILE_TOKEN_SECRET="$(openssl rand -hex 32)"

docker compose up --build
```

App (API + UI): http://localhost:5000  
MongoDB: localhost:27017  

Optional: set `OPENAI_API_KEY` for LLM ranking (heuristic fallback works without it).

---

## Deploy on Render

1. Create a free **MongoDB Atlas** cluster and copy the connection string.
2. In Render, create a new **Blueprint** from this repo (`render.yaml`), or a Docker web service using the root `Dockerfile`.
3. Set env vars:
   - `MONGODB_URI` — Atlas URI
   - `CLIENT_URL` — your Render URL, e.g. `https://rolefit.onrender.com`
   - `JWT_SECRET` / `FILE_TOKEN_SECRET` — strong random values (Blueprint can generate)
   - `SEED_ON_EMPTY=true` — (default in `render.yaml`) loads demo accounts when the DB is empty
4. After deploy, open `/api/health`. Demo login works immediately when seed ran:
   - `recruiter@demo.com` / `Password123`
   - `applicant@demo.com` / `Password123`

To re-seed later from your machine:

```bash
cd server && MONGODB_URI="your-atlas-uri" npm run seed
```

The production image serves the React app and API together (`SERVE_CLIENT=true`, `VITE_API_BASE_URL=/api`).

**Note:** Free Render disks are ephemeral — prefer `STORAGE_DRIVER=s3` for durable resume files in production.

---

## Docs

- **Epics (active work):** [`docs/EPICS.md`](./docs/EPICS.md) — one completed epic → one commit
- **Changelog:** [CHANGELOG.md](./CHANGELOG.md)
- Product / delivery: [`docs/pro/`](./docs/pro/README.md)
- Implementation: [`docs/`](./docs/README.md)
- Day-by-day plan: [`docs/15-development-timeline-4weeks-5days.md`](./docs/15-development-timeline-4weeks-5days.md)

---

## License

Zaalima Development — Confidential (per project brief).
