const applicationService = require('../services/applicationService');

async function applyToJob(req, res, next) {
  try {
    const data = await applicationService.applyToJob(req.params.jobId, req.body, req.file, req.user);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function listApplicantApplications(req, res, next) {
  try {
    const { applications, meta } = await applicationService.listApplicantApplications(req.user.id, req.query);
    return res.json({ success: true, data: applications, meta });
  } catch (err) {
    return next(err);
  }
}

async function listJobApplications(req, res, next) {
  try {
    const { applications, meta } = await applicationService.listJobApplications(
      req.params.jobId,
      req.query,
      req.user
    );
    return res.json({ success: true, data: applications, meta });
  } catch (err) {
    return next(err);
  }
}

async function getApplication(req, res, next) {
  try {
    const data = await applicationService.getApplication(req.params.applicationId, req.user);
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function updateStage(req, res, next) {
  try {
    const data = await applicationService.updateStage(req.params.applicationId, req.body, req.user);
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getResumeUrl(req, res, next) {
  try {
    const data = await applicationService.getResumeUrl(req.params.applicationId, req.user);
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function reanalyzeApplication(req, res, next) {
  try {
    const data = await applicationService.reanalyzeApplication(req.params.applicationId, req.user);
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function addNote(req, res, next) {
  try {
    const data = await applicationService.addRecruiterNote(req.params.applicationId, req.body.text, req.user);
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function bulkUpdateStage(req, res, next) {
  try {
    const data = await applicationService.bulkUpdateStage(req.params.jobId, req.body, req.user);
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function updateTags(req, res, next) {
  try {
    const data = await applicationService.updateTags(req.params.applicationId, req.body.tags, req.user);
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  applyToJob,
  listApplicantApplications,
  listJobApplications,
  getApplication,
  updateStage,
  addNote,
  bulkUpdateStage,
  updateTags,
  getResumeUrl,
  reanalyzeApplication,
};
