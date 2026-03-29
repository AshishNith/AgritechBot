export class HttpError extends Error {
  statusCode: number;
  retryAfterSeconds?: number;

  constructor(message: string, statusCode: number, opts?: { retryAfterSeconds?: number }) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.retryAfterSeconds = opts?.retryAfterSeconds;
  }
}

