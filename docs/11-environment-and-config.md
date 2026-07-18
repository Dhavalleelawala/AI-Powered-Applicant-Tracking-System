# 11 — Environment & Configuration

## 11.1 Server `.env.example`

Copy to `server/.env` and fill values.

```bash
# App
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/ats
# or Atlas:
# MONGODB_URI=mongodb+srv://USER:PASS@cluster/ats

# Auth
JWT_SECRET=replace_with_long_random_string
JWT_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
S3_BUCKET=ats-resumes-dev

# Uploads
MAX_RESUME_SIZE_MB=5

# AI
AI_PROVIDER=openai
OPENAI_API_KEY=
# GEMINI_API_KEY=
AI_MODEL=gpt-4o-mini

# Optional Python AI service
# AI_SERVICE_URL=http://localhost:8000
# AI_SERVICE_TOKEN=

# Email (Nodemailer)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM="ATS <noreply@example.com>"

# Feature flags
SEND_REJECTION_EMAILS=false
```

## 11.2 Client `.env.example`

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

## 11.3 Config Module Pattern (Server)

Load env once in `src/config/index.js`:

- Validate required vars at boot (fail fast)
- Export typed config object used by services

Required in production:

- `MONGODB_URI`
- `JWT_SECRET`
- `S3_BUCKET` + AWS creds (or role)
- LLM key for chosen provider
- `CLIENT_URL`

## 11.4 Local Dev Prerequisites

1. Node.js 18+ LTS  
2. MongoDB local or Atlas  
3. AWS account (or LocalStack/MinIO for offline S3 mock — optional)  
4. OpenAI or Gemini API key  
5. SMTP test inbox (Mailtrap / Ethereal)

## 11.5 Suggested npm Scripts

**Root (optional workspaces)**

```json
{
  "scripts": {
    "dev:server": "npm run dev --prefix server",
    "dev:client": "npm run dev --prefix client",
    "dev": "concurrently \"npm:dev:server\" \"npm:dev:client\""
  }
}
```

**Server**

- `dev` — nodemon
- `start` — node src/server.js
- `seed` — seed demo data

**Client**

- `dev` — Vite
- `build` — production build
- `preview` — preview build

## 11.6 Seed Data Checklist

Create script `server/src/scripts/seed.js`:

- Company: Demo Corp  
- Recruiter: `recruiter@demo.com` / `Password123`  
- Applicant: `applicant@demo.com` / `Password123`  
- 2 open jobs with rich descriptions + skills  

Document credentials in root README (dev only).

## 11.7 CORS

Allow `CLIENT_URL` only.  
Allow credentials if cookie auth used.

## 11.8 Boot Sequence

1. Load config  
2. Connect MongoDB  
3. Init S3 client  
4. Mount routes  
5. Start HTTP server  
6. (Optional) start AI worker interval  

Health check must not require auth.
