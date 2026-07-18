# 10 — Security Design

## 10.1 Threat Model (MVP)

| Threat | Mitigation |
|--------|------------|
| Stolen passwords | bcrypt hashing |
| Unauthorized API access | JWT + role checks + ownership checks |
| Public resume leakage | Private S3 + signed URLs |
| Malicious file upload | MIME/extension/size checks |
| XSS stealing tokens | Prefer httpOnly cookies; sanitize display text |
| Prompt injection | Delimit untrusted resume text; JSON-only output |
| IDOR (guess ObjectIds) | Always verify company/applicant ownership |
| Secrets in repo | `.env` gitignored; use `.env.example` only |

## 10.2 API Hardening Checklist

- [ ] `helmet` middleware
- [ ] CORS whitelist frontend origin(s)
- [ ] Rate limit `/api/auth/login` and register
- [ ] Rate limit upload endpoints
- [ ] Validate all bodies (Joi/Zod/express-validator)
- [ ] Central error handler (no stack traces in production responses)
- [ ] Disable `x-powered-by`

## 10.3 Upload Security

- Allowlist MIME + extension
- Max size 5MB
- Do not serve resumes from API static folder
- Sanitize filenames before using in S3 key (still prefer generated names)
- Scan with antivirus later (post-MVP)

## 10.4 S3 Security Rules

- Block public access
- No public-read ACL
- Short signed URL TTL (3–10 minutes)
- IAM least privilege
- Separate buckets per environment

## 10.5 Data Access Rules

| Data | Who |
|------|-----|
| Job (open) | Public read |
| Job (archived) | Owning recruiters |
| Application | Applicant owner OR company recruiter |
| Resume file | Company recruiter only |
| AI analysis | Company recruiter (applicant view optional) |
| User password hash | Never in any response |

## 10.6 PII Handling

Resumes contain personal data (phone, address, email).

Developer requirements:

- Encrypt in transit (HTTPS)
- Limit who can download
- Avoid logging resume text
- Provide delete/archive path for compliance later (GDPR-style)

## 10.7 Secrets Management

Local: `.env`  
Production: host secret manager / dashboard env vars  

Rotate:

- JWT secret
- SMTP credentials
- Cloud keys
- LLM keys

## 10.8 Secure Defaults for Deployment

- `NODE_ENV=production`
- Strong `JWT_SECRET` (32+ random bytes)
- Mongo user with least privileges
- HTTPS only at edge
