/**
 * Rolefit API smoke checks (local MVP).
 * Usage: npm run smoke --prefix server
 */
require('dotenv').config();

const BASE = process.env.SMOKE_BASE_URL || `http://127.0.0.1:${process.env.PORT || 5000}/api`;

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  const stamp = Date.now();
  console.log(`Rolefit smoke against ${BASE}`);

  const health = await request('/health');
  assert(health.status === 200 && health.body?.data?.status === 'ok', 'health failed');

  const jobs = await request('/jobs?limit=5');
  assert(jobs.status === 200 && Array.isArray(jobs.body.data), 'public jobs failed');

  const applicantEmail = `smoke.app.${stamp}@example.com`;
  const recruiterEmail = `smoke.rec.${stamp}@example.com`;

  const applicant = await request('/auth/register/applicant', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Smoke Applicant',
      email: applicantEmail,
      password: 'Secret123',
    }),
  });
  assert(applicant.status === 201 && applicant.body.data?.token, 'applicant register failed');

  const duplicate = await request('/auth/register/applicant', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Dup',
      email: applicantEmail,
      password: 'Secret123',
    }),
  });
  assert(duplicate.status === 409, 'duplicate email should be 409');

  const recruiter = await request('/auth/register/recruiter', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Smoke Recruiter',
      email: recruiterEmail,
      password: 'Secret123',
      companyName: `Smoke Co ${stamp}`,
    }),
  });
  assert(recruiter.status === 201 && recruiter.body.data?.token, 'recruiter register failed');

  const recToken = recruiter.body.data.token;
  const appToken = applicant.body.data.token;

  const forbidden = await request('/jobs', {
    method: 'POST',
    headers: { Authorization: `Bearer ${appToken}` },
    body: JSON.stringify({
      title: 'Should Fail',
      description: 'Applicant must not create jobs. '.repeat(3),
      status: 'open',
    }),
  });
  assert(forbidden.status === 403, 'applicant create job should be 403');

  const created = await request('/jobs', {
    method: 'POST',
    headers: { Authorization: `Bearer ${recToken}` },
    body: JSON.stringify({
      title: 'Smoke Full Stack Role',
      description:
        'Build and ship Rolefit APIs with Node, Express, and MongoDB. Need production-minded hiring platform experience and secure resume handling.',
      requiredSkills: ['nodejs', 'mongodb', 'express'],
      location: 'Remote',
      employmentType: 'full-time',
      department: 'Engineering',
      openings: 2,
      priority: 'high',
      status: 'open',
    }),
  });
  assert(created.status === 201 && (created.body.data?._id || created.body.data?.id), 'create job failed');
  const jobId = created.body.data.id || created.body.data._id;

  const me = await request('/auth/me', {
    headers: { Authorization: `Bearer ${recToken}` },
  });
  assert(me.status === 200 && me.body.data?.user?.role === 'recruiter', '/me failed');

  const analytics = await request('/recruiter/analytics', {
    headers: { Authorization: `Bearer ${recToken}` },
  });
  assert(
    analytics.status === 200 && typeof analytics.body.data?.summary?.openVacancies === 'number',
    'analytics failed'
  );

  const duplicateJob = await request(`/jobs/${jobId}/duplicate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${recToken}` },
  });
  assert(duplicateJob.status === 201 && duplicateJob.body.data?.status === 'draft', 'duplicate job failed');

  const saveJob = await request(`/auth/saved-jobs/${jobId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${appToken}` },
  });
  assert(saveJob.status === 200 && saveJob.body.data?.saved === true, 'save job failed');

  const savedList = await request('/auth/saved-jobs', {
    headers: { Authorization: `Bearer ${appToken}` },
  });
  assert(savedList.status === 200 && Array.isArray(savedList.body.data), 'list saved jobs failed');

  const profile = await request('/auth/me', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${appToken}` },
    body: JSON.stringify({
      headline: 'Smoke tester',
      skills: ['nodejs', 'testing'],
      experienceYears: 3,
    }),
  });
  assert(profile.status === 200 && profile.body.data?.user?.headline === 'Smoke tester', 'profile update failed');

  const filtered = await request('/jobs?q=Smoke&employmentType=full-time');
  assert(filtered.status === 200 && Array.isArray(filtered.body.data), 'job filters failed');

  // Minimal PDF with extractable text for heuristic AI scoring.
  const pdfText = Buffer.from(
    `%PDF-1.4
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj
4 0 obj<< /Length 88 >>stream
BT /F1 12 Tf 20 100 Td (Senior engineer with 5 years nodejs mongodb express) Tj ET
endstream
endobj
5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000405 00000 n 
trailer<< /Size 6 /Root 1 0 R >>
startxref
482
%%EOF`,
    'utf8'
  );

  const invalidMime = await fetch(`${BASE}/jobs/${jobId}/applications`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${appToken}` },
    body: (() => {
      const badForm = new FormData();
      badForm.append('resume', new Blob(['not-a-resume'], { type: 'text/plain' }), 'notes.txt');
      return badForm;
    })(),
  });
  assert(invalidMime.status === 400, 'invalid mime should be 400');

  const applyResponse = await fetch(`${BASE}/jobs/${jobId}/applications`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${appToken}` },
    body: (() => {
      const applyForm = new FormData();
      applyForm.append('coverLetter', 'Excited to join Rolefit smoke test.');
      applyForm.append('resume', new Blob([pdfText], { type: 'application/pdf' }), 'smoke-resume.pdf');
      return applyForm;
    })(),
  });
  const applyBody = await applyResponse.json().catch(() => ({}));
  assert(applyResponse.status === 201 && applyBody.data?.id, `apply failed: ${applyBody.error?.message || applyResponse.status}`);
  const applicationId = applyBody.data.id;

  const duplicateApply = await fetch(`${BASE}/jobs/${jobId}/applications`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${appToken}` },
    body: (() => {
      const dupForm = new FormData();
      dupForm.append('coverLetter', 'Duplicate should fail.');
      dupForm.append('resume', new Blob([pdfText], { type: 'application/pdf' }), 'smoke-resume.pdf');
      return dupForm;
    })(),
  });
  assert(duplicateApply.status === 409, 'duplicate apply should be 409');

  const mine = await request('/applicant/applications', {
    headers: { Authorization: `Bearer ${appToken}` },
  });
  assert(mine.status === 200 && Array.isArray(mine.body.data) && mine.body.data.length >= 1, 'applicant applications failed');

  const moved = await request(`/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${recToken}` },
    body: JSON.stringify({ stage: 'interview', note: 'Smoke interview' }),
  });
  assert(moved.status === 200 && moved.body.data?.stage === 'interview', 'stage move failed');

  const noted = await request(`/applications/${applicationId}/notes`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${recToken}` },
    body: JSON.stringify({ text: 'Strong backend fit' }),
  });
  assert(noted.status === 200 && (noted.body.data?.recruiterNotes || []).length >= 1, 'add note failed');

  const ranked = await request(`/jobs/${jobId}/applications?minScore=0&sort=score_desc`, {
    headers: { Authorization: `Bearer ${recToken}` },
  });
  assert(ranked.status === 200 && Array.isArray(ranked.body.data), 'ranking list failed');

  const noAuth = await request(`/applications/${applicationId}`);
  assert(noAuth.status === 401, 'missing token should be 401');

  const otherRecruiter = await request('/auth/register/recruiter', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Other Recruiter',
      email: `smoke.other.${stamp}@example.com`,
      password: 'Secret123',
      companyName: `Other Co ${stamp}`,
    }),
  });
  assert(otherRecruiter.status === 201 && otherRecruiter.body.data?.token, 'other recruiter register failed');
  const otherToken = otherRecruiter.body.data.token;

  const crossTenantList = await request(`/jobs/${jobId}/applications`, {
    headers: { Authorization: `Bearer ${otherToken}` },
  });
  assert(crossTenantList.status === 404, 'cross-tenant job applications should be 404');

  const crossTenantMove = await request(`/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${otherToken}` },
    body: JSON.stringify({ stage: 'offered' }),
  });
  assert(crossTenantMove.status === 404, 'cross-tenant stage update should be 404');

  const crossTenantResume = await request(`/applications/${applicationId}/resume-url`, {
    headers: { Authorization: `Bearer ${otherToken}` },
  });
  assert(crossTenantResume.status === 404, 'cross-tenant resume url should be 404');

  const archived = await request(`/jobs/${jobId}/archive`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${recToken}` },
  });
  assert(archived.status === 200 && archived.body.data?.status === 'archived', 'archive failed');

  const otherApplicant = await request('/auth/register/applicant', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Late Applicant',
      email: `smoke.late.${stamp}@example.com`,
      password: 'Secret123',
    }),
  });
  assert(otherApplicant.status === 201 && otherApplicant.body.data?.token, `late applicant register failed: ${otherApplicant.status} ${otherApplicant.body?.error?.message || ''}`);

  const applyArchived = await fetch(`${BASE}/jobs/${jobId}/applications`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${otherApplicant.body.data.token}` },
    body: (() => {
      const form = new FormData();
      form.append('resume', new Blob([pdfText], { type: 'application/pdf' }), 'late.pdf');
      return form;
    })(),
  });
  assert(applyArchived.status === 404, 'apply to archived job should be 404');

  console.log('Smoke checks passed.');
}

run().catch((err) => {
  console.error('Smoke failed:', err.message);
  process.exit(1);
});
