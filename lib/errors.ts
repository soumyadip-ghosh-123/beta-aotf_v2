/**
 * Custom error classes for consistent error handling across the API.
 * Each class maps to a specific HTTP status code and can carry a
 * user-safe message separate from internal debug details.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 400 — malformed request or failed validation */
export class ValidationError extends AppError {
  public readonly fieldErrors: Record<string, string[]>;

  constructor(
    message = "Validation failed",
    fieldErrors: Record<string, string[]> = {},
  ) {
    super(message, 400);
    this.fieldErrors = fieldErrors;
  }
}

/** 404 — resource not found */
export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
  }
}

/** 409 — conflict (duplicate entries, concurrent writes, etc.) */
export class ConflictError extends AppError {
  constructor(message = "A conflicting resource already exists") {
    super(message, 409);
  }
}

/** 500 — unexpected internal errors */
export class InternalError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500, false);
  }
}
