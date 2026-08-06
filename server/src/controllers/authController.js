const authService = require('../services/authService');

async function registerApplicant(req, res, next) {
  try {
    const data = await authService.registerApplicant(req.body);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function registerRecruiter(req, res, next) {
  try {
    const data = await authService.registerRecruiter(req.body);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const data = await authService.login(req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const data = await authService.getMe(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const data = await authService.updateProfile(req.user.id, req.body);
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function toggleSavedJob(req, res, next) {
  try {
    const data = await authService.toggleSavedJob(req.user.id, req.params.jobId);
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function listSavedJobs(req, res, next) {
  try {
    const data = await authService.listSavedJobs(req.user.id);
    return res.json({ success: true, data: data.jobs });
  } catch (err) {
    return next(err);
  }
}

async function getResumeDraft(req, res, next) {
  try {
    const data = await authService.getResumeDraft(req.user.id);
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function updateResumeDraft(req, res, next) {
  try {
    const data = await authService.updateResumeDraft(req.user.id, req.body);
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function downloadResumePdf(req, res, next) {
  try {
    const { buffer, filename } = await authService.getResumePdf(req.user.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  registerApplicant,
  registerRecruiter,
  login,
  getMe,
  updateProfile,
  toggleSavedJob,
  listSavedJobs,
  getResumeDraft,
  updateResumeDraft,
  downloadResumePdf,
};
