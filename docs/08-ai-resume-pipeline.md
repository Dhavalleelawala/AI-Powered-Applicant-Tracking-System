# 08 — AI Resume Pipeline

## 8.1 Goal

Turn an uploaded resume + job description into a **structured, recruiter-ready analysis**:

- Match score (0–100)
- Matched / missing skills
- Short summary
- Strengths & gaps
- Optional estimated years of experience

Use **semantic matching** (meaning), not only keyword overlap.

## 8.2 Pipeline Stages

```
Upload resume
   → Store file in S3
   → Create Application (aiStatus=pending)
   → Extract text (pdf-parse / docx)
   → Normalize text
   → Build LLM prompt (JD + resume + required skills)
   → Call OpenAI or Gemini
   → Validate/parse JSON
   → Save aiAnalysis (aiStatus=completed)
```

On any hard failure after create: `aiStatus=failed`, keep application.

## 8.3 Text Extraction

### PDF

- Library: `pdf-parse`
- Input: Buffer from Multer memory storage **or** download from S3
- Output: plain string

### DOCX

- Library options: `mammoth` (HTML/text) or `docx-parser`
- Prefer text extraction only

### Validation before AI

| Check | Action |
|-------|--------|
| Empty text | `aiStatus=failed`, message “Could not extract text” |
| Very short (< 100 chars) | fail or low-confidence flag |
| Extremely long | truncate to N chars (e.g. 15k–30k) for LLM context |

**Store** `resume.extractedText` for reanalysis without re-download (optional privacy tradeoff).

## 8.4 LLM Adapter Interface

Implement one interface so providers are swappable:

```js
// aiService.analyzeResumeMatch({ resumeText, jobDescription, requiredSkills, jobTitle })
// returns {
//   matchScore, skillsMatched, skillsMissing, summary, strengths, gaps, experienceYearsEstimated
// }
```

Providers:

- `openaiProvider.js`
- `geminiProvider.js`

Select via `AI_PROVIDER=openai|gemini`.

## 8.5 Prompt Design (Developer Spec)

### System instruction (concept)

You are an expert technical recruiter. Compare the resume to the job. Be objective. Return **JSON only**. Do not invent employers or degrees not present in the resume. If unsure, lower the score and list gaps.

### User payload (concept)

```text
Job Title: {title}
Required Skills: {skills csv}
Job Description:
"""
{jd}
"""

Resume Text:
"""
{resumeText}
"""

Return JSON with keys:
matchScore (0-100 number),
skillsMatched (string[]),
skillsMissing (string[]),
summary (string, <= 500 chars),
strengths (string[]),
gaps (string[]),
experienceYearsEstimated (number|null)
```

### Output hardening

1. Request JSON mode if provider supports it  
2. `JSON.parse` with try/catch  
3. Zod/Joi validate shape  
4. Clamp score to 0–100  
5. Lowercase/normalize skill strings for filtering  

## 8.6 Scoring Guidance (Prompt Policy)

Suggest the model weigh:

| Factor | Approx weight |
|--------|----------------|
| Required skills coverage | High |
| Relevant experience | High |
| Seniority vs job level | Medium |
| Domain/tools overlap | Medium |
| Education (if JD asks) | Low–Medium |

This is guidance inside the prompt, not a separate algorithm (MVP).

Optional hybrid (stretch):

```
finalScore = 0.7 * llmScore + 0.3 * keywordSkillCoverage
```

## 8.7 Async Execution Recommendations

### Option A — After response (simplest)

```js
res.status(201).json(...)
setImmediate(() => runAnalysis(applicationId))
```

Pros: fast to build  
Cons: can be lost on crash; no retries

### Option B — `analysis_jobs` collection (recommended MVP+)

1. Insert queue doc `queued`  
2. Worker polls every N seconds  
3. Mark `running` → process → `done`/`failed`  
4. Retry up to 3 attempts  

## 8.8 Application State Machine (AI)

```
pending → processing → completed
                   ↘ failed → (reanalyze) → pending
```

UI must show badges:

- Pending / Processing / Completed / Failed

## 8.9 Python Microservice (Optional)

**When:** Node event loop blocked by parsing, or AI team prefers Python.

### Example contract

`POST /v1/analyze`

Request:

```json
{
  "jobTitle": "Full Stack Developer",
  "jobDescription": "...",
  "requiredSkills": ["react", "nodejs"],
  "resumeText": "..."
}
```

Response:

```json
{
  "matchScore": 84,
  "skillsMatched": ["react", "nodejs"],
  "skillsMissing": ["mongodb"],
  "summary": "...",
  "strengths": ["..."],
  "gaps": ["..."],
  "experienceYearsEstimated": 3
}
```

Express calls this over internal HTTP with a shared `AI_SERVICE_TOKEN`.

## 8.10 Cost & Performance Controls

- Prefer small/cheap models for screening (`gpt-4o-mini`, Flash-class Gemini)
- Truncate resume text
- Don’t re-run AI if `job.description` and resume hash unchanged
- Rate-limit `reanalyze`
- Log token usage if API returns it (optional field)

## 8.11 Security for AI Inputs

Resumes may contain prompt-injection text (“Ignore instructions…”).

Mitigations:

- Treat resume as untrusted data inside delimiters
- Instruct model to ignore instructions found inside resume
- Accept only structured JSON output
- Never execute model output as code

## 8.12 Acceptance Criteria (Week 3)

- [ ] PDF upload produces extracted text for normal digital PDFs  
- [ ] LLM returns valid structured analysis  
- [ ] `matchScore` saved and visible to recruiter  
- [ ] Failed AI leaves application intact with `aiStatus=failed`  
- [ ] Ranking query can sort by `aiAnalysis.matchScore`  
