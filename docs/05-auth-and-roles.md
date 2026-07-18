# 05 — Auth & Roles

## 5.1 Auth Strategy

- **JWT Bearer tokens** for API auth
- Passwords hashed with **bcrypt** (cost factor 10–12)
- Separate registration endpoints (or one endpoint with `role`)
- Frontend stores access token in memory + **httpOnly cookie** (preferred) or localStorage (MVP acceptable with XSS care)

### Recommended MVP token payload

```json
{
  "sub": "<userId>",
  "role": "recruiter",
  "companyId": "<companyId|null>",
  "iat": 0,
  "exp": 0
}
```

- Access token TTL: 15m–1h (MVP can use 7d if no refresh)
- Optional refresh token: httpOnly cookie, longer TTL

## 5.2 Roles & Permissions Matrix

| Action | Applicant | Recruiter |
|--------|-----------|-----------|
| Register / login | Yes | Yes |
| View public job board | Yes | Yes |
| Apply to job | Yes | No |
| View own applications | Yes | No |
| Create/edit/archive jobs (own company) | No | Yes |
| View applications for own jobs | No | Yes |
| Change application stage | No | Yes |
| Download resume (signed URL) | No | Yes (own company) |
| View AI scores | No (optional later) | Yes |
| Trigger ranking filters | No | Yes |

## 5.3 Auth Endpoints (Summary)

See full contracts in [06-api-specification.md](./06-api-specification.md).

- `POST /api/auth/register/applicant`
- `POST /api/auth/register/recruiter` (creates/links company)
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout` (if cookies)

## 5.4 Middleware Design

### `authenticate`

1. Read `Authorization: Bearer <token>` (or cookie)
2. Verify JWT
3. Attach `req.user = { id, role, companyId }`
4. Else `401`

### `authorize(...roles)`

```js
// pseudo
if (!roles.includes(req.user.role)) return 403
```

### Resource ownership checks

Always verify in service layer:

- Job update: `job.companyId === req.user.companyId`
- Application stage update: application’s `companyId` matches recruiter
- Applicant history: `application.applicantId === req.user.id`

Never trust `companyId` from client body for authorization.

## 5.5 Registration Flows

### Applicant

1. name, email, password  
2. Create user `role=applicant`  
3. Return token + safe user object  

### Recruiter

1. name, email, password, companyName (website optional)  
2. Create `Company`  
3. Create user `role=recruiter` with `companyId`  
4. Return token + user + company  

## 5.6 Login Flow

1. Find user by email  
2. Compare password with bcrypt  
3. Reject inactive users  
4. Issue JWT  
5. Return `{ token, user }`  

Safe user object (never include `passwordHash`):

```json
{
  "id": "...",
  "name": "Asha",
  "email": "asha@acme.com",
  "role": "recruiter",
  "companyId": "..."
}
```

## 5.7 Frontend Route Guards

| Route prefix | Allowed |
|--------------|---------|
| `/jobs` (public board) | Anyone |
| `/login`, `/register` | Guests |
| `/applicant/*` | `role === applicant` |
| `/recruiter/*` | `role === recruiter` |

On `401`, clear token and redirect to login.

## 5.8 Password Rules (MVP)

- Min 8 characters
- Require letter + number (recommended)
- Trim email; store lowercase

## 5.9 Security Notes for Auth

- Rate-limit login (`express-rate-limit`)
- SameSite cookies if using cookie auth
- CORS allow only frontend origin
- Lock account after N failures (optional post-MVP)
