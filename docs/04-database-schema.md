# 04 — Database Schema (MongoDB)

Use **Mongoose** (recommended) for schemas, validation, and indexes.

## 4.1 Entity Relationship (Logical)

```
Company 1───* User(recruiter)
User(applicant) 1───* Application *───1 Job
Job *───1 User(recruiter) / Company
Application 1───1 ResumeMetadata (embedded)
Application 1───1 AiAnalysis (embedded)
```

**MVP simplification:** embed `company` fields on recruiter User OR keep a `Company` collection. Below includes a light `Company` model.

## 4.2 Collection: `companies`

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `name` | String | required |
| `website` | String | optional |
| `createdAt` | Date | |
| `updatedAt` | Date | |

```js
// Example schema sketch
{
  name: { type: String, required: true, trim: true },
  website: { type: String, default: "" }
}
```

## 4.3 Collection: `users`

One collection with `role` discriminator-style field.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `name` | String | required |
| `email` | String | required, unique, lowercase |
| `passwordHash` | String | bcrypt hash; never return in API |
| `role` | String | enum: `recruiter` \| `applicant` |
| `companyId` | ObjectId | required if recruiter; ref `companies` |
| `phone` | String | optional |
| `headline` | String | optional (applicant) |
| `isActive` | Boolean | default true |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Indexes**

- unique: `{ email: 1 }`
- `{ role: 1, companyId: 1 }`

## 4.4 Collection: `jobs`

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `title` | String | required |
| `description` | String | required (used for AI matching) |
| `requiredSkills` | [String] | normalized lowercase recommended |
| `experienceYearsMin` | Number | default 0 |
| `experienceYearsMax` | Number | optional |
| `location` | String | e.g. Remote / city |
| `employmentType` | String | `full-time` \| `part-time` \| `contract` \| `internship` |
| `status` | String | `open` \| `archived` \| `draft` |
| `recruiterId` | ObjectId | ref users |
| `companyId` | ObjectId | ref companies |
| `salaryRange` | { min, max, currency } | optional |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Indexes**

- `{ status: 1, createdAt: -1 }` (job board)
- `{ companyId: 1, status: 1 }`
- `{ recruiterId: 1 }`

**Business rules**

- Only owning company recruiter can edit/archive.
- Public board lists only `status: "open"`.
- Archiving sets `status: "archived"` (soft delete). Do not hard-delete if applications exist.

## 4.5 Collection: `applications`

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `jobId` | ObjectId | required, ref jobs |
| `applicantId` | ObjectId | required, ref users |
| `companyId` | ObjectId | denormalized for easy auth queries |
| `coverLetter` | String | optional |
| `stage` | String | `applied` \| `interview` \| `offered` \| `rejected` |
| `resume` | Object | embedded (see below) |
| `aiAnalysis` | Object | embedded (see below) |
| `aiStatus` | String | `pending` \| `processing` \| `completed` \| `failed` |
| `aiError` | String | optional |
| `stageHistory` | [Object] | audit trail |
| `createdAt` | Date | |
| `updatedAt` | Date | |

### Embedded: `resume`

| Field | Type | Notes |
|-------|------|-------|
| `originalFileName` | String | |
| `mimeType` | String | |
| `sizeBytes` | Number | |
| `s3Key` | String | required |
| `s3Bucket` | String | |
| `extractedText` | String | may be large; consider separate collection if huge |
| `uploadedAt` | Date | |

### Embedded: `aiAnalysis`

| Field | Type | Notes |
|-------|------|-------|
| `matchScore` | Number | 0–100 |
| `skillsMatched` | [String] | |
| `skillsMissing` | [String] | |
| `experienceYearsEstimated` | Number | optional |
| `summary` | String | short recruiter-facing summary |
| `strengths` | [String] | |
| `gaps` | [String] | |
| `model` | String | e.g. `gpt-4o-mini` / `gemini-1.5-flash` |
| `analyzedAt` | Date | |
| `rawResponse` | Mixed | optional; avoid storing forever in prod |

### Embedded: `stageHistory[]`

| Field | Type |
|-------|------|
| `from` | String |
| `to` | String |
| `changedBy` | ObjectId |
| `changedAt` | Date |
| `note` | String |

**Indexes**

- unique compound: `{ jobId: 1, applicantId: 1 }` — one apply per job
- `{ jobId: 1, "aiAnalysis.matchScore": -1 }`
- `{ applicantId: 1, createdAt: -1 }`
- `{ companyId: 1, stage: 1 }`
- `{ jobId: 1, stage: 1 }`

## 4.6 Collection: `analysis_jobs` (Optional queue)

Use if you implement Mongo polling worker.

| Field | Type | Notes |
|-------|------|-------|
| `applicationId` | ObjectId | |
| `status` | String | `queued` \| `running` \| `done` \| `failed` |
| `attempts` | Number | |
| `lastError` | String | |
| `createdAt` | Date | |
| `updatedAt` | Date | |

Index: `{ status: 1, createdAt: 1 }`

## 4.7 Collection: `email_logs` (Optional)

| Field | Type |
|-------|------|
| `applicationId` | ObjectId |
| `to` | String |
| `template` | String |
| `status` | `sent` \| `failed` |
| `providerMessageId` | String |
| `error` | String |
| `createdAt` | Date |

## 4.8 Example Documents

### User (recruiter)

```json
{
  "_id": "665r...",
  "name": "Asha Mehta",
  "email": "asha@acme.com",
  "passwordHash": "$2b$10$...",
  "role": "recruiter",
  "companyId": "665c...",
  "isActive": true
}
```

### Job

```json
{
  "title": "Full Stack Developer",
  "description": "Build React + Node apps... MongoDB experience required...",
  "requiredSkills": ["react", "nodejs", "mongodb"],
  "experienceYearsMin": 2,
  "location": "Remote",
  "employmentType": "full-time",
  "status": "open",
  "recruiterId": "665r...",
  "companyId": "665c..."
}
```

### Application (after AI)

```json
{
  "jobId": "665j...",
  "applicantId": "665a...",
  "companyId": "665c...",
  "stage": "applied",
  "aiStatus": "completed",
  "resume": {
    "originalFileName": "leela-resume.pdf",
    "mimeType": "application/pdf",
    "s3Key": "resumes/665c/665j/665a/171000.pdf",
    "extractedText": "..."
  },
  "aiAnalysis": {
    "matchScore": 86,
    "skillsMatched": ["react", "nodejs"],
    "skillsMissing": ["mongodb"],
    "summary": "Strong frontend/backend overlap; limited Mongo evidence.",
    "strengths": ["React production experience"],
    "gaps": ["No clear MongoDB projects"],
    "model": "gpt-4o-mini",
    "analyzedAt": "2026-07-18T10:00:00.000Z"
  }
}
```

## 4.9 Data Retention Notes

- Prefer soft-archive for jobs.
- Resume text may contain PII — restrict access to owning company recruiters.
- Consider deleting `extractedText` after analysis if storage is a concern (keep S3 file).

## 4.10 Migration / Seed Tips

Seed script should create:

1. One company  
2. One recruiter  
3. One applicant  
4. Two open jobs  
5. One sample application (optional)

This unlocks UI testing before real uploads.
