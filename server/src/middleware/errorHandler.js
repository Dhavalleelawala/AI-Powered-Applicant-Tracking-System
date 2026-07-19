const AppError = require('../utils/AppError');

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
  if (!(err instanceof AppError) && err.name !== 'ValidationError') {
    console.error(err);
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
      },
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE',
        message: `${field} already exists`,
      },
    });
  }

  const status = err.status || err.statusCode || 500;
  const code = err.code || (status === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR');

  return res.status(status).json({
    success: false,
    error: {
      code,
      message: status === 500 ? 'Internal server error' : err.message || 'Request error',
    },
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
