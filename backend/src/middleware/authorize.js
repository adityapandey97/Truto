import { ApiError } from '../utils/ApiError.js';

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
}

export function assertOwnership(resource, userId, field = 'ownerId') {
  if (!resource) {
    throw ApiError.notFound('Resource not found');
  }
  const resourceOwner = resource[field]?.toString ? resource[field].toString() : resource[field];
  const user = userId?.toString ? userId.toString() : userId;

  if (resourceOwner !== user) {
    throw ApiError.forbidden('You do not have permission to access or modify this resource');
  }
}
