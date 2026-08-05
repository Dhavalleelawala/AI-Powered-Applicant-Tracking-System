const { Job, Application } = require('../models');
const AppError = require('../utils/AppError');

function pagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

function toJobPayload(body) {
  const fields = [
    'title',
    'description',
    'department',
    'openings',
    'priority',
    'closesAt',
    'requiredSkills',
    'experienceYearsMin',
    'experienceYearsMax',
    'location',
    'employmentType',
    'status',
    'salaryRange',
  ];
  return Object.fromEntries(fields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));
}

function withCompanyName(job) {
  if (!job) return job;
  const company = job.companyId;
  return {
    ...job,
    id: String(job._id),
    companyName: company?.name || job.companyName || '',
    company: company?._id
      ? { id: String(company._id), name: company.name, website: company.website }
      : undefined,
  };
}

async function listOpenJobs(query) {
  const filter = { status: 'open' };
  if (query.q) {
    const search = String(query.q).trim();
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { requiredSkills: { $regex: search, $options: 'i' } },
    ];
  }
  if (query.location) {
    filter.location = { $regex: String(query.location).trim(), $options: 'i' };
  }
  if (query.employmentType) {
    filter.employmentType = query.employmentType;
  }
  if (query.department) {
    filter.department = { $regex: String(query.department).trim(), $options: 'i' };
  }
  if (query.priority) {
    filter.priority = query.priority;
  }

  const { page, limit, skip } = pagination(query);
  const [jobs, total] = await Promise.all([
    Job.find(filter).populate('companyId', 'name website').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Job.countDocuments(filter),
  ]);
  return {
    jobs: jobs.map(withCompanyName),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

async function getJob(jobId, user) {
  const job = await Job.findById(jobId).populate('companyId', 'name website').lean();
  if (!job) {
    throw new AppError('Job not found', { status: 404, code: 'NOT_FOUND' });
  }
  const canViewPrivate =
    user?.role === 'recruiter' && String(job.companyId?._id || job.companyId) === user.companyId;
  if (job.status !== 'open' && !canViewPrivate) {
    throw new AppError('Job not found', { status: 404, code: 'NOT_FOUND' });
  }
  return withCompanyName(job);
}

async function listRecruiterJobs(companyId, query) {
  const { page, limit, skip } = pagination(query);
  const filter = { companyId };
  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Job.countDocuments(filter),
  ]);

  const jobIds = jobs.map((job) => job._id);
  const countRows = jobIds.length
    ? await Application.aggregate([
        { $match: { jobId: { $in: jobIds } } },
        {
          $group: {
            _id: { jobId: '$jobId', stage: '$stage' },
            count: { $sum: 1 },
          },
        },
      ])
    : [];

  const byJob = {};
  for (const row of countRows) {
    const id = String(row._id.jobId);
    if (!byJob[id]) byJob[id] = { applicationCount: 0, interviewCount: 0 };
    byJob[id].applicationCount += row.count;
    if (row._id.stage === 'interview') byJob[id].interviewCount += row.count;
  }

  return {
    jobs: jobs.map((job) => ({
      ...withCompanyName(job),
      applicationCount: byJob[String(job._id)]?.applicationCount || 0,
      interviewCount: byJob[String(job._id)]?.interviewCount || 0,
    })),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

async function createJob(body, user) {
  if (!String(body.title || '').trim() || String(body.title).trim().length < 3) {
    throw new AppError('title must be at least 3 characters', {
      status: 400,
      code: 'VALIDATION_ERROR',
    });
  }
  if (!String(body.description || '').trim() || String(body.description).trim().length < 50) {
    throw new AppError('description must be at least 50 characters for quality AI matching', {
      status: 400,
      code: 'VALIDATION_ERROR',
    });
  }
  const job = await Job.create({
    ...toJobPayload(body),
    recruiterId: user.id,
    companyId: user.companyId,
  });
  return withCompanyName(job.toObject());
}

async function updateJob(jobId, body, user) {
  const job = await Job.findOne({ _id: jobId, companyId: user.companyId });
  if (!job) {
    throw new AppError('Job not found', { status: 404, code: 'NOT_FOUND' });
  }
  Object.assign(job, toJobPayload(body));
  await job.save();
  return withCompanyName(job.toObject());
}

async function archiveJob(jobId, user) {
  const job = await Job.findOneAndUpdate(
    { _id: jobId, companyId: user.companyId },
    { status: 'archived' },
    { new: true, runValidators: true }
  );
  if (!job) {
    throw new AppError('Job not found', { status: 404, code: 'NOT_FOUND' });
  }
  return withCompanyName(job.toObject());
}

async function duplicateJob(jobId, user) {
  const job = await Job.findOne({ _id: jobId, companyId: user.companyId }).lean();
  if (!job) {
    throw new AppError('Job not found', { status: 404, code: 'NOT_FOUND' });
  }
  const copy = await Job.create({
    title: `${job.title} (Copy)`,
    description: job.description,
    department: job.department,
    openings: job.openings || 1,
    priority: job.priority || 'medium',
    closesAt: null,
    requiredSkills: job.requiredSkills || [],
    experienceYearsMin: job.experienceYearsMin,
    experienceYearsMax: job.experienceYearsMax,
    location: job.location,
    employmentType: job.employmentType,
    status: 'draft',
    salaryRange: job.salaryRange,
    recruiterId: user.id,
    companyId: user.companyId,
  });
  return withCompanyName(copy.toObject());
}

module.exports = {
  listOpenJobs,
  getJob,
  listRecruiterJobs,
  createJob,
  updateJob,
  archiveJob,
  duplicateJob,
};
