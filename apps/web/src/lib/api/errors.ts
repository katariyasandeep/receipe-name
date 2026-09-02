export type ApiErrorCode =
  | 'network'
  | 'http'
  | 'parse'
  | 'not_found'
  | 'invalid_id'
  | 'unknown';

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;
  readonly details?: unknown;

  constructor(
    message: string,
    code: ApiErrorCode = 'unknown',
    options?: { status?: number; details?: unknown; cause?: unknown }
  ) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = 'ApiError';
    this.code = code;
    this.status = options?.status;
    this.details = options?.details;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}
