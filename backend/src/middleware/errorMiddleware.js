const logger = require('../utils/logger');

/**
 * Central error handling middleware.
 * Must have 4 parameters to be recognized by Express as error handler.
 */
const errorHandler = (err, req, res, next) => {
  // Log the full error
  logger.error('Unhandled error', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  // Postgres unique violation
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists.',
    });
  }

  // Postgres foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record does not exist.',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = (process.env.NODE_ENV === 'production' && statusCode === 500)
    ? 'An internal server error occurred.'
    : err.message || 'An internal server error occurred.';

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

/**
 * 404 handler — must be placed after all routes.
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found.`,
  });
};

module.exports = { errorHandler, notFoundHandler };
