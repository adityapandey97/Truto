export class ApiResponse {
  static success(res, data, statusCode = 200, message = 'Success', pagination = null) {
    const response = {
      success: true,
      message,
      data,
      requestId: res.getHeader('X-Request-ID') || undefined,
    };

    if (pagination) {
      response.pagination = pagination;
    }

    return res.status(statusCode).json(response);
  }

  static created(res, data, message = 'Resource successfully created') {
    return ApiResponse.success(res, data, 201, message);
  }

  static noContent(res) {
    return res.status(204).send();
  }
}
