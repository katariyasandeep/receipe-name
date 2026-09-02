import { describe, expect, it } from 'vitest';
import { ApiError } from '$lib/api/errors';
import { createRequestState } from '$lib/api/request-state';
import { fail, ok } from '$lib/api/result';

describe('createRequestState', () => {
  it('tracks loading → success with empty flag', async () => {
    const { state, run } = createRequestState<string[]>([]);

    const pending = run(Promise.resolve(ok([], true)));
    expect(state.loading).toBe(true);
    expect(state.status).toBe('loading');

    const result = await pending;
    expect(result.ok).toBe(true);
    expect(state.status).toBe('success');
    expect(state.empty).toBe(true);
    expect(state.data).toEqual([]);
    expect(state.error).toBeNull();
  });

  it('tracks loading → error', async () => {
    const { state, run } = createRequestState<string[]>(null);
    await run(Promise.resolve(fail(new ApiError('boom', 'network'))));

    expect(state.status).toBe('error');
    expect(state.loading).toBe(false);
    expect(state.error?.message).toBe('boom');
    expect(state.error?.code).toBe('network');
  });

  it('resets to initial values', async () => {
    const { state, run, reset } = createRequestState<number[]>([1]);
    await run(Promise.resolve(ok([2, 3])));
    reset();
    expect(state.status).toBe('idle');
    expect(state.data).toEqual([1]);
    expect(state.error).toBeNull();
  });

  it('ignores stale responses when a newer run starts', async () => {
    const { state, run } = createRequestState<string[]>([]);

    let resolveSlow: (value: ReturnType<typeof ok<string[]>>) => void = () => {};
    const slow = new Promise<ReturnType<typeof ok<string[]>>>((resolve) => {
      resolveSlow = resolve;
    });

    const first = run(slow);
    const second = run(Promise.resolve(ok(['fresh'], false)));
    await second;

    expect(state.data).toEqual(['fresh']);
    expect(state.status).toBe('success');

    resolveSlow(ok(['stale'], false));
    await first;

    expect(state.data).toEqual(['fresh']);
    expect(state.status).toBe('success');
  });
});
