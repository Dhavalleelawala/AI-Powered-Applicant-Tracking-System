# Security & Compliance Baseline (Company Product)

This is the minimum bar before handling real candidate resumes.

---

## 1. Data Classification

| Data | Class | Handling |
|------|-------|----------|
| Candidate resume file | Sensitive PII | Private S3; signed URLs; recruiter-only |
| Extracted resume text | Sensitive PII | DB restricted; never public API lists |
| Email, phone | PII | Role-scoped access |
| AI score/summary | Internal confidential | Recruiter-only MVP |
| Job descriptions | Internal | Public if job is open |
| Passwords | Secrets | bcrypt; never logged |

---

## 2. Security Control Checklist

### Identity

- [ ] bcrypt cost ≥ 10  
- [ ] JWT secret ≥ 32 random bytes  
- [ ] Password policy enforced  
- [ ] Rate limit login/register  

### Authorization

- [ ] Role middleware on all protected routes  
- [ ] Ownership checks in service layer  
- [ ] Automated cross-tenant denial tests  

### Documents

- [ ] S3 Block Public Access ON  
- [ ] No public-read ACL  
- [ ] Signed URL TTL ≤ 10 min  
- [ ] MIME/extension/size validation  
- [ ] Company-prefixed object keys  

### Application security

- [ ] helmet enabled  
- [ ] CORS allowlist  
- [ ] Central error handler (no stack in prod)  
- [ ] Dependency audit before release  

### Secrets

- [ ] `.env` gitignored  
- [ ] Different credentials per environment  
- [ ] LLM/AWS keys never shipped to frontend  

---

## 3. Threat Scenarios (must pass mentally + by test)

1. Applicant guesses application ObjectId of another user  
2. Recruiter from Tenant A calls Tenant B job applications URL  
3. User uploads malicious extension renamed as PDF  
4. Resume contains “ignore previous instructions” text  
5. Signed URL shared externally after expiry  

---

## 4. Privacy Commitments (pilot-ready language)

We will:

- Store resumes privately  
- Limit access to authorized company users  
- Avoid logging resume content  
- Provide a process to delete a candidate’s application on request (manual OK in MVP)

We will not claim:

- Full SOC 2 Type II on day one  
- Perfect bias-free AI  

AI is an assistive ranking tool; humans make hiring decisions.

---

## 5. Retention (recommended policy draft)

| Artifact | Recommendation |
|----------|----------------|
| Active applications | Retain while job active + N days |
| Archived jobs | Retain for audit window (e.g., 12 months) |
| Email logs | 90 days |
| AI raw provider payloads | Do not store long-term |

Finalize legally with company counsel before large pilots.

---

## 6. Release Security Gate (Week 4 Thu)

Release blocked if any fail:

1. Public S3 object can be opened without auth  
2. Cross-tenant read succeeds  
3. Secrets found in repo  
4. Apply path loses data when AI fails  
