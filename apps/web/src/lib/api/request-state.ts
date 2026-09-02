import type { ApiError } from './errors';
import type { ApiResult } from './result';

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export interface RequestState<T> {
  status: RequestStatus;
  data: T | null;
  error: ApiError | null;
  empty: boolean;
  get loading(): boolean;
}

/**
 * Lightweight loading/error/empty holder for page-level fetches.
 * Framework-agnostic — wire into Svelte `$state` by copying fields, or use as-is.
 *
 * Concurrent `run()` calls: only the latest invocation may commit status/data
 * (stale responses are ignored), preventing race-driven UI flicker.
 */
export function createRequestState<T>(initial: T | null = null): {
  state: RequestState<T>;
  reset: () => void;
  run: (promise: Promise<ApiResult<T>>) => Promise<ApiResult<T>>;
} {
  const state: RequestState<T> = {
    status: 'idle',
    data: initial,
    error: null,
    empty: initial == null || (Array.isArray(initial) && initial.length === 0),
    get loading() {
      return this.status === 'loading';
    }
  };

  let generation = 0;

  function reset(): void {
    generation += 1;
    state.status = 'idle';
    state.data = initial;
    state.error = null;
    state.empty = initial == null || (Array.isArray(initial) && initial.length === 0);
  }

  async function run(promise: Promise<ApiResult<T>>): Promise<ApiResult<T>> {
    const current = ++generation;
    state.status = 'loading';
    state.error = null;

    const result = await promise;
    if (current !== generation) return result;

    if (result.ok) {
      state.status = 'success';
      state.data = result.data;
      state.empty = result.empty;
      state.error = null;
    } else {
      state.status = 'error';
      state.error = result.error;
      state.empty = false;
    }

    return result;
  }

  return { state, reset, run };
}
