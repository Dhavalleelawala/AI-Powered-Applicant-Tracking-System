const { getDbStatus } = require('../config/db');
const config = require('../config');
const pkg = require('../../package.json');

function getHealth(_req, res) {
  const dbStatus = getDbStatus();
  const ok = dbStatus === 'connected';

  res.status(ok ? 200 : 503).json({
    success: ok,
    data: {
      status: ok ? 'ok' : 'degraded',
      uptime: Math.floor(process.uptime()),
      db: dbStatus,
      env: config.env,
      serveClient: Boolean(config.serveClient),
      version: pkg.version || '0.0.0',
    },
  });
}

module.exports = {
  getHealth,
};
