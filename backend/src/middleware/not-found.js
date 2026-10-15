import { ApiError } from '../utils/ApiError.js';

export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Endpoint not found on this server: ${req.method} ${req.originalUrl}`));
}
