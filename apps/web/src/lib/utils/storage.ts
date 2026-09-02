/**
 * Safe localStorage helpers for domain stores.
 * Corrupt JSON is ignored and replaced with the provided fallback.
 */
export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[storage] Failed to read ${key}; using default.`, error);
    return fallback;
  }
}

export function saveJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[storage] Failed to write ${key}.`, error);
    return false;
  }
}
