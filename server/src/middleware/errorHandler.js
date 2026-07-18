function notFoundHandler(req, res, _next) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}

function errorHandler(err, _req, res, _next) {
  console.error(err);

  const status = err.status || err.statusCode || 500;
  const code = err.code || (status === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR');

  res.status(status).json({
    success: false,
    error: {
      code,
      message: err.message || 'Internal server error',
    },
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
