import { ApiError } from '../utils/ApiError.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export function errorHandler(err, req, res, _next) {
  let error = err;

  // Convert generic/database errors into structured ApiError instances
  if (!(error instanceof ApiError)) {
    // Mongoose bad ObjectId CastError
    if (err.name === 'CastError') {
      error = ApiError.badRequest(`Invalid resource identifier format for '${err.path}'`, [], 'INVALID_ID');
    }
    // Mongoose duplicate key error (E11000)
    else if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'field';
      error = ApiError.conflict(`An entity with that ${field} already exists`, 'DUPLICATE_KEY');
    }
    // Mongoose schema validation error
    else if (err.name === 'ValidationError') {
      const details = Object.values(err.errors || {}).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      error = ApiError.badRequest('Database validation failed', details, 'VALIDATION_ERROR');
    }
    // Fallback: Unexpected internal server error
    else {
      logger.error({
        msg: 'Unexpected server exception occurred',
        err: err.message,
        stack: err.stack,
        requestId: req.id,
      });
      error = ApiError.internal('An unexpected internal server error occurred');
    }
  }

  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    error: {
      code: error.errorCode || 'INTERNAL_ERROR',
      message: error.message || 'An error occurred',
      details: error.details && error.details.length > 0 ? error.details : undefined,
    },
    requestId: req.id || res.getHeader('X-Request-ID') || undefined,
  };

  // Include stack traces in non-production environments for debugging
  if (env.NODE_ENV !== 'production' && !error.isOperational) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
