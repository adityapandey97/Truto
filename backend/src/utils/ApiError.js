export class ApiError extends Error {
  constructor(statusCode, message, errorCode = 'API_ERROR', details = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', details = [], errorCode = 'BAD_REQUEST') {
    return new ApiError(400, message, errorCode, details);
  }

  static unauthorized(message = 'Authentication required', errorCode = 'UNAUTHORIZED') {
    return new ApiError(401, message, errorCode);
  }

  static forbidden(message = 'Access forbidden: Insufficient permissions', errorCode = 'FORBIDDEN') {
    return new ApiError(403, message, errorCode);
  }

  static notFound(message = 'Requested resource not found', errorCode = 'NOT_FOUND') {
    return new ApiError(404, message, errorCode);
  }

  static conflict(message = 'Resource conflict', errorCode = 'CONFLICT') {
    return new ApiError(409, message, errorCode);
  }

  static internal(message = 'Internal server error', errorCode = 'INTERNAL_ERROR') {
    const error = new ApiError(500, message, errorCode);
    error.isOperational = false;
    return error;
  }
}
