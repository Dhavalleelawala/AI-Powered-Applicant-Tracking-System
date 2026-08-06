# 16 — Cloud deploy checklist (Atlas + Render)

Use this to take Rolefit live. Repo already includes `Dockerfile`, `render.yaml`, and `SEED_ON_EMPTY`.

## Prerequisites

- [ ] GitHub repo pushed (`main`)
- [ ] MongoDB Atlas account
- [ ] Render account (linked to the same GitHub)

## A. MongoDB Atlas

1. Create a free **M0** cluster.
2. **Database Access** → add a DB user (save password).
3. **Network Access** → allow `0.0.0.0/0` (or Render outbound IPs if you restrict later).
4. **Connect** → Drivers → copy URI, e.g.  
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/ats?retryWrites=true&w=majority`
5. Replace `<password>` and set DB name to `ats`.

## B. Local preflight (optional but recommended)

```bash
cd server
# temporarily put Atlas URI + strong secrets in .env (do not commit)
npm run preflight
# or force Atlas-shaped URI check:
REQUIRE_ATLAS=1 npm run preflight
```

Generate secrets:

```bash
openssl rand -hex 32   # JWT_SECRET
openssl rand -hex 32   # FILE_TOKEN_SECRET
```

## C. Render Blueprint

1. Render Dashboard → **New** → **Blueprint**.
2. Select `Dhavalleelawala/AI-Powered-Applicant-Tracking-System` (or your fork) · branch `main`.
3. Confirm `render.yaml` is detected.
4. Set **sync: false** vars when prompted:
   - `MONGODB_URI` — Atlas URI from step A
   - `CLIENT_URL` — leave blank until first deploy, then set to the service URL (e.g. `https://rolefit-xxxx.onrender.com`)
5. Deploy. Wait for Docker build (first build can take several minutes).

## D. After first deploy

1. Open `https://YOUR-SERVICE.onrender.com/api/health`  
   Expect: `{ "success": true, "data": { "status": "ok", "db": "connected", ... } }`
2. Set `CLIENT_URL` to that exact origin (no trailing slash) and **redeploy** if CORS/auth redirects look wrong.
3. With `SEED_ON_EMPTY=true` (default in `render.yaml`), empty DBs auto-load demos:
   - Recruiter: `recruiter@demo.com` / `Password123`
   - Applicant: `applicant@demo.com` / `Password123`
4. Open the site root — SPA should load; browse `/jobs`.

## E. Smoke from your machine

```bash
cd server
SMOKE_BASE_URL=https://YOUR-SERVICE.onrender.com/api npm run smoke
```

## F. Production notes

| Topic | Guidance |
|-------|----------|
| Resumes | Free Render disk is ephemeral → set `STORAGE_DRIVER=s3` + AWS vars for durable files |
| Cold starts | Free plan sleeps; first request may be slow |
| Secrets | Never commit `.env`; rotate JWT/file tokens if leaked |
| Custom domain | Add in Render → update `CLIENT_URL` / `CLIENT_URLS` |

## Blocked without you

Live cutover needs **your** Atlas URI and Render login. Once those exist, paste the public service URL here and we can verify health + smoke remotely.
