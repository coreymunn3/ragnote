// Base custom error for API operations
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    // Set the prototype explicitly to ensure `instanceof` works correctly
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// 400 Bad Request
export class BadRequestError extends ApiError {
  constructor(message: string = "Bad Request") {
    super(message, 400);
    this.name = "BadRequestError";
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

// 401 Unauthorized
export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

// 403 Forbidden (for authorization, not authentication)
export class ForbiddenError extends ApiError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

// 404 Not Found
export class NotFoundError extends ApiError {
  constructor(message: string = "Not Found") {
    super(message, 404);
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

// 409 Conflict
export class ConflictError extends ApiError {
  constructor(message: string = "Conflict") {
    super(message, 409);
    this.name = "ConflictError";
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

// 500 Internal Server Error (for unhandled errors)
export class InternalServerError extends ApiError {
  constructor(message: string = "Internal Server Error") {
    super(message, 500);
    this.name = "InternalServerError";
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
