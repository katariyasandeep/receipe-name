import { base } from '$app/paths';
import type { RecipeId } from '$lib/types';

/**
 * Prefix an app-absolute path for `<a href>` / `location` (includes `paths.base`).
 * Do **not** pass this to `goto()` — SvelteKit adds the base automatically.
 */
export function appPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized === '/') return base || '/';
  return `${base}${normalized}`;
}

/** App route for `goto()` / route checks — no base prefix. */
export function recipePath(id: RecipeId): string {
  return `/recipes/${encodeURIComponent(id)}`;
}

/** Pathname without `paths.base`, for active-nav and afterNavigate checks. */
export function stripBasePath(pathname: string): string {
  if (!base) return pathname;
  if (pathname === base || pathname === `${base}/`) return '/';
  return pathname.startsWith(`${base}/`) || pathname === base
    ? pathname.slice(base.length) || '/'
    : pathname;
}
