import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadJson, saveJson } from './storage';

describe('storage helpers', () => {
  let store: Map<string, string>;

  beforeEach(() => {
    store = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
      setItem: (key: string, value: string) => {
        store.set(key, String(value));
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => store.clear()
    });
  });

  it('round-trips JSON values', () => {
    expect(saveJson('rf:test', { a: 1 })).toBe(true);
    expect(loadJson('rf:test', { a: 0 })).toEqual({ a: 1 });
  });

  it('returns fallback for missing keys', () => {
    expect(loadJson('rf:missing', [])).toEqual([]);
  });

  it('returns fallback for corrupt JSON', () => {
    store.set('rf:bad', '{not-json');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(loadJson('rf:bad', { ok: true })).toEqual({ ok: true });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('returns false when setItem throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => {},
      clear: () => {}
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(saveJson('rf:fail', { x: 1 })).toBe(false);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
