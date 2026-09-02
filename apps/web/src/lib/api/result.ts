import type { ApiError } from './errors';

/**
 * Discriminated result returned by the recipes service.
 * Empty collections use `ok: true` with `data: []` and `empty: true`.
 */
export type ApiSuccess<T> = {
  ok: true;
  data: T;
  /** True when a collection result has zero items. */
  empty: boolean;
};

export type ApiFailure = {
  ok: false;
  error: ApiError;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export function ok<T>(data: T, empty = isEmptyValue(data)): ApiSuccess<T> {
  return { ok: true, data, empty };
}

export function fail(error: ApiError): ApiFailure {
  return { ok: false, error };
}

function isEmptyValue(data: unknown): boolean {
  if (Array.isArray(data)) return data.length === 0;
  if (data === null || data === undefined) return true;
  return false;
}
