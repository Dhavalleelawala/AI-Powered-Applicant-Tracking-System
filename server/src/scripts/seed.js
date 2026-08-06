const bcrypt = require('bcryptjs');
const { connectDb } = require('../config/db');
const { Company, User, Job, Application } = require('../models');

const DEMO_PASSWORD = 'Password123';
const SEED_TAG = '[seed]';

const DEMO = {
  company: {
    name: 'Demo Corp',
    website: 'https://demo.example.com',
  },
  recruiter: {
    name: 'Asha Mehta',
    email: 'recruiter@demo.com',
    role: 'recruiter',
  },
  applicant: {
    name: 'Leela Applicant',
    email: 'applicant@demo.com',
    role: 'applicant',
    headline: 'Full-stack engineer',
    location: 'Remote',
    experienceYears: 3,
    skills: ['react', 'nodejs', 'mongodb'],
  },
  jobs: [
    {
      title: 'Full Stack Developer',
      department: 'Engineering',
      openings: 3,
      priority: 'high',
      description: `${SEED_TAG} Build and ship React + Node features for our hiring platform.
You will own API design, MongoDB data modeling, and recruiter-facing UI.
Strong JavaScript fundamentals and production experience with REST APIs required.
Nice to have: AWS S3, JWT auth, and AI/LLM integration awareness.`,
      requiredSkills: ['react', 'nodejs', 'mongodb', 'express'],
      experienceYearsMin: 2,
      experienceYearsMax: 5,
      location: 'Remote',
      employmentType: 'full-time',
      status: 'open',
      salaryRange: { min: 800000, max: 1400000, currency: 'INR' },
    },
    {
      title: 'Frontend Engineer (React)',
      department: 'Engineering',
      openings: 2,
      priority: 'medium',
      description: `${SEED_TAG} Design polished hiring experiences with React, React Query, and MUI.
Focus on dashboards, Kanban pipelines, forms, and accessible UX.
You collaborate closely with backend on job board and ranking screens.
Nice to have: Vite, role-based route guards, and performance-minded list UIs.`,
      requiredSkills: ['react', 'mui', 'typescript', 'react-query'],
      experienceYearsMin: 1,
      experienceYearsMax: 4,
      location: 'Bengaluru / Hybrid',
      employmentType: 'full-time',
      status: 'open',
      salaryRange: { min: 700000, max: 1200000, currency: 'INR' },
    },
    {
      title: 'Talent Acquisition Specialist',
      department: 'People / HR',
      openings: 1,
      priority: 'critical',
      description: `${SEED_TAG} Own end-to-end hiring for a 400+ person company with 10–40 open vacancies.
Run Rolefit pipelines, partner with hiring managers, and keep time-to-shortlist low.
Experience with ATS tools, stakeholder management, and structured interviews required.`,
      requiredSkills: ['recruiting', 'ats', 'sourcing', 'stakeholder-management'],
      experienceYearsMin: 2,
      experienceYearsMax: 6,
      location: 'Hybrid',
      employmentType: 'full-time',
      status: 'open',
      salaryRange: { min: 600000, max: 1100000, currency: 'INR' },
    },
  ],
};

async function clearPreviousSeed(companyId) {
  if (!companyId) return;

  const jobs = await Job.find({ companyId }).select('_id');
  const jobIds = jobs.map((j) => j._id);

  if (jobIds.length) {
    await Application.deleteMany({ jobId: { $in: jobIds } });
    await Job.deleteMany({ _id: { $in: jobIds } });
  }

  await User.deleteMany({
    email: { $in: [DEMO.recruiter.email, DEMO.applicant.email] },
  });
  await Company.deleteOne({ _id: companyId });
}

/** Insert reproducible demo company, users, jobs, and one application. */
async function seedDemoData({ reset = true } = {}) {
  if (reset) {
    const existingCompany = await Company.findOne({ name: DEMO.company.name });
    await clearPreviousSeed(existingCompany?._id);
    await User.deleteMany({
      email: { $in: [DEMO.recruiter.email, DEMO.applicant.email] },
    });
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const company = await Company.create(DEMO.company);

  const recruiter = await User.create({
    ...DEMO.recruiter,
    passwordHash,
    companyId: company._id,
  });

  const applicant = await User.create({
    ...DEMO.applicant,
    passwordHash,
  });

  const jobs = await Job.insertMany(
    DEMO.jobs.map((job) => ({
      ...job,
      recruiterId: recruiter._id,
      companyId: company._id,
    }))
  );

  const sampleJob = jobs[0];
  await Application.create({
    jobId: sampleJob._id,
    applicantId: applicant._id,
    companyId: company._id,
    coverLetter: `${SEED_TAG} Excited to apply — sample seed application for local UI testing.`,
    stage: 'applied',
    aiStatus: 'pending',
    stageHistory: [
      {
        to: 'applied',
        changedBy: applicant._id,
        note: 'Seeded application',
      },
    ],
    resume: {
      originalFileName: 'leela-resume-seed.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024,
      s3Key: `seed/${company._id}/${sampleJob._id}/${applicant._id}/leela-resume-seed.pdf`,
      s3Bucket: 'ats-resumes-dev',
      extractedText: `${SEED_TAG} Sample resume text for Full Stack Developer. Skills: React, Node.js, MongoDB.`,
      uploadedAt: new Date(),
    },
  });

  await Promise.all([
    Company.syncIndexes(),
    User.syncIndexes(),
    Job.syncIndexes(),
    Application.syncIndexes(),
  ]);

  return {
    company,
    recruiter,
    applicant,
    jobs,
    password: DEMO_PASSWORD,
  };
}

/** Seed only when the database has no users (safe for first cloud boot). */
async function seedIfEmpty() {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log('SEED_ON_EMPTY: database already has users — skipping seed.');
    return false;
  }
  console.log('SEED_ON_EMPTY: empty database detected — loading demo data…');
  const result = await seedDemoData({ reset: false });
  console.log(
    `SEED_ON_EMPTY: ready. Demo login ${DEMO.recruiter.email} / ${result.password}`
  );
  return true;
}

async function seedCli() {
  await connectDb();
  const result = await seedDemoData({ reset: true });
  console.log('Seed complete (reproducible demo data).');
  console.log('');
  console.log('Company:   Demo Corp');
  console.log(`Recruiter: ${DEMO.recruiter.email} / ${result.password}`);
  console.log(`Applicant: ${DEMO.applicant.email} / ${result.password}`);
  console.log(`Jobs:      ${result.jobs.length} open (with departments / openings / priority)`);
  console.log('Apps:      1 sample application (placeholder S3 key)');
  console.log('');
  process.exit(0);
}

if (require.main === module) {
  seedCli().catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
  });
}

module.exports = { seedDemoData, seedIfEmpty, DEMO, DEMO_PASSWORD };
