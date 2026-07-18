# 09 — Integrations (S3, Multer, Email)

## 9.1 AWS S3 — Resume Storage

### Why S3

- Resumes are binary and can grow large
- Keep MongoDB for metadata only
- Signed URLs for secure temporary access

### Bucket Setup

1. Create bucket e.g. `ats-resumes-<env>`
2. **Block all public access** = ON
3. Enable default encryption (SSE-S3 or SSE-KMS)
4. CORS: only if browser uploads directly (MVP can upload via API only — simpler)

### IAM User / Role Permissions (least privilege)

Allow:

- `s3:PutObject`
- `s3:GetObject`
- `s3:DeleteObject` (optional)

Limit `Resource` to `arn:aws:s3:::bucket-name/resumes/*`

### Object Key Convention

```
resumes/{companyId}/{jobId}/{applicantId}/{timestamp}-{sanitizedFileName}
```

Example:

```
resumes/665c/665j/665a/1721300000-leela-resume.pdf
```

### Server Upload Flow (Recommended MVP)

1. Multer stores file in **memory** (`memoryStorage`) or temp disk
2. `storageService.uploadResume(buffer, key, mimeType)`
3. Save `s3Key`, `s3Bucket`, metadata on Application
4. Delete temp file if disk used

### Signed Download URL

```js
getSignedUrl('getObject', { Bucket, Key, Expires: 300 })
```

Only for authorized recruiters.

### Lifecycle (Optional)

- Transition old resumes to cheaper storage after N days
- Or expire rejected applications’ files after policy period

---

## 9.2 Multer Configuration

```js
// Conceptual rules
limits: { fileSize: 5 * 1024 * 1024 } // 5MB
fileFilter: allow pdf + docx only
field name: 'resume'
```

Allowed extensions: `.pdf`, `.docx`  
Reject `.doc` (legacy) unless explicitly supported.

Error mapping:

- fileFilter fail → 400
- size exceed → 413

---

## 9.3 Nodemailer — Status Emails

### Transport

Use SMTP (Gmail App Password, SendGrid, Mailgun, SES SMTP, etc.)

Env:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`

### When to Send

| Stage transition | Email template |
|------------------|----------------|
| → `interview` | Interview invitation |
| → `offered` | Offer / congratulations notice |
| → `rejected` | Polite rejection (optional toggle) |
| Application received | Confirmation to applicant (optional) |

### Interview Email Content (Minimum)

- Candidate name
- Job title
- Company name
- Next steps / “We will contact you with schedule”
- Recruiter contact email (optional)

### Implementation Tips

- Send email **after** DB stage update succeeds
- Failures should not roll back stage (log in `email_logs`)
- Use HTML + text versions
- Escape user-provided strings to avoid HTML injection

### Example service API

```js
emailService.sendStageUpdate({ to, applicantName, jobTitle, stage, companyName })
```

---

## 9.4 LLM Provider Integration

See [08-ai-resume-pipeline.md](./08-ai-resume-pipeline.md).

Env:

- `OPENAI_API_KEY` or `GEMINI_API_KEY`
- `AI_PROVIDER`
- `AI_MODEL`

Never expose keys to React.

---

## 9.5 Optional Python Service Integration

- Base URL: `AI_SERVICE_URL`
- Auth header: `x-api-key: AI_SERVICE_TOKEN`
- Timeout: 60s
- Circuit-break: on repeated failures mark `aiStatus=failed`

---

## 9.6 Integration Test Checklist

- [ ] Upload PDF → object visible in S3 prefix
- [ ] Signed URL downloads correct file
- [ ] Unauthorized user cannot get resume URL
- [ ] Interview stage triggers email in dev (Ethereal/Mailtrap OK)
- [ ] Wrong MIME rejected before S3 put
