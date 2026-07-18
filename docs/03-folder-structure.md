# 03 — Recommended Folder Structure

Use a **monorepo** so frontend and backend stay in one Git repo.

```
AI-Powered-Applicant-Tracking-System/
├── docs/                          # System design (this folder)
├── client/                        # React frontend
│   ├── public/
│   ├── src/
│   │   ├── api/                   # Axios/fetch wrappers
│   │   ├── components/            # Shared UI pieces
│   │   │   ├── common/
│   │   │   ├── jobs/
│   │   │   ├── applications/
│   │   │   └── layout/
│   │   ├── features/              # Optional feature folders
│   │   │   ├── auth/
│   │   │   ├── recruiter/
│   │   │   └── applicant/
│   │   ├── hooks/                 # React Query hooks
│   │   ├── pages/                 # Route-level pages
│   │   ├── routes/                # Protected route guards
│   │   ├── theme/                 # MUI theme
│   │   ├── context/               # Auth context (if used)
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                        # Node.js Express API
│   ├── src/
│   │   ├── config/                # env, db, s3, llm
│   │   ├── models/                # Mongoose schemas
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/              # business logic
│   │   │   ├── authService.js
│   │   │   ├── jobService.js
│   │   │   ├── applicationService.js
│   │   │   ├── storageService.js  # S3
│   │   │   ├── resumeParseService.js
│   │   │   ├── aiService.js       # LLM adapter
│   │   │   └── emailService.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── authorize.js
│   │   │   ├── upload.js          # Multer
│   │   │   ├── errorHandler.js
│   │   │   └── validate.js
│   │   ├── jobs/                  # async workers (optional)
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
│
├── ai-service/                    # Optional Python microservice
│   ├── app/
│   │   ├── main.py
│   │   ├── schemas.py
│   │   └── ranker.py
│   ├── requirements.txt
│   └── README.md
│
├── .gitignore
├── README.md                      # Root getting-started
└── package.json                   # Optional workspace scripts
```

## Client `src/pages` (Suggested)

```
pages/
  LandingPage.jsx
  LoginPage.jsx
  RegisterPage.jsx
  jobs/
    JobBoardPage.jsx
    JobDetailPage.jsx
  applicant/
    MyApplicationsPage.jsx
    ApplyJobPage.jsx
  recruiter/
    DashboardPage.jsx
    JobFormPage.jsx
    JobApplicationsPage.jsx      # Kanban + list
    CandidateRankingPage.jsx
```

## Server route modules (Suggested)

```
routes/
  auth.routes.js
  job.routes.js
  application.routes.js
  upload.routes.js          # if separated
  health.routes.js
```

## Naming Conventions

| Area | Convention |
|------|------------|
| Files | `camelCase.js` or `PascalCase.jsx` for components |
| Mongo models | Singular: `User`, `Job`, `Application` |
| Collections | Plural lowercase: `users`, `jobs`, `applications` |
| API paths | Plural nouns: `/api/jobs`, `/api/applications` |
| Env vars | `SCREAMING_SNAKE_CASE` |

## Bootstrap Order

1. Init `server` + Mongo connection + health route  
2. Init `client` + MUI theme + router shell  
3. Auth end-to-end  
4. Jobs  
5. Applications + S3  
6. AI pipeline  
7. Ranking UI + email  
