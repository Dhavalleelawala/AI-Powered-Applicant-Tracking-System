const { getDbStatus } = require('../config/db');

function getHealth(_req, res) {
  const dbStatus = getDbStatus();
  const ok = dbStatus === 'connected';

  res.status(ok ? 200 : 503).json({
    success: ok,
    data: {
      status: ok ? 'ok' : 'degraded',
      uptime: Math.floor(process.uptime()),
      db: dbStatus,
    },
  });
}

module.exports = {
  getHealth,
};
