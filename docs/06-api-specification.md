# 06 — API Specification (REST)

Base URL: `/api`  
Content-Type: `application/json` (except multipart uploads)  
Auth header: `Authorization: Bearer <token>`

## 6.1 Standard Response Shapes

### Success

```json
{
  "success": true,
  "data": {}
}
```

### List success

```json
{
  "success": true,
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not own this job"
  }
}
```

---

## 6.2 Health

### `GET /api/health`

**Auth:** none  

```json
{ "success": true, "data": { "status": "ok", "uptime": 123 } }
```

---

## 6.3 Auth

### `POST /api/auth/register/applicant`

**Body**

```json
{
  "name": "Leela",
  "email": "leela@example.com",
  "password": "Secret123"
}
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "id": "...", "name": "Leela", "email": "leela@example.com", "role": "applicant" }
  }
}
```

### `POST /api/auth/register/recruiter`

**Body**

```json
{
  "name": "Asha Mehta",
  "email": "asha@acme.com",
  "password": "Secret123",
  "companyName": "Acme Hiring",
  "website": "https://acme.com"
}
```

**Response `201`:** token + user (`role: recruiter`, `companyId`) + company

### `POST /api/auth/login`

**Body:** `{ "email", "password" }`  
**Response `200`:** token + user  
**Errors:** `401` invalid credentials

### `GET /api/auth/me`

**Auth:** required  
**Response:** current user profile

---

## 6.4 Jobs

### `GET /api/jobs`

Public job board.

**Query:** `q`, `location`, `employmentType`, `page`, `limit`  
**Filter:** `status=open` only for public  
**Auth:** optional

### `GET /api/jobs/:jobId`

Public job detail if open; recruiter may view own archived.

### `GET /api/recruiter/jobs`

**Auth:** recruiter  
Returns all jobs for `companyId` (open + archived + draft).

### `POST /api/jobs`

**Auth:** recruiter  

**Body**

```json
{
  "title": "Full Stack Developer",
  "description": "Long JD text used for AI...",
  "requiredSkills": ["React", "Node.js", "MongoDB"],
  "experienceYearsMin": 2,
  "experienceYearsMax": 5,
  "location": "Remote",
  "employmentType": "full-time",
  "status": "open",
  "salaryRange": { "min": 800000, "max": 1500000, "currency": "INR" }
}
```

**Server sets:** `recruiterId`, `companyId` from token.

### `PUT /api/jobs/:jobId` or `PATCH /api/jobs/:jobId`

**Auth:** recruiter + ownership  
Partial or full update of job fields.

### `POST /api/jobs/:jobId/archive`

**Auth:** recruiter + ownership  
Sets `status: "archived"`.

---

## 6.5 Applications

### `POST /api/jobs/:jobId/applications`

**Auth:** applicant  
**Content-Type:** `multipart/form-data`

| Field | Type |
|-------|------|
| `resume` | File (PDF/DOCX) required |
| `coverLetter` | text optional |

**Rules**

- Job must be `open`
- Unique `(jobId, applicantId)`
- Max file size: 5MB (configurable)
- MIME allowlist: `application/pdf`, DOCX MIME types

**Response `201`**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "jobId": "...",
    "stage": "applied",
    "aiStatus": "pending"
  }
}
```

### `GET /api/applicant/applications`

**Auth:** applicant  
List own applications with job title, stage, aiStatus, createdAt.

### `GET /api/jobs/:jobId/applications`

**Auth:** recruiter + job ownership  

**Query filters**

| Param | Meaning |
|-------|---------|
| `stage` | applied / interview / offered / rejected |
| `minScore` | number 0–100 |
| `skill` | skill string |
| `minExperience` | years |
| `sort` | `score_desc` (default) \| `newest` |
| `page`, `limit` | pagination |

**Response item includes:** applicant name/email, stage, aiAnalysis, aiStatus, createdAt  
**Does not include:** full `extractedText` by default

### `GET /api/applications/:applicationId`

**Auth:** owner applicant OR owning recruiter  
Detail view including AI summary.

### `PATCH /api/applications/:applicationId/status`

**Auth:** recruiter + ownership  

**Body**

```json
{
  "stage": "interview",
  "note": "Strong React match"
}
```

**Side effect:** send email when moving to `interview` / `offered` / `rejected` (configurable).

### `GET /api/applications/:applicationId/resume-url`

**Auth:** recruiter + ownership  
Returns short-lived **signed S3 URL**.

```json
{
  "success": true,
  "data": { "url": "https://...", "expiresInSeconds": 300 }
}
```

### `POST /api/applications/:applicationId/reanalyze`

**Auth:** recruiter  
Re-queue AI analysis (admin/debug / failed retries).

---

## 6.6 Status Codes Cheat Sheet

| Code | When |
|------|------|
| 200 | OK |
| 201 | Created |
| 400 | Validation / bad file |
| 401 | Missing/invalid token |
| 403 | Wrong role / not owner |
| 404 | Not found |
| 409 | Duplicate application |
| 413 | File too large |
| 500 | Unexpected server error |

---

## 6.7 Validation Rules (Server)

- Email format + unique
- Job title min length 3
- Description required for AI quality (min ~50 chars recommended)
- `stage` enum only
- `matchScore` always clamped 0–100 when saving AI output

---

## 6.8 Idempotency / Duplicates

Applying twice to same job → `409` with message:  
`"You have already applied to this job"`.
