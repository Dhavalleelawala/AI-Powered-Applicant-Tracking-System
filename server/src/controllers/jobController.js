const jobService = require('../services/jobService');

async function listOpenJobs(req, res, next) {
  try {
    const { jobs, meta } = await jobService.listOpenJobs(req.query);
    return res.json({ success: true, data: jobs, meta });
  } catch (err) {
    return next(err);
  }
}

async function getJob(req, res, next) {
  try {
    const data = await jobService.getJob(req.params.jobId, req.user);
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function listRecruiterJobs(req, res, next) {
  try {
    const { jobs, meta } = await jobService.listRecruiterJobs(req.user.companyId, req.query);
    return res.json({ success: true, data: jobs, meta });
  } catch (err) {
    return next(err);
  }
}

async function createJob(req, res, next) {
  try {
    const data = await jobService.createJob(req.body, req.user);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function updateJob(req, res, next) {
  try {
    const data = await jobService.updateJob(req.params.jobId, req.body, req.user);
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function archiveJob(req, res, next) {
  try {
    const data = await jobService.archiveJob(req.params.jobId, req.user);
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function duplicateJob(req, res, next) {
  try {
    const data = await jobService.duplicateJob(req.params.jobId, req.user);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
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
