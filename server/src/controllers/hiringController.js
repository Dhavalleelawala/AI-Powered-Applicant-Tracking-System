const hiringService = require('../services/hiringService');

async function analytics(req, res, next) {
  try {
    const data = await hiringService.getHiringAnalytics(req.user.companyId);
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function searchCandidates(req, res, next) {
  try {
    const { applications, meta } = await hiringService.searchCandidates(req.user.companyId, req.query);
    return res.json({ success: true, data: applications, meta });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  analytics,
  searchCandidates,
};
