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

module.exports = {
  registerApplicant,
  registerRecruiter,
  login,
  getMe,
};
