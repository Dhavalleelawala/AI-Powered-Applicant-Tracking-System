# Operations Runbooks (MVP)

Short procedures for a company pilot. Keep this updated at launch.

---

## 1. Local Boot

1. Start MongoDB / ensure Atlas URI  
2. Copy `server/.env.example` → `.env` and fill secrets  
3. `npm install` in `server` and `client`  
4. Run seed script  
5. Start API + client  
6. Verify `GET /api/health`

**Demo users (seed):** document exact emails/passwords in private password manager — not in public docs if real.

---

## 2. Create a Pilot Company

1. Register recruiter with real company name  
2. Create 1–3 jobs with complete JDs (AI quality depends on JD quality)  
3. Share public job links with candidates  
4. Verify applications appear under recruiter company only  

---

## 3. AI Stuck in Pending

1. Check API logs for applicationId  
2. Confirm LLM key/quota  
3. Confirm extractedText exists  
4. Call reanalyze endpoint if enabled  
5. If parse failed, ask candidate for digital PDF (not scanned image)  

---

## 4. Resume Download Fails

1. Verify recruiter belongs to same companyId as application  
2. Check S3 key exists  
3. Verify AWS credentials and bucket region  
4. Issue new signed URL (old may be expired)  

---

## 5. Email Not Received

1. Confirm stage actually changed  
2. Check `email_logs` / server logs  
3. Check SMTP credentials and spam folder  
4. Resend by toggling stage carefully or add admin resend later  

Remember: stage update should still stand even if email failed.

---

## 6. Suspected Cross-Tenant Access

1. Treat as P0  
2. Capture request path, userId, companyId, target IDs  
3. Disable affected accounts if confirmed  
4. Patch authorization  
5. Rotate secrets if token logic involved  
6. Notify product/leadership  

---

## 7. Deploy Checklist

- [ ] env vars set on host  
- [ ] Mongo IP allowlist / network access OK  
- [ ] S3 bucket private  
- [ ] CLIENT_URL CORS match  
- [ ] Seed or admin bootstrap complete  
- [ ] Smoke: login → job → apply → AI → stage → email  

---

## 8. Rollback Strategy (MVP)

1. Keep previous release artifact  
2. Re-deploy previous API/frontend  
3. DB migrations should be backward compatible in MVP (prefer additive fields)  
4. Communicate status to pilot users  

---

## 9. Known Limitations (share with pilot)

- AI is assistive, not a hiring decision engine  
- Best results with text-based PDFs  
- Applicant does not see AI score in MVP  
- Email delivery depends on SMTP provider reputation  
