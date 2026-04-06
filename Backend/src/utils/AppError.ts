/**
 * Custom application error class to handle operational errors
 * with standardized translation keys for the frontend.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly translationKey: string;

  constructor(
    translationKey: string,
    statusCode: number = 400,
    message?: string,
    isOperational: boolean = true
  ) {
    super(message || translationKey);
    this.translationKey = translationKey;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(key: string, message?: string) {
    return new AppError(key, 400, message);
  }

  static unauthorized(key: string = 'errAuth', message?: string) {
    return new AppError(key, 401, message);
  }

  static paymentRequired(key: string = 'errNoCredits', message?: string) {
    return new AppError(key, 402, message);
  }

  static forbidden(key: string = 'errForbidden', message?: string) {
    return new AppError(key, 403, message);
  }

  static notFound(key: string = 'errNotFound', message?: string) {
    return new AppError(key, 404, message);
  }

  static internal(key: string = 'errServerBusy', message?: string) {
    return new AppError(key, 500, message, false);
  }
}
