const mongoose = require('mongoose');
const { Application, Job, User } = require('../models');

async function getHiringAnalytics(companyId) {
  const companyObjectId =
    typeof companyId === 'string' ? new mongoose.Types.ObjectId(companyId) : companyId;

  const [openJobs, draftJobs, archivedJobs, funnelFixed, aging, topJobs] = await Promise.all([
    Job.countDocuments({ companyId, status: 'open' }),
    Job.countDocuments({ companyId, status: 'draft' }),
    Job.countDocuments({ companyId, status: 'archived' }),
    Application.aggregate([
      { $match: { companyId: companyObjectId } },
      { $group: { _id: '$stage', count: { $sum: 1 } } },
    ]),
    Application.countDocuments({
      companyId,
      stage: { $in: ['applied', 'interview'] },
      updatedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }),
    Job.find({ companyId, status: 'open' })
      .select('title openings priority department createdAt')
      .sort({ createdAt: -1 })
      .limit(40)
      .lean(),
  ]);

  const byStage = { applied: 0, interview: 0, offered: 0, rejected: 0 };
  for (const row of funnelFixed) {
    if (byStage[row._id] !== undefined) byStage[row._id] = row.count;
  }

  const totalApplications = Object.values(byStage).reduce((a, b) => a + b, 0);
  const openingsNeeded = topJobs.reduce((sum, job) => sum + (job.openings || 1), 0);
  const offered = byStage.offered;
  const fillProgress = openingsNeeded ? Math.min(100, Math.round((offered / openingsNeeded) * 100)) : 0;

  const jobIds = topJobs.map((j) => j._id);
  const perJobCounts = jobIds.length
    ? await Application.aggregate([
        { $match: { jobId: { $in: jobIds } } },
        { $group: { _id: { jobId: '$jobId', stage: '$stage' }, count: { $sum: 1 } } },
      ])
    : [];

  const countsByJob = {};
  for (const row of perJobCounts) {
    const id = String(row._id.jobId);
    if (!countsByJob[id]) countsByJob[id] = { total: 0, interview: 0, offered: 0 };
    countsByJob[id].total += row.count;
    if (row._id.stage === 'interview') countsByJob[id].interview += row.count;
    if (row._id.stage === 'offered') countsByJob[id].offered += row.count;
  }

  const priorityRank = { critical: 0, high: 1, medium: 2, low: 3 };
  const vacancies = topJobs
    .map((job) => ({
      id: String(job._id),
      title: job.title,
      department: job.department || '',
      openings: job.openings || 1,
      priority: job.priority || 'medium',
      ageDays: Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (24 * 60 * 60 * 1000)),
      applications: countsByJob[String(job._id)]?.total || 0,
      interviews: countsByJob[String(job._id)]?.interview || 0,
      offered: countsByJob[String(job._id)]?.offered || 0,
    }))
    .sort(
      (a, b) =>
        (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9) || b.applications - a.applications
    );

  return {
    summary: {
      openVacancies: openJobs,
      draftJobs,
      archivedJobs,
      totalApplications,
      agingApplications: aging,
      openingsToFill: openingsNeeded,
      fillProgressPercent: fillProgress,
      funnel: byStage,
    },
    vacancies,
  };
}

async function searchCandidates(companyId, query) {
  const companyObjectId =
    typeof companyId === 'string' ? new mongoose.Types.ObjectId(companyId) : companyId;
  const filter = { companyId: companyObjectId };
  if (query.stage) filter.stage = query.stage;
  if (query.minScore !== undefined && query.minScore !== '') {
    filter['aiAnalysis.matchScore'] = { $gte: Number(query.minScore) || 0 };
  }
  if (query.tag) {
    filter.tags = String(query.tag).trim().toLowerCase();
  }

  const q = String(query.q || '').trim();
  if (q) {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(escaped, 'i');
    const matchingUsers = await User.find({
      $or: [{ name: rx }, { email: rx }, { skills: rx }, { headline: rx }],
    })
      .select('_id')
      .lean();
    const applicantIds = matchingUsers.map((user) => user._id);
    filter.$or = [{ applicantId: { $in: applicantIds } }, { 'aiAnalysis.summary': rx }];
  }

  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate('applicantId', 'name email phone headline location skills experienceYears')
      .populate('jobId', 'title department')
      .sort({ 'aiAnalysis.matchScore': -1, updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Application.countDocuments(filter),
  ]);

  return {
    applications: applications.map((app) => ({
      id: String(app._id),
      stage: app.stage,
      aiStatus: app.aiStatus,
      matchScore: app.aiAnalysis?.matchScore ?? null,
      tags: app.tags || [],
      job: app.jobId
        ? { id: String(app.jobId._id), title: app.jobId.title, department: app.jobId.department }
        : null,
      applicant: app.applicantId
        ? {
            id: String(app.applicantId._id),
            name: app.applicantId.name,
            email: app.applicantId.email,
            headline: app.applicantId.headline,
            location: app.applicantId.location,
            skills: app.applicantId.skills || [],
          }
        : null,
      updatedAt: app.updatedAt,
    })),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

module.exports = {
  getHiringAnalytics,
  searchCandidates,
};
