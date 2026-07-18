# Engineering Standards (Company MVP)

Rules that keep a 4-week build from turning into unmaintainable code.

---

## 1. Code Organization

- `routes` = HTTP mapping only  
- `controllers` = req/res translation  
- `services` = business rules + authz checks  
- `models` = persistence schemas  

No business-critical tenancy checks only in controllers.

---

## 2. API Standards

- Consistent response envelope  
- Proper HTTP status codes  
- Validate input at boundary (Zod/Joi/express-validator)  
- Paginate lists  
- Never return `passwordHash` or full resume text in list endpoints  

---

## 3. Git & Review

- Small commits with clear why  
- No secrets in commits  
- PR checklist: tenancy considered? error states? tests for P0 paths?  
- Protect `main`; deploy from tagged/main builds  

---

## 4. Naming

- Collections plural: `users`, `jobs`, `applications`  
- Stage enums lowercase: `applied|interview|offered|rejected`  
- AI status: `pending|processing|completed|failed`  

---

## 5. Frontend Standards

- Role-based route guards  
- React Query keys stable and documented  
- Always implement loading/empty/error  
- Disable double-submit on mutate buttons  
- Don’t invent parallel local state for server data  

---

## 6. AI Standards

- Provider behind adapter  
- JSON schema validation before save  
- Clamp score 0–100  
- Truncate oversized resume text  
- Rate-limit reanalyze  

---

## 7. Logging Standards

Include entity IDs; exclude secrets and resume bodies.

Example fields: `requestId`, `userId`, `companyId`, `jobId`, `applicationId`, `event`.

---

## 8. Dependency Policy

- Prefer maintained libraries  
- Lockfile committed  
- Audit before production release  
- Avoid adding frameworks that don’t pay for themselves in 4 weeks  
