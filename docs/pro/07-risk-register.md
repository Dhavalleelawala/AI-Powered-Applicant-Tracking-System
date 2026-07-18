# Risk Register & Mitigations

Maintained like a real delivery program. Review every Wednesday.

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|----|------|------------|--------|------------|-------|
| R1 | Scope creep kills Week 4 deploy | High | High | Freeze P0; every add requires a cut; Product owns | Product |
| R2 | Cross-tenant data leak | Med | Critical | companyId enforcement + automated authz tests | Tech Lead |
| R3 | S3 bucket left public | Med | Critical | Block public access checklist; staging verify | Backend |
| R4 | LLM flaky / expensive | High | Med | Async + retries + cheap model + truncate text | Tech Lead |
| R5 | PDF parse fails on many resumes | Med | Med | Clear failed state; PDF-only guarantee; sample corpus tests | Backend |
| R6 | AWS/SMTP credentials delay | Med | High | Create accounts Day 1 Week 2; use Mailtrap early | Tech Lead |
| R7 | Solo-dev overload | Med | High | Follow day plan; cut DOCX/drag-drop/rejection emails first | All |
| R8 | Prompt injection via resume | Med | Med | Delimiters + JSON schema validation | Tech Lead |
| R9 | Demo environment drift | Med | Med | Seed script; staging protect from Week 2 | Tech Lead |
| R10 | Weak JWT secret / secrets in git | Low | Critical | `.gitignore`; secret scan; rotate if exposed | All |
| R11 | Underestimated frontend polish | High | Med | P0 UX states only; no redesign spirals | Frontend |
| R12 | Legal/PII concerns from pilot company | Med | High | Private storage; DPA conversation; retention note | Product |

---

## Escalation

- **P0 security/tenancy:** stop feature work; fix same day  
- **External account blockers:** escalate within 4 hours  
- **Scope conflict:** Product + Tech Lead decide same day with written cut  

---

## Contingency Scope Cuts (pre-approved)

Ordered cut list if behind:

1. Drag-and-drop Kanban → buttons  
2. DOCX support → PDF only  
3. Rejection emails → off  
4. Reanalyze endpoint → manual DB/admin later  
5. Experience filter → score + skill only  
6. Python microservice → Node-only AI  

Never cut: authz tenancy, private S3, apply durability, basic AI score path, deploy.
