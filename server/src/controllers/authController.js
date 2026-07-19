const authService = require('../services/authService');

async function registerApplicant(req, res, next) {
  try {
    const data = await authService.registerApplicant(req.body);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  registerApplicant,
};
